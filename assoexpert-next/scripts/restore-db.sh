#!/usr/bin/env bash
# ==============================================================================
# Lot 1 — Restauration d'une sauvegarde PostgreSQL chiffrée depuis S3 ou fichier local
# Usage : ./scripts/restore-db.sh <nom_archive_s3_ou_chemin_local.sql.gz.enc>
# ==============================================================================
set -euo pipefail

ARCHIVE_INPUT="${1:?Usage: ./scripts/restore-db.sh <archive.sql.gz.enc>}"
: "${DATABASE_URL:?Variable DATABASE_URL manquante}"
: "${BACKUP_ENCRYPTION_KEY:?Variable BACKUP_ENCRYPTION_KEY manquante}"

TMP_RESTORE="/tmp/restore-${RANDOM}.sql.gz.enc"

if [[ -f "${ARCHIVE_INPUT}" ]]; then
  cp "${ARCHIVE_INPUT}" "${TMP_RESTORE}"
else
  : "${S3_BUCKET:?Variable S3_BUCKET manquante}"
  : "${S3_ENDPOINT:?Variable S3_ENDPOINT manquante}"
  echo "[1/2] Téléchargement depuis s3://${S3_BUCKET}/backups/${ARCHIVE_INPUT}..."
  aws --endpoint-url "${S3_ENDPOINT}" s3 cp "s3://${S3_BUCKET}/backups/${ARCHIVE_INPUT}" "${TMP_RESTORE}"
fi

echo "[2/2] Déchiffrement AES-256-CBC et restauration dans PostgreSQL..."
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -in "${TMP_RESTORE}" \
  | gunzip \
  | psql "${DATABASE_URL}"

rm -f "${TMP_RESTORE}"
echo "✅ Restauration PostgreSQL terminée avec succès."

