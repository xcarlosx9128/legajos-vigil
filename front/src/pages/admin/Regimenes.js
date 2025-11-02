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

const Regimenes = () => {
  const [regimenes, setRegimenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [regimenToToggle, setRegimenToToggle] = useState(null);
  const [currentRegimen, setCurrentRegimen] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    loadRegimenes();
  }, []);

  const loadRegimenes = async () => {
    try {
      let allRegimenes = [];
      let url = '/regimenes/?page_size=100';
      
      // Cargar todas las páginas
      while (url) {
        const response = await api.get(url);
        const data = response.data;
        
        // Si la respuesta tiene results (paginado)
        if (data.results) {
          allRegimenes = [...allRegimenes, ...data.results];
          // Obtener la URL de la siguiente página
          url = data.next ? data.next.replace(api.defaults.baseURL, '') : null;
        } else {
          // Si no hay paginación, usar la data directamente
          allRegimenes = data;
          url = null;
        }
      }
      
      setRegimenes(allRegimenes);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar regímenes:', error);
      setError('Error al cargar regímenes');
      setLoading(false);
    }
  };

  const handleOpenDialog = (regimen = null) => {
    if (regimen) {
      setEditMode(true);
      setCurrentRegimen({
        id: regimen.id,
        nombre: regimen.nombre || '',
        descripcion: regimen.descripcion || '',
      });
    } else {
      setEditMode(false);
      setCurrentRegimen({
        nombre: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRegimen({
      nombre: '',
      descripcion: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentRegimen.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const dataToSend = {
        nombre: currentRegimen.nombre,
        descripcion: currentRegimen.descripcion || null,
      };

      if (editMode) {
        await api.patch(`/regimenes/${currentRegimen.id}/`, dataToSend);
      } else {
        await api.post('/regimenes/', dataToSend);
      }
      handleCloseDialog();
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar el régimen');
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadRegimenes();
  };

  const handleOpenStatusDialog = (regimen) => {
    setRegimenToToggle(regimen);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setRegimenToToggle(null);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !regimenToToggle.activo;
      await api.patch(`/regimenes/${regimenToToggle.id}/`, { activo: newStatus });
      setSuccess(`Régimen ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      handleCloseStatusDialog();
      loadRegimenes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado');
      handleCloseStatusDialog();
    }
  };

  const filteredRegimenes = regimenes.filter((regimen) =>
    regimen.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Buscar régimen
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
              Añadir Nuevo Régimen
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
            {filteredRegimenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron regímenes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRegimenes.map((regimen, index) => (
                <TableRow key={regimen.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                  <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                    {regimen.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {regimen.descripcion || '--'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      label={regimen.activo ? 'Activo' : 'Inactivo'}
                      color={regimen.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(regimen)}
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
                        onClick={() => handleOpenStatusDialog(regimen)}
                        sx={{
                          bgcolor: 'transparent',
                          border: `2px solid ${regimen.activo ? '#ff9800' : '#4caf50'}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: regimen.activo ? '#ff9800' : '#4caf50', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        {regimen.activo ? (
                          <ToggleOffIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                        ) : (
                          <ToggleOnIcon sx={{ fontSize: 18, color: '#4caf50' }} />
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
            {editMode ? 'Editar datos de Régimen' : 'Agregar Nuevo Régimen'}
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
                value={currentRegimen.nombre}
                onChange={(e) => setCurrentRegimen({ ...currentRegimen, nombre: e.target.value })}
                placeholder="276"
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
                value={currentRegimen.descripcion}
                onChange={(e) => setCurrentRegimen({ ...currentRegimen, descripcion: e.target.value })}
                placeholder="Descripción del régimen"
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
              disabled={!currentRegimen.nombre.trim()}
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
            {editMode ? '¡Se ha modificado el régimen con Éxito!' : '¡Se ha creado un nuevo régimen con Éxito!'}
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
            ¿Estás seguro de {regimenToToggle?.activo ? 'desactivar' : 'activar'} el régimen<br />
            {regimenToToggle?.nombre}?
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

export default Regimenes;