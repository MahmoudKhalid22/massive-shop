import Sib from "sib-api-v3-sdk";
import dotenv from "dotenv";
const client = Sib.ApiClient.instance;
dotenv.config();

export abstract class EmailService {
  protected senderEmail: string = "massive-shop@market.com";
  protected recieverEmail: string;
  protected recieverName: string;
  protected token: string;
  protected apiKey = client.authentications["api-key"];
  protected apiInstance: any;
  protected url?: string;

  constructor(
    recieverEmail: string,
    recieverName: string,
    token: string,
    url: string
  ) {
    this.recieverEmail = recieverEmail;
    this.recieverName = recieverName;
    this.token = token;
    this.url = url;
  }

  abstract getHtmlContent(): string;
  abstract getSubject(): string;

  async sendEmail() {
    try {
      this.apiKey.apiKey = process.env.SENDINBLUE_KEY;
      this.apiInstance = new Sib.TransactionalEmailsApi();

      const sender = { email: this.senderEmail };
      const reciever = [{ email: this.recieverEmail }];

      await this.apiInstance.sendTransacEmail({
        sender,
        to: reciever,
        subject: this.getSubject(),
        htmlContent: this.getHtmlContent(),
        name: "Massive Shop Market Place",
      });
    } catch (err) {
      throw new Error("Some error occurred while sending the email.");
    }
  }
}
