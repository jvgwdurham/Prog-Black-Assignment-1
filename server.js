var express = require("express");
var app = express();
app.use(express.static('client'));

app.get('/server-status', function(req,resp){
    
})
