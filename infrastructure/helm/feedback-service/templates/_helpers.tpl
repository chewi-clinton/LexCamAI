{{- define "feedback-service.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "feedback-service.labels" -}}
app.kubernetes.io/name: {{ include "feedback-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "feedback-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "feedback-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
