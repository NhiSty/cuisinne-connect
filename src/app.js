import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler.js';
import { userSessionMiddleware } from './middleware/userSession.js';
import { NotFoundError } from './utils/errors.js';
import { setupRoutes } from './routes.js';

const app = express();

app.use(helmet()); // https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(userSessionMiddleware);

setupRoutes(app);

// handle 404 routes
app.all('*', function (req, res) {
	throw new NotFoundError();
});

// pass any unhandled errors to the error handler
app.use(errorHandler);
export default app;
