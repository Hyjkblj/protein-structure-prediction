import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MolstarCustomPage from './pages/MolstarCustomPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MolstarCustomPage />} />
      </Routes>
    </Layout>
  )
}

export default App

