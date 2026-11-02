#!/usr/bin/env node
/**
 * Lot 1 — Critère d'Acceptation (CA) :
 * "aucun secret n'apparaît dans le bundle client (vérification incluse dans la CI)"
 *
 * Ce script inspecte :
 * 1. Le code source client ("use client") pour interdire tout accès aux variables serveur.
 * 2. Le dossier .next/static (si présent après `next build`) pour détecter toute fuite
 *    de clé secrète (sk-ant-*, sk_live_*, whsec_*, DATABASE_URL, etc.).
 */

import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_SECRET_PATTERNS = [
  { name: 'Anthropic API Key', regex: /sk-ant-api\d{2}-[A-Za-z0-9\-_]{10,}/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: 'Stripe Webhook Secret', regex: /whsec_[A-Za-z0-9]{16,}/ },
  { name: 'Postgres Connection String', regex: /postgresql:\/\/[^:]+:[^@]+@[^/\s]+\/[A-Za-z0-9_-]+/ },
  { name: 'Exposed NEXT_PUBLIC Secret Name', regex: /NEXT_PUBLIC_(ANTHROPIC|STRIPE_SECRET|DATABASE_URL|BETTER_AUTH_SECRET|PAYLOAD_SECRET|S3_SECRET|SMTP_PASS)/ }
];

const SERVER_ONLY_ENV_NAMES = [
  'ANTHROPIC_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'PAYLOAD_SECRET',
  'S3_SECRET_ACCESS_KEY',
  'SMTP_PASS',
  'BACKUP_ENCRYPTION_KEY'
];

function walkFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, fileList);
    } else if (/\.(js|mjs|ts|tsx|json)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export function scanContentForSecrets(content, isClientSource = false) {
  const findings = [];
  for (const pattern of FORBIDDEN_SECRET_PATTERNS) {
    if (pattern.regex.test(content)) {
      findings.push(`Motif secret interdit détecté : ${pattern.name}`);
    }
  }
  if (isClientSource) {
    for (const envName of SERVER_ONLY_ENV_NAMES) {
      const envRegex = new RegExp(`process\\.env\\.${envName}\\b`);
      if (envRegex.test(content)) {
        findings.push(`Variable serveur utilisée dans un composant client : process.env.${envName}`);
      }
    }
  }
  return findings;
}

function main() {
  const rootDir = process.cwd();
  const srcFiles = walkFiles(path.join(rootDir, 'src'));
  const staticFiles = walkFiles(path.join(rootDir, '.next', 'static'));

  const errors = [];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const isClient = content.includes("'use client'") || content.includes('"use client"');
    const issues = scanContentForSecrets(content, isClient);
    for (const issue of issues) {
      errors.push(`[SRC] ${path.relative(rootDir, file)} -> ${issue}`);
    }
  }

  for (const file of staticFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const issues = scanContentForSecrets(content, true);
    for (const issue of issues) {
      errors.push(`[BUNDLE] ${path.relative(rootDir, file)} -> ${issue}`);
    }
  }

  if (errors.length > 0) {
    console.error('❌ ÉCHEC DE VÉRIFICATION DES SECRETS CLIENT :');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(`✅ Vérification sécurité réussie (${srcFiles.length} fichiers sources, ${staticFiles.length} chunks statiques inspectés) : aucun secret exposé.`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-bundle-secrets.mjs')) {
  main();
}

