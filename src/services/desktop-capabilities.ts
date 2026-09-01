import { invoke, isTauri } from '@tauri-apps/api/core'

export async function setPreventSleep(enabled: boolean): Promise<void> {
  if (!isTauri()) return
  await invoke('set_prevent_sleep', { enabled })
}
