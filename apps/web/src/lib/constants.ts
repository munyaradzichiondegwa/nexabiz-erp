export const MODULE_CODES = {
  AUTH:         'MOD-01',
  DASHBOARD:    'MOD-02',
  POS:          'MOD-03',
  INVENTORY:    'MOD-04',
  BANKING:      'MOD-05',
  ACCOUNTING:   'MOD-06',
  REPORTING:    'MOD-07',
  AI:           'MOD-08',
  PROCUREMENT:  'MOD-09',
  CRM:          'MOD-10',
  HR:           'MOD-11',
  BRANCHES:     'MOD-12',
  USERS:        'MOD-13',
  SETTINGS:     'MOD-14',
  BUDGETING:    'MOD-15',
  SALES_ORDERS: 'MOD-16',
  MANUFACTURING:'MOD-17',
  PROJECTS:     'MOD-18',
  WORKFLOWS:    'MOD-19',
  SERVICE:      'MOD-20',
} as const

export type ModuleCode = typeof MODULE_CODES[keyof typeof MODULE_CODES]

export const CORE_MODULES: ModuleCode[] = [
  MODULE_CODES.AUTH,
  MODULE_CODES.DASHBOARD,
  MODULE_CODES.ACCOUNTING,
  MODULE_CODES.REPORTING,
  MODULE_CODES.USERS,
  MODULE_CODES.SETTINGS,
]

export const API_VERSION = 'v1'
export const GL_EVENT_TOPICS = {
  SALES:        'nexabiz.sales.events',
  INVENTORY:    'nexabiz.inventory.events',
  BANKING:      'nexabiz.banking.events',
  PROCUREMENT:  'nexabiz.procurement.events',
  HR:           'nexabiz.hr.events',
  MANUFACTURING:'nexabiz.manufacturing.events',
  PROJECTS:     'nexabiz.project.events',
  ASSETS:       'nexabiz.asset.events',
  SERVICE:      'nexabiz.service.events',
  MODULE:       'nexabiz.module.registry',
} as const
