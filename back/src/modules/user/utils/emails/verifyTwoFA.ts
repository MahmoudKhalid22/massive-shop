import { EmailService } from "./email.service";

export class TwoFactorActivationEmail extends EmailService {
  getHtmlContent(): string {
    return `
        <h2>Hi, ${this.recieverName}</h2>
        <p>Your Two-Factor Authentication (2FA) has been <strong>processed</strong>.</p>
        <p>click the link below to enable this feature</p>
        <p><strong>How it works:</strong></p>
        <a href="${this.url}">Verify Two FA</a>

        <p>If you didn't enable 2FA, please <strong>contact us immediately</strong> to secure your account.</p>
        <p>Thank you for taking steps to enhance your account’s security!</p>
        <p>Best regards,<br>The Massive Shop Market Team</p>`;
  }

  getSubject(): string {
    return "Two-Factor Authentication (2FA) Enabled";
  }
}
