import { Popover, Sheet, View, f7 } from "framework7-react"
import React, { useContext, useEffect } from "react"
import { Device } from "../../../../../common/mobile/utils/device"
import { EditLinkController } from "../../controller/edit/EditLink"
import { MainContext } from "../../page/main"
import {
  PageChartAlign,
  PageChartBorderColor,
  PageChartCustomBorderColor,
  PageChartCustomFillColor,
  PageChartDesign,
  PageChartDesignBorder,
  PageChartDesignFill,
  PageChartDesignStyle,
  PageChartDesignType,
  PageChartReorder,
} from "./EditChart"
import { PageImageAlign, PageImageReorder, PageImageReplace, PageLinkSettings } from "./EditImage"
import {
  PageAlignContainer,
  PageReorderContainer,
  PageReplaceContainer,
  PageShapeBorderColor,
  PageShapeCustomBorderColor,
  PageShapeCustomFillColor,
  PageShapeStyle,
  PageShapeStyleNoFill,
} from "./EditShape"
import {
  CustomFillColor,
  Effect,
  Layout,
  StyleFillColor,
  Theme,
  Transition,
  Type,
} from "./EditSlide"
import {
  PageTableAlign,
  PageTableBorderColor,
  PageTableCustomBorderColor,
  PageTableCustomFillColor,
  PageTableReorder,
  PageTableSize,
  PageTableStyle,
  PageTableStyleOptions,
} from "./EditTable"
import {
  PageOrientationTextShape,
  PageOrientationTextTable,
  PageTextAddFormatting,
  PageTextBulletsAndNumbers,
  PageTextBulletsLinkSettings,
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

  // Slides
  {
    path: "/layout/",
    component: Layout,
  },
  {
    path: "/theme/",
    component: Theme,
  },
  {
    path: "/transition/",
    component: Transition,
  },
  {
    path: "/effect/",
    component: Effect,
  },
  {
    path: "/type/",
    component: Type,
  },
  {
    path: "/style/",
    component: StyleFillColor,
  },
  {
    path: "/edit-custom-color/",
    component: CustomFillColor,
  },

  // Text

  {
    path: "/edit-text-fonts/",
    component: PageTextFonts,
  },
  {
    path: "/edit-text-font-color/",
    component: PageTextFontColor,
  },
  {
    path: "/edit-text-highlight-color/",
    component: PageTextHighlightColor,
  },
  {
    path: "/edit-text-custom-font-color/",
    component: PageTextCustomFontColor,
  },
  {
    path: "/edit-text-add-formatting/",
    component: PageTextAddFormatting,
  },
  {
    path: "/edit-bullets-and-numbers/",
    component: PageTextBulletsAndNumbers,
    routes: [
      {
        path: "image-link/",
        component: PageTextBulletsLinkSettings,
      },
    ],
  },
  {
    path: "/edit-text-direction/",
    component: PageTextDirection,
  },
  {
    path: "/edit-text-line-spacing/",
    component: PageTextLineSpacing,
  },

  // Shape
  {
    path: "/edit-style-shape/",
    component: PageShapeStyle,
  },
  {
    path: "/edit-style-shape-no-fill/",
    component: PageShapeStyleNoFill,
  },
  {
    path: "/edit-replace-shape/",
    component: PageReplaceContainer,
  },
  {
    path: "/edit-reorder-shape",
    component: PageReorderContainer,
  },
  {
    path: "/edit-align-shape/",
    component: PageAlignContainer,
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
    path: "/edit-shape-custom-fill-color/",
    component: PageShapeCustomFillColor,
  },
  {
    path: "/edit-text-shape-orientation/",
    component: PageOrientationTextShape,
  },

  // Image

  {
    path: "/edit-replace-image/",
    component: PageImageReplace,
  },
  {
    path: "/edit-reorder-image/",
    component: PageImageReorder,
  },
  {
    path: "/edit-align-image",
    component: PageImageAlign,
  },
  {
    path: "/edit-image-link/",
    component: PageLinkSettings,
  },

  // Table

  {
    path: "/edit-table-reorder/",
    component: PageTableReorder,
  },
  {
    path: "/edit-table-align/",
    component: PageTableAlign,
  },
  {
    path: "/edit-table-style/",
    component: PageTableStyle,
  },
  {
    path: "/edit-table-size/",
    component: PageTableSize,
  },
  {
    path: "/edit-table-style-options/",
    component: PageTableStyleOptions,
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
    path: "/edit-table-custom-fill-color/",
    component: PageTableCustomFillColor,
  },
  {
    path: "/edit-text-table-orientation/",
    component: PageOrientationTextTable,
  },

  // Chart

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
    path: "/edit-chart-reorder/",
    component: PageChartReorder,
  },
  {
    path: "/edit-chart-align/",
    component: PageChartAlign,
  },
  {
    path: "/edit-chart-border-color/",
    component: PageChartBorderColor,
  },
  {
    path: "/edit-chart-custom-border-color/",
    component: PageChartCustomBorderColor,
  },
  {
    path: "/edit-chart-custom-fill-color/",
    component: PageChartCustomFillColor,
  },

  // Link
  {
    path: "/edit-link/",
    component: EditLinkController,
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
    <Sheet id="edit-sheet" onSheetClosed={() => mainContext.closeOptions("edit")}>
      <View routes={routes} url="/editing-page/">
        <EditingPage />
      </View>
    </Sheet>
  )
}

export default EditView
