// Module
var express = require('express');
var app = express();

// Define port
var port = 3700;

// View engine
app.set('view engine', 'jade');

// Set public folder
app.use(express.static(__dirname + '/public'));

// Serve interface
app.get('/interface', function(req, res){
  res.render('interface');
});

app.get('/', function(req,res){
	res.render('login');
});

// Node-aREST
var rest = require("arest")(app);
rest.addDevice('http','192.168.43.187');

// Start server
app.listen(port);
console.log("Listening on port " + port);