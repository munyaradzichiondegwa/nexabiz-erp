variable "env" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "databases" { type = list(string) }
variable "instance_class" {}
variable "multi_az" {}
variable "deletion_protection" {}

resource "aws_db_subnet_group" "nexabiz" {
  name       = "nexabiz-${var.env}"
  subnet_ids = var.subnet_ids
  tags       = { Name = "nexabiz-${var.env}-db-subnet-group" }
}

resource "aws_security_group" "rds" {
  name   = "nexabiz-${var.env}-rds-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_rds_cluster" "nexabiz" {
  cluster_identifier      = "nexabiz-${var.env}"
  engine                  = "aurora-postgresql"
  engine_version          = "16.2"
  database_name           = "postgres"
  master_username         = "nexabiz"
  master_password         = random_password.db_password.result
  db_subnet_group_name    = aws_db_subnet_group.nexabiz.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  deletion_protection     = var.deletion_protection
  backup_retention_period = var.env == "production" ? 30 : 7
  preferred_backup_window = "03:00-04:00"
  storage_encrypted       = true
  skip_final_snapshot     = var.env != "production"
  tags                    = { Name = "nexabiz-${var.env}", Env = var.env }
}

resource "aws_rds_cluster_instance" "nexabiz" {
  count               = var.multi_az ? 2 : 1
  identifier          = "nexabiz-${var.env}-${count.index + 1}"
  cluster_identifier  = aws_rds_cluster.nexabiz.id
  instance_class      = var.instance_class
  engine              = aws_rds_cluster.nexabiz.engine
  engine_version      = aws_rds_cluster.nexabiz.engine_version
  publicly_accessible = false
  performance_insights_enabled = var.env == "production"
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

output "cluster_endpoint" { value = aws_rds_cluster.nexabiz.endpoint }
output "db_password"      { value = random_password.db_password.result; sensitive = true }
