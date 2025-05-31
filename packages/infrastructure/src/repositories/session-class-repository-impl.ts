import { SessionClass } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { SessionClassRepository } from "./session-class-repository.interface";

/**
 * User Repository
 */
@injectable()
export class SessionClassRepositoryImpl extends AbstractRepository<SessionClass> implements SessionClassRepository {
    public getEntityType(): any {
        return SessionClass;
    }

    public getRepositoryName(): string {
        return "SessionClassRepositoryImpl";
    }
}
