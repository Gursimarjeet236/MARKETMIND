resource "aws_s3_bucket" "models" {
  bucket = "${local.name}-ml-models"
  force_destroy = true # for easy cleanup of dev envs
}

resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration {
    status = "Enabled"
  }
}

# IAM Role for Service Account (IRSA) for ML API Pods
# This allows the ML API pods to securely read from the S3 bucket without hardcoded keys
module "vpc_cni_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${local.name}-ml-api-s3-role"
  
  oidc_providers = {
    ex = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["marketmind:ml-api-sa"]
    }
  }

  role_policy_arns = {
    s3_read = aws_iam_policy.s3_read.arn
  }
}

resource "aws_iam_policy" "s3_read" {
  name        = "${local.name}-ml-s3-read-policy"
  description = "Allows reading ML models from S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.models.arn,
          "${aws_s3_bucket.models.arn}/*"
        ]
      }
    ]
  })
}
