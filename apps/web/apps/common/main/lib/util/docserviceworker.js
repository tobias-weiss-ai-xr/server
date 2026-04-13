;+(function registerServiceWorker() {
  if ("serviceWorker" in navigator && !(window.location.origin.lastIndexOf("file://", 0) === 0)) {
    const serviceWorkerName = "document_editor_service_worker.js"
    const serviceWorkerPath = `../../../../${serviceWorkerName}`
    let reg
    navigator.serviceWorker
      .register(serviceWorkerPath)
      .then((registration) => {
        reg = registration
        return navigator.serviceWorker.getRegistrations()
      })
      .then((registrations) => {
        //delete stale service workers
        // for (const registration of registrations) {
        for (const r in registrations) {
          const registration = registrations[r]
          if (
            registration !== reg &&
            registration.active &&
            registration.active.scriptURL.endsWith(serviceWorkerName)
          ) {
            registration.unregister()
          }
        }
      })
      .catch((err) => {
        console.error(`Registration failed with ${err}`)
      })
  }
})()
