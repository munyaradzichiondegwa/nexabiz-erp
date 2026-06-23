// MOD-18 – Projects
import { ModuleGuard } from "@/lib/module-guard";

export default function ProjectsPage() {
  return (
    <ModuleGuard moduleCode="MOD-18">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Projects</h1>
        <p className="text-text-muted text-sm">MOD-18 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}