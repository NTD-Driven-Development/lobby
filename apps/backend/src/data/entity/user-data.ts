import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'

@Entity('user')
export class UserData extends BaseEntity {
    @PrimaryColumn({ type: 'uuid', name: 'id' })
    id!: string

    @Column({ type: 'varchar' })
    name!: string

    @Column({ type: 'varchar', unique: true })
    email!: string

    @Column({ type: 'timestamp', name: 'created_at', default: 'now()' })
    createdAt!: Date
}
