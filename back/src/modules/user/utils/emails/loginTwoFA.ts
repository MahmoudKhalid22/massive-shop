import { EmailService } from "./email.service";

export class LoginTwoFA extends EmailService {
  getHtmlContent(): string {
    return `
              <h2>Hello, ${this.recieverName}</h2>
              <p>Your 2FA code is ready. Use the link below to complete your login:</p>
              <a href="${this.url}">Login</a>
              <p>If you didn't request this, please ignore this email.</p>
              <p>Thank you,<br>The Support Team</p>`;
  }

  getSubject(): string {
    return "Login Two Factor Authentication";
  }
}
