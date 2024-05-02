export type RegisterGameCommandSchema = {
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string | null
    frontendUrl: string
    backendUrl: string
}

export type RegisterGameEventSchema = {
    type: 'register-game-info'
    data: RegisterGameCommandSchema
}
