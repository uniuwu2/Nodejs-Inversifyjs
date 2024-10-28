import { controller, httpGet } from "inversify-express-utils";

@controller("/user")
export class UserController {
    constructor() {
    }
    @httpGet("/say-hello")
    public sayHello() {
        return "Hello World!";
    }
}