import { sdkBridge } from "@world-office/sdk-bridge"
import { useEffect, useState } from "react"

export interface PdfApi {
  getCountPages(): number
  getPageName(index: number): string
  goToPage(index: number): void
  asc_enableKeyEvents(enable: boolean): void
}

export function usePdfApi(): PdfApi | null {
  const [ready, setReady] = useState(sdkBridge.isReady)

  useEffect(() => {
    if (sdkBridge.isReady) {
      setReady(true)
      return
    }
    sdkBridge.initializeFromGlobals()
    const interval = setInterval(() => {
      if (sdkBridge.isReady) {
        setReady(true)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return ready ? sdkBridge as unknown as PdfApi : null
}
