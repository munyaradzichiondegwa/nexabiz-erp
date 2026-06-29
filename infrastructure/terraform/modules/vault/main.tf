variable "env" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "cluster_id" {}

# In production, Vault runs inside Kubernetes via the official Helm chart
# This module manages the Vault cluster via Helm
resource "helm_release" "vault" {
  name       = "vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  version    = "0.28.0"
  namespace  = "vault"
  create_namespace = true

  set { name = "server.ha.enabled"; value = var.env == "production" ? "true" : "false" }
  set { name = "server.ha.replicas"; value = var.env == "production" ? "3" : "1" }
  set { name = "server.auditStorage.enabled"; value = "true" }
  set { name = "injector.enabled"; value = "true" }
  set { name = "ui.enabled"; value = "true" }
}

output "address" { value = "http://vault.vault.svc.cluster.local:8200" }
