## Summary
<!-- What does this PR do? Why is it needed? -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature / module
- [ ] 🔧 Refactor / improvement
- [ ] 📖 Documentation
- [ ] 🏗️ Infrastructure / CI
- [ ] 🗃️ Database migration

## Modules Affected
<!-- Check all that apply -->
- [ ] MOD-03 POS
- [ ] MOD-04 Inventory
- [ ] MOD-05 Banking
- [ ] MOD-06 Accounting / GL
- [ ] MOD-07 Reporting
- [ ] MOD-08 AI
- [ ] MOD-09 Procurement
- [ ] MOD-10 CRM
- [ ] MOD-11 HR & Payroll
- [ ] MOD-13 Users
- [ ] Other: ___

## GL Impact
<!-- Does this PR affect GL postings? If yes, describe the posting rule change -->
- [ ] No GL impact
- [ ] GL posting rule added/modified (describe below)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manually tested in local dev environment
- [ ] DB migration tested (rollback verified if applicable)

## Checklist
- [ ] Code follows project conventions
- [ ] No secrets or credentials in code
- [ ] Double-entry balance enforced (DR = CR) for any GL changes
- [ ] Tenant isolation verified (tenant_id in all queries)
- [ ] API backwards-compatible or versioned
