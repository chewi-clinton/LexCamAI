{{/*
Expand the name of the chart.
*/}}
{{- define "lawyer-service.name" -}}
{{- .Chart.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "lawyer-service.labels" -}}
app.kubernetes.io/name: {{ include "lawyer-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "lawyer-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lawyer-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
