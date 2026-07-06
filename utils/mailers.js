import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, code) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: "Haven <no-reply@haven.com>",
    to: email,
    subject: "Verify your account",
    text: `Your code: ${code}`
  });
}