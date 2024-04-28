/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyReply, FastifyRequest } from 'fastify'

export class GameController {
    public static async getGames(request: FastifyRequest, reply: FastifyReply) {
        return 'Hello World!'
    }
}
