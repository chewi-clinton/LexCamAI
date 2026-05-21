pipeline {
  agent any

  triggers {
    githubPush()
  }

  environment {
    DOCKERHUB_REGISTRY = "chewiclinton"
    KUBECONFIG         = "/var/lib/jenkins/.kube/config"
    NAMESPACE          = "lexcam"
    PIP_CACHE_DIR      = "/var/jenkins_home/.pip-cache"
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
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('lawyer-service') {
          steps {
            dir('services/lawyer-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('document-service') {
          steps {
            dir('services/document-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('payment-service') {
          steps {
            dir('services/payment-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('rag-service') {
          steps {
            dir('services/rag-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('knowledge-base-service') {
          steps {
            dir('services/knowledge-base-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('notification-service') {
          steps {
            dir('services/notification-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('feedback-service') {
          steps {
            dir('services/feedback-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('admin-panel') {
          steps {
            dir('services/admin-panel') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('scraper-service') {
          steps {
            dir('services/scraper-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
            }
          }
        }
        stage('embedding-service') {
          steps {
            dir('services/embedding-service') {
              sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -q && .venv/bin/pytest --tb=short -q'
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
            'payment-service', 'admin-panel'
          ]
          def fastapi = [
            'rag-service', 'knowledge-base-service', 'embedding-service',
            'notification-service', 'feedback-service', 'scraper-service'
          ]

          services.each { svc ->
            dir("services/${svc}") {
              sh ".venv/bin/pytest --cov=apps --cov-report=term-missing --cov-fail-under=80 -q"
            }
          }
          fastapi.each { svc ->
            dir("services/${svc}") {
              sh ".venv/bin/pytest --cov=app --cov-report=term-missing --cov-fail-under=80 -q"
            }
          }
        }
      }
    }

    // ── Stage 4: Build Docker Images (main branch only) ────────────────────
    stage('Build') {
      when { expression { env.GIT_BRANCH == 'origin/main' } }
      steps {
        script {
          def tag = env.GIT_COMMIT[0..7]
          def services = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service', 'rag-service',
            'knowledge-base-service', 'embedding-service'
          ]
          def workers = [
            'doc-worker', 'notification-worker', 'indexing-worker', 'lawyer-ingest-worker'
          ]
          services.each { svc ->
            sh "docker build -t ${DOCKERHUB_REGISTRY}/${svc}:${tag} -t ${DOCKERHUB_REGISTRY}/${svc}:latest services/${svc}/"
          }
          workers.each { w ->
            sh "docker build -t ${DOCKERHUB_REGISTRY}/${w}:${tag} -t ${DOCKERHUB_REGISTRY}/${w}:latest workers/${w}/"
          }
          sh "docker build -t ${DOCKERHUB_REGISTRY}/frontend:${tag} -t ${DOCKERHUB_REGISTRY}/frontend:latest frontend/"
        }
      }
    }

    // ── Stage 5: Security Scan with Trivy (main branch only) ──────────────
    stage('Security Scan') {
      when { expression { env.GIT_BRANCH == 'origin/main' } }
      steps {
        script {
          def tag = env.GIT_COMMIT[0..7]
          def images = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service', 'rag-service',
            'knowledge-base-service', 'embedding-service',
            'doc-worker', 'notification-worker', 'indexing-worker', 'lawyer-ingest-worker',
            'frontend'
          ]
          images.each { img ->
            sh "trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress ${DOCKERHUB_REGISTRY}/${img}:${tag}"
          }
        }
      }
    }

    // ── Stage 7: Push to DockerHub (main branch only) ──────────────────────
    stage('Push') {
      when { expression { env.GIT_BRANCH == 'origin/main' } }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
          script {
            def tag = env.GIT_COMMIT[0..7]
            def images = [
              'user-management', 'lawyer-service', 'document-service',
              'payment-service', 'notification-service', 'feedback-service',
              'admin-panel', 'scraper-service', 'rag-service',
              'knowledge-base-service', 'embedding-service',
              'doc-worker', 'notification-worker', 'indexing-worker', 'lawyer-ingest-worker',
              'frontend'
            ]
            images.each { img ->
              sh "docker push ${DOCKERHUB_REGISTRY}/${img}:${tag}"
              sh "docker push ${DOCKERHUB_REGISTRY}/${img}:latest"
            }
          }
        }
      }
    }

    // ── Stage 8: Deploy via Helm (main branch only) ────────────────────────
    stage('Deploy') {
      when { expression { env.GIT_BRANCH == 'origin/main' } }
      steps {
        script {
          def tag = env.GIT_COMMIT[0..7]
          def charts = [
            [chart: 'user-management',        release: 'user-management'],
            [chart: 'lawyer-service',          release: 'lawyer-service'],
            [chart: 'document-service',        release: 'document-service'],
            [chart: 'payment-service',         release: 'payment-service'],
            [chart: 'notification-service',    release: 'notification-service'],
            [chart: 'feedback-service',        release: 'feedback-service'],
            [chart: 'admin-panel',             release: 'admin-panel'],
            [chart: 'scraper-service',         release: 'scraper-service'],
            [chart: 'rag-service',             release: 'rag-service'],
            [chart: 'knowledge-base-service',  release: 'knowledge-base-service'],
            [chart: 'embedding-service',       release: 'embedding-service'],
            [chart: 'doc-worker',              release: 'doc-worker'],
            [chart: 'notification-worker',     release: 'notification-worker'],
            [chart: 'indexing-worker',         release: 'indexing-worker'],
            [chart: 'lawyer-ingest-worker',    release: 'lawyer-ingest-worker'],
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

    // ── Stage 9: Health Check (main branch only) ───────────────────────────
    stage('Health Check') {
      when { expression { env.GIT_BRANCH == 'origin/main' } }
      steps {
        script {
          def deployments = [
            'user-management', 'lawyer-service', 'document-service',
            'payment-service', 'notification-service', 'feedback-service',
            'admin-panel', 'scraper-service', 'rag-service',
            'knowledge-base-service', 'embedding-service',
            'doc-worker', 'notification-worker', 'indexing-worker', 'lawyer-ingest-worker'
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
