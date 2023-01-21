var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('client'));

app.get('/serverStatus', function(req,resp){
    resp.send({"Server-Status":"1"});
})

app.post('/uploadPost',function(req,resp){
    void(0);
});

app.get('/getPosts',function(req,resp){
    void(0);
});

app.get('/getPostByID',function(req,resp){
    void(0);
});

app.get('/generateUID',function(req,resp){
    void(0);
});

app.listen(8090);