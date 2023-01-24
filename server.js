const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require('fs');

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
app.use(express.json());

class Post{
    constructor(title, index, poster, replies = null)
    {
        this.title = title;
        this.index = index;
        this.imageLocation = "./storage/post" + this.index + ".jpg"; //for local use only
        this.poster = poster;
        if(replies == null){
            this.replies = new Replies(this);
        }
        else{
            this.replies = replies
        }
        
    }

    toJson()
    {
        return {"title":this.title, "postIndex":this.index, "imageLocation":this.imageLocation , "poster":this.poster, "replies":this.replies.toJson()};
    }

    static fromJson(json)
    {
        return new Post(json["title"], json["postIndex"], json["poster"], Replies.fromJson(json["replies"]));
    }

    writeToFile() //internal Storage, therefore ./client/posts
    {
        fs.writeFileSync("./client/posts/post"+this.index+".json", JSON.stringify(this.toJson()));
    }

    static readPostFromID(id)
    {
        try{
            let data = fs.readFileSync("./client/posts/post"+ id + ".json")
            return Post.fromJson(JSON.parse(data));
        }
        catch(error)
        {
            return "$not-found";
        }
        
    }

    addComment(comment)
    {
        if(!(comment instanceof Comment)){
            console.error("Wrong type passed into this function, please add a Comment() object");
            return;
        }
        this.replies.addComment(comment);
    }
}

class Replies{
    constructor()
    {
        this.commentArray = [];
    }

    addComment(comment)
    {
        this.commentArray.push(comment);
    }

    toJson()
    {
        let retJs = {}
        if(this.commentArray.length == 0)
        {
            return retJs;
        }
        for(let i = 0; i < this.commentArray.length; i++)
        {
            retJs["comment"+i] = this.commentArray[i].toJson();
        }
        return retJs;
    }

    static fromJson(json)
    {
        let x = new Replies();
        if(Object.keys(json).length === 0)
        {
            return x;
        }
        for(const [key, value] of Object.entries(json))
        {
            x.commentArray.push(Comment.fromJson(value));
        }
        return x;
    }
}

class Comment{
    constructor(commenter, comment){
        this.commenter = commenter;
        this.comment = comment;
    }

    toJson(){
        return {"commenter" : this.commenter, "comment": this.comment};
    }

    static fromJson(json){
        return new Comment(json["commenter"], json["comment"]);
    }

    getCommenter(){
        return this.commenter;
    }

    getComment(){
        return this.comment;
    }
}

app.get('/serverStatus', function(req,resp){
    try{
        resp.send({"Server-Status":"1"});
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
})

app.post('/uploadPost',upload.single("postImage"),function(req,resp){
    try{
        let index = getFirstLine("postIndex.txt");
        newPost = new Post(req.body["postBody"],index, req.body["poster"]);
        newPost.writeToFile();
        resp.send({"postIndex":index.toString()});
    }
    catch (error){
        console.log(error)
        resp.sendStatus(500);
    }
});

app.post('/addComment',function(req,resp){
    try{
        let post = Post.readPostFromID(req.body["index"]);
        if(post instanceof Post)
        {
            post.addComment(new Comment(req.body["commenter"],req.body["comment"]));
            post.writeToFile();
            let retJs = post.toJson()
            resp.send(retJs) //let client redraw post
        }
        else
        {
            throw("Post not found");
        }
        
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
});

app.get('/getPosts/:startIndex/:stopIndex',function(req,resp){ //will attempt to send max ammount, will send as many as possible
    try{
        let startIndex = parseInt(req.params.startIndex);
        let stopIndex = parseInt(req.params.stopIndex);
        let postCount = 0;
        let finalIndex = parseInt(getFirstLine("postIndex.txt"));
        let retJs = {};
        console.log(startIndex, stopIndex, finalIndex);
        if(startIndex > finalIndex)
        {
            console.log("start index too big");
            resp.send({"postStatus":"No more posts found"})
            return;
        }
        else if(startIndex > stopIndex)
        {
            console.log("user error");
            resp.send({"postStatus":"$invalid-input"});
            return;
        }
        else if(startIndex < 1)
        {
            console.log("no posts below this index");
            resp.send({"postStatus":"$none-below"});
            return;
        }
        for(var i = startIndex; i <= stopIndex; i++){
            let post = Post.readPostFromID(i);
            if(post == "$not-found"){
                if(stopIndex <= finalIndex)
                {
                    stopIndex += 1;
                    continue;
                }
            }
            else if(post instanceof Post)
            {
                if(i <= finalIndex)
                {
                    retJs["post"+i] = post.toJson();
                    postCount += 1;
                }
                else{
                    continue;
                }
            }
        }
        if(Object.keys(retJs).length === 0)
        {
            resp.send({"postStatus":"$none-found"});
        }
        else
        {
            retJs["postCount"] = postCount;
            resp.send(retJs);
        }
    }
    catch (error){
        console.log(error);
        resp.sendStatus(500);
    }
});

app.get('/getPostByIndex/:index',function(req,resp){
    try{
        let postAtIndex = Post.readPostFromID(req.params.index);
        if(postAtIndex instanceof Post)
        {
            let retJs = postAtIndex.toJson()
            resp.send(retJs);
        }
        else
        {
            throw("Post not found");
        }
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
});

app.options('/',function(req,resp){
    try{
       resp.send(
        {
            "Access-Control-Allow-Origin" : "http://127.0.0.1",
            "Access-Control-Allow-Methods" : "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers" : "Content-Type, Authorisation"
        }) 
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
});

app.listen(8090);