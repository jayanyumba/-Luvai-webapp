const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

// File path for persistent storage
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Load orders from file on startup
let orders = [];
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    orders = JSON.parse(data);
    console.log(`📂 Loaded ${orders.length} existing orders from database`);
  }
} catch (error) {
  console.error('Error loading orders:', error);
  orders = [];
}

// Save orders to file
function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    console.log('💾 Orders saved to database');
  } catch (error) {
    console.error('Error saving orders:', error);
  }
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jayanyumba@gmail.com',
    pass: 'fyebmawearzmfoio'
  }
});

// Verify email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP VERIFY FAILED:', error);
  } else {
    console.log('✅ SMTP READY - Email notifications enabled');
  }
});

// Function to send email notification
async function sendOrderNotification(order) {
  const itemsList = order.items.map(item => 
    `- ${item.name}: ${item.price}`
  ).join('\n');

  const mailOptions = {
    from: 'jayanyumba@gmail.com',
    to: 'jujuakuku@gmail.com',
    subject: `🔔 New Order: ${order.id}`,
    text: `
NEW ORDER RECEIVED!

Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}

CUSTOMER DETAILS:
------------------
Name: ${order.customerName}
Phone: ${order.phone}
Address: ${order.address}
${order.additionalInfo ? `Notes: ${order.additionalInfo}` : ''}

ORDER DETAILS:
------------------
${itemsList}

TOTAL: Ksh. ${order.amount.toLocaleString()}

Payment Method: M-Pesa Manual (Till 6584060)
Status: Pending Payment

Check admin dashboard: http://127.0.0.1:5501/Luvai-webapp/admin.html
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #084c51; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2>🔔 New Order Received!</h2>
          <p style="margin: 0; font-size: 18px;">Order ${order.id}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <h3 style="color: #084c51;">Customer Details</h3>
          <table style="width: 100%; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.customerName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.address}</td></tr>
            ${order.additionalInfo ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Notes:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.additionalInfo}</td></tr>` : ''}
          </table>

          <h3 style="color: #084c51;">Order Items</h3>
          <ul style="list-style: none; padding: 0;">
            ${order.items.map(item => `<li style="padding: 10px; background: #f9f9f9; margin-bottom: 8px; border-radius: 5px;">${item.name} - <strong>${item.price}</strong></li>`).join('')}
          </ul>

          <div style="background: #16a34a; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Total Amount</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold;">Ksh. ${order.amount.toLocaleString()}</p>
          </div>

          <p style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong>⏳ Status:</strong> Waiting for M-Pesa payment to Till 6584060
          </p>

          <p style="text-align: center; margin-top: 20px;">
            <a href="http://127.0.0.1:5501/Luvai-webapp/admin.html" style="background: #084c51; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Dashboard</a>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent');
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
}

// Create order
app.post('/api/create-payment', async (req, res) => {
  try {
    const { customerName, phone, address, amount, orderItems, additionalInfo } = req.body;
    const orderReference = `LO-${Date.now()}`;

    const order = {
      id: orderReference,
      customerName,
      phone,
      address,
      additionalInfo: additionalInfo || '',
      amount,
      items: orderItems,
      status: 'pending',
      paymentMethod: 'M-Pesa Manual',
      createdAt: new Date(),
    };
    orders.push(order);
    saveOrders(); // Save to file

    // Console notification
    console.log('');
    console.log('🔔 NEW ORDER RECEIVED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Order ID: ${orderReference}`);
    console.log(`Customer: ${customerName} (${phone})`);
    console.log(`Amount: Ksh. ${amount.toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Send email notification
    await sendOrderNotification(order);

    res.json({
      success: true,
      orderReference,
      redirectUrl: `http://127.0.0.1:5501/Luvai-webapp/successful-payment.html?order=${orderReference}`
    });

  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    res.json({ order });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = req.body.status;
  if (req.body.status === 'completed') {
    order.completedAt = new Date();
    order.transactionId = req.body.transactionId || `MPESA-${Date.now()}`;
    console.log(`✅ Order ${order.id} marked as PAID`);
  }

  saveOrders(); // Save changes
  res.json({ success: true, order });
});

// Delete single order
app.delete('/api/orders/:id', (req, res) => {
  console.log('DELETE request for order:', req.params.id);
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
     console.log('Order not found:', req.params.id);
    return res.status(404).json({ error: 'Order not found' });
  }

  const deletedOrder = orders.splice(index, 1)[0];
  saveOrders(); // Save changes
  
  console.log(`🗑️  Deleted order: ${deletedOrder.id}`);
  res.json({ success: true, deleted: deletedOrder.id });
});

// Clear all orders
app.delete('/api/orders/clear', (req, res) => {
  const count = orders.length;
  orders = [];
  saveOrders(); // Save changes
  console.log(`🗑️  Cleared ${count} orders`);
  res.json({ success: true, cleared: count });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     🚀 Luvai Organics - ORDER SYSTEM         ║');
  console.log('║                                                ║');
  console.log('║  Server:   http://localhost:3000              ║');
  console.log('║  Payment:  M-Pesa Till 6584060                ║');
  console.log('║  Storage:  orders.json (persistent)           ║');
  console.log('║  Emails:   Enabled ✅                         ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
});
