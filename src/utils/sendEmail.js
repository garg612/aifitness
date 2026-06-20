import Mailgen from "mailgen";//use to prepare email template
import nodemailer from "nodemailer";//use to send email
import logger from "./logger.js";


const sendemail=async(options)=>{
    const mailgenerator=new Mailgen({
        theme:"default",
        product:{
            name:"AI Fitness App",
            link:process.env.FRONTEND_URL
        }
    });

    const emailtextual=mailgenerator.generatePlaintext(options.mailgenContent);
    const emailhtml=mailgenerator.generate(options.mailgenContent);

    const transporter=nodemailer.createTransport({
        host:process.env.MAIL_TRAP_SMTP_HOST,
        port:process.env.MAIL_TRAP_SMTP_PORT,
        auth:{
            user:process.env.MAIL_TRAP_SMTP_USER,
            pass:process.env.MAIL_TRAP_SMTP_PASS
        }
    })

    const mail={
        from:"mail.taskmanager@example.com",//sender email address
        to:options.email,
        subject:options.subject,
        text:emailtextual,
        html:emailhtml
    }

    try{
        await transporter.sendMail(mail);
        logger.info("Email sent successfully");
    }catch(error){
        logger.error("Error sending email: ", error);
    }
};


const emailverificationTemplate = (name, verificationurl) => {

    return {
        body:{
            name:name,
            intro:"Welcome to our application! We're excited to have you on board.",
            action:{
                instructions:"To get started with our application, please click the button below to verify your email address:",
                button:{
                    color:"#22BC66",
                    text:"Verify Email",
                    link:verificationurl
                },
            },
            outro:"If you did not sign up for this account, please ignore this email."
        },
    }
};

const passwordResetTemplate = (name, resetUrl) => {
    return {
        body:{
            name:name,
            intro:"You are receiving this email because a password reset request was made for your account.",
            action:{
                instructions:"Please click the button below to reset your password. This link is valid for 15 minutes:",
                button:{
                    color:"#DC3545",
                    text:"Reset Password",
                    link:resetUrl
                },
            },
            outro:"If you did not request this, please ignore this email and your password will remain secure."
        },
    }
};

export { sendemail, emailverificationTemplate, passwordResetTemplate };