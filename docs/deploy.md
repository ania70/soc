# Deployment Specification for AI-Assisted Project Deployment

## 1. Purpose

This document defines the deployment architecture and requirements for projects created during the workshop.

The goal is to allow an AI coding agent to take a project repository containing source code and automatically:

1. Containerize the application.
2. Create a Helm chart.
3. Build the Docker image.
4. Push the image to GitHub Container Registry (GHCR).
5. Deploy the application to Kubernetes.
6. Use the Git commit SHA as the immutable image version.
7. Make the deployment reproducible and easy to update.

The participant does **not** need to understand Docker, Kubernetes, Helm, or CI/CD. The AI agent should implement the required files and configuration based on this specification.

---

# 2. Target Architecture

The expected architecture is:

```text
GitHub Repository
       │
       │ git push
       ▼
GitHub Actions
       │
       ├── Install dependencies
       ├── Run tests (if applicable)
       ├── Build Docker image
       │
       ▼
GitHub Container Registry
       │
       │ ghcr.io/<owner>/<repository>:<commit-sha>
       ▼
GitHub Actions
       │
       │ Helm
       ▼
Kubernetes Cluster
       │
       ├── Deployment
       ├── Service
       └── Ingress (if required)
```

The repository should contain both the application source code and its Helm chart.

---

# 3. Repository Structure

The AI agent should create or maintain the following structure:

```text
project/
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── Dockerfile
├── .dockerignore
│
├── helm/
│   └── <application-name>/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── ingress.yaml
│           └── _helpers.tpl
│
└── <application source code>
```

The AI agent may add additional Helm templates when required, for example:

```text
configmap.yaml
secret.yaml
serviceaccount.yaml
hpa.yaml
pvc.yaml
```

However, it should avoid unnecessary Kubernetes resources.

---

# 4. Containerization Requirements

The AI agent must create a production-appropriate `Dockerfile` based on the detected application technology.

Examples:

* Node.js → Node.js base image
* Python → Python base image
* Go → multi-stage Go build
* Java → JDK/JRE or appropriate runtime image
* .NET → ASP.NET runtime image
* Static frontend → build stage + Nginx or equivalent

The Docker image should:

* Use a suitable official base image.
* Avoid running the application as root when practical.
* Use a multi-stage build when appropriate.
* Only contain files required to run the application.
* Expose the application's actual listening port.
* Define a suitable startup command.

The AI agent must inspect the application before deciding the Docker configuration.

---

# 5. Docker Image Naming

Docker images must be stored in GitHub Container Registry.

The image name must follow:

```text
ghcr.io/<github-owner>/<repository>
```

For example:

```text
ghcr.io/example-org/my-app
```

The image must be tagged using the full Git commit SHA:

```text
ghcr.io/example-org/my-app:<commit-sha>
```

Example:

```text
ghcr.io/example-org/my-app:8f3a91c7e6d2...
```

The commit SHA is the primary deployment version.

---

# 6. Image Tagging Strategy

The deployment must use an immutable tag.

Preferred:

```text
${GITHUB_SHA}
```

Avoid using:

```text
latest
```

as the deployment version.

The following tags may optionally be created for convenience:

```text
main
develop
```

However, Kubernetes deployments must use the commit SHA.

For example:

```text
ghcr.io/example-org/my-app:8f3a91c7...
```

not:

```text
ghcr.io/example-org/my-app:latest
```

This makes rollback and debugging much easier.

---

# 7. Helm Chart

The AI agent must create a Helm chart under:

```text
helm/<application-name>/
```

The chart must contain a `Chart.yaml`.

Example:

```yaml
apiVersion: v2

name: my-app

description: Helm chart for my-app

type: application

version: 0.1.0

appVersion: "1.0.0"
```

---

# 8. Helm Versioning

There are two different versions in Helm and they must not be confused.

### Chart version

```yaml
version: 0.1.0
```

This represents the version of the Helm chart itself.

It should be changed when the chart structure or behavior changes.

### Application version

```yaml
appVersion: "1.0.0"
```

This represents the application version as metadata.

It is **not** the Docker image tag.

Do not use `appVersion` as the mechanism for selecting the Docker image.

The actual image version must be stored in:

```yaml
image:
  tag: ...
```

or supplied to Helm through:

```bash
--set image.tag=...
```

---

# 9. Helm Values

The default `values.yaml` should contain:

```yaml
replicaCount: 1

image:
  repository: ghcr.io/example-org/my-app
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources: {}
```

The exact values must be adapted to the application.

The AI agent must determine:

* Application port
* Service port
* Container port
* Required environment variables
* Health check endpoints
* Resource requirements
* Whether an Ingress is required

---

# 10. Image Configuration

The Deployment must construct the image from Helm values.

Example:

```yaml
containers:
  - name: my-app
    image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
    imagePullPolicy: {{ .Values.image.pullPolicy }}
```

The image repository and tag must **not** be hard-coded in the Deployment template.

---

# 11. Kubernetes Deployment

The Helm chart must create a Kubernetes `Deployment`.

A minimal deployment should contain:

```text
Deployment
 └── Pod
      └── Container
           └── Application
```

The Deployment should include:

* Configurable replica count.
* Image repository.
* Image tag.
* Container port.
* Environment variables when required.
* Resource requests/limits when known.
* Readiness probe when applicable.
* Liveness probe when applicable.

Example:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: {{ include "my-app.fullname" . }}

spec:
  replicas: {{ .Values.replicaCount }}

  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}

  template:
    metadata:
      labels:
        {{- include "my-app.selectorLabels" . | nindent 8 }}

    spec:
      containers:
        - name: my-app

          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

          imagePullPolicy: {{ .Values.image.pullPolicy }}

          ports:
            - containerPort: 8080
```

The actual port must be determined from the application.

---

# 12. Kubernetes Service

The Helm chart should create a Kubernetes `Service`.

Default:

```yaml
service:
  type: ClusterIP
  port: 80
```

The Service should route traffic to the application's container port.

Example:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: {{ include "my-app.fullname" . }}

spec:
  type: {{ .Values.service.type }}

  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}

  selector:
    {{- include "my-app.selectorLabels" . | nindent 4 }}
```

---

# 13. Ingress

Create an Ingress only if the application needs to be accessible from outside the Kubernetes cluster.

The hostname should be configurable through Helm values.

Example:

```yaml
ingress:
  enabled: true

  className: nginx

  host: my-app.example.com

  tls:
    enabled: false
```

The AI agent must not invent a real production hostname.

If no hostname is provided, the AI should either:

* disable Ingress, or
* use a configurable placeholder and clearly mark it for the workshop administrator to configure.

---

# 14. GitHub Actions

The AI agent must create:

```text
.github/workflows/deploy.yml
```

The workflow should:

1. Checkout the repository.
2. Authenticate with GHCR.
3. Build the Docker image.
4. Push the image to GHCR.
5. Configure Kubernetes access.
6. Run Helm upgrade/install.
7. Wait for the Kubernetes rollout to complete.

The general workflow is:

```text
Checkout
   ↓
Build
   ↓
Push Image
   ↓
Configure Kubernetes
   ↓
Helm Upgrade
   ↓
Wait for Rollout
```

---

# 15. GitHub Actions Permissions

The workflow must request the minimum required permissions.

For GHCR:

```yaml
permissions:
  contents: read
  packages: write
```

The workflow must use the built-in:

```text
GITHUB_TOKEN
```

for GHCR authentication whenever possible.

Example:

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

---

# 16. Building and Pushing the Image

The workflow should build and push:

```text
ghcr.io/${{ github.repository }}:${{ github.sha }}
```

Example:

```yaml
- name: Build and push image
  uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

The AI agent may use Docker Buildx or another appropriate build mechanism.

---

# 17. Kubernetes Authentication

Kubernetes credentials must never be committed to the repository.

The recommended workshop setup is to provide the Kubernetes credentials through GitHub Actions Secrets.

For example:

```text
KUBE_CONFIG
```

The secret should contain the Kubernetes configuration required by Helm and `kubectl`.

The workflow can configure it with:

```bash
mkdir -p ~/.kube
echo "$KUBE_CONFIG" | base64 -d > ~/.kube/config
```

The exact authentication mechanism may be changed if the workshop infrastructure uses another secure method.

---

# 18. Required GitHub Secrets

The AI agent should document the following required secret:

```text
KUBE_CONFIG
```

No Docker registry password should be required for GHCR when using:

```text
GITHUB_TOKEN
```

Additional application secrets must be stored separately and must never be committed to Git.

---

# 19. Helm Deployment

The workflow should deploy using:

```bash
helm upgrade --install
```

Example:

```bash
helm upgrade --install my-app \
  ./helm/my-app \
  --namespace my-app \
  --create-namespace \
  --set image.repository=ghcr.io/${{ github.repository }} \
  --set image.tag=${{ github.sha }} \
  --wait \
  --timeout 5m
```

The image tag must come from:

```text
GITHUB_SHA
```

The workflow must not modify `values.yaml` on every deployment.

---

# 20. Why `values.yaml` Should Not Be Modified Automatically

The preferred deployment model is:

```text
values.yaml
      +
--set image.tag=<commit-sha>
      ↓
Helm
      ↓
Kubernetes
```

rather than:

```text
Build
 ↓
Modify values.yaml
 ↓
Git commit
 ↓
Push
 ↓
Deploy
```

This avoids:

* CI-generated commits.
* Commit loops.
* Noisy Git history.
* Race conditions between pipelines.
* Unnecessary repository changes.

---

# 21. Kubernetes Image Pull Authentication

If the GHCR package is private, Kubernetes needs permission to pull the image.

An `imagePullSecret` should be configured.

Example Helm values:

```yaml
imagePullSecrets:
  - name: ghcr-secret
```

Deployment:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        {{- toYaml .Values.imagePullSecrets | nindent 8 }}
```

The actual `ghcr-secret` must be created in Kubernetes by the workshop administrator.

The secret must not be committed to Git.

---

# 22. Secrets

Never commit secrets such as:

```text
passwords
API keys
tokens
private keys
database credentials
Kubernetes credentials
GHCR credentials
```

into:

```text
values.yaml
```

or any other repository file.

If an application requires secrets, use Kubernetes Secrets or an external secret-management solution.

For a workshop, Kubernetes Secrets can be used as a simple starting point.

---

# 23. Environment Variables

Non-sensitive configuration may be stored in Helm values.

Example:

```yaml
env:
  - name: API_URL
    value: "https://api.example.com"
```

Sensitive values must not be stored this way.

The AI agent should distinguish between:

```text
configuration
```

and:

```text
secrets
```

---

# 24. Health Checks

If the application exposes a health endpoint such as:

```text
/health
```

the AI agent should configure:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080

livenessProbe:
  httpGet:
    path: /health
    port: 8080
```

If no health endpoint exists, the AI agent should not invent one.

It may use an appropriate TCP probe or omit the probe.

---

# 25. Deployment Strategy

Kubernetes should use its default rolling update behavior unless the application requires something else.

The goal is:

```text
Old Pods
   ↓
New Pods start
   ↓
New Pods become Ready
   ↓
Old Pods terminate
```

The workflow must wait for the rollout:

```bash
kubectl rollout status deployment/my-app \
  --namespace my-app \
  --timeout=5m
```

If the rollout fails, the GitHub Actions job must fail.

---

# 26. Rollback

Because every image is tagged with its Git commit SHA, rollback is straightforward.

For example:

```text
Version A
commit: 111aaa

Version B
commit: 222bbb

Version C
commit: 333ccc
```

If version C is broken, the deployment can be changed back to:

```text
222bbb
```

The Helm release history should also be preserved.

---

# 27. Development and Production

If the workshop requires multiple environments, use separate Helm values files:

```text
helm/my-app/
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
└── values-prod.yaml
```

For example:

```bash
helm upgrade --install my-app \
  ./helm/my-app \
  -f ./helm/my-app/values-prod.yaml \
  --set image.tag=${GITHUB_SHA}
```

Recommended flow:

```text
Pull Request
     ↓
Build + Test
     ↓
Merge to develop
     ↓
Deploy Development
     ↓
Merge to main
     ↓
Deploy Production
```

Production deployment may optionally require manual approval.

---

# 28. AI Agent Responsibilities

When this document is provided to an AI coding agent, the agent should:

### Inspect first

Before creating files, inspect:

* Existing source code.
* Programming language.
* Framework.
* Existing package manager.
* Existing Dockerfile.
* Application startup command.
* Application port.
* Existing CI/CD configuration.
* Existing deployment configuration.

### Then create or modify

```text
Dockerfile
.dockerignore
.github/workflows/deploy.yml

helm/<application-name>/
├── Chart.yaml
├── values.yaml
└── templates/
```

### Then validate

The AI agent should run, where available:

```bash
docker build .
```

and:

```bash
helm lint ./helm/<application-name>
```

and:

```bash
helm template my-app ./helm/<application-name>
```

The generated Kubernetes YAML should be checked for obvious errors.

---

# 29. Important Rules for the AI Agent

The AI agent must follow these rules:

1. **Do not invent application ports.** Inspect the application first.
2. **Do not invent startup commands.** Determine the correct command from the project.
3. **Do not commit secrets.**
4. **Do not use `latest` as the production deployment version.**
5. **Use `GITHUB_SHA` as the immutable image tag.**
6. **Do not use Helm `appVersion` as the image version.**
7. **Keep the Docker image and Helm chart in the same repository.**
8. **Do not modify `values.yaml` for every deployment.**
9. **Use `--set image.tag=${GITHUB_SHA}` during deployment.**
10. **Use GHCR for image storage.**
11. **Use GitHub Actions for CI/CD.**
12. **Fail the workflow if the Kubernetes rollout fails.**
13. **Use configurable Helm values instead of hard-coding environment-specific configuration.**
14. **Create only the Kubernetes resources actually required by the application.**
15. **Prefer simple solutions suitable for a beginner-friendly workshop.**

---

# 30. Expected Result

After implementation, a participant should only need to do:

```bash
git add .
git commit -m "Add my application"
git push
```

Then GitHub Actions should automatically perform:

```text
                 Git Push
                    │
                    ▼
             GitHub Actions
                    │
             ┌──────┴──────┐
             │             │
          Build          Test
             │
             ▼
        Docker Image
             │
             ▼
           GHCR
             │
             │
             ▼
           Helm
             │
             ▼
        Kubernetes
             │
             ▼
        Running App
```

The final deployed image should be identifiable by its Git commit:

```text
ghcr.io/<owner>/<repository>:<GITHUB_SHA>
```

This provides a simple, reproducible, and traceable deployment model without requiring workshop participants to understand the underlying Kubernetes or CI/CD infrastructure.
