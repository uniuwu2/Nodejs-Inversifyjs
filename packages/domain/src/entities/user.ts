import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { Role } from "./role";
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
    public image_path: string = "";


    @Column("tinyint", { name: "active", nullable: true, default: 1 })
    public active: number | null = 1;

    @Column("varchar", { name: "student_id", nullable: true, length: 255 })
    public studentId: string | null = "";

    @Column("varchar", { name: "oauth_id", nullable: true, length: 255 })
    public oauthId: string | null = "";

    @Column("varchar", { name: "oauth_provider", nullable: true, length: 255 })
    public oauthProvider: string | null = "";

    @ManyToOne(() => Role, (role) => role.user)
    public roleId: Role | null = null;
}