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
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Switch,
  Typography,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search as SearchIcon,
  Visibility,
  VisibilityOff,
  PersonOutline as PersonOutlineIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [currentUsuario, setCurrentUsuario] = useState({
    username: '',
    email: '',
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    rol: '',
    password: '',
    password_confirm: '',
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios/');
      setUsuarios(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar usuarios');
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditMode(true);
      setCurrentUsuario({
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        dni: usuario.dni || '',
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        password: '',
        password_confirm: '',
      });
    } else {
      setEditMode(false);
      setCurrentUsuario({
        username: '',
        email: '',
        nombres: '',
        apellidos: '',
        dni: '',
        telefono: '',
        rol: '',
        password: '',
        password_confirm: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCurrentUsuario({
      username: '',
      email: '',
      nombres: '',
      apellidos: '',
      dni: '',
      telefono: '',
      rol: '',
      password: '',
      password_confirm: '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    try {
      if (editMode) {
        await api.patch(`/usuarios/${currentUsuario.id}/`, {
          email: currentUsuario.email,
          nombres: currentUsuario.nombres,
          apellidos: currentUsuario.apellidos,
          dni: currentUsuario.dni,
          telefono: currentUsuario.telefono,
          rol: currentUsuario.rol,
        });
        handleCloseDialog();
        setOpenSuccessDialog(true);
      } else {
        if (currentUsuario.password !== currentUsuario.password_confirm) {
          setError('Las contraseñas no coinciden');
          return;
        }
        await api.post('/usuarios/', currentUsuario);
        handleCloseDialog();
        setOpenSuccessDialog(true);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al guardar usuario');
    }
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    loadUsuarios();
  };

  const handleOpenDeleteDialog = (usuario) => {
    setUsuarioToDelete(usuario);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUsuarioToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/usuarios/${usuarioToDelete.id}/`);
      setSuccess('Usuario eliminado exitosamente');
      handleCloseDeleteDialog();
      loadUsuarios();
    } catch (error) {
      setError('Error al eliminar usuario');
      handleCloseDeleteDialog();
    }
  };

  const handleToggleActive = async (usuario) => {
    try {
      await api.post(`/usuarios/${usuario.id}/toggle_active/`);
      setSuccess(`Usuario ${usuario.is_active ? 'deshabilitado' : 'habilitado'} exitosamente`);
      loadUsuarios();
    } catch (error) {
      setError('Error al cambiar estado del usuario');
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchSearch = 
      usuario.nombre_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchEstado = 
      filterEstado === '' ||
      (filterEstado === 'ACTIVO' && usuario.is_active) ||
      (filterEstado === 'DESHABILITADO' && !usuario.is_active);
    
    return matchSearch && matchEstado;
  });

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

      {/* Barra de búsqueda y filtros */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: 'column' }}>
          <Box sx={{ typography: 'body2', color: '#666', mb: 1 }}>
            Buscar usuario
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Ingresar Nombre, email"
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

            <TextField
              select
              size="small"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              displayEmpty
              sx={{
                width: 180,
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#d0d0d0' },
                  '&:hover fieldset': { borderColor: '#003366' },
                },
              }}
            >
              <MenuItem value="">Buscar Estado</MenuItem>
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="DESHABILITADO">Deshabilitado</MenuItem>
            </TextField>

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
              Añadir Nuevo Usuario
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0d3c6e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '5%' }}>N°</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '15%' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '20%' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '20%' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '13%' }}>Rol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '14%' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, width: '13%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios.map((usuario, index) => (
              <TableRow key={usuario.id} sx={{ '&:hover': { bgcolor: '#f8f8f8' }, bgcolor: 'white' }}>
                <TableCell sx={{ py: 2.5, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>{usuario.username}</TableCell>
                <TableCell sx={{ textTransform: 'uppercase', fontSize: '0.875rem', py: 2.5 }}>
                  {usuario.nombre_completo}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>{usuario.email}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', py: 2.5 }}>{usuario.rol_display}</TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Switch
                      checked={usuario.is_active}
                      onChange={() => handleToggleActive(usuario)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' },
                        '& .MuiSwitch-track': { backgroundColor: '#bdbdbd' },
                      }}
                    />
                    <Box sx={{ fontSize: '0.75rem', fontWeight: 600, color: usuario.is_active ? '#4caf50' : '#f44336', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {usuario.is_active ? 'ACTIVO' : 'DESHABILITADO'}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenDialog(usuario)}
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
                      onClick={() => handleOpenDeleteDialog(usuario)}
                      sx={{
                        bgcolor: 'transparent',
                        border: '2px solid #d32f2f',
                        borderRadius: 1,
                        width: 36,
                        height: 36,
                        '&:hover': { bgcolor: '#d32f2f', '& .MuiSvgIcon-root': { color: 'white' } },
                      }}
                    >
                      <Delete sx={{ fontSize: 18, color: '#d32f2f' }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Agregar/Editar Usuario */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#003d6e',
            borderRadius: 2,
            border: '3px solid #4DD0E1',
          }
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            {editMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Usuario */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Usuario:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentUsuario.username}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, username: e.target.value })}
                disabled={editMode}
                placeholder="usuario123"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* Nombres */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Nombres:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentUsuario.nombres}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, nombres: e.target.value })}
                placeholder="Carlos"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* Apellidos */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Apellidos:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentUsuario.apellidos}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, apellidos: e.target.value })}
                placeholder="Pizango"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* DNI */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                DNI:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentUsuario.dni}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, dni: e.target.value })}
                placeholder="12345678"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* Teléfono */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Teléfono:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={currentUsuario.telefono}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, telefono: e.target.value })}
                placeholder="987654321"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Email:
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={currentUsuario.email}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, email: e.target.value })}
                placeholder="carlospizango@gmail.com"
                required
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>

            {/* Contraseña - Solo al crear */}
            {!editMode && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                    Contraseña:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={currentUsuario.password}
                    onChange={(e) => setCurrentUsuario({ ...currentUsuario, password: e.target.value })}
                    placeholder="contraseña123"
                    required
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '& fieldset': { border: 'none' },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                    Confirmar contraseña:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={currentUsuario.password_confirm}
                    onChange={(e) => setCurrentUsuario({ ...currentUsuario, password_confirm: e.target.value })}
                    placeholder="contraseña123"
                    required
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '& fieldset': { border: 'none' },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            )}

            {/* Rol */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, minWidth: '180px' }}>
                Rol:
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                value={currentUsuario.rol}
                onChange={(e) => setCurrentUsuario({ ...currentUsuario, rol: e.target.value })}
                required
                displayEmpty
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { border: 'none' },
                  },
                }}
              >
                <MenuItem value="" disabled>Seleccionar:</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="SUBGERENTE">Subgerente</MenuItem>
                <MenuItem value="ENCARGADO">Encargado de Archivo</MenuItem>
                <MenuItem value="COORDINADOR">Coordinador</MenuItem>
              </TextField>
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
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#26C6DA',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              sx={{
                bgcolor: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#cc0000',
                },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de Éxito (Crear/Editar) */}
      <Dialog 
        open={openSuccessDialog} 
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#003d6e',
            borderRadius: 2,
            border: '3px solid #4DD0E1',
          }
        }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '5px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 4 }}>
            {editMode ? '¡Usuario ha sido modificado con Éxito!' : '¡Usuario creado con Éxito!'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={handleSuccessDialogClose}
              sx={{
                bgcolor: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 8,
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#cc0000',
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#003d6e',
            borderRadius: 2,
            border: '3px solid #f44336',
          }
        }}
      >
        <DialogContent sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            ¿Estás seguro de eliminar este usuario?
          </Typography>

          <Typography variant="body1" sx={{ color: 'white', mb: 4 }}>
            Esta acción no se puede deshacer.
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
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#26C6DA',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              sx={{
                bgcolor: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#cc0000',
                },
              }}
            >
              Eliminar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default GestionUsuarios;