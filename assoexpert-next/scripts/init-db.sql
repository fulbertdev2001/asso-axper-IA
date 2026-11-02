-- Initialisation des schémas PostgreSQL séparés (§4 et §6 du ticket cadre)
-- 1. Schéma `public` : tables applicatives Drizzle (auth, organisations, abonnements, conversations, ai_usage)
-- 2. Schéma `payload` : collections Payload CMS (pages SEO, plans/droits, expert_tickets, prompts)
-- 3. Schéma `umami` : analytics produit auto-hébergé

CREATE SCHEMA IF NOT EXISTS payload;
CREATE SCHEMA IF NOT EXISTS umami;

