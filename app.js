var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
const passport = require('passport');
var app = express();
var indexRouter = require('./routes/index');
var signupRouter = require('./routes/signup');
var backupRouter = require('./routes/backup');
var appRest = require('./rest/app');

var fileUpload  = require ('express-fileupload');
var formidable = require ('formidable');
var fs = require('fs');

//var readXlsxFile = require ('read-excel-file');

var db = require('./modules/Database').create();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session({
  secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
  resave: true,
  saveUninitialized: true,
}));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

var loginRouter = require('./routes/login')(passport);
app.use('/', indexRouter);
app.use('/rest', appRest);
app.use('/backup', backupRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);

app.get('/logout', (req, res) => {

  
  res.clearCookie('passport');
  req.session.destroy();
  res.redirect('/');
  res.end()
})
app.post('/session', function (req, res) {
  if (req.isAuthenticated())
    res.status(200).send(req.session.passport.user);
  else
    res.status(400).send();
})






// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var debug = require('debug')('src:server');
var http = require('http');
// var io = require('socket.io')(http);
// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3002');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

console.log('Server is running... http://localhost:3002');
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }


  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;
    

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}



/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}