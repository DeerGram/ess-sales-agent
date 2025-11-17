import { createServer } from './server';
import { env } from './config';
const app = createServer();

app.listen(env.PORT, () => {
  console.log(`EMBER API running on http://localhost:${env.PORT}`);
});
