locals {
  services = toset(["frontend", "auth-api", "ml-api"])
}

resource "aws_ecr_repository" "app" {
  for_each             = local.services
  name                 = "${var.project}/${each.key}"
  image_tag_mutability = "MUTABLE" # Jenkins pushes with Git SHA tags, MUTABLE helps override if testing manually
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
