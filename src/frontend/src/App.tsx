// App: Main React component

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ResultsPage from './pages/ResultsPage';
import CheckoutPage from './pages/CheckoutPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{
          backgroundColor: '#343a40',
          color: 'white',
          padding: '15px 20px',
          marginBottom: '0',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
              Automation Project
            </Link>
            <span style={{ fontSize: '14px', color: '#adb5bd' }}>Phase 4: Cart + Checkout + Screenshot</span>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results/:requestId" element={<ResultsPage />} />
          <Route path="/checkout/:requestId/:productId" element={<CheckoutPage />} />
          <Route path="/status/:requestId" element={<StatusPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
