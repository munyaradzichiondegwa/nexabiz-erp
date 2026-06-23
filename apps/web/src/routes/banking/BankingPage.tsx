// MOD-05 – Banking
import { ModuleGuard } from "@/lib/module-guard";

export default function BankingPage() {
  return (
    <ModuleGuard moduleCode="MOD-05">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">Banking</h1>
        <p className="text-text-muted text-sm">MOD-05 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}