import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";

@controller("/api/v1")
export class ApiController {
  // This controller can be used to define API endpoints
  // For example, you can add methods here to handle GET, POST, etc.
  
  // Example method:
  // @httpGet("/example")
  // public getExample(req: Request, res: Response): Response {
  //   return res.json({ message: "This is an example endpoint" });
  // }

  @httpGet("/attendance/:token")
    public async checkAttendanceFromQr(req: Request, res: Response) {
        console.log("Checking attendance from QR code");
    }

}