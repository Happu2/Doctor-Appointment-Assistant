async function sendConfirmation(email, event) {
  // Mock Gmail API integration
  console.log(`Sending confirmation to ${email} for event ${event.id}`);
}
module.exports = {sendConfirmation};