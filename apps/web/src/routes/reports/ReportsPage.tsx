// MOD-07 – Reports
import { ModuleGuard } from "@/lib/module-guard";

export default function ReportsPage() {
  return (
    <ModuleGuard moduleCode="MOD-07">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Reports</h1>
        <p className="text-text-muted text-sm">MOD-07 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}