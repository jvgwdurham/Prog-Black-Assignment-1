var express = require("express");
var app = express();
app.use(express.static('client'));

app.get('/server-status', function(req,resp){
    resp.send({"Server-Status":"1"});
})

app.listen(8090);