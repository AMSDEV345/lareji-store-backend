const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOrderConfirmation = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.customer.email,
    subject: `Order Confirmed - ${order.orderId}`,
    html: `
      <h2>Order Confirmed! ✅</h2>
      <p>Hi ${order.customer.firstName},</p>
      <p>Thank you for your order. Here's your order details:</p>
      
      <h3>Order ID: ${order.orderId}</h3>
      <p><strong>Total:</strong> ${order.currency} ${order.total.toLocaleString()}</p>
      
      <h4>Items:</h4>
      <ul>
        ${order.items.map(item => `<li>${item.name} (${item.size}) x${item.qty}</li>`).join('')}
      </ul>
      
      <p>We'll send you a tracking number soon!</p>
      <p>Best regards,<br/>LAREJI Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Order confirmation email sent');
  } catch (err) {
    console.error('Email error:', err);
  }
};

module.exports = { sendOrderConfirmation };