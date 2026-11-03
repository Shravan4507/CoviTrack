import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { DetailedReport } from '../repositories/report.repository';

export class PdfService {
  private static getStorageDir(): string {
    const storageDir = process.env.STORAGE_DIR
      ? path.resolve(__dirname, process.env.STORAGE_DIR)
      : path.resolve(__dirname, '../../../storage/reports');

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    return storageDir;
  }

  static async generateReportPdf(report: DetailedReport): Promise<string> {
    const storageDir = this.getStorageDir();
    const fileName = `${report.reportReference}.pdf`;
    const filePath = path.join(storageDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header - Clean Monochromatic Academic Diagnostic Report
      doc
        .rect(50, 50, 495, 4)
        .fill('#000000');

      doc.moveDown(1);
      doc
        .fontSize(22)
        .fillColor('#000000')
        .text('COVITRACK DIAGNOSTIC TESTING REPORT', 50, 70, { align: 'center', characterSpacing: 1 });

      doc
        .fontSize(10)
        .fillColor('#555555')
        .text('Official Clinical COVID-19 Diagnostic Record | Local Operations Center', { align: 'center' });

      doc.moveDown(2);
      doc
        .strokeColor('#222222')
        .lineWidth(1)
        .moveTo(50, 120)
        .lineTo(545, 120)
        .stroke();

      // Report Meta Information Box
      const topY = 135;
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text(`Report Reference:`, 50, topY, { bold: true } as any)
        .text(report.reportReference, 170, topY)
        .text(`Booking Reference:`, 320, topY)
        .text(report.bookingReference, 440, topY);

      doc
        .text(`Testing Date:`, 50, topY + 20)
        .text(report.testingDate, 170, topY + 20)
        .text(`Test Modality:`, 320, topY + 20)
        .text(report.testType, 440, topY + 20);

      doc
        .strokeColor('#EEEEEE')
        .lineWidth(1)
        .moveTo(50, topY + 45)
        .lineTo(545, topY + 45)
        .stroke();

      // Patient Details Section
      const patientY = topY + 60;
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('PATIENT DEMOGRAPHIC INFORMATION', 50, patientY);

      doc
        .fontSize(10)
        .text(`Full Name:`, 50, patientY + 25)
        .text(report.patientName, 170, patientY + 25)
        .text(`Patient ID:`, 320, patientY + 25)
        .text(report.patientIdNumber || 'N/A', 440, patientY + 25);

      doc
        .text(`Mobile Number:`, 50, patientY + 45)
        .text(report.patientMobile, 170, patientY + 45)
        .text(`Date of Birth:`, 320, patientY + 45)
        .text(report.dateOfBirth || 'N/A', 440, patientY + 45);

      doc
        .text(`Address:`, 50, patientY + 65)
        .text(report.address || 'N/A', 170, patientY + 65, { width: 375 });

      doc
        .strokeColor('#EEEEEE')
        .lineWidth(1)
        .moveTo(50, patientY + 95)
        .lineTo(545, patientY + 95)
        .stroke();

      // Clinical Diagnostic Finding Box
      const resultY = patientY + 115;
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('DIAGNOSTIC TEST FINDING', 50, resultY);

      const isPositive = report.testResult.toLowerCase() === 'positive';
      const isNegative = report.testResult.toLowerCase() === 'negative';

      const resultBoxColor = isPositive ? '#991B1B' : '#000000';
      const resultBg = isPositive ? '#FEE2E2' : isNegative ? '#F3F4F6' : '#FEF3C7';

      doc
        .rect(50, resultY + 25, 495, 60)
        .fillAndStroke(resultBg, '#222222');

      doc
        .fontSize(18)
        .fillColor(resultBoxColor)
        .text(`RESULT: ${report.testResult.toUpperCase()}`, 65, resultY + 40, { align: 'left', characterSpacing: 1 });

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(`Target: SARS-CoV-2 Viral RNA | Method: Real-Time RT-PCR Automated Assay`, 65, resultY + 62);

      // Clinical Notes & Authorized Clinician
      const notesY = resultY + 105;
      doc
        .fontSize(11)
        .fillColor('#000000')
        .text('CLINICAL OBSERVATIONS & NOTES', 50, notesY);

      doc
        .fontSize(10)
        .fillColor('#444444')
        .text(report.notes || 'No adverse clinical symptoms documented during sample collection.', 50, notesY + 20, {
          width: 495,
          lineGap: 4,
        });

      const footerY = 700;
      doc
        .strokeColor('#222222')
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke();

      doc
        .fontSize(9)
        .fillColor('#333333')
        .text(`Authorized Testing Officer: ${report.staffName}`, 50, footerY + 10)
        .text(`Timestamp Generated: ${new Date().toISOString()}`, 50, footerY + 25)
        .text('CoviTrack Academic Testing Verification System | Local Execution Only', 50, footerY + 40, {
          align: 'center',
        });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}

