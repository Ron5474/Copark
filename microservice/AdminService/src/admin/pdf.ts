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
  ticketData: TicketReport,
  permitData: PermitReport
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  let y = 750;

  page.drawText('Report for period: TEMP REPLACE', {
    x: 50,
    y: y,
    size: 18,
    color: rgb(0, 0, 0.6),
  });
  y -= 40;

//   console.log(ticketInfo, permitInfo);
  const ticketInfo = ticketData.data.adminTicketReport;
  const permitInfo = permitData.data.adminPermitReport;
  const ticketStatements: string[] = [
    `Ticket Summary:`,
    `Total Tickets: ${ticketInfo.totalTickets}`,
    `Unpaid Tickets: ${ticketInfo.unpaidTickets}`,
    `Paid Tickets: ${ticketInfo.paidTickets}`,
    `Total Revenue: $${(ticketInfo.totalRevenue / 100).toFixed(2)}`,
    '',
    `Violation Breakdown:`
  ];
  if (ticketInfo.violationBreakdown && ticketInfo.violationBreakdown.length > 0) {
    for (const v of ticketInfo.violationBreakdown) {
      ticketStatements.push(`- ${v.violation}: ${v.count}`);
    }
  } else {
    ticketStatements.push('No violations recorded.');
  }
  ticketStatements.push('');
  ticketStatements.push('Num Tickets By Enforcer:');
  if (ticketInfo.enforcerBreakdown && ticketInfo.enforcerBreakdown.length > 0) {
    for (const e of ticketInfo.enforcerBreakdown) {
      ticketStatements.push(`- ${e.enforcer}: ${e.count}`);
    }
  } else {
    ticketStatements.push('No enforcer data.');
  }

  const permitStatements: string[] = [
    `Permit Summary:`,
    `Total Permits: ${permitInfo.totalPermits}`,
    `Active Permits: ${permitInfo.activePermits}`,
    `Expired Permits: ${permitInfo.expiredPermits}`,
    `Total Revenue: $${(permitInfo.totalRevenue / 100).toFixed(2)}`,
    '',
    `Zone Breakdown:`
  ];
  if (permitInfo.zoneBreakdown && permitInfo.zoneBreakdown.length > 0) {
    for (const z of permitInfo.zoneBreakdown) {
      permitStatements.push(`- ${z.area}: ${z.totalPermits}`);
    }
  } else {
    permitStatements.push('No zone data.');
  }
  permitStatements.push('');
  permitStatements.push('Lot Breakdown:');
  if (permitInfo.lotBreakdown && permitInfo.lotBreakdown.length > 0) {
    for (const l of permitInfo.lotBreakdown) {
      permitStatements.push(`- ${l.area}: ${l.totalPermits}`);
    }
  } else {
    permitStatements.push('No lot data.');
  }

  // Helper to draw a section
  const drawSection = (title: string, lines: string[], x: number) => {
    page.drawText(title, { x, y, size: 14, color: rgb(0.1, 0.1, 0.1) });
    y -= 20;
    for (const line of lines) {
      const wrapped = wrapTextPreservingNewlines(line, 40);
      for (const w of wrapped) {
        page.drawText(w, { x: x + 10, y, size: 12, color: rgb(0, 0, 0) });
        y -= 16;
        if (y < 50) {
          page = pdfDoc.addPage([600, 800]);
          y = 750;
        }
      }
    }
    y -= 16;
  };

  // Draw tickets on the left, permits on the right
  const yStart = y;
  y = yStart;
  drawSection('Ticket Report', ticketStatements, 50);
  y = yStart;
  drawSection('Permit Report', permitStatements, 320);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}