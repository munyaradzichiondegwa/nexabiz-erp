variable "env" {}
variable "project" {}
variable "cidr" {}
variable "azs" { type = list(string) }

locals {
  private_subnets  = [for i, az in var.azs : cidrsubnet(var.cidr, 8, i)]
  public_subnets   = [for i, az in var.azs : cidrsubnet(var.cidr, 8, i + 10)]
  database_subnets = [for i, az in var.azs : cidrsubnet(var.cidr, 8, i + 20)]
}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "${var.project}-${var.env}-vpc", Project = var.project, Env = var.env }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project}-${var.env}-igw" }
}

resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.private_subnets[count.index]
  availability_zone = var.azs[count.index]
  tags              = { Name = "${var.project}-${var.env}-private-${count.index + 1}", "kubernetes.io/role/internal-elb" = "1" }
}

resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = local.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project}-${var.env}-public-${count.index + 1}", "kubernetes.io/role/elb" = "1" }
}

resource "aws_subnet" "database" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.database_subnets[count.index]
  availability_zone = var.azs[count.index]
  tags              = { Name = "${var.project}-${var.env}-db-${count.index + 1}" }
}

output "vpc_id"              { value = aws_vpc.main.id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "public_subnet_ids"  { value = aws_subnet.public[*].id }
output "database_subnet_ids" { value = aws_subnet.database[*].id }
