import React, { useState } from 'react';
import { fetchAdminReport } from '../../report/actions';
import { cookies } from 'next/headers';

const downloadBase64Pdf = (base64: string) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = 'report.pdf';
  link.click();
};


const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export default function GenerateReportButton() {
  const [numDays, setNumDays] = useState(30);

  const handleClick = async () => {
    const token = await getAuthToken();
    if (!token) {
      alert('No auth token found.');
      return;
    }
    const base64 = await fetchAdminReport(token, numDays);
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