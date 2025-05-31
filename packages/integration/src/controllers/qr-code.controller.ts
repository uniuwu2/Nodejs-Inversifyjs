import * as QRCode from "qrcode";
import * as jwt from "jsonwebtoken";
import { controller, httpGet } from "inversify-express-utils";

@controller("/qr-code")
export class QRCodeController {
  @httpGet("/")
  public async generateQRCode(req: Request, res: Response): Promise<void> {
    
  }
}