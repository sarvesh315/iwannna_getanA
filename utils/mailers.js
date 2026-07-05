import nodemailer from "nodemailer";

let transporter = null;

/* -----------------------
   CREATE TRANSPORT
------------------------ */
async function createTransport() {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return testAccount;
}

/* -----------------------
   SEND VERIFICATION EMAIL
------------------------ */
export async function sendVerificationEmail(email, code) {
  if (!transporter) {
    await createTransport();
  }

  const info = await transporter.sendMail({
    from: "Haven App <test@haven.com>",
    to: email,
    subject: "Verify your account",
    text: `Your verification code is: ${code}`,
  });

  console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
}