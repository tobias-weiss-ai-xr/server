import { storeComments } from "../../../../common/mobile/lib/store/comments"
import { storeReview } from "../../../../common/mobile/lib/store/review"
import { storeThemes } from "../../../../common/mobile/lib/store/themes"
import { storeUsers } from "../../../../common/mobile/lib/store/users"
import { storeVersionHistory } from "../../../../common/mobile/lib/store/versionHistory"
import { storeAppOptions } from "./appOptions"
import { storeApplicationSettings } from "./applicationSettings"
import { storeChartSettings } from "./chartSettings"
import { storeDocumentInfo } from "./documentInfo"
import { storeDocumentSettings } from "./documentSettings"
import { storeFocusObjects } from "./focusObjects"
import { storeImageSettings } from "./imageSettings"
import { storeLinkSettings } from "./linkSettings"
import { storeNavigation } from "./navigation"
import { storePalette } from "./palette"
import { storeParagraphSettings } from "./paragraphSettings"
import { storeShapeSettings } from "./shapeSettings"
import { storeTableSettings } from "./tableSettings"
import { storeTextSettings } from "./textSettings"
import { storeToolbarSettings } from "./toolbar"

export const stores = {
  storeAppOptions: new storeAppOptions(),
  storeFocusObjects: new storeFocusObjects(),
  storeDocumentSettings: new storeDocumentSettings(),
  users: new storeUsers(),
  storeTextSettings: new storeTextSettings(),
  storeLinkSettings: new storeLinkSettings(),
  storeParagraphSettings: new storeParagraphSettings(),
  storeShapeSettings: new storeShapeSettings(),
  storeChartSettings: new storeChartSettings(),
  storeImageSettings: new storeImageSettings(),
  storeTableSettings: new storeTableSettings(),
  storeDocumentInfo: new storeDocumentInfo(),
  storeApplicationSettings: new storeApplicationSettings(),
  storePalette: new storePalette(),
  storeReview: new storeReview(),
  storeComments: new storeComments(),
  storeToolbarSettings: new storeToolbarSettings(),
  storeNavigation: new storeNavigation(),
  storeThemes: new storeThemes(),
  storeVersionHistory: new storeVersionHistory(),
}
