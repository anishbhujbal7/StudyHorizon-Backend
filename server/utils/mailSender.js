const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587, // Default for TLS
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"StudyNotion" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = mailSender;




// const nodemailer=require("nodemailer");

// const mailSender=async (email, title,body)=>{
//     try{
//        let transporter= nodemailer.createTransport({
//         host:process.env.MAIL_HOST,
//         auth:{
//             pass:process.env.MAIL_PASS,
//             user:process.env.MAIL_USER,
//         }
//        })

//        let info =  await transporter.sendMail({
//         from:`"Studynotion" <${process.env.MAIL_USER}>`,
//         to:email,
//         subject:title,
//         html:body,
//        })
//        console.log(info);
//        return info;
//     }
//     catch(error){
//         console.log(error.message);
//     }
// }

// module.exports=mailSender;

