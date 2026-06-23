// MOD-17 – Manufacturing
import { ModuleGuard } from "@/lib/module-guard";

export default function ManufacturingPage() {
  return (
    <ModuleGuard moduleCode="MOD-17">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Manufacturing</h1>
        <p className="text-text-muted text-sm">MOD-17 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}