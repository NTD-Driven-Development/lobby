import { UseCase, UpdateUserInfoCommandSchema } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'

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
        const user = await this.userRepository.findByEmail(input.email)
        user.changeName(input.name as string)
        await this.userRepository.save(user)
        const events = user.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
