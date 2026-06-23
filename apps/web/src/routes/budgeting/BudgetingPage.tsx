// MOD-15 – Budgeting
import { ModuleGuard } from "@/lib/module-guard";

export default function BudgetingPage() {
  return (
    <ModuleGuard moduleCode="MOD-15">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Budgeting</h1>
        <p className="text-text-muted text-sm">MOD-15 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}