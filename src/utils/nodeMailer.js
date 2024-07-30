import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "buiians123@gmail.com",
    pass: "fkib wghx xvcw dwww",
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

export { sendRegistrationEmail };

//  test function
// sendRegistrationEmail().catch(console.error);
