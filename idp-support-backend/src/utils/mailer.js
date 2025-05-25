import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendRegistrationEmail = async ({ to, firstName }) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Вітаємо з реєстрацією!",
    html: `
      <h2>Привіт, ${firstName}!</h2>
      <p>Ви успішно зареєструвалися на нашій платформі.</p>
      <p>Дякуємо, що ви з нами!</p>
    `,
  });
};

export const sendModeratorCreatedEmail = ({
  to,
  firstName,
  lastName,
  token,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Створення акаунту модератора",
    html: `
    <h2>Вітаємо, ${lastName} ${firstName}!</h2>
            <p>Для вас було створено акаунт модератора на платформі ShelterConnect.</p>
      <p>Ви можете увійти в систему, використовуючи вашу електронну пошту.</p>
      <p><strong>але спочатку вам потрібно встановити пароль. Використовуйте посилання нижче</strong></p>
             <a href="${process.env.FRONTEND_URL}/activate-password/${token}">Встановити пароль</a> <p>Дякуємо, що долучились до нашої спільноти!</p>`,
  });
};

export const sendVerificationApprovedEmail = async ({
  to,
  firstName,
  lastName,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Ваша верифікація пройдена успішно!",
    html: `
      <h2>Вітаємо, ${lastName} ${firstName}!</h2>
      <p>Ми успішно перевірили ваші документи.</p>
      <p>Ви тепер маєте повний доступ до функцій нашої платформи.</p>
      <p>Дякуємо, що ви з нами!</p>
    `,
  });
};

export const sendVerificationDeclinedEmail = async ({
  to,
  firstName,
  lastName,
  declineReason,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Верифікацію відхилено",
    html: `
      <h2>Привіт, ${lastName} ${firstName}!</h2>
      <p>На жаль, вашу верифікацію було відхилено.</p>
      <p><strong>Причина:</strong> ${declineReason || "Без пояснення"}</p>
      <p>Ви можете повторно подати документи для верифікації.</p>
    `,
  });
};

export const sendApplicationApprovedEmail = async ({
  to,
  firstName,
  lastName,
  listingTitle,
  ownerName,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Заявку підтверджено",
    html: `
      <h2>Привіт, ${lastName} ${firstName}!</h2>
      <p>Вашу заявку на оголошення <strong>«${listingTitle}»</strong> було <span style="color:green;"><strong>підтверджено</strong></span>.</p>
      <p>Будь ласка, зв'яжіться з власником <strong>${ownerName}</strong> для уточнення деталей проживання.</p>
      <p>Дякуємо, що користуєтесь нашою платформою!</p>
    `,
  });
};

export const sendApplicationRejectedEmail = async ({
  to,
  firstName,
  lastName,
  listingTitle,
  ownerName,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Заявку відхилено",
    html: `
      <h2>Привіт, ${lastName} ${firstName}!</h2>
      <p>На жаль, власник <strong>${ownerName}</strong> відхилив вашу заявку на оголошення <strong>«${listingTitle}»</strong>.</p>
      <p>Ви можете подати заявку на інші оголошення, які вам підходять.</p>
      <p>Бажаємо успіхів у пошуках!</p>
    `,
  });
};

export const sendListingActivatedEmail = async ({ to, listingTitle }) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Оголошення активовано",
    html: `
      <h2>Вітаємо</h2>
      <p>Ваше оголошення <strong>«${listingTitle}»</strong> тепер знову активне.</p>
      <p>Користувачі можуть його переглядати та подавати заявки.</p>
      <p>Бажаємо успішної оренди!</p>
    `,
  });
};

export const sendListingDeactivatedEmail = async ({ to, listingTitle }) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Оголошення деактивовано",
    html: `
      <h2>Доброго дня</h2>
      <p>Ваше оголошення <strong>«${listingTitle}»</strong> було деактивовано.</p>
      <p>Інші користувачі більше не зможуть його переглядати чи подавати заявки.</p>
    `,
  });
};
