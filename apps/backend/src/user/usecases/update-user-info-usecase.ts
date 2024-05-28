import { UseCase, UpdateUserInfoCommandSchema, User } from '@packages/domain'
import { EventBus } from '~/eventbus/eventbus'
import { WebSocketEventBus } from '~/eventbus/websocket-eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { UserRepository } from '~/user/repository/user-repository'
import { UserRepositoryImpl } from '~/user/repository/user-repository-impl'

export type UpdateUserInfoInput = UpdateUserInfoCommandSchema & { email: string }

@autoInjectable()
export class UpdateUserInfoUseCase implements UseCase<UpdateUserInfoInput, void> {
    constructor(
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.userRepository = userRepository
        this.eventBus = eventBus
    }

    async execute(input: UpdateUserInfoInput): Promise<void> {
        if(input.name == null || input.name == '')
            throw new Error('name can not be null or empty')

        const user = await this.userRepository.findByEmail(input.email)

        user.changeName(input.name as string)

        await this.userRepository.save(user)
        // 推
        const events = user.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
