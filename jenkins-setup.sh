#!/bin/bash
# Jenkins EC2 UserData Setup Script (Amazon Linux 2023)
# Paste this into the "User data" field when launching your Jenkins EC2 instance.

# 1. Update system & install dependencies
dnf update -y
dnf install -y git wget java-17-amazon-corretto docker

# 2. Setup Jenkins Repo & Install
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
dnf install -y jenkins

# 3. Start & Enable Services
systemctl enable jenkins
systemctl start jenkins

systemctl enable docker
systemctl start docker

# Add Jenkins user to Docker group so it can build images
usermod -a -G docker jenkins
systemctl restart jenkins

# 4. Install kubectl
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.0/2024-05-12/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/local/bin/kubectl

# 5. Extract initial admin password to a file in ec2-user's home for easy access
sleep 30
cp /var/lib/jenkins/secrets/initialAdminPassword /home/ec2-user/jenkins-password.txt
chown ec2-user:ec2-user /home/ec2-user/jenkins-password.txt

echo "Setup complete! Jenkins is running on port 8080."
echo "Your initial admin password is saved in ~/jenkins-password.txt"
