import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Backdrop,
} from '@mui/material';
import { Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo3 from '../../assets/images/logo3.png';
import logo2 from '../../assets/images/logo2.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de 5 segundos antes de hacer el login
    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Azul */}
      <Box
        sx={{
          bgcolor: '#003366',
          color: 'white',
          py: 2,
          px: 4,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SIGELP
        </Typography>
      </Box>

      {/* Contenido Principal */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Panel Izquierdo - Formulario */}
        <Box
          sx={{
            width: { xs: '100%', lg: '50%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'white',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            {/* Logo Superior - logo2 (Escudo Maynas) */}
            <Box
              component="img"
              src={logo2}
              alt="Logo Municipalidad de Maynas"
              sx={{
                width: '100%',
                maxWidth: '320px',
                height: 'auto',
                mb: 3,
                mx: 'auto',
                display: 'block',
              }}
            />

            {/* Título del Sistema */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#003366',
                textAlign: 'left',
                mb: 3,
                lineHeight: 1.4,
              }}
            >
              SISTEMA DE GESTIÓN DE
              <br />
              LEGAJOS DEL PERSONAL
            </Typography>

            {/* Alerta de Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Campo de Usuario */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: '#003366',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Ingrese Usuario
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="username"
                  name="username"
                  placeholder="Usuario"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Person sx={{ color: '#003366' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f5f5f5',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#003366',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#003366',
                      },
                    },
                  }}
                />
              </Box>

              {/* Campo de Contraseña */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: '#003366',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Ingrese contraseña
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f5f5f5',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#003366',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#003366',
                      },
                    },
                  }}
                />
              </Box>

              {/* Botón de Iniciar Sesión */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  bgcolor: '#003366',
                  '&:hover': {
                    bgcolor: '#002244',
                  },
                  '&:disabled': {
                    bgcolor: '#003366',
                    opacity: 0.6,
                  },
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Panel Derecho - Imagen */}
        <Box
          sx={{
            width: '50%',
            display: { xs: 'none', lg: 'block' },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={logo3}
            alt="Ciudad de Maynas"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        {/* Loading Overlay con animación de 3 puntos - MÁS TRANSPARENTE */}
        <Backdrop
          open={loading}
          sx={{
            position: 'absolute',
            zIndex: 9999,
            bgcolor: 'rgba(255, 255, 255, 0.5)', // Cambiado a 0.5 (más transparente)
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#003366',
                fontWeight: 'bold',
                letterSpacing: 2,
              }}
            >
              LOADING
            </Typography>
            
            {/* Tres puntos animados */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: '#003366',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${index * 0.16}s`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': {
                        transform: 'scale(0)',
                        opacity: 0.5,
                      },
                      '40%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Backdrop>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#003366',
          color: 'white',
          py: 2,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Sistema Seguro para Tramitar
        </Typography>
        <Typography variant="caption">
          Documentos Oficiales
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;