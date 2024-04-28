/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyReply, FastifyRequest } from 'fastify'

export class UserController {
    public static async getUsers(
        request: FastifyRequest<{
            Querystring: { name: string }
        }>,
        reply: FastifyReply,
    ) {
        return 'Hello World!'
    }
}
