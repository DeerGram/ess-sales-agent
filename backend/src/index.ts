import { createServer } from './server';
import { loadEnv } from './utils/env';

const env = loadEnv();
const app = createServer();

app.listen(env.PORT, () => {
  console.log(`EMBER API running on http://localhost:${env.PORT}`);
});
