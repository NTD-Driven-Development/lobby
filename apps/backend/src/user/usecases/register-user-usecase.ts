import { UseCase, RegisterUserCommandSchema, User } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'
import { v4 } from 'node-uuid'

export type RegisterUserInput = RegisterUserCommandSchema

@autoInjectable()
export class RegisterUserUseCase implements UseCase<RegisterUserInput, void> {
    constructor(
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.userRepository = userRepository
        this.eventBus = eventBus
    }

    async execute(input: RegisterUserInput): Promise<void> {
        const userExists = await this.userRepository.existsUserByEmail(input.email)
        if (userExists) return
        const user = new User(v4(), input.email, input.name)
        user.register({
            email: user.email,
            name: user.name,
        })
        await this.userRepository.save(user)
        const events = user.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
