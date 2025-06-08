import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";
import { Activity } from "./activity";

@Entity("activity_student")
export class ActivityStudent extends GenericEntity {
    @Column("int", { name: "activity_id" })
    public activityId: number = 0;

    @Column("int", { name: "student_id" })
    public studentId: number = 0;

    @Column("tinyint", { name: "attendance_check"})
    public attendanceCheck: number = 0;

    @Column("varchar", { name: "note", length: 255})
    public note: string | null = null;

    @ManyToOne(() => Activity, (activity) => activity.student)
    @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
    public activity!: Activity;

    @ManyToOne(() => User, (user) => user.activityStudent)
    @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
    public student!: User;    
}