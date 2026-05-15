{{- define "doc-worker.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "doc-worker.labels" -}}
app.kubernetes.io/name: {{ include "doc-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "doc-worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "doc-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
