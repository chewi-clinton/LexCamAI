{{- define "indexing-worker.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "indexing-worker.labels" -}}
app.kubernetes.io/name: {{ include "indexing-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "indexing-worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "indexing-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
