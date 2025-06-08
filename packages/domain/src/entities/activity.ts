import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";
import { ActivityStudent } from "./activity_student";

@Entity("activity")
export class Activity extends GenericEntity {
    @Column("varchar", { name: "activity_name", unique: true, length: 255 })
    public activityName: string = "";

    @Column("varchar", { name: "activity_description", length: 255 })
    public activityDescription: string = "";

    @Column("datetime", { name: "activity_date" })
    public activityDate: Date = new Date();

    @Column("varchar", { name: "start_time" })
    public startTime: any;

    @Column("varchar", { name: "end_time" })
    public endTime: any;

    @Column("varchar", { name: "location", length: 255 })
    public location: string = "";

    @Column("tinyint", { name: "active", nullable: true, default: 1 })
    public active: number | null = 1;

    @Column("tinyint", { name: "status", default: 1 })
    public status: number = 1; // 0: inactive, 1: active, 2: completed

    @Column("int", { name: "max_student" })
    public maxStudent: number = 0;

    @Column("int", { name: "current_student" })
    public currentStudent: number = 0;

    @Column("int", { name: "user_id" })
    public userId: number = 0;

    @ManyToOne(() => User, (user) => user.activity)
    @JoinColumn({ name: "user_id" })
    public user!: User;

    @OneToMany(() => ActivityStudent, (activityStudent) => activityStudent.activity)
    public student!: ActivityStudent[];

}