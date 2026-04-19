export function isDesktop(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function getDesktopPlatform(): "windows" | "macos" | "linux" | "web" {
  if (!isDesktop()) return "web"
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("win")) return "windows"
  if (ua.includes("mac")) return "macos"
  return "linux"
}
