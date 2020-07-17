var express = require('express');
var fs = require('fs');
const cors = require('cors');
var bodyParser = require('body-parser');
var requestUrl = require('request');

var app = express();
app.use(cors());
app.use(express.static('public')); //경로는 http://localhost:3300/style/style.json

//express 미들웨어 bodyparser을 이용해 POST로 들어온 body에 있는 request를 알아내자
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());



///////////////////////// 데이터베이스 연결 //////////////////////////
const { Client } = require('pg');
const { request } = require('http');
var connectionString = "postgres://postgres:chzhzh1212@localhost:5433/location";

const client = new Client({
    connectionString: connectionString
});

client.connect();
/////////////////////////////////////////////////////////////////////

// 익스프레스 앱 포트 설정
app.set('port', process.env.PORT || 3200);/////////PORT
// 라우터 객체 참조 - 마지막에 라우터 객체 꼭 참조 해줘야함
var router = express.Router();


router.route('/readdir').get(function (req, res) {  
  fs.readdir('./public/style/wemap/', (err, _stylelist) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }

    res.send({ stylelist: _stylelist });
  });
});


router.route('/location').get(function (req, res) {   // get 으로 테이블 조회
  client.query('SELECT * FROM location_table', function (err, result) {
      if (err) {
          console.log('database select query error occures.. :(( : ', err);
          res.status(400).send(err);
      }
      res.status(200).send(result.rows);
      console.log('GET 호출')
  });
});








router.route('/location').post(function (req, res) { // post 로 테이블에 값 추가
  var j = req.body;
  //var locid = req.params.locid;
  
  // when id is null (insert)
  // get new id by querying next sequence id

    // CTE: Common Table Extension
  var sql = 
    `WITH subq AS (
      SELECT ${!!j.id?j.id:"nextval('seq_loc_id')"} as id, ${j.longitude} as longitude, ${j.latitude} as latitude, '${j.location}' as location, 
              ${j.zoom} as zoom, ${j.pitch} as pitch, ${j.bearing} as bearing, '${j.address}' as address
      )
    INSERT INTO location_table (id,longitude, latitude, location, zoom, pitch, bearing, address)
                        (SELECT id,longitude, latitude, location, zoom, pitch, bearing, address FROM subq)
    ON CONFLICT ON constraint loc_pk
    DO UPDATE SET (longitude, latitude, location, zoom, pitch, bearing, address)
         = (SELECT longitude, latitude, location, zoom, pitch, bearing, address FROM subq)
    RETURNING   id,longitude, latitude, location, zoom, pitch, bearing, address`;
  //console.log(sql);
  client.query(sql, function (err, result) {
    if (err) {
      console.log("query insert has something wrong :(  ", err)
      console.log(req.body);
      //res.status(400).send(err);
      //console.log('삐빅 : ', err.detail);
      res.status(400).send(err.detail);
    } else {
      console.log('POST req 들어옴!')  //returning 이 있었으면 좋겠다!
      //console.log('row inserted! : ', + longitude + ', ' + latitude + ', ' + location + ', ' + address );
      //res.redirect('http://192.168.0.4:3300/location');
      res.send(result.rows[0])
    }
  });
  

//   client.query('INSERT INTO location_table (longitude, latitude, location, zoom, pitch, bearing, address) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
//   [longitude,latitude,location,zoom,pitch,bearing,address], function (err, result) {
//     if (err) {
//       console.log("query insert has something wrong :(  ", err)
//       //res.status(400).send(err);
//       console.log('삐빅 : ', err.detail);
//       res.status(400).send(err.detail);
//     }
//     else {
//       console.log('POST req 들어옴!')
//       console.log('row inserted! : ', + longitude + ', ' + latitude + ', ' + location + ', ' + address );
//       res.redirect('http://192.168.0.4:3300/location');
//     }
//   })
})


router.route('/location/:locid').put(function (req, res) { // PUT 으로 테이블 UPDATE  //https://seongilman.tistory.com/185 //https://jsdev.kr/t/for-in-vs-for-of/2938
  var tempstr = "";
  var index=1;
  var bodylength = Object.keys(req.body).length;
  var locid = req.params.locid;
 ////////////////이렇게 함으로 필드를 확인하면서 바로 돌릴 수 있다!/////////////
  var fieldNames = ['longitude','latitude','location','zoom', 'pitch', 'beering', 'id', 'address'];
  fieldNames.forEach(key => {
    if (req.body.hasOwnProperty(key)) {
      tempstr += key + "=" + `'${req.body[key]}'`;
      if(index != bodylength) {
        tempstr += ", ";
      }
      index++;
    }
  });
  if (tempstr.length == 0) {
    return;
  }
 
  // for (const key in req.body) {  // req.body에 있는 json을 쿼리에 넣기 편하게 key = 'value', 로 스트링으로 넣어줌.
  //   if (req.body.hasOwnProperty(key)) {
  //     tempstr += key + "=" + `'${req.body[key]}'`;
  //     if(index != bodylength) {
  //       tempstr += ", ";
  //     }
  //     index++;
  //   }
  // }

  //
  // update if exists
  //
  client.query('SELECT id FROM location_table', function(err, result) {    //id 목록 조회
    console.log(result.rows);
    var idindex=1;

    if(err) {
      res.status(400).send(err);
    }
    else {  // 보내온 id 값과 일치하니?
      for (const idlist in result.rows) {

         if (result.rows[idlist].id == locid) {  // 일치하면
          console.log('테이블에 존재하는 id')

          client.query(`UPDATE location_table SET ${tempstr} WHERE ID = '${locid}'`, function (error, results) { // 해당 로우를 수정해
            if(error) {
              console.log("query UPDATE has something wrong :(  ", error)
              res.status(400).send(error);
            }
            else {
              console.log('UPDATED location_table SET ' + tempstr + " WHERE id = " + `'${locid}'`); //수정하고 오류없으면 리다이렉트
              // requestUrl.get(  //http://blog.naver.com/PostView.nhn?blogId=sooni_&logNo=221418533264&parentCategoryNo=19&categoryNo=&viewDate=&isShowPopularPosts=true&from=search
              //   {url: 'http://192.168.0.4:3300/location'}, 
              //   function(error, response, body) { res.json(JSON.parse(body)); })
              //Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client    // code: 'ERR_HTTP_HEADERS_SENT'    이 오류가 나서 찾아보니... 
              //https://velog.io/@kim-macbook/Cannot-set-headers-after-they-are-sent-to-the-client 여기와
              //https://avengersrhydon1121.tistory.com/150 여기를 참고했다 
              // 문제는 : 클라이언트에 정보를 전송한 후에 headers를 설정할 수 없다는 것 같다. 즉= 이미 답장했는데 왜 또 하니
            }
          }) 
        }
        
        else {
          console.log('확인중' + idindex);
        }
        idindex++;
      }

      console.log('일치확인하는 for문 빠져나옴');
      requestUrl.get(  //http://blog.naver.com/PostView.nhn?blogId=sooni_&logNo=221418533264&parentCategoryNo=19&categoryNo=&viewDate=&isShowPopularPosts=true&from=search
      {url: 'http://192.168.0.4:3300/location'}, 
      function(error, response, body) { res.json(JSON.parse(body)); });
    }

  })
//})


// /////////////////////////////////////////////////////////////////////////
//   client.query('SELECT id FROM location_table', function(err, result) {    //id 목록 조회
//     console.log(result.rows);
//     var idindex=1;

//     if(err) {
//       res.status(400).send(err);
//     }
//     else {  // 보내온 id 값과 일치하니?
//       for (const idlist in result.rows) {

//         if (result.rows[idlist].id != locid) {  // 일치하면
//           console.log('id 불일치 ,', result.rows[idlist].id + ' : ' + locid )
//            if(result.rows[idlist].id < locid) {
//              console.log('일치하는 ID가 없음 : 리다이렉트')
//              requestUrl.get(  
//               {url: 'http://192.168.0.4:3300/location'}, 
//               function(error, response, body) { res.json(JSON.parse(body)); })
//            }
           
//         }
//         idindex++;
//       }
      
//       //`UPDATE location_table SET ${tempstr} WHERE ID = '${locid}'` // template string
//       client.query(`UPDATE location_table SET ${tempstr} WHERE ID = '${locid}'`, function (error, results) { // 해당 로우를 수정해
//         if(error) {
//           console.log("query UPDATE has something wrong :(  ", error)
//           res.status(400).send(error);
//         }
//         else {
//           console.log('UPDATED location_table SET ' + tempstr + " WHERE id = " + `'${locid}'`); //수정하고 오류없으면 리다이렉트
//           requestUrl.get(  //http://blog.naver.com/PostView.nhn?blogId=sooni_&logNo=221418533264&parentCategoryNo=19&categoryNo=&viewDate=&isShowPopularPosts=true&from=search
//             {url: 'http://192.168.0.4:3300/location'}, 
//             function(error, response, body) { res.json(JSON.parse(body)); })
//         }
//       })
//     }

//   })
// /////////////////////////////////////////////////////////////////////////
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
  console.log('Server is running.. on Port 3200! :) ');
});