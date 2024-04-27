export abstract class DomainEvent<T> {
    constructor(
        public readonly type: string,
        public readonly data: Readonly<T>,
    ) {
        this.type = type
        this.data = data
    }

    public getEventData(): Readonly<T> {
        return this.data
    }

    public getEventType(): string {
        return this.type
    }
}
