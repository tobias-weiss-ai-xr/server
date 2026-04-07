export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { radii } from "./radii";
export { shadows } from "./shadows";

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radii } from "./radii";
import { shadows } from "./shadows";

export const tokens = { colors, typography, spacing, radii, shadows } as const;
