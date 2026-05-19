{{- define "embedding-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "embedding-service.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- include "embedding-service.name" . -}}
{{- end -}}
{{- end -}}

{{- define "embedding-service.labels" -}}
app.kubernetes.io/name: {{ include "embedding-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
