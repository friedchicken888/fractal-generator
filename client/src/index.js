import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import index.css
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App'; // Import App component
import Login from './pages/Login';
import Generator from './pages/Generator';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import NoAccess from './pages/NoAccess';
import RootRedirect from './pages/RootRedirect'; // Import RootRedirect
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
                        <Route index element={<RootRedirect />} />
            <Route path="login" element={<Login />} />
            <Route path="no-access" element={<NoAccess />} />
            <Route element={<ProtectedRoute />}>
              <Route path="generator" element={<Generator />} />
              <Route path="gallery" element={<Gallery />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
