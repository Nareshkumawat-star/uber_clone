import nodemailer from 'nodemailer';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });
};

export const sendKycInviteEmail = async (email: string, name: string, partnerId: string) => {
    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
    const kycLink = `${baseUrl}/videokyc/${partnerId}`;

    const transporter = getTransporter();

    const mailOptions = {
        from: `"GoRide VIP" <${process.env.EMAIL}>`,
        to: email,
        subject: "Your Documents are Approved! - Join Video KYC",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #000;">Hello ${name},</h2>
                <p>Great news! Your uploaded documents have been successfully verified and approved.</p>
                <p>The next step in your onboarding process is a quick Video KYC verification.</p>
                <p>Please join the secure video session by clicking the button below:</p>
                <a href="${kycLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Join Video KYC Room</a>
                <p>If the button doesn't work, copy and paste this link in your browser:</p>
                <p><a href="${kycLink}">${kycLink}</a></p>
                <p>Regards,<br/>GoRide Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

export const sendDocumentRejectionEmail = async (email: string, name: string, reason: string) => {
    const transporter = getTransporter();

    const mailOptions = {
        from: `"GoRide VIP" <${process.env.EMAIL}>`,
        to: email,
        subject: "Action Required: Document Verification Update",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #000;">Hello ${name},</h2>
                <p>We have reviewed the documents you uploaded for GoRide partnership.</p>
                <p>Unfortunately, we could not approve them at this time. Please see the comments from our verification team below:</p>
                <div style="background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 10px; margin: 20px 0; font-style: italic;">
                    "${reason || 'Documents were incomplete or unclear.'}"
                </div>
                <p>Please log in to your dashboard to update and re-upload the necessary documents.</p>
                <p>Regards,<br/>GoRide Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
