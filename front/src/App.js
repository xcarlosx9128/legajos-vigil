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
import ConfiguracionOrganizacional from './pages/admin/ConfiguracionOrganizacional'; // ⭐ NUEVO
import CondicionLaboral from './pages/admin/CondicionLaboral'; // ⭐ NUEVO
import Regimenes from './pages/admin/Regimenes'; // ⭐ NUEVO
import SeccionesLegajo from './pages/admin/SeccionesLegajo'; // ⭐ NUEVO
import TipoDocumentos from './pages/admin/TipoDocumentos'; // ⭐ NUEVO
import CargosPersonal from './pages/admin/CargosPersonal'; // ⭐ NUEVO
import ConsultarPersonal from './pages/subgerente/ConsultarPersonal';
import GestionarPersonal from './pages/GestionarPersonal';
import EditarLegajo from './pages/EditarLegajo';
import EditarHistorialEscalafon from './pages/EditarHistorialEscalafon';

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

            {/* ⭐ GESTIÓN DE PERSONAL */}
            {/* Página principal de Gestionar Personal */}
            <Route
              path="/gestionar-personal"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GestionarPersonal />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Editar Legajo (documentos) */}
            <Route
              path="/gestionar-personal/:id/legajo"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditarLegajo />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Editar Historial Escalafón */}
            <Route
              path="/gestionar-personal/:id/escalafon"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditarHistorialEscalafon />
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

            {/* ⭐ NUEVO: Configuración y Gestión Organizacional */}
            <Route
              path="/admin/configuracion-organizacional"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <ConfiguracionOrganizacional />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Condición Laboral */}
            <Route
              path="/admin/condicion-laboral"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <CondicionLaboral />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Regímenes */}
            <Route
              path="/admin/regimenes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <Regimenes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Secciones de Legajo */}
            <Route
              path="/admin/secciones-legajo"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <SeccionesLegajo />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Tipo de Documentos */}
            <Route
              path="/admin/tipo-documentos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <TipoDocumentos />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Cargos de Personal */}
            <Route
              path="/admin/cargos-personal"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <CargosPersonal />
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