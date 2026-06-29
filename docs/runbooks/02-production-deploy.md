# Production Deployment Runbook

## Overview
NexaBiz deploys via GitHub Actions → Docker image build → Helm upgrade on Kubernetes.

## Deployment Flow
1. Push to `develop` → CI tests → Deploy to **staging**
2. PR to `main` → CI tests → Manual approval → Deploy to **production**
3. Blue/green deployment via Helm with automatic smoke test
4. Rollback: `helm rollback nexabiz [revision]` within 5 minutes of deployment

## Pre-deployment Checklist
- [ ] All CI tests passing
- [ ] Database migrations reviewed
- [ ] Environment secrets updated in Vault
- [ ] Runbook for any breaking changes prepared
- [ ] Rollback plan confirmed

## Manual Production Deploy
```bash
# Tag release
git tag v3.1.0 && git push --tags

# Deploy specific version
helm upgrade nexabiz ./infrastructure/kubernetes/helm/nexabiz-web \
  --namespace nexabiz-production \
  --set global.imageTag=v3.1.0 \
  --set env=production \
  --wait --timeout=15m
```

## Database Migrations
```bash
# Run via workflow_dispatch in GitHub Actions
# OR manually:
export AUTH_DB_URL="postgresql://..."
node scripts/migrate.js
```

## Rollback
```bash
helm history nexabiz -n nexabiz-production
helm rollback nexabiz [REVISION] -n nexabiz-production --wait
```

## Health Checks
```bash
# Check all pods
kubectl get pods -n nexabiz-production

# Check service logs
kubectl logs -n nexabiz-production -l component=gl-service -f

# Run smoke test
curl -f https://app.nexabiz.com/health
```
