
const paymentData = {
  "id": "ORD_123456",
  "currency": "KES",
  "amount": 3500,
  "description": "Hair products order",
  "callback_url": "https://yourdomain.com/api/payments/pesapal/webhook",
  "notification_id": "YOUR_IPN_ID",
  "billing_address": {
    "email_address": "customer@email.com",
    "phone_number": "2547xxxxxxx",
    "country_code": "KE",
    "first_name": "Jane",
    "last_name": "Doe"
  }
};

module.exports = paymentData;
