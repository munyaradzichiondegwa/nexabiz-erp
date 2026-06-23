// MOD-08 – AI Insights
import { ModuleGuard } from "@/lib/module-guard";

export default function AiInsightsPage() {
  return (
    <ModuleGuard moduleCode="MOD-08">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">AI Insights</h1>
        <p className="text-text-muted text-sm">MOD-08 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}