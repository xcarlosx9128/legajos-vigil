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

const TipoDocumentos = () => {
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openStatusSuccessDialog, setOpenStatusSuccessDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoDocToToggle, setTipoDocToToggle] = useState(null);
  const [statusChangeMessage, setStatusChangeMessage] = useState('');
  const [currentTipoDoc, setCurrentTipoDoc] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar tipos de documento
      let allTiposDocumento = [];
      let urlTipos = '/tipos-documento/?page_size=100';
      
      while (urlTipos) {
        const response = await api.get(urlTipos);
        const data = response.data;
        
        if (data.results) {
          allTiposDocumento = [...allTiposDocumento, ...data.results];
          urlTipos = data.next ? data.next.replace(api.defaults.baseURL, '') : null;
        } else {
          allTiposDocumento = data;
          urlTipos = null;
        }
      }
      
      setTiposDocumento(allTiposDocumento);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar tipos de documentos');
      setLoading(false);
    }
  };

  const handleOpenDialog = (tipoDoc = null) => {
    if (tipoDoc) {
      setEditMode(true);
      setCurrentTipoDoc({
        id: tipoDoc.id,
        nombre: tipoDoc.nombre || '',
        descripcion: tipoDoc.descripcion || '',
      });
    } else {
      setEditMode(false);
      setCurrentTipoDoc({
        nombre: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTipoDoc({
      nombre: '',
      descripcion: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentTipoDoc.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const dataToSend = {
        nombre: currentTipoDoc.nombre,
        descripcion: currentTipoDoc.descripcion || '',
      };

      if (editMode) {
        await api.patch(`/tipos-documento/${currentTipoDoc.id}/`, dataToSend);
      } else {
        await api.post('/tipos-documento/', dataToSend);
      }
      handleCloseDialog();
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar el tipo de documento');
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadData();
  };

  const handleOpenStatusDialog = (tipoDoc) => {
    setTipoDocToToggle(tipoDoc);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setTipoDocToToggle(null);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !tipoDocToToggle.activo;
      const nombreTipoDoc = tipoDocToToggle.nombre;
      await api.patch(`/tipos-documento/${tipoDocToToggle.id}/`, { activo: newStatus });
      setStatusChangeMessage(`Se ha ${newStatus ? 'activado' : 'desactivado'} el tipo de documento ${nombreTipoDoc} con éxito`);
      handleCloseStatusDialog();
      setOpenStatusSuccessDialog(true);
      loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado');
      handleCloseStatusDialog();
    }
  };

  const filteredTiposDocumento = tiposDocumento.filter((tipoDoc) =>
    tipoDoc.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Buscar tipo de documento
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
              Añadir Nuevo Tipo de Documento
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
            {filteredTiposDocumento.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron tipos de documentos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTiposDocumento.map((tipoDoc, index) => (
                <TableRow key={tipoDoc.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                  <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                    {tipoDoc.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {tipoDoc.descripcion || '--'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      label={tipoDoc.activo ? 'Activo' : 'Inactivo'}
                      color={tipoDoc.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(tipoDoc)}
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
                        onClick={() => handleOpenStatusDialog(tipoDoc)}
                        sx={{
                          bgcolor: 'transparent',
                          border: `2px solid ${tipoDoc.activo ? '#4caf50' : '#f44336'}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: tipoDoc.activo ? '#4caf50' : '#f44336', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        {tipoDoc.activo ? (
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
            {editMode ? 'Editar datos de Tipo de Documento' : 'Agregar Nuevo Tipo de Documento'}
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
                value={currentTipoDoc.nombre}
                onChange={(e) => setCurrentTipoDoc({ ...currentTipoDoc, nombre: e.target.value })}
                placeholder="Ej: DNI, Memorándum, Solicitud"
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
                value={currentTipoDoc.descripcion}
                onChange={(e) => setCurrentTipoDoc({ ...currentTipoDoc, descripcion: e.target.value })}
                placeholder="Descripción del tipo de documento"
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
              disabled={!currentTipoDoc.nombre.trim()}
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
            {editMode ? '¡Se ha modificado el tipo de documento con Éxito!' : '¡Se ha creado un nuevo tipo de documento con Éxito!'}
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
            ¿Estás seguro de {tipoDocToToggle?.activo ? 'desactivar' : 'activar'} el tipo de documento<br />
            {tipoDocToToggle?.nombre}?
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

export default TipoDocumentos;