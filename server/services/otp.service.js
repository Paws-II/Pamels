import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "../config/emailService.js";

export const generateAndStoreOTP = async () => {
  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return {
    plainOTP: otp,
    hashedOTP,
    otpExpiresAt,
  };
};

export const verifyOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

export const sendPasswordChangeOTP = async (email, name, otp) => {
  await sendOTPEmail(email, otp, name, "password-reset");
};
