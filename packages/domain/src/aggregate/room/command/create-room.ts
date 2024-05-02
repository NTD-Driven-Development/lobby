import { Player } from '../entity'

export type CreateRoomCommandSchema = {
    name: string
    game: {
        id: string
        name: string
    }
    host: Player
    players: Player[]
    minPlayers: number
    maxPlayers: number
    password: string | null
}
