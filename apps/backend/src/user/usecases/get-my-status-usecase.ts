import { GetMyStatusResult, UseCase } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'

export type GetMyStatusInput = { email: string }

export type GetMyStatusOutput = GetMyStatusResult

@autoInjectable()
export class GetMyStatusUseCase implements UseCase<GetMyStatusInput, GetMyStatusOutput> {
    constructor(
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
    ) {}

    async execute(input: GetMyStatusInput): Promise<GetMyStatusOutput> {
        const user = await this.userRepository.findByEmail(input.email)
        const room = await this.roomRepository.findPlayerInNotClosedRoom(user.id)
        return new GetMyStatusResult({
            roomId: room?.id ?? null,
            id: user.id,
            email: user.email,
            name: user.name,
        })
    }
}
