import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Composer from './pages/Composer';
import Queue from './pages/Queue';
import Accounts from './pages/Accounts';
import Campaigns from './pages/Campaigns';
import Logs from './pages/Logs';
import Layout from './components/Layout';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--text-muted)', fontFamily: 'DM Mono',
      background: 'var(--bg)'
    }}>
      Loading...
    </div>
  );
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(20,20,40,0.95)',
              color: '#f0f0f8',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'DM Sans'
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="composer" element={<Composer />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="queue" element={<Queue />} />
            <Route path="logs" element={<Logs />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;