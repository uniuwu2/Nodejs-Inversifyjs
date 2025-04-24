import "reflect-metadata";

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

import { bootstrap } from "@inversifyjs/integration";
import { container } from "@inversifyjs/integration";
import { referenceDataIoCModule } from "@inversifyjs/integration";

async function runApp() {
    const appPath = path.resolve(__dirname);
    const app = await bootstrap(container, process.env.PORT, appPath, referenceDataIoCModule);
    return app;
}

(async () => {
    await runApp();
})();

export { runApp };