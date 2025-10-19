// src/server.js
import app from "./app.js";
import { ENV } from "./config/env.js";

app.listen(ENV.PORT, () => {
  console.log(`Server running at http://localhost:${ENV.PORT}`);
});
