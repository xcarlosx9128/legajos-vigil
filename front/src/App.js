import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Eventos from './pages/Eventos';
import Tickets from './pages/Tickets';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionAreas from './pages/admin/GestionAreas';
import ConsultarPersonal from './pages/subgerente/ConsultarPersonal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Eventos */}
            <Route
              path="/eventos"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Eventos />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Tickets */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Tickets />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Admin */}
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <GestionUsuarios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/areas"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <GestionAreas />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Subgerente */}
            <Route
              path="/subgerente/consultar-personal"
              element={
                <ProtectedRoute allowedRoles={['SUBGERENTE']}>
                  <MainLayout>
                    <ConsultarPersonal />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;