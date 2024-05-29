import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'

@Entity('user')
export class UserData extends BaseEntity {
    @PrimaryColumn({ type: 'uuid', name: 'id' })
    id!: string

    @Column({ type: 'varchar', name: 'name' })
    name!: string

    @Column({ type: 'varchar', name: 'email', unique: true })
    email!: string

    @Column({ type: 'timestamp', name: 'created_at', default: 'now()' })
    createdAt!: Date
}
