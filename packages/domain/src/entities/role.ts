import { Column, Entity, OneToMany } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";

@Entity("role")
export class Role extends GenericEntity {
    @Column("varchar", { name: "role_name", unique: true, length: 255 })
    public roleName: string = "";

    @Column("varchar", { name: "role_description", length: 255 })
    public roleDescription: string = "";

    @OneToMany(() => User, (user) => user.role)
    public user!: User[];
  
}