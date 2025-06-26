const dbService = require('../services/dbService');
const calendarService = require('../services/calendarService');
const emailService = require('../services/emailService');

const tools = {
  checkAvailability: {
    description: 'Check doctor availability for a given time',
    params: ['doctor', 'time'],
    execute: dbService.checkAvailability,
  },
  createEvent: {
    description: 'Schedule an appointment in Google Calendar',
    params: ['doctor', 'time'],
    execute: calendarService.createEvent,
  },
  sendEmail: {
    description: 'Send confirmation email to patient',
    params: ['email', 'event'],
    execute: emailService.sendConfirmation,
  },
  getVisitCount: {
    description: 'Get count of patient visits for a date',
    params: ['date'],
    execute: dbService.getVisitCount,
  },
};

function getTools() {
  return tools;
}

async function executeTool(toolName, params) {
  const tool = tools[toolName];
  if (!tool) throw new Error(`Tool ${toolName} not found`);
  return await tool.execute(...Object.values(params));
}

module.exports = { getTools, executeTool };