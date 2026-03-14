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

$ALB_ROLE_ARN = "arn:aws:iam::215648180190:role/marketmind-prod-alb-controller-role"
$CLUSTER_NAME = "marketmind-prod-eks"
$AWS_REGION = "us-east-1"

Write-Host "==> Step 0: Cleaning up existing/stuck installation components..." -ForegroundColor Yellow
# Delete the webhooks first to break any deadlock loops
kubectl delete mutatingwebhookconfiguration aws-load-balancer-webhook 2>$null
kubectl delete validatingwebhookconfiguration aws-load-balancer-webhook 2>$null
kubectl delete mutatingwebhookconfiguration cert-manager-webhook 2>$null
kubectl delete validatingwebhookconfiguration cert-manager-webhook 2>$null

# Delete existing deployments if they are stuck
kubectl delete deployment aws-load-balancer-controller -n kube-system 2>$null

Write-Host "==> Step 1: Installing cert-manager (v1.15.3)..." -ForegroundColor Cyan
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.3/cert-manager.yaml

Write-Host "Waiting 30s for cert-manager pods to initialize..."
Start-Sleep -Seconds 30
kubectl rollout status deployment/cert-manager-webhook -n cert-manager --timeout=120s

Write-Host "`n==> Step 2: Creating the ALB controller ServiceAccount..." -ForegroundColor Cyan
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

Write-Host "`n==> Step 3: Applying ALB Controller v3.1.0 manifest..." -ForegroundColor Cyan
kubectl apply --validate=false -f https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v3.1.0/v3_1_0_full.yaml

Write-Host "`n==> Step 4: Patching the controller with cluster name: $CLUSTER_NAME..." -ForegroundColor Cyan
# Add the cluster-name argument to the beginning of the list
kubectl patch deployment aws-load-balancer-controller -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/0", "value": "--cluster-name=' + $CLUSTER_NAME + '"}]'

Write-Host "`n==> Done! Waiting for controller rollout..." -ForegroundColor Green
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system --timeout=180s

Write-Host "`n==> ALB Ingress Controller is ready." -ForegroundColor Green
Write-Host "==> You can now check your ingress address:"
Write-Host "    kubectl get ingress -n marketmind"
