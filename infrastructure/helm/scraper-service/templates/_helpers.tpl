{{- define "scraper-service.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "scraper-service.labels" -}}
app.kubernetes.io/name: {{ include "scraper-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "scraper-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "scraper-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
