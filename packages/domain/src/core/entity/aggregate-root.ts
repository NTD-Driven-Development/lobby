import { DomainEvent } from './domain-event'
import { Entity } from './entity'

export abstract class AggregateRoot<ID> implements Entity<ID> {
    protected id!: ID
    private domainEvents: DomainEvent[] = []

    constructor(id: ID)
    constructor(events: DomainEvent[]) {
        if (typeof events === 'undefined') {
            this.id = null as unknown as ID
            this.domainEvents = []
        } else if (typeof events === 'string') {
            this.id = events as unknown as ID
            this.domainEvents = []
        } else {
            events.forEach((x) => this.apply(x))
            this.clearDomainEvents()
        }
    }

    public getId(): ID {
        return this.id
    }

    public addDomainEvent(event: DomainEvent): void {
        this.domainEvents.push(event)
    }

    public getDomainEvents(): DomainEvent[] {
        return this.domainEvents
    }

    public clearDomainEvents(): void {
        this.domainEvents = []
    }

    protected abstract when(event: DomainEvent): void

    protected ensureInvariant(): void {}

    public apply(event: DomainEvent): void {
        this.ensureInvariant()

        this.when(event)

        this.ensureInvariant()

        this.addDomainEvent(event)
    }
}
