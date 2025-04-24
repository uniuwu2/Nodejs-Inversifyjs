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

    @ManyToOne(() => Activity, (activity) => activity.student, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
    public activity: Activity | null = null;

    @ManyToOne(() => User, (user) => user.activityStudent, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
    public student: User | null = null;    
}