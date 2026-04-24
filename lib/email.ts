import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const emailFrom = process.env.EMAIL_FROM ?? "noreply@yourdomain.com";

// Setup Nodemailer transporter if Gmail credentials are provided
export const transporter = process.env.GMAIL_USER && process.env.google_app_password
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.google_app_password,
      },
    })
  : null;
