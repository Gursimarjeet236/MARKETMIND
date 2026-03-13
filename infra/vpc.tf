terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {}

locals {
  name     = "${var.project}-${var.environment}"
  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 2) # 2 AZs is enough, saves cost
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-vpc"
  cidr = local.vpc_cidr

  azs            = local.azs
  public_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k)]

  # No private subnets, no NAT Gateway — saves ~$32+/month
  enable_nat_gateway   = false
  single_nat_gateway   = false
  enable_dns_hostnames = true

  # RDS subnet group using separate public CIDR ranges
  create_database_subnet_group       = true
  create_database_subnet_route_table = true
  database_subnets                   = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 10)]

  # Tag for EKS AWS Load Balancer Controller to discover subnets
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
}
