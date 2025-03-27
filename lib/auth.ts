import { compare, hash } from "bcrypt"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Resend } from "resend"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "blog-auth-token"
const SALT_ROUNDS = 10
// const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000 // 10 minutes

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Types
export type User = {
  id: string
  email: string
  username: string
  name?: string | null
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// JWT utilities
export async function signToken(payload: {
  id: string
  email: string
  username: string
  name?: string | null
}): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

// Session management
export async function setSession(user: User): Promise<void> {
  const token = await signToken({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Auth helpers
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)

  if (!payload || !payload.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      emailVerified: true,
    },
  })

  if (!user) {
    return null
  }

  // If email is not verified, don't consider them authenticated
  if (!user.emailVerified) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

// Email verification utilities
export function generateVerificationCode(): string {
  // Generate a random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email verification with Resend
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Thank you for signing up! Please use the verification code below to complete your registration:
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #333;">${code}</h1>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            This code will expire in 10 minutes.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            If you didn't request this verification, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      throw new Error("Failed to send verification email")
    }

    console.log("Verification email sent:", data)
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

