/**
 * ModuleGuard — PRD Section 23.4
 * Gates any route/component behind a module feature flag.
 * Reads from Redux store (synced from API on login).
 * Inactive modules show an upgrade page — bundle not downloaded.
 */
import { ReactNode } from "react"
import { useAppSelector } from "@/hooks/useAppSelector"
import { selectActiveModuleCodes } from "@/store/slices/moduleRegistrySlice"
import { ModuleNotActivePage } from "@/routes/ModuleNotActivePage"

interface Props { moduleCode: string; children: ReactNode }

export function ModuleGuard({ moduleCode, children }: Props) {
  const active = useAppSelector(selectActiveModuleCodes)
  if (!active.includes(moduleCode)) {
    return <ModuleNotActivePage moduleCode={moduleCode} />
  }
  return <>{children}</>
}
