// MOD-14 – Settings
import { ModuleGuard } from "@/lib/module-guard";

export default function SettingsPage() {
  return (
    <ModuleGuard moduleCode="MOD-14">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Settings</h1>
        <p className="text-text-muted text-sm">MOD-14 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}