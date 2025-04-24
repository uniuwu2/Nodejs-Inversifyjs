import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { GenericEntity } from "../generic-entities";
import { User } from "./user";

@Entity("staff")
export class Staff extends GenericEntity {

    @Column("varchar", { name: "department", length: 255 })
    public department: string = "";

    @Column("varchar", { name: "position", length: 255 })
    public position: string = "";

    @OneToOne(() => User, (user) => user.staff)
    @JoinColumn({ name: "staff_id" })
    public user: User | null = null;
}