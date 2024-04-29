/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { container } from 'tsyringe'
import { GameController } from '~/game/adapter/game-controller'

export const GameRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    const gameController = container.resolve(GameController)
    fastify.get('/', gameController.getGames)
    done()
}
