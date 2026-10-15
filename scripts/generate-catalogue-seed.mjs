import { writeFileSync } from 'node:fs'
import { PRODUCTS, CATEGORIES } from '../src/data/products.js'
const quote = value => `'${String(value).replaceAll("'", "''")}'`
const labels = new Map(CATEGORIES.map(category => [category.id, category.label]))
const rows = PRODUCTS.map(product => `(${[product.title, product.desc, labels.get(product.category), product.img, `catalog-${product.id}`].map(quote).join(', ')}, NULL)`)
const sql = `-- Original V1 catalogue, linked to the preserved public product IDs.\n-- Unknown stock remains NULL; do not invent quantities or overwrite staff edits.\n-- Safe to repeat: existing catalogue rows are left unchanged.\nbegin;\ninsert into public.products(title, description, category, image_url, slug, stock) values\n${rows.join(',\n')}\non conflict (slug) do nothing;\ncommit;\n`
writeFileSync(new URL('../supabase/migrations/202610150001_original_catalogue.sql', import.meta.url), sql)
console.log(`Prepared ${PRODUCTS.length} original products; no stock quantities invented.`)
