import { GameId } from '~/aggregate/game'

export type UpdateGameInfoCommandSchema = { id: GameId } & Partial<{
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string | null
    frontendUrl: string
    backendUrl: string
}>

export type UpdateGameInfoEventSchema = {
    type: 'update-game-info'
    data: UpdateGameInfoCommandSchema
}
