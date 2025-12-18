import nodemailer from "nodemailer";

// Create transporter ONCE at module level
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// CRITICAL: Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
    console.error("Check your EMAIL_USER and EMAIL_PASS environment variables");
  } else {
    console.log("✅ Email service is ready to send emails");
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (
  email,
  otp,
  name = "User",
  type = "verification"
) => {
  try {
    let subject, greeting, message;

    if (type === "verification") {
      subject = "Verify Your Email - WhisperTails";
      greeting = "Thank you for signing up with WhisperTails.";
      message =
        "To complete your registration, please use the following OTP code:";
    } else if (type === "password-reset") {
      subject = "Reset Your Password - WhisperTails";
      greeting = "We received a request to reset your password.";
      message = "Use the following OTP code to reset your password:";
    } else {
      subject = "Your OTP Code - WhisperTails";
      greeting = "Hello!";
      message = "Please use the following OTP code:";
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background-color: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WhisperTails</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>${greeting}</p>
            <p>${message}</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} WhisperTails. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("===========================================");
      console.log(`OTP Email sent to ${email}`);
      console.log(`Recipient: ${name}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Type: ${type}`);
      console.log(`Valid for: 10 minutes`);
      console.log(`Message ID: ${info.messageId}`);
      console.log("===========================================");
    }

    // Log success in production (without OTP)
    console.log(`✅ ${type} email sent successfully to ${email}`);

    return {
      success: true,
      messageId: info.messageId,
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  } catch (error) {
    console.error(`❌ Failed to send ${type} email:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      recipient: email,
    });
    throw new Error(`Failed to send ${type} email: ${error.message}`);
  }
};

export { generateOTP, sendOTPEmail };
