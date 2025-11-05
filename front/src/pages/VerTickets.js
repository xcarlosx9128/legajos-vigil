import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../services/api';

const VerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [ticketToComplete, setTicketToComplete] = useState(null);
  const [openSuccessCompleteDialog, setOpenSuccessCompleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, areasRes] = await Promise.all([
        api.get('/tickets/'),
        api.get('/areas/'),
      ]);
      
      setTickets(ticketsRes.data.results || ticketsRes.data);
      setAreas(areasRes.data.results || areasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarTicket = async (ticketId) => {
    setTicketToComplete(ticketId);
    setOpenConfirmDialog(true);
  };

  const handleConfirmCompletar = async () => {
    try {
      await api.patch(`/tickets/${ticketToComplete}/`, { estado: 'COMPLETADO' });
      setOpenConfirmDialog(false);
      setTicketToComplete(null);
      setOpenSuccessCompleteDialog(true);
    } catch (error) {
      console.error('Error al completar ticket:', error);
      alert('Error al completar el ticket');
    }
  };

  const handleSuccessCompleteDialogClose = () => {
    setOpenSuccessCompleteDialog(false);
    loadData();
  };

  const handleCancelCompletar = () => {
    setOpenConfirmDialog(false);
    setTicketToComplete(null);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const fechaStr = date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaStr = date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${fechaStr} ${horaStr}`;
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'PENDIENTE': '#FFC107',
      'COMPLETADO': '#4CAF50',
    };
    return colores[estado] || '#9E9E9E';
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch = 
      ticket.numero_ticket?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.apellido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.persona_responsable?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.observaciones?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchEstado = !filtroEstado || ticket.estado === filtroEstado;
    
    return matchSearch && matchEstado;
  }).sort((a, b) => {
    if (a.estado === 'PENDIENTE' && b.estado === 'COMPLETADO') return -1;
    if (a.estado === 'COMPLETADO' && b.estado === 'PENDIENTE') return 1;
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header SIN BOTÓN */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#003366', mb: 1 }}>
          Ver Tickets
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Tickets del sistema
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar por N°, nombre, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="COMPLETADO">Completado</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabla de Tickets */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#003366' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N°</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Apellido</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Persona Responsable</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Área</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Observaciones</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Inicio</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Cierre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                      {searchQuery || filtroEstado ? 'No se encontraron tickets' : 'No hay tickets registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <TableRow key={ticket.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {ticket.numero_ticket || index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>{ticket.nombre || '-'}</TableCell>
                    <TableCell>{ticket.apellido || '-'}</TableCell>
                    <TableCell>{ticket.persona_responsable || '-'}</TableCell>
                    <TableCell>{ticket.area_nombre || '-'}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 250, 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {ticket.observaciones || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.estado?.replace('_', ' ')}
                        size="small"
                        sx={{ 
                          bgcolor: getEstadoColor(ticket.estado),
                          color: 'white',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatearFecha(ticket.fecha_creacion)}</TableCell>
                    <TableCell>{formatearFecha(ticket.fecha_resolucion)}</TableCell>
                    <TableCell>
                      {ticket.estado === 'PENDIENTE' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleCompletarTicket(ticket.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Completar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Sistema Seguro para Tramitar Documentos Oficiales
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Mostrando {filteredTickets.length} de {tickets.length} tickets
          </Typography>
        </Box>
      </Paper>

      {/* Dialogs */}
      <Dialog open={openConfirmDialog} onClose={handleCancelCompletar} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          " SISTEMA DE GESTIÓN DE LEGAJOS DEL PERSONAL "
        </DialogTitle>
        <DialogContent sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            ¿Estás seguro de que quieres completar el Ticket?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button onClick={handleCancelCompletar} variant="contained" sx={{ bgcolor: '#4DD0E1', color: 'black', fontWeight: 'bold', px: 4 }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmCompletar} variant="contained" sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 'bold', px: 4 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSuccessCompleteDialog} onClose={handleSuccessCompleteDialogClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#003d6e' } }}>
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: 2, border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 4 }}>
            ¡Ticket completado con Éxito!
          </Typography>
          <Button onClick={handleSuccessCompleteDialogClose} sx={{ bgcolor: '#ff0000', color: 'white', fontWeight: 'bold', py: 1.5, px: 8 }}>
            Continuar
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default VerTickets;