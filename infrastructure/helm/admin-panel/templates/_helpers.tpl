{{- define "admin-panel.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "admin-panel.labels" -}}
app.kubernetes.io/name: {{ include "admin-panel.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "admin-panel.selectorLabels" -}}
app.kubernetes.io/name: {{ include "admin-panel.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
