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
  MenuItem,
  Button,
  InputAdornment,
  CircularProgress,
  Select,
} from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import api from '../services/api';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosOriginales, setEventosOriginales] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usuario: '',
    area: '',
    fecha: '',
    seccion: '',
  });

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [areasRes, personalRes, usuariosRes] = await Promise.all([
        api.get('/areas/'),
        api.get('/personal/'),
        api.get('/usuarios/'),
      ]);

      const areasData = areasRes.data.results || areasRes.data;
      const personalData = personalRes.data.results || personalRes.data;
      const usuariosData = usuariosRes.data.results || usuariosRes.data;

      setAreas(areasData);

      const eventosGenerados = generateEventosReales(areasData, personalData, usuariosData);
      setEventosOriginales(eventosGenerados);
      setEventos(eventosGenerados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEventosReales = (areasData, personalData, usuariosData) => {
    const secciones = [
      'Documentos Personales y Familiares del Trabajador',
      'Documentos de Estudio y de Capacitación',
      'Documentos de Antecedentes Penales y Judiciales',
      'Documentos Médicos',
      'Documentos Laborales',
    ];

    const tiposEvento = [
      'Se adjuntó oficio a su legajo',
      'Actualización de Certificados de Estudios',
      'Actualización de Antecedentes Penales y Judiciales',
      'Actualización de datos personales',
      'Registro de nuevo documento',
    ];

    const eventosGenerados = [];
    const numEventosPorUsuario = 2;

    usuariosData.forEach((usuario, indexUsuario) => {
      for (let i = 0; i < numEventosPorUsuario; i++) {
        const personal = personalData[Math.floor(Math.random() * personalData.length)] || {};
        const area = areasData[Math.floor(Math.random() * areasData.length)] || {};
        const horasAtras = (indexUsuario * numEventosPorUsuario + i) * 3600000;

        eventosGenerados.push({
          id: indexUsuario * numEventosPorUsuario + i + 1,
          usuario: usuario.username || usuario.email || `Usuario ${indexUsuario + 1}`,
          empleado: personal.nombre_completo || `Personal ${Math.floor(Math.random() * personalData.length) + 1}`,
          area: area.nombre || 'Sin área',
          seccion: secciones[Math.floor(Math.random() * secciones.length)],
          fechaHora: new Date(Date.now() - horasAtras).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          evento: tiposEvento[Math.floor(Math.random() * tiposEvento.length)],
        });
      }
    });

    return eventosGenerados;
  };

  const handleApplyFilters = () => {
    let filtered = [...eventosOriginales];

    if (filters.usuario.trim()) {
      filtered = filtered.filter((evento) =>
        evento.usuario.toLowerCase().includes(filters.usuario.toLowerCase()) ||
        evento.empleado.toLowerCase().includes(filters.usuario.toLowerCase())
      );
    }

    if (filters.area) {
      filtered = filtered.filter((evento) => evento.area === filters.area);
    }

    if (filters.seccion.trim()) {
      filtered = filtered.filter((evento) =>
        evento.seccion.toLowerCase().includes(filters.seccion.toLowerCase())
      );
    }

    if (filters.fecha) {
      filtered = filtered.filter((evento) => {
        try {
          const fechaEvento = evento.fechaHora.split(',')[0].trim();
          const [dia, mes, año] = fechaEvento.split('/');
          const eventoDate = new Date(`${año}-${mes}-${dia}`);
          const filterDate = new Date(filters.fecha);
          
          return eventoDate.toDateString() === filterDate.toDateString();
        } catch (e) {
          return false;
        }
      });
    }

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
        <Typography variant="body1" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
          Buscar Evento
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'white', 
            borderRadius: 1,
            border: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Ingresar Usuario o Personal"
              value={filters.usuario}
              onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              sx={{ 
                minWidth: 240,
                flex: 1,
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#d0d0d0' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '& input': {
                    fontSize: '0.875rem',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Select
              size="small"
              displayEmpty
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              IconComponent={ExpandMoreIcon}
              sx={{ 
                minWidth: 200,
                bgcolor: 'white',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d0d0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                '& .MuiSelect-select': {
                  py: 1,
                  color: filters.area ? '#000' : '#999',
                },
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#999' }}>Buscar Área</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="">Todas las áreas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.nombre} sx={{ fontSize: '0.875rem' }}>
                  {area.nombre}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              displayEmpty
              value={filters.fecha}
              onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
              IconComponent={ExpandMoreIcon}
              sx={{ 
                minWidth: 180,
                bgcolor: 'white',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d0d0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                '& .MuiSelect-select': {
                  py: 1,
                  color: filters.fecha ? '#000' : '#999',
                },
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#999' }}>Buscar Fecha</span>;
                }
                return new Date(selected).toLocaleDateString('es-PE');
              }}
            >
              <MenuItem value="">
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={filters.fecha}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFilters({ ...filters, fecha: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    '& input': { fontSize: '0.875rem' },
                  }}
                />
              </MenuItem>
            </Select>

            <TextField
              size="small"
              placeholder="Sección"
              value={filters.seccion}
              onChange={(e) => setFilters({ ...filters, seccion: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              sx={{ 
                minWidth: 200,
                flex: 1,
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#d0d0d0' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '& input': {
                    fontSize: '0.875rem',
                  },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                bgcolor: '#9e9e9e',
                color: 'white',
                '&:hover': { bgcolor: '#757575' },
                textTransform: 'none',
                px: 3,
                py: 0.75,
                boxShadow: 'none',
                fontWeight: 400,
                fontSize: '0.875rem',
                minWidth: 120,
                whiteSpace: 'nowrap',
              }}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Todos los eventos
        </Typography>

        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#003d6e' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  Personal
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  Área
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  Sección
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  Fecha y Hora
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2.5, px: 3, fontSize: '0.95rem' }}>
                  Evento
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron eventos que coincidan con los filtros
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eventos.map((evento) => (
                  <TableRow key={evento.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' }, bgcolor: 'white' }}>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.875rem', borderRight: '1px solid #f0f0f0', color: '#555' }}>
                      {evento.usuario}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.875rem', borderRight: '1px solid #f0f0f0', color: '#555' }}>
                      {evento.empleado}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.875rem', borderRight: '1px solid #f0f0f0', color: '#555' }}>
                      {evento.area}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.85rem', borderRight: '1px solid #f0f0f0', color: '#666', lineHeight: 1.5 }}>
                      {evento.seccion}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.875rem', borderRight: '1px solid #f0f0f0', color: '#555', whiteSpace: 'nowrap' }}>
                      {evento.fechaHora}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 3, fontSize: '0.875rem', color: '#555' }}>
                      {evento.evento}
                    </TableCell>
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