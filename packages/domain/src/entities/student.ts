import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";

@Entity("student")
export class Student extends GenericEntity {
    @Column("varchar", { name: "student_number", length: 255 })
    public student_number: string = "";

    @Column("varchar", { name: "major", length: 255 })
    public major: string = "";

    @Column("int", { name: "student_id" })
    public studentId: number = 0;

    @OneToOne(() => User, (user) => user.student, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn({ name: "student_id" , referencedColumnName: "id" })
    public user: User | null = null;

}