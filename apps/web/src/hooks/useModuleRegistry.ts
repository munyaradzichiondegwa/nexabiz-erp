import { useEffect } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import {
  fetchModuleStatus,
  selectActiveModuleCodes,
  selectModuleRegistryLoading,
  moduleActivated,
  moduleDeactivated,
} from '@/store/slices/moduleRegistrySlice'

export function useModuleRegistry() {
  const dispatch = useAppDispatch()
  const activeModules = useAppSelector(selectActiveModuleCodes)
  const isLoading = useAppSelector(selectModuleRegistryLoading)

  useEffect(() => {
    dispatch(fetchModuleStatus())
  }, [dispatch])

  // WebSocket listener for real-time module toggle updates (PRD Section 23.2)
  useEffect(() => {
    const handleModuleEvent = (event: CustomEvent<{ code: string; action: 'activated' | 'deactivated' }>) => {
      if (event.detail.action === 'activated') {
        dispatch(moduleActivated(event.detail.code))
      } else {
        dispatch(moduleDeactivated(event.detail.code))
      }
    }

    window.addEventListener('nexabiz:module-toggle' as any, handleModuleEvent)
    return () => window.removeEventListener('nexabiz:module-toggle' as any, handleModuleEvent)
  }, [dispatch])

  return { activeModules, isLoading }
}
