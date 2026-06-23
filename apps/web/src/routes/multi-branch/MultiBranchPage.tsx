// MOD-12 – Multi-Branch
import { ModuleGuard } from "@/lib/module-guard";

export default function MultiBranchPage() {
  return (
    <ModuleGuard moduleCode="MOD-12">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Multi-Branch</h1>
        <p className="text-text-muted text-sm">MOD-12 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}