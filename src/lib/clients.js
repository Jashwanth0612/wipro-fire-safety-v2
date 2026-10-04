export const CLIENT_PAGE_SIZE = 9

export function browseClients(clients, { search = '', city = '', industry = '', status = '', page = 1 } = {}) {
  const query = search.trim().toLocaleLowerCase()
  const filtered = clients.filter(client =>
    (!city || client.cityKey === city) &&
    (!industry || client.industry === industry) &&
    (!status || client.status === status) &&
    (!query || [client.name, client.city, client.industry].some(value => value.toLocaleLowerCase().includes(query)))
  ).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  const pages = Math.max(1, Math.ceil(filtered.length / CLIENT_PAGE_SIZE))
  const current = Math.max(1, Math.min(pages, Number.isFinite(page) ? Math.floor(page) : 1))
  const offset = (current - 1) * CLIENT_PAGE_SIZE
  return { items: filtered.slice(offset, offset + CLIENT_PAGE_SIZE), total: filtered.length, pages, page: current, start: filtered.length ? offset + 1 : 0, end: Math.min(offset + CLIENT_PAGE_SIZE, filtered.length) }
}
