variable "env" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "node_type" { default = "cache.t4g.micro" }
variable "num_nodes" { default = 1 }

resource "aws_elasticache_subnet_group" "nexabiz" {
  name       = "nexabiz-${var.env}"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "nexabiz" {
  replication_group_id = "nexabiz-${var.env}"
  description          = "NexaBiz Redis ${var.env}"
  node_type            = var.node_type
  num_cache_clusters   = var.num_nodes
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  subnet_group_name    = aws_elasticache_subnet_group.nexabiz.name
  automatic_failover_enabled  = var.num_nodes > 1
  tags                 = { Name = "nexabiz-${var.env}-redis", Env = var.env }
}

output "endpoint" { value = aws_elasticache_replication_group.nexabiz.primary_endpoint_address }
