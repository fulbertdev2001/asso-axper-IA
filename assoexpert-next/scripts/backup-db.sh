#!/usr/bin/env bash
# ==============================================================================
# Lot 1 — Sauvegarde PostgreSQL automatisée et chiffrée vers S3 (OVH / Scaleway)
# Rétention : 30 jours (§4 du ticket cadre)
# ==============================================================================
set -euo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
BACKUP_FILENAME="assoexpert-db-${TIMESTAMP}.sql.gz.enc"
TMP_PATH="/tmp/${BACKUP_FILENAME}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

: "${DATABASE_URL:?Variable DATABASE_URL manquante}"
: "${BACKUP_ENCRYPTION_KEY:?Variable BACKUP_ENCRYPTION_KEY manquante}"
: "${S3_BUCKET:?Variable S3_BUCKET manquante}"
: "${S3_ENDPOINT:?Variable S3_ENDPOINT manquante}"

echo "[1/3] Dump PostgreSQL + compression gzip + chiffrement AES-256-CBC..."
pg_dump "${DATABASE_URL}" --no-owner --no-acl --clean --if-exists \
  | gzip -9 \
  | openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -out "${TMP_PATH}"

echo "[2/3] Envoi de ${BACKUP_FILENAME} vers s3://${S3_BUCKET}/backups/..."
aws --endpoint-url "${S3_ENDPOINT}" s3 cp "${TMP_PATH}" "s3://${S3_BUCKET}/backups/${BACKUP_FILENAME}"
rm -f "${TMP_PATH}"

echo "[3/3] Purge des sauvegardes de plus de ${RETENTION_DAYS} jours..."
CUTOFF_DATE=$(date -u -d "-${RETENTION_DAYS} days" +"%Y-%m-%d" 2>/dev/null || date -u -v-"${RETENTION_DAYS}"d +"%Y-%m-%d")
aws --endpoint-url "${S3_ENDPOINT}" s3 ls "s3://${S3_BUCKET}/backups/" | while read -r line; do
  FILE_DATE=$(echo "$line" | awk '{print $1}')
  FILE_NAME=$(echo "$line" | awk '{print $4}')
  if [[ -n "${FILE_NAME}" && "${FILE_DATE}" < "${CUTOFF_DATE}" ]]; then
    echo "Suppression de l'archive expirée : ${FILE_NAME}"
    aws --endpoint-url "${S3_ENDPOINT}" s3 rm "s3://${S3_BUCKET}/backups/${FILE_NAME}"
  fi
done

echo "✅ Sauvegarde chiffrée terminée avec succès : ${BACKUP_FILENAME}"

