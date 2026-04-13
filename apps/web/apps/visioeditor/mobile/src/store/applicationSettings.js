import { action, makeObservable, observable } from "mobx"
import { LocalStorage } from "../../../../common/mobile/utils/LocalStorage.mjs"

export class storeApplicationSettings {
  constructor() {
    makeObservable(this, {})
  }
}
