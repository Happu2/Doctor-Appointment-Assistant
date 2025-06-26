const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const calendarService = require('./calendarService');
const emailService = require('./emailService');
const notificationService = require('./notificationService');
const dbService = require('./dbService');
const { getTools, executeTool } = require('../mcp/tools');
const { storeContext, retrieveContext } = require('../mcp/context');
require('dotenv').config();

console.log('notificationService:', notificationService);
console.log('emailService:', emailService);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function processPrompt(prompt, conversationId) {
  console.log('Processing prompt:', prompt, 'conversationId:', conversationId);
  try {
    let context = conversationId ? await retrieveContext(conversationId) : {};
    const newConversationId = conversationId || uuidv4();

    const llmResponse = await mockLLM(prompt, context);
    console.log('LLM response:', llmResponse);
    const { toolCalls, response } = llmResponse;

    if (toolCalls) {
      for (const call of toolCalls) {
        console.log('Executing tool:', call.tool, 'with params:', call.params);
        const result = await executeTool(call.tool, call.params);
        context = { ...context, [call.tool]: result };
      }
    }

    await storeContext(newConversationId, context);
    return { response, conversationId: newConversationId };
  } catch (err) {
    console.error('processPrompt error:', err);
    throw err;
  }
}

async function mockLLM(prompt, context) {
  console.log('mockLLM called with prompt:', prompt);
  try {
    const responseObj = { response: '', toolCalls: null };
    if (prompt.includes('book an appointment')) {
      // Parse doctor name after "with"
      const doctorMatch = prompt.match(/with\s+(?:Dr\.?|Doctor)\s*([A-Za-z]+)/i);
      const doctor = doctorMatch ? doctorMatch[1] : 'Ahuja';
      // Parse time with typo handling
      const timeMatch = prompt.match(/(today|tomorrow|tommorow|yesterday)\s*(morning|afternoon|evening)?/i);
      const timePeriod = timeMatch ? timeMatch[1].toLowerCase().replace('tommorow', 'tomorrow') : 'today';
      const timeOfDay = timeMatch && timeMatch[2] ? timeMatch[2].toLowerCase() : 'morning';
      const time = `${timePeriod} ${timeOfDay}`;
      // Parse condition
      const conditionMatch = prompt.match(/for\s+([A-Za-z]+)/i);
      const condition = conditionMatch ? conditionMatch[1].toLowerCase() : null;
      console.log('Time match:', timeMatch);
      console.log('Parsed doctor:', doctor, 'time:', time, 'timePeriod:', timePeriod, 'timeOfDay:', timeOfDay, 'condition:', condition);
      const availability = await dbService.checkAvailability(doctor, time);
      if (availability.available) {
        const event = await calendarService.createEvent(doctor, time);
        await emailService.sendConfirmation('patient@example.com', event);
        // Determine appointment time
        let appointmentTime;
        const today = new Date();
        let date = today;
        if (timePeriod === 'tomorrow') {
          date = new Date(today);
          date.setDate(today.getDate() + 1);
        } else if (timePeriod === 'yesterday') {
          date = new Date(today);
          date.setDate(today.getDate() - 1);
        }
        const timeMap = {
          morning: '10:00:00',
          afternoon: '14:00:00',
          evening: '18:00:00'
        };
        const timeString = timeMap[timeOfDay] || '10:00:00';
        appointmentTime = `${date.toISOString().split('T')[0]} ${timeString}`;
        console.log('Inserting appointment: doctor:', doctor, 'time:', appointmentTime, 'condition:', condition);
        // Insert into database
        await pool.query(
          'INSERT INTO appointments (doctor, patient_email, appointment_time, `condition`) VALUES (?, ?, ?, ?)',
          [doctor, 'patient@example.com', appointmentTime, condition]
        );
        responseObj.response = `Appointment booked with Dr. ${doctor} at ${time}${condition ? ' for ' + condition : ''}. Confirmation sent.`;
      } else {
        responseObj.response = `No available slots for Dr. ${doctor} at ${time}.`;
      }
    } else if (prompt.includes('patients visited yesterday')) {
      const count = await dbService.getVisitCount('yesterday');
      console.log('Calling sendNotification with count:', count);
      await notificationService.sendNotification(`Yesterday's visits: ${count}`);
      responseObj.response = `Yesterday, ${count} patients visited.`;
    } else if (prompt.includes('appointments do I have')) {
      const count = await dbService.getAppointmentCount('today', 'tomorrow');
      console.log('Calling sendNotification with count:', count);
      await notificationService.sendNotification(`Appointments today/tomorrow: ${count}`);
      responseObj.response = `You have ${count} appointments today and tomorrow.`;
    } else if (prompt.includes('patients with fever')) {
      const count = await dbService.getConditionCount('fever');
      console.log('Calling sendNotification with count:', count);
      await notificationService.sendNotification(`Patients with fever: ${count}`);
      responseObj.response = `${count} patients reported fever.`;
    } else {
      responseObj.response = 'I understood your request, but I need more details.';
    }
    return responseObj;
  } catch (err) {
    console.error('mockLLM error:', err);
    throw err;
  }
}

module.exports = { processPrompt };