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

const SeccionesLegajo = () => {
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openStatusSuccessDialog, setOpenStatusSuccessDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [seccionToToggle, setSeccionToToggle] = useState(null);
  const [statusChangeMessage, setStatusChangeMessage] = useState('');
  const [currentSeccion, setCurrentSeccion] = useState({
    nombre: '',
    descripcion: '',
    color: '#1976d2',
    orden: '',
  });

  useEffect(() => {
    loadSecciones();
  }, []);

  const loadSecciones = async () => {
    try {
      let allSecciones = [];
      let url = '/secciones-legajo/?page_size=100';
      
      while (url) {
        const response = await api.get(url);
        const data = response.data;
        
        if (data.results) {
          allSecciones = [...allSecciones, ...data.results];
          url = data.next ? data.next.replace(api.defaults.baseURL, '') : null;
        } else {
          allSecciones = data;
          url = null;
        }
      }
      
      setSecciones(allSecciones);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar secciones:', error);
      setError('Error al cargar secciones de legajo');
      setLoading(false);
    }
  };

  const handleOpenDialog = (seccion = null) => {
    if (seccion) {
      setEditMode(true);
      setCurrentSeccion({
        id: seccion.id,
        nombre: seccion.nombre || '',
        descripcion: seccion.descripcion || '',
        color: seccion.color || '#1976d2',
        orden: seccion.orden !== null && seccion.orden !== undefined ? seccion.orden.toString() : '',
      });
    } else {
      setEditMode(false);
      
      // Calcular el siguiente orden disponible automáticamente
      let siguienteOrden = 1;
      if (secciones.length > 0) {
        const ordenes = secciones
          .map(s => s.orden || 0)
          .filter(o => !isNaN(o));
        
        if (ordenes.length > 0) {
          const maxOrden = Math.max(...ordenes);
          siguienteOrden = maxOrden + 1;
        }
      }
      
      setCurrentSeccion({
        nombre: '',
        descripcion: '',
        color: '#1976d2',
        orden: siguienteOrden.toString(),
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSeccion({
      nombre: '',
      descripcion: '',
      color: '#1976d2',
      orden: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validaciones
    if (!currentSeccion.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!currentSeccion.orden || currentSeccion.orden.trim() === '') {
      setError('El orden es obligatorio');
      return;
    }

    const ordenInt = parseInt(currentSeccion.orden);
    if (isNaN(ordenInt)) {
      setError('El orden debe ser un número válido');
      return;
    }

    try {
      const dataToSend = {
        nombre: currentSeccion.nombre.trim(),
        orden: ordenInt,
      };

      // Agregar descripción si tiene contenido
      if (currentSeccion.descripcion && currentSeccion.descripcion.trim()) {
        dataToSend.descripcion = currentSeccion.descripcion.trim();
      }

      // Agregar color
      dataToSend.color = currentSeccion.color || '#1976d2';

      console.log('Datos a enviar:', dataToSend);

      if (editMode) {
        await api.patch(`/secciones-legajo/${currentSeccion.id}/`, dataToSend);
      } else {
        await api.post('/secciones-legajo/', dataToSend);
      }
      handleCloseDialog();
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      // Manejar errores específicos
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.nombre) {
          setError(`Error en Nombre: ${errorData.nombre[0]}`);
        } else if (errorData.orden) {
          setError(`Error en Orden: ${errorData.orden[0]}`);
        } else {
          const errorMsg = errorData.detail || 
                           errorData.message || 
                           JSON.stringify(errorData) ||
                           'Error al guardar la sección de legajo';
          setError(errorMsg);
        }
      } else {
        setError('Error al guardar la sección de legajo');
      }
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadSecciones();
  };

  const handleOpenStatusDialog = (seccion) => {
    setSeccionToToggle(seccion);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSeccionToToggle(null);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !seccionToToggle.activo;
      const nombreSeccion = seccionToToggle.nombre;
      await api.patch(`/secciones-legajo/${seccionToToggle.id}/`, { activo: newStatus });
      setStatusChangeMessage(`Se ha ${newStatus ? 'activado' : 'desactivado'} la sección de legajo ${nombreSeccion} con éxito`);
      handleCloseStatusDialog();
      setOpenStatusSuccessDialog(true);
      loadSecciones();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado');
      handleCloseStatusDialog();
    }
  };

  const filteredSecciones = secciones.filter((seccion) =>
    seccion.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Buscar sección de legajo
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
              Añadir Nueva Sección de Legajo
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
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '30%' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '35%' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '7%' }}>Color</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '8%' }}>Orden</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '8%' }} align="center">Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '7%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSecciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron secciones de legajo
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSecciones.map((seccion, index) => (
                <TableRow key={seccion.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                  <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                    {seccion.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {seccion.descripcion || '--'}
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: seccion.color || '#1976d2',
                          border: '1px solid #ddd',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {seccion.color || '#1976d2'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {seccion.orden !== null && seccion.orden !== undefined ? seccion.orden : '--'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      label={seccion.activo ? 'Activo' : 'Inactivo'}
                      color={seccion.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(seccion)}
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
                        onClick={() => handleOpenStatusDialog(seccion)}
                        sx={{
                          bgcolor: 'transparent',
                          border: `2px solid ${seccion.activo ? '#4caf50' : '#f44336'}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: seccion.activo ? '#4caf50' : '#f44336', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        {seccion.activo ? (
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
            {editMode ? 'Editar datos de Sección de Legajo' : 'Agregar Nueva Sección de Legajo'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Nombre */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Nombre:*
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentSeccion.nombre}
                onChange={(e) => setCurrentSeccion({ ...currentSeccion, nombre: e.target.value })}
                placeholder="Datos Personales"
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
                Descripción (Opcional):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={currentSeccion.descripcion}
                onChange={(e) => setCurrentSeccion({ ...currentSeccion, descripcion: e.target.value })}
                placeholder="Descripción de la sección"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { border: 'none' } },
                }}
              />
            </Box>

            {/* Color */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Color:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                <TextField
                  type="color"
                  value={currentSeccion.color}
                  onChange={(e) => setCurrentSeccion({ ...currentSeccion, color: e.target.value })}
                  sx={{
                    width: 80,
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 1, 
                      '& fieldset': { border: 'none' },
                      height: 40,
                    },
                    '& input[type="color"]': {
                      cursor: 'pointer',
                      height: 36,
                      padding: '2px',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={currentSeccion.color}
                  onChange={(e) => setCurrentSeccion({ ...currentSeccion, color: e.target.value })}
                  placeholder="#1976d2"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { border: 'none' } },
                  }}
                />
              </Box>
            </Box>

            {/* Orden */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Orden:*
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={currentSeccion.orden}
                onChange={(e) => setCurrentSeccion({ ...currentSeccion, orden: e.target.value })}
                placeholder="Se calculará automáticamente"
                required
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
              disabled={!currentSeccion.nombre.trim() || !currentSeccion.orden.trim()}
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
            {editMode ? '¡Se ha modificado la sección de legajo con Éxito!' : '¡Se ha creado una nueva sección de legajo con Éxito!'}
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
            ¿Estás seguro de {seccionToToggle?.activo ? 'desactivar' : 'activar'} la sección de legajo<br />
            {seccionToToggle?.nombre}?
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

      {/* Dialog de Éxito Activar/Desactivar */}
      <Dialog 
        open={openStatusSuccessDialog} 
        onClose={() => setOpenStatusSuccessDialog(false)}
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
            {statusChangeMessage}
          </Typography>

          <Button
            onClick={() => setOpenStatusSuccessDialog(false)}
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

export default SeccionesLegajo;