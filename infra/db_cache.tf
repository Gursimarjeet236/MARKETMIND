# RDS Security Group — allows access from EKS nodes only
resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-rds-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS PostgreSQL Instance (db.t3.micro is free-tier eligible)
resource "aws_db_instance" "postgres" {
  identifier        = "${local.name}-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "marketmind"
  username = "mmadmin"
  password = var.db_password

  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Placed in the DB subnet group (public CIDR, but security group locked)
  publicly_accessible = false
  skip_final_snapshot = true

  # Free-tier: no multi-AZ, no read replicas
  multi_az               = false
  deletion_protection    = false
}

# Redis / ElastiCache REMOVED to save cost (~$15-30/month)
# Add it back later if you need caching for predictions.
