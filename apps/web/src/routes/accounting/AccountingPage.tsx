// MOD-06 – Accounting
import { ModuleGuard } from "@/lib/module-guard";

export default function AccountingPage() {
  return (
    <ModuleGuard moduleCode="MOD-06">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Accounting</h1>
        <p className="text-text-muted text-sm">MOD-06 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}