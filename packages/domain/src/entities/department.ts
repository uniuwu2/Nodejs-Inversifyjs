import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";
import { Course } from "./course";


@Entity("department")
export class Department extends GenericEntity {
    @Column("varchar", { name: "department_name", length: 255 })
    public departmentName: string = "";

    @Column("varchar", { name: "description", length: 255 })
    public description: string = "";

    @OneToMany(() => User, (user) => user.department)
    public user!: User[];

    @OneToMany(() => Course, (course) => course.department)
    public course!: Course[];
}