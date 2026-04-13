import { f7 } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Device } from "../../../../common/mobile/utils/device"
import CellEditorView from "../view/CellEditor"

const CellEditor = inject("storeFunctions")(
  observer((props) => {
    useEffect(() => {
      Common.Notifications.on("engineCreated", (api) => {
        api.asc_registerCallback("asc_onSelectionNameChanged", onApiCellSelection.bind(this))
        api.asc_registerCallback("asc_onSelectionChanged", onApiSelectionChanged.bind(this))
        api.asc_registerCallback("asc_onFormulaCompleteMenu", onApiFormulaCompleteMenu.bind(this))
        api.asc_registerCallback("asc_onFormulaInfo", onFormulaInfo.bind(this))
      })
    }, [])

    const { t } = useTranslation()
    const [cellName, setCellName] = useState("")
    const [stateFunctions, setFunctionshDisabled] = useState(null)
    const [stateFuncArr, setFuncArr] = useState("")
    const [stateHintArr, setHintArr] = useState("")
    const [funcHint, setFuncHint] = useState("")

    const onApiCellSelection = (info) => {
      setCellName(typeof info === "string" ? info : info.asc_getName())
    }

    const onApiSelectionChanged = (info) => {
      const seltype = info.asc_getSelectionType()
      const coauth_disable =
        info.asc_getLocked() === true ||
        info.asc_getLockedTable() === true ||
        info.asc_getLockedPivotTable() === true

      const is_chart_text = seltype === Asc.c_oAscSelectionType.RangeChartText
      const is_chart = seltype === Asc.c_oAscSelectionType.RangeChart
      const is_shape_text = seltype === Asc.c_oAscSelectionType.RangeShapeText
      const is_shape = seltype === Asc.c_oAscSelectionType.RangeShape
      const is_image =
        seltype === Asc.c_oAscSelectionType.RangeImage ||
        seltype === Asc.c_oAscSelectionType.RangeSlicer
      const is_mode_2 = is_shape_text || is_shape || is_chart_text || is_chart

      setFunctionshDisabled(is_image || is_mode_2 || coauth_disable)
    }

    const onApiFormulaCompleteMenu = (funcarr) => {
      setTimeout(() => {
        onFormulaCompleteMenu(funcarr)
      }, 0)
    }

    const onFormulaInfo = (name, shiftpos, funcInfo) => {
      if (!name) {
        setFuncHint(null)
        return
      }

      const api = Common.EditorApi.get()
      const storeFunctions = props.storeFunctions
      const functions = storeFunctions.functions
      const origName = api.asc_getFormulaNameByLocale(name)
      const separator = api.asc_getFunctionArgumentSeparator()
      const argstype = funcInfo ? funcInfo.asc_getArgumentsType() : null
      const activeArg = funcInfo ? funcInfo.asc_getActiveArgPos() : null
      const activeArgsCount = funcInfo ? funcInfo.asc_getActiveArgsCount() : null
      const funcName = api.asc_getFormulaLocaleName(name)

      const parseArgsDesc = (args) => {
        if (!args) return []

        if (args.charAt(0) === "(") args = args.substring(1)
        if (args.charAt(args.length - 1) === ")") args = args.substring(0, args.length - 1)

        const arr = args.split(separator)
        arr.forEach((item, index) => {
          let str = item.trim()
          if (str.charAt(0) === "[") str = str.substring(1)
          if (str.charAt(str.length - 1) === "]") str = str.substring(0, str.length - 1)
          arr[index] = str.trim()
        })
        return arr
      }

      const fillRepeatedNames = (argsNames, repeatedArg) => {
        let repeatedIdx = 1
        if (argsNames.length >= 1) {
          if (repeatedArg && repeatedArg.length > 0 && argsNames[argsNames.length - 1] === "...") {
            const req = argsNames.length - 1 - repeatedArg.length
            for (let i = 0; i < repeatedArg.length; i++) {
              const str = argsNames[argsNames.length - 2 - i]
              const ch = str.charAt(str.length - 1)
              if ("123456789".indexOf(ch) > -1) {
                repeatedIdx = Number.parseInt(ch)
                argsNames[argsNames.length - 2 - i] = str.substring(0, str.length - 1)
              }
            }
          }
        }
        return repeatedIdx
      }

      const getArgumentName = (
        argcount,
        argsNames,
        repeatedArg,
        minArgCount,
        maxArgCount,
        repeatedIdx,
      ) => {
        let name = ""
        const namesLen = argsNames.length
        let idxInRepeatedArr = -1
        const textArgument = t("View.Edit.textArgument") || "arg"

        if (
          (!repeatedArg || repeatedArg.length < 1) &&
          argcount < namesLen &&
          argsNames[argcount] !== "..."
        ) {
          name = argsNames[argcount]
          name === "" && (name = textArgument + (maxArgCount > 1 ? ` ${argcount + 1}` : ""))
        } else if (repeatedArg && repeatedArg.length > 0 && argsNames[namesLen - 1] === "...") {
          const repeatedLen = repeatedArg.length
          const req = namesLen - 1 - repeatedLen
          if (argcount < req) name = argsNames[argcount]
          else {
            const idx = repeatedLen - ((argcount - req) % repeatedLen)
            const num = Math.floor((argcount - req) / repeatedLen) + repeatedIdx
            idxInRepeatedArr = repeatedLen - idx
            name = argsNames[namesLen - 1 - idx] + num
          }
        } else name = textArgument + (maxArgCount > 1 ? ` ${argcount + 1}` : "")

        if (maxArgCount > 0 && argcount >= minArgCount)
          name =
            (idxInRepeatedArr <= 0 ? "[" : "") +
            name +
            (idxInRepeatedArr < 0 || (repeatedArg && idxInRepeatedArr === repeatedArg.length - 1)
              ? "]"
              : "")

        return name
      }

      if (argstype && activeArgsCount) {
        let args = ""

        if (functions?.[origName]?.args) {
          args = functions[origName].args.replace(/[,;]/g, separator)
        } else {
          const custom = api.asc_getCustomFunctionInfo(origName)
          const arr_args = custom ? custom.asc_getArg() || [] : []
          args = `(${arr_args
            .map((item) =>
              item.asc_getIsOptional() ? `[${item.asc_getName()}]` : item.asc_getName(),
            )
            .join(`${separator} `)})`
        }

        const argsNames = parseArgsDesc(args)
        const minArgCount = funcInfo.asc_getArgumentMin()
        const maxArgCount = funcInfo.asc_getArgumentMax()
        let repeatedArg = undefined
        let repeatedIdx = 1
        const arr = []

        const fillArgs = (types) => {
          let argcount = arr.length
          for (let j = 0; j < types.length; j++) {
            const str = getArgumentName(
              argcount,
              argsNames,
              repeatedArg,
              minArgCount,
              maxArgCount,
              repeatedIdx,
            )
            const isActive = activeArg && argcount === activeArg - 1
            arr.push({ name: str, isActive })
            argcount++
          }
        }

        for (let i = 0; i < argstype.length; i++) {
          const type = argstype[i]
          let types = []

          if (typeof type === "object") {
            repeatedArg = type
            repeatedIdx = fillRepeatedNames(argsNames, repeatedArg)
            types = type
          } else {
            types.push(type)
          }

          fillArgs(types)
        }

        if (arr.length <= activeArgsCount && repeatedArg) {
          while (arr.length <= activeArgsCount) {
            fillArgs(repeatedArg)
          }
        }

        if (repeatedArg) {
          arr.push({ name: "...", isActive: false })
        }

        setFuncHint({
          name: funcName,
          nameIsActive: !activeArg,
          args: arr,
          separator: separator,
        })
      } else {
        let hint = ""
        if (functions?.[origName]?.args) {
          hint = funcName + functions[origName].args
          hint = hint.replace(/[,;]/g, separator)
        } else {
          const custom = api.asc_getCustomFunctionInfo(origName)
          const arr_args = custom ? custom.asc_getArg() || [] : []
          hint = `${funcName}(${arr_args
            .map((item) =>
              item.asc_getIsOptional() ? `[${item.asc_getName()}]` : item.asc_getName(),
            )
            .join(`${separator} `)})`
        }

        const argsStr = hint.substring(hint.indexOf("("))
        const argsNames = parseArgsDesc(argsStr)
        const args = argsNames.map((argName) => ({ name: argName, isActive: false }))

        setFuncHint({
          name: funcName,
          nameIsActive: false,
          args: args,
          separator: separator,
        })
      }
    }

    const onFormulaCompleteMenu = async (funcArr) => {
      const api = Common.EditorApi.get()
      const storeFunctions = props.storeFunctions
      const functions = storeFunctions.functions

      if (funcArr) {
        funcArr.sort((a, b) => {
          const atype = a.asc_getType()
          const btype = b.asc_getType()
          if (atype === btype && atype === Asc.c_oAscPopUpSelectorType.TableColumnName) return 0
          if (atype === Asc.c_oAscPopUpSelectorType.TableThisRow) return -1
          if (btype === Asc.c_oAscPopUpSelectorType.TableThisRow) return 1
          if (
            (atype === Asc.c_oAscPopUpSelectorType.TableColumnName ||
              btype === Asc.c_oAscPopUpSelectorType.TableColumnName) &&
            atype !== btype
          )
            return atype === Asc.c_oAscPopUpSelectorType.TableColumnName ? -1 : 1
          const aname = a.asc_getName(true).toLocaleUpperCase()
          const bname = b.asc_getName(true).toLocaleUpperCase()
          if (aname < bname) return -1
          if (aname > bname) return 1

          return 0
        })

        const hintArr = funcArr.map((item) => {
          const type = item.asc_getType()
          const name = item.asc_getName(true)
          const origName = api.asc_getFormulaNameByLocale(name)
          let args = ""
          const caption = name
          let descr = ""

          switch (type) {
            case Asc.c_oAscPopUpSelectorType.Func:
              if (functions?.[origName]?.descr) descr = functions[origName].descr
              else {
                const custom = api.asc_getCustomFunctionInfo(origName)
                descr = custom ? custom.asc_getDescription() || "" : ""
              }
              if (functions?.[origName]?.args) args = functions[origName].args
              else {
                const custom = api.asc_getCustomFunctionInfo(origName)
                if (custom) {
                  const arr_args = custom.asc_getArg() || []
                  args = `(${arr_args.map((item) => (item.asc_getIsOptional() ? `[${item.asc_getName()}]` : item.asc_getName())).join(`${api.asc_getFunctionArgumentSeparator()} `)})`
                }
              }
              break
            case Asc.c_oAscPopUpSelectorType.TableThisRow:
              descr = t("View.Add.textThisRowHint")
              break
            case Asc.c_oAscPopUpSelectorType.TableAll:
              descr = t("View.Add.textAllTableHint")
              break
            case Asc.c_oAscPopUpSelectorType.TableData:
              descr = t("View.Add.textDataTableHint")
              break
            case Asc.c_oAscPopUpSelectorType.TableHeaders:
              descr = t("View.Add.textHeadersTableHint")
              break
            case Asc.c_oAscPopUpSelectorType.TableTotals:
              descr = t("View.Add.textTotalsTableHint")
              break
          }

          return { name, type, descr, caption, args }
        })

        setFuncArr(funcArr)
        setHintArr(hintArr)

        await f7.popover.open("#idx-functions-list", "#idx-list-target")
      } else {
        await f7.popover.close("#idx-functions-list")

        setFuncArr("")
        setHintArr("")
      }
    }

    const insertFormula = (name, type) => {
      const api = Common.EditorApi.get()
      api.asc_insertInCell(name, type, false)
      f7.popover.close("#idx-functions-list")
    }

    return (
      <CellEditorView
        cellName={cellName}
        stateFunctions={stateFunctions}
        onClickToOpenAddOptions={props.onClickToOpenAddOptions}
        funcArr={stateFuncArr}
        hintArr={stateHintArr}
        insertFormula={insertFormula}
        funcHint={funcHint}
      />
    )
  }),
)

export default CellEditor
