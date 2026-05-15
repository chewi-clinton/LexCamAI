{{- define "notification-worker.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "notification-worker.labels" -}}
app.kubernetes.io/name: {{ include "notification-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "notification-worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "notification-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
