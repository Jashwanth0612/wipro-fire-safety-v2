# Wipro Fire & Safety Website Upgrade

## What changed

- Added searchable, filterable product catalogue data while preserving all 40 original product records.
- Added a quote shortlist that stores selected products locally and attaches selected models/quantities to the contact enquiry payload.
- Polished the navigation, footer, product cards, contact form, page metadata, mobile layout, accessibility states, and loading behavior.
- Kept the existing brochure, assets, admin pages, backend API shape, AI assistant, WhatsApp link, clients pages, and original routes.

## Verification

Run these from the project root:

```bash
npm ci
node --test tests/catalog.test.mjs
npm run build
```

The Vercel deployment uses the existing Vite build and preserves the original `vercel.json` rewrite behavior.

## GitHub sync note

This source archive matches the production deployment made from the uploaded project files. Because the GitHub repository is private and was not accessible from this session, update the repository with these files before relying on Git-connected redeploys.

## Final visual refinements — 25 September 2026
- Added a transparent green, red and blue brand-color adaptation of the supplied company logo to the header and footer; retained the original asset.
- Matched Home, Products and Contact hero headings to About and Services: Barlow Condensed, weight 900, uppercase, responsive 40–80px scale.
- Isolated page background layers below the footer so About and Services footer text stays readable.
- Preserved existing pages, content, catalogue and enquiry functionality.

## Public repository preparation
- Replaced embedded backend admin passwords and JWT defaults with required environment variables.
- Added a blank backend environment template and strengthened ignore rules.
- Imported a clean source snapshot without private repository history.
