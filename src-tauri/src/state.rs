use sqlx::SqlitePool;
use std::{path::PathBuf, sync::atomic::AtomicBool};

pub struct AppState {
    pub pool: SqlitePool,
    pub database_path: PathBuf,
    pub close_to_tray: AtomicBool,
}
