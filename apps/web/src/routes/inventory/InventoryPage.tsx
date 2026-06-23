// MOD-04 – Inventory
import { ModuleGuard } from "@/lib/module-guard";

export default function InventoryPage() {
  return (
    <ModuleGuard moduleCode="MOD-04">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Inventory</h1>
        <p className="text-text-muted text-sm">MOD-04 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}