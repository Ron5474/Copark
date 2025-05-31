import { PDFDocument, rgb } from 'pdf-lib';

export async function generatePdf(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  page.drawText(`Hello, !`, {
    x: width - 50,
    y: height - 100,
    size: 24,
    color: rgb(0, 0.53, 0.71),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
