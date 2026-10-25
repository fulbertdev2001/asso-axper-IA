# Handoff dév — Pilot Asso Design System

Ce dossier est le **design system Pilot Asso** : tokens CSS, composants React et une recréation de l'app (Login / Dashboard / Transactions). Les fichiers HTML/JSX sont des **références de design** : ils montrent l'intention visuelle et le comportement attendu. L'objectif est de les **réimplémenter dans le codebase cible** avec ses patterns existants (React + Vite/Next, Tailwind, etc.), pas de copier le HTML tel quel en production.

**Fidélité : haute (hi-fi).** Couleurs, typo, espacements, rayons, ombres et états sont définitifs et tokenisés. À reproduire au pixel.

---

## Démarrage rapide

1. `styles.css` est le point d'entrée unique. Il importe tout `tokens/` :

```html
<link rel="stylesheet" href="styles.css">
```

   Ou en bundler : `import "./styles.css";`

2. Toutes les valeurs de design sont des **CSS custom properties** définies sur `:root` (voir `tokens/`). Les composants ne contiennent aucune valeur en dur — ils lisent `var(--…)`. Pour theming ou intégration Tailwind, mapper les tokens plutôt que dupliquer les hex.

3. Icônes : **Lucide uniquement**, trait 2px. Dans un vrai projet, utiliser `lucide-react` (`npm i lucide-react`) plutôt que le wrapper `Icon` fourni (qui cible le global UMD chargé par CDN dans ces maquettes).

4. Polices : `tokens/fonts.css` charge actuellement **Sora** (display) et **Hanken Grotesk** (texte) depuis Google Fonts, en substitution de *Heading Now* et *Open Sauce*. Le brief exige un **hébergement local** — fournir les fichiers licenciés, puis remplacer l'`@import` par des `@font-face` locales. Les noms de variables (`--font-display`, `--font-text`) ne changent pas.

---

## Structure

| Dossier | Contenu |
|---|---|
| `styles.css` | Entrée globale (imports uniquement) |
| `tokens/` | `fonts` · `colors` · `typography` · `spacing` · `effects` · `base` |
| `components/` | `actions/` · `forms/` · `data/` · `feedback/` · `foundation/` — chaque composant : `.jsx` + `.d.ts` (API typée) + `.prompt.md` (règles d'usage) |
| `guidelines/` | Planches de référence (couleurs, échelle typo, spacing, rayons/ombres) — ouvrir dans le navigateur |
| `ui_kits/pilot-asso/` | App complète : `index.html` → Login, Dashboard, Transactions, Sidebar, Topbar |
| `templates/pilot-asso-dashboard/` | Template de page dashboard |
| `readme.md` | Spécification complète : fondations visuelles, ton éditorial, inventaire composants |
| `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` | Générés automatiquement — **ne pas éditer** |

Pour chaque composant, lire le `.d.ts` (props exactes) et le `.prompt.md` (quand l'utiliser, variantes, interdits).

---

## Fondations (résumé — détail dans `readme.md`)

**Couleurs.** Bleu `#004AAD` = seule couleur interactive (CTA, liens, nav active, focus). Navy `#0A2540` = titres, texte foncé, icônes, sections sombres. Lime `#C1FF72` = **exclusivement** IA / recommandation / succès. Orange `#FBAB02` = alerte modérée. Surfaces : blanc `#FFFFFF` sur fond app `#F5F7FA`, surface secondaire `#E7ECF3`. Bordures `#E7ECF3` → `#D8DFE9`.

**Typographie.** Display (Heading Now → Sora) 700–800 pour H1–H3 et chiffres KPI, `letter-spacing: -0.02em`. Texte (Open Sauce → Hanken Grotesk) 400–600. Échelle : 60 / 44 / 32 / 24 / 16 / 14 / 12. **Corps jamais sous 16px.** Line-height 1.55 corps, 1.2 titres.

**Espacement.** Grille 8px stricte : `4 · 8 · 16 · 24 · 32 · 48 · 64 · 80`. Padding carte 24px. Sidebar 260px, contenu max ~1200px. Mobile-first.

**Rayons.** Boutons et champs 12px · cartes et modales 16px · chips 8px · pills 999px.

**Ombres.** Subtiles, teintées navy : `xs` → `sm` → `card` (`0 2px 8px rgba(10,37,64,.06)`) → `md` (hover). Jamais d'ombre lourde.

**Contrôles.** Hauteur 48px (md), 40px (sm). Focus = bordure bleue 1px + ring translucide 3px (`--shadow-focus`), visible clavier ET clic (WCAG AA). Disabled = opacité 50% + `not-allowed`.

**Animation.** 120ms (feedback) à 180ms (hover lift), `ease`. Fades et `translateY` uniquement. Respecter `prefers-reduced-motion`.

---

## Contenu & langue

Produit **fr-FR**, vouvoiement, sentence case partout (titres, boutons, labels). Montants `24 380 €` (espace insécable comme séparateur, € après). Aucun emoji. Les suggestions IA sont formulées comme des propositions (« Souhaitez-vous les regrouper ? »), jamais comme des ordres.

---

## À fournir pour finaliser

- **Fichiers de polices licenciés** (Heading Now, Open Sauce) pour l'hébergement local.
- **Logo officiel** (SVG). Actuellement remplacé par le wordmark « Pilot Asso » + glyphe Lucide `compass` neutre — aucun logo n'a été inventé.
- Décision sur les icônes : `lucide-react` en dépendance (recommandé) ou sprite vendorisé offline.
