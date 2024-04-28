import { Input } from './input'
import { Output } from './output'

export interface UseCase<I extends Input, O extends Output> {
    execute(input: I): O
}
