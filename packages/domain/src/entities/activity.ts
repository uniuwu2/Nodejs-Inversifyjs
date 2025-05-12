import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
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

    @Column("datetime", { name: "start_time" })
    public startTime: Date = new Date();

    @Column("datetime", { name: "end_time" })
    public endTime: Date = new Date();

    @Column("varchar", { name: "location", length: 255 })
    public location: string = "";

    @Column("varchar", { name: "image_path", length: 255, nullable: true })
    public imagePath: string | null = null;

    @Column("tinyint", { name: "active", nullable: true, default: 1 })
    public active: number | null = 1;

    @Column("int", { name: "user_id" })
    public userId: number = 0;

    @OneToOne(() => User, (user) => user.activity)
    @JoinColumn({ name: "user_id" })
    public user: User | null = null;

    @OneToMany(() => ActivityStudent, (activityStudent) => activityStudent.activity)
    public student!: ActivityStudent[];

}