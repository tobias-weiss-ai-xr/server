import { Popover, Sheet, View, f7 } from "framework7-react"
import React, { useEffect } from "react"
import { Device } from "../../../utils/device"
import SharingSettingsController from "../../controller/SharingSettings"
import {
  ViewCommentsController,
  ViewCommentsSheetsController,
} from "../../controller/collaboration/Comments"
import { ReviewChangeController, ReviewController } from "../../controller/collaboration/Review"
import { CollaborationPage } from "../../pages/CollaborationPage"
import UsersPage from "../../pages/UsersPage"
import { PageDisplayMode } from "./Review"

const routes = [
  {
    path: "/collaboration-page/",
    component: CollaborationPage,
    keepAlive: true,
  },
  {
    path: "/users/",
    component: UsersPage,
  },
  {
    path: "/review/",
    component: ReviewController,
  },
  {
    path: "/cm-review/",
    component: ReviewController,
    options: {
      props: {
        noBack: true,
      },
    },
  },
  {
    path: "/display-mode/",
    component: PageDisplayMode,
  },
  {
    path: "/review-change/",
    component: ReviewChangeController,
  },
  {
    path: "/cm-review-change/",
    component: ReviewChangeController,
    options: {
      props: {
        noBack: true,
      },
    },
  },
  {
    path: "/comments/",
    asyncComponent: () =>
      window.editorType === "sse" ? ViewCommentsSheetsController : ViewCommentsController,
    options: {
      props: {
        allComments: true,
      },
    },
  },
  {
    path: "/sharing-settings/",
    component: SharingSettingsController,
  },
]

routes.forEach((route) => {
  route.options = {
    ...route.options,
    transition: "f7-push",
  }
})

const CollaborationView = (props) => {
  useEffect(() => {
    if (Device.phone) {
      f7.sheet.open(".coauth__sheet")
    } else {
      f7.popover.open("#coauth-popover", "#btn-coauth")
    }
  }, [])

  const initUrl = props.showOptions ? `/${props.showOptions}/` : "/collaboration-page/"

  return !Device.phone ? (
    <Popover
      id="coauth-popover"
      className="popover__titled"
      onPopoverClosed={() => props.closeOptions("coauth")}
      closeByOutsideClick={false}
    >
      <View style={{ height: "430px" }} routes={routes} url={initUrl}>
        <CollaborationPage />
      </View>
    </Popover>
  ) : (
    <Sheet className="coauth__sheet" onSheetClosed={() => props.closeOptions("coauth")}>
      <View routes={routes} url={initUrl}>
        <CollaborationPage />
      </View>
    </Sheet>
  )
}

export default CollaborationView
