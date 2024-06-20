import { createRemoteJWKSet, jwtVerify, JWTVerifyOptions } from 'jose'
import { URL } from 'url'

import type { JWTHeaderParameters, JWTPayload } from 'jose'
import { Server } from '@packages/socket'
import { Auth0TestFeatureToggle } from '~/feature-toggle'

import env from 'dotenv'
env.config()

export interface Auth0User extends JWTPayload {
    email: string
    name: string
}

declare module 'socket.io' {
    interface Socket {
        auth: {
            user: Readonly<Auth0User>
            header: Readonly<JWTHeaderParameters>
        }
    }
}

type SocketIOMiddlewareFactory = (domain?: string, audience?: string) => (socket: Server, next: (err?: Error) => void) => void

const auth0Middleware: SocketIOMiddlewareFactory = (domainParam?: string, audienceParam?: string) => {
    if (Auth0TestFeatureToggle.isEnabled()) {
        return (socket, next) => {
            socket.auth = {
                user: socket.handshake.auth as Auth0User,
                header: {
                    alg: 'RS256',
                    typ: 'JWT',
                },
            }
            return next()
        }
    }

    const domain = domainParam ?? process.env.AUTH0_DOMAIN
    const audience = audienceParam ?? process.env.AUTH0_AUDIENCE

    if (!domain) {
        throw new Error('Config error: Auth0 domain not found, did you pass the domain parameter or set AUTH0_DOMAIN ?')
    }

    const JWKS = createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`))

    const config: JWTVerifyOptions = { issuer: `https://${domain}/` }

    if (audience !== undefined) {
        config.audience = audience
    }

    return async function (socket, next) {
        const { token: queryToken } = socket.handshake.query
        const headerToken = socket.handshake.headers.authorization
        const { token: authToken } = socket.handshake.auth
        const authHandshakeToken = queryToken ?? headerToken ?? authToken

        if (typeof authHandshakeToken !== 'string') {
            return next(
                new Error(
                    'No Authorization handshake information found, query{"token": "[token]" } }); https://socket.io/docs/v3/middlewares/#sending-credentials ',
                ),
            )
        }

        const authHandshakeTokenSplitted = authHandshakeToken.split(' ')

        if (authHandshakeTokenSplitted.length !== 2 || authHandshakeTokenSplitted[0] !== 'Bearer') {
            return next(new Error('Malformed Authorization handshake, should be: token: "Bearer [token]"'))
        }

        const jwt = authHandshakeTokenSplitted[1]

        try {
            const { payload, protectedHeader } = await jwtVerify<Auth0User>(jwt, JWKS, config)
            socket.auth = { user: payload, header: protectedHeader }
        } catch (err) {
            return next(new Error('Failed to verify claims, user not authorized'))
        }

        return next()
    }
}

export { auth0Middleware }
