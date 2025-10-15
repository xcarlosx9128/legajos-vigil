import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuariosActivos: 0,
    personalRegistrados: 0,
    documentosTotal: 0,
  });
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usuariosRes, personalRes, legajosRes, eventosRes] = await Promise.all([
        api.get('/usuarios/'),
        api.get('/personal/'),
        api.get('/legajos/'),
        api.get('/registro-eventos/?page_size=20'), // Cargar últimos 20 eventos
      ]);

      // Contar usuarios activos
      const usuariosData = usuariosRes.data.results || usuariosRes.data;
      const usuariosActivos = usuariosData.filter(u => u.is_active).length;

      // Contar personal registrado
      const personalData = personalRes.data.results || personalRes.data;
      const personalTotal = personalData.length;

      // Contar documentos
      const legajosData = legajosRes.data.results || legajosRes.data;
      const documentosTotal = legajosData.length;

      setStats({
        usuariosActivos: usuariosActivos,
        personalRegistrados: personalTotal,
        documentosTotal: documentosTotal,
      });

      // Cargar eventos reales desde la API
      const eventosData = eventosRes.data.results || eventosRes.data;
      
      // Transformar los eventos al formato esperado por la tabla
      const eventosFormateados = eventosData.map((evento) => ({
        id: evento.id,
        usuario: evento.usuario_ejecutor_username || 'Sistema',
        empleado: evento.usuario_afectado_nombre || '-',
        fechaHora: new Date(evento.fecha_hora).toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        evento: evento.evento_nombre,
      }));

      setEventos(eventosFormateados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = () => {
    navigate('/eventos');
  };

  const filteredEventos = eventos.filter((evento) =>
    evento.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evento.empleado.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evento.evento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            bgcolor: '#FFC107',
            color: 'black',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              USUARIOS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ACTIVOS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2 }}>
              {stats.usuariosActivos}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            bgcolor: '#EF5350',
            color: 'black',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              PERSONAL
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              REGISTRADOS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2 }}>
              {stats.personalRegistrados}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            bgcolor: '#4DD0E1',
            color: 'black',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              DOCUMENTOS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              TOTAL
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2 }}>
              {stats.documentosTotal.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Eventos Recientes */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#003366' }}>
            Eventos Recientes
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handleVerDetalles}
              sx={{
                bgcolor: '#003366',
                '&:hover': { bgcolor: '#002244' },
                textTransform: 'none',
              }}
            >
              Ver Detalles de Eventos
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#003366' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Evento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                      {searchQuery ? 'No se encontraron eventos' : 'No hay eventos recientes'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEventos.map((evento) => (
                  <TableRow key={evento.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell>{evento.usuario}</TableCell>
                    <TableCell>{evento.empleado}</TableCell>
                    <TableCell>{evento.fechaHora}</TableCell>
                    <TableCell>{evento.evento}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;