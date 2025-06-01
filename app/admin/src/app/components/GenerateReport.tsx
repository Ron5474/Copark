import React from 'react';

const downloadBase64Pdf = (base64: string) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = 'report.pdf';
  link.click();
};

export default function GenerateReportButton() {
  return (
    <button onClick={() => downloadBase64Pdf()}>
      Download PDF Report
    </button>
  );
}
