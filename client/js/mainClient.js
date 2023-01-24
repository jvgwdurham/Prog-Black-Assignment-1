
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
        for(const [key, value] of Object.entries(json))
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
        let postInfoString = '<img class="mt-3 stdImg" src="'+this.imageLocation+'">\n<label id="p-'+this.index+'" class="text-center mt-1">'+this.title+' |I: '+this.index+'</label>'
        let commentString = this.replies.buildReplyDOM();

        return {"postInfo":postInfoString, "commentString":commentString};
    }
}

var GLOBAL = {
    postIndex : 0,
    username : "",
    loggedIn : false
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";" + "SameSite=None; Secure";
} // This code is modified from w3schools
  
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
} //this is 100% pasted from w3schools

window.addEventListener("load", function()
{
    if(getCookie("c_username").length > 0)
    {
        let usrnametmp = getCookie("c_username");
        document.getElementById("loginWindow").style.display = "none";
        document.getElementById("username").innerHTML = usrnametmp;
        GLOBAL.username = usrnametmp
    }
})

document.addEventListener('click',function(event)
{
    let postElem = document.getElementById("postWindow");
    let postButton = document.getElementById("postButton");
    let commentElem = document.getElementById("commentWindow");
    if(!postElem.contains(event.target))
    {
        if(postButton.contains(event.target))
        {
            return
        }
        postElem.style.display = "none";
    }
    
    if(!commentElem.contains(event.target))
    {
        commentElem.style.display = "none";
    }
});

document.getElementById("postForm").addEventListener("submit",function(event)
{
    event.preventDefault();
    event.stopPropagation();
    console.log("starting post submission");
    const uploadImage = document.getElementById("attachment").files[0];
    const postBody = document.getElementById("postBody").value;

    const formData = new FormData();
    formData.append('postImage', uploadImage);
    formData.append('postBody',postBody);
    formData.append('poster',GLOBAL.username);

    fetch("http://127.0.0.1:8090/uploadPost", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        let post = '<div id="'+data["postIndex"]+'" onclick="loadPost(this.id)" class="postContainer text-center"><div class="imgBox"><img class="stdImg" src="http://127.0.0.1:8090/storage/post'+data["postIndex"]+'.jpg"></div><a href="#" id="postTitle">'+postBody+'|R: 0|I: '+data["postIndex"]+'</a></div>\n'
        document.getElementById("contentGrid").innerHTML += post
        return false;
    })
    .catch(err => {
        console.log(err);
        errorMessage(err)
        return false;
    });
});

document.getElementById("commentForm").addEventListener("submit",function(event)
{
    event.preventDefault();
    event.stopPropagation();

    console.log("starting comment submission");
    let index = document.getElementById("replyPostInfo").children[1].id.split("-")[1]; //wtf
    let comment = document.getElementById("commentBox").value;

    let formData = {"comment":comment,"commenter":GLOBAL.username,"index":index};

    fetch("http://127.0.0.1:8090/addComment", {
        method: "POST",
        headers: {'Content-Type':"application/json"},
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        let post = ClientPost.fromJson(data);
        if(post instanceof ClientPost){
            console.log(post);
            domInfo = post.buildPostDOM();
            document.getElementById("replyPostInfo").innerHTML = domInfo["postInfo"];
            document.getElementById("replyList").innerHTML = domInfo["commentString"];
            return false;
        }
        else{
            throw(data);
        }
        
    })
    .catch(err => {
        console.log(err);
        errorMessage(err)
        return false;
    })
})


function loadPost(id)
{
    fetch("http://127.0.0.1:8090/getPostByIndex/"+id)
    .then(res => res.json())
    .then(data =>
        {
        let post = ClientPost.fromJson(data);
        if(post instanceof ClientPost)
        {
            console.log(post);
            domInfo = post.buildPostDOM();
            document.getElementById("replyPostInfo").innerHTML = domInfo["postInfo"];
            document.getElementById("replyList").innerHTML = domInfo["commentString"];
            document.getElementById("commentWindow").style.display = "block";
            return false;
        }
        else{
            throw(data);
        }
    })
    .catch(err => {
        console.log(err);
        errorMessage(err)
        return false;
    })
}

function login()
{
    let username = document.getElementById("usernameInput").value;
    let elem = document.getElementById("loginWindow");
    if(username == "" || username.length > 16)
    {
        document.getElementById("errMsg").innerHTML = "Invalid Username";
        return false;
    }
    else
    {
        if(document.getElementById("rememberMe").value == "on")
        {
            setCookie("c_username", username);
        }
        GLOBAL.username = username;
        GLOBAL.loggedIn = true;
        document.getElementById("username").innerHTML = username;
        elem.style.display = "none";
    }
}

function logOut()
{
    GLOBAL.username = "";
    GLOBAL.loggedIn = false
    document.getElementById("username").innerHTML = "Not Logged In"
    document.getElementById("loginWindow").style.display = "block";
}

function calcMaxPosts(firstLoad)
{
    let h = window.innerHeight-150;
    let w = window.innerWidth;

    const postHeight = 170;
    const postWidth = 256;

    let hmax = Math.floor(h/postHeight);
    let wmax = Math.floor(0.80*(w/postWidth));

    if(firstLoad)
    {
        return hmax * wmax - 1
    }
    return (hmax * 2) * wmax - 1
}

function loadMore()
{
    //let post = '<div id="post1" onclick="loadPost(this.id)" class="postContainer text-center"><div class="imgBox"><img class="stdImg" src="resources/placeholder.png"></div><span id="postTitle">post | R: 3</span></div>\n';
    let maxPosts = calcMaxPosts(false);
    console.log(maxPosts);
    for(x = 0; x < maxPosts;x++)
    {
        document.getElementById("contentGrid").innerHTML += post
    }
}

function setupPost()
{
    let elem = document.getElementById("loginWindow");
    let postElem = document.getElementById("postWindow");
    if(elem.style.display == "none")
    {
        postElem.style.display = "block";
    }
}

function changeImage(event)
{
    let img = document.getElementById("uploadimg")
    img.src = URL.createObjectURL(event.target.files[0]);
}

function scrollUp()
{
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; //safari
}

function hideErrOverlay(id)
{
    let overlay = document.getElementById(id);
    overlay.style.display = "none";
}

function errorMessage(message)
{
    document.getElementById("errMsg").innerText = message;
    document.getElementById("errorFrame").style.display = "block";
}