/**
 * ModuleGuard — Gates a route/component behind a feature flag.
 * Modules can be toggled on/off per tenant from Settings > Module Manager.
 * See PRD Section 23.4.
 */
import { ReactNode } from "react";
import { useAppSelector } from "@/hooks/useAppStore";

interface Props { moduleCode: string; children: ReactNode; }

export function ModuleGuard({ moduleCode, children }: Props) {
  const enabled = useAppSelector((s) => s.modules.enabled[moduleCode] ?? true);
  if (!enabled) return (
    <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4">
      <p className="text-4xl">🔒</p>
      <p className="font-semibold">Module <code>{moduleCode}</code> is disabled.</p>
      <p className="text-sm">Enable it in <strong>Settings → Module Manager</strong>.</p>
    </div>
  );
  return <>{children}</>;
}