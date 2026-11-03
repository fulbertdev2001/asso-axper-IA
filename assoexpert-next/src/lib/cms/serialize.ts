/**
 * Sérialise un objet JSON-LD pour l'insérer dans une balise <script>.
 * Les caractères `<`, `>` et `&` (ainsi que les séparateurs U+2028 / U+2029) sont échappés
 * afin qu'un contenu CMS contenant `</script>` ne puisse pas fermer la balise (anti-XSS).
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LINE_SEPARATOR)
    .join('\\u2028')
    .split(PARAGRAPH_SEPARATOR)
    .join('\\u2029');
}
