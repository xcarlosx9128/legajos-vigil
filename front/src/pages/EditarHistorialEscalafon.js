import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const EditarHistorialEscalafon = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener ID del personal desde la URL
  const personalId = id;
  
  const [personal, setPersonal] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [areas, setAreas] = useState([]);
  const [regimenes, setRegimenes] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const [nuevoEscalafon, setNuevoEscalafon] = useState({
    area: '',
    cargo: '',
    regimen: '',
    condicion_laboral: '',
    fecha_inicio: '',
    fecha_fin: '',
    resolucion: '',
    documento_resolucion: null,
    observaciones: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [personalId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Función para obtener todos los registros paginados
      const obtenerTodos = async (endpoint) => {
        let allData = [];
        let url = endpoint;
        
        while (url) {
          const response = await api.get(url);
          const data = response.data;
          
          if (data.results) {
            allData = [...allData, ...data.results];
            url = data.next;
          } else {
            allData = data;
            url = null;
          }
        }
        
        return allData;
      };

      const [
        personalData,
        historialData,
        areasData,
        regimenesData,
        condicionesData,
        cargosData
      ] = await Promise.all([
        api.get(`/personal/${personalId}/`),
        api.get(`/escalafones/?personal=${personalId}`),
        obtenerTodos('/areas/'),
        obtenerTodos('/regimenes/'),
        obtenerTodos('/condiciones-laborales/'),
        obtenerTodos('/cargos/'),
      ]);

      setPersonal(personalData.data);
      setHistorial(historialData.data.results || historialData.data);
      setAreas(areasData);
      setRegimenes(regimenesData);
      setCondiciones(condicionesData);
      setCargos(cargosData);
      
      console.log('✅ Datos cargados correctamente');
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    // Pre-llenar con datos actuales del personal
    setNuevoEscalafon({
      area: personal.area_actual || '',
      cargo: personal.cargo_actual || '',
      regimen: personal.regimen_actual || '',
      condicion_laboral: personal.condicion_actual || '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      resolucion: '',
      documento_resolucion: null,
      observaciones: '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setNuevoEscalafon(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    setNuevoEscalafon(prev => ({
      ...prev,
      documento_resolucion: e.target.files[0]
    }));
  };

  const handleGuardarEscalafon = async () => {
    // Validaciones
    if (!nuevoEscalafon.area || !nuevoEscalafon.regimen || !nuevoEscalafon.condicion_laboral) {
      setError('Por favor complete los campos obligatorios: Área, Régimen y Condición Laboral');
      return;
    }

    if (!nuevoEscalafon.fecha_inicio) {
      setError('Por favor ingrese la fecha de inicio');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('personal', personalId);
      formData.append('area', nuevoEscalafon.area);
      formData.append('regimen', nuevoEscalafon.regimen);
      formData.append('condicion_laboral', nuevoEscalafon.condicion_laboral);
      formData.append('fecha_inicio', nuevoEscalafon.fecha_inicio);
      
      if (nuevoEscalafon.cargo) {
        formData.append('cargo', nuevoEscalafon.cargo);
      }
      if (nuevoEscalafon.fecha_fin) {
        formData.append('fecha_fin', nuevoEscalafon.fecha_fin);
      }
      if (nuevoEscalafon.resolucion) {
        formData.append('resolucion', nuevoEscalafon.resolucion);
      }
      if (nuevoEscalafon.observaciones) {
        formData.append('observaciones', nuevoEscalafon.observaciones);
      }
      if (nuevoEscalafon.documento_resolucion) {
        formData.append('documento_resolucion', nuevoEscalafon.documento_resolucion);
      }

      console.log('🚀 Guardando nuevo escalafón...');
      await api.post('/escalafones/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Actualizar datos actuales del personal
      const updateData = new FormData();
      updateData.append('area_actual', nuevoEscalafon.area);
      updateData.append('regimen_actual', nuevoEscalafon.regimen);
      updateData.append('condicion_actual', nuevoEscalafon.condicion_laboral);
      if (nuevoEscalafon.cargo) {
        updateData.append('cargo_actual', nuevoEscalafon.cargo);
      }

      await api.patch(`/personal/${personalId}/`, updateData);

      alert('Escalafón actualizado exitosamente');
      handleCloseEditDialog();
      cargarDatos();
    } catch (err) {
      console.error('Error al guardar escalafón:', err);
      setError(err.response?.data?.error || 'Error al guardar el escalafón');
    }
  };

  const handleBack = () => {
    navigate('/gestionar-personal');
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Cargando...</Box>;
  }

  if (!personal) {
    return <Box sx={{ p: 3 }}>No se encontró el personal</Box>;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
          Editar historial escalafon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Datos Actuales del Personal */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative' }}>
        {/* Botón Editar Escalafón */}
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleOpenEditDialog}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            bgcolor: '#003366',
            '&:hover': { bgcolor: '#002244' }
          }}
        >
          Editar Escalafon
        </Button>

        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, maxWidth: '800px' }}>
          <Typography sx={{ fontWeight: 'bold' }}>DNI:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.dni}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Nombre:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.nombres}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Apellidos:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.apellido_paterno} {personal.apellido_materno}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Área:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.area_actual_detalle?.nombre || 'Sin área'}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Cargo:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.cargo_actual || '-'}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Régimen:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.regimen_actual_detalle?.nombre || 'No especificado'}
          </Typography>

          <Typography sx={{ fontWeight: 'bold' }}>Condición Laboral:</Typography>
          <Typography sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
            {personal.condicion_actual_detalle?.nombre || 'No especificado'}
          </Typography>
        </Box>
      </Paper>

      {/* Historial de Escalafón */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#003366' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>N°</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Nombre y Apellidos</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Área</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Cargo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Régimen</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Condición Laboral</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Documento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Registro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historial.length > 0 ? (
              historial.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                    {personal.nombre_completo}
                  </TableCell>
                  <TableCell>{item.area_nombre || 'Sin área'}</TableCell>
                  <TableCell>{item.cargo || '-'}</TableCell>
                  <TableCell>{item.regimen_nombre || 'No especificado'}</TableCell>
                  <TableCell>{item.condicion_nombre || 'No especificado'}</TableCell>
                  <TableCell>
                    {item.documento_resolucion ? (
                      <Link
                        href={item.documento_resolucion}
                        target="_blank"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        Resolución N°{item.resolucion || item.id}.pdf
                        <PdfIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                      </Link>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.fecha_registro || item.fecha_inicio).toLocaleDateString('es-PE')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No hay historial de escalafón registrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Editar/Agregar Escalafón */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold' }}>
          Agregar Cambio al Escalafón
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" color="textSecondary">
              Registre el nuevo cambio en el escalafón del personal. Los datos actuales se actualizarán automáticamente.
            </Typography>

            {/* Área */}
            <SearchableSelect
              label="Área: *"
              value={nuevoEscalafon.area}
              options={areas}
              onChange={(value) => handleInputChange('area', value)}
              placeholder="Seleccionar área..."
            />

            {/* Cargo */}
            <SearchableSelect
              label="Cargo:"
              value={nuevoEscalafon.cargo}
              options={cargos}
              onChange={(value) => handleInputChange('cargo', value)}
              placeholder="Seleccionar cargo..."
            />

            {/* Régimen */}
            <SearchableSelect
              label="Régimen: *"
              value={nuevoEscalafon.regimen}
              options={regimenes}
              onChange={(value) => handleInputChange('regimen', value)}
              placeholder="Seleccionar régimen..."
            />

            {/* Condición Laboral */}
            <SearchableSelect
              label="Condición Laboral: *"
              value={nuevoEscalafon.condicion_laboral}
              options={condiciones}
              onChange={(value) => handleInputChange('condicion_laboral', value)}
              placeholder="Seleccionar condición..."
            />

            {/* Fechas */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Inicio: *"
                value={nuevoEscalafon.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="date"
                label="Fecha de Fin (opcional):"
                value={nuevoEscalafon.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Resolución */}
            <TextField
              fullWidth
              label="Número de Resolución:"
              value={nuevoEscalafon.resolucion}
              onChange={(e) => handleInputChange('resolucion', e.target.value)}
              placeholder="Ej: 1201201120"
            />

            {/* Documento */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PdfIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: '#666',
                  borderColor: '#ccc',
                  py: 1.5,
                }}
              >
                {nuevoEscalafon.documento_resolucion 
                  ? nuevoEscalafon.documento_resolucion.name 
                  : 'Subir documento de resolución (opcional)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {/* Observaciones */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones:"
              value={nuevoEscalafon.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="contained"
            sx={{
              bgcolor: '#757575',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#616161' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEscalafon}
            variant="contained"
            sx={{
              bgcolor: '#003366',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#002244' },
            }}
          >
            Guardar Cambio
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditarHistorialEscalafon;