# AssoExpert IA — Application Production (Next.js App Router)

> **Client :** Cabinet Maé / AKILIGUE SAS (Laetitia Badji)  
> **Architecture :** Zéro BaaS propriétaire — Next.js (Standalone), PostgreSQL 16 + Drizzle ORM, Valkey, Better Auth, Payload CMS, Stripe Billing, Anthropic SDK, GlitchTip, Umami, Uptime Kuma.

---

## 1. Démarrage local en moins de 15 minutes (Critère d'Acceptation Lot 1)

### Prérequis
- **Node.js 20+** et **npm 10+**
- **Docker** & **Docker Compose**

### Étape 1 — Cloner et configurer les variables d'environnement
```bash
cd assoexpert-next
cp .env.example .env.local
```

### Étape 2 — Lancer l'infrastructure locale (PostgreSQL 16, Valkey 8, Umami, Uptime Kuma)
```bash
docker compose up -d
```
- **PostgreSQL 16** : `localhost:5432` (schémas `public`, `payload`, `umami` créés automatiquement via `scripts/init-db.sql`)
- **Valkey 8** : `localhost:6379`
- **Umami Analytics** : `http://localhost:3001`
- **Uptime Kuma** : `http://localhost:3002`

### Étape 3 — Installer les dépendances et lancer le serveur de développement
```bash
npm install
npm run db:push
npm run dev
```
L'application est accessible sur **`http://localhost:3000`** :
- `/` : Site public indexé SEO (Landing page)
- `/login` : Connexion multi-tenant & accès démo
- `/onboarding` : Inscription & profilage association
- `/app` : Espace Association (`noindex`, Assistant IA 4 briques, Question Experte 48h, Profil, Abonnement)
- `/admin` : Back-office Payload CMS (`noindex`, Formules/Droits, Tickets Experts, Coûts IA)
- `/api/health` : Endpoint de santé pour Coolify / Uptime Kuma

---

## 2. Commandes de vérification & Qualité (CI)

| Commande | Description |
| :--- | :--- |
| `npm run typecheck` | Vérification TypeScript strict (`strict: true`, `noImplicitAny: true`) |
| `npm test` | Exécution des tests unitaires et d'isolation (Vitest) |
| `npm run check:secrets` | Vérifie qu'aucun secret serveur n'est exposé dans le code ou le bundle client |
| `npm run build` | Build de production Next.js (`output: standalone`) |

---

## 3. Sauvegardes chiffrées & Restauration (PostgreSQL ↔ S3)

### Sauvegarde automatique (`pg_dump` + AES-256 + rétention 30 jours)
```bash
./scripts/backup-db.sh
```

### Procédure de restauration testée (Préprod / Prod)
```bash
./scripts/restore-db.sh assoexpert-db-2026-10-28T02-00-00Z.sql.gz.enc
```

---

## 4. Procédure de mise à jour (Sécurité OS, PostgreSQL, Next.js)

1. Créer une branche dédiée et mettre à jour les dépendances (`npm update` / image Docker `postgres:16-alpine`).
2. Vérifier que la CI passe intégralement (`typecheck`, `test`, `check:secrets`, `build`).
3. Valider sur l'URL de **Preview Coolify** générée sur la Pull Request.
4. Déclencher une sauvegarde manuelle (`./scripts/backup-db.sh`) avant fusion sur `main`.
5. Fusionner sur `main` : Coolify déploie en zero-downtime via le healthcheck `/api/health`.

