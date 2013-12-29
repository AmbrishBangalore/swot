// External libraries
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// Project libraries/middleware
var user = require('./lib/middleware/user');
var authentication = require('./lib/middleware/authentication');
var restrict = require('./lib/middleware/restrict');

// Routing includes
var register = require('./routes/register');
var login = require('./routes/login');

// Authentication
passport.use(new LocalStrategy(authentication.authenticate));
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);

// Initialize the app and db
var app = express();
var MONGODB_URL = process.env.MONGODB_URL || 'localhost:27017/swot';
mongoose.connect(MONGODB_URL);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('TFVtSsdIekQ7VwjCzgng'));
app.use(express.session());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.use(restrict({
    allowedRoutes: ['/', '/login', '/register'],
    redirectTo: '/login'
}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/', login.form);
app.get('/register', register.form);
app.post('/register', register.submit);
app.get('/login', login.form);
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login',
                                                    failureFlash: true }));
app.get('/logout', login.logout);

// Start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});