"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { resend, emailFrom } from "@/lib/email";

const RegisterSchema = z.object({
  role: z.enum(["BUYER", "SELLER"]),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
});

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function registerUser(input: unknown) {
  try {
    const data = RegisterSchema.parse(input);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, emailVerified: true },
    });
    if (existing?.emailVerified) {
      return { success: false as const, error: "Email is already registered." };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    await prisma.user.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        status: "PENDING_VERIFICATION",
      },
      update: {
        name: data.name,
        passwordHash,
        role: data.role,
        status: "PENDING_VERIFICATION",
      },
      select: { id: true },
    });

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: data.email, token: otp, expires },
    });

    if (!process.env.RESEND_API_KEY) {
      return { success: false as const, error: "RESEND_API_KEY is missing (cannot send OTP)." };
    }

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: data.email,
      subject: "Verify your email",
      html: `
        <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6;">
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px;">${otp}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (error) return { success: false as const, error: "Failed to send verification email." };

    return { success: true as const, data: { email: data.email } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return { success: false as const, error: message };
  }
}

export async function verifyEmail(token: string) {
  try {
    const otp = z.string().min(4).max(12).parse(token.trim());
    const record = await prisma.verificationToken.findUnique({
      where: { token: otp },
      select: { identifier: true, expires: true },
    });
    if (!record) return { success: false as const, error: "Invalid code." };
    if (record.expires < new Date()) return { success: false as const, error: "Code expired." };

    const user = await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date(), status: "ACTIVE" },
      select: { id: true, role: true },
    });

    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

    return { success: true as const, data: { userId: user.id, role: user.role } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return { success: false as const, error: message };
  }
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    const parsedEmail = z.string().email().parse(email).toLowerCase().trim();
    const parsedPassword = z.string().min(1).parse(password);

    const user = await prisma.user.findUnique({
      where: { email: parsedEmail },
      select: { id: true, email: true, name: true, passwordHash: true, role: true, status: true },
    });
    if (!user?.passwordHash) return { success: false as const, error: "Invalid credentials." };
    if (user.status !== "ACTIVE") return { success: false as const, error: `Account status: ${user.status}` };

    const ok = await bcrypt.compare(parsedPassword, user.passwordHash);
    if (!ok) return { success: false as const, error: "Invalid credentials." };

    return { success: true as const, data: { userId: user.id, role: user.role } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return { success: false as const, error: message };
  }
}

