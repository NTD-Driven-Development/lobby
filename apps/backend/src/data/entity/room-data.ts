import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'

@Entity('room')
export class RoomData extends BaseEntity {
    @PrimaryColumn({ type: 'uuid', name: 'id' })
    id!: string

    @Column({ type: 'varchar' })
    name!: string

    @Column({ type: 'json' })
    game!: {
        id: string
        name: string
        minPlayers: number
        maxPlayers: number
    }

    @Column({ type: 'json' })
    host!: {
        id: string
        name: string
        isReady: boolean
        status: 'CONNECTED' | 'DISCONNECTED'
    }

    @Column({ type: 'jsonb', nullable: true })
    players!: {
        id: string
        name: string
        isReady: boolean
        status: 'CONNECTED' | 'DISCONNECTED'
    }[]

    @Column({ type: 'int' })
    minPlayers!: number

    @Column({ type: 'int' })
    maxPlayers!: number

    @Column({ type: 'timestamp' })
    createdAt!: Date

    @Column({ type: 'enum', enum: ['WAITING', 'PLAYING'], unique: false })
    status!: 'WAITING' | 'PLAYING'

    @Column({ type: 'varchar', nullable: true })
    password!: string

    @Column({ type: 'boolean' })
    isClosed!: boolean

    @Column({ type: 'varchar', nullable: true })
    gameUrl!: string | null
}
