import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
const pages = {
  '/': ['Fire Safety Solutions in Kurnool, South India','Fire protection, installation, AMC, refilling and safety training from Wipro Fire & Safety in Kurnool.'],
  '/products': ['Fire & Safety Product Catalogue','Explore 40 fire and safety product categories. Search models, view specifications and build a quote shortlist.'],
  '/services': ['Fire Safety Services','Explore installation, maintenance, extinguisher refilling, audits and fire safety training.'],
  '/about': ['About Us','Learn about Wipro Fire & Safety and our work across South India.'],
  '/clients': ['Our Clients','Explore Wipro Fire & Safety installations and clients across South India.'],
  '/contact': ['Contact & Request a Quote','Contact Wipro Fire & Safety in Kurnool for product enquiries, service quotes and safety audits.'],
}
export default function RouteMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    const cityPage = pathname.startsWith('/clients/')
    const admin = pathname.startsWith('/admin/')
    const page = pages[pathname] || (cityPage ? ['Client Installations','Explore client installations by city.'] : admin ? ['Administration','Wipro Fire & Safety administration.'] : ['Page Not Found','The requested page could not be found.'])
    document.title = `${page[0]} | Wipro Fire & Safety`
    const setMeta = (attribute,key,content) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`)
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute,key); document.head.appendChild(element) }
      element.setAttribute('content',content)
    }
    setMeta('name','description',page[1]); setMeta('name','robots',admin || (!pages[pathname] && !cityPage) ? 'noindex, nofollow' : 'index, follow')
    setMeta('property','og:title',document.title); setMeta('property','og:description',page[1]); setMeta('property','og:url',new URL(pathname,window.location.origin).href)
    setMeta('name','twitter:title',document.title); setMeta('name','twitter:description',page[1])
  }, [pathname])
  return null
}
