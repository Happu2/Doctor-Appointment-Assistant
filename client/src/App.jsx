import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [userRole, setUserRole] = useState('patient'); // Simple role-based switch

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Doctor Appointment Assistant</h1>
        <div className="mb-4">
          <button
            onClick={() => setUserRole('patient')}
            className={`mr-2 p-2 ${userRole === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Patient
          </button>
          <button
            onClick={() => setUserRole('doctor')}
            className={`p-2 ${userRole === 'doctor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Doctor
          </button>
        </div>
        {userRole === 'patient' ? <ChatInterface /> : <DoctorDashboard />}
      </div>
    </div>
  );
}

export default App;