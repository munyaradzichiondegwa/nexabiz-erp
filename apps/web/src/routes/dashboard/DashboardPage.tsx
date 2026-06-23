// MOD-02 – Dashboard
import { ModuleGuard } from "@/lib/module-guard";

export default function DashboardPage() {
  return (
    <ModuleGuard moduleCode="MOD-02">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Dashboard</h1>
        <p className="text-text-muted text-sm">MOD-02 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}