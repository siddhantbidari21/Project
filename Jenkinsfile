pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "siddhantbidari21/frontend:latest"
        BACKEND_IMAGE  = "siddhantbidari21/backend:latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/siddhantbidari21/Project.git',
                    credentialsId: 'github-credentials'
            }
        }

        stage('Build & Push Docker Images') {
            parallel {
                stage('Build & Push Frontend') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                                def frontendImage = docker.build(FRONTEND_IMAGE, './frontend')
                                frontendImage.push()
                            }
                        }
                    }
                }

                stage('Build & Push Backend') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                                def backendImage = docker.build(BACKEND_IMAGE, './backend')
                                backendImage.push()
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([string(credentialsId: 'kubeconfig-text', variable: 'KUBECONFIG_CONTENT')]) {
                    sh """
                        echo "$KUBECONFIG_CONTENT" > /tmp/kubeconfig
                        export KUBECONFIG=/tmp/kubeconfig
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl rollout restart deployment/frontend
                        kubectl rollout restart deployment/backend
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check Jenkins logs."
        }
    }
}
