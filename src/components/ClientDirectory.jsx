import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowLeft, ArrowRight } from 'lucide-react'
import { browseClients } from '../lib/clients'

export default function ClientDirectory({ clients, showCityFilter = true }) {
  const [filters, setFilters] = useState({ search: '', city: '', industry: '', status: '', page: 1 })
  const heading = useRef(null)
  const result = browseClients(clients, filters)
  const cities = [...new Map(clients.map(client => [client.cityKey, client.city])).entries()].sort((a, b) => a[1].localeCompare(b[1]))
  const industries = [...new Set(clients.map(client => client.industry))].sort()
  const change = (key, value) => setFilters(previous => ({ ...previous, [key]: value, page: 1 }))
  const reset = () => setFilters({ search: '', city: '', industry: '', status: '', page: 1 })
  const turnPage = page => {
    setFilters(previous => ({ ...previous, page }))
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  const hasFilters = filters.search || filters.city || filters.industry || filters.status

  return (
    <section className="client-directory" aria-labelledby="client-directory-title">
      <div className="directory-title-row">
        <h2 id="client-directory-title" ref={heading} tabIndex={-1}>Browse installations</h2>
        <span>{clients.length} listed · A–Z</span>
      </div>
      <div className="directory-filters">
        <label className="directory-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search clients</span>
          <input type="search" value={filters.search} onChange={event => change('search', event.target.value)} placeholder="Company, city or industry" />
        </label>
        {showCityFilter && <label>City<select value={filters.city} onChange={event => change('city', event.target.value)}><option value="">All cities</option>{cities.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>}
        <label>Industry<select value={filters.industry} onChange={event => change('industry', event.target.value)}><option value="">All industries</option>{industries.map(industry => <option key={industry}>{industry}</option>)}</select></label>
        <label>Status<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">All projects</option><option>Running</option><option>Completed</option></select></label>
      </div>
      <div className="directory-results">
        <p role="status" aria-live="polite">Showing {result.start}–{result.end} of {result.total} installations</p>
        {hasFilters && <button className="text-button" onClick={reset}>Clear filters</button>}
      </div>
      {result.total > 0 ? <div className="directory-grid">
        {result.items.map(client => <article className="directory-card" key={client.id}>
          <div className="directory-card-top"><span className={client.status === 'Running' ? 'directory-status is-running' : 'directory-status'}>{client.status}</span><span>{client.industry}</span></div>
          <h3>{client.name}</h3>
          <Link to={'/clients/' + client.cityKey} aria-label={'View installations in ' + client.city}>{client.city} <ArrowRight size={14} aria-hidden="true" /></Link>
        </article>)}
      </div> : <div className="directory-empty"><h3>No matching installations</h3><p>Try another company name or clear your filters.</p><button className="button button-secondary" onClick={reset}>Show all installations</button></div>}
      {result.pages > 1 && <nav className="directory-pagination" aria-label="Client directory pages">
        <button onClick={() => turnPage(result.page - 1)} disabled={result.page === 1}><ArrowLeft size={16} /> Previous</button>
        <label>Page <select aria-label="Client page" value={result.page} onChange={event => turnPage(Number(event.target.value))}>{Array.from({ length: result.pages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select> of {result.pages}</label>
        <button onClick={() => turnPage(result.page + 1)} disabled={result.page === result.pages}>Next <ArrowRight size={16} /></button>
      </nav>}
    </section>
  )
}
