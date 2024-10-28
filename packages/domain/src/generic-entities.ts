import { BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

export abstract class GenericEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    public id: number = 0;

    @Column("varchar", { name: "created_by", nullable: true, length: 255 })
    public createdBy: string | null = "";

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    public createdAt!: Date;
}