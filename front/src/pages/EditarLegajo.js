// EditarLegajo.jsx - ACTUALIZADO CON CAMPO SECCION

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
} from '@mui/icons-material';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const EditarLegajo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [personal, setPersonal] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [tiposFiltrados, setTiposFiltrados] = useState([]);
  
  const [nuevoDocumento, setNuevoDocumento] = useState({
    seccion: '',
    tipo_documento: '',
    descripcion: '',
    archivo: null,
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  // Cargar TODOS los tipos de documento activos recursivamente
  const cargarTodosTipos = async () => {
    let todosLosTipos = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        console.log(`📝 Cargando página ${page} de tipos de documento...`);
        const response = await api.get(`/tipos-documento/activos/?page=${page}&page_size=100`);
        
        const resultados = response.data.results || response.data;
        const tiposArray = Array.isArray(resultados) ? resultados : [];
        
        todosLosTipos = [...todosLosTipos, ...tiposArray];
        
        if (response.data.next) {
          page++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`✅ Total de tipos activos cargados: ${todosLosTipos.length}`);
      return todosLosTipos;
    } catch (err) {
      console.error('❌ Error cargando tipos:', err);
      return [];
    }
  };

  const cargarDatos = async () => {
    try {
      console.log('🔄 Cargando datos del personal ID:', id);
      
      // Cargar tipos de documento PRIMERO
      const todosLosTipos = await cargarTodosTipos();
      setTiposDocumento(todosLosTipos);
      
      // Cargar solo secciones activas
      const [personalRes, documentosRes, seccionesRes] = await Promise.all([
        api.get(`/personal/${id}/`),
        api.get(`/legajos/?personal=${id}`),
        api.get('/secciones-legajo/activas/'),
      ]);
      
      setPersonal(personalRes.data);
      console.log('👤 Personal cargado:', personalRes.data);
      
      const docs = documentosRes.data.results || documentosRes.data;
      const documentosArray = Array.isArray(docs) ? docs : [];
      setDocumentos(documentosArray);
      console.log('📄 Documentos cargados:', documentosArray.length);
      
      const secs = seccionesRes.data.results || seccionesRes.data;
      const seccionesArray = Array.isArray(secs) ? secs : [];
      setSecciones(seccionesArray);
      console.log('📋 Secciones activas cargadas:', seccionesArray.length);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setDocumentos([]);
      setSecciones([]);
      setTiposDocumento([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = (seccion = null) => {
    if (seccion) {
      setSeccionSeleccionada(seccion.id);
      setNuevoDocumento({
        seccion: seccion.id,
        tipo_documento: '',
        descripcion: '',
        archivo: null,
      });
      setTiposFiltrados(tiposDocumento);
      console.log(`📝 Total de tipos disponibles:`, tiposDocumento.length);
    } else {
      setSeccionSeleccionada('');
      setNuevoDocumento({
        seccion: '',
        tipo_documento: '',
        descripcion: '',
        archivo: null,
      });
      setTiposFiltrados([]);
    }
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSeccionSeleccionada('');
    setTiposFiltrados([]);
    setNuevoDocumento({
      seccion: '',
      tipo_documento: '',
      descripcion: '',
      archivo: null,
    });
  };

  const handleSeccionChange = (seccionId) => {
    setSeccionSeleccionada(seccionId);
    setNuevoDocumento({
      ...nuevoDocumento,
      seccion: seccionId,
      tipo_documento: '',
    });
    
    setTiposFiltrados(tiposDocumento);
    console.log('📝 Total de tipos disponibles:', tiposDocumento.length);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        event.target.value = null;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no puede superar los 10MB');
        event.target.value = null;
        return;
      }
      setNuevoDocumento({ ...nuevoDocumento, archivo: file });
    }
  };

  const handleAgregarDocumento = async () => {
    if (!nuevoDocumento.seccion) {
      alert('Debe seleccionar una sección del legajo');
      return;
    }

    if (!nuevoDocumento.tipo_documento) {
      alert('Debe seleccionar un tipo de documento');
      return;
    }

    if (!nuevoDocumento.archivo) {
      alert('Debe seleccionar un archivo PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('personal', id);
      formData.append('seccion', nuevoDocumento.seccion);          // ⭐ AGREGADO
      formData.append('tipo_documento', nuevoDocumento.tipo_documento);
      formData.append('descripcion', nuevoDocumento.descripcion || '');
      formData.append('archivo', nuevoDocumento.archivo);

      console.log('📤 Enviando documento:');
      console.log('  - Personal ID:', id);
      console.log('  - Sección ID:', nuevoDocumento.seccion);
      console.log('  - Tipo Documento ID:', nuevoDocumento.tipo_documento);
      console.log('  - Descripción:', nuevoDocumento.descripcion);
      console.log('  - Archivo:', nuevoDocumento.archivo.name);

      await api.post('/legajos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Documento agregado exitosamente');
      handleCloseAddDialog();
      cargarDatos();
    } catch (err) {
      console.error('Error al agregar documento:', err);
      console.error('Respuesta del servidor:', err.response?.data);
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

  const documentosPorSeccion = (seccionId) => {
    if (!Array.isArray(documentos)) {
      return [];
    }
    // ⭐ ACTUALIZADO: Usar el campo seccion del modelo Legajo
    return documentos.filter(doc => doc.seccion === seccionId || doc.seccion_id === seccionId);
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

  const getCargoCompleto = () => {
    if (personal?.cargo_actual_detalle?.nombre) {
      return personal.cargo_actual_detalle.nombre;
    }
    if (personal?.cargo_nombre) {
      return personal.cargo_nombre;
    }
    if (personal?.cargo_actual) {
      return personal.cargo_actual;
    }
    return '-';
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#003366' }}>
              {personal?.nombre_completo}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">DNI</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {personal?.dni || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Área</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {personal?.area_actual_detalle?.nombre || personal?.area_nombre || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Cargo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {getCargoCompleto()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Régimen</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {personal?.regimen_actual_detalle?.nombre || personal?.regimen_nombre || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Condición Laboral</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {personal?.condicion_actual_detalle?.nombre || personal?.condicion_nombre || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Fecha de Ingreso</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {personal?.fecha_ingreso ? new Date(personal.fecha_ingreso).toLocaleDateString('es-PE') : '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
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

      {/* Acordeones con secciones activas */}
      {secciones.length > 0 ? (
        secciones.map((seccion) => {
          const docs = documentosPorSeccion(seccion.id);
          const totalDocs = seccion.orden === 9 && personal?.documento ? docs.length + 1 : docs.length;
          
          return (
            <Accordion key={seccion.id} defaultExpanded={false}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: seccion.color || '#1976d2',
                  color: 'white',
                  '&:hover': { bgcolor: seccion.color ? `${seccion.color}dd` : '#1565c0' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    {seccion.orden}. {seccion.nombre} ({totalDocs})
                  </Typography>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0 }}>
                {seccion.orden === 9 && personal?.documento && (
                  <Box sx={{ p: 3, bgcolor: '#E3F2FD', borderBottom: '3px solid #2196F3' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
                          📄 Documento Inicial del Personal
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Cargado al registrar al trabajador
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="primary" onClick={() => window.open(personal.documento, '_blank')} title="Visualizar">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="info" onClick={() => window.open(personal.documento, '_blank')} title="Descargar">
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {docs.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>TIPO</TableCell>
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
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                              {doc.tipo_documento_nombre || doc.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatFecha(doc.fecha_registro)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {doc.descripcion || 'Sin descripción'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <IconButton size="small" color="primary" onClick={() => handleVisualizarDocumento(doc)} title="Visualizar">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="info" onClick={() => handleDescargarDocumento(doc)} title="Descargar">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleEliminarDocumento(doc.id)} title="Eliminar">
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
                    {!(seccion.orden === 9 && personal?.documento) && (
                      <>
                        <Typography color="textSecondary" sx={{ mb: 2 }}>
                          No hay documentos en esta sección
                        </Typography>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenAddDialog(seccion)} size="small">
                          Agregar documento aquí
                        </Button>
                      </>
                    )}
                    {seccion.orden === 9 && personal?.documento && (
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenAddDialog(seccion)} size="small">
                        Agregar más documentos
                      </Button>
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No hay secciones activas disponibles</Typography>
        </Paper>
      )}

      {/* Dialog Agregar Documento */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white' }}>
          Agregar Documento
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Seleccionar Sección */}
            <FormControl fullWidth required>
              <InputLabel>Sección de Legajo *</InputLabel>
              <Select
                value={nuevoDocumento.seccion}
                onChange={(e) => handleSeccionChange(e.target.value)}
                label="Sección de Legajo *"
              >
                {secciones.map((seccion) => (
                  <MenuItem key={seccion.id} value={seccion.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, bgcolor: seccion.color, borderRadius: '4px' }} />
                      <Typography>{seccion.orden}. {seccion.nombre}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Searchable Select para Tipo de Documento */}
            {seccionSeleccionada && (
              <>
                <SearchableSelect
                  label="Tipo de Documento *"
                  value={nuevoDocumento.tipo_documento}
                  options={tiposFiltrados}
                  onChange={(tipoId) => setNuevoDocumento({ ...nuevoDocumento, tipo_documento: tipoId })}
                  placeholder="Buscar tipo de documento..."
                  required
                  disabled={!seccionSeleccionada}
                />
                
                <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', mt: -2 }}>
                  📝 {tiposFiltrados.length} tipos de documento activos disponibles
                </Typography>
              </>
            )}

            {/* Descripción */}
            <TextField
              fullWidth
              label="Descripción"
              value={nuevoDocumento.descripcion}
              onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })}
              placeholder="Descripción del documento"
              multiline
              rows={3}
            />

            {/* Seleccionar archivo */}
            <Box>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth
                sx={{ 
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  color: nuevoDocumento.archivo ? '#4CAF50' : 'inherit'
                }}
              >
                {nuevoDocumento.archivo ? (
                  <>✓ {nuevoDocumento.archivo.name}</>
                ) : (
                  'SELECCIONAR ARCHIVO PDF'
                )}
                <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Solo archivos PDF. Tamaño máximo: 10MB
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAddDialog} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleAgregarDocumento} 
            disabled={!nuevoDocumento.seccion || !nuevoDocumento.tipo_documento || !nuevoDocumento.archivo}
            variant="contained"
            sx={{ bgcolor: '#003366' }}
          >
            Agregar Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditarLegajo;