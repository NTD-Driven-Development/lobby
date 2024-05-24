import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'

// 因為 Repository 的目的是為了存取資料庫而設計出的
// 但為了切換「存取資料的媒介」（例如：DB、另一個DB、excel中）時的方便
// 所以需要類似 model 的東西宣告好格式，用來讓 db 中的資料與系統中的變數做對接
// Entity 就是一個 table 中的一筆資料

// room 目前有設計 table schema 嗎
// room 中的 password 需要加密嗎？

// 為什麼需要將資料宣告於 data-source中？

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
    }

    @Column({ type: 'jsonb', nullable: true })
    players!: {
        id: string
        name: string
        isReady: boolean
    }[]

    @Column({ type: 'int' })
    minPlayers!: number

    @Column({ type: 'int' })
    maxPlayers!: number

    @Column({ type: 'date' })
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
