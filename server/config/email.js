import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendRejectionEmail(to, postTitle) {
    const mailOptions = {
        from: `"Fictoria Moderation" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Ваш пост был отклонён',
        html: `
            <h2>Уважаемый пользователь,</h2>
            <p>Ваш пост с названием <strong>"${postTitle}"</strong> был отклонён модерацией.</p>
            <p>Причина: несоблюдение правил платформы Fictoria.</p>
            <p>Пожалуйста, ознакомьтесь с <a href="http://localhost:5173/rules">правилами платформы</a> перед публикацией новых постов.</p>
            <p>Если у вас есть вопросы, свяжитесь с поддержкой: <a href="mailto:support@fictoria.com">support@fictoria.com</a>.</p>
            <p>С уважением,<br>Команда Fictoria</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Письмо об отклонении отправлено на ${to}`);
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        throw new Error('Не удалось отправить письмо об отклонении');
    }
}