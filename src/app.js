const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// const helloWorldRouter = require('./routes/helloWorld');
const openAI = require("./routes/chat")
const loginRouter = require('./routes/auth/login');
const registerRouter = require('./routes/auth/register');
const recipesRouter = require('./routes/recipes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet()); // https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// app.use('/api/helloWorld', helloWorldRouter);
app.use('/api/send-message', openAI)
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/recipes', recipesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// pass any unhandled errors to the error handler
app.use(errorHandler);

module.exports = app;
