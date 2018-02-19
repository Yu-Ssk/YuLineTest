/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// ----------ここから----------
var fs = require('fs');
var json = JSON.parse(fs.readFileSync("eigo.json", "utf-8"));
// ファイルを読み込めているかどうかの確認
// console.log(json.items[0].japanese);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var request = require('request');
app.post('/api', function(req, res) {
  require('date-utils');
  let now = new Date();
  var i;
  var item;
  var date;
  var stre;
  var strj;

  now.setHours(now.getHours() + 9);
  for (i in json.items) {
      item = json.items[i];
      if (item.date === now.toFormat('YYYY/MM/DD')) {
          date = item.date;
          stre = item.english;
          strj = item.japanese;
      };
  };
  //おかわりの場合
  var strreq = req.body.events[0].message.text;
  var strtarget = "おかわり";
  console.log("[%s]%s", now.toFormat("YYYY/MM/DD HH24時MI分SS秒"), strreq);
  if (strreq.indexOf(strtarget) >= 0) {
    var min = 0 ;
    var max = 559 ;
    var a = Math.floor(Math.random() * (max + 1 - min)) + min;
    item = json.items[a];
    date = strtarget;
    stre = item.english;
    strj = item.japanese;
  }

  var options = {
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/reply',
    body: {
      replyToken: req.body.events[0].replyToken,
      messages: [{
        type: "text",
        text: "【" + date + "の英語】\r\n" + stre + "\r\n" + strj
      }]
    },
    auth: {
	  // ここは自分のtokenに書き換える
      bearer: '3Dw+DX3VlFCp7lLCJEmqx0VxX5za/vIRXIMTygp6bgTk/YQULLBETpFIaNB+LNivIpc79fnBDCn0tzXlLCY/jCCwNbD4bt+yrJw1O3osqJs4YHKpJBpGMGnh1gT9SwDHFsJ2a9nTnr27GmIUvymbqgdB04t89/1O/w1cDnyilFU='
    },
    json: true
  };
  request(options, function(err, res, body) {
    console.log(JSON.stringify(res));
  });
  res.send('OK');
});
// --------ここまで追加--------


// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});