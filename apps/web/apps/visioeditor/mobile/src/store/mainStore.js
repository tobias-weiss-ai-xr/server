import { storeThemes } from "../../../../common/mobile/lib/store/themes"
import { storeUsers } from "../../../../common/mobile/lib/store/users"
import { storeAppOptions } from "./appOptions"
import { storeApplicationSettings } from "./applicationSettings"
import { storeToolbarSettings } from "./toolbar"
import { storeVisioInfo } from "./visioInfo"

export const stores = {
  storeAppOptions: new storeAppOptions(),
  users: new storeUsers(),
  storeApplicationSettings: new storeApplicationSettings(),
  storeVisioInfo: new storeVisioInfo(),
  storeToolbarSettings: new storeToolbarSettings(),
  storeThemes: new storeThemes(),
}
