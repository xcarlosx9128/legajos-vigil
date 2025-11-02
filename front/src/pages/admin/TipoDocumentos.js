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
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Search as SearchIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const TipoDocumentos = () => {
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoDocToDelete, setTipoDocToDelete] = useState(null);
  const [currentTipoDoc, setCurrentTipoDoc] = useState({
    nombre: '',
    descripcion: '',
    seccion: '',
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
      
      // Cargar secciones
      let allSecciones = [];
      let urlSecciones = '/secciones-legajo/?page_size=100';
      
      while (urlSecciones) {
        const response = await api.get(urlSecciones);
        const data = response.data;
        
        if (data.results) {
          allSecciones = [...allSecciones, ...data.results];
          urlSecciones = data.next ? data.next.replace(api.defaults.baseURL, '') : null;
        } else {
          allSecciones = data;
          urlSecciones = null;
        }
      }
      
      setTiposDocumento(allTiposDocumento);
      setSecciones(allSecciones);
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
        seccion: tipoDoc.seccion || '',
      });
    } else {
      setEditMode(false);
      setCurrentTipoDoc({
        nombre: '',
        descripcion: '',
        seccion: '',
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
      seccion: '',
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
        descripcion: currentTipoDoc.descripcion || null,
        seccion: currentTipoDoc.seccion || null,
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

  const handleOpenDeleteDialog = (tipoDoc) => {
    setTipoDocToDelete(tipoDoc);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTipoDocToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tipos-documento/${tipoDocToDelete.id}/`);
      setSuccess('Tipo de documento eliminado exitosamente');
      handleCloseDeleteDialog();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError('Error al eliminar el tipo de documento');
      handleCloseDeleteDialog();
    }
  };

  const getSeccionNombre = (seccionId) => {
    const seccion = secciones.find((s) => s.id === seccionId);
    return seccion ? seccion.nombre : '--';
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
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '30%' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '35%' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '15%' }}>Sección</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '15%' }}>Acciones</TableCell>
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
                  <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>
                    {getSeccionNombre(tipoDoc.seccion)}
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
                        onClick={() => handleOpenDeleteDialog(tipoDoc)}
                        sx={{
                          bgcolor: 'transparent',
                          border: '2px solid #d32f2f',
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          '&:hover': { 
                            bgcolor: '#d32f2f', 
                            '& .MuiSvgIcon-root': { color: 'white' } 
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
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
                placeholder="DNI"
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

            {/* Sección */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '200px' }}>
                Sección de Legajo:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={currentTipoDoc.seccion}
                  onChange={(e) => setCurrentTipoDoc({ ...currentTipoDoc, seccion: e.target.value })}
                  displayEmpty
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="">
                    <em>Sin sección</em>
                  </MenuItem>
                  {secciones.map((seccion) => (
                    <MenuItem key={seccion.id} value={seccion.id}>
                      {seccion.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

      {/* Dialog Eliminar */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
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
            ¿Estás seguro de eliminar el tipo de documento<br />
            {tipoDocToDelete?.nombre}?
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              onClick={handleCloseDeleteDialog}
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
              onClick={handleDelete}
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

export default TipoDocumentos;