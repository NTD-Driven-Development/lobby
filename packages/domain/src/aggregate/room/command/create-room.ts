import { Player } from '../entity'

export type CreateRoomCommandSchema = {
    name: string
    game: {
        id: string
        name: string
        minPlayers: number
        maxPlayers: number
    }
    host: Player
    players: Player[]
    minPlayers: number
    maxPlayers: number
    password: string | null
}
