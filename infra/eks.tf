module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${local.name}-eks"
  cluster_version = "1.35"

  enable_cluster_creator_admin_permissions = true
  cluster_endpoint_public_access           = true

  vpc_id     = module.vpc.vpc_id
  # Use public subnets (no private subnets, no NAT Gateway cost)
  subnet_ids = module.vpc.public_subnets

  # Single node group for all workloads - saves cost vs two separate groups
  eks_managed_node_group_defaults = {
    instance_types = ["t3.medium"]
  }

  eks_managed_node_groups = {
    general = {
      min_size     = 1
      max_size     = 3
      desired_size = 1  # Start with 1 node, scale up if needed

      instance_types = ["t3.medium"]
    }
  }

  # OIDC provider required for IRSA (IAM Roles for Service Accounts)
  enable_irsa = true

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}
