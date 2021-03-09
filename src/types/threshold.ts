import { TimeFunction } from '../constants/time-function'

export type Threshold = {
  value: number
  durationMinutes: number
  timeFunction: TimeFunction
}
