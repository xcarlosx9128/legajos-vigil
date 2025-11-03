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

const GestionAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openStatusSuccessDialog, setOpenStatusSuccessDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaToToggle, setAreaToToggle] = useState(null);
  const [statusChangeMessage, setStatusChangeMessage] = useState('');
  const [currentArea, setCurrentArea] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      let allAreas = [];
      let url = '/areas/?page_size=100';
      
      // Cargar todas las páginas
      while (url) {
        const response = await api.get(url);
        const data = response.data;
        
        // Si la respuesta tiene results (paginado)
        if (data.results) {
          allAreas = [...allAreas, ...data.results];
          // Obtener la URL de la siguiente página
          url = data.next ? data.next.replace(api.defaults.baseURL, '') : null;
        } else {
          // Si no hay paginación, usar la data directamente
          allAreas = data;
          url = null;
        }
      }
      
      setAreas(allAreas);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      setError('Error al cargar áreas');
      setLoading(false);
    }
  };

  const handleOpenDialog = (area = null) => {
    if (area) {
      setEditMode(true);
      setCurrentArea({
        id: area.id,
        nombre: area.nombre || '',
        codigo: area.codigo || '',
        descripcion: area.descripcion || '',
      });
    } else {
      setEditMode(false);
      setCurrentArea({
        nombre: '',
        codigo: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentArea({
      nombre: '',
      codigo: '',
      descripcion: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentArea.nombre.trim() || !currentArea.codigo.trim()) {
      setError('El nombre y código son obligatorios');
      return;
    }

    try {
      const dataToSend = {
        nombre: currentArea.nombre,
        codigo: currentArea.codigo,
        descripcion: currentArea.descripcion || null,
      };

      if (editMode) {
        await api.patch(`/areas/${currentArea.id}/`, dataToSend);
      } else {
        await api.post('/areas/', dataToSend);
      }
      handleCloseDialog();
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMsg = error.response?.data?.nombre?.[0] 
        || error.response?.data?.codigo?.[0]
        || error.response?.data?.detail 
        || 'Error al guardar área';
      setError(errorMsg);
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadAreas();
  };

  const handleOpenStatusDialog = (area) => {
    setAreaToToggle(area);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setAreaToToggle(null);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !areaToToggle.activo;
      await api.patch(`/areas/${areaToToggle.id}/`, { activo: newStatus });
      
      // Mensaje de éxito
      setStatusChangeMessage(newStatus ? 'activada' : 'desactivada');
      
      // Cerrar dialog de confirmación y abrir dialog de éxito
      handleCloseStatusDialog();
      setOpenStatusSuccessDialog(true);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado del área');
      handleCloseStatusDialog();
    }
  };

  const handleStatusSuccessDialogClose = () => {
    setOpenStatusSuccessDialog(false);
    setStatusChangeMessage('');
    loadAreas();
  };

  const filteredAreas = areas.filter((area) =>
    area.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.codigo?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Buscar area
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre o código"
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
              Añadir Nueva Area
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de áreas */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0d3c6e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '5%' }}>N°</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '30%' }}>Nombre de Area</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '15%' }}>Siglas de Area</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '30%' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '10%' }} align="center">Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '10%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron áreas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area, index) => (
                <TableRow key={area.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                  <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                    {area.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {area.codigo}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {area.descripcion || '--'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      label={area.activo ? 'Activo' : 'Inactivo'}
                      color={area.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(area)}
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
                        onClick={() => handleOpenStatusDialog(area)}
                        sx={{
                          bgcolor: 'transparent',
                          border: `2px solid ${area.activo ? '#4caf50' : '#f44336'}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: area.activo ? '#4caf50' : '#f44336', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        {area.activo ? (
                          <ToggleOffIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                        ) : (
                          <ToggleOnIcon sx={{ fontSize: 18, color: '#f44336' }} />
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

      {/* Dialog Agregar/Editar Área */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { bgcolor: '#003d6e', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            {editMode ? 'Editar datos de Area' : 'Agregar Nueva Area'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Nombre de Área */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Nombre de Area:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentArea.nombre}
                onChange={(e) => setCurrentArea({ ...currentArea, nombre: e.target.value })}
                placeholder="Gerencia de Administracion y Finanza"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { border: 'none' } },
                }}
              />
            </Box>

            {/* Siglas de Área */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Siglas de Area:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentArea.codigo}
                onChange={(e) => setCurrentArea({ ...currentArea, codigo: e.target.value.toUpperCase() })}
                placeholder="GAF"
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
                value={currentArea.descripcion}
                onChange={(e) => setCurrentArea({ ...currentArea, descripcion: e.target.value })}
                placeholder="Oficina encargada del presupuesto"
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
              disabled={!currentArea.nombre.trim() || !currentArea.codigo.trim()}
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

      {/* Dialog de Éxito (Crear/Editar) */}
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
            {editMode ? '¡Se ha modificado una area con Éxito!' : '¡Se ha creado un nuevo área con Éxito!'}
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

      {/* Dialog de Confirmación Activar/Desactivar */}
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
            ¿Estás seguro de {areaToToggle?.activo ? 'desactivar' : 'activar'} el área de<br />
            {areaToToggle?.nombre}?
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

      {/* Dialog de Éxito - Activar/Desactivar */}
      <Dialog 
        open={openStatusSuccessDialog} 
        onClose={handleStatusSuccessDialogClose}
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
            ¡El área ha sido {statusChangeMessage} con éxito!
          </Typography>

          <Button
            onClick={handleStatusSuccessDialogClose}
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

export default GestionAreas;