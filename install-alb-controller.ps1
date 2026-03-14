# install-alb-controller.ps1
# Run this ONCE after `terraform apply` to install the ALB Ingress Controller
# on your EKS cluster WITHOUT using Helm.
#
# Prerequisites:
#   - kubectl (Windows) installed and in your PATH
#   - aws CLI installed and configured
#   - You must have run: aws eks update-kubeconfig --region us-east-1 --name marketmind-prod-eks

$ALB_ROLE_ARN = "arn:aws:iam::215648180190:role/marketmind-prod-alb-controller-role"
$CLUSTER_NAME = "marketmind-prod-eks"
$AWS_REGION = "us-east-1"

Write-Host "==> Step 1: Creating the ALB controller ServiceAccount with the IAM role annotation..." -ForegroundColor Cyan
$saYaml = @"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: $($ALB_ROLE_ARN)
"@
$saYaml | kubectl apply -f -

Write-Host "`n==> Step 2: Downloading and applying the official ALB Controller YAML manifest..." -ForegroundColor Cyan
# This is the official manifest published by AWS
kubectl apply --validate=false -f https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/latest/download/v2_8_1_full.yaml

Write-Host "`n==> Step 3: Patching the controller deployment with your cluster name..." -ForegroundColor Cyan
# Using a slightly different approach for PowerShell to ensure string escaping works
kubectl patch deployment aws-load-balancer-controller -n kube-system --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args/0", "value": "--cluster-name=' + $CLUSTER_NAME + '"}]'

Write-Host "`n==> Done! Waiting for controller to become ready..." -ForegroundColor Green
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system

Write-Host "`n==> ALB Ingress Controller is installed and running." -ForegroundColor Green
Write-Host "==> You can now apply your K8s manifests:"
Write-Host "    kubectl apply -f k8s/namespace.yaml"
Write-Host "    kubectl apply -f k8s/"
