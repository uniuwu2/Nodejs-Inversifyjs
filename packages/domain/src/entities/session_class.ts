import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { CourseClass } from "./course_class";
import { Attendance } from "./attendance";

@Entity("session_class")
export class SessionClass extends GenericEntity {
    @Column("int", { name: "course_class_id" })
    public courseClassId: number = 0;

    @Column("int", { name: "session_date" })
    public sessionDate: number = 0;

    @Column("int", { name: "session_start_time" })
    public sessionStartTime: number = 0;

    @Column("int", { name: "session_end_time" })
    public sessionEndTime: number = 0;

    @Column("varchar", { name: "room", length: 255 })
    public room: string = "";

    @Column("tinyint", { name: "status", nullable: true, default: 1 })
    public status: number | null = 1;

    @Column("varchar", { name: "reason", length: 255, nullable: true })
    public reason: string | null = null;

    @ManyToOne(() => CourseClass, (courseClass) => courseClass.sessionClass)
    @JoinColumn([{ name: "course_class_id", referencedColumnName: "id" }])
    public courseClass: CourseClass | null = null;


    @OneToMany(() => Attendance, (attendance) => attendance.sessionClass)
    public attendance: Attendance | null = null;
}