// import { PDFDocument, rgb } from 'pdf-lib';
// import { TicketReport } from '../../../TicketService/src/ticket/schema';
// import { PermitReport } from '../../../PermitService/src/permit/schema';

// function wrapTextPreservingNewlines(text: string, maxCharsPerLine: number): string[] {
//   const rawLines = text.split('\n');
//   const wrappedLines: string[] = [];

//   for (const rawLine of rawLines) {
//     const words = rawLine.split(' ');
//     let line = '';
//     for (const word of words) {
//       if ((line + word).length > maxCharsPerLine) {
//         wrappedLines.push(line.trim());
//         line = word + ' ';
//       } else {
//         line += word + ' ';
//       }
//     }
//     if (line) wrappedLines.push(line.trim());
//   }

//   return wrappedLines;
// }

// export async function generatePdf(
//   ticketInfo: TicketReport,
//   permitInfo: PermitReport,
//   numDays: number,
// ): Promise<string> {
//   const pdfDoc = await PDFDocument.create();
//   let page = pdfDoc.addPage([600, 800]);
//   let y = 750;

// const endDate = new Date();
// const startDate = new Date();
// startDate.setDate(endDate.getDate() - numDays + 1);

// const formatDate = (date: Date) =>
//     `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

// const dateRangeText = `Report for ${formatDate(startDate)} to ${formatDate(endDate)}`;

// page.drawText(dateRangeText, {
//     x: 50,
//     y: y,
//     size: 18,
//     color: rgb(0, 0, 0.6),
// });
// y -= 40;

// //   console.log(ticketInfo, permitInfo);
//   const ticketStatements: string[] = [
//     `Ticket Summary:`,
//     `Total Tickets: ${ticketInfo.totalTickets}`,
//     `Unpaid Tickets: ${ticketInfo.unpaidTickets}`,
//     `Paid Tickets: ${ticketInfo.paidTickets}`,
//     `Total Revenue: $${(ticketInfo.totalRevenue / 100).toFixed(2)}`,
//     '',
//     `Violation Breakdown:`
//   ];
//   if (ticketInfo.violationBreakdown && ticketInfo.violationBreakdown.length > 0) {
//     for (const v of ticketInfo.violationBreakdown) {
//       ticketStatements.push(`- ${v.violation}: ${v.count}`);
//     }
//   } else {
//     ticketStatements.push('No violations recorded.');
//   }
//   ticketStatements.push('');
//   ticketStatements.push('Num Tickets By Enforcer:');
//   if (ticketInfo.enforcerBreakdown && ticketInfo.enforcerBreakdown.length > 0) {
//     for (const e of ticketInfo.enforcerBreakdown) {
//       ticketStatements.push(`- ${e.enforcer}: ${e.count}`);
//     }
//   } else {
//     ticketStatements.push('No enforcer data.');
//   }

//   const permitStatements: string[] = [
//     `Permit Summary:`,
//     `Total Permits: ${permitInfo.totalPermits}`,
//     `Active Permits: ${permitInfo.activePermits}`,
//     `Expired Permits: ${permitInfo.expiredPermits}`,
//     `Total Revenue: $${(permitInfo.totalRevenue / 100).toFixed(2)}`,
//     '',
//     `Zone Breakdown:`
//   ];
//   if (permitInfo.zoneBreakdown && permitInfo.zoneBreakdown.length > 0) {
//     for (const z of permitInfo.zoneBreakdown) {
//       permitStatements.push(`- ${z.area}: ${z.totalPermits}`);
//     }
//   } else {
//     permitStatements.push('No zone data.');
//   }
//   permitStatements.push('');
//   permitStatements.push('Lot Breakdown:');
//   if (permitInfo.lotBreakdown && permitInfo.lotBreakdown.length > 0) {
//     for (const l of permitInfo.lotBreakdown) {
//       permitStatements.push(`- ${l.area}: ${l.totalPermits}`);
//     }
//   } else {
//     permitStatements.push('No lot data.');
//   }

//   // Helper to draw a section
//   const drawSection = (title: string, lines: string[], x: number) => {
//     page.drawText(title, { x, y, size: 14, color: rgb(0.1, 0.1, 0.1) });
//     y -= 20;
//     for (const line of lines) {
//       const wrapped = wrapTextPreservingNewlines(line, 40);
//       for (const w of wrapped) {
//         page.drawText(w, { x: x + 10, y, size: 12, color: rgb(0, 0, 0) });
//         y -= 16;
//         if (y < 50) {
//           page = pdfDoc.addPage([600, 800]);
//           y = 750;
//         }
//       }
//     }
//     y -= 16;
//   };

//   // Draw tickets on the left, permits on the right
//   const yStart = y;
//   y = yStart;
//   drawSection('Ticket Report', ticketStatements, 50);
//   y = yStart;
//   drawSection('Permit Report', permitStatements, 320);

//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes).toString('base64');
// }


import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { TicketReport } from '../../../TicketService/src/ticket/schema';
import { PermitReport } from '../../../PermitService/src/permit/schema';

interface ChartData {
  labels: string[];
  values: number[];
  colors: number[][];
}

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

function drawProgressBar(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  color: number[] = [0.2, 0.6, 0.9]
) {
  // Background
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Filled portion
  const fillWidth = (width * percentage) / 100;
  page.drawRectangle({
    x,
    y,
    width: fillWidth,
    height,
    color: rgb(color[0], color[1], color[2]),
  });

  // Border
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(0.6, 0.6, 0.6),
    borderWidth: 1,
  });
}

function drawPieChart(
  page: PDFPage,
  centerX: number,
  centerY: number,
  radius: number,
  data: ChartData
) {
  const total = data.values.reduce((sum, val) => sum + val, 0);
  if (total === 0) return;

  // Create a compact horizontal stacked bar
  let cumulativePercentage = 0;
  const barHeight = 12; // Smaller height
  const barWidth = radius; // Smaller width
  const startX = centerX - barWidth / 2;
  const startY = centerY;

  data.values.forEach((value, index) => {
    const percentage = (value / total) * 100;
    const color = data.colors[index] || [0.5, 0.5, 0.5];
    const segmentWidth = (percentage / 100) * barWidth;

    // Only draw if segment has width
    if (segmentWidth > 0) {
      page.drawRectangle({
        x: startX + (cumulativePercentage / 100) * barWidth,
        y: startY,
        width: segmentWidth,
        height: barHeight,
        color: rgb(color[0], color[1], color[2]),
      });
    }

    cumulativePercentage += percentage;
  });

  // Draw border around the entire bar
  page.drawRectangle({
    x: startX,
    y: startY,
    width: barWidth,
    height: barHeight,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.5,
  });
}

function drawBarChart(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  data: ChartData,
  maxValue?: number
) {
  const maxVal = maxValue || Math.max(...data.values);
  if (maxVal === 0) return;

  const barWidth = width / data.values.length * 0.8;
  const spacing = width / data.values.length * 0.2;

  data.values.forEach((value, index) => {
    const barHeight = (value / maxVal) * height;
    const barX = x + index * (barWidth + spacing);
    const barY = y;
    const color = data.colors[index] || [0.3, 0.7, 0.9];

    page.drawRectangle({
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight,
      color: rgb(color[0], color[1], color[2]),
    });

    // Value label on top of bar
    page.drawText(value.toString(), {
      x: barX + barWidth / 2 - 10,
      y: barY + barHeight + 5,
      size: 8,
      color: rgb(0.2, 0.2, 0.2),
    });
  });
}

function drawStatCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  subtitle?: string,
  color: number[] = [0.2, 0.6, 0.9]
) {
  // Card background
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  });

  // Colored top border
  page.drawRectangle({
    x,
    y: y + height - 4,
    width,
    height: 4,
    color: rgb(color[0], color[1], color[2]),
  });

  // Title
  page.drawText(title, {
    x: x + 10,
    y: y + height - 25,
    size: 10,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Main value
  page.drawText(value, {
    x: x + 10,
    y: y + height - 45,
    size: 16,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Subtitle
  if (subtitle) {
    page.drawText(subtitle, {
      x: x + 10,
      y: y + 10,
      size: 8,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
}

export async function generatePdf(
  ticketInfo: TicketReport,
  permitInfo: PermitReport,
  numDays: number,
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([842, 595]); // A4 landscape
  let y = 550;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - numDays + 1);

  const formatDate = (date: Date) =>
    `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  // Header
  page.drawRectangle({
    x: 0,
    y: 520,
    width: 842,
    height: 75,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawText('CoPark Analytics Report', {
    x: 50,
    y: 560,
    size: 24,
    color: rgb(1, 1, 1),
    font: boldFont,
  });

  const dateRangeText = `Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`;
  page.drawText(dateRangeText, {
    x: 50,
    y: 535,
    size: 12,
    color: rgb(0.9, 0.9, 0.9),
    font,
  });

  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 600,
    y: 535,
    size: 10,
    color: rgb(0.8, 0.8, 0.8),
    font,
  });

  y = 480;

  // Executive Summary Cards
  const cardWidth = 120;
  const cardHeight = 80;
  const cardSpacing = 20;

  // Ticket Summary Cards
  drawStatCard(page, 50, y - cardHeight, cardWidth, cardHeight, 
    'Total Tickets', ticketInfo.totalTickets.toString(), 
    `${numDays} days`, [0.8, 0.2, 0.2]);

  drawStatCard(page, 50 + cardWidth + cardSpacing, y - cardHeight, cardWidth, cardHeight,
    'Unpaid Tickets', ticketInfo.unpaidTickets.toString(),
    `${((ticketInfo.unpaidTickets / ticketInfo.totalTickets) * 100).toFixed(1)}%`, [0.9, 0.5, 0.1]);

  drawStatCard(page, 50 + 2 * (cardWidth + cardSpacing), y - cardHeight, cardWidth, cardHeight,
    'Paid Tickets', ticketInfo.paidTickets.toString(),
    `${((ticketInfo.paidTickets / ticketInfo.totalTickets) * 100).toFixed(1)}%`, [0.2, 0.7, 0.3]);

  drawStatCard(page, 50 + 3 * (cardWidth + cardSpacing), y - cardHeight, cardWidth, cardHeight,
    'Ticket Revenue', `$${(ticketInfo.totalRevenue / 100).toFixed(2)}`,
    'Total collected', [0.3, 0.6, 0.9]);

  // Permit Summary Cards
  drawStatCard(page, 50 + 4 * (cardWidth + cardSpacing), y - cardHeight, cardWidth, cardHeight,
    'Total Permits', permitInfo.totalPermits.toString(),
    `${numDays} days`, [0.5, 0.3, 0.8]);

  drawStatCard(page, 50 + 5 * (cardWidth + cardSpacing), y - cardHeight, cardWidth, cardHeight,
    'Permit Revenue', `$${(permitInfo.totalRevenue / 100).toFixed(2)}`,
    'Total collected', [0.1, 0.7, 0.5]);

  y -= 120;

  // Payment Status Visualization
  page.drawText('Ticket Payment Analysis', {
    x: 50,
    y: y,
    size: 16,
    color: rgb(0.2, 0.2, 0.2),
    font: boldFont,
  });

  y -= 30;

  y -= 60; // More space after title

  // Payment status visualization - using horizontal stacked bars
  const paymentData: ChartData = {
    labels: ['Paid', 'Unpaid'],
    values: [ticketInfo.paidTickets, ticketInfo.unpaidTickets],
    colors: [[0.2, 0.7, 0.3], [0.9, 0.3, 0.3]]
  };

  // Draw the chart lower to avoid overlap
  drawPieChart(page, 150, y - 40, 60, paymentData);

  // Legend positioned to the right
  page.drawRectangle({
    x: 250, y: y - 30, width: 15, height: 15,
    color: rgb(0.2, 0.7, 0.3)
  });
  page.drawText(`Paid: ${ticketInfo.paidTickets} (${((ticketInfo.paidTickets / ticketInfo.totalTickets) * 100).toFixed(1)}%)`, {
    x: 270, y: y - 25, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  page.drawRectangle({
    x: 250, y: y - 50, width: 15, height: 15,
    color: rgb(0.9, 0.3, 0.3)
  });
  page.drawText(`Unpaid: ${ticketInfo.unpaidTickets} (${((ticketInfo.unpaidTickets / ticketInfo.totalTickets) * 100).toFixed(1)}%)`, {
    x: 270, y: y - 45, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  // Collection efficiency metrics
  const collectionRate = (ticketInfo.paidTickets / ticketInfo.totalTickets) * 100;
  page.drawText('Collection Efficiency', {
    x: 450, y: y - 20, size: 12, color: rgb(0.3, 0.3, 0.3), font: boldFont
  });

  drawProgressBar(page, 450, y - 50, 200, 20, collectionRate, [0.2, 0.7, 0.3]);
  page.drawText(`${collectionRate.toFixed(1)}%`, {
    x: 530, y: y - 65, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  y -= 120; // Increase spacing to prevent overlap

  // Violation Breakdown
  if (ticketInfo.violationBreakdown && ticketInfo.violationBreakdown.length > 0) {
    page.drawText('Top Violations', {
      x: 50, y: y, size: 16, color: rgb(0.2, 0.2, 0.2), font: boldFont
    });

    y -= 30;

    const sortedViolations = ticketInfo.violationBreakdown
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const violationData: ChartData = {
      labels: sortedViolations.map(v => v.violation),
      values: sortedViolations.map(v => v.count),
      colors: [
        [0.8, 0.2, 0.2], [0.2, 0.6, 0.8], [0.9, 0.5, 0.1],
        [0.3, 0.7, 0.3], [0.7, 0.3, 0.7]
      ]
    };

    drawBarChart(page, 50, y - 80, 400, 60, violationData);

    // Violation labels
    sortedViolations.forEach((violation, index) => {
      const x = 50 + index * 80;
      const wrapped = wrapTextPreservingNewlines(violation.violation, 12);
      wrapped.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 5,
          y: y - 100 - (lineIndex * 12),
          size: 8,
          color: rgb(0.4, 0.4, 0.4),
          font
        });
      });
    });
  }

  y -= 160;

  // New page for permit analysis
  if (y < 100) {
    page = pdfDoc.addPage([842, 595]);
    y = 550;
  }

  // Permit Status Analysis
  page.drawText('Permit Status Distribution', {
    x: 50, y: y, size: 16, color: rgb(0.2, 0.2, 0.2), font: boldFont
  });

  y -= 30;

  const permitStatusData: ChartData = {
    labels: ['Active', 'Expired'],
    values: [permitInfo.activePermits, permitInfo.expiredPermits],
    colors: [[0.3, 0.7, 0.3], [0.7, 0.7, 0.3]]
  };

  y -= 100; // More space to prevent overlap

  drawPieChart(page, 150, y - 40, 60, permitStatusData);

  // Permit legend
  page.drawRectangle({
    x: 250, y: y - 30, width: 15, height: 15,
    color: rgb(0.3, 0.7, 0.3)
  });
  page.drawText(`Active: ${permitInfo.activePermits} (${((permitInfo.activePermits / permitInfo.totalPermits) * 100).toFixed(1)}%)`, {
    x: 270, y: y - 25, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  page.drawRectangle({
    x: 250, y: y - 50, width: 15, height: 15,
    color: rgb(0.7, 0.7, 0.3)
  });
  page.drawText(`Expired: ${permitInfo.expiredPermits} (${((permitInfo.expiredPermits / permitInfo.totalPermits) * 100).toFixed(1)}%)`, {
    x: 270, y: y - 45, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  y -= 100; // Increase spacing to prevent overlap

  // Zone/Lot Breakdown
  if (permitInfo.zoneBreakdown && permitInfo.zoneBreakdown.length > 0) {
    page.drawText('Zone Performance', {
      x: 50, y: y, size: 14, color: rgb(0.2, 0.2, 0.2), font: boldFont
    });

    y -= 25;

    permitInfo.zoneBreakdown.slice(0, 5).forEach((zone, index) => {
      const barY = y - (index * 25);
      const percentage = (zone.totalPermits / permitInfo.totalPermits) * 100;
      
      page.drawText(`Zone ${zone.area}:`, {
        x: 70, y: barY, size: 10, color: rgb(0.3, 0.3, 0.3), font
      });

      drawProgressBar(page, 150, barY - 5, 200, 15, percentage, [0.3, 0.6, 0.9]);
      
      page.drawText(`${zone.totalPermits} permits (${percentage.toFixed(1)}%)`, {
        x: 360, y: barY, size: 10, color: rgb(0.3, 0.3, 0.3), font
      });
    });

    y -= permitInfo.zoneBreakdown.slice(0, 5).length * 25 + 20;
  }

  // Revenue Comparison
  const totalRevenue = (ticketInfo.totalRevenue + permitInfo.totalRevenue) / 100;
  const ticketRevenuePercent = (ticketInfo.totalRevenue / (ticketInfo.totalRevenue + permitInfo.totalRevenue)) * 100;

  page.drawText('Revenue Breakdown', {
    x: 450, y: y + 120, size: 14, color: rgb(0.2, 0.2, 0.2), font: boldFont
  });

  const revenueData: ChartData = {
    labels: ['Tickets', 'Permits'],
    values: [ticketInfo.totalRevenue / 100, permitInfo.totalRevenue / 100],
    colors: [[0.8, 0.3, 0.3], [0.3, 0.6, 0.8]]
  };

  drawPieChart(page, 550, y + 80, 80, revenueData);

  page.drawText(`Total Revenue: $${totalRevenue.toFixed(2)}`, {
    x: 650, y: y + 80, size: 12, color: rgb(0.2, 0.2, 0.2), font: boldFont
  });

  page.drawText(`Tickets: $${(ticketInfo.totalRevenue / 100).toFixed(2)} (${ticketRevenuePercent.toFixed(1)}%)`, {
    x: 650, y: y + 60, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  page.drawText(`Permits: $${(permitInfo.totalRevenue / 100).toFixed(2)} (${(100 - ticketRevenuePercent).toFixed(1)}%)`, {
    x: 650, y: y + 45, size: 10, color: rgb(0.3, 0.3, 0.3), font
  });

  // Key Insights Section
  page.drawText('Key Insights', {
    x: 50, y: y, size: 14, color: rgb(0.2, 0.2, 0.2), font: boldFont
  });

  y -= 25;

  const insights = [
    `• Collection rate of ${collectionRate.toFixed(1)}% indicates ${collectionRate > 80 ? 'excellent' : collectionRate > 60 ? 'good' : 'poor'} payment compliance`,
    `• ${ticketRevenuePercent > 50 ? 'Tickets generate more revenue than permits' : 'Permits are the primary revenue source'}`,
    `• ${permitInfo.activePermits > permitInfo.expiredPermits ? 'Most permits are currently active' : 'High permit expiration rate observed'}`,
    `• Average ticket value: $${((ticketInfo.totalRevenue / 100) / ticketInfo.totalTickets).toFixed(2)}`,
    `• Average permit value: $${((permitInfo.totalRevenue / 100) / permitInfo.totalPermits).toFixed(2)}`
  ];

  insights.forEach((insight, index) => {
    page.drawText(insight, {
      x: 70, y: y - (index * 18), size: 10, color: rgb(0.4, 0.4, 0.4), font
    });
  });

  // Footer
  page.drawText('Generated by CoPark Analytics System', {
    x: 50, y: 20, size: 8, color: rgb(0.6, 0.6, 0.6), font
  });

  page.drawText(`Report ID: RPT-${Date.now()}`, {
    x: 650, y: 20, size: 8, color: rgb(0.6, 0.6, 0.6), font
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}