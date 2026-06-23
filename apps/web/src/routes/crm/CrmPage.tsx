// MOD-10 – CRM
import { ModuleGuard } from "@/lib/module-guard";

export default function CrmPage() {
  return (
    <ModuleGuard moduleCode="MOD-10">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">CRM</h1>
        <p className="text-text-muted text-sm">MOD-10 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}