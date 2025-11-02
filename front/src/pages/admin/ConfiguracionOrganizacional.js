import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Badge as BadgeIcon,
  LibraryBooks as LibraryBooksIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ConfiguracionOrganizacional = () => {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 1,
      titulo: 'Condición Laboral',
      icon: <EngineeringIcon sx={{ fontSize: 60 }} />,
      path: '/admin/condicion-laboral',
      color: '#003366',
    },
    {
      id: 2,
      titulo: 'Regímenes',
      icon: <BadgeIcon sx={{ fontSize: 60 }} />,
      path: '/admin/regimenes',
      color: '#003366',
    },
    {
      id: 3,
      titulo: 'Secciones de Legajo',
      icon: <LibraryBooksIcon sx={{ fontSize: 60 }} />,
      path: '/admin/secciones-legajo',
      color: '#003366',
    },
    {
      id: 4,
      titulo: 'Tipo de Documentos',
      icon: <DescriptionIcon sx={{ fontSize: 60 }} />,
      path: '/admin/tipo-documentos',
      color: '#003366',
    },
    {
      id: 5,
      titulo: 'Áreas',
      icon: <BusinessIcon sx={{ fontSize: 60 }} />,
      path: '/admin/areas',
      color: '#003366',
    },
    {
      id: 6,
      titulo: 'Cargos de Personal',
      icon: <WorkIcon sx={{ fontSize: 60 }} />,
      path: '/admin/cargos-personal',
      color: '#003366',
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Título */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#003366',
            textAlign: 'center',
          }}
        >
          Configuración y Gestión Organizacional
        </Typography>
      </Box>

      {/* Grid de Tarjetas - 2 columnas y 3 filas */}
      <Grid container spacing={3} justifyContent="center">
        {opciones.map((opcion) => (
          <Grid item xs={12} sm={6} lg={6} xl={6} key={opcion.id} sx={{ maxWidth: '600px' }}>
            <Card
              sx={{
                bgcolor: '#E8EAF6',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '160px',
                minWidth: '400px',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                  bgcolor: '#C5CAE9',
                },
              }}
              onClick={() => handleCardClick(opcion.path)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  py: 3,
                  px: 4,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 3,
                    color: opcion.color,
                  }}
                >
                  {opcion.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#000',
                  }}
                >
                  {opcion.titulo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ConfiguracionOrganizacional;