import { describe, expect, it } from 'vitest'
import { minimumRecordSeconds, shouldRecordSession } from './focus-policy'

const policy = { minimumRecordPercent: 5, thresholdExemptionMinutes: 120 }

describe('focus recording policy', () => {
  it('uses five percent of the estimate as the exact boundary', () => {
    expect(minimumRecordSeconds(25, policy)).toBe(75)
    expect(shouldRecordSession(74, 25, policy)).toBe(false)
    expect(shouldRecordSession(75, 25, policy)).toBe(true)
  })

  it('exempts tasks longer than two hours', () => {
    expect(minimumRecordSeconds(121, policy)).toBe(0)
    expect(shouldRecordSession(1, 121, policy)).toBe(true)
  })

  it('records unestimated free focus sessions', () => {
    expect(shouldRecordSession(1, 0, policy)).toBe(true)
  })
})
