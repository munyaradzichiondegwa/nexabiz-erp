terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }

  backend "s3" {
    bucket         = "nexabiz-terraform-state"
    key            = "nexabiz/production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "nexabiz-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ───────────────────────────────────────────────────────────────────────
module "vpc" {
  source  = "./modules/vpc"
  env     = var.environment
  project = "nexabiz"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ── EKS Cluster ───────────────────────────────────────────────────────────────
module "eks" {
  source       = "./modules/eks"
  cluster_name = "nexabiz-${var.environment}"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
  node_groups = {
    system = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2
    }
    services = {
      instance_types = ["t3.large"]
      min_size       = 3
      max_size       = 15
      desired_size   = 3
    }
    ai = {
      instance_types = ["t3.xlarge"]
      min_size       = 1
      max_size       = 3
      desired_size   = 1
      taints = [{
        key    = "workload"
        value  = "ai"
        effect = "NO_SCHEDULE"
      }]
    }
  }
}

# ── RDS Aurora PostgreSQL ─────────────────────────────────────────────────────
module "rds" {
  source      = "./modules/rds"
  env         = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.database_subnet_ids
  databases   = [
    "nexabiz_auth", "nexabiz_accounting", "nexabiz_sales",
    "nexabiz_inventory", "nexabiz_hr", "nexabiz_crm",
    "nexabiz_banking", "nexabiz_procurement", "nexabiz_projects",
    "nexabiz_workflow", "nexabiz_config"
  ]
  instance_class    = var.environment == "production" ? "db.r6g.xlarge" : "db.t4g.medium"
  multi_az          = var.environment == "production"
  deletion_protection = var.environment == "production"
}

# ── Kafka (MSK) ───────────────────────────────────────────────────────────────
module "kafka" {
  source     = "./modules/kafka"
  env        = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  broker_count       = var.environment == "production" ? 3 : 1
  instance_type      = var.environment == "production" ? "kafka.m5.large" : "kafka.t3.small"
}

# ── Redis (ElastiCache) ───────────────────────────────────────────────────────
module "redis" {
  source     = "./modules/redis"
  env        = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  node_type  = var.environment == "production" ? "cache.r6g.large" : "cache.t4g.micro"
  num_nodes  = var.environment == "production" ? 2 : 1
}

# ── S3 Buckets ────────────────────────────────────────────────────────────────
module "s3" {
  source = "./modules/s3"
  env    = var.environment
  buckets = [
    "nexabiz-files",
    "nexabiz-reports",
    "nexabiz-backups",
    "nexabiz-terraform-state"
  ]
}

# ── HashiCorp Vault ───────────────────────────────────────────────────────────
module "vault" {
  source     = "./modules/vault"
  env        = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  cluster_id = module.eks.cluster_id
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "eks_cluster_endpoint"    { value = module.eks.cluster_endpoint }
output "rds_endpoint"            { value = module.rds.cluster_endpoint }
output "kafka_bootstrap_brokers" { value = module.kafka.bootstrap_brokers }
output "redis_endpoint"          { value = module.redis.endpoint }
output "vault_address"           { value = module.vault.address }
