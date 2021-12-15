import { Outbox } from "./state";

type Message = {
    channel: string,
    data: any
};

/**
 * ReplayOutbox is an ❴@link Outbox} wrapper that saves the messages it sends and can replay those messages to new Outboxes.
 */
export class ReplayOutbox {

    private messages: Message[];
    private outboxes: Outbox[];

    constructor(...outboxes: Outbox[]) {
        this.messages = [];
        this.outboxes = [];

        outboxes.forEach((outbox) => {
            this.addOutbox(outbox, false);
        });
    }

    public send<T>(channel: string, data: T): void {
        let message: Message = {
            channel,
            data
        };

        this.messages.push(message);
        this.sendTransient(channel, data);
    }

    // sends a message but does not save it for replay later
    public sendTransient<T>(channel: string, data: T): void {
        this.outboxes.forEach((outbox) => {
            outbox.send<T>(channel, data);
        });
    }

    public addOutbox(outbox: Outbox, replay = true): void {
        if (replay) {
            this.messages.forEach((msg) => {
                outbox.send(msg.channel, msg.data);
            });
        }

        this.outboxes.push(outbox);
    }

    public getMessages(): Message[] {
        return [...this.messages];
    }
}
