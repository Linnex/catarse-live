var logger = require('morgan');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var pg = require('pg');
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
};

app.use(express.static('public', options));
app.use(logger('short'));

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});
server.listen(app.get('port'));

var client = new pg.Client(process.env.DATABASE_URL);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log('From PG: ', result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
});
