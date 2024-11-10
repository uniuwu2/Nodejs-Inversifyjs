import { TYPES } from "@inversifyjs/application";
import { inject } from "inversify";
import { Logger } from "@inversifyjs/infrastructure";

export abstract class Job {
    /** use for logging */
    @inject(TYPES.Logger)
    protected logger!: Logger;

    // @inject(TYPES.LogService)
    // protected logService!: LogService;

    protected sleepTime: number = 10000; //default
    private isRunning: boolean = true;

    /**
     * Start the job
     */
    public async start(): Promise<void> {
        while (this.isRunning) {
            this.logger.debug("[" + this.getName() + "] is consumming ...");
            /** template will be handled by dereived class */
            this.consume();
            this.logger.debug("[" + this.getName() + "] -> Sleep " + this.sleepTime / 1000 + " seconds ... for the next consuming.");
            await new Promise((resolve) => setTimeout(resolve, this.sleepTime));
        }
        this.logger.debug("The [" + this.getName() + "] stopped  ...");
    }

    /**
     * Stop the job
     * Further implementation
     */
    public async stop(): Promise<void> {
        this.logger.debug("The [" + this.getName() + "] is stopping  ...");
        this.isRunning = false;
    }

    public abstract consume(): void;
    public abstract getName(): string;
}
