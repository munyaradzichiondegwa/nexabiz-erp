// MOD-13 – Users & Roles
import { ModuleGuard } from "@/lib/module-guard";

export default function UsersPage() {
  return (
    <ModuleGuard moduleCode="MOD-13">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Users & Roles</h1>
        <p className="text-text-muted text-sm">MOD-13 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}