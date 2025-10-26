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
  List,
  ListItem,
  ListItemText,
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
} from '@mui/icons-material';
import api from '../services/api';

// Categorías de documentos del legajo
const CATEGORIAS_LEGAJO = [
  { id: 1, nombre: 'Currículum Vitae Datos', tipos: ['CV', 'DECLARACION'] },
  { id: 2, nombre: 'Documentos Personales y Familiares del Trabajador', tipos: ['DNI', 'OTRO'] },
  { id: 3, nombre: 'Documentos de Estudio y de Capacitación', tipos: ['TITULO', 'CERTIFICADO'] },
  { id: 4, nombre: 'Documentos de la Carrera Laboral', tipos: ['CONTRATO', 'RESOLUCION'] },
  { id: 5, nombre: 'Documentos del Comportamiento Laboral', tipos: ['MEMORANDO', 'OTRO'] },
  { id: 6, nombre: 'Documentos Sobre Derechos Económicos', tipos: ['RESOLUCION', 'OTRO'] },
  { id: 7, nombre: 'Documentos sobre Obligaciones Económicas', tipos: ['RESOLUCION', 'OTRO'] },
  { id: 8, nombre: 'Documentos Sobre Producción Cultural', tipos: ['CERTIFICADO', 'OTRO'] },
  { id: 9, nombre: 'Documentos Varios', tipos: ['OTRO'] },
];

const EditarLegajo = () => {
  const { id } = useParams(); // ID del personal
  const navigate = useNavigate();
  
  const [personal, setPersonal] = useState(null);
  const [documentos, setDocumentos] = useState([]); // Inicializar como array vacío
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo_documento: '',
    nombre_documento: '',
    descripcion: '',
    archivo: null,
    numero_documento: '',
    fecha_documento: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [personalRes, documentosRes] = await Promise.all([
        api.get(`/personal/${id}/`),
        api.get(`/legajos/?personal=${id}`),
      ]);
      
      setPersonal(personalRes.data);
      
      // Manejar respuesta paginada o array directo
      const docs = documentosRes.data.results || documentosRes.data;
      setDocumentos(Array.isArray(docs) ? docs : []);
      
      console.log('✅ Documentos cargados:', docs);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setDocumentos([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setCategoriaSeleccionada(null);
    setNuevoDocumento({
      tipo_documento: '',
      nombre_documento: '',
      descripcion: '',
      archivo: null,
      numero_documento: '',
      fecha_documento: '',
    });
  };

  const handleAgregarDocumento = async () => {
    try {
      const formData = new FormData();
      formData.append('personal', id);
      formData.append('tipo_documento', nuevoDocumento.tipo_documento);
      formData.append('nombre_documento', nuevoDocumento.nombre_documento);
      
      if (nuevoDocumento.descripcion) {
        formData.append('descripcion', nuevoDocumento.descripcion);
      }
      if (nuevoDocumento.numero_documento) {
        formData.append('numero_documento', nuevoDocumento.numero_documento);
      }
      if (nuevoDocumento.fecha_documento) {
        formData.append('fecha_documento', nuevoDocumento.fecha_documento);
      }
      if (nuevoDocumento.archivo) {
        formData.append('archivo', nuevoDocumento.archivo);
      }

      await api.post('/legajos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Documento agregado exitosamente');
      handleCloseAddDialog();
      cargarDatos();
    } catch (err) {
      console.error('Error al agregar documento:', err);
      alert('Error al agregar documento');
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

  const documentosPorCategoria = (categoria) => {
    if (!Array.isArray(documentos)) {
      console.warn('documentos no es un array:', documentos);
      return [];
    }
    return documentos.filter(doc => categoria.tipos.includes(doc.tipo_documento));
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Cargando...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
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
        <Typography variant="body2" color="textSecondary">
          DNI: {personal?.dni}
        </Typography>
      </Paper>

      {/* Botón Agregar Documento Global */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAddDialog(CATEGORIAS_LEGAJO[0])}
          sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' } }}
        >
          Agregar Documento
        </Button>
      </Box>

      {/* Categorías con Acordeones */}
      {CATEGORIAS_LEGAJO.map((categoria) => {
        const docs = documentosPorCategoria(categoria);
        
        return (
          <Accordion key={categoria.id} defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: '#e0e0e0',
                '&:hover': { bgcolor: '#d0d0d0' }
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                {categoria.id}. {categoria.nombre} ({docs.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {docs.length > 0 ? (
                <List>
                  {docs.map((doc) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" sx={{ mr: 1 }}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton edge="end" sx={{ mr: 1 }}>
                            <DownloadIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleEliminarDocumento(doc.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'white'
                      }}
                    >
                      <ListItemText
                        primary={doc.nombre_documento}
                        secondary={`${doc.tipo_documento_display || doc.tipo_documento} - ${doc.fecha_documento || 'Sin fecha'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay documentos en esta categoría
                </Typography>
              )}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddDialog(categoria)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Agregar a esta categoría
              </Button>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Dialog de Agregar Documento */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white' }}>
          Agregar Documento - {categoriaSeleccionada?.nombre}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={nuevoDocumento.tipo_documento}
                onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, tipo_documento: e.target.value })}
                label="Tipo de Documento"
              >
                {categoriaSeleccionada?.tipos.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nombre del Documento"
              value={nuevoDocumento.nombre_documento}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, nombre_documento: e.target.value })}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={2}
              value={nuevoDocumento.descripcion}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })}
            />

            <TextField
              fullWidth
              label="Número de Documento (opcional)"
              value={nuevoDocumento.numero_documento}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, numero_documento: e.target.value })}
            />

            <TextField
              fullWidth
              type="date"
              label="Fecha del Documento"
              value={nuevoDocumento.fecha_documento}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, fecha_documento: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              {nuevoDocumento.archivo ? nuevoDocumento.archivo.name : 'Seleccionar Archivo'}
              <input
                type="file"
                hidden
                onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, archivo: e.target.files[0] })}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAddDialog}>Cancelar</Button>
          <Button 
            onClick={handleAgregarDocumento} 
            variant="contained"
            disabled={!nuevoDocumento.tipo_documento || !nuevoDocumento.nombre_documento}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditarLegajo;