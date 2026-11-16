#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

key=$(grep '^RESEND_API_KEY=' .env | cut -d= -f2- | tr -d '"' || true)
if [ -z "$key" ]; then
  echo "Set RESEND_API_KEY in .env first." >&2
  exit 1
fi

run() { docker compose exec -T n8n sh -c "$1"; }

printf '[{"id":"lendloopResend01","name":"Resend API","type":"httpHeaderAuth","data":{"name":"Authorization","value":"Bearer %s"}}]' "$key" |
  run 'cat > /tmp/cred.json && n8n import:credentials --input=/tmp/cred.json; status=$?; rm -f /tmp/cred.json; exit $status'

for file in n8n/workflows/*.json; do
  run 'cat > /tmp/workflow.json && n8n import:workflow --input=/tmp/workflow.json && rm /tmp/workflow.json' < "$file"
done

for id in lendloopErrors01 lendloopNotify01 lendloopOverdue1; do
  run "n8n publish:workflow --id=$id"
done

docker compose restart n8n
echo "n8n is ready: credential imported, 3 workflows published."
