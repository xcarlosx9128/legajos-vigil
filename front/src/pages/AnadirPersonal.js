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

const AnadirPersonal = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  
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
    documento: null,
  });
  const [dniSearch, setDniSearch] = useState('');
  const [loadingDNI, setLoadingDNI] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

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
      newPersonal.documento !== null
    );
  };

  useEffect(() => {
    cargarDatos();
    cargarTodoElPersonal();
  }, []);

  const cargarTodoElPersonal = async () => {
    setLoading(true);
    try {
      const response = await api.get('/personal/');
      const data = response.data.results || response.data;
      setPersonal(data);
    } catch (err) {
      console.error('Error al cargar personal:', err);
      setError('Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = async () => {
    setLoadingAreas(true);
    try {
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
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingAreas(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (filters.area) params.append('area', filters.area);
      if (filters.cargo) params.append('cargo', filters.cargo);
      if (filters.regimen) params.append('regimen', filters.regimen);
      if (filters.condicion) params.append('condicion', filters.condicion);

      if (!searchQuery.trim() && !filters.area && !filters.cargo && !filters.regimen && !filters.condicion) {
        await cargarTodoElPersonal();
        return;
      }

      const response = await api.get(`/personal/?${params.toString()}`);
      const data = response.data.results || response.data;
      
      setPersonal(data);
      
      if (data.length === 0) {
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
      if (file.type === 'application/pdf') {
        setNewPersonal((prev) => ({
          ...prev,
          documento: file,
        }));
        setError('');
      } else {
        setError('Solo se permiten archivos PDF');
        e.target.value = '';
      }
    }
  };

  const handleAgregarPersonal = async () => {
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
      
      if (newPersonal.documento) {
        formData.append('documento', newPersonal.documento);
      }

      const response = await api.post('/personal/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      handleCloseAddDialog();
      await cargarTodoElPersonal();
      
      alert('Personal agregado exitosamente');
    } catch (err) {
      console.error('Error al agregar personal:', err);
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
    navigate(`/personal/${persona.id}/visualizar-legajo`);
  };

  const handleEditarLegajo = (persona) => {
    navigate(`/personal/${persona.id}/editar-legajo`);
  };

  const handleVisualizarEscalafon = (persona) => {
    navigate(`/personal/${persona.id}/visualizar-escalafon`);
  };

  const handleEditarEscalafon = (persona) => {
    navigate(`/personal/${persona.id}/editar-escalafon`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header CON BOTÓN */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
          Añadir Nuevo Personal
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

      {/* Filtros Expandidos */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Fila 1: Búsqueda */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Buscar por DNI o Nombre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              placeholder="Ej: 12345678 o Juan Pérez"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Fila 2: Filtros */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Área</InputLabel>
              <Select
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                label="Área"
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Cargo</InputLabel>
              <Select
                value={filters.cargo}
                onChange={(e) => setFilters({ ...filters, cargo: e.target.value })}
                label="Cargo"
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Régimen</InputLabel>
              <Select
                value={filters.regimen}
                onChange={(e) => setFilters({ ...filters, regimen: e.target.value })}
                label="Régimen"
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Condición Laboral</InputLabel>
              <Select
                value={filters.condicion}
                onChange={(e) => setFilters({ ...filters, condicion: e.target.value })}
                label="Condición Laboral"
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

          {/* Fila 3: Botones */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{
                  color: '#F44336',
                  borderColor: '#F44336',
                  '&:hover': { 
                    bgcolor: '#FFEBEE',
                    borderColor: '#F44336'
                  },
                  px: 3,
                  py: 1,
                }}
              >
                Limpiar Filtros
              </Button>
              <Button
                variant="contained"
                onClick={aplicarFiltros}
                disabled={loading}
                startIcon={<SearchIcon />}
                sx={{
                  bgcolor: '#00C853',
                  color: 'white',
                  '&:hover': { bgcolor: '#00A043' },
                  px: 4,
                  py: 1,
                }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

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

                  {/* FILA EXPANDIDA */}
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

            <SearchableSelect
              label="Área:"
              value={newPersonal.area_actual_id}
              options={areas}
              onChange={(value) => handleInputChange('area_actual_id', value)}
              placeholder="Buscar área..."
              disabled={loadingAreas}
            />

            <SearchableSelect
              label="Cargo:"
              value={newPersonal.cargo_actual}
              options={cargos}
              onChange={(value) => handleInputChange('cargo_actual', value)}
              placeholder="Buscar cargo..."
              disabled={loadingAreas}
            />

            <SearchableSelect
              label="Régimen:"
              value={newPersonal.regimen_actual_id}
              options={regimenes}
              onChange={(value) => handleInputChange('regimen_actual_id', value)}
              placeholder="Buscar régimen..."
              disabled={loadingAreas}
            />

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
            onClick={handleAgregarPersonal}
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

export default AnadirPersonal;