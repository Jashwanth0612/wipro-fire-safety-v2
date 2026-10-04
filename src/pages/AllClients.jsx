import { Link } from 'react-router-dom'
import ClientDirectory from '../components/ClientDirectory'
import { CLIENTS, ALL_CITY_CLIENTS } from '../data/clients'

export default function AllClients() {
  return (
    <div className="client-page">
      <header className="client-page-header">
        <div className="container">
          <p className="eyebrow">OUR PORTFOLIO · SOUTH INDIA</p>
          <h1>Trusted partnerships.<br /><span>Proven protection.</span></h1>
          <p>From power plants and pharma companies to hospitals and retail chains — protecting organizations since 2007.</p>
          <div className="client-summary"><span><strong>151+</strong> verified installations</span><span><strong>{Object.keys(ALL_CITY_CLIENTS).length}</strong> cities covered</span><span><strong>{CLIENTS.filter(client => client.status === 'Running').length}</strong> running projects</span></div>
        </div>
      </header>
      <div className="container">
        <ClientDirectory clients={CLIENTS} />
        <aside className="directory-cta"><div><h2>Protect your facility with us.</h2><p>Arrange a free fire safety audit with our team.</p></div><Link className="button" to="/contact">Get a free audit</Link></aside>
      </div>
    </div>
  )
}
