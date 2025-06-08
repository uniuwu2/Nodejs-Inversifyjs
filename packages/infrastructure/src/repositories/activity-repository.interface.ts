import { Activity } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface ActivityRepository extends GenericRepository<Activity> {
    createQueryBuilder(alias: string): any;
}
