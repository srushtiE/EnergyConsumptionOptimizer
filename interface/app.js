// Module
var express = require('express');
var app = express();
var passport  = require( 'passport' );
var mongo = require('./js/mongo.js');
var GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy;
var mongoURL = "mongodb://localhost:27017/EnergyOptimizer";

// Define port
var port = 3700;

// View engine
app.set('view engine', 'ejs');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: '390315947365-3ovdcjbqfv2g029j1ajsoc73m0r0mm3g.apps.googleusercontent.com',
    clientSecret: 'UIhUUq6yPegsPr4tZjpPWYsi',
    callbackURL: 'http://localhost:3700/auth/google/callback',
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

app.use( passport.initialize());

app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));

app.get( '/auth/google/callback', 
    	passport.authenticate( 'google', { 
    		failureRedirect: '/',successRedirect : '/interface'}));
			
// Set public folder
app.use(express.static(__dirname + '/public'));

// Serve interface
app.get('/interface', function(req, res){
  res.render('interface');
});

app.get('/', function(req,res){
	res.render('login');
});

/* app.get('/userLogin', function(req,res){
	req.redirect('/auth/google');
}); */

// Node-aREST
var rest = require("arest")(app);
rest.addDevice('http','192.168.1.187');

// Start server
app.listen(port);
console.log("Listening on port " + port);