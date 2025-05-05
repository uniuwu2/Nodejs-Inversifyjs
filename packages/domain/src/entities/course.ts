import { Column, Entity, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { CourseClass } from "./course_class";

@Entity("course")
export class Course extends GenericEntity {
    @Column("varchar", { name: "course_name", length: 255 })
    public courseName: string = "";

    @Column("varchar", { name: "course_code", unique: true, length: 255 })
    public courseCode: string = "";

    @Column("varchar", { name: "department", length: 255 })
    public department: string = "";
    
    @Column("int", { name: "credit" })
    public credit: number = 0;

    @Column("varchar", { name: "course_description", length: 255 })
    public courseDescription: string = "";
    
    @OneToMany(() => CourseClass, (courseClass) => courseClass.course)
    public course: CourseClass[] | null = null;
}