import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    setDrawerOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Inicio', icon: <HomeIcon />, path: '/dashboard' },
    ];

    switch (user?.rol) {
      case 'ADMIN':
        return [
          ...baseItems,
          { text: 'Gestionar Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
          { text: 'Configuración y Gestión Organizacional', icon: <AccountTreeIcon />, path: '/admin/configuracion-organizacional' }, // ⭐ NUEVO
          { text: 'Gestionar Personal', icon: <PersonIcon />, path: '/gestionar-personal' },
          { text: 'Tickets', icon: <AssignmentIcon />, path: '/tickets' },
        ];
      
      case 'SUBGERENTE':
        return [
          ...baseItems,
          
          { text: 'Gestionar Personal', icon: <PeopleIcon />, path: '/gestionar-personal' },
          { text: 'Tickets', icon: <AssignmentIcon />, path: '/tickets' },
        ];
      
      case 'ENCARGADO':
        return [
          ...baseItems,
          { text: 'Gestionar Personal', icon: <PeopleIcon />, path: '/gestionar-personal' },
          { text: 'Tickets', icon: <AssignmentIcon />, path: '/tickets' },
          { text: 'Configuración', icon: <SettingsIcon />, path: '/encargado/configuracion' },
        ];
      
      case 'COORDINADOR':
        return [
          ...baseItems,
          { text: 'Gestionar Personal', icon: <PeopleIcon />, path: '/gestionar-personal' },
          { text: 'Tickets', icon: <AssignmentIcon />, path: '/tickets' },
          { text: 'Configuración', icon: <SettingsIcon />, path: '/coordinador/configuracion' },
        ];
      
      default:
        return baseItems;
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
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SIGELP
        </Typography>
      </Box>

      {/* Drawer/Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{
            width: 280,
            bgcolor: '#f5f5f5',
            height: '100%',
          }}
        >
          {/* Título del Sistema en el Drawer */}
          <Box sx={{ bgcolor: 'white', p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#003366',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                lineHeight: 1.3,
              }}
            >
              SISTEMA DE GESTIÓN DE
              <br />
              LEGAJOS DEL PERSONAL
            </Typography>
          </Box>

          {/* Menú Items */}
          <List>
            {getMenuItems().map((item) => (
              <ListItem
                key={item.text}
                button
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: '#e3f2fd',
                    '&:hover': {
                      bgcolor: '#bbdefb',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Box sx={{ color: '#003366' }}>{item.icon}</Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: { color: '#003366', fontWeight: 500 },
                  }}
                />
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Cerrar Sesión */}
            <ListItem button onClick={handleLogoutClick}>
              <ListItemIcon>
                <ExitToAppIcon sx={{ color: '#d32f2f' }} />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  sx: { color: '#d32f2f', fontWeight: 500 },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px - 56px)', // Header + Footer
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#003366',
          color: 'white',
          py: 2,
          px: 3,
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Sistema Seguro para Tramitar
        </Typography>
        <Typography variant="caption">Documentos Oficiales</Typography>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#003366',
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          " SISTEMA DE GESTIÓN DE
          <br />
          LEGAJOS DEL PERSONAL "
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ¿Estas seguro de que quieres cerrar Sesion?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Esta acción cerrará tu sesión actual de forma segura
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="contained"
            sx={{
              bgcolor: '#4DD0E1',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                bgcolor: '#26C6DA',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                bgcolor: '#d32f2f',
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

export default MainLayout;