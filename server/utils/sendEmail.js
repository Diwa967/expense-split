import transporter from "../config/nodemailer.js";

export const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log("Sending email to:", to);

        const info = await transporter.sendMail({
            from: `"Expense-Split" <${process.env.SENDER_EMAIL}>`, // sender address
            to,
            subject,
            text: "You were added to a new group", // fallback text
            html,
        });

        console.log("Email sent:", info.response);
        return info;

    } catch (error) {
        console.error("Email Error FULL:", error);
        throw error;
    }
};