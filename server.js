const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const controllers = require("./controllers.js");
const utils = require("./utils.js");

const storage = multer.diskStorage({ 
    destination: function(req,file,cb)
    {
        cb(null,"./client/storage/");
    },
    filename: function(req,file,cb)
    {
        let index = utils.getFirstLine("postIndex.txt");
        console.log(index);
        const filename = "post" + (parseInt(index) + 1) + ".jpg";
        fs.writeFileSync("postIndex.txt", (parseInt(index) + 1).toString()); 
        console.log("changed to:", utils.getFirstLine("postIndex.txt"))
        cb(null,filename);
    }
}
);

const upload = multer({storage:storage});
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('client'));
app.use(express.json());

app.get('/serverStatus', controllers.serverStatus)

app.post('/uploadPost',upload.single("postImage"), controllers.uploadPost);

app.post('/addComment', controllers.addComment);

app.get('/getPosts/:startIndex/:stopIndex', controllers.getPosts);

app.get('/getPostByIndex/:index', controllers.getPostByIndex);

app.options('/', controllers.options);

utils.startUpValidation();
console.log("server starting");
app.listen(8090);