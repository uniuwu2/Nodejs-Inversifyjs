import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { SessionClass } from "./session_class";


@Entity("attendance")
export class Attendance extends GenericEntity {
    @Column("int", { name: "session_id" })
    public sessionId: number = 0;

    @Column("int", { name: "student_id" })
    public studentId: number = 0;

    @Column("int", { name: "status" })
    public status: number = 0;

    @Column("varchar", { name: "comment", length: 255 })
    public comment: string = "";

    @Column("datetime", { name: "attendance_date_time" })
    public attendanceDateTime: Date = new Date();

    @Column("varchar", { name: "attendance_type", length: 255 })
    public attendanceType: string = "";

    @Column("varchar", { name: "attendance_location", length: 255 })
    public attendanceLocation: string = "";

    @ManyToOne(() => SessionClass, (sessionClass) => sessionClass.attendance, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "session_id", referencedColumnName: "id" }])
    public sessionClass: SessionClass | null = null;
}