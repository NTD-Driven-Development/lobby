import { Server } from '@packages/socket'
import { Event, Socket } from 'socket.io'
import { container } from 'tsyringe'
import { GameController } from '~/game/adapter/game-controller'

// import { FastifyInstance, FastifyPluginOptions } from 'fastify'
// export const GameRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
// const gameController = container.resolve(GameController)
// fastify.get('/', gameController.getGames)
// done()
// }

export const GameEventHandlers = (socket: Server) => async (event: Event, next: (err?: Error) => void) => {
    container.registerInstance(Socket, socket)
    const gameController = container.resolve(GameController)

    switch (event[0]) {
        case 'register-game':
            await gameController.registerGame(event[1])
            next()
            break
        case 'update-game-info':
            await gameController.updateGameInfo(event[1])
            next()
            break
        case 'get-games':
            socket.emit('get-games-result', await gameController.getGames(event[1]))
            next()
            break
        default:
            next()
            break
    }
    // socket.on('register-game', async (event) => {
    //     await gameController.registerGame(event)
    // })
    // socket.on('update-game-info', async (event) => {
    //     await gameController.updateGameInfo(event)
    // })
    // socket.on('get-games', async (event) => {
    //     socket.emit('get-games-result', await gameController.getGames(event))
    // })
}
