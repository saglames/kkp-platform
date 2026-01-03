// pdfExport.js
// PDF export functionality using jsPDF library
// Feature 6: Export Calculator Results

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatWeight, formatDateTime, formatWeightNoUnit } from './formatters';

/**
 * Export single calculation to PDF
 * @param {Object} calculation - Calculation data
 * @param {string} calculation.urun_kodu - Product/fitting name
 * @param {string} calculation.kalite - Quality (A, B, C, D)
 * @param {number} calculation.adet - Quantity
 * @param {number} calculation.birim_agirlik - Unit weight
 * @param {number} calculation.toplam_agirlik - Total weight
 * @param {string} calculation.yapan - Who performed calculation
 * @param {string} calculation.hesaplama_tipi - Calculation type
 */
export const exportCalculationToPDF = (calculation) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('K.K.P. PLATFORM', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Ağırlık Hesaplama Raporu', 105, 30, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Calculation details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  let yPos = 50;

  doc.text(`Tarih: ${formatDateTime(new Date())}`, 20, yPos);
  yPos += 10;

  doc.text(`İşlemi Yapan: ${calculation.yapan || '-'}`, 20, yPos);
  yPos += 10;

  doc.text(`Hesaplama Tipi: ${calculation.hesaplama_tipi}`, 20, yPos);
  yPos += 15;

  // Product/Fitting info
  doc.setFont('helvetica', 'bold');
  doc.text('Ürün Bilgileri:', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Ürün: ${calculation.urun_kodu}`, 30, yPos);
  yPos += 8;

  if (calculation.kalite) {
    doc.text(`Kalite: ${calculation.kalite}`, 30, yPos);
    yPos += 8;
  }

  doc.text(`Adet: ${calculation.adet}`, 30, yPos);
  yPos += 15;

  // Weight calculation
  doc.setFont('helvetica', 'bold');
  doc.text('Hesaplama:', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Birim Ağırlık: ${formatWeight(calculation.birim_agirlik)}`, 30, yPos);
  yPos += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOPLAM AĞIRLIK: ${formatWeight(calculation.toplam_agirlik)}`, 30, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('K.K.P. Platform - Ürün Ağırlıkları Modülü', 105, 280, { align: 'center' });

  // Save PDF
  const filename = `Hesaplama_${calculation.urun_kodu.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Export batch calculation to PDF
 * @param {Object} batch - Batch calculation data
 * @param {Array} batch.calculations - Array of calculations
 * @param {number} batch.total_weight - Total weight
 * @param {string} batch.yapan - Who performed calculation
 */
export const exportBatchToPDF = (batch) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('K.K.P. PLATFORM', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Toplu Hesaplama Raporu', 105, 30, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Batch details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  let yPos = 50;

  doc.text(`Tarih: ${formatDateTime(new Date())}`, 20, yPos);
  yPos += 10;

  doc.text(`İşlemi Yapan: ${batch.yapan || '-'}`, 20, yPos);
  yPos += 10;

  doc.text(`Toplam Ürün: ${batch.calculations.length}`, 20, yPos);
  yPos += 15;

  // Table of calculations
  const tableData = batch.calculations.map((calc, index) => [
    index + 1,
    calc.urun_kodu,
    calc.kalite || '-',
    calc.adet,
    formatWeightNoUnit(calc.birim_agirlik),
    formatWeightNoUnit(calc.toplam_agirlik)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Ürün/Fitting', 'Kalite', 'Adet', 'Birim Ağ. (kg)', 'Toplam Ağ. (kg)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 }
  });

  // Total weight
  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOPLAM AĞIRLIK: ${formatWeight(batch.total_weight)}`, 20, finalY);

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('K.K.P. Platform - Ürün Ağırlıkları Modülü', 105, 280, { align: 'center' });

  // Save PDF
  const filename = `Toplu_Hesaplama_${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Export comparison to PDF
 * @param {Object} comparison - Comparison data
 * @param {string} comparison.urun_kodu - Product name
 * @param {number} comparison.adet - Quantity
 * @param {Array} comparison.qualities - Quality comparison data
 */
export const exportComparisonToPDF = (comparison) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('K.K.P. PLATFORM', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Kalite Karşılaştırma Raporu', 105, 30, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Product details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  let yPos = 50;

  doc.text(`Tarih: ${formatDateTime(new Date())}`, 20, yPos);
  yPos += 10;

  doc.text(`Ürün: ${comparison.urun_kodu}`, 20, yPos);
  yPos += 10;

  doc.text(`Adet: ${comparison.adet}`, 20, yPos);
  yPos += 15;

  // Table of qualities
  const tableData = comparison.qualities.map(q => [
    q.kalite,
    formatWeightNoUnit(q.birim_agirlik),
    formatWeightNoUnit(q.toplam_agirlik),
    formatWeightNoUnit(q.fark_kg),
    q.fark_yuzde > 0 ? `+${q.fark_yuzde}%` : `${q.fark_yuzde}%`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Kalite', 'Birim Ağ. (kg)', 'Toplam Ağ. (kg)', 'Fark (kg)', 'Fark (%)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 11 },
    bodyStyles: { fontSize: 10 }
  });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('K.K.P. Platform - Ürün Ağırlıkları Modülü', 105, 280, { align: 'center' });

  // Save PDF
  const filename = `Karsilastirma_${comparison.urun_kodu.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Export calculation history to PDF
 * @param {Array} calculations - Array of calculations
 */
export const exportHistoryToPDF = (calculations) => {
  const doc = new jsPDF('landscape'); // Landscape for more columns

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('K.K.P. PLATFORM', 148, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Hesaplama Geçmişi', 148, 30, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 276, 35);

  // Table of calculations
  const tableData = calculations.map((calc, index) => [
    index + 1,
    formatDateTime(calc.created_at),
    calc.hesaplama_tipi,
    calc.urun_kodu,
    calc.kalite || '-',
    calc.adet,
    formatWeightNoUnit(calc.birim_agirlik),
    formatWeightNoUnit(calc.toplam_agirlik),
    calc.yapan || '-'
  ]);

  doc.autoTable({
    startY: 45,
    head: [['#', 'Tarih', 'Tip', 'Ürün/Fitting', 'Kalite', 'Adet', 'Birim (kg)', 'Toplam (kg)', 'Yapan']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 }
  });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('K.K.P. Platform - Ürün Ağırlıkları Modülü', 148, 200, { align: 'center' });

  // Save PDF
  const filename = `Hesaplama_Gecmisi_${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Print calculation (opens print dialog)
 * @param {Object} calculation - Calculation data
 */
export const printCalculation = (calculation) => {
  // Create a temporary div with calculation details
  const printWindow = window.open('', '', 'width=800,height=600');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hesaplama - ${calculation.urun_kodu}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
        }
        h1 {
          text-align: center;
          color: #333;
        }
        h2 {
          text-align: center;
          color: #666;
          margin-top: 0;
        }
        .details {
          margin: 30px 0;
        }
        .row {
          margin: 10px 0;
          font-size: 14px;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        .total {
          margin-top: 30px;
          padding: 20px;
          background: #f0f0f0;
          border-left: 4px solid #4CAF50;
          font-size: 18px;
          font-weight: bold;
        }
        hr {
          border: none;
          border-top: 2px solid #ddd;
          margin: 20px 0;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #999;
          font-size: 12px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>K.K.P. PLATFORM</h1>
      <h2>Ağırlık Hesaplama Raporu</h2>
      <hr>
      <div class="details">
        <div class="row"><span class="label">Tarih:</span> ${formatDateTime(new Date())}</div>
        <div class="row"><span class="label">İşlemi Yapan:</span> ${calculation.yapan || '-'}</div>
        <div class="row"><span class="label">Hesaplama Tipi:</span> ${calculation.hesaplama_tipi}</div>
      </div>
      <hr>
      <div class="details">
        <h3>Ürün Bilgileri</h3>
        <div class="row"><span class="label">Ürün:</span> ${calculation.urun_kodu}</div>
        ${calculation.kalite ? `<div class="row"><span class="label">Kalite:</span> ${calculation.kalite}</div>` : ''}
        <div class="row"><span class="label">Adet:</span> ${calculation.adet}</div>
      </div>
      <hr>
      <div class="details">
        <h3>Hesaplama</h3>
        <div class="row"><span class="label">Birim Ağırlık:</span> ${formatWeight(calculation.birim_agirlik)}</div>
        <div class="total">
          TOPLAM AĞIRLIK: ${formatWeight(calculation.toplam_agirlik)}
        </div>
      </div>
      <div class="footer">
        K.K.P. Platform - Ürün Ağırlıkları Modülü
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
