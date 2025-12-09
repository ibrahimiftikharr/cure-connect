const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOTP(email, otp, name) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'CureConnect - Email Verification OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 CureConnect</h1>
              <p>Healthcare Made Simple</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up with CureConnect. To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">This code will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes</p>
              </div>
              
              <p><strong>Important:</strong> If you didn't request this verification code, please ignore this email.</p>
              
              <p>Best regards,<br>The CureConnect Team</p>
            </div>
            <div class="footer">
              <p>© 2024 CureConnect. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✉️  Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email, name, role) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to CureConnect! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Welcome to CureConnect!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your account has been successfully verified and activated. Welcome to the CureConnect family!</p>
              
              <p>As a <strong>${role === 'doctor' ? 'Healthcare Provider' : 'Patient'}</strong>, you now have access to:</p>
              <ul>
                ${role === 'doctor' ? `
                  <li>Manage your appointments and schedule</li>
                  <li>Connect with patients through video consultations</li>
                  <li>Update your profile and specializations</li>
                  <li>View appointment history and patient records</li>
                ` : `
                  <li>Search and book appointments with qualified doctors</li>
                  <li>Attend virtual consultations via video calls</li>
                  <li>Manage your health records and appointments</li>
                  <li>Receive real-time notifications and reminders</li>
                `}
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
              
              <p>Best regards,<br>The CureConnect Team</p>
            </div>
            <div class="footer">
              <p>© 2024 CureConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✉️  Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Welcome email sending failed:', error);
      // Don't throw error for welcome email, just log it
      return { success: false };
    }
  }
}

module.exports = new EmailService();
