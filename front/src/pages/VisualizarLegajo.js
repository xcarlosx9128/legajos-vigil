import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import api from '../services/api';

const VisualizarLegajo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    cargarDatosYGenerarPDF();
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const cargarDatosYGenerarPDF = async () => {
    setLoading(true);
    setGenerandoPDF(true);
    
    try {
      // 1. Cargar secciones ACTIVAS con su orden
      const seccionesResponse = await api.get('/secciones-legajo/');
      const seccionesData = seccionesResponse.data.results || seccionesResponse.data;
      const seccionesActivas = seccionesData.filter(s => s.activo === true);
      seccionesActivas.sort((a, b) => (a.orden || 0) - (b.orden || 0));

      // 2. Cargar documentos del legajo
      const documentosResponse = await api.get(`/personal/${id}/legajo/`);
      const docs = documentosResponse.data || [];

      if (docs.length === 0) {
        setError('No hay documentos en el legajo para visualizar');
        setLoading(false);
        setGenerandoPDF(false);
        return;
      }

      // 3. Ordenar documentos por sección y fecha
      docs.sort((a, b) => {
        const seccionA = seccionesActivas.find(s => s.id === a.seccion_id);
        const seccionB = seccionesActivas.find(s => s.id === b.seccion_id);
        
        const ordenA = seccionA?.orden || 999;
        const ordenB = seccionB?.orden || 999;
        
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        
        const fechaA = new Date(a.fecha_creacion || 0);
        const fechaB = new Date(b.fecha_creacion || 0);
        return fechaA - fechaB;
      });

      // 4. Combinar PDFs automáticamente
      const pdfDoc = await PDFDocument.create();
      let documentosAgregados = 0;

      for (const doc of docs) {
        if (!doc.archivo) continue;

        try {
          const response = await fetch(doc.archivo);
          const arrayBuffer = await response.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((page) => pdfDoc.addPage(page));
          
          documentosAgregados++;
          console.log(`✅ Agregado: ${doc.seccion_nombre} - ${doc.tipo_documento_nombre}`);
        } catch (err) {
          console.error(`❌ Error al cargar PDF: ${doc.tipo_documento_nombre}`, err);
        }
      }

      if (documentosAgregados === 0) {
        setError('No se pudo cargar ningún documento');
        setLoading(false);
        setGenerandoPDF(false);
        return;
      }

      // 5. Generar URL del PDF combinado
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setError('');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF del legajo');
    } finally {
      setLoading(false);
      setGenerandoPDF(false);
    }
  };

  const handleVolver = () => {
    navigate('/gestionar-personal');
  };

  if (loading || generandoPDF) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Generando PDF del legajo...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Esto puede tomar unos segundos
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleVolver}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Simple */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
          sx={{ color: '#003366', borderColor: '#003366' }}
        >
          Volver
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
          Visualizar Legajo
        </Typography>
      </Box>

      {/* Solo el PDF */}
      {pdfUrl && (
        <Paper elevation={3}>
          <Box
            sx={{
              width: '100%',
              height: '85vh',
              overflow: 'hidden',
            }}
          >
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              title="Legajo Completo"
              style={{ border: 'none' }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default VisualizarLegajo;