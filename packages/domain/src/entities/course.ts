import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { CourseClass } from "./course_class";
import { Department } from "./department";

@Entity("course")
export class Course extends GenericEntity {
    @Column("varchar", { name: "course_name", length: 255 })
    public courseName: string = "";

    @Column("varchar", { name: "course_code", length: 255 })
    public courseCode: string = "";

    @Column("int", { name: "department_id", nullable: true })
    public departmentId: number = 0;
    @ManyToOne(() => Department, (department) => department.course)
    @JoinColumn({ name: "department_id", referencedColumnName: "id" })
    public department!: Department;

    @Column("int", { name: "credit" })
    public credit: number = 0;

    @Column("varchar", { name: "course_description", length: 255 })
    public courseDescription: string = "";
    
    @OneToMany(() => CourseClass, (courseClass) => courseClass.course)
    public course: CourseClass[] | null = null;
}