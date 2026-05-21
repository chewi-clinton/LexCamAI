{{- define "lawyer-ingest-worker.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "lawyer-ingest-worker.labels" -}}
app.kubernetes.io/name: {{ include "lawyer-ingest-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "lawyer-ingest-worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lawyer-ingest-worker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
