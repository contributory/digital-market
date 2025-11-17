import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 API server running on ${env.apiUrl}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
});
