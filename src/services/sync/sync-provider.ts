export interface SyncProvider {
  pushChanges(): Promise<void>
  pullChanges(): Promise<void>
  sync(): Promise<void>
}

export class LocalOnlySyncProvider implements SyncProvider {
  async pushChanges(): Promise<void> {}
  async pullChanges(): Promise<void> {}
  async sync(): Promise<void> {}
}

export const futureApiRoutes = {
  auth: '/api/v1/auth', tasks: '/api/v1/tasks', memos: '/api/v1/memos',
  projects: '/api/v1/projects', focusSessions: '/api/v1/focus-sessions',
  settings: '/api/v1/settings', sync: '/api/v1/sync',
} as const
