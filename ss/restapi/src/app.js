require('dotenv').config()

import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import v1Route from './routes/v1'

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/v1', v1Route)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  let apiError = err

  if(!err.status) {
    apiError = createError(err)
  }

  //set locals. only providing error in development
  res.locals.message = apiError.message
  res.locals.error = process.env.NODE_ENV === 'development' ? apiError : {}

  // render the error page
  return res.status(apiError.status)
    .json({message: apiError.message})
// return res.status(err.status || 500)
//   .json(res.locals.error)
})

// bin/www 를 그대로 사용하기 위해서 예외적으로 commonJs 문법을 적용
module.exports = app


//////////////////////////////////////////////////////이전 문법//////////////////////////////////////////////////

// require('dotenv').config();

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // // view engine setup    // 뷰 템플릿인 jade 모듈을 express에 설정하는 코드 : 필요없음.
// // app.set('views', path.join(__dirname, 'views'));
// // app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// //app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   //res.locals.error = req.app.get('env') === 'development' ? err : {};
//   res.locals.error = process.env.NODE_ENV === 'development' ? err : {};   
//   // 원래는 위에꺼인데.. 음.. .env파일을 따로 설정해줘서 그 안에 있는 NODE_ENV=development 를 가져온 건가??

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
