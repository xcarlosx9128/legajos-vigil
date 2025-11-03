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
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Estados para el modal de crear ticket
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newTicket, setNewTicket] = useState({
    nombre: '',
    apellido: '',
    persona_responsable: '',
    area: '',
    observaciones: '',
  });

  // Estados para el modal de confirmar completar
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [ticketToComplete, setTicketToComplete] = useState(null);

  // Estados para diálogos de éxito
  const [openSuccessCreateDialog, setOpenSuccessCreateDialog] = useState(false);
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

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setError('');
    setNewTicket({
      nombre: '',
      apellido: '',
      persona_responsable: '',
      area: '',
      observaciones: '',
    });
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setNewTicket(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTicket = async () => {
    // Validaciones
    if (!newTicket.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!newTicket.apellido.trim()) {
      setError('El apellido es obligatorio');
      return;
    }
    if (!newTicket.observaciones.trim()) {
      setError('Las observaciones son obligatorias');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      await api.post('/tickets/', newTicket);
      
      // Cerrar modal de creación
      handleCloseCreateDialog();
      
      // Mostrar modal de éxito
      setOpenSuccessCreateDialog(true);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      setError(error.response?.data?.detail || 'Error al crear el ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSuccessCreateDialogClose = () => {
    setOpenSuccessCreateDialog(false);
    loadData();
  };

  const handleCompletarTicket = async (ticketId) => {
    setTicketToComplete(ticketId);
    setOpenConfirmDialog(true);
  };

  const handleConfirmCompletar = async () => {
    try {
      await api.patch(`/tickets/${ticketToComplete}/`, { estado: 'COMPLETADO' });
      
      // Cerrar modal de confirmación
      setOpenConfirmDialog(false);
      setTicketToComplete(null);
      
      // Mostrar modal de éxito
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
    // Primero ordenar por estado: PENDIENTE antes que COMPLETADO
    if (a.estado === 'PENDIENTE' && b.estado === 'COMPLETADO') return -1;
    if (a.estado === 'COMPLETADO' && b.estado === 'PENDIENTE') return 1;
    
    // Si tienen el mismo estado, ordenar por fecha de creación (más reciente primero)
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#003366', mb: 1 }}>
            Tickets
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Tickets del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#003366',
            '&:hover': { bgcolor: '#002244' },
            textTransform: 'none',
            px: 3,
            py: 1.5,
          }}
          onClick={handleOpenCreateDialog}
        >
          Generar Nuevo Ticket
        </Button>
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
        
        {/* Footer */}
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Sistema Seguro para Tramitar Documentos Oficiales
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Mostrando {filteredTickets.length} de {tickets.length} tickets
          </Typography>
        </Box>
      </Paper>

      {/* Dialog para crear ticket */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold' }}>
          Generar Nuevo Ticket
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Nombre */}
            <TextField
              fullWidth
              label="Nombre *"
              value={newTicket.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ingrese el nombre"
            />

            {/* Apellido */}
            <TextField
              fullWidth
              label="Apellido *"
              value={newTicket.apellido}
              onChange={(e) => handleInputChange('apellido', e.target.value)}
              placeholder="Ingrese el apellido"
            />

            {/* Persona Responsable */}
            <TextField
              fullWidth
              label="Persona Responsable (Opcional)"
              value={newTicket.persona_responsable}
              onChange={(e) => handleInputChange('persona_responsable', e.target.value)}
              placeholder="Ingrese el nombre del responsable"
            />

            {/* Área */}
            <FormControl fullWidth>
              <InputLabel>Área (Opcional)</InputLabel>
              <Select
                value={newTicket.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                label="Área (Opcional)"
              >
                <MenuItem value="">Ninguna</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Observaciones */}
            <TextField
              fullWidth
              label="Observaciones *"
              value={newTicket.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              multiline
              rows={4}
              placeholder="Describa las observaciones del ticket"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseCreateDialog}
            variant="contained"
            disabled={creating}
            sx={{
              bgcolor: '#4DD0E1',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              '&:hover': { bgcolor: '#26C6DA' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTicket}
            variant="contained"
            disabled={creating}
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              '&:hover': { bgcolor: '#d32f2f' },
            }}
          >
            {creating ? 'Creando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar completar ticket */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={handleCancelCompletar} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          " SISTEMA DE GESTIÓN DE LEGAJOS DEL PERSONAL "
        </DialogTitle>
        <DialogContent sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            ¿Estás seguro de que quieres completar el Ticket?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Esta acción marcará el ticket como completado y registrará la fecha de cierre
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelCompletar}
            variant="contained"
            sx={{
              bgcolor: '#4DD0E1',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#26C6DA' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmCompletar}
            variant="contained"
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#d32f2f' },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Éxito - Crear Ticket */}
      <Dialog 
        open={openSuccessCreateDialog} 
        onClose={handleSuccessCreateDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: 2, border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ConfirmationNumberIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 4 }}>
            ¡Ticket creado con Éxito!
          </Typography>

          <Button
            onClick={handleSuccessCreateDialogClose}
            sx={{
              bgcolor: '#ff0000',
              color: 'white',
              fontWeight: 'bold',
              py: 1.5,
              px: 8,
              textTransform: 'none',
              borderRadius: 1,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: '#cc0000' },
            }}
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog de Éxito - Completar Ticket */}
      <Dialog 
        open={openSuccessCompleteDialog} 
        onClose={handleSuccessCompleteDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: 2, border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 4 }}>
            ¡Ticket completado con Éxito!
          </Typography>

          <Button
            onClick={handleSuccessCompleteDialogClose}
            sx={{
              bgcolor: '#ff0000',
              color: 'white',
              fontWeight: 'bold',
              py: 1.5,
              px: 8,
              textTransform: 'none',
              borderRadius: 1,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: '#cc0000' },
            }}
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Tickets;