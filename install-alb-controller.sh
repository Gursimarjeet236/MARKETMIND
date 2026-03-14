#!/bin/bash
# install-alb-controller.sh
# Run this ONCE after `terraform apply` to install the ALB Ingress Controller
# on your EKS cluster WITHOUT using Helm.
#
# Prerequisites:
#   - kubectl configured to point at your EKS cluster
#   - aws CLI configured
#   - Replace ALB_ROLE_ARN below with the output from `terraform output alb_controller_role_arn`

set -e

ALB_ROLE_ARN="arn:aws:iam::215648180190:role/marketmind-prod-alb-controller-role"
CLUSTER_NAME="marketmind-prod-eks"
AWS_REGION="us-east-1"

echo "==> Step 1: Creating the ALB controller ServiceAccount with the IAM role annotation..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: ${ALB_ROLE_ARN}
EOF

echo "==> Step 2: Downloading and applying the official ALB Controller YAML manifest..."
# This is the official manifest published by AWS — no Helm required
kubectl apply \
  --validate=false \
  -f https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/latest/download/v2_8_1_full.yaml

echo "==> Step 3: Patching the controller deployment with your cluster name..."
kubectl patch deployment aws-load-balancer-controller \
  -n kube-system \
  --type='json' \
  -p="[{\"op\": \"replace\", \"path\": \"/spec/template/spec/containers/0/args/0\", \"value\": \"--cluster-name=${CLUSTER_NAME}\"}]"

echo ""
echo "==> Done! Waiting for controller to become ready..."
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system

echo "==> ALB Ingress Controller is installed and running."
echo "==> You can now apply your K8s manifests:"
echo "    kubectl apply -f k8s/"
