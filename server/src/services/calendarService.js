async function createEvent(doctor, time) {
  // Mock Google Calendar API integration
  return { id: 'event123', summary: `Appointment with Dr. ${doctor}`, start: time };
}

module.exports = { createEvent };