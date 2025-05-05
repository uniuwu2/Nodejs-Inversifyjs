import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { Role } from "./role";
import { Student } from "./student";
import { ActivityStudent } from "./activity_student";
import { CourseClass } from "./course_class";
import { ClassStudent } from "./class_student";
import { Attendance } from "./attendance";

@Entity("user")
export class User extends GenericEntity {
    @Column("varchar", { name: "email", unique: true, length: 512 })
    public email: string = "";

    @Column("varchar", { name: "password", length: 512 })
    public password: string = "";

    @Column("varchar", { name: "refresh_token", length: 1024, nullable: true })
    public refreshToken: string = "";
    
    @Column("varchar", { name: "first_name", length: 255 })
    public firstName: string = "";

    @Column("varchar", { name: "last_name", length: 255 })
    public lastName: string = "";

    @Column("varchar", { name: "phone_number", nullable: true, length: 255 })
    public phoneNumber: string = "";

    @Column("varchar", { name: "image_path", length: 255, nullable: true })
    public imagePath: string | null = "";

    @Column("tinyint", { name: "active", nullable: true, default: 1 })
    public active: number | null = 1;

    @Column("varchar", { name: "oauth_id", nullable: true, length: 255 })
    public oauthId: string | null = "";

    @Column("varchar", { name: "oauth_provider", nullable: true, length: 255 })
    public oauthProvider: string | null = "";

    @Column("int", { name: "role_id" })
    public roleId: number = 0;
    @ManyToOne(() => Role, (role) => role.user, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
    public role: Role | null = null;

    @OneToOne(() => Student, (student) => student.user)
    public student: Student | null = null;

    @OneToOne(() => Student, (student) => student.user)
    public staff: Student | null = null;

    @OneToOne(() => Student, (student) => student.user)
    public activity: Student | null = null;

    @OneToMany(() => ActivityStudent, (activityStudent) => activityStudent.student)
    public activityStudent!: ActivityStudent[];

    @OneToMany(() => CourseClass, (courseClass) => courseClass.teacher)
    public course!: CourseClass[];

    @OneToMany(() => ClassStudent, (classStudent) => classStudent.student)
    public classStudent!: ClassStudent[];
}