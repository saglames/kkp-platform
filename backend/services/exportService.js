const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * CSV Export
 */
function exportToCSV(data) {
  if (!data || data.length === 0) {
    return Buffer.from('');
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // CSV escape logic
      if (value === null || value === undefined) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return Buffer.from('\uFEFF' + csvRows.join('\n'), 'utf8'); // BOM for Turkish characters
}

/**
 * Excel Export
 */
function exportToExcel(data, sheetName = 'Sheet1') {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data || data.length === 0) {
        return resolve(Buffer.from(''));
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Headers
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map(header => ({
        header: header,
        key: header,
        width: 20
      }));

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellLength = cell.value ? String(cell.value).length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * PDF Export
 */
function exportToPDF(data, columns, title = 'Report') {
  return new Promise((resolve, reject) => {
    try {
      if (!data || data.length === 0) {
        return resolve(Buffer.from(''));
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      // Table
      const tableTop = 120;
      const itemHeight = 25;
      const columnWidth = (doc.page.width - 100) / columns.length;

      // Headers
      doc.fontSize(10).font('Helvetica-Bold');
      columns.forEach((column, i) => {
        doc.text(
          column,
          50 + (i * columnWidth),
          tableTop,
          { width: columnWidth, align: 'left' }
        );
      });

      // Horizontal line after header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(doc.page.width - 50, tableTop + 15)
        .stroke();

      // Data rows
      doc.font('Helvetica').fontSize(9);
      let currentY = tableTop + itemHeight;

      data.forEach((row, rowIndex) => {
        // Check for new page
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;

          // Re-draw headers on new page
          doc.fontSize(10).font('Helvetica-Bold');
          columns.forEach((column, i) => {
            doc.text(
              column,
              50 + (i * columnWidth),
              currentY,
              { width: columnWidth, align: 'left' }
            );
          });
          doc
            .moveTo(50, currentY + 15)
            .lineTo(doc.page.width - 50, currentY + 15)
            .stroke();
          currentY += itemHeight;
          doc.font('Helvetica').fontSize(9);
        }

        columns.forEach((column, i) => {
          const text = row[column] !== undefined && row[column] !== null
            ? String(row[column])
            : '-';
          doc.text(
            text,
            50 + (i * columnWidth),
            currentY,
            { width: columnWidth - 5, align: 'left' }
          );
        });

        currentY += itemHeight;
      });

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
          `Sayfa ${i + 1} / ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  exportToCSV,
  exportToExcel,
  exportToPDF
};
