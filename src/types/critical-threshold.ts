import { TimeFunction } from '../constants/time-function'

export type CriticalThreshold = {
  value: number
  duration_minutes: number
  time_function: TimeFunction
}
