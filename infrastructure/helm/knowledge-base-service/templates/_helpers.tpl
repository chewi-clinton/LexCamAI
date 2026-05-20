{{- define "knowledge-base-service.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "knowledge-base-service.labels" -}}
app.kubernetes.io/name: {{ include "knowledge-base-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "knowledge-base-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "knowledge-base-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
