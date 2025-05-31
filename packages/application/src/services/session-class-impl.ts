import { SessionClass } from "@inversifyjs/domain";
import { SessionClassRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { SessionClassService } from "./session-class.interface";

@injectable()
export class SessionClassServiceImpl extends AbstractService<SessionClass, SessionClassRepository> implements SessionClassService {
    
    public getRepositoryName(): string {
        return "SessionClassRepositoryImpl";
    }
}
