/**
 * Unit conversion utilities — convert between metric units (mm, cm, pt, inch, twip).
 */

/**
 * Metric unit types.
 */
export enum MetricUnit {
  Centimeter = 0,
  Point = 1,
  Inch = 2,
}

/**
 * Convert a value to millimeters.
 *
 * @param value - Value in the current unit
 * @param currentUnit - Current unit of the value (cm, pt, or inch)
 * @returns Value in millimeters
 */
export function toMillimeters(value: number, currentUnit: MetricUnit): number {
  if (value === null || value === undefined) {
    return value
  }

  switch (currentUnit) {
    case MetricUnit.Centimeter:
      return value * 10
    case MetricUnit.Point:
      return (value * 25.4) / 72.0
    case MetricUnit.Inch:
      return value * 25.4
    default:
      return value
  }
}

/**
 * Convert a value from millimeters to the target unit.
 *
 * @param value - Value in millimeters
 * @param targetUnit - Target unit (cm, pt, or inch)
 * @returns Value in target unit
 */
export function fromMillimeters(value: number, targetUnit: MetricUnit): number {
  switch (targetUnit) {
    case MetricUnit.Centimeter:
      return Number.parseFloat((value / 10).toFixed(4))
    case MetricUnit.Point:
      return Number.parseFloat(((value * 72.0) / 25.4).toFixed(3))
    case MetricUnit.Inch:
      return Number.parseFloat((value / 25.4).toFixed(3))
    default:
      return value
  }
}

/**
 * Convert centimeters to millimeters.
 */
export function cmToMm(value: number): number {
  return value * 10
}

/**
 * Convert millimeters to centimeters.
 */
export function mmToCm(value: number): number {
  return value / 10
}

/**
 * Convert points to millimeters.
 */
export function ptToMm(value: number): number {
  return (value * 25.4) / 72.0
}

/**
 * Convert millimeters to points.
 */
export function mmToPt(value: number): number {
  return (value * 72.0) / 25.4
}

/**
 * Convert inches to millimeters.
 */
export function inchToMm(value: number): number {
  return value * 25.4
}

/**
 * Convert millimeters to inches.
 */
export function mmToInch(value: number): number {
  return value / 25.4
}

/**
 * Convert twips to points (1 twip = 1/20 point).
 */
export function twipToPt(value: number): number {
  return value / 20
}

/**
 * Convert points to twips (1 point = 20 twips).
 */
export function ptToTwip(value: number): number {
  return value * 20
}

/**
 * Convert twips to millimeters.
 */
export function twipToMm(value: number): number {
  return ptToMm(twipToPt(value))
}

/**
 * Convert millimeters to twips.
 */
export function mmToTwip(value: number): number {
  return ptToTwip(mmToPt(value))
}
