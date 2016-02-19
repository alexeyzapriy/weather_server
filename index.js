var express = require('express');
var app = express();
var request = require("request");
var redis = require("redis");
var db = redis.createClient(process.env.REDIS_URL);
var URL = 'http://api.openweathermap.org/data/2.5/weather?appid=90a38f7f24109dde84c746b33254ed0e&q=';

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, resp) {
  resp.render('pages/index');
});

app.get('/current', function(req, resp) {
  if (req.query.city){
    db.get(req.query.city, function (err, data) {
      if (data){
        resp.end(data);
      } else {
        console.log("Request: " + URL + req.query.city);
        request(URL + req.query.city, function(error, r, body) {
          console.log("Response: " + body);
          if (error) { 
            console.log(err);
            resp.json(err);
            return;
          }
          db.set(req.query.city, body, redis.print);
          db.expire(req.query.city, 4*60*60);
          resp.end(body);
        }); 
      }
    });
  } else {
    resp.status(422).json({ error: 'Please cpecify city name' });
  }
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


