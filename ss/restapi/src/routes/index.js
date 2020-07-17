import express from 'express'
import {index} from  '../controllers/index.controllers'

const router = express.Router()

/* GET home page. */
router.get('/', index)

export default router



// //////////////////////////////////////////////////////이전 문법//////////////////////////////////////////////////

// var express = require('express');
// var { index } = require ('../controllers/index.controller'); 
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   // res.render('index', { title: 'Express' }); 
//   // 아하~ render 함수를 쓰고 있군요?! 
//   // render 함수는 기본적으로 템플릿 엔진이 필요하도록 설계되어 있습니다. 
//   // 따라서 REST API 를 목적으로 달려가는 우리는 render 함수 대신 json 으로 리턴하는 로직을 만들어야

//   res.json({message: 'Hello Essie!'});
// });

// module.exports = router;
