export interface RecordingPolicy {
  minimumRecordPercent: number
  thresholdExemptionMinutes: number
}

export function minimumRecordSeconds(estimatedMinutes: number, policy: RecordingPolicy): number {
  if (estimatedMinutes <= 0 || estimatedMinutes > policy.thresholdExemptionMinutes) return 0
  return estimatedMinutes * 60 * policy.minimumRecordPercent / 100
}

export function shouldRecordSession(durationSeconds: number, estimatedMinutes: number, policy: RecordingPolicy): boolean {
  return durationSeconds >= minimumRecordSeconds(estimatedMinutes, policy)
}
