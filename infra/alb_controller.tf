# IAM Role for the AWS Load Balancer Controller using IRSA
# This allows the controller pods to create/manage ALBs on your behalf.
# Uses the built-in attach_load_balancer_controller_policy flag — no external JSON file needed.

module "alb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${local.name}-alb-controller-role"

  # This flag inlines the correct AWS-managed ALB Controller IAM policy automatically
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    ex = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}

# Output the role ARN so we can use it in install-alb-controller.sh
output "alb_controller_role_arn" {
  value = module.alb_controller_irsa.iam_role_arn
}
