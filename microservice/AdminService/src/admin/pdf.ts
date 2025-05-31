import { PDFDocument, rgb } from 'pdf-lib';
import { TicketReport } from '../../../TicketService/src/ticket/schema';
import { PermitReport } from '../../../PermitService/src/permit/schema';

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    if ((line + word).length > maxCharsPerLine) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

export async function generatePdf(ticketInfo: TicketReport, permitInfo: PermitReport): Promise<String> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]); // taller page
  const { width } = page.getSize();

  let y = 750;

  const drawWrappedText = (label: string, content: string) => {
    page.drawText(`${label}:`, { x: 50, y, size: 12 });
    y -= 16;

    const lines = wrapText(content, 90); // adjust line width as needed
    for (const line of lines) {
      page.drawText(line, { x: 60, y, size: 12 });
      y -= 16;
      if (y < 50) {
        y = 750;
        page = pdfDoc.addPage([600, 800]); // add new page if overflow
      }
    }

    y -= 16;
  };

  drawWrappedText('Ticket Info', JSON.stringify(ticketInfo));
  drawWrappedText('Permit Info', JSON.stringify(permitInfo));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}
