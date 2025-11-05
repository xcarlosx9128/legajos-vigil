import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import api from '../services/api';

const VisualizarEscalafon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    
    try {
      // 1. Cargar datos del personal
      const personalResponse = await api.get(`/personal/${id}/`);
      const personal = personalResponse.data;

      // 2. Cargar historial de escalafón
      const historialResponse = await api.get(`/escalafones/?personal=${id}`);
      const historial = historialResponse.data.results || historialResponse.data;

      if (!personal) {
        setError('No se encontró la información del personal');
        setLoading(false);
        return;
      }

      // 3. Generar PDF de información
      const doc = new jsPDF();
      
      // Configuración de colores
      const primaryColor = [0, 51, 102]; // #003366
      const secondaryColor = [100, 100, 100];

      // TÍTULO DEL DOCUMENTO
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORIAL ESCALAFÓN', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión de Legajos del Personal', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-PE')}`, 105, 33, { align: 'center' });

      // INFORMACIÓN DEL PERSONAL
      let yPosition = 50;
      
      doc.setFillColor(230, 230, 230);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL PERSONAL', 20, yPosition + 5.5);
      
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Datos en dos columnas
      const datosPersonal = [
        { label: 'DNI:', valor: personal.dni || '-' },
        { label: 'Nombres:', valor: personal.nombres || '-' },
        { label: 'Apellido Paterno:', valor: personal.apellido_paterno || '-' },
        { label: 'Apellido Materno:', valor: personal.apellido_materno || '-' },
        { label: 'Área Actual:', valor: personal.area_actual_detalle?.nombre || personal.area_nombre || '-' },
        { label: 'Cargo Actual:', valor: personal.cargo_nombre || personal.cargo_actual || '-' },
        { label: 'Régimen Actual:', valor: personal.regimen_actual_detalle?.nombre || personal.regimen_nombre || '-' },
        { label: 'Condición Laboral:', valor: personal.condicion_actual_detalle?.nombre || personal.condicion_nombre || '-' },
      ];

      datosPersonal.forEach((dato, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? 20 : 115;
        const y = yPosition + (row * 8);
        
        doc.setFont('helvetica', 'bold');
        doc.text(dato.label, x, y);
        doc.setFont('helvetica', 'normal');
        doc.text(dato.valor, x + 35, y);
      });

      yPosition += Math.ceil(datosPersonal.length / 2) * 8 + 10;

      // HISTORIAL ESCALAFÓN
      doc.setFillColor(230, 230, 230);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORIAL DE ESCALAFÓN', 20, yPosition + 5.5);
      
      yPosition += 12;

      if (historial.length === 0) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay registros en el historial de escalafón', 105, yPosition + 10, { align: 'center' });
      } else {
        // Preparar datos para la tabla
        const tableData = historial.map((item, index) => [
          (index + 1).toString(),
          item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-PE') : '-',
          item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es-PE') : 'Actual',
          item.area_nombre || '-',
          item.cargo || item.cargo_nombre || '-',
          item.regimen_nombre || '-',
          item.condicion_nombre || '-',
          item.documento_resolucion ? 'Sí' : 'No',
        ]);

        // Generar tabla con autoTable
        autoTable(doc, {
          startY: yPosition,
          head: [['N°', 'Fecha Inicio', 'Fecha Fin', 'Área', 'Cargo', 'Régimen', 'Condición', 'Doc.']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 30 },
            4: { cellWidth: 28 },
            5: { cellWidth: 28 },
            6: { cellWidth: 28 },
            7: { cellWidth: 12, halign: 'center' },
          },
          margin: { left: 15, right: 15 },
        });
      }

      // PIE DE PÁGINA
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${i} de ${pageCount}`,
          105,
          290,
          { align: 'center' }
        );
        doc.text(
          'Sistema de Gestión de Legajos del Personal - SIGELP',
          105,
          285,
          { align: 'center' }
        );
      }

      // 4. Convertir el PDF de información a ArrayBuffer
      const pdfInfoBytes = doc.output('arraybuffer');

      // 5. Combinar con los documentos del historial usando pdf-lib
      const pdfFinal = await PDFDocument.load(pdfInfoBytes);

      // Agregar documentos del historial al final
      for (const item of historial) {
        if (item.documento_resolucion) {
          try {
            console.log(`📄 Agregando documento: ${item.resolucion || item.id}`);
            const response = await fetch(item.documento_resolucion);
            const arrayBuffer = await response.arrayBuffer();
            
            // Cargar el PDF del documento
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            // Copiar todas las páginas del documento
            const pages = await pdfFinal.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => pdfFinal.addPage(page));
            
            console.log(`✅ Documento agregado correctamente`);
          } catch (err) {
            console.error(`❌ Error al cargar documento ${item.resolucion}:`, err);
          }
        }
      }

      // 6. Convertir PDF final a Blob y crear URL
      const pdfFinalBytes = await pdfFinal.save();
      const pdfBlob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      console.log('✅ PDF completo generado exitosamente');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF del escalafón');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/gestionar-personal');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Generando PDF del escalafón...
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
          Visualizar Escalafón
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
              title="Historial Escalafón"
              style={{ border: 'none' }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default VisualizarEscalafon;