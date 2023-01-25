/* eslint-disable no-unused-vars */

class ClientComment{
    constructor(commenter, comment){
        this.commenter = commenter;
        this.comment = comment;
    }

    toJson(){
        return {"commenter" : this.commenter, "comment": this.comment};
    }

    static fromJson(json){
        return new ClientComment(json["commenter"], json["comment"]);
    }

    getCommenter(){
        return this.commenter;
    }

    getComment(){
        return this.comment;
    }
}

class ClientReplies{
    constructor()
    {
        this.commentArray = [];
    }

    addComment(comment)
    {
        this.commentArray.push(comment);
    }

    getNumberOfComments()
    {
        return this.commentArray.length;
    }

    buildReplyDOM()
    {
        let retDomStr = "";
        for(let i = 0; i < this.commentArray.length; i++)
        {
            retDomStr += '<li id="comment'+i+'" class="reply list-group-item list-group-item-dark">'+this.commentArray[i].getCommenter()+': '+this.commentArray[i].getComment()+'</li>\n'
        }
        return retDomStr
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
        let x = new ClientReplies();
        if(Object.keys(json).length === 0)
        {
            return x;
        }
        for(const [, value] of Object.entries(json))
        {
            x.commentArray.push(ClientComment.fromJson(value));
        }
        return x;
    }
}


class ClientPost{
    constructor(title, index, poster, replies = null)
    {
        this.title = title;
        this.index = index;
        this.imageLocation = "./storage/post" + this.index + ".jpg"; //for client use only
        this.poster = poster;
        if(replies == null){
            this.replies = new ClientReplies(this);
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
        return new ClientPost(json["title"], json["postIndex"], json["poster"], ClientReplies.fromJson(json["replies"]));
    }

    addComment(comment)
    {
        if(!(comment instanceof ClientComment)){
            console.error("Wrong type passed into this function, please add a Comment() object");
            return;
        }
        this.replies.addComment(comment);
    }

    getNumberOfComments()
    {
        return this.replies.getNumberOfComments();
    }

    buildPostDOM()
    {
        let postInfoString = '<label class="text-center" id="poster">Poster: '+this.poster+'</label>\n<img class="mt-3 stdImg" src="'+this.imageLocation+'">\n<label id="p-'+this.index+'" class="text-center mt-1">'+this.title+' |I: '+this.index+'</label>'
        let commentString = this.replies.buildReplyDOM();

        return {"postInfo":postInfoString, "commentString":commentString};
    }
}

module.exports = {ClientComment, ClientPost, ClientReplies};