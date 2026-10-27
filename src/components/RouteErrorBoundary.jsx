import { Component } from 'react'
import { Link } from 'react-router-dom'

// A failed route download should leave the navigation usable. Reload is explicit:
// never automatically reload a page that could contain an unfinished staff entry.
export default class RouteErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="container route-feedback" role="alert" aria-labelledby="route-error-heading">
        <h1 id="route-error-heading">This page could not be loaded</h1>
        <p>Check your connection and reload the page. You can also return to the home page.</p>
        <div className="button-row">
          <button className="button" onClick={() => window.location.reload()}>Reload page</button>
          <Link className="button button-secondary" to="/">Back to home</Link>
        </div>
      </section>
    )
  }
}
