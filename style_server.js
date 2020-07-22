var express = require('express');
var fs = require('fs');
const cors = require('cors');
var bodyParser = require('body-parser');
var requestUrl = require('request');
var rp = require('request-promise');

var app = express();
//var port = 3300;
app.use(cors());
app.use(express.static('public')); //경로는 http://localhost:3300/style/style.json

//express 미들웨어 bodyparser을 이용해 POST로 들어온 body에 있는 request를 알아내자
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());



///////////////////////// 데이터베이스 연결 //////////////////////////
const { Client } = require('pg');
const { request } = require('http');
const { defaultMaxListeners } = require('stream');
const { rejects } = require('assert');
const { start } = require('repl');
var connectionString = "postgres://postgres:chzhzh1212@localhost:5433/location";

const client = new Client({
    connectionString: connectionString
});

client.connect();
/////////////////////////////////////////////////////////////////////

// 익스프레스 앱 포트 설정
app.set('port', process.env.PORT || 3300);
// 라우터 객체 참조 - 마지막에 라우터 객체 꼭 참조 해줘야함
var router = express.Router();

//////////////////////////////////////////////////////////////////////////


router.route('/readdir').get(function (req, res) {  
  fs.readdir('./public/style/wemap/', (err, _stylelist) => {   
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }

    res.send({ stylelist: _stylelist });
  });
});


router.route('/textsearch/:query').get(function(req,res) {   ////////////////google 검색 api : 장소검색
  var query = req.params.query;
  var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='
            + encodeURI(query) +
            '&language=ko&region=kr&key=AIzaSyCXnKkYfyqyacIivArtNQFgkypAj7HXJhw';
  //console.log(url);
  requestUrl.get(url, async function(error, response, body) {
    if(error){
      console.log('error in /textsearch/:query.... ', error);
      res.statusMessage(500).send(error);
    } else {
      var results = JSON.parse(body).results;

      var output = [];
      for(var i = 0 ; i<results.length ; i++) {
        var temp = await getDetail(results[i].place_id);
        
        var tempobj = {
          'name' : results[i].name,
          'address' : results[i].formatted_address,
          'location' : results[i].geometry.location,
          'types' : results[i].types
        }

        var postal = temp.result.address_components;
        tempobj.postal_code = postal[postal.length-1];
        tempobj.formatted_phone_number = temp.result.formatted_phone_number;
        
        output.push(tempobj);
      }

      //console.log(output);
      res.send(output);
    }
  });

  function getDetail(place_id) {
    var url = "https://maps.googleapis.com/maps/api/place/details/json?place_id="
    + place_id +
    "&fields=name,formatted_phone_number,address_components&key=AIzaSyCXnKkYfyqyacIivArtNQFgkypAj7HXJhw";

    var options = {
      uri : url,
      json: true
    }
    
    return rp(options)
  }
})

router.route('/textsearch/nextpage/:nextpagetoken').get(function(req,res) {  ////////////////google 검색 api : 검색된 장소 다음페이지
  var nextpagetoken = req.params.nextpagetoken;
  var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=" 
            + encodeURI(nextpagetoken) + 
            "&key=AIzaSyCXnKkYfyqyacIivArtNQFgkypAj7HXJhw";
  //console.log(url);

  requestUrl.get(url, function(error, response, body) { //functin(req,res)
    if(error){
      console.log('error in /textsearch/nextpage/:nextpagetoken.... ', err);
      res.statusMessage(500).send(err);
    }
    else {
      var results = JSON.parse(body).results;

      var output = [];
      for(var i = 0 ; i<results.length ; i++) {
        var temp = await getDetail(results[i].place_id);
        
        var tempobj = {
          'name' : results[i].name,
          'address' : results[i].formatted_address,
          'location' : results[i].geometry.location,
          'types' : results[i].types
        }

        var postal = temp.result.address_components;
        tempobj.postal_code = postal[postal.length-1];
        tempobj.formatted_phone_number = temp.result.formatted_phone_number;
        
        output.push(tempobj);
      }

      //console.log(output);
      res.send(output);
    }
  });

  function getDetail(place_id) {
    var url = "https://maps.googleapis.com/maps/api/place/details/json?place_id="
    + place_id +
    "&fields=name,formatted_phone_number,address_components&key=AIzaSyCXnKkYfyqyacIivArtNQFgkypAj7HXJhw";

    var options = {
      uri : url,
      json: true
    }
    
    return rp(options)
  }
})



////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.route('/location').get(function (req, res) {   // get 으로 즐겨찾기 목록 조회
  client.query('SELECT * FROM location_table ORDER BY id ASC', function (err, result) {
      if (err) {
          console.log('database select query error occures.. :(( : ', err);
          res.status(400).send(err);
      }
      res.status(200).send(result.rows);
      console.log('GET req 들어옴!')
  });
});

router.route('/location').post(function (req, res) { // post 로 테이블에 값 추가 & 수정
var j = req.body;
var sqlquery = 
  `WITH subq AS (
    SELECT ${!!j.id?j.id:"nextval('seq_loc_id')"} as id, ${j.longitude} as longitude, ${j.latitude} as latitude, '${j.location}' as location, 
                ${j.zoom} as zoom, ${j.pitch} as pitch, ${j.bearing} as bearing, '${j.address}' as address
    )
  INSERT INTO location_talbe (id, longitude, latitude, location, zoom, pitch, bearing, address)
                      (SELECT id, longitude, latitude, location, zoom, pitch, bearing, address FROM subq)
  ON CONFLICT ON constraint loc_pk
  DO UPDATE SET (longitude, latitude, location, zoom, pitch, bearing, address)
       = (SELECT longitude, latitude, location, zoom, pitch, bearing, address FROM subq)
  RETURNING  id, longitude, latitude, location, zoom, pitch, bearing, address`;

//console.log(sqlquery);

  client.query(sql, function(err, result) {
    if (err) {
      console.log(' error on route(/location).post... : ', err);
      res.status(400).send(err);
    } else {
      console.log(result.rows[0]);
      res.send(result.row[0]);
    }
  });

})



router.route('/location/:delid').delete(function (req, res) {  // delete 로 테이블 로우 삭제
  var delid = req.params.delid;

  client.query('DELETE FROM location_table where id = '+ `'${delid}'`, function(err, result) {  // id 로 바꿔줌! 
    if (err) {
      console.log("query DELETE has something wrong :(   ", err)
      res.status(400).send(err);
    }
    else {
    console.log("DELETE : ", delid);
    console.log('DELETE FROM location_table where id = '+ `'${delid}'`);
    requestUrl.get(
      {url: 'http://192.168.0.4:3300/location'}, 
      function(error, response, body) { res.json(JSON.parse(body)); } 
    )
    }
  });
})

// 라우터 객체 등록 //
app.use('/', router);

////////////////////////////////////////////////////////////////
app.listen(app.get('port'), function () {
  console.log('Server is running.. on Port 3300! :) ');
});