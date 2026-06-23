// MOD-03 – POS / Sales
import { ModuleGuard } from "@/lib/module-guard";

export default function PosPage() {
  return (
    <ModuleGuard moduleCode="MOD-03">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">POS / Sales</h1>
        <p className="text-text-muted text-sm">MOD-03 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}