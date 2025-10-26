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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const GestionarPersonal = () => {
  const navigate = useNavigate();
  
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    area: '',
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
    foto: null,
  });
  const [dniSearch, setDniSearch] = useState('');
  const [loadingDNI, setLoadingDNI] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

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
      console.log('📋 Primer registro de ejemplo:', JSON.stringify(data[0], null, 2));
      console.log('🔍 Campos disponibles:', data[0] ? Object.keys(data[0]) : 'No hay registros');
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
          
          // Si tiene paginación
          if (data.results) {
            allData = [...allData, ...data.results];
            url = data.next; // Siguiente página
          } else {
            // Si no tiene paginación, devolver todo
            allData = data;
            url = null;
          }
        }
        
        return allData;
      };

      // Cargar todos los datos de forma paralela
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

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      if (searchValue.trim()) params.append('search', searchValue.trim());
      if (filters.area) params.append('area', filters.area);
      if (filters.regimen) params.append('regimen', filters.regimen);
      if (filters.condicion) params.append('condicion', filters.condicion);

      // Si no hay ningún filtro, cargar TODO el personal
      if (!searchValue.trim() && !filters.area && !filters.regimen && !filters.condicion) {
        console.log('📥 Sin filtros, cargando TODO el personal...');
        const response = await api.get('/personal/');
        const data = response.data.results || response.data;
        setPersonal(data);
        return;
      }

      const response = await api.get(`/personal/buscar-filtros/?${params.toString()}`);
      
      setPersonal(response.data);
      
      if (response.data.length === 0) {
        setError('No se encontraron resultados con los criterios especificados');
      }
    } catch (err) {
      console.error('Error al buscar personal:', err);
      setError('Error al buscar personal');
      setPersonal([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    handleSearch();
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
      foto: null,
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
      const response = await api.get(`/personal/buscar-dni/${dniSearch}/`);
      
      // Actualizar tanto dniSearch como newPersonal.dni para mantenerlos sincronizados
      setDniSearch(response.data.dni);
      
      setNewPersonal(prev => ({
        ...prev,
        dni: response.data.dni,
        nombres: response.data.nombres,
        apellido_paterno: response.data.apellido_paterno,
        apellido_materno: response.data.apellido_materno,
      }));
    } catch (err) {
      console.error('Error al buscar DNI:', err);
      setError('No se encontró información con ese DNI');
    } finally {
      setLoadingDNI(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewPersonal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewPersonal(prev => ({
      ...prev,
      foto: e.target.files[0]
    }));
  };

  const handleToggleRow = (personaId) => {
    setExpandedRow(expandedRow === personaId ? null : personaId);
  };

  const handleVisualizarLegajo = (persona) => {
    console.log('Visualizar Legajo:', persona);
    // TODO: Navegar a /personal/:id/legajo?modo=lectura
    // O abrir modal con documentos en modo lectura
    alert(`Visualizar Legajo de ${persona.nombre_completo}\n\nEsta funcionalidad mostrará todos los documentos del personal en modo lectura.`);
  };

  const handleVisualizarEscalafon = (persona) => {
    console.log('Visualizar Escalafón:', persona);
    // TODO: Mostrar modal con historial completo del escalafón
    alert(`Visualizar Escalafón de ${persona.nombre_completo}\n\nDNI: ${persona.dni}\nÁrea: ${persona.area_nombre || 'Sin área'}\nCargo: ${persona.cargo_nombre || '-'}\nRégimen: ${persona.regimen_nombre || '-'}\nCondición: ${persona.condicion_nombre || '-'}`);
  };

  const handleEditarLegajo = (persona) => {
    console.log('Editar Legajo:', persona);
    navigate(`/gestionar-personal/${persona.id}/legajo`);
  };

  const handleEditarEscalafon = (persona) => {
    console.log('Editar Escalafón:', persona);
    navigate(`/gestionar-personal/${persona.id}/escalafon`);
  };

  const handleAgregarPersonal = async () => {
    console.log('🔍 INICIANDO PROCESO DE AGREGAR PERSONAL');
    console.log('📋 Estado completo de newPersonal:', JSON.stringify(newPersonal, null, 2));
    
    // Validaciones
    if (!newPersonal.dni) {
      console.log('❌ FALTA DNI');
      setError('Por favor ingrese el DNI');
      return;
    }
    if (!newPersonal.nombres) {
      console.log('❌ FALTA NOMBRES');
      setError('Por favor ingrese el nombre');
      return;
    }
    if (!newPersonal.apellido_paterno) {
      console.log('❌ FALTA APELLIDO PATERNO');
      setError('Por favor ingrese el apellido paterno');
      return;
    }

    console.log('✅ VALIDACIÓN PASADA');
    console.log('📝 Datos a enviar:', newPersonal);

    try {
      const formData = new FormData();
      
      // Agregar cada campo al FormData
      Object.keys(newPersonal).forEach(key => {
        if (key !== 'foto') {
          const value = newPersonal[key];
          // Enviar incluso si es vacío o 0, excepto null/undefined
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
            console.log(`✅ Agregando ${key}:`, value);
          } else {
            console.log(`⚠️ Omitiendo ${key} (valor vacío):`, value);
          }
        }
      });
      
      if (newPersonal.foto) {
        formData.append('foto', newPersonal.foto);
        console.log('📎 Foto agregada:', newPersonal.foto.name);
      }

      // Mostrar todo lo que se enviará
      console.log('🚀 Enviando datos al servidor...');
      console.log('📦 FormData entries:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }

      const response = await api.post('/personal/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Personal agregado exitosamente:', response.data);
      
      handleCloseAddDialog();
      
      // Recargar TODO el personal
      console.log('🔄 Recargando lista completa de personal...');
      await cargarTodoElPersonal();
      
      alert('Personal agregado exitosamente');
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      
      // Mostrar error más detallado
      let errorMsg = 'Error al agregar personal';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else {
          // Mostrar todos los errores de validación
          const errors = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          errorMsg = errors || errorMsg;
        }
      }
      
      console.error('📢 ERROR FINAL:', errorMsg);
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con botón añadir */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Buscar Personal
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            bgcolor: '#003366',
            '&:hover': { bgcolor: '#002244' },
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
          }}
        >
          Añadir Nuevo Personal
        </Button>
      </Box>

      {/* Barra de Búsqueda y Filtros */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          bgcolor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 1
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Ingresar DNI, Nombre, Cargo"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ 
              minWidth: '280px',
              flex: '1 1 280px',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          <FormControl 
            size="small" 
            sx={{ minWidth: '200px', flex: '0 1 200px' }}
            disabled={loadingAreas}
          >
            <InputLabel>Buscar Área</InputLabel>
            <Select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              label="Buscar Área"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Todas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.nombre}>
                  {area.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '180px', flex: '0 1 180px' }}>
            <InputLabel>Buscar Régimen</InputLabel>
            <Select
              value={filters.regimen}
              onChange={(e) => setFilters({ ...filters, regimen: e.target.value })}
              label="Buscar Régimen"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Todos</MenuItem>
              {regimenes.map((regimen) => (
                <MenuItem key={regimen.id} value={regimen.nombre}>
                  {regimen.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '220px', flex: '0 1 220px' }}>
            <InputLabel>Buscar Condición Laboral</InputLabel>
            <Select
              value={filters.condicion}
              onChange={(e) => setFilters({ ...filters, condicion: e.target.value })}
              label="Buscar Condición Laboral"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Todas</MenuItem>
              {condiciones.map((condicion) => (
                <MenuItem key={condicion.id} value={condicion.nombre}>
                  {condicion.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={aplicarFiltros}
            disabled={loading}
            sx={{
              bgcolor: '#424242',
              color: 'white',
              textTransform: 'uppercase',
              fontWeight: 500,
              px: 3,
              minWidth: '160px',
              '&:hover': {
                bgcolor: '#212121',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Aplicar Filtros'}
          </Button>
        </Box>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2, width: '50px' }}>N°</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Nombre y Apellidos</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Área</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Cargo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Régimen</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Condición Laboral</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2, textAlign: 'center', minWidth: '240px' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personal.map((persona, index) => (
                <React.Fragment key={persona.id}>
                  {/* Fila principal */}
                  <TableRow 
                    hover 
                    onClick={() => handleToggleRow(persona.id)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: expandedRow === persona.id ? '#f5f5f5' : 'inherit',
                      '&:hover': {
                        bgcolor: '#f0f0f0'
                      }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                      {persona.nombre_completo || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{persona.dni || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {persona.area_nombre || 'Sin área'}
                    </TableCell>
                    <TableCell>{persona.cargo_nombre || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={persona.regimen_nombre || 'No especificado'} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={persona.condicion_nombre || 'No especificado'} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e8f5e9',
                          color: '#2e7d32',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleVisualizarLegajo(persona)}
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
                          onClick={() => handleVisualizarEscalafon(persona)}
                          sx={{
                            bgcolor: '#EF5350',
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

                  {/* Fila expandida */}
                  {expandedRow === persona.id && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 2, bgcolor: '#f9f9f9', borderBottom: '2px solid #003366' }}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pl: 3 }}>
                          <Button
                            variant="contained"
                            startIcon={<FolderOpenIcon />}
                            onClick={() => handleEditarLegajo(persona)}
                            sx={{
                              bgcolor: '#5C6BC0',
                              color: 'white',
                              textTransform: 'none',
                              px: 3,
                              '&:hover': { bgcolor: '#3F51B5' }
                            }}
                          >
                            Editar Legajo
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditarEscalafon(persona)}
                            sx={{
                              bgcolor: '#EF5350',
                              color: 'white',
                              textTransform: 'none',
                              px: 3,
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
                  color: '#666',
                  borderColor: '#ccc',
                  py: 1.5,
                }}
              >
                {newPersonal.foto ? newPersonal.foto.name : 'Subir foto o documento (opcional)'}
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx"
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
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#d32f2f' },
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