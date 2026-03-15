import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import './styles/global.css';

// Lazy load pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Quests from './pages/Quests';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

const SetupNeeded = () => (
  <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
    <div className="glass-card" style={{ padding: '40px' }}>
      <h1 className="logo" style={{ marginBottom: '24px' }}>Duo Quest</h1>
      <h2 style={{ marginBottom: '16px' }}>Setup Required 🛠️</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
        Ainda não configuramos o banco de dados online. 
        Por favor, adicione as chaves <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> 
        nos "Secrets" do seu repositório no GitHub para ativar o sistema.
      </p>
      <a href="https://github.com/arturrinaldi/couple-rpg" target="_blank" className="btn-primary" style={{ textDecoration: 'none' }}>
        Ir para o GitHub
      </a>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (!supabase) return <SetupNeeded />;
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="heart-loader" style={{ marginBottom: '20px' }}>❤️</div>
        <p className="medieval-font" style={{ color: 'var(--medieval-gold)', fontSize: '1.2rem' }}>Despertando o Reino...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="heart-loader" style={{ marginBottom: '20px' }}>❤️</div>
        <p className="medieval-font" style={{ color: 'var(--medieval-gold)', fontSize: '1.2rem' }}>Despertando o Reino...</p>
      </div>
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={!supabase ? <SetupNeeded /> : <PublicRoute><Login /></PublicRoute>} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quests" 
              element={
                <ProtectedRoute>
                  <Quests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rewards" 
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            {/* Fallback for sub-routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
