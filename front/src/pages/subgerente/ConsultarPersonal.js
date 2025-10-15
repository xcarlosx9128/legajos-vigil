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
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ConsultarPersonal = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    area: '',
    regimen: '',
    condicion: '',
  });
  const [personal, setPersonal] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [error, setError] = useState('');
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const regimenes = ['276', '728', 'CAS', 'Locación de Servicios'];
  const condiciones = ['Contratado', 'Reincorporado', 'Funcionario', 'Nombrado'];

  // Cargar áreas al montar el componente
  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    setLoadingAreas(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/areas/`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Áreas cargadas:', response.data); // Debug
      setAreas(response.data);
    } catch (err) {
      console.error('Error completo al cargar áreas:', err);
      console.error('Response:', err.response);
      setError('Error al cargar las áreas. Verifique la conexión con el backend.');
    } finally {
      setLoadingAreas(false);
    }
  };

  // Buscar personal
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchValue.trim()) params.append('search', searchValue.trim());
      if (filters.area) params.append('area', filters.area);
      if (filters.regimen) params.append('regimen', filters.regimen);
      if (filters.condicion) params.append('condicion', filters.condicion);

      console.log('Buscando con params:', params.toString()); // Debug

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personal/buscar-filtros/?${params.toString()}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Personal encontrado:', response.data); // Debug
      setPersonal(response.data);
      
      if (response.data.length === 0) {
        setError('No se encontraron resultados con los criterios especificados');
      }
    } catch (err) {
      console.error('Error al buscar personal:', err);
      console.error('Response:', err.response);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Error al buscar personal');
      setPersonal([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    handleSearch();
  };

  // Ver Legajo
  const handleVerLegajo = async (personalData) => {
    setSelectedPersonal(personalData);
    setDialogType('legajo');
    setOpenDialog(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personal/${personalData.id}/legajo/`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Legajo cargado:', response.data); // Debug
      setSelectedPersonal({ ...personalData, legajo: response.data });
    } catch (err) {
      console.error('Error al cargar legajo:', err);
      console.error('Response:', err.response);
    }
  };

  // Ver Escalafón
  const handleVerEscalafon = async (personalData) => {
    setSelectedPersonal(personalData);
    setDialogType('escalafon');
    setOpenDialog(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personal/${personalData.id}/escalafon/`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Escalafón cargado:', response.data); // Debug
      setSelectedPersonal({ ...personalData, escalafon: response.data });
    } catch (err) {
      console.error('Error al cargar escalafón:', err);
      console.error('Response:', err.response);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPersonal(null);
    setDialogType('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Buscar Personal
      </Typography>

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
          {/* Campo de búsqueda principal */}
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

          {/* Filtro de Área */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: '200px',
              flex: '0 1 200px',
            }}
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
              {areas.length > 0 ? (
                areas.map((area) => (
                  <MenuItem key={area.id} value={area.nombre}>
                    {area.nombre}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  {loadingAreas ? 'Cargando áreas...' : 'No hay áreas disponibles'}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Filtro de Régimen */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: '180px',
              flex: '0 1 180px',
            }}
          >
            <InputLabel>Buscar Régimen</InputLabel>
            <Select
              value={filters.regimen}
              onChange={(e) => setFilters({ ...filters, regimen: e.target.value })}
              label="Buscar Régimen"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Todos</MenuItem>
              {regimenes.map((regimen) => (
                <MenuItem key={regimen} value={regimen}>
                  {regimen}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro de Condición Laboral */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: '220px',
              flex: '0 1 220px',
            }}
          >
            <InputLabel>Buscar Condición Laboral</InputLabel>
            <Select
              value={filters.condicion}
              onChange={(e) => setFilters({ ...filters, condicion: e.target.value })}
              label="Buscar Condición Laboral"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Todas</MenuItem>
              {condiciones.map((condicion) => (
                <MenuItem key={condicion} value={condicion}>
                  {condicion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botón Aplicar Filtros */}
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

        {/* Indicador de carga de áreas */}
        {loadingAreas && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Cargando áreas desde el backend...
            </Typography>
          </Box>
        )}

        {/* Debug info */}
        {areas.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="success.main">
              ✓ {areas.length} área(s) cargada(s) correctamente
            </Typography>
          </Box>
        )}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2, textAlign: 'center' }}>Acciones</TableCell>
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
                  <TableCell>{persona.cargo || 'Analista'}</TableCell>
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
                        bgcolor: persona.condicion_laboral === 'Reincorporado' ? '#fff3e0' : '#e8f5e9',
                        color: persona.condicion_laboral === 'Reincorporado' ? '#f57c00' : '#2e7d32',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleVerLegajo(persona)}
                        sx={{
                          bgcolor: '#1976d2',
                          fontSize: '0.7rem',
                          py: 0.5,
                          px: 1.5,
                          minWidth: '150px',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#1565c0',
                          },
                        }}
                      >
                        Visualizar Legajo
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<TimelineIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleVerEscalafon(persona)}
                        sx={{
                          bgcolor: '#d32f2f',
                          fontSize: '0.7rem',
                          py: 0.5,
                          px: 1.5,
                          minWidth: '150px',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#c62828',
                          },
                        }}
                      >
                        Visualizar Escalafón
                      </Button>
                    </Box>
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

      {/* Dialog para Ver Legajo */}
      <Dialog open={openDialog && dialogType === 'legajo'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#003366', color: 'white', fontWeight: 'bold' }}>
          Visualizar Legajo
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 2 }}>
          {selectedPersonal && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#003366', fontWeight: 'bold', mb: 3 }}>
                Datos Personales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">DNI:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedPersonal.dni}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Nombres Completos:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {`${selectedPersonal.apellido_paterno} ${selectedPersonal.apellido_materno}, ${selectedPersonal.nombres}`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Área:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedPersonal.area_nombre || selectedPersonal.area || 'Sin área'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Cargo:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedPersonal.cargo || 'Analista'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Régimen Laboral:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedPersonal.regimen_laboral || selectedPersonal.regimen || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Condición Laboral:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedPersonal.condicion_laboral || selectedPersonal.condicion || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Correo Electrónico:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedPersonal.correo || 'No disponible'}</Typography>
                </Grid>
              </Grid>

              {selectedPersonal.legajo && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#003366', fontWeight: 'bold' }}>
                    Documentos del Legajo
                  </Typography>
                  {selectedPersonal.legajo.documentos?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedPersonal.legajo.documentos.map((doc, index) => (
                        <Chip 
                          key={index} 
                          label={doc.nombre} 
                          color="primary"
                          onClick={() => window.open(doc.url, '_blank')}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Alert severity="info">No hay documentos disponibles en el legajo</Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Ver Escalafón */}
      <Dialog open={openDialog && dialogType === 'escalafon'} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 'bold' }}>
          Historial de Escalafón
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 2 }}>
          {selectedPersonal && (
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Personal: <span style={{ textTransform: 'uppercase' }}>{`${selectedPersonal.apellido_paterno} ${selectedPersonal.apellido_materno}, ${selectedPersonal.nombres}`}</span> - DNI: {selectedPersonal.dni}
              </Typography>

              {selectedPersonal.escalafon?.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Inicio</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Fin</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Área</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Régimen</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Condición</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Resolución</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPersonal.escalafon.map((registro, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{registro.fecha_inicio}</TableCell>
                          <TableCell>{registro.fecha_fin || 'Actual'}</TableCell>
                          <TableCell>{registro.area}</TableCell>
                          <TableCell>
                            <Chip label={registro.regimen} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={registro.condicion} 
                              size="small" 
                              color={registro.condicion === 'Nombrado' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => window.open(registro.resolucion_url, '_blank')}
                            >
                              {registro.resolucion}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No hay registros de escalafón disponibles para este personal
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#d32f2f' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultarPersonal;