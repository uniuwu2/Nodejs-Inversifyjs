import "reflect-metadata";

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

import { bootstrap, container, referenceDataIoCModule } from "@inversifyjs/integration";

async function runApp() {
    const appPath = path.resolve(__dirname);
    const app = await bootstrap(container, 9999, appPath, referenceDataIoCModule);
    return app;
}

(async () => {
    await runApp();
})();

export { runApp };