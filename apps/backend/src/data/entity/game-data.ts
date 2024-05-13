import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'

@Entity('game')
export class GameData extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string

    @Column({ type: 'varchar' })
    name!: string

    @Column({ type: 'text' })
    description!: string

    @Column({ type: 'text' })
    rule!: string

    @Column({ type: 'int' })
    minPlayers!: number

    @Column({ type: 'int' })
    maxPlayers!: number

    @Column({ type: 'varchar', nullable: true })
    imageUrl!: string | null

    @Column({ type: 'varchar' })
    frontendUrl!: string

    @Column({ type: 'varchar' })
    backendUrl!: string

    @Column({ type: 'enum', enum: ['ONLINE', 'OFFLINE'] })
    status!: 'ONLINE' | 'OFFLINE'

    @Column({ type: 'int' })
    version!: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @Column({ type: 'timestamp', nullable: true })
    updatedAt?: Date | null
}
