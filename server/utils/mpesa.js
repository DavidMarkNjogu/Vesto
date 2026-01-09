const axios = require('axios');

// 1. GENERATE TIMESTAMP
const getTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
};

// 2. GENERATE PASSWORD
const getPassword = (shortCode, passkey, timestamp) => {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
};

// 3. GET ACCESS TOKEN (Middleware)
const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ M-PESA Auth Error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get M-PESA access token');
  }
};

// 4. INITIATE STK PUSH
const initiateSTKPush = async (phone, amount, orderId) => {
  const token = await getAccessToken();
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = getTimestamp();
  const password = getPassword(shortCode, passkey, timestamp);
  
  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  // Format phone: Ensure it starts with 254
  let formattedPhone = phone.replace('+', '');
  if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);


  // --- HARDCODED 1 KES FOR TESTING ---
  const TEST_AMOUNT = 1;

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.floor(TEST_AMOUNT), // No decimals allowed
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.SERVER_URL}/api/mpesa/callback`, // Must be a live URL (Ngrok for local)
    AccountReference: `Vesto Order ${orderId.slice(-5)}`,
    TransactionDesc: 'Shoe Purchase'
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ STK Push Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { initiateSTKPush };