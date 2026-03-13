variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "marketmind"
}

variable "environment" {
  description = "Environment name (e.g., prod)"
  type        = string
}

variable "db_password" {
  description = "RDS Postgres Password"
  type        = string
  sensitive   = true
}
