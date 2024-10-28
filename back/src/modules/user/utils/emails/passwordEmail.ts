import { EmailService } from "./email.service";

export class PasswordResetEmail extends EmailService {
  getHtmlContent(): string {
    return `
          <h2>Hello, ${this.recieverName}</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${this.url}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br>The Support Team</p>`;
  }

  getSubject(): string {
    return "Reset Your Password";
  }
}
