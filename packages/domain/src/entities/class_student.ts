import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";
import { CourseClass } from "./course_class";

@Entity("class_student")
export class ClassStudent extends GenericEntity {
    @Column("int", { name: "course_class_id" })
    public courseClassId: number = 0;

    @Column("int", { name: "student_id" })
    public studentId: number = 0;

    @ManyToOne(() => User, (user) => user.classStudent)
    @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
    public student: User | null = null;

    @ManyToOne(() => CourseClass, (courseClass) => courseClass.classStudent)
    @JoinColumn([{ name: "course_class_id", referencedColumnName: "id" }])
    public courseClass: CourseClass | null = null;
}