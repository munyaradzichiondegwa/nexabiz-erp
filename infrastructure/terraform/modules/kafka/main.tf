variable "env" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "broker_count" { default = 1 }
variable "instance_type" { default = "kafka.t3.small" }

resource "aws_msk_cluster" "nexabiz" {
  cluster_name           = "nexabiz-${var.env}"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = var.broker_count

  broker_node_group_info {
    instance_type  = var.instance_type
    client_subnets = slice(var.subnet_ids, 0, var.broker_count)
    storage_info {
      ebs_storage_info {
        volume_size = var.env == "production" ? 500 : 100
      }
    }
  }

  encryption_info { encryption_in_transit { client_broker = "TLS" } }
  tags = { Name = "nexabiz-${var.env}-kafka", Env = var.env }
}

output "bootstrap_brokers" { value = aws_msk_cluster.nexabiz.bootstrap_brokers_tls }
