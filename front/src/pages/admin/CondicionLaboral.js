import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Typography,
  Chip,
} from '@mui/material';
import {
  Edit,
  Search as SearchIcon,
  Archive as ArchiveIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const CondicionLaboral = () => {
  const [condiciones, setCondiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [condicionToToggle, setCondicionToToggle] = useState(null);
  const [currentCondicion, setCurrentCondicion] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    loadCondiciones();
  }, []);

  const loadCondiciones = async () => {
    try {
      const response = await api.get('/condiciones-laborales/');
      setCondiciones(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar condiciones:', error);
      setError('Error al cargar condiciones laborales');
      setLoading(false);
    }
  };

  const handleOpenDialog = (condicion = null) => {
    if (condicion) {
      setEditMode(true);
      setCurrentCondicion({
        id: condicion.id,
        nombre: condicion.nombre || '',
        descripcion: condicion.descripcion || '',
      });
    } else {
      setEditMode(false);
      setCurrentCondicion({
        nombre: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCondicion({
      nombre: '',
      descripcion: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentCondicion.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const dataToSend = {
        nombre: currentCondicion.nombre,
        descripcion: currentCondicion.descripcion || null,
      };

      if (editMode) {
        await api.patch(`/condiciones-laborales/${currentCondicion.id}/`, dataToSend);
      } else {
        await api.post('/condiciones-laborales/', dataToSend);
      }
      handleCloseDialog();
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar la condición laboral');
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadCondiciones();
  };

  const handleOpenStatusDialog = (condicion) => {
    setCondicionToToggle(condicion);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCondicionToToggle(null);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !condicionToToggle.activo;
      await api.patch(`/condiciones-laborales/${condicionToToggle.id}/`, { activo: newStatus });
      setSuccess(`Condición laboral ${newStatus ? 'activada' : 'desactivada'} exitosamente`);
      handleCloseStatusDialog();
      loadCondiciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado');
      handleCloseStatusDialog();
    }
  };

  const filteredCondiciones = condiciones.filter((condicion) =>
    condicion.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Alertas */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Barra de búsqueda */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: 'column' }}>
          <Box sx={{ typography: 'body2', color: '#666', mb: 1 }}>
            Buscar condición laboral
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 280,
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#d0d0d0' },
                  '&:hover fieldset': { borderColor: '#003366' },
                  '&.Mui-focused fieldset': { borderColor: '#003366' },
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

            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: '#0d47a1',
                '&:hover': { bgcolor: '#003366' },
                textTransform: 'none',
                px: 4,
                py: 1,
                borderRadius: 1,
                boxShadow: 'none',
                fontWeight: 500,
                ml: 'auto',
              }}
            >
              Añadir Nueva Condición Laboral
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0d3c6e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '5%' }}>N°</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '35%' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '40%' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '10%' }} align="center">Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '10%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCondiciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron condiciones laborales
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCondiciones.map((condicion, index) => (
                <TableRow key={condicion.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                  <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                    {condicion.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {condicion.descripcion || '--'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      label={condicion.activo ? 'Activo' : 'Inactivo'}
                      color={condicion.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(condicion)}
                        sx={{
                          bgcolor: 'transparent',
                          border: '2px solid #003366',
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { bgcolor: '#003366', '& .MuiSvgIcon-root': { color: 'white' } },
                        }}
                      >
                        <Edit sx={{ fontSize: 18, color: '#003366' }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenStatusDialog(condicion)}
                        sx={{
                          bgcolor: 'transparent',
                          border: `2px solid ${condicion.activo ? '#4caf50' : '#f44336'}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: condicion.activo ? '#4caf50' : '#f44336', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        {condicion.activo ? (
                          <ToggleOnIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                        ) : (
                          <ToggleOffIcon sx={{ fontSize: 18, color: '#f44336' }} />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Agregar/Editar */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            {editMode ? 'Editar datos de Condición Laboral' : 'Agregar Nueva Condición Laboral'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Nombre */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Nombre:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentCondicion.nombre}
                onChange={(e) => setCurrentCondicion({ ...currentCondicion, nombre: e.target.value })}
                placeholder="Nombrado"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { border: 'none' } },
                }}
              />
            </Box>

            {/* Descripción */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px', mt: 1 }}>
                Descripcion (Opcional):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={currentCondicion.descripcion}
                onChange={(e) => setCurrentCondicion({ ...currentCondicion, descripcion: e.target.value })}
                placeholder="Descripción de la condición laboral"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { border: 'none' } },
                }}
              />
            </Box>
          </Box>

          {/* Botones */}
          <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: 'center' }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                bgcolor: '#4DD0E1',
                color: 'black',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 1,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#26C6DA' },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!currentCondicion.nombre.trim()}
              sx={{
                bgcolor: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 1,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#cc0000' },
                '&:disabled': { bgcolor: '#999', color: '#ccc' },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de Éxito */}
      <Dialog 
        open={openSuccessDialog} 
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: 2, border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArchiveIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 4 }}>
            {editMode ? '¡Se ha modificado la condición laboral con Éxito!' : '¡Se ha creado una nueva condición laboral con Éxito!'}
          </Typography>

          <Button
            onClick={handleSuccessDialogClose}
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

      {/* Dialog Activar/Desactivar */}
      <Dialog 
        open={openStatusDialog} 
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 5, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: 2, border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArchiveIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
          </Box>

          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 4, lineHeight: 1.4 }}>
            ¿Estás seguro de {condicionToToggle?.activo ? 'desactivar' : 'activar'} la condición laboral<br />
            {condicionToToggle?.nombre}?
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              onClick={handleCloseStatusDialog}
              sx={{
                bgcolor: '#4DD0E1',
                color: 'black',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 1,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#26C6DA' },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleToggleStatus}
              sx={{
                bgcolor: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 1,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#cc0000' },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CondicionLaboral;