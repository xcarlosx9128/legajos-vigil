import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const GestionarPersonal = () => {
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
    area: '',
    cargo: '',
    regimen: '',
    condicion_laboral: '',
    documento: null,
  });
  const [dniSearch, setDniSearch] = useState('');
  const [loadingDNI, setLoadingDNI] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

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
    setNewPersonal({
      dni: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      area: '',
      cargo: '',
      regimen: '',
      condicion_laboral: '',
      documento: null,
    });
    setDniSearch('');
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
      documento: e.target.files[0]
    }));
  };

  const handleAgregarPersonal = async () => {
    // Validaciones
    if (!newPersonal.dni || !newPersonal.nombres || !newPersonal.apellido_paterno) {
      setError('Por favor complete los campos obligatorios: DNI, Nombres y Apellidos');
      return;
    }

    try {
      const formData = new FormData();
      
      Object.keys(newPersonal).forEach(key => {
        if (newPersonal[key] && key !== 'documento') {
          formData.append(key, newPersonal[key]);
        }
      });
      
      if (newPersonal.documento) {
        formData.append('documento', newPersonal.documento);
      }

      await api.post('/personal/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      handleCloseAddDialog();
      handleSearch();
      alert('Personal agregado exitosamente');
    } catch (err) {
      console.error('Error al agregar personal:', err);
      setError(err.response?.data?.error || 'Error al agregar personal');
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>N°</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Nombre y Apellidos</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Área</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Cargo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Régimen</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Condición Laboral</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personal.map((persona, index) => (
                <TableRow key={persona.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                    {`${persona.apellido_paterno} ${persona.apellido_materno}, ${persona.nombres}`}
                  </TableCell>
                  <TableCell>{persona.dni}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {persona.area_nombre || persona.area || 'Sin área'}
                  </TableCell>
                  <TableCell>{persona.cargo || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={persona.regimen_laboral || persona.regimen || 'No especificado'} 
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
                      label={persona.condicion_laboral || persona.condicion || 'No especificado'} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#e8f5e9',
                        color: '#2e7d32',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                </TableRow>
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
                onChange={(e) => setDniSearch(e.target.value)}
                placeholder="60605041"
                inputProps={{ maxLength: 8 }}
              />
              <Button
                variant="contained"
                onClick={handleBuscarDNI}
                disabled={loadingDNI}
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

            <TextField
              fullWidth
              label="Apellidos:"
              value={`${newPersonal.apellido_paterno} ${newPersonal.apellido_materno}`.trim()}
              onChange={(e) => {
                const apellidos = e.target.value.split(' ');
                handleInputChange('apellido_paterno', apellidos[0] || '');
                handleInputChange('apellido_materno', apellidos[1] || '');
              }}
              placeholder="Apellido Paterno Apellido Materno"
            />

            {/* Componente SearchableSelect para Área */}
            <SearchableSelect
              label="Área:"
              value={newPersonal.area}
              options={areas}
              onChange={(value) => handleInputChange('area', value)}
              placeholder="Buscar área..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Cargo */}
            <SearchableSelect
              label="Cargo:"
              value={newPersonal.cargo}
              options={cargos}
              onChange={(value) => handleInputChange('cargo', value)}
              placeholder="Buscar cargo..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Régimen */}
            <SearchableSelect
              label="Régimen:"
              value={newPersonal.regimen}
              options={regimenes}
              onChange={(value) => handleInputChange('regimen', value)}
              placeholder="Buscar régimen..."
              disabled={loadingAreas}
            />

            {/* Componente SearchableSelect para Condición Laboral */}
            <SearchableSelect
              label="Condición Laboral:"
              value={newPersonal.condicion_laboral}
              options={condiciones}
              onChange={(value) => handleInputChange('condicion_laboral', value)}
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
                {newPersonal.documento ? newPersonal.documento.name : 'Arrastra documento y/o resolución'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
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