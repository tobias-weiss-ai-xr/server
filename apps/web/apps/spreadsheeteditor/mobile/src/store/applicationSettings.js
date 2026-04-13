import { action, makeObservable, observable } from "mobx"
import { LocalStorage } from "../../../../common/mobile/utils/LocalStorage.mjs"

export class storeApplicationSettings {
  constructor() {
    makeObservable(this, {
      unitMeasurement: observable,
      macrosMode: observable,
      macrosRequest: observable,
      formulaLang: observable,
      regCode: observable,
      regExample: observable,
      regData: observable,
      isRefStyle: observable,
      isComments: observable,
      isResolvedComments: observable,
      initRegData: action,
      getRegCode: action,
      changeRegCode: action,
      setRegExample: action,
      changeUnitMeasurement: action,
      changeMacrosSettings: action,
      changeMacrosRequest: action,
      changeDisplayComments: action,
      changeDisplayResolved: action,
      changeRefStyle: action,
      changeFormulaLang: action,
      directionMode: observable,
      changeDirectionMode: action,
      formulaLangsColection: observable,
      setFormulaLangsCollection: action,
    })
  }

  directionMode = LocalStorage.getItem("mode-direction") || "ltr"
  unitMeasurement = Common.Utils.Metric.getCurrentMetric()
  macrosMode = 0
  macrosRequest = 0
  formulaLang = LocalStorage.getItem("sse-settings-func-lang") || "en"
  regCode = undefined
  regExample = ""
  regData = []
  isRefStyle = false
  isComments = true
  isResolvedComments = true
  formulaLangs = [
    "en",
    "be",
    "bg",
    "ca",
    "zh",
    "zh-tw",
    "cs",
    "da",
    "nl",
    "fi",
    "fr",
    "de",
    "el",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "lv",
    "lo",
    "nb",
    "pl",
    "pt-br",
    "pt",
    "ro",
    "ru",
    "sr",
    "sr-cyrl",
    "sk",
    "sl",
    "sv",
    "es",
    "tr",
    "uk",
    "vi",
  ]

  formulaLangsExamples = {
    txtExampleEn: "SUM; MIN; MAX; COUNT",
    txtExampleDe: "SUMME; MIN; MAX; ANZAHL",
    txtExampleRu: "СУММ; МИН; МАКС; СЧЁТ",
    txtExamplePl: "SUMA; MIN; MAX; ILE.LICZB",
    txtExampleEs: "SUMA; MIN; MAX; CALCULAR",
    txtExampleFr: "SOMME; MIN; MAX; NB",
    txtExampleIt: "SOMMA; MIN; MAX; CONTA.NUMERI",
    txtExampleBe: "СУММ; МИН; МАКС; СЧЁТ",
    txtExampleCa: "SUMA; MIN; MAX; COMPT",
    txtExampleCs: "SUMA; MIN; MAX; POČET",
    txtExampleDa: "SUM; MIN; MAKS; TÆL",
    txtExampleNl: "SOM; MIN; MAX; AANTAL",
    txtExampleFi: "SUMMA; MIN; MAKS; LASKE",
    txtExampleHu: "SZUM; MIN; MAX; DARAB",
    txtExampleNb: "SUMMER; MIN; STØRST; ANTALL",
    txtExamplePt: "SOMA; MÍNIMO; MÁXIMO; CONTAR",
    txtExamplePtbr: "SOMA; MÍNIMO; MÁXIMO; CONT.NÚM",
    txtExampleSv: "SUMMA; MIN; MAX; ANTAL",
    txtExampleTr: "TOPLA; MİN; MAK; BAĞ_DEĞ_SAY",
    txtExampleSr: "SUMA; MIN; MAKS; BROJANJE",
    txtExampleSrcyrl: "СУМА; МИН; МАКС; БРОЈАЊЕ",
  }
  formulaLangsColection = []

  changeDirectionMode(value) {
    this.directionMode = value
  }

  setFormulaLangsCollection(arr) {
    this.formulaLangsColection = arr
  }

  getRegDataCodes() {
    const regDataCode = [
      { value: 0x0401 },
      { value: 0x042c },
      { value: 0x0402 },
      { value: 0x0405 },
      { value: 0x0406 },
      { value: 0x0c07 },
      { value: 0x0407 },
      { value: 0x0807 },
      { value: 0x0408 },
      { value: 0x0c09 },
      { value: 0x3809 },
      { value: 0x0809 },
      { value: 0x0409 },
      { value: 0x0c0a },
      { value: 0x080a },
      { value: 0x040b },
      { value: 0x040c },
      { value: 0x100c },
      { value: 0x0421 },
      { value: 0x0410 },
      { value: 0x0810 },
      { value: 0x0411 },
      { value: 0x0412 },
      { value: 0x0426 },
      { value: 0x040e },
      { value: 0x0413 },
      { value: 0x0415 },
      { value: 0x0416 },
      { value: 0x0816 },
      { value: 0x0419 },
      { value: 0x041b },
      { value: 0x0424 },
      { value: 0x281a },
      { value: 0x241a },
      { value: 0x081d },
      { value: 0x041d },
      { value: 0x041f },
      { value: 0x0422 },
      { value: 0x042a },
      { value: 0x0804 },
      { value: 0x0404 },
    ]

    return regDataCode
  }

  initRegData() {
    const regDataCodes = this.getRegDataCodes()

    regDataCodes.forEach((item) => {
      const langInfo = Common.util.LanguageInfo.getLocalLanguageName(item.value)
      this.regData.push({ code: item.value, displayName: langInfo[1], langName: langInfo[0] })
    })
  }

  getRegCode() {
    const regData = this.regData
    const value = Number(LocalStorage.getItem("sse-settings-regional"))

    regData.forEach((obj) => {
      if (obj.code === value) {
        this.regCode = obj.code
      }
    })

    if (!this.regCode) {
      this.regCode = 0x0409
    }

    return this.regCode
  }

  changeRegCode(value) {
    this.regCode = value
  }

  setRegExample(value) {
    this.regExample = value
  }

  changeUnitMeasurement(value) {
    this.unitMeasurement = +value
  }

  changeMacrosSettings(value) {
    this.macrosMode = +value
  }

  changeMacrosRequest(value) {
    this.macrosRequest = value
  }

  changeDisplayComments(value) {
    this.isComments = value
    if (!value) this.changeDisplayResolved(value)
  }

  changeDisplayResolved(value) {
    this.isResolvedComments = value
  }

  changeRefStyle(value) {
    this.isRefStyle = value
  }

  changeFormulaLang(value) {
    this.formulaLang = value
  }
}
