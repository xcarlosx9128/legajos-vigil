// front/src/components/SearchableSelect.js
import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const SearchableSelect = ({ 
  label, 
  value, 
  options = [], 
  onChange, 
  placeholder = "Buscar...",
  error = false,
  helperText = "",
  required = false,
  disabled = false,
  fullWidth = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef(null);

  // Actualizar el label cuando cambia el value
  useEffect(() => {
    if (value) {
      const selected = options.find(opt => opt.id === value);
      setSelectedLabel(selected ? selected.nombre : '');
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones
  const filteredOptions = options.filter(option =>
    option.nombre.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.id);
    setSelectedLabel(option.nombre);
    setSearchValue('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSelectedLabel('');
    setSearchValue('');
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const displayValue = isOpen ? searchValue : selectedLabel;

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={displayValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onClick={handleInputClick}
        onFocus={() => !disabled && setIsOpen(true)}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        InputProps={{
          readOnly: false,
          endAdornment: (
            <InputAdornment position="end">
              {selectedLabel && !disabled && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  sx={{ mr: 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              <ExpandMoreIcon 
                sx={{ 
                  color: disabled ? 'rgba(0, 0, 0, 0.26)' : 'rgba(0, 0, 0, 0.54)',
                  transition: 'transform 0.3s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  pointerEvents: 'none'
                }}
              />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            cursor: disabled ? 'default' : 'pointer',
          }
        }}
      />
      
      {isOpen && !disabled && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 300,
            overflow: 'auto',
            zIndex: 1300,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {filteredOptions.length > 0 ? (
            <List sx={{ py: 0 }}>
              {filteredOptions.map((option) => (
                <ListItem 
                  key={option.id} 
                  disablePadding
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemButton
                    selected={value === option.id}
                    onClick={() => handleSelect(option)}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.main',
                        }
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={option.nombre}
                      primaryTypographyProps={{
                        fontWeight: value === option.id ? 600 : 400
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchableSelect;