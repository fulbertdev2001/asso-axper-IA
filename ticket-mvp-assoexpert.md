# [MVP] AssoExpert IA — Ticket cadre développeur

| | |
|---|---|
| **Client** | Cabinet Maé / AKILIGUE SAS — porteuse : Laetitia Badji |
| **Chef de projet** | Glenn (DevPeth) — interlocuteur unique du développeur |
| **Sources** | CDC v1 (juin 2026) + CDC v2 (compléments). **En cas de conflit, la v2 prime.** |
| **Découpage** | 1 ticket cadre (ce document) + 6 lots livrables séparément (§7) |
| **Première action attendue** | Répondre selon le §9 **avant d'écrire du code** |

> ⚠️ Les fichiers `assoexpert-landing.html` et `asso-assistant-ia.html` sont des **maquettes d'intention** (charte, ambiance, parcours). Ce ne sont ni un prototype ni une base de code. Rien de leur logique ne doit être repris. En particulier, ne pas reprendre l'appel à l'API Claude depuis le navigateur, les quotas en `localStorage`, les prix ou les textes marketing.

---

## 1. Le projet en bref

AssoExpert IA est un **SaaS d'assistance experte pour les associations françaises employeuses** (1 à 100 salariés : médico-social, animation, insertion, culture). Il couvre quatre domaines :

- RH et conventions collectives (CCN66, CCN51, Éclat, ALISFA…) ;
- gouvernance (loi 1901, AG, CA, statuts) ;
- finance et subventions ;
- conformité (DUERP, affichages, RGPD).

Le service repose sur deux niveaux :
1. un **assistant IA** contextualisé à l'association et aux domaines débloqués par l'abonnement ;
2. une **escalade vers une experte humaine** (question traitée sous 48h par Laetitia Badji).

L'acquisition passe principalement par le **SEO**. Le site public fait donc partie du produit dès le MVP.

Il s'agit d'un produit autonome, distinct de PilotAsso (outil de pilotage financier de la même cliente). Aucune intégration avec PilotAsso n'est prévue au MVP.

## 2. Définition du MVP « viable »

Le MVP est atteint quand une association peut réaliser le parcours complet suivant, en production :

1. Elle découvre le site via une page publique indexée.
2. Elle crée un compte et renseigne le profil de son association.
3. Elle souscrit un abonnement et paie.
4. Elle interroge l'IA, qui tient compte de son profil (CCN, taille, secteur) et de ses droits.
5. Elle escalade une question à l'experte dans la limite de son quota.
6. Elle gère ou résilie son abonnement seule.

Côté cliente, Laetitia doit pouvoir **modifier les prix, les quotas, les droits et les pages SEO sans intervention du développeur**.

## 3. Principes d'architecture (non négociables — anti-dette)

La v2 annonce de nombreuses évolutions : analyse de documents, génération guidée, calendrier, RAG, SEO programmatique, back-office. Le MVP n'en implémente aucune, mais **ses fondations doivent permettre de les ajouter sans refonte**.

1. **Multi-tenant par organisation.** L'unité métier est l'`organization`, pas l'utilisateur. Tout objet métier porte un `organization_id`. L'isolation est garantie par une **couche d'accès aux données unique** (`lib/db/scoped.ts`) qui injecte systématiquement le filtre d'organisation. Aucune requête métier ne doit contourner cette couche. La RLS Postgres native est un filet de sécurité optionnel, à la discrétion du développeur.
2. **Droits par fonctionnalités, jamais par nom de formule.**
   - Le code interroge des fonctions comme `hasFeature(org, 'brique.rh')` ou `getLimit(org, 'expert_questions_month')`.
   - Il ne teste jamais une formule par son nom (`plan === 'pro'` est proscrit).
   - Formules, droits et limites vivent en base. Stripe reste la source de vérité du paiement.
3. **Aucun prix, quota ou modèle IA codé en dur.** La page tarifs et l'app lisent la configuration.
4. **Couche IA isolée** (`lib/ai/`), organisée ainsi :
   - `buildPrompt()` assemble les éléments dans cet ordre : socle → briques actives → profil association → contexte récupéré.
   - `retrieveContext()` existe dès le MVP mais **retourne `[]`**. C'est le point d'entrée du futur RAG.
   - Le modèle et `max_tokens` sont définis par formule dans la configuration.
   - Les prompts sont **versionnés** (fichiers dans le repo), et la version utilisée est journalisée à chaque appel.
5. **Webhooks Stripe idempotents**, avec une table `stripe_events` pour dédoublonner et rejouer.
6. **Contenu public dans un CMS**, jamais en dur. Le modèle de page reprend le gabarit SEO de la v2 (§14.2) dès le départ.
7. **Confidentialité.** Le contenu des questions et réponses n'est jamais envoyé dans les logs techniques, Sentry ou l'analytics. On ne journalise que des métadonnées (tokens, coût, modèle, version de prompt).
8. **Toutes les pages `/app/**` sont `noindex`** et exclues du sitemap. Aucune clé secrète n'est exposée côté client.

## 4. Stack

Les versions ont été vérifiées en septembre 2026. Tout écart doit être justifié dans la réponse au ticket.

**Principe directeur : zéro dépendance à un BaaS propriétaire.** On n'utilise que des briques open source, auto-hébergées, et des services facturés à l'usage (Stripe, API Claude, emails). Aucun abonnement SaaS ne doit être obligatoire pour faire tourner le produit. Tout le code et toutes les données restent chez le client. Chaque service externe est encapsulé derrière une interface dans `lib/`, afin de pouvoir être remplacé.

> La stack des CDC (Supabase, Clerk, Upstash, Vercel) est **remplacée**. Motifs :
> - enfermement chez le fournisseur ;
> - abonnements cumulés ;
> - Vercel Hobby interdit l'usage commercial, ce qui impose le plan Pro payant.

| Couche | Choix | Remarque |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript strict, `output: standalone`) | Branche LTS active 16.3.x. **Remplace le Next.js 14 des CDC.** |
| UI | Tailwind + shadcn/ui | Tokens de la charte (§ CDC 9) : Syne pour les titres, Inter pour le texte. |
| Base de données | **PostgreSQL** auto-hébergé (conteneur) | Postgres standard, sans extension propriétaire. Portable partout. |
| ORM / migrations | **Drizzle ORM** + drizzle-kit | Schéma typé, migrations SQL versionnées dans le repo. |
| Auth clients | **Better Auth** (lib open source, sessions stockées en base) | Magic link + Google OAuth. Évaluer le plugin `organization` (multi-tenant) et le plugin Stripe avant de coder ces parties à la main. |
| CMS + back-office | **Payload 3** (embarqué dans Next, même Postgres, schéma séparé) | Gère les pages SEO **et** le back-office : formules/droits, tickets experts, prompts de briques. Cela évite de coder des écrans d'admin. Les comptes admin sont gérés par Payload, séparés des comptes clients. **Vérifier la compatibilité avec Next 16.** |
| Fichiers | Stockage **compatible S3** via une interface (`lib/storage`) | OVH Object Storage ou Scaleway (hébergement en France, argument RGPD pour la cible), facturés à l'usage. |
| Paiement | Stripe Billing + Checkout + **Customer Portal** | Le Portal gère le changement de formule, la résiliation et les factures. Pas d'écran de gestion à coder. |
| IA | Anthropic SDK, appel serveur, streaming | Modèles par défaut : `claude-haiku-4-5-20251001` et `claude-sonnet-5`. **`claude-sonnet-4-6` des CDC ne doit pas être utilisé.** |
| Email | Envoi SMTP via une interface (`lib/mail`) | Fournisseur interchangeable (Brevo, Resend…) utilisé sur son offre gratuite ou à l'usage. Templates versionnés dans le repo. |
| Rate limit | Valkey/Redis en conteneur, ou table Postgres | 10 requêtes/min/utilisateur (valeur en configuration). |
| Erreurs | **GlitchTip** auto-hébergé (compatible SDK Sentry) | Scrubbing du contenu des messages obligatoire. |
| Analytics produit | **Umami** auto-hébergé | Sans cookie. Alimente le helper `track()`. |
| Hébergement | **VPS** (Hoostinger je te donnerais les accces) + **Coolify** (PaaS open source) + Docker | Déploiement Git, preview par branche, SSL automatique. Environnements dev / préprod / prod. |
| Sauvegardes | `pg_dump` automatisé et chiffré vers le stockage S3 | Rétention de 30 jours. Restauration testée et documentée **avant** la mise en prod. |

**Contrepartie de l'auto-hébergement.** L'hébergement n'est pas gratuit : il faut un VPS et un stockage, mais pas d'abonnement par service. Surtout, la maintenance est à la charge de l'équipe : mises à jour de sécurité (OS, Postgres, Next.js — deux failles critiques Next.js ont par exemple été corrigées en août 2026), sauvegardes et supervision. Le développeur doit livrer une **procédure de mise à jour** et un monitoring de disponibilité (Uptime Kuma, également auto-hébergé).

**Point d'attention IA.** Haiku 4.5 a une connaissance fiable arrêtée à février 2025, Sonnet 5 à janvier 2026. Ils ignorent donc les évolutions réglementaires récentes. Le prompt socle doit leur imposer trois règles :
- ne jamais inventer de chiffre, taux, seuil ou date ;
- signaler systématiquement ce qui est à vérifier ;
- proposer l'escalade experte sur les sujets datés.

Le RAG prévu en phase 2 corrigera ce point. D'ici là, le choix de Haiku pour l'offre d'entrée est une **décision client à confirmer** (voir §8).

## 5. Périmètre

| DANS le MVP | HORS MVP (mais l'architecture doit l'anticiper) |
|---|---|
| Auth, organisation, profil association | Invitations multi-utilisateurs (le schéma `memberships` existe) |
| Abonnements Stripe, droits, quotas configurables | Offre gratuite (prévue en configuration, désactivée) |
| Chat IA : streaming, briques, historique, suppression | Analyse de documents, génération guidée |
| Question experte : ticket, quota, emails, suivi | Pièces jointes, questions supplémentaires payantes |
| Admin minimal : tickets experts, configuration formules | Dashboard analytics / MRR complet |
| Site public : landing, tarifs, à propos, 5 pages piliers, pages légales | Blog, SEO programmatique, outils gratuits |
| SEO technique complet (sitemap, robots, JSON-LD, 301) | Calendrier réglementaire, bibliothèque de modèles |
| Événements analytics de base | RAG, cross-sell PilotAsso, application mobile |

## 6. Modèle de données minimal

Liste indicative : le développeur livre l'ERD final dans sa réponse.

Répartition des schémas :
- **tables applicatives** (Drizzle) : auth Better Auth, organisations, abonnements, conversations, usage ;
- **collections Payload** : pages, `plans` / `plan_features`, `expert_tickets`, prompts de briques.

Le développeur valide ce découpage ou en propose un autre.

- `organizations` (id, name, siren, rna, created_at)
- `organization_profiles` (org_id, sector, employees_count, annual_budget, ccn, fiscal_year_end, usual_ag_month, governance_summary, main_funders[], establishments_count) — tous les champs sont modifiables et supprimables par l'utilisateur.
- `memberships` (user_id, org_id, role_in_org, app_role : owner | admin_platform)
- `plans` (code, label, stripe_price_id, active, sort) + `plan_features` (plan_code, feature_key, limit_value nullable)
  - Exemples de `feature_key` : `brique.finance`, `brique.rh`, `brique.conformite`, `brique.gouvernance`, `ai.model`, `ai.max_tokens`, `ai.max_input_chars`, `expert_questions_month`.
- `subscriptions` (org_id, stripe_customer_id, stripe_subscription_id, plan_code, status, current_period_end, grace_until)
- `stripe_events` (event_id unique, type, processed_at)
- `conversations` / `messages` (org_id, user_id, role, content, created_at) — contenu stocké pour l'historique utilisateur, supprimable (§8).
- `ai_usage` (org_id, user_id, model, prompt_version, input_tokens, output_tokens, cost_estimate, created_at) — **sans contenu**.
- `expert_tickets` (ref unique lisible, org_id, user_id, domain, urgency, question, status : pending | in_progress | answered, answered_at, created_at)

## 7. Lots de travail

Chaque lot se livre dans une PR avec URL de preview, puis fait l'objet d'une démo. Les critères d'acceptation (CA) conditionnent la validation.

### Lot 1 — Socle technique
Repo, TypeScript strict, lint et format, CI (lint, typecheck, tests), `docker-compose` local (Postgres, Valkey), mise en place du VPS avec Coolify (préprod + prod), sauvegardes automatiques, GlitchTip avec scrubbing, Umami, Uptime Kuma, headers de sécurité (CSP, HSTS, X-Frame-Options), tokens de la charte, layout public et layout app.
- **CA :**
  - un déploiement preview est généré automatiquement par PR ;
  - aucun secret n'apparaît dans le bundle client (vérification incluse dans la CI) ;
  - le README permet un setup local en moins de 15 minutes via `docker compose up` ;
  - une restauration de sauvegarde est démontrée sur la préprod.

### Lot 2 — Auth, organisation, profil
Better Auth (magic link et Google), création de l'organisation à l'inscription, onboarding du profil association (champs CDC v2 §12.1), page de modification et de suppression du profil, couche d'accès `scoped` appliquée à toutes les tables métier.
- **CA :**
  - un utilisateur de l'organisation A ne peut lire aucune donnée de B, y compris en appelant l'API directement (test automatisé) ;
  - le profil est modifiable après l'onboarding.

### Lot 3 — Abonnements et droits
Produits et prix Stripe, Checkout, Customer Portal, webhooks (`customer.subscription.created/updated/deleted`, `invoice.payment_failed`), période de grâce configurable (3 jours par défaut) puis suspension, service `entitlements`, édition des `plans` et `plan_features` dans le back-office Payload.
- **CA :**
  - modifier une limite dans l'admin change le comportement sans redéploiement ;
  - rejouer un webhook ne crée pas de doublon ;
  - les tests couvrent la souscription, l'upgrade, l'échec de paiement et la résiliation (Stripe test clocks ou CLI).

### Lot 4 — Assistant IA
Route serveur en streaming, prompt modulaire (socle + briques actives + profil), sélection de domaine dans la sidebar (les briques non souscrites sont visibles mais verrouillées, avec un CTA d'upgrade), limites de caractères et `max_tokens` selon les droits, rate limit, historique des conversations avec suppression, journalisation `ai_usage`, rendu markdown sécurisé.

Chaque réponse suit ce format : réponse courte d'abord → développement → section **« Références citées »** → mention « à vérifier / date » → bouton **« Poser à l'experte »** qui préremplit un ticket.
- **CA :**
  - une question hors des briques souscrites est traitée au niveau socle et propose l'upgrade ;
  - aucun contenu de message n'apparaît dans GlitchTip ni dans Umami ;
  - le coût estimé est visible par organisation dans l'admin.

### Lot 5 — Question experte
Formulaire (champs CDC §3.4, préremplis depuis le profil), référence unique lisible (ex. `AE-2026-00042`), contrôle du quota selon les droits, email formaté vers `contact@cabinet-mae.fr` et accusé de réception à l'utilisateur, liste « Mes questions » avec statut, collection Payload pour traiter les tickets (statut, note interne).
- **CA :**
  - le quota est bloquant côté serveur ;
  - l'utilisateur voit le statut passer à « répondu » quand l'admin le met à jour.

### Lot 6 — Site public et SEO
Pages : landing, `/tarifs` (lue depuis la configuration), `/a-propos` (page auteur, orientée GEO), pages piliers `/rh/`, `/gouvernance/`, `/finance/`, `/subventions/`, `/conformite/`, pages légales, 404 utile.

Le CMS doit gérer l'intégralité des champs du gabarit v2 §14.2 et §14.3 : slug, title, meta description, H1, chapô, contenu, FAQ, sources, auteur/relecteur, date de vérification, statuts, redirection 301 automatique au changement de slug, `noindex` configurable. S'y ajoutent : sitemap segmenté, robots.txt, canonical, Open Graph, fil d'Ariane, JSON-LD (Organization, Person, SoftwareApplication/Offer, FAQPage) **correspondant au contenu réellement visible**.
- **CA :**
  - Laetitia crée et publie une page sans développeur ;
  - `/app/**` est absent du sitemap et renvoie `noindex` ;
  - JSON-LD valide (Rich Results Test) ;
  - Lighthouse mobile ≥ 90 sur la landing ;
  - LCP, CLS et INP conformes aux seuils « good ».

**Transverse — analytics.** Un helper unique `track()` alimente l'outil choisi, avec consentement. Événements du MVP : `landing_view`, `seo_cta_click`, `signup_start`, `signup_complete`, `question_sent`, `subscription_started`, `subscription_upgraded`, `expert_ticket_created`. Les paramètres UTM sont conservés jusqu'à l'inscription.

## 8. Décisions client en attente

Ces décisions ne bloquent pas le développement, grâce au §3 : elles se règlent en configuration.

| Sujet | Situation actuelle | Impact dev |
|---|---|---|
| Grille tarifaire finale | Trois versions contradictoires : 19/59/99, 29/67/127, et « Pilotage 97 € » | Aucun (configuration) |
| Questions expertes par formule | Pro : 0 selon le CDC, 1/mois selon la landing ; Expert : 3/mois | Aucun (configuration) |
| Brique Conformité incluse dans Pro ? | La landing se contredit | Aucun (configuration) |
| Niveaux d'urgence 24h / « aujourd'hui » | Non tarifés, contraires à la promesse 48h | Champ conservé, libellés en configuration |
| Offre gratuite (v2) | Quota à définir | Prévue, désactivée |
| Haiku pour l'offre d'entrée | Connaissances antérieures à 2025 | Aucun (configuration) |
| Durée de rétention de l'historique | Non définie | Paramètre + tâche de purge |
| Contenus des pages piliers, mentions légales, CGU | À fournir par la cliente | Bloquant pour la mise en ligne, pas pour le développement |
| Domaine `assoexpert.fr` | Disponibilité à vérifier | Bloquant pour la mise en ligne |

## 9. Ce que j'attends du développeur

**A. Avant de coder** — réponse au ticket sous 5 jours ouvrés, au format Markdown :
1. Reformulation du besoin en 10 lignes maximum, et liste des questions ou points flous.
2. **Chiffrage par lot** (jours/homme) et planning, avec les dépendances.
3. Choix techniques argumentés : CMS, outil d'analytics, tout écart par rapport au §4.
4. ERD du modèle de données (image ou Mermaid).
5. Top 5 des risques et comment ils sont traités.

**B. Pendant le développement**
- Une PR par lot, avec URL de preview et description des CA testés.
- Point hebdomadaire écrit : fait / en cours / bloqué / décisions attendues.
- Aucune modification de périmètre sans validation écrite (le CDC prévoit un avenant).

**C. À la livraison**
- Repo transféré ou partagé avec accès admin (Glenn + Laetitia).
- README couvrant : setup, variables d'environnement (liste commentée), déploiement, migrations, sauvegarde/restauration, rollback.
- **Guide admin** d'une page : changer un prix ou un quota, publier une page SEO, traiter un ticket expert, modifier un prompt de brique.
- Résultats des tests automatisés, rapport Lighthouse, validation JSON-LD.
- Comptes de test pour chaque formule, en préprod.
