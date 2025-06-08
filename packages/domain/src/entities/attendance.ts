import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { SessionClass } from "./session_class";


@Entity("attendance")
export class Attendance extends GenericEntity {
    @Column("int", { name: "session_id" })
    public sessionId: number = 0;

    @Column("json", { name: "student_attendance" })
    public studentAttendance: any = "";

    @Column("int", { name: "status" })
    public status: number = 0;

    @ManyToOne(() => SessionClass, (sessionClass) => sessionClass.attendance)
    @JoinColumn([{ name: "session_id", referencedColumnName: "id" }])
    public sessionClass!: SessionClass;
}