pipeline {
    agent any

    environment {
        // --- CONFIGURE THESE VARIABLES ---
        AWS_REGION   = "us-east-1"
        AWS_ACCOUNT_ID = "215648180190" // Replace with your 12-digit ID
        PROJECT_NAME = "marketmind"
        
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG    = "${GIT_COMMIT[0..7]}" // Uses the first 8 characters of Git commit hash
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test & Lint') {
            parallel {
                stage('Frontend') {
                    steps {
                        echo "Building React app to ensure it compiles..."
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
                stage('Backend') {
                    steps {
                        echo "Running Backend Tests (Skipped in this MVP pipeline, add pytest here later)"
                        // sh 'cd backend_fastapi && pip install -r requirements.txt && pytest'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Frontend Image..."
                    sh "docker build -t ${ECR_REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG} -f Dockerfile.frontend ."

                    echo "Building Auth API Image..."
                    sh "docker build -t ${ECR_REGISTRY}/${PROJECT_NAME}/auth-api:${IMAGE_TAG} -f server/Dockerfile ./server"

                    echo "Building ML API Image..."
                    sh "docker build -t ${ECR_REGISTRY}/${PROJECT_NAME}/ml-api:${IMAGE_TAG} -f backend_fastapi/Dockerfile ./backend_fastapi"
                }
            }
        }

        stage('Push to AWS ECR') {
            steps {
                script {
                    // Login to ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                    echo "Pushing images to ECR..."
                    sh "docker push ${ECR_REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${PROJECT_NAME}/auth-api:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${PROJECT_NAME}/ml-api:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                script {
                    // Update kubeconfig (Ensures Jenkins can talk to EKS)
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${PROJECT_NAME}-prod-eks"

                    // Apply the namespace first
                    sh "kubectl apply -f k8s/namespace.yaml"

                    // Use sed to inject the dynamic IMAGE_TAG into the deployment YAMLs
                    // and apply them to the cluster
                    
                    echo "Deploying Frontend..."
                    sh "sed 's/\\\$${'\{'}IMAGE_TAG${'\}'}/${IMAGE_TAG}/g; s/\\\$${'\{'}AWS_ACCOUNT_ID${'\}'}/${AWS_ACCOUNT_ID}/g; s/\\\$${'\{'}AWS_REGION${'\}'}/${AWS_REGION}/g' k8s/frontend/deployment.yaml | kubectl apply -f -"
                    
                    echo "Deploying Auth API..."
                    sh "sed 's/\\\$${'\{'}IMAGE_TAG${'\}'}/${IMAGE_TAG}/g; s/\\\$${'\{'}AWS_ACCOUNT_ID${'\}'}/${AWS_ACCOUNT_ID}/g; s/\\\$${'\{'}AWS_REGION${'\}'}/${AWS_REGION}/g' k8s/auth-api/deployment.yaml | kubectl apply -f -"
                    
                    echo "Deploying ML API..."
                    sh "sed 's/\\\$${'\{'}IMAGE_TAG${'\}'}/${IMAGE_TAG}/g; s/\\\$${'\{'}AWS_ACCOUNT_ID${'\}'}/${AWS_ACCOUNT_ID}/g; s/\\\$${'\{'}AWS_REGION${'\}'}/${AWS_REGION}/g' k8s/ml-api/deployment.yaml | kubectl apply -f -"

                    echo "Deploying Ingress Engine..."
                    sh "kubectl apply -f k8s/ingress/alb-ingress.yaml"
                    
                    echo "Deployment applied! Kubernetes is rolling out the new pods."
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
            // Cleanup local docker images to save space on Jenkins server
            sh "docker image prune -a -f"
        }
        success {
            echo "SUCCESS: The deployment completed."
        }
        failure {
            echo "FAILURE: The build or deployment failed. Check the logs."
        }
    }
}
