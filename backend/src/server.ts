/**
 * @author Anurag Munda
 *
 * @file server.ts
 * @description The underlying HTTP server instance created that handles incoming network requests, binds to a port, and manages the actual HTTP protocol.
 */

import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});
