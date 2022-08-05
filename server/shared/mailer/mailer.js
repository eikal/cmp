import nodemailer from 'nodemailer';
import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);

export const sendMail = async (to, subject, body) => {
    try {
        const htmlTemplate = await readFile('shared/mailer/mail-template.html');
        let template = htmlTemplate.toString();
        template = template.replace('{{bodyMessage}}', body);
        template = template.replace('{{subjectMessage}}', subject);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER || 'localhost',
            port: 25,
            secure: false
        });
        const info = await transporter.sendMail({
            from: '"CFRM Cloud CMP ☁️ " <CFRMCloudDevOpsTeam@bottomline.com>',
            to: to,
            subject: subject,
            text: '',
            html: template
        });
        console.log(`Emaill:${subject} sent sucssesfuly to:${to},MessageID:${info.messageId}`);
    } catch (ex) {
        const err = `Failed to send email: ${subject} to: ${to}, Error: ${ex}`;
        console.error(err);
    }
};
