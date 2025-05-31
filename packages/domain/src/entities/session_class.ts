import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { CourseClass } from "./course_class";
import { Attendance } from "./attendance";
import { User } from "./user";

@Entity("session_class")
export class SessionClass extends GenericEntity {
    @Column("int", { name: "course_class_id" })
    public courseClassId: number = 0;

    @Column("date", { name: "session_date" })
    public sessionDate: Date = new Date();

    @Column("varchar", { name: "session_start_time", length: 255 })
    public sessionStartTime: string = "";

    @Column("varchar", { name: "session_end_time", length: 255 })
    public sessionEndTime: string = "";

    @Column("varchar", { name: "room", length: 255 })
    public room: string = "";

    @Column("tinyint", { name: "status", nullable: true, default: 1 })
    public status: number | null = 1;

    @Column("varchar", { name: "reason", length: 255, nullable: true })
    public reason: string | null = null;

    @Column("int", { name: "teacher_id"})
    public teacherId: number = 0;
    @ManyToOne(() => User, (user) => user.sessionClass)
    @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
    public teacher!: User;

    @ManyToOne(() => CourseClass, (courseClass) => courseClass.sessionClass)
    @JoinColumn([{ name: "course_class_id", referencedColumnName: "id" }])
    public courseClass: CourseClass | null = null;


    @OneToMany(() => Attendance, (attendance) => attendance.sessionClass)
    public attendance: Attendance | null = null;
}