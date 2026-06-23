// MOD-19 – Approvals
import { ModuleGuard } from "@/lib/module-guard";

export default function ApprovalsPage() {
  return (
    <ModuleGuard moduleCode="MOD-19">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Approvals</h1>
        <p className="text-text-muted text-sm">MOD-19 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}