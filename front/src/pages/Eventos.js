import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosOriginales, setEventosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Cargar TODOS los eventos
      const eventosRes = await api.get('/registro-eventos/');
      const eventosData = eventosRes.data.results || eventosRes.data;

      // Transformar eventos
      const eventosFormateados = eventosData.map((evento) => ({
        id: evento.id,
        usuario: evento.usuario_ejecutor_username || 'Sistema',
        usuarioAfectado: evento.usuario_afectado_nombre || '-',
        personalAfectado: evento.personal_afectado_nombre || '-',
        fechaHora: new Date(evento.fecha_hora).toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        evento: evento.evento_nombre,
      }));

      setEventosOriginales(eventosFormateados);
      setEventos(eventosFormateados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (!searchQuery.trim()) {
      setEventos(eventosOriginales);
      return;
    }

    const filtered = eventosOriginales.filter((evento) =>
      evento.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.usuarioAfectado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.personalAfectado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.evento.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setEventos(filtered);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f0f0f0', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#003366' }}>
          Historial de Eventos
        </Typography>

        {/* Búsqueda */}
        <Paper 
          elevation={2} 
          sx={{ p: 2, mb: 3, bgcolor: 'white', borderRadius: 1 }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por usuario, personal afectado o evento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                bgcolor: '#003366',
                '&:hover': { bgcolor: '#002244' },
                textTransform: 'none',
                minWidth: 120,
                whiteSpace: 'nowrap',
              }}
            >
              Buscar
            </Button>
          </Box>
        </Paper>

        {/* Tabla de Eventos */}
        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{ borderRadius: 2, overflow: 'hidden' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#003366' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5 }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5 }}>
                  Usuario Afectado
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5 }}>
                  Personal Afectado
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5 }}>
                  Fecha y Hora
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5 }}>
                  Evento
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      {searchQuery ? 'No se encontraron eventos' : 'No hay eventos registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eventos.map((evento) => (
                  <TableRow key={evento.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell sx={{ py: 2.5 }}>{evento.usuario}</TableCell>
                    <TableCell sx={{ py: 2.5 }}>{evento.usuarioAfectado}</TableCell>
                    <TableCell sx={{ py: 2.5 }}>{evento.personalAfectado}</TableCell>
                    <TableCell sx={{ py: 2.5, whiteSpace: 'nowrap' }}>{evento.fechaHora}</TableCell>
                    <TableCell sx={{ py: 2.5 }}>{evento.evento}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Actualizando cada 10 segundos • Mostrando {eventos.length} de {eventosOriginales.length} eventos
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Eventos;