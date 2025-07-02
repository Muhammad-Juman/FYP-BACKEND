import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendOTPEmail = async (to, code) => {
  try {
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is ${code}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw error;
  }
};

export  { transporter, sendOTPEmail };
