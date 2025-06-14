import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { Course } from "./course";
import { User } from "./user";
import { SessionClass } from "./session_class";
import { ClassStudent } from "./class_student";

@Entity("course_class")
export class CourseClass extends GenericEntity {

    @Column("varchar", { name:"semester", length: 255 })
    public semester: string = "";

    @Column("varchar", { name: "group", length: 255 })
    public group: string = "";

    @Column("json", { name: "class_schedule" })
    public classSchedule: string = "";

    @Column("int", { name: "max_student" })
    public maxStudent: number = 0;

    @Column("int", { name: "current_student" })
    public currentStudent: number = 0;

    @Column("int", { name: "session_number" })
    public sessionNumber: number = 0;

    @Column("date", { name: "start_date" })
    public startDate: Date = new Date();
    
    @Column("date", { name: "end_date" })
    public endDate: Date = new Date();

    @Column("tinyint", { name: "status" })
    public status: number = 1; // 0: inactive, 1: active, 2: completed

    @Column("int", { name: "course_id"})
    public courseId: number = 0;
    @ManyToOne(() => Course, (course) => course.course)
    @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
    public course: Course | null = null;

    @Column("int", { name: "teacher_id" })
    public teacherId: number = 0;
    @ManyToOne(() => User, (user) => user.course)
    @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
    public teacher!: User;

    @OneToMany(() => SessionClass, (sessionClass) => sessionClass.courseClass)
    public sessionClass!: SessionClass[];

    @OneToMany(() => ClassStudent, (classStudent) => classStudent.courseClass)
    public classStudent!: ClassStudent[];
}