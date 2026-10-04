import { useParams, Link } from 'react-router-dom'
import ClientDirectory from '../components/ClientDirectory'
import { ALL_CITY_CLIENTS, CLIENTS } from '../data/clients'

export default function CityClients() {
  const { city } = useParams()
  const data = ALL_CITY_CLIENTS[city]
  if (!data) return <div className="container directory-empty"><h1>City not found</h1><Link className="button" to="/clients">Browse all clients</Link></div>
  const clients = CLIENTS.filter(client => client.cityKey === city)
  return (
    <div className="client-page">
      <header className="client-page-header"><div className="container">
        <Link className="directory-back" to="/clients">← All clients</Link>
        <p className="eyebrow">{data.state}</p>
        <h1>{data.label} <span>installations</span></h1>
        <p>Certified fire protection systems for {clients.length} organizations in {data.label}.</p>
        <div className="client-summary"><span><strong>{clients.length}</strong> listed installations</span><span><strong>{clients.filter(client => client.status === 'Running').length}</strong> running projects</span><span><strong>{clients.filter(client => client.status === 'Completed').length}</strong> completed</span></div>
      </div></header>
      <div className="container">
        <ClientDirectory key={city} clients={clients} showCityFilter={false} />
        <aside className="directory-cta"><div><h2>Based in {data.label}?</h2><p>Get a free fire safety audit for your facility.</p></div><Link className="button" to="/contact">Get a free audit</Link></aside>
      </div>
    </div>
  )
}
