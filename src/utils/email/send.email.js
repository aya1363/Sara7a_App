
import nodemailer from 'nodemailer';

export async function sendEmail({ from=process.env.APP_EMAIL, to='' ,cc='' ,bcc='' ,
            subject='saraha app',
            html = '',
            text='',
            attachments}={}) {
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:'ayalabib57@gmail.com',
            pass: process.env.APP_PASSWORD,
        }
        })

        const info = await transporter.sendMail({
            from: `"Whisper App" <${from}>`,
            to, cc, bcc,text,
            subject,
            html,
            attachments
});
    console.log("Email sent:", info.messageId);
}