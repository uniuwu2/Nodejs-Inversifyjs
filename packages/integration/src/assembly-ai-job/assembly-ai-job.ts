import { inject, injectable } from "inversify";
import { Job } from "../job";
import { Glob } from "glob";
@injectable()
export class AssemblyAIJob extends Job {

    public async converting(): Promise<void>{ 
        this.logger.debug("[" + this.getName() + "] is converting ...");
        let filePath = process.env.FILES_PATH || "./dist/audio/input/*.mp3";
        let files = new Glob(filePath, {});
        for await (const file of files) {
            this.logger.debug("[" + this.getName() + "] is converting file: " + file);
        }
    }

    public consume(): void {
        this.logger.debug("[" + this.getName() + "] is consuming ...");
        this.converting();
    }

    public getName(): string {
        return "AssemblyAIJob";
    }
}