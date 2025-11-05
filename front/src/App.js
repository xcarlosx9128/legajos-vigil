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
import ConfiguracionOrganizacional from './pages/admin/ConfiguracionOrganizacional';
import CondicionLaboral from './pages/admin/CondicionLaboral';
import Regimenes from './pages/admin/Regimenes';
import SeccionesLegajo from './pages/admin/SeccionesLegajo';
import TipoDocumentos from './pages/admin/TipoDocumentos';
import CargosPersonal from './pages/admin/CargosPersonal';
import ConsultarPersonal from './pages/subgerente/ConsultarPersonal';
import GestionarPersonal from './pages/GestionarPersonal';
import VisualizarLegajo from './pages/VisualizarLegajo'; // ⭐ NUEVO
import EditarLegajo from './pages/EditarLegajo';
import VisualizarEscalafon from './pages/VisualizarEscalafon'; // ⭐ NUEVO
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

            {/* ⭐ NUEVO: Visualizar Legajo (solo lectura) */}
            <Route
              path="/personal/:id/visualizar-legajo"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <VisualizarLegajo />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Editar Legajo (documentos) */}
            <Route
              path="/personal/:id/editar-legajo"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditarLegajo />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Visualizar Escalafón (solo lectura) */}
            <Route
              path="/personal/:id/visualizar-escalafon"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <VisualizarEscalafon />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVO: Editar Historial Escalafón */}
            <Route
              path="/personal/:id/editar-escalafon"
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

            {/* ⭐ Configuración y Gestión Organizacional */}
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

            {/* ⭐ Condición Laboral */}
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

            {/* ⭐ Regímenes */}
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

            {/* ⭐ Secciones de Legajo */}
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

            {/* ⭐ Tipo de Documentos */}
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

            {/* ⭐ Cargos de Personal */}
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