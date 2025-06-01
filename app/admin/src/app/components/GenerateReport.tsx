import React, { useState } from 'react';
import { fetchAdminReport } from '../../report/actions';

const downloadBase64Pdf = (base64: string) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = 'report.pdf';
  link.click();
};


export default function GenerateReportButton() {
  const [numDays, setNumDays] = useState(30);

  const handleClick = async () => {
    const base64 = await fetchAdminReport(numDays);
    if (!base64) {
      alert('Failed to generate report. Please try again.');
      return;
    }
    downloadBase64Pdf(base64);
  };

  return (
    <div>
      <label>
        Number of days:&nbsp;
        <input
          type="number"
          value={numDays}
          min={1}
          onChange={e => setNumDays(Number(e.target.value))}
        />
      </label>
      <button onClick={handleClick} style={{ marginLeft: 8 }}>
        Download PDF Report
      </button>
    </div>
  );
}