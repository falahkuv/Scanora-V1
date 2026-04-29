const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const testEnvPath = path.join(__dirname, "..", ".env.test");
const defaultEnvPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
} else {
  dotenv.config({ path: defaultEnvPath });
}
