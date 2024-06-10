import { Entity, Column, BaseEntity, PrimaryColumn, Unique } from 'typeorm'

@Entity('game')
@Unique('game_id_version', ['id', 'version'])
export class GameData extends BaseEntity {
    @PrimaryColumn({ type: 'uuid', name: 'id' })
    id!: string

    @Column({ type: 'varchar', name: 'name' })
    name!: string

    @Column({ type: 'text', name: 'description' })
    description!: string

    @Column({ type: 'text', name: 'rule' })
    rule!: string

    @Column({ type: 'int', name: 'min_players' })
    minPlayers!: number

    @Column({ type: 'int', name: 'max_players' })
    maxPlayers!: number

    @Column({ type: 'varchar', name: 'image_url', nullable: true })
    imageUrl!: string | null

    @Column({ type: 'varchar', name: 'frontend_url' })
    frontendUrl!: string

    @Column({ type: 'varchar', name: 'backend_url' })
    backendUrl!: string

    @Column({ type: 'enum', name: 'status', enum: ['ONLINE', 'OFFLINE'], unique: false })
    status!: 'ONLINE' | 'OFFLINE'

    @Column({ type: 'int', name: 'version' })
    version!: number

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @Column({ type: 'timestamp', name: 'updated_at', nullable: true, default: null })
    updatedAt?: Date | null
}
