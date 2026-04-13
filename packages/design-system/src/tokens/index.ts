export { colors } from "./colors"
export { typography } from "./typography"
export { spacing } from "./spacing"
export { radii } from "./radii"
export { shadows } from "./shadows"

import { colors } from "./colors"
import { radii } from "./radii"
import { shadows } from "./shadows"
import { spacing } from "./spacing"
import { typography } from "./typography"

export const tokens = { colors, typography, spacing, radii, shadows } as const
