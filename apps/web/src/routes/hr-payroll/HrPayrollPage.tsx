// MOD-11 – HR & Payroll
import { ModuleGuard } from "@/lib/module-guard";

export default function HrPayrollPage() {
  return (
    <ModuleGuard moduleCode="MOD-11">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-4">HR & Payroll</h1>
        <p className="text-text-muted text-sm">MOD-11 – implementation in progress.</p>
      </div>
    </ModuleGuard>
  );
}