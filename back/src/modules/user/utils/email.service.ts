import Sib from "sib-api-v3-sdk";
import dotenv from "dotenv";
const client = Sib.ApiClient.instance;
dotenv.config();

export class EmailService {
  private sender: string = "massive-shop@market.com";
  private recieverEmail: string;
  private recieverName: string;
  private token: string;
  private apiKey = client.authentications["api-key"];
  private apiInstance: any;
  private password: boolean;
  private twoFA: boolean;
  private url?: string;

  constructor(
    reciever: string,
    recieverName: string,
    token: string,
    password?: boolean,
    twoFA?: boolean,
    url?: string
  ) {
    this.recieverEmail = reciever;
    this.recieverName = recieverName;
    this.token = token;
    this.password = password || false;
    this.twoFA = twoFA || false;
    this.url = url;
  }

  async sendEmail() {
    try {
      this.apiKey.apiKey = process.env.SENDINBLUE_KEY;
      this.apiInstance = new Sib.TransactionalEmailsApi();
      const sender = {
        email: this.sender,
      };

      const reciever = [
        {
          email: this.recieverEmail,
        },
      ];

      const htmlContent = this.password
        ? `<h2>Hello, ${this.recieverName}</h2>
        <p>It seems like you requested a password reset. If this was you, click the link below to reset your password.</p>
        <a href="http://localhost:${process.env.PORT}/user/reset/${this.token}">Reset Password</a>
        <p>If you did not request this, please ignore this email or contact our support team.</p>
        <p>Thank you,<br>The Support Team</p>`
        : `<h2>Welcome, ${
            this.recieverName
          }. You have successfully created an email</h2><p>You are in the right place. To achieve all benefit from our platform, please verify your account</p><a href=${
            this.url
              ? this.url
              : `http://localhost:${process.env.PORT}/user/verify${
                  this.twoFA ? "-2fa" : ""
                }/${this.token}`
          }>Verify</a>`;

      await this.apiInstance.sendTransacEmail({
        sender,
        to: reciever,
        subject: this.password ? "Reset Your Password" : "Welcome",
        htmlContent: htmlContent,
        name: "Massive Shop Market Place",
      });
    } catch (err) {
      throw new Error("Some error occured in sending emails");
    }
  }
}
