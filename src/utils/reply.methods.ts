const nodemailer = await import('nodemailer');
// the method to reply for contacts
interface ReplyForContactParams {
    to: string;
    from: string;
    messageId: string;
    messegeSubject: string;
    replyMessage: string;
}

const EMAIL_USER = process.env.EMAIL_HOST_USER || '';
const EMAIL_PASS = process.env.EMAIL_HOST_PASSWORD || '';
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
const EMAIL_USE_TLS = process.env.EMAIL_USE_TLS === 'True' || process.env.EMAIL_USE_TLS === 'true';

export const ReplyMethods = {
    replyForContact: async ({ to, from, messageId, messegeSubject, replyMessage }: ReplyForContactParams) => {  

        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_USE_TLS,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: from,
            to: to,
            subject: `Re: ${messegeSubject}`,
            text: replyMessage,
            headers: {
                'In-Reply-To': messageId,
                'References': messageId,
            },
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
        
    }
};
