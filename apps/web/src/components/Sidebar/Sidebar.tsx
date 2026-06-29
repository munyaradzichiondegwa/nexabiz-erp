import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Building2, BookOpen,
  BarChart3, Brain, ShoppingBag, Users, UserCog, Settings,
  PieChart, FileText, Wrench, FolderKanban, GitBranch,
  Headphones, Network, ChevronLeft, ChevronRight, CreditCard,
} from 'lucide-react'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { selectSidebarOpen, selectSidebarCollapsed, toggleSidebarCollapsed } from '@/store/slices/uiSlice'
import { selectActiveModuleCodes } from '@/store/slices/moduleRegistrySlice'
import { cn } from '@/utils/cn'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  moduleCode: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',      icon: LayoutDashboard, moduleCode: 'MOD-02' },
  { label: 'POS Terminal',    path: '/pos',            icon: ShoppingCart,    moduleCode: 'MOD-03' },
  { label: 'Inventory',       path: '/inventory',      icon: Package,         moduleCode: 'MOD-04' },
  { label: 'Banking',         path: '/banking',        icon: Building2,       moduleCode: 'MOD-05' },
  { label: 'Accounting',      path: '/accounting',     icon: BookOpen,        moduleCode: 'MOD-06' },
  { label: 'Reports',         path: '/reporting',      icon: BarChart3,       moduleCode: 'MOD-07' },
  { label: 'AI Insights',     path: '/ai',             icon: Brain,           moduleCode: 'MOD-08' },
  { label: 'Procurement',     path: '/procurement',    icon: ShoppingBag,     moduleCode: 'MOD-09' },
  { label: 'CRM',             path: '/crm',            icon: Users,           moduleCode: 'MOD-10' },
  { label: 'HR & Payroll',    path: '/hr',             icon: UserCog,         moduleCode: 'MOD-11' },
  { label: 'Branches',        path: '/branches',       icon: Network,         moduleCode: 'MOD-12' },
  { label: 'Users & Roles',   path: '/users',          icon: UserCog,         moduleCode: 'MOD-13' },
  { label: 'Settings',        path: '/settings',       icon: Settings,        moduleCode: 'MOD-14' },
  { label: 'Budgeting',       path: '/budgeting',      icon: PieChart,        moduleCode: 'MOD-15' },
  { label: 'Sales Orders',    path: '/sales-orders',   icon: FileText,        moduleCode: 'MOD-16' },
  { label: 'Manufacturing',   path: '/manufacturing',  icon: Wrench,          moduleCode: 'MOD-17' },
  { label: 'Projects',        path: '/projects',       icon: FolderKanban,    moduleCode: 'MOD-18' },
  { label: 'Workflows',       path: '/workflows',      icon: GitBranch,       moduleCode: 'MOD-19' },
  { label: 'Service',         path: '/service',        icon: Headphones,      moduleCode: 'MOD-20' },
]

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(selectSidebarOpen)
  const isCollapsed = useAppSelector(selectSidebarCollapsed)
  const activeModules = useAppSelector(selectActiveModuleCodes)

  const visibleItems = NAV_ITEMS.filter((item) => activeModules.includes(item.moduleCode as any))

  if (!isOpen) return null

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main Navigation"
    >
      {/* Logo */}
      <div className="flex h-[var(--header-height)] items-center border-b px-4">
        {!isCollapsed && (
          <span className="text-xl font-bold text-primary">NexaBiz</span>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-primary mx-auto">N</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation">
        <ul className="space-y-1" role="list">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    isCollapsed && 'justify-center px-2'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
