const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER; // e.g., +12025550123

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

async function sendSms(to, body) {
  if (!client || !fromNumber) {
    // Fallback: log only in development to avoid breaking flows
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[smsService] DEV fallback - would send SMS to ${to}: ${body}`);
      return { sid: 'dev-fallback', to, body };
    }
    const error = new Error('SMS provider is not configured');
    error.statusCode = 500;
    throw error;
  }

  const message = await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
  return message;
}

module.exports = { sendSms };


