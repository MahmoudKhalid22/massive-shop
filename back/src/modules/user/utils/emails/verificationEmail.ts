import { EmailService } from "./email.service";

export class VerificationEmail extends EmailService {
  getHtmlContent(): string {
    return `
          <h2>Welcome, ${this.recieverName}</h2>
          <p>Verify your account to access all benefits of our platform:</p>
          <a href="${this.url}">Verify Account</a>`;
  }

  getSubject(): string {
    return "Verify Your Account";
  }
}
