import { isDesktop } from "./platform"

export interface MenuEventPayload {
  action: string
}

export async function listenForMenuEvents(
  callback: (payload: MenuEventPayload) => void,
): Promise<() => void> {
  if (!isDesktop()) {
    return () => {}
  }
  const { listen } = await import("@tauri-apps/api/event")
  const unlisten = await listen<MenuEventPayload>("menu-event", (event) => {
    callback(event.payload)
  })
  return unlisten
}
