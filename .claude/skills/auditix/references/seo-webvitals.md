# Référence Audit — SEO & Web Vitals

## Balises meta & structure

- [ ] `<title>` unique et descriptif par page (< 60 caractères)
- [ ] `<meta description>` pertinent et < 160 caractères
- [ ] Balises Open Graph pour le partage social
- [ ] `robots.txt` configuré correctement
- [ ] `sitemap.xml` généré et soumis
- [ ] URLs canoniques définies

## Structure sémantique

- [ ] Un seul `<h1>` par page
- [ ] Hiérarchie des titres respectée (h1 > h2 > h3)
- [ ] Balises sémantiques HTML5 (`nav`, `main`, `article`, `aside`, `footer`)
- [ ] Structured data (JSON-LD) pour les contenus structurés

## Performance SEO

- [ ] LCP < 2.5s (Core Web Vital)
- [ ] CLS < 0.1 (Core Web Vital)
- [ ] INP < 200ms (Core Web Vital)
- [ ] Pages indexables (pas de `noindex` intempestif)
- [ ] Images avec attributs `width` et `height` (évite le CLS)
- [ ] Pas de contenu dans des iframes non indexables

## Outils

```bash
npx lighthouse https://votre-app.com --output json
```
- Google Search Console
- PageSpeed Insights
- Screaming Frog pour l'audit de crawl
