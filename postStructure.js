'use strict';

const fs = require('fs');

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

module.exports = {Post, Replies, Comment};