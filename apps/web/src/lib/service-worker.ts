export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      reg.addEventListener('updatefound', () => {
        const w = reg.installing
        if (w) w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('sw-update-available'))
          }
        })
      })
    } catch (err) {
      console.error('[NexaBiz SW]', err)
    }
  }
}
