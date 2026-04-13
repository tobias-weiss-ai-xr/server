import { storeComments } from "../../../../common/mobile/lib/store/comments"
// import {storeParagraphSettings} from "./paragraphSettings";
// import {storeShapeSettings} from "./shapeSettings";
// import {storeImageSettings} from "./imageSettings";
import { storeReview } from "../../../../common/mobile/lib/store/review"
import { storeThemes } from "../../../../common/mobile/lib/store/themes"
import { storeUsers } from "../../../../common/mobile/lib/store/users"
import { storeVersionHistory } from "../../../../common/mobile/lib/store/versionHistory"
import { storeAppOptions } from "./appOptions"
import { storeApplicationSettings } from "./applicationSettings"
import { storeChartSettings } from "./chartSettings"
// import {storeDocumentSettings} from './documentSettings';
import { storeFocusObjects } from "./focusObjects"
import { storeLinkSettings } from "./linkSettings"
import { storePalette } from "./palette"
import { storePresentationInfo } from "./presentationInfo"
import { storePresentationSettings } from "./presentationSettings"
import { storeShapeSettings } from "./shapeSettings"
import { storeSlideSettings } from "./slideSettings"
import { storeTableSettings } from "./tableSettings"
import { storeTextSettings } from "./textSettings"
import { storeToolbarSettings } from "./toolbar"

export const stores = {
  storeAppOptions: new storeAppOptions(),
  storeFocusObjects: new storeFocusObjects(),
  // storeDocumentSettings: new storeDocumentSettings(),
  users: new storeUsers(),
  storeApplicationSettings: new storeApplicationSettings(),
  storePresentationInfo: new storePresentationInfo(),
  storePresentationSettings: new storePresentationSettings(),
  storeSlideSettings: new storeSlideSettings(),
  storePalette: new storePalette(),
  storeTextSettings: new storeTextSettings(),
  storeShapeSettings: new storeShapeSettings(),
  storeTableSettings: new storeTableSettings(),
  storeChartSettings: new storeChartSettings(),
  storeLinkSettings: new storeLinkSettings(),
  storeReview: new storeReview(),
  // storeTextSettings: new storeTextSettings(),
  // storeParagraphSettings: new storeParagraphSettings(),
  // storeShapeSettings: new storeShapeSettings(),
  // storeChartSettings: new storeChartSettings(),
  storeComments: new storeComments(),
  storeToolbarSettings: new storeToolbarSettings(),
  storeThemes: new storeThemes(),
  storeVersionHistory: new storeVersionHistory(),
}
