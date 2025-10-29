import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  FolderOpen as FolderOpenIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const GestionarPersonal = () => {
  const navigate = useNavigate();
  
  // ✅ UN SOLO CAMPO DE BÚSQUEDA (busca por DNI O Nombre)
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ FILTROS SEPARADOS
  const [filters, setFilters] = useState({
    area: '',
    cargo: '',
    regimen: '',
    condicion: '',
  });
  
  const [personal, setPersonal] = useState([]);
  const [areas, setAreas] = useState([]);
  const [regimenes, setRegimenes] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [error, setError] = useState('');

  // Estados para modal de añadir
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPersonal, setNewPersonal] = useState({
    dni: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    area_actual_id: '',
    cargo_actual: '',
    regimen_actual_id: '',
    condicion_actual_id: '',
    documento: null, // Cambiado de foto a documento
  });
  const [dniSearch, setDniSearch] = useState('');
  const [loadingDNI, setLoadingDNI] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // ✅ Validar si todos los campos están completos
  const todosLosCamposCompletos = () => {
    return (
      newPersonal.dni?.length === 8 &&
      newPersonal.nombres?.trim() &&
      newPersonal.apellido_paterno?.trim() &&
      newPersonal.apellido_materno?.trim() &&
      newPersonal.area_actual_id &&
      newPersonal.cargo_actual &&
      newPersonal.regimen_actual_id &&
      newPersonal.condicion_actual_id &&
      newPersonal.documento !== null // Validar que haya un PDF
    );
  };

  useEffect(() => {
    cargarDatos();
    cargarTodoElPersonal();
  }, []);

  const cargarTodoElPersonal = async () => {
    setLoading(true);
    try {
      console.log('📥 Cargando TODO el personal...');
      const response = await api.get('/personal/');
      const data = response.data.results || response.data;
      console.log('✅ Personal cargado:', data.length, 'registros');
      setPersonal(data);
    } catch (err) {
      console.error('❌ Error al cargar personal:', err);
      setError('Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = async () => {
    setLoadingAreas(true);
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

      const [areasData, regimenesData, condicionesData, cargosData] = await Promise.all([
        obtenerTodos('/areas/'),
        obtenerTodos('/regimenes/'),
        obtenerTodos('/condiciones-laborales/'),
        obtenerTodos('/cargos/'),
      ]);
      
      setAreas(areasData);
      setRegimenes(regimenesData);
      setCondiciones(condicionesData);
      setCargos(cargosData);
      
      console.log(`✅ Cargados: ${areasData.length} áreas, ${cargosData.length} cargos, ${regimenesData.length} regímenes, ${condicionesData.length} condiciones`);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingAreas(false);
    }
  };

  // ✅ FUNCIÓN DE BÚSQUEDA Y FILTRADO CORREGIDA
  const aplicarFiltros = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      // ✅ BÚSQUEDA POR DNI O NOMBRE (en un solo campo)
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
        console.log('🔍 Buscando por DNI o Nombre:', searchQuery.trim());
      }
      
      // ✅ FILTROS ADICIONALES
      if (filters.area) {
        params.append('area', filters.area);
        console.log('🔍 Filtro Área:', filters.area);
      }
      if (filters.cargo) {
        params.append('cargo', filters.cargo);
        console.log('🔍 Filtro Cargo:', filters.cargo);
      }
      if (filters.regimen) {
        params.append('regimen', filters.regimen);
        console.log('🔍 Filtro Régimen:', filters.regimen);
      }
      if (filters.condicion) {
        params.append('condicion', filters.condicion);
        console.log('🔍 Filtro Condición:', filters.condicion);
      }

      // Si no hay ningún filtro, cargar TODO el personal
      if (!searchQuery.trim() && !filters.area && !filters.cargo && !filters.regimen && !filters.condicion) {
        console.log('📥 Sin filtros, cargando TODO el personal...');
        await cargarTodoElPersonal();
        return;
      }

      console.log('🌐 Llamando a API con parámetros:', params.toString());
      const response = await api.get(`/personal/?${params.toString()}`);
      const data = response.data.results || response.data;
      
      console.log('✅ Resultados encontrados:', data.length);
      setPersonal(data);
      
      if (data.length === 0) {
        setError('No se encontraron resultados con los criterios especificados');
      }
    } catch (err) {
      console.error('❌ Error al buscar personal:', err);
      setError('Error al buscar personal');
      setPersonal([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LIMPIAR TODOS LOS FILTROS
  const limpiarFiltros = () => {
    setSearchQuery('');
    setFilters({
      area: '',
      cargo: '',
      regimen: '',
      condicion: '',
    });
    setError('');
    cargarTodoElPersonal();
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    setDniSearch('');
    setNewPersonal({
      dni: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      area_actual_id: '',
      cargo_actual: '',
      regimen_actual_id: '',
      condicion_actual_id: '',
      documento: null,
    });
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setError('');
  };

  const handleBuscarDNI = async () => {
    if (!dniSearch.trim() || dniSearch.length !== 8) {
      setError('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }
    
    setLoadingDNI(true);
    setError('');
    
    try {
      const response = await fetch(`https://apiperu.dev/api/dni/${dniSearch}`, {
        headers: { 'Authorization': `Bearer ${process.env.REACT_APP_API_PERU_TOKEN}` }
      });
      
      if (!response.ok) throw new Error('DNI no encontrado');
      
      const data = await response.json();
      
      if (data.success) {
        setNewPersonal(prev => ({
          ...prev,
          nombres: data.data.nombres || '',
          apellido_paterno: data.data.apellido_paterno || '',
          apellido_materno: data.data.apellido_materno || '',
        }));
      }
    } catch (err) {
      setError('No se pudo consultar el DNI. Ingrese los datos manualmente.');
    } finally {
      setLoadingDNI(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewPersonal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea un PDF
      if (file.type === 'application/pdf') {
        setNewPersonal((prev) => ({
          ...prev,
          documento: file,
        }));
        setError(''); // Limpiar errores previos
      } else {
        setError('Solo se permiten archivos PDF');
        e.target.value = ''; // Limpiar el input
      }
    }
  };

  const handleAgregarPersonal = async () => {
    console.log('🟢 Iniciando proceso de agregar personal...');
    console.log('📋 Datos a enviar:', newPersonal);

    // Validaciones
    if (!newPersonal.dni || newPersonal.dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }
    if (!newPersonal.nombres?.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!newPersonal.apellido_paterno?.trim()) {
      setError('El apellido paterno es obligatorio');
      return;
    }
    if (!newPersonal.apellido_materno?.trim()) {
      setError('El apellido materno es obligatorio');
      return;
    }
    if (!newPersonal.area_actual_id) {
      setError('Debe seleccionar un área');
      return;
    }
    if (!newPersonal.cargo_actual) {
      setError('Debe seleccionar un cargo');
      return;
    }
    if (!newPersonal.regimen_actual_id) {
      setError('Debe seleccionar un régimen');
      return;
    }
    if (!newPersonal.condicion_actual_id) {
      setError('Debe seleccionar una condición laboral');
      return;
    }
    if (!newPersonal.documento) {
      setError('Debe adjuntar un documento PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('dni', newPersonal.dni);
      formData.append('nombres', newPersonal.nombres.trim());
      formData.append('apellido_paterno', newPersonal.apellido_paterno.trim());
      formData.append('apellido_materno', newPersonal.apellido_materno.trim());
      formData.append('area_actual_id', newPersonal.area_actual_id);
      formData.append('cargo_actual', newPersonal.cargo_actual);
      formData.append('regimen_actual_id', newPersonal.regimen_actual_id);
      formData.append('condicion_actual_id', newPersonal.condicion_actual_id);
      
      // Agregar documento PDF
      if (newPersonal.documento) {
        formData.append('documento', newPersonal.documento);
      }

      console.log('📤 Enviando a API...');
      const response = await api.post('/personal/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Personal agregado exitosamente:', response.data);
      
      handleCloseAddDialog();
      await cargarTodoElPersonal();
      
      alert('Personal agregado exitosamente');
    } catch (err) {
      console.error('❌ Error al agregar personal:', err);
      let errorMsg = 'Error al agregar el personal';
      
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          errorMsg = Object.entries(errors)
            .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
        }
      }
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleToggleRow = (personaId) => {
    setExpandedRow(expandedRow === personaId ? null : personaId);
  };

  const handleVisualizarLegajo = (persona) => {
    navigate(`/gestionar-personal/${persona.id}/legajo`);
  };

  const handleEditarLegajo = (persona) => {
    navigate(`/gestionar-personal/${persona.id}/legajo`);
  };

  const handleVisualizarEscalafon = (persona) => {
    navigate(`/gestionar-personal/${persona.id}/escalafon`);
  };

  const handleEditarEscalafon = (persona) => {
    navigate(`/gestionar-personal/${persona.id}/escalafon`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
          Gestionar Personal
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            bgcolor: '#003366',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            '&:hover': { bgcolor: '#002244' },
          }}
        >
          Añadir Nuevo Personal
        </Button>
      </Box>

      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={1.5} alignItems="center">
          {/* Búsqueda por DNI o Nombre */}
          <Grid item xs={12} md={3.5}>
            <TextField
              fullWidth
              label="Buscar por DNI o Nombre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              placeholder="Ej: 12345678 o Juan Pérez"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filtro por Área */}
          <Grid item xs={6} md={1.75}>
            <FormControl fullWidth size="small">
              <InputLabel>Área</InputLabel>
              <Select
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                label="Área"
                sx={{ minWidth: '120px' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Cargo */}
          <Grid item xs={6} md={1.75}>
            <FormControl fullWidth size="small">
              <InputLabel>Cargo</InputLabel>
              <Select
                value={filters.cargo}
                onChange={(e) => setFilters({ ...filters, cargo: e.target.value })}
                label="Cargo"
                sx={{ minWidth: '120px' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {cargos.map((cargo) => (
                  <MenuItem key={cargo.id} value={cargo.id}>
                    {cargo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Régimen */}
          <Grid item xs={6} md={1.75}>
            <FormControl fullWidth size="small">
              <InputLabel>Régimen</InputLabel>
              <Select
                value={filters.regimen}
                onChange={(e) => setFilters({ ...filters, regimen: e.target.value })}
                label="Régimen"
                sx={{ minWidth: '140px' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {regimenes.map((regimen) => (
                  <MenuItem key={regimen.id} value={regimen.id}>
                    {regimen.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Condición */}
          <Grid item xs={6} md={1.75}>
            <FormControl fullWidth size="small">
              <InputLabel>Condición</InputLabel>
              <Select
                value={filters.condicion}
                onChange={(e) => setFilters({ ...filters, condicion: e.target.value })}
                label="Condición"
                sx={{ minWidth: '140px' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {condiciones.map((condicion) => (
                  <MenuItem key={condicion.id} value={condicion.id}>
                    {condicion.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botones de Acción */}
          <Grid item xs={12} md={1.5}>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={aplicarFiltros}
                disabled={loading}
                size="small"
                sx={{
                  bgcolor: '#00C853',
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: '90px',
                  '&:hover': { bgcolor: '#00A043' },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'BUSCAR'}
              </Button>
              <IconButton
                onClick={limpiarFiltros}
                disabled={loading}
                size="small"
                sx={{
                  color: '#F44336',
                  border: '1px solid #F44336',
                  '&:hover': { bgcolor: '#FFEBEE' },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensajes de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabla de Resultados */}
      {!loading && personal.length > 0 && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#003366' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre Completo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Área</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Régimen</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Condición Laboral</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personal.map((persona) => (
                <React.Fragment key={persona.id}>
                  <TableRow 
                    hover 
                    onClick={(e) => {
                      // No expandir si se hace clic en un botón
                      if (e.target.closest('button')) return;
                      handleToggleRow(persona.id);
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <TableCell>{persona.dni}</TableCell>
                    <TableCell sx={{ textTransform: 'uppercase' }}>
                      {persona.nombre_completo || 
                       `${persona.apellido_paterno || ''} ${persona.apellido_materno || ''}, ${persona.nombres || ''}`.trim() || 
                       '-'}
                    </TableCell>
                    <TableCell>{persona.cargo_nombre || persona.cargo_actual || '-'}</TableCell>
                    <TableCell>{persona.area_nombre || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={persona.regimen_nombre || '-'} 
                        size="small"
                        sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={persona.condicion_nombre || '-'} 
                        size="small"
                        sx={{ bgcolor: '#FFF3E0', color: '#F57C00' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisualizarLegajo(persona);
                          }}
                          sx={{
                            bgcolor: '#5C6BC0',
                            color: 'white',
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            px: 2,
                            '&:hover': { bgcolor: '#3F51B5' }
                          }}
                        >
                          Visualizar Legajo
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisualizarEscalafon(persona);
                          }}
                          sx={{
                            bgcolor: '#F44336',
                            color: 'white',
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            px: 2,
                            '&:hover': { bgcolor: '#E53935' }
                          }}
                        >
                          Visualizar Escalafón
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Fila expandida con opciones de edición */}
                  {expandedRow === persona.id && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 2, bgcolor: '#f9f9f9', borderBottom: '2px solid #003366' }}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pl: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FolderOpenIcon />}
                            onClick={() => handleEditarLegajo(persona)}
                            sx={{
                              bgcolor: '#5C6BC0',
                              color: 'white',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              px: 2,
                              '&:hover': { bgcolor: '#3F51B5' }
                            }}
                          >
                            Editar Legajo
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditarEscalafon(persona)}
                            sx={{
                              bgcolor: '#F44336',
                              color: 'white',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              px: 2,
                              '&:hover': { bgcolor: '#E53935' }
                            }}
                          >
                            Editar Escalafón
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Sin resultados */}
      {!loading && personal.length === 0 && !error && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No se encontraron resultados. Utilice los filtros para buscar personal.
          </Typography>
        </Paper>
      )}

      {/* Dialog de Añadir Nuevo Personal */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold' }}>
          Añadir Nuevo Personal
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* DNI con botón Buscar */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="DNI:"
                value={dniSearch}
                onChange={(e) => {
                  const valor = e.target.value;
                  setDniSearch(valor);
                  handleInputChange('dni', valor);
                }}
                placeholder="60605041"
                inputProps={{ maxLength: 8 }}
              />
              <Button
                variant="contained"
                onClick={handleBuscarDNI}
                disabled={true}
                sx={{
                  bgcolor: '#00C853',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  minWidth: '120px',
                  '&:hover': { bgcolor: '#00A043' },
                }}
              >
                {loadingDNI ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Nombre:"
              value={newPersonal.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
            />

            {/* Apellidos en la misma fila */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Apellido Paterno:"
                value={newPersonal.apellido_paterno}
                onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                placeholder="Ingrese apellido paterno"
              />

              <TextField
                fullWidth
                label="Apellido Materno:"
                value={newPersonal.apellido_materno}
                onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                placeholder="Ingrese apellido materno"
              />
            </Box>

            {/* Componente SearchableSelect para Área */}
            <SearchableSelect
              label="Área:"
              value={newPersonal.area_actual_id}
              options={areas}
              onChange={(value) => handleInputChange('area_actual_id', value)}
              placeholder="Buscar área..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Cargo */}
            <SearchableSelect
              label="Cargo:"
              value={newPersonal.cargo_actual}
              options={cargos}
              onChange={(value) => handleInputChange('cargo_actual', value)}
              placeholder="Buscar cargo..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Régimen */}
            <SearchableSelect
              label="Régimen:"
              value={newPersonal.regimen_actual_id}
              options={regimenes}
              onChange={(value) => handleInputChange('regimen_actual_id', value)}
              placeholder="Buscar régimen..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Condición Laboral */}
            <SearchableSelect
              label="Condición Laboral:"
              value={newPersonal.condicion_actual_id}
              options={condiciones}
              onChange={(value) => handleInputChange('condicion_actual_id', value)}
              placeholder="Buscar condición..."
              disabled={loadingAreas}
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PdfIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: newPersonal.documento ? '#00C853' : '#666',
                  borderColor: newPersonal.documento ? '#00C853' : '#ccc',
                  py: 1.5,
                }}
              >
                {newPersonal.documento ? newPersonal.documento.name : 'Adjuntar documento PDF (Obligatorio)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseAddDialog}
            variant="contained"
            sx={{
              bgcolor: '#4DD0E1',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#26C6DA' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log('🔴 BOTÓN CONFIRMAR CLICKEADO');
              handleAgregarPersonal();
            }}
            variant="contained"
            disabled={!todosLosCamposCompletos()}
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#d32f2f' },
              '&:disabled': { 
                bgcolor: '#ccc', 
                color: '#666',
                cursor: 'not-allowed' 
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionarPersonal;