import { invoke, isTauri } from '@tauri-apps/api/core'
import { emptyData, mergeSettings } from '../services/defaults'
import type { AppData, BackupFile } from '../types/domain'

export interface AppDataRepository {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
}

const STORAGE_KEY = 'focusflow.preview.data.v1'

function normalize(input: Partial<AppData>): AppData {
  const base = emptyData()
  return {
    tasks: input.tasks ?? base.tasks, projects: input.projects ?? base.projects,
    categories: input.categories ?? base.categories, memos: input.memos ?? base.memos,
    sessions: input.sessions ?? base.sessions, settings: mergeSettings(input.settings ?? {}),
  }
}

class PreviewRepository implements AppDataRepository {
  async load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    try { return normalize(JSON.parse(raw) as Partial<AppData>) } catch { return emptyData() }
  }
  async save(data: AppData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
}

class TauriRepository implements AppDataRepository {
  async load() { return normalize(await invoke<Partial<AppData>>('load_snapshot')) }
  async save(data: AppData) { await invoke('save_snapshot', { snapshot: data }) }
}

export const appDataRepository: AppDataRepository = isTauri() ? new TauriRepository() : new PreviewRepository()
export const isDesktopRuntime = isTauri()

export async function configureCloseToTray(enabled: boolean): Promise<void> {
  if (isDesktopRuntime) await invoke('set_close_to_tray', { enabled })
}

export async function backupDatabase(): Promise<string | null> {
  return isDesktopRuntime ? invoke<string>('backup_database') : null
}

export function createBackup(data: AppData): BackupFile {
  return { format: 'focusflow-backup', schema_version: 1, app_version: '0.1.2', exported_at: new Date().toISOString(), data }
}

export function parseBackup(raw: string): AppData {
  const file = JSON.parse(raw) as Partial<BackupFile>
  if (file.format !== 'focusflow-backup' || file.schema_version !== 1 || !file.data) throw new Error('INVALID_BACKUP')
  return normalize(file.data)
}
