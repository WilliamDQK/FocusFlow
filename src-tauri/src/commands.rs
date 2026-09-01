use crate::{
    error::{AppError, AppResult},
    state::AppState,
};
use serde_json::{json, Value};
use sqlx::{Row, Sqlite, Transaction};
use std::sync::atomic::Ordering;
use tauri::State;

fn string<'a>(value: &'a Value, key: &str) -> AppResult<&'a str> {
    value
        .get(key)
        .and_then(Value::as_str)
        .ok_or_else(|| AppError::InvalidSnapshot(format!("missing {key}")))
}
fn opt_string(value: &Value, key: &str) -> Option<String> {
    value.get(key).and_then(Value::as_str).map(str::to_owned)
}
fn int(value: &Value, key: &str, default: i64) -> i64 {
    value.get(key).and_then(Value::as_i64).unwrap_or(default)
}
fn boolean(value: &Value, key: &str) -> bool {
    value.get(key).and_then(Value::as_bool).unwrap_or(false)
}
fn items<'a>(snapshot: &'a Value, key: &str) -> AppResult<&'a Vec<Value>> {
    snapshot
        .get(key)
        .and_then(Value::as_array)
        .ok_or_else(|| AppError::InvalidSnapshot(format!("missing array {key}")))
}

async fn load_payloads(pool: &sqlx::SqlitePool, table: &str, order: &str) -> AppResult<Vec<Value>> {
    let query = format!("SELECT payload_json FROM {table} ORDER BY {order}");
    let rows = sqlx::query(&query).fetch_all(pool).await?;
    rows.into_iter()
        .map(|row| {
            let raw = row.get::<String, _>(0);
            serde_json::from_str::<Value>(&raw)
                .map_err(|error| AppError::InvalidSnapshot(error.to_string()))
        })
        .collect()
}

#[tauri::command]
pub async fn load_snapshot(state: State<'_, AppState>) -> AppResult<Value> {
    let tasks = load_payloads(&state.pool, "tasks", "sort_order").await?;
    let projects = load_payloads(&state.pool, "projects", "sort_order").await?;
    let categories = load_payloads(&state.pool, "categories", "sort_order").await?;
    let memos = load_payloads(&state.pool, "memos", "is_pinned DESC, updated_at DESC").await?;
    let sessions = load_payloads(&state.pool, "focus_sessions", "start_time DESC").await?;
    let settings = sqlx::query_scalar::<_, String>(
        "SELECT value_json FROM settings WHERE namespace='app' AND key='preferences'",
    )
    .fetch_optional(&state.pool)
    .await?
    .map(|raw| serde_json::from_str(&raw).unwrap_or_else(|_| json!({})))
    .unwrap_or_else(|| json!({}));
    Ok(
        json!({ "tasks": tasks, "projects": projects, "categories": categories, "memos": memos, "sessions": sessions, "settings": settings }),
    )
}

#[tauri::command]
pub async fn backup_database(state: State<'_, AppState>) -> AppResult<String> {
    let backup_dir = state
        .database_path
        .parent()
        .ok_or_else(|| AppError::InvalidSnapshot("database path has no parent".into()))?
        .join("backups");
    std::fs::create_dir_all(&backup_dir)?;
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|error| AppError::InvalidSnapshot(error.to_string()))?
        .as_secs();
    let path = backup_dir.join(format!("focusflow-{timestamp}.db"));
    sqlx::query("VACUUM INTO ?")
        .bind(path.to_string_lossy().as_ref())
        .execute(&state.pool)
        .await?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn set_prevent_sleep(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    unsafe {
        use windows_sys::Win32::System::Power::{
            SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
        };
        let flags = ES_CONTINUOUS
            | if enabled {
                ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
            } else {
                0
            };
        if SetThreadExecutionState(flags) == 0 {
            return Err("Windows rejected the power request".into());
        }
    }
    #[cfg(not(target_os = "windows"))]
    let _ = enabled;
    Ok(())
}

#[tauri::command]
pub fn set_close_to_tray(enabled: bool, state: State<'_, AppState>) {
    state.close_to_tray.store(enabled, Ordering::Relaxed);
}

async fn clear_data(tx: &mut Transaction<'_, Sqlite>) -> AppResult<()> {
    for table in [
        "focus_session_segments",
        "focus_sessions",
        "memos",
        "tasks",
        "categories",
        "projects",
    ] {
        sqlx::query(&format!("DELETE FROM {table}"))
            .execute(&mut **tx)
            .await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_snapshot(snapshot: Value, state: State<'_, AppState>) -> AppResult<()> {
    let mut tx = state.pool.begin().await?;
    clear_data(&mut tx).await?;
    for value in items(&snapshot, "projects")? {
        sqlx::query("INSERT INTO projects(id,name,sort_order,is_archived,payload_json,created_at,updated_at,deleted_at,version) VALUES(?,?,?,?,?,?,?,?,?)")
            .bind(string(value,"id")?).bind(string(value,"name")?).bind(int(value,"sort_order",0)).bind(boolean(value,"is_archived"))
            .bind(value.to_string()).bind(string(value,"created_at")?).bind(string(value,"updated_at")?).bind(opt_string(value,"deleted_at")).bind(int(value,"version",1)).execute(&mut *tx).await?;
    }
    for value in items(&snapshot, "categories")? {
        sqlx::query("INSERT INTO categories(id,name,sort_order,payload_json,created_at,updated_at,deleted_at,version) VALUES(?,?,?,?,?,?,?,?)")
            .bind(string(value,"id")?).bind(string(value,"name")?).bind(int(value,"sort_order",0)).bind(value.to_string())
            .bind(string(value,"created_at")?).bind(string(value,"updated_at")?).bind(opt_string(value,"deleted_at")).bind(int(value,"version",1)).execute(&mut *tx).await?;
    }
    for value in items(&snapshot, "tasks")? {
        sqlx::query("INSERT INTO tasks(id,title,description,status,priority,importance_score,urgency_score,project_id,category_id,parent_task_id,estimated_focus_minutes,due_date,scheduled_date,completed_at,sort_order,is_pinned,payload_json,created_at,updated_at,deleted_at,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
            .bind(string(value,"id")?).bind(string(value,"title")?).bind(string(value,"description")?).bind(string(value,"status")?).bind(string(value,"priority")?)
            .bind(int(value,"importance_score",50)).bind(int(value,"urgency_score",50)).bind(opt_string(value,"project_id")).bind(opt_string(value,"category_id")).bind(opt_string(value,"parent_task_id"))
            .bind(int(value,"estimated_focus_minutes",0)).bind(opt_string(value,"due_date")).bind(opt_string(value,"scheduled_date")).bind(opt_string(value,"completed_at"))
            .bind(int(value,"sort_order",0)).bind(boolean(value,"is_pinned")).bind(value.to_string()).bind(string(value,"created_at")?).bind(string(value,"updated_at")?).bind(opt_string(value,"deleted_at")).bind(int(value,"version",1)).execute(&mut *tx).await?;
    }
    for value in items(&snapshot, "memos")? {
        sqlx::query("INSERT INTO memos(id,title,content,task_id,category_id,is_pinned,payload_json,created_at,updated_at,deleted_at,version) VALUES(?,?,?,?,?,?,?,?,?,?,?)")
            .bind(string(value,"id")?).bind(string(value,"title")?).bind(string(value,"content")?).bind(opt_string(value,"task_id")).bind(opt_string(value,"category_id")).bind(boolean(value,"is_pinned")).bind(value.to_string())
            .bind(string(value,"created_at")?).bind(string(value,"updated_at")?).bind(opt_string(value,"deleted_at")).bind(int(value,"version",1)).execute(&mut *tx).await?;
    }
    for value in items(&snapshot, "sessions")? {
        sqlx::query("INSERT INTO focus_sessions(id,task_id,project_id,start_time,end_time,duration_seconds,planned_duration_seconds,mode,completed,interrupted,note,payload_json,created_at,updated_at,deleted_at,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
            .bind(string(value,"id")?).bind(opt_string(value,"task_id")).bind(opt_string(value,"project_id")).bind(string(value,"start_time")?).bind(string(value,"end_time")?)
            .bind(int(value,"duration_seconds",0)).bind(int(value,"planned_duration_seconds",0)).bind(string(value,"mode")?).bind(boolean(value,"completed")).bind(boolean(value,"interrupted")).bind(string(value,"note")?).bind(value.to_string())
            .bind(string(value,"created_at")?).bind(string(value,"updated_at")?).bind(opt_string(value,"deleted_at")).bind(int(value,"version",1)).execute(&mut *tx).await?;
        if let Some(segments) = value.get("segments").and_then(Value::as_array) {
            for (index, segment) in segments.iter().enumerate() {
                sqlx::query("INSERT INTO focus_session_segments(id,session_id,start_time,end_time,duration_seconds) VALUES(?,?,?,?,?)")
                .bind(format!("{}-{index}",string(value,"id")?)).bind(string(value,"id")?).bind(string(segment,"start_time")?).bind(string(segment,"end_time")?).bind(int(segment,"duration_seconds",0)).execute(&mut *tx).await?;
            }
        }
    }
    let settings = snapshot
        .get("settings")
        .cloned()
        .unwrap_or_else(|| json!({}));
    sqlx::query("INSERT INTO settings(namespace,key,value_json,updated_at) VALUES('app','preferences',?,datetime('now')) ON CONFLICT(namespace,key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at").bind(settings.to_string()).execute(&mut *tx).await?;
    tx.commit().await?;
    Ok(())
}
