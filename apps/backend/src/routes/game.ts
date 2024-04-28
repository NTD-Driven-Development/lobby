/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { GameController } from '~/controllers/game-controller'

export const GameRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    fastify.get('/', GameController.getGames)
    done()
}
