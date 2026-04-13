import { Popover, Sheet, View, f7 } from "framework7-react"
import React, { useContext, useEffect } from "react"
import { Device } from "../../../../../common/mobile/utils/device"
import { MainContext } from "../../page/main"
import {
  PageChartBorderColor,
  PageChartCustomBorderColor,
  PageChartCustomFillColor,
  PageChartDesign,
  PageChartDesignBorder,
  PageChartDesignFill,
  PageChartDesignStyle,
  PageChartDesignType,
  PageChartReorder,
  PageChartWrap,
} from "./EditChart"
import {
  PageImageReorder,
  PageImageReplace,
  PageImageWrap,
  PageLinkSettings,
  PageWrappingStyle,
} from "./EditImage"
import {
  PageChangeNextParagraphStyle,
  PageCreateTextStyle,
  PageParagraphBackColor,
  PageParagraphCustomColor,
  PageParagraphStyle,
  ParagraphAdvSettings,
} from "./EditParagraph"
import {
  PageReorder,
  PageReplace,
  PageShapeBorderColor,
  PageShapeCustomBorderColor,
  PageShapeCustomFillColor,
  PageShapeStyle,
  PageShapeStyleNoFill,
  PageWrap,
} from "./EditShape"
import {
  PageTableBorderColor,
  PageTableCustomBorderColor,
  PageTableCustomFillColor,
  PageTableOptions,
  PageTableStyle,
  PageTableStyleOptions,
  PageTableWrap,
} from "./EditTable"
import {
  PageEditLeaderTableContents,
  PageEditStructureTableContents,
  PageEditStylesTableContents,
} from "./EditTableContents"
import {
  PageOrientationTextShape,
  PageOrientationTextTable,
  PageTextAddFormatting,
  PageTextBulletsAndNumbers,
  PageTextCustomFontColor,
  PageTextDirection,
  PageTextFontColor,
  PageTextFonts,
  PageTextHighlightColor,
  PageTextLineSpacing,
} from "./EditText"
import EditingPage from "./EditingPage"

const routes = [
  {
    path: "/editing-page/",
    component: EditingPage,
    keepAlive: true,
  },
  //Edit text
  {
    path: "/edit-text-fonts/",
    component: PageTextFonts,
  },
  {
    path: "/edit-text-add-formatting/",
    component: PageTextAddFormatting,
  },
  {
    path: "/edit-bullets-and-numbers/",
    component: PageTextBulletsAndNumbers,
  },
  {
    path: "/edit-text-direction/",
    component: PageTextDirection,
  },
  {
    path: "/edit-text-line-spacing/",
    component: PageTextLineSpacing,
  },
  {
    path: "/edit-text-font-color/",
    component: PageTextFontColor,
  },
  {
    path: "/edit-text-custom-font-color/",
    component: PageTextCustomFontColor,
  },
  {
    path: "/edit-text-highlight-color/",
    component: PageTextHighlightColor,
  },
  {
    path: "/edit-text-shape-orientation/",
    component: PageOrientationTextShape,
  },

  // Edit link
  // {
  //     path: '/edit-link/',
  //     component: EditHyperlinkController
  // },

  //Edit paragraph
  {
    path: "/edit-paragraph-adv/",
    component: ParagraphAdvSettings,
  },
  {
    path: "/edit-paragraph-back-color/",
    component: PageParagraphBackColor,
  },
  {
    path: "/edit-paragraph-custom-color/",
    component: PageParagraphCustomColor,
  },
  {
    path: "/edit-paragraph-style/",
    component: PageParagraphStyle,
  },
  {
    path: "/create-text-style/",
    component: PageCreateTextStyle,
  },
  {
    path: "/change-next-paragraph-style/",
    component: PageChangeNextParagraphStyle,
  },
  //Edit shape
  {
    path: "/edit-shape-style/",
    component: PageShapeStyle,
  },
  {
    path: "/edit-shape-style-no-fill/",
    component: PageShapeStyleNoFill,
  },
  {
    path: "/edit-shape-custom-fill-color/",
    component: PageShapeCustomFillColor,
  },
  {
    path: "/edit-shape-border-color/",
    component: PageShapeBorderColor,
  },
  {
    path: "/edit-shape-custom-border-color/",
    component: PageShapeCustomBorderColor,
  },
  {
    path: "/edit-shape-wrap/",
    component: PageWrap,
  },
  {
    path: "/edit-shape-reorder/",
    component: PageReorder,
  },
  {
    path: "/edit-shape-replace/",
    component: PageReplace,
  },

  // Edit image
  {
    path: "/edit-image-wrap/",
    component: PageImageWrap,
  },
  {
    path: "/edit-image-replace/",
    component: PageImageReplace,
  },
  {
    path: "/edit-image-reorder/",
    component: PageImageReorder,
  },
  {
    path: "/edit-image-link/",
    component: PageLinkSettings,
  },
  {
    path: "/edit-image-wrapping-style/",
    component: PageWrappingStyle,
  },

  // Edit table
  {
    path: "/edit-table-options/",
    component: PageTableOptions,
  },
  {
    path: "/edit-table-wrap/",
    component: PageTableWrap,
  },
  {
    path: "/edit-table-style/",
    component: PageTableStyle,
  },
  {
    path: "/edit-table-style-options/",
    component: PageTableStyleOptions,
  },
  {
    path: "/edit-table-custom-fill-color/",
    component: PageTableCustomFillColor,
  },
  {
    path: "/edit-table-border-color/",
    component: PageTableBorderColor,
  },
  {
    path: "/edit-table-custom-border-color/",
    component: PageTableCustomBorderColor,
  },
  {
    path: "/edit-text-table-orientation/",
    component: PageOrientationTextTable,
  },
  //Edit chart
  {
    path: "/edit-chart-wrap/",
    component: PageChartWrap,
  },
  {
    path: "/edit-chart-reorder/",
    component: PageChartReorder,
  },
  {
    path: "/edit-chart-design/",
    component: PageChartDesign,
  },
  {
    path: "/edit-chart-type/",
    component: PageChartDesignType,
  },
  {
    path: "/edit-chart-style/",
    component: PageChartDesignStyle,
  },
  {
    path: "/edit-chart-fill/",
    component: PageChartDesignFill,
  },
  {
    path: "/edit-chart-border/",
    component: PageChartDesignBorder,
  },
  {
    path: "/edit-chart-custom-fill-color/",
    component: PageChartCustomFillColor,
  },
  {
    path: "/edit-chart-border-color/",
    component: PageChartBorderColor,
  },
  {
    path: "/edit-chart-custom-border-color/",
    component: PageChartCustomBorderColor,
  },

  // Table Contents

  {
    path: "/edit-style-table-contents/",
    component: PageEditStylesTableContents,
  },
  {
    path: "/edit-leader-table-contents/",
    component: PageEditLeaderTableContents,
  },
  {
    path: "/edit-structure-table-contents/",
    component: PageEditStructureTableContents,
  },
]

routes.forEach((route) => {
  route.options = {
    ...route.options,
    transition: "f7-push",
  }
})

const EditView = () => {
  const mainContext = useContext(MainContext)

  useEffect(() => {
    if (Device.phone) {
      f7.sheet.open("#edit-sheet")
    } else {
      f7.popover.open("#edit-popover", "#btn-edit")
    }
  }, [])

  return !Device.phone ? (
    <Popover
      id="edit-popover"
      className="popover__titled"
      closeByOutsideClick={false}
      onPopoverClosed={() => mainContext.closeOptions("edit")}
    >
      <View style={{ height: "410px" }} routes={routes} url="/editing-page/">
        <EditingPage />
      </View>
    </Popover>
  ) : (
    <Sheet
      id="edit-sheet"
      closeByOutsideClick={false}
      onSheetClosed={() => mainContext.closeOptions("edit")}
    >
      <View routes={routes} url="/editing-page/">
        <EditingPage />
      </View>
    </Sheet>
  )
}

export default EditView
