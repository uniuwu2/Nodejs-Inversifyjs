import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { Course } from "./course";
import { User } from "./user";
import { Session } from "./session";
import { ClassStudent } from "./class_student";

@Entity("course_class")
export class CourseClass extends GenericEntity {
    @Column("int", { name: "course_id" })
    public courseId: number = 0;

    @Column("int", { name: "teacher_id" })
    public teacherId: number = 0;

    @Column("varchar", { name:"semester", length: 255 })
    public semester: string = "";

    @Column("json", { name: "class_schedule" })
    public classSchedule: string = "";

    @ManyToOne(() => Course, (course) => course.courseClass, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
    public course: Course | null = null;

    @OneToOne(() => User, (user) => user.courseClass, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
    public teacher: User | null = null;

    @OneToMany(() => Session, (session) => session.courseClass)
    public session!: Session[];

    @OneToMany(() => ClassStudent, (classStudent) => classStudent.courseClass)
    public classStudent!: ClassStudent[];
}