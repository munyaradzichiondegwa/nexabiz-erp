export const TOPICS = {
  SALES:         "nexabiz.sales.events",
  INVENTORY:     "nexabiz.inventory.events",
  BANKING:       "nexabiz.banking.events",
  HR:            "nexabiz.hr.events",
  GL_REQUESTS:   "nexabiz.gl.posting.requests",
  GL_RESULTS:    "nexabiz.gl.posting.results",
  MANUFACTURING: "nexabiz.manufacturing.events",
  PROJECTS:      "nexabiz.project.events",
  ASSETS:        "nexabiz.asset.events",
  SERVICE:       "nexabiz.service.events",
  MODULE:        "nexabiz.module.registry",
  NOTIFICATIONS: "nexabiz.notifications",
} as const

export type TopicName = typeof TOPICS[keyof typeof TOPICS]
