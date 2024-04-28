/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyReply, FastifyRequest } from 'fastify'

export class RoomController {
    public static async getRooms(request: FastifyRequest, reply: FastifyReply) {
        return 'Hello World!'
    }
}
