import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Safed Injera" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

export const sendOrderNotification = async (order: {
  customerName: string;
  email: string;
  businessType: string;
  product: string;
  quantity: number;
  message?: string;
}): Promise<void> => {
  const subject = `New Order from ${order.customerName}`;
  const text = `
New order received:

Customer: ${order.customerName}
Email: ${order.email}
Business Type: ${order.businessType}
Product: ${order.product}
Quantity: ${order.quantity}
Message: ${order.message || 'N/A'}

Please process this order promptly.
  `;

  const html = `
    <h2>New Order Received</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td><strong>Customer:</strong></td><td>${order.customerName}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${order.email}</td></tr>
      <tr><td><strong>Business Type:</strong></td><td>${order.businessType}</td></tr>
      <tr><td><strong>Product:</strong></td><td>${order.product}</td></tr>
      <tr><td><strong>Quantity:</strong></td><td>${order.quantity}</td></tr>
      <tr><td><strong>Message:</strong></td><td>${order.message || 'N/A'}</td></tr>
    </table>
    <p>Please process this order promptly.</p>
  `;

  // Send to admin email
  const adminEmail = process.env.EMAIL_USER || 'admin@safedinjera.com';
  await sendEmail(adminEmail, subject, text, html);
};


