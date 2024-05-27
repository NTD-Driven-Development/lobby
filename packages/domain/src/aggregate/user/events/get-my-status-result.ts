import { DomainEvent } from '../../../core/entity'

export type GetMyStatusResultSchema = {
    roomId: string | null
}

export class GetMyStatusResult extends DomainEvent {
    constructor(public readonly data: GetMyStatusResultSchema) {
        super('get-my-status-result', new Date())
    }
}

export type GetMyStatusResultEventSchema = GetMyStatusResult

export type GetMyStatusEventSchema = {
    type: 'get-my-status'
    data: null
}
