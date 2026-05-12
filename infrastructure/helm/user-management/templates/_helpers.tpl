{{/*
Expand the name of the chart.
*/}}
{{- define "user-management.name" -}}
{{- .Chart.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "user-management.labels" -}}
app.kubernetes.io/name: {{ include "user-management.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "user-management.selectorLabels" -}}
app.kubernetes.io/name: {{ include "user-management.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
