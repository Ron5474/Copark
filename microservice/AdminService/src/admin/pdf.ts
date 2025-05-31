import { PDFDocument, rgb } from 'pdf-lib';
import { TicketReport } from '../../../TicketService/src/ticket/schema';
import { PermitReport } from '../../../PermitService/src/permit/schema';

function wrapTextPreservingNewlines(text: string, maxCharsPerLine: number): string[] {
  const rawLines = text.split('\n');
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(' ');
    let line = '';
    for (const word of words) {
      if ((line + word).length > maxCharsPerLine) {
        wrappedLines.push(line.trim());
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    }
    if (line) wrappedLines.push(line.trim());
  }

  return wrappedLines;
}

export async function generatePdf(
  ticketInfo: TicketReport,
  permitInfo: PermitReport
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  let y = 750;

  const drawWrappedText = (label: string, content: string) => {
    const title = `${label}:`;
    const lines = wrapTextPreservingNewlines(content, 90);

    page.drawText(title, { x: 50, y, size: 14, color: rgb(0.1, 0.1, 0.1) });
    y -= 20;

    for (const line of lines) {
      page.drawText(line, { x: 60, y, size: 12, color: rgb(0, 0, 0) });
      y -= 16;

      if (y < 50) {
        page = pdfDoc.addPage([600, 800]);
        y = 750;
      }
    }

    y -= 16;
  };

  drawWrappedText('Ticket Info', JSON.stringify(ticketInfo, null, 2));
  drawWrappedText('Permit Info', JSON.stringify(permitInfo, null, 2));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}
