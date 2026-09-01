import type { AppData, AppSettings, PanelPreferences } from '../types/domain'

const panel: PanelPreferences = {
  enabled: false, positionLocked: false, zOrder: 'normal', backgroundOpacity: 0.9,
  snapEnabled: true, snapThreshold: 12, autoHide: false, clickThrough: false,
}

export const defaultSettings: AppSettings = {
  theme: 'system', language: 'zh-CN', accentColor: '#5268d9', dashboardQuote: '',
  pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakInterval: 4,
  autoOvertime: true, overtimeMinutes: 30,
  autoStartBreak: false, autoStartFocus: false, sound: true, notification: true,
  preventSleep: false, pauseOnLock: true, minimumRecordPercent: 5, thresholdExemptionMinutes: 120,
  streakMinutes: 20, matrixFourThreshold: 50, matrixNineLow: 33, matrixNineHigh: 67,
  autoBackup: true, keepDailyBackups: 7, keepWeeklyBackups: 4, keepMonthlyBackups: 6,
  closeToTray: true, autostart: false, shortcuts: {},
  taskView: {
    view: 'list', matrix: 'four', density: 'comfortable', cardSize: 'medium',
    showDescription: true, showTags: true, showProject: true, showEstimate: true,
    showActual: true, showDueDate: true, showPriority: true, showProgress: false,
    sortBy: 'manual', groupBy: 'none', showCompleted: true,
  },
  taskPanel: { ...panel }, timerPanel: { ...panel, zOrder: 'alwaysOnTop' },
}

export function emptyData(): AppData {
  return { tasks: [], projects: [], categories: [], memos: [], sessions: [], settings: structuredClone(defaultSettings) }
}

export function mergeSettings(value: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings, ...value,
    taskView: { ...defaultSettings.taskView, ...value.taskView },
    taskPanel: { ...defaultSettings.taskPanel, ...value.taskPanel },
    timerPanel: { ...defaultSettings.timerPanel, ...value.timerPanel },
    shortcuts: { ...value.shortcuts },
  }
}
