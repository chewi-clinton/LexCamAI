pipeline {
  agent any

  environment {
    GHCR_REGISTRY = "ghcr.io/chewi-clinton/lexcamai"
    KUBECONFIG    = "/var/lib/jenkins/.kube/config"
    NAMESPACE     = "lexcam"
  }

  stages {

    // ── Stage 1: Checkout ──────────────────────────────────────────────────
    stage('Checkout') {
      steps {
        checkout scm
        echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT[0..7]}"
      }
    }

    // ── Stage 2: Test (parallel per service) ───────────────────────────────
    stage('Test') {
      parallel {
        stage('user-management') {
          steps {
            dir('services/user-management') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('lawyer-service') {
          steps {
            dir('services/lawyer-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('document-service') {
          steps {
            dir('services/document-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('payment-service') {
          steps {
            dir('services/payment-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('rag-service') {
          steps {
            dir('services/rag-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('knowledge-base-service') {
          steps {
            dir('services/knowledge-base-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('notification-service') {
          steps {
            dir('services/notification-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('feedback-service') {
          steps {
            dir('services/feedback-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('admin-panel') {
          steps {
            dir('services/admin-panel') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('scraper-service') {
          steps {
            dir('services/scraper-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
        stage('embedding-service') {
          steps {
            dir('services/embedding-service') {
              sh 'pip install -r requirements.txt -q'
              sh 'pytest --tb=short -q'
            }
          }
        }
      }
    }

    // ── Stage 3: Coverage Check ────────────────────────────────────────────
    stage('Coverage') {
      steps {
        script {
          def services = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service'
          ]
          def fastapi = ['rag-service', 'knowledge-base-service', 'embedding-service']

          services.each { svc ->
            dir("services/${svc}") {
              sh "pytest --cov=apps --cov-report=term-missing --cov-fail-under=80 -q"
            }
          }
          fastapi.each { svc ->
            dir("services/${svc}") {
              sh "pytest --cov=app --cov-report=term-missing --cov-fail-under=80 -q"
            }
          }
        }
      }
    }

    // ── Stage 4: Build Docker Images ───────────────────────────────────────
    stage('Build') {
      steps {
        script {
          def tag = env.GIT_COMMIT[0..7]
          def services = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service', 'rag-service',
            'knowledge-base-service', 'embedding-service'
          ]
          services.each { svc ->
            sh "docker build -t ${GHCR_REGISTRY}/${svc}:${tag} -t ${GHCR_REGISTRY}/${svc}:latest services/${svc}/"
          }
          sh "docker build -t ${GHCR_REGISTRY}/frontend:${tag} -t ${GHCR_REGISTRY}/frontend:latest frontend/"
        }
      }
    }

    // ── Stage 5: Push to GitHub Container Registry ─────────────────────────
    stage('Push') {
      steps {
        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
          sh "echo ${GHCR_TOKEN} | docker login ghcr.io -u chewi-clinton --password-stdin"
          script {
            def tag = env.GIT_COMMIT[0..7]
            def images = [
              'user-management', 'lawyer-service', 'document-service',
              'payment-service', 'notification-service', 'feedback-service',
              'admin-panel', 'scraper-service', 'rag-service',
              'knowledge-base-service', 'embedding-service', 'frontend'
            ]
            images.each { img ->
              sh "docker push ${GHCR_REGISTRY}/${img}:${tag}"
              sh "docker push ${GHCR_REGISTRY}/${img}:latest"
            }
          }
        }
      }
    }

    // ── Stage 6: Deploy via Helm ───────────────────────────────────────────
    stage('Deploy') {
      steps {
        script {
          def tag = env.GIT_COMMIT[0..7]
          def charts = [
            [chart: 'user-management',       release: 'user-management'],
            [chart: 'lawyer-service',         release: 'lawyer-service'],
            [chart: 'document-service',       release: 'document-service'],
            [chart: 'payment-service',        release: 'payment-service'],
            [chart: 'notification-service',   release: 'notification-service'],
            [chart: 'feedback-service',       release: 'feedback-service'],
            [chart: 'admin-panel',            release: 'admin-panel'],
            [chart: 'scraper-service',        release: 'scraper-service'],
            [chart: 'rag-service',            release: 'rag-service'],
            [chart: 'knowledge-base-service', release: 'knowledge-base-service'],
            [chart: 'embedding-service',      release: 'embedding-service'],
          ]
          charts.each { c ->
            sh """
              helm upgrade --install ${c.release} infrastructure/helm/${c.chart} \
                --namespace ${NAMESPACE} \
                --set image.tag=${tag} \
                --wait --timeout 120s
            """
          }
        }
      }
    }

    // ── Stage 7: Health Check ──────────────────────────────────────────────
    stage('Health Check') {
      steps {
        script {
          def deployments = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service', 'rag-service',
            'knowledge-base-service', 'embedding-service'
          ]
          deployments.each { d ->
            sh "kubectl rollout status deployment/${d} -n ${NAMESPACE} --timeout=90s"
          }
          sh "kubectl get pods -n ${NAMESPACE}"
        }
      }
    }

  }

  post {
    success {
      echo "Pipeline passed — all ${env.GIT_COMMIT[0..7]} images deployed to K3s."
    }
    failure {
      echo "Pipeline FAILED at stage: ${env.STAGE_NAME}. Check logs above."
    }
  }
}
