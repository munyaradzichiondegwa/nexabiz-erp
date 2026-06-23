// MOD-16 – Quotes & Orders
import { ModuleGuard } from "@/lib/module-guard";

export default function QuotesPage() {
  return (
    <ModuleGuard moduleCode="MOD-16">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Quotes & Orders</h1>
        <p className="text-text-muted text-sm">MOD-16 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}