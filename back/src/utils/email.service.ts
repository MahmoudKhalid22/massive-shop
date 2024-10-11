import Sib from "sib-api-v3-sdk";
import dotenv from "dotenv";
const client = Sib.ApiClient.instance;
dotenv.config();

export class EmailService {
  private sender: string = "zankalon@market.com";
  private recieverEmail: string;
  private recieverName: string;
  private apiKey = client.authentications["api-key"];
  private apiInstance: any;

  constructor(reciever: string, recieverName: string) {
    this.recieverEmail = reciever;
    this.recieverName = recieverName;
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

      await this.apiInstance.sendTransacEmail({
        sender,
        to: reciever,
        subject: "Welcome",
        htmlContent: `<h2>Welcome, ${this.recieverName}. You have successfully created an email</h2><p>You are in the right place. To achieve all benefit from our platform, please verify your account</p><button>Verify</button>`,
        name: "Zankalon Market Place",
      });
    } catch (err) {
      throw new Error("Some error occured in sending emails");
    }
  }
}
