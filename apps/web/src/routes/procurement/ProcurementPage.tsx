// MOD-09 – Procurement
import { ModuleGuard } from "@/lib/module-guard";

export default function ProcurementPage() {
  return (
    <ModuleGuard moduleCode="MOD-09">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Procurement</h1>
        <p className="text-text-muted text-sm">MOD-09 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}