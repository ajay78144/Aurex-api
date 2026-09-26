const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic send email
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Aurex <noreply@aurex.com>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

// Welcome Email
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to Aurex!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
          <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Premium E-Commerce</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Welcome, ${user.name}! 👋</h2>
          <p style="color:#ccc;line-height:1.7;">Thank you for joining Aurex. We're excited to have you on board. Discover thousands of premium products and enjoy an unmatched shopping experience.</p>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#6c63ff,#e040fb);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Start Shopping</a>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Email Verification
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: '✅ Verify Your Aurex Email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Verify Your Email</h2>
          <p style="color:#ccc;line-height:1.7;">Click the button below to verify your email address. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#6c63ff,#e040fb);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Verify Email</a>
          <p style="color:#555;margin-top:24px;font-size:13px;">Or copy this link: ${verifyUrl}</p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Forgot Password
const sendForgotPasswordEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: '🔒 Reset Your Aurex Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Reset Your Password</h2>
          <p style="color:#ccc;line-height:1.7;">You requested a password reset. Click the button below. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#6c63ff,#e040fb);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Reset Password</a>
          <p style="color:#555;margin-top:24px;font-size:13px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Order Confirmation
const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = (order.products || []).map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #222;color:#ccc;">${item.product?.name || 'Product'}</td>
      <td style="padding:10px;border-bottom:1px solid #222;color:#ccc;text-align:center;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #222;color:#e040fb;text-align:right;">₹${item.price}</td>
    </tr>
  `).join('');

  await sendEmail({
    to: user.email,
    subject: `🛍️ Order Confirmed - #${order._id}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
          <p style="margin:8px 0 0;opacity:0.9;">Order Confirmed! 🎉</p>
        </div>
        <div style="padding:40px;">
          <p style="color:#ccc;">Hi <strong>${user.name}</strong>, your order has been placed successfully.</p>
          <p style="color:#aaa;">Order ID: <strong style="color:#e040fb;">#${order._id}</strong></p>
          <table width="100%" style="border-collapse:collapse;margin-top:20px;">
            <thead>
              <tr style="background:#1a1a2e;">
                <th style="padding:10px;text-align:left;color:#6c63ff;">Product</th>
                <th style="padding:10px;text-align:center;color:#6c63ff;">Qty</th>
                <th style="padding:10px;text-align:right;color:#6c63ff;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;text-align:right;font-weight:700;color:#fff;">Total:</td>
                <td style="padding:12px;text-align:right;font-weight:700;color:#e040fb;font-size:18px;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Order Status Update
const sendOrderStatusEmail = async (user, order, message) => {
  await sendEmail({
    to: user.email,
    subject: `📦 Order Update - #${order._id}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Order Status Updated</h2>
          <p style="color:#ccc;">Hi <strong>${user.name}</strong>, your order status has been updated.</p>
          <p style="color:#aaa;">Order ID: <strong style="color:#e040fb;">#${order._id}</strong></p>
          <div style="background:#1a1a2e;border-radius:8px;padding:20px;margin-top:20px;">
            <p style="margin:0;color:#6c63ff;font-weight:700;">New Status: <span style="color:#e040fb;">${order.orderStatus}</span></p>
            ${message ? `<p style="margin:10px 0 0;color:#ccc;">${message}</p>` : ''}
          </div>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Password Changed Alert
const sendPasswordChangedEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🔐 Password Changed - Aurex Security Alert',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Password Changed Successfully</h2>
          <p style="color:#ccc;">Hi <strong>${user.name}</strong>, your Aurex account password was recently changed.</p>
          <p style="color:#aaa;">If you did not make this change, please contact support immediately.</p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// Contact Reply
const sendContactReplyEmail = async (contact, replyMessage) => {
  await sendEmail({
    to: contact.email,
    subject: `Re: Your Aurex Inquiry`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6c63ff,#e040fb);padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:2px;">AUREX</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#e040fb;">Response to Your Inquiry</h2>
          <p style="color:#ccc;">Hi <strong>${contact.name}</strong>,</p>
          <p style="color:#ccc;">Your original message: <em style="color:#aaa;">"${contact.message}"</em></p>
          <div style="background:#1a1a2e;border-radius:8px;padding:20px;margin-top:20px;">
            <p style="margin:0;color:#ccc;">${replyMessage}</p>
          </div>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #222;text-align:center;color:#555;font-size:12px;">
          <p>© ${new Date().getFullYear()} Aurex Support Team</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordChangedEmail,
  sendContactReplyEmail,
};
