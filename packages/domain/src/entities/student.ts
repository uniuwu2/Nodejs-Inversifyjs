import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";

@Entity("student")
export class Student extends GenericEntity {
    @Column("varchar", { name: "student_number", length: 255 })
    public student_number: string = "";

    @Column("varchar", { name: "student_class", length: 255 })
    public student_class: string = "";

    @OneToOne(() => User, (user) => user.student)
    @JoinColumn({ name: "student_id" , referencedColumnName: "id" })
    public user!: User;
}