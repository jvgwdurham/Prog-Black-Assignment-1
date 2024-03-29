const utils = require("./utils");
const postStructure = require("./postStructure");

function serverStatus(req,resp){
    try{
        resp.send({"Server-Status":1});
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
}

function uploadPost(req,resp){
    try{
        let index = parseInt(utils.getFirstLine("postIndex.txt"));
        let newPost = new postStructure.Post(req.body["postBody"],index, req.body["poster"]);
        newPost.writeToFile();
        resp.send({"postIndex":index.toString()});
    }
    catch (error){
        console.log(error)
        resp.sendStatus(500);
    }
}

function addComment(req,resp){
    try{
        let post = postStructure.Post.readPostFromID(req.body["index"]);
        if(post instanceof postStructure.Post)
        {
            post.addComment(new postStructure.Comment(req.body["commenter"],req.body["comment"]));
            post.writeToFile();
            let retJs = post.toJson()
            resp.send(retJs) //let client redraw post
        }
        else
        {
            resp.send({"postStatus":"$not-found"});
        }
        
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
}

function getPosts(req,resp){ //will attempt to send max ammount, will send as many as possible
    try{
        let startIndex = parseInt(req.params.startIndex);
        let stopIndex = parseInt(req.params.stopIndex);
        let postCount = 0;
        let finalIndex = parseInt(utils.getFirstLine("postIndex.txt"));
        let retJs = {};
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
            let post = postStructure.Post.readPostFromID(i);
            if(post == "$not-found"){
                if(stopIndex <= finalIndex)
                {
                    stopIndex += 1;
                    continue;
                }
            }
            else if(post instanceof postStructure.Post)
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
}

function getPostByIndex(req,resp){
    try{
        let postAtIndex = postStructure.Post.readPostFromID(req.params.index);
        if(postAtIndex instanceof postStructure.Post)
        {
            let retJs = postAtIndex.toJson()
            resp.send(retJs);
        }
        else
        {
            resp.send({"postStatus":"$not-found"})
        }
    }
    catch(error){
        console.log(error);
        resp.sendStatus(500);
    }
}

function options(req,resp){
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
}

module.exports = {serverStatus, uploadPost, addComment,  getPosts, getPostByIndex, options};