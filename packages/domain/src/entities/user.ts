import { Column, Entity, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";

@Entity("user")
export class User extends GenericEntity {
    @Column("varchar", { name: "email", unique: true, length: 512 })
    public email: string = "";

    @Column("varchar", { name: "password", length: 512 })
    public password: string = "";

    @Column("varchar", { name: "first_name", length: 255 })
    public firstName: string = "";

    @Column("varchar", { name: "last_name", length: 255 })
    public lastName: string = "";

    @Column("varchar", { name: "phone_number", nullable: true, length: 255 })
    public phoneNumber: string = "";

    @Column("varchar", { name: "profile_picture", length: 255 })
    public profilePicture: string = "";

    @Column("varchar", { name: "role", length: 255 })
    public role: string = "";

    @Column("tinyint", { name: "active", nullable: true, default: 1 })
    public active: number | null = 1;

    @Column("tinyint", { name: "is_editable", default: 1})
    public isEditable: number = 1;

    @Column("tinyint", { name: "language", default: 1})
    public language: number = 1;
}