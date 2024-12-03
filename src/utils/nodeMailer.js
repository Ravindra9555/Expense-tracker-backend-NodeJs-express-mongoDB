import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

async function sendRegistrationEmail(userEmail) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Expense Tracker Application" <buiians123@gmail.com>', // sender address
    to: userEmail, // list of receivers
    subject: "Welcome to Expense Tracker!", // Subject line
    text: `Hello!

Thank you for registering with Expense Tracker. We are excited to have you on board. With our application, you can easily track your expenses and manage your finances.

If you have any questions or need any assistance, feel free to reach out to our support team.

Best regards,
The Expense Tracker Team`, // plain text body
    html: `<b>Hello!</b><br><br>
           Thank you for registering with <b>Expense Tracker</b>. We are excited to have you on board. With our application, you can easily track your expenses and manage your finances.<br><br>
           If you have any questions or need any assistance, feel free to reach out to our support team.<br><br>
           Best regards,<br>
           The Expense Tracker Team`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

async function sendOtpMail(email, otp) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Expense Tracker Application" <buiians123@gmail.com>',
    to: email,
    subject: "OTP Verification",
    text: `
  Hi there,
  
  Thank you for registering with Expense Tracker! 🎉
  To complete your registration, please use the following OTP:
  ${otp}
  This OTP is valid for the next 10 minutes. If you didn't request this, please ignore this message.
  If you need any help, feel free to reach out to our support team.
  
  Best regards,  
  The Expense Tracker Team
  `,
  });

  console.log("Message sent: %s", info.messageId);
}
async function sendForgetPasswordMail(email, token) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Expense Tracker Application" <buiians123@gmail.com>',
    to: email,
    subject: "Password Reset Link ",
    text: `
  Hi there,
  
  Please Find your Forget password Link ! 
  to reset your password please follow the link below
  ${process.env.FRONTEND_BASEURL}/reset-password/${token}
  This link  is valid for the next 10 minutes. If you didn't request this, please ignore this message.
  If you need any help, feel free to reach out to our support team.
  
  Best regards,  
  The Expense Tracker Team
  `,
  });

  console.log("Message sent: %s", info.messageId);
};

const sendConatctMail = async (name, email, subject, description) => {
  try {
    const info = await transporter.sendMail({
      from: '"Expense Tracker Application" <buiians123@gmail.com>',
      to: "ravindraietbu@gmail.com",
      subject: subject,
      text: `
    Hi there,
    Here there is a query from ${name},
    Subject : ${subject}
    Description : ${description}
   `,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error.message}`);
    return false;
  }
};

export {
  sendRegistrationEmail,
  sendOtpMail,
  sendForgetPasswordMail,
  sendConatctMail,
};
