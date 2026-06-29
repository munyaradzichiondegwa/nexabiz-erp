/**
 * NexaBiz PWA Service Worker
 * Provides offline capability for POS terminal and field workers (PRD Section 5.1)
 * Strategy: Network-first for API, Cache-first for static assets
 */

const CACHE_NAME = "nexabiz-v3.1.0"
const OFFLINE_URL = "/offline.html"

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
]

// ── Install: pre-cache static assets ────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching static assets")
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API, cache-first for assets ────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // API calls: network-first, no cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Offline — request queued for sync" }),
          { headers: { "Content-Type": "application/json" }, status: 503 }
        )
      })
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL)
        }
      })
    })
  )
})

// ── Background Sync: queue POS sales when offline ───────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pos-sales") {
    event.waitUntil(syncPOSSales())
  }
})

async function syncPOSSales() {
  const db = await openDB()
  const pendingSales = await db.getAll("pending-sales")

  for (const sale of pendingSales) {
    try {
      await fetch("/api/v1/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sale.token}` },
        body: JSON.stringify(sale.payload),
      })
      await db.delete("pending-sales", sale.id)
      console.log("[SW] Synced offline sale:", sale.id)
    } catch (err) {
      console.error("[SW] Sync failed for sale:", sale.id, err)
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("nexabiz-offline", 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("pending-sales", { keyPath: "id" })
    }
    req.onsuccess = (e) => resolve({
      getAll: (store) => new Promise((res) => {
        const tx = e.target.result.transaction(store, "readonly")
        tx.objectStore(store).getAll().onsuccess = (ev) => res(ev.target.result)
      }),
      delete: (store, id) => new Promise((res) => {
        const tx = e.target.result.transaction(store, "readwrite")
        tx.objectStore(store).delete(id).onsuccess = res
      }),
    })
    req.onerror = reject
  })
}

// ── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? "NexaBiz", {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-96x96.png",
      data: data.url,
      tag: data.tag ?? "nexabiz",
      renotify: true,
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data))
  }
})
