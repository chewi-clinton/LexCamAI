{{/*
Expand the name of the chart.
*/}}
{{- define "document-service.name" -}}
{{- .Chart.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "document-service.labels" -}}
app.kubernetes.io/name: {{ include "document-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "document-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "document-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
