// backend/config/msg91.js
// Centralized MSG91 OTP service for all OTP operations
const axios = require('axios');

const MSG91_BASE = 'https://control.msg91.com/api/v5';

/**
 * Format mobile number to include country code 91 (India)
 */
function formatMobile(mobile) {
  const clean = mobile.replace(/[\s\-\+]/g, '');
  return clean.startsWith('91') ? clean : `91${clean}`;
}

/**
 * Send OTP via MSG91
 * @param {string} mobile - Mobile number (e.g. 9999999999 or 919999999999)
 * @returns {Promise<object>} MSG91 API response
 */
async function sendOtp(mobile) {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) throw new Error('MSG91_AUTH_KEY must be set in .env');

  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!templateId) throw new Error('MSG91_TEMPLATE_ID must be set in .env. Get it from your MSG91 dashboard → OTP → Templates.');

  const formattedMobile = formatMobile(mobile);

  const payload = {
    template_id: templateId,
    mobile: formattedMobile,
    sender: process.env.MSG91_SENDER_ID || 'SMSIND',
    otp_length: 6,
    otp_expiry: 5, // 5 minutes
  };

  try {
    const response = await axios.post(`${MSG91_BASE}/otp`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': authkey,
      },
    });

    console.log(`📱 MSG91 OTP sent to ${formattedMobile}:`, response.data);

    // Check for MSG91 error response
    if (response.data && response.data.type === 'error') {
      throw new Error(response.data.message || 'MSG91 returned an error');
    }

    return response.data;
  } catch (err) {
    const errorData = err.response?.data;
    const errorMsg = errorData?.message || err.message || 'Failed to send OTP via MSG91';
    console.error(`❌ MSG91 Send OTP Error for ${formattedMobile}:`, errorData || err.message);
    console.error(`   ℹ️  Check: 1) MSG91_AUTH_KEY is valid  2) MSG91_TEMPLATE_ID is set  3) Template is DLT-approved  4) Account has credits`);
    throw new Error(errorMsg);
  }
}

/**
 * Verify OTP via MSG91
 * @param {string} mobile - Mobile number (e.g. 9999999999 or 919999999999)
 * @param {string} otp - The OTP entered by the user
 * @returns {Promise<object>} MSG91 API response
 */
async function verifyOtp(mobile, otp) {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) throw new Error('MSG91_AUTH_KEY must be set in .env');

  const formattedMobile = formatMobile(mobile);

  try {
    // MSG91 verify API accepts GET with query params
    const response = await axios.get(`${MSG91_BASE}/otp/verify`, {
      params: {
        mobile: formattedMobile,
        otp: otp,
      },
      headers: {
        'authkey': authkey,
      },
    });

    console.log(`✅ MSG91 OTP verify for ${formattedMobile}:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ MSG91 Verify OTP Error for ${formattedMobile}:`, err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'OTP verification failed');
  }
}

/**
 * Resend OTP via MSG91
 * @param {string} mobile - Mobile number
 * @param {string} retryType - 'text' for SMS, 'voice' for voice call
 * @returns {Promise<object>} MSG91 API response
 */
async function resendOtp(mobile, retryType = 'text') {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) throw new Error('MSG91_AUTH_KEY must be set in .env');

  const formattedMobile = formatMobile(mobile);

  try {
    const response = await axios.get(`${MSG91_BASE}/otp/retry`, {
      params: {
        mobile: formattedMobile,
        retrytype: retryType,
      },
      headers: {
        'authkey': authkey,
      },
    });

    console.log(`🔁 MSG91 OTP resend to ${formattedMobile}:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ MSG91 Resend OTP Error:`, err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to resend OTP');
  }
}

/**
 * Test MSG91 connection/configuration
 * @returns {object} Status of MSG91 config
 */
function testConfig() {
  const authkey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  return {
    authKeySet: !!authkey,
    authKeyPreview: authkey ? `${authkey.substring(0, 6)}...` : 'NOT SET',
    templateIdSet: !!templateId,
    templateId: templateId || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'not set',
    ready: !!authkey && !!templateId && process.env.NODE_ENV === 'production',
  };
}

module.exports = { sendOtp, verifyOtp, resendOtp, testConfig };
