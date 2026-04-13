import { storeComments } from "../../../../common/mobile/lib/store/comments"
import { storeReview } from "../../../../common/mobile/lib/store/review"
import { storeThemes } from "../../../../common/mobile/lib/store/themes"
import { storeUsers } from "../../../../common/mobile/lib/store/users"
import { storeVersionHistory } from "../../../../common/mobile/lib/store/versionHistory"
import { storeAppOptions } from "./appOptions"
import { storeApplicationSettings } from "./applicationSettings"
import { storeCellSettings } from "./cellSettings"
// import {storeImageSettings} from "./imageSettings";
// import {storeTableSettings} from "./tableSettings";
import { storeChartSettings } from "./chartSettings"
import { storeFocusObjects } from "./focusObjects"
import { storeFunctions } from "./functions"
import { storePalette } from "./palette"
import { storeShapeSettings } from "./shapeSettings"
import { storeWorksheets } from "./sheets"
import { storeSpreadsheetInfo } from "./spreadsheetInfo"
import { storeSpreadsheetSettings } from "./spreadsheetSettings"
import { storeTextSettings } from "./textSettings"
import { storeToolbarSettings } from "./toolbar"

export const stores = {
  storeFocusObjects: new storeFocusObjects(),
  storeSpreadsheetSettings: new storeSpreadsheetSettings(),
  storeApplicationSettings: new storeApplicationSettings(),
  users: new storeUsers(),
  storeFunctions: new storeFunctions(),
  storeTextSettings: new storeTextSettings(),
  storeSpreadsheetInfo: new storeSpreadsheetInfo(),
  storeAppOptions: new storeAppOptions(),
  // storeParagraphSettings: new storeParagraphSettings(),
  storeShapeSettings: new storeShapeSettings(),
  storeChartSettings: new storeChartSettings(),
  storePalette: new storePalette(),
  storeCellSettings: new storeCellSettings(),
  storeReview: new storeReview(),
  // storeImageSettings: new storeImageSettings(),
  // storeTableSettings: new storeTableSettings()
  storeComments: new storeComments(),
  storeVersionHistory: new storeVersionHistory(),
  storeToolbarSettings: new storeToolbarSettings(),
  storeWorksheets: new storeWorksheets(),
  storeThemes: new storeThemes(),
}
