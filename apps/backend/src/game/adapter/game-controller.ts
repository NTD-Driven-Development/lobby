/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyReply, FastifyRequest } from 'fastify'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class GameController {
    public async getGames(request: FastifyRequest, reply: FastifyReply) {
        return 'Hello World!'
    }
}
