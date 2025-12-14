import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <div className="logo">
          Proteins
          </div>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2024 React Standard Project. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout

