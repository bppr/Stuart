import { DriverCar } from "../../common/DriverState";
import { sendChatMessages } from "../sdk";

/**
 * 'd' for a drive-through, positive integer for hold time in pits.
 */
export type HoldTime = "d" | number;

export class Penalty {
    constructor(private car: DriverCar, hold: HoldTime, public id: number) {
        if (typeof hold === "number") {
            if (hold < 0) throw new Error("Penalty time cannot be negative");
            this.hold = (hold | 0);
        } else {
            this.hold = hold;
        }
        this.resolution = "none";
    }
    private hold: HoldTime;
    private resolution: "none" | "issued" | "dismissed";

    public getDescription(): string {
        if (this.hold === 'd') {
            return "Drive Through";
        } else if (this.hold === 0) {
            return "Stop-and-Go";
        } else {
            return `Hold for ${this.hold}s`;
        }
    }

    public getChatCommand(): string {
        if (this.hold === 0) {
            return `!black #${this.car.number}`;
        } else {
            return `!black #${this.car.number} ${this.hold}`;
        }
    }

    /**
     * Issues this penalty to the driver in question, if it has not already been issued or dismissed
     */
    public async execute(): Promise<void> {
        if (this.resolution == "none") {
            await sendChatMessages([this.getChatCommand()]);
            this.resolution = "issued";
        }
    }

    public getResolution() {
        return this.resolution;
    }

    public dismiss() {
        if(this.resolution == "none") {
            this.resolution = "dismissed";
        }
    }
}