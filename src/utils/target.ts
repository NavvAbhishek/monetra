import { differenceInCalendarDays, startOfDay } from 'date-fns'
import type { DateRange } from '@/types/period'
import { getRangeDays } from './period'

/**
 * Spending target maths (user request 2026-11-22). Pure: spent so far vs the target for the CURRENT week / month.
 * "Left per day" counts today, so on the last day it is everything that is left.
 */

export type TargetStatus = 'ok' | 'warn' | 'over'

/** The bar turns amber from this share of the target. */
export const TARGET_WARN_PERCENT = 80

export type TargetProgress = {
  spentCents: number
  targetCents: number
  /** Whole percent of the target used (can be above 100). */
  percent: number
  /** `ok` < 80 %, `warn` 80–100 %, `over` > 100 %. */
  status: TargetStatus
  /** Target − spent while under it, else 0. */
  leftCents: number
  /** Spent − target while over it, else 0. */
  overCents: number
  /** Days of the period left, counting today. */
  daysLeft: number
  /** What can still be spent per day (today included) to stay inside the target. */
  perDayCents: number
  /** Where the total ends up if the daily pace so far continues. */
  projectedCents: number
  /** At the current pace the period ends over the target (or it is already over). */
  paceOver: boolean
}

export const getTargetProgress = (spentCents: number, targetCents: number, range: DateRange, now: Date): TargetProgress => {
  const totalDays = getRangeDays(range)
  const elapsed = Math.min(totalDays, Math.max(1, differenceInCalendarDays(startOfDay(now), range.start) + 1))
  const daysLeft = Math.max(1, totalDays - elapsed + 1)
  const percent = Math.round((spentCents / targetCents) * 100)
  const leftCents = Math.max(0, targetCents - spentCents)
  const projectedCents = Math.round((spentCents / elapsed) * totalDays)

  return {
    spentCents,
    targetCents,
    percent,
    status: spentCents > targetCents ? 'over' : percent >= TARGET_WARN_PERCENT ? 'warn' : 'ok',
    leftCents,
    overCents: Math.max(0, spentCents - targetCents),
    daysLeft,
    perDayCents: Math.floor(leftCents / daysLeft),
    projectedCents,
    paceOver: projectedCents > targetCents,
  }
}
