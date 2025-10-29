import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import api from '../services/api';

const EditarLegajo = () => {
  const { id } = useParams(); // ID del personal
  const navigate = useNavigate();
  
  const [personal, setPersonal] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]); // Los 9 tipos del SIGELP
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  
  // ⭐ FORMULARIO SIMPLIFICADO - Solo 3 campos
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo_documento: '',
    descripcion: '',
    archivo: null,
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      console.log('🔄 Cargando datos del personal ID:', id);
      
      const [personalRes, documentosRes, tiposRes] = await Promise.all([
        api.get(`/personal/${id}/`),
        api.get(`/legajos/?personal=${id}`),
        api.get('/tipos-documento/'),
      ]);
      
      setPersonal(personalRes.data);
      console.log('👤 Personal cargado:', personalRes.data);
      
      const docs = documentosRes.data.results || documentosRes.data;
      const documentosArray = Array.isArray(docs) ? docs : [];
      setDocumentos(documentosArray);
      console.log('📄 Documentos cargados:', documentosArray);
      console.log('📊 Total de documentos:', documentosArray.length);
      
      const tipos = tiposRes.data.results || tiposRes.data;
      const tiposArray = Array.isArray(tipos) ? tipos : [];
      setTiposDocumento(tiposArray);
      console.log('📋 Tipos de documento cargados:', tiposArray);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setDocumentos([]);
      setTiposDocumento([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = (tipo = null) => {
    setTipoSeleccionado(tipo);
    if (tipo) {
      setNuevoDocumento({
        tipo_documento: tipo.id,
        descripcion: '',
        archivo: null,
      });
    }
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setTipoSeleccionado(null);
    setNuevoDocumento({
      tipo_documento: '',
      descripcion: '',
      archivo: null,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        event.target.value = null;
        return;
      }
      // Validar tamaño máximo 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no puede superar los 10MB');
        event.target.value = null;
        return;
      }
      setNuevoDocumento({ ...nuevoDocumento, archivo: file });
    }
  };

  const handleAgregarDocumento = async () => {
    // Validar que haya archivo
    if (!nuevoDocumento.archivo) {
      alert('Debe seleccionar un archivo PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('personal', id);
      formData.append('tipo_documento', nuevoDocumento.tipo_documento);
      formData.append('descripcion', nuevoDocumento.descripcion || '');
      formData.append('archivo', nuevoDocumento.archivo);
      // La fecha_documento se establece automáticamente en el backend

      await api.post('/legajos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Documento agregado exitosamente');
      handleCloseAddDialog();
      cargarDatos();
    } catch (err) {
      console.error('Error al agregar documento:', err);
      alert('Error al agregar documento: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminarDocumento = async (documentoId) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      try {
        await api.delete(`/legajos/${documentoId}/`);
        alert('Documento eliminado');
        cargarDatos();
      } catch (err) {
        console.error('Error al eliminar documento:', err);
        alert('Error al eliminar documento');
      }
    }
  };

  const handleDescargarDocumento = (doc) => {
    if (doc.archivo) {
      window.open(doc.archivo, '_blank');
    }
  };

  const handleVisualizarDocumento = (doc) => {
    if (doc.archivo) {
      window.open(doc.archivo, '_blank');
    }
  };

  const documentosPorTipo = (tipoId) => {
    if (!Array.isArray(documentos)) {
      return [];
    }
    return documentos.filter(doc => doc.tipo_documento === tipoId);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/gestionar-personal')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
          Editar Legajo
        </Typography>
      </Box>

      {/* Información del Personal */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {personal?.nombre_completo}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>DNI:</strong> {personal?.dni}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Área:</strong> {personal?.area_nombre || '-'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Cargo:</strong> {personal?.cargo_actual || '-'}
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#003366' }}>
        Documentos del Legajo
      </Typography>

      {/* Botón Agregar Documento */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAddDialog()}
          sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' } }}
        >
          Agregar Documento
        </Button>
      </Box>

      {/* Acordeones con los 9 tipos de documentos del SIGELP */}
      {tiposDocumento.map((tipo) => {
        const docs = documentosPorTipo(tipo.id);
        
        return (
          <Accordion key={tipo.id} defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: tipo.color || '#1976d2',
                color: 'white',
                '&:hover': { bgcolor: tipo.color ? `${tipo.color}dd` : '#1565c0' }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {tipo.numero}. {tipo.nombre} ({docs.length})
              </Typography>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 0 }}>
              {docs.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>N°</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>FECHA</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>DESCRIPCIÓN</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>ACCIONES</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {docs.map((doc, index) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFecha(doc.fecha_documento)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {doc.descripcion || 'Sin descripción'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleVisualizarDocumento(doc)}
                              title="Visualizar"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleDescargarDocumento(doc)}
                              title="Descargar"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleEliminarDocumento(doc.id)}
                              title="Eliminar"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    No hay documentos en esta categoría
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenAddDialog(tipo)}
                    size="small"
                  >
                    Agregar documento aquí
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Dialog de Agregar Documento */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white' }}>
          Agregar Documento
          {tipoSeleccionado && ` - ${tipoSeleccionado.nombre}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={nuevoDocumento.tipo_documento}
                onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, tipo_documento: e.target.value })}
                label="Tipo de Documento"
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Descripción"
              value={nuevoDocumento.descripcion}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })}
              placeholder="Descripción del documento"
            />

            <Box>
              <Button variant="outlined" component="label" fullWidth>
                {nuevoDocumento.archivo ? <>📎 {nuevoDocumento.archivo.name}</> : 'Seleccionar archivo'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancelar</Button>
          <Button onClick={handleAgregarDocumento} disabled={!nuevoDocumento.archivo}>
            Agregar Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditarLegajo;
