const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require('fs');
const { urlToHttpOptions } = require("url");

function getFirstLine(filename)
{
    const data = fs.readFileSync(filename,'utf8');
    return data.split('\n').shift();
}

const storage = multer.diskStorage({ 
    destination: function(req,file,cb)
    {
        cb(null,"./client/storage/");
    },
    filename: function(req,file,cb)
    {
        let index = getFirstLine("postIndex.txt");
        const filename = "post" + (parseInt(index)+1) + ".jpg";
        fs.writeFileSync("postIndex.txt", (parseInt(index) + 1).toString());
        cb(null,filename);
    }
}
);

const upload = multer({storage:storage});
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('client'));

class Post{
    constructor(title, index, poster)
    {
        this.title = title;
        this.index = index;
        this.imageLocation = "post" + this.index + ".jpg";
        this.poster = poster;
        this.replies = Replies(this);
    }

    toJson()
    {
        return {"title":this.title, "postIndex":this.index, "poster":this.poster, "replies":this.replies.toJson()};
    }

    static fromJson(json)
    {
        return Post(json["title"], json["postIndex"], json["poster"], json["replies"], Replies.fromJson(json["replies"]));
    }
}

class Replies{
    constructor(owningPost)
    {
        this.owningPost = owningPost;
        this.commentArray = [];
    }

    addComment(comment)
    {
        if(typeof(comment) != Comment){
            console.error("Wrong type passed into this function, please add a Comment() object");
            return;
        }
        this.commentArray.push(comment);
    }

    toJson()
    {

    }

    static fromJson(json)
    {
        void(0);
    }
}

class Comment{
    constructor(commenter, comment)
    {
        this.commenter = commenter;
        this.comment = comment;
    }

    getCommenter()
    {
        return this.commenter;
    }

    getComment()
    {
        return this.comment;
    }
}

app.get('/serverStatus', function(req,resp){
    resp.send({"Server-Status":"1"});
})

app.post('/uploadPost',upload.single("postImage"),function(req,resp,next){
    try{
        let index = getFirstLine("postIndex.txt");
        //newPost = Post(req["postBody"],index, req["poster"]);
        

        
        const filename = "./client/posts/post"+index+".json";
        resp.send({"postIndex":index.toString()});
    }
    catch (error)
    {
        next(console.log(error));
    }
});

app.get('/getPosts',function(req,resp,next){
    void(0);
});

app.get('/getPostByID',function(req,resp,next){
    void(0);
});

app.options('/',function(req,resp,next){
    resp.send(
        {
            "Access-Control-Allow-Origin" : "http://127.0.0.1",
            "Access-Control-Allow-Methods" : "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers" : "Content-Type, Authorisation"
        }
    )
});

app.listen(8090);