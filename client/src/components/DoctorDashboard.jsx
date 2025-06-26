import React, { useState } from 'react';

function DoctorDashboard() {
  const [report, setReport] = useState('');

  const fetchReport = async (query) => {
    try {
      const res = await fetch('http://localhost:3001/api/mcp/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, conversationId: null }),
      });
      const data = await res.json();
      setReport(data.response);
    } catch (error) {
      setReport('Error fetching report');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Doctor Dashboard</h2>
      <div className="space-x-2">
        <button
          onClick={() => fetchReport('How many patients visited yesterday?')}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Yesterday's Visits
        </button>
        <button
          onClick={() => fetchReport('How many appointments do I have today and tomorrow?')}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Today's & Tomorrow's Appointments
        </button>
        <button
          onClick={() => fetchReport('How many patients with fever?')}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Fever Cases
        </button>
      </div>
      {report && <div className="mt-4 p-2 bg-gray-100 rounded">{report}</div>}
    </div>
  );
}

export default DoctorDashboard;