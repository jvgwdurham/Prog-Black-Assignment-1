
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
        let postInfoString = '<label class="text-center" id="poster">Poster: '+this.poster+'</label>\n<img class="mt-3 stdImg" src="'+this.imageLocation+'">\n<label id="p-'+this.index+'" class="text-center mt-1">'+this.title+' |I: '+this.index+'</label>'
        let commentString = this.replies.buildReplyDOM();

        return {"postInfo":postInfoString, "commentString":commentString};
    }
}

var GLOBAL = {
    postIndex : 1,
    username : "",
    loggedIn : false
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
} //code pasted from w3 schools. 
  
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
} //this too

window.addEventListener("load", function()
{
    if(getCookie("c_username").length == 0)
    {
        document.getElementById("loginWindow").style.display = "block";
    }
    else{
        let usrnametmp = getCookie("c_username");
        document.getElementById("username").innerHTML = usrnametmp;
        GLOBAL.username = usrnametmp;
        GLOBAL.loggedIn = true;
        loadMore(true)
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
        document.getElementById("commentBox").value = "";
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
    let index = document.getElementById("replyPostInfo").children[2].id.split("-")[1]; //wtf
    let comment = document.getElementById("commentBox").value;

    let formData = {"comment":comment,"commenter":GLOBAL.username,"index":index};
    console.log(formData);

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
        if(document.getElementById("rememberMe").checked)
        {
            console.log("setting cookie")
            setCookie("c_username", username, 7);
        }
        GLOBAL.username = username;
        GLOBAL.loggedIn = true;
        document.getElementById("username").innerHTML = username;
        elem.style.display = "none";
        reloadPosts()
    }
}

function logOut()
{
    GLOBAL.username = "";
    GLOBAL.loggedIn = false
    setCookie("c_username", "", -1);
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

function loadMore(firstLoad = false)
{
    let maxPosts = calcMaxPosts(firstLoad);
    let startIndex = GLOBAL.postIndex;
    let stopIndex = GLOBAL.postIndex + maxPosts;

    fetch("http://127.0.0.1:8090/getPosts/"+startIndex+"/"+stopIndex+"")
    .then(res => res.json())
    .then(data =>{
        if(Object.keys(data).includes("postStatus")){
            throw(data["postStatus"]);
        }
        else{
            let postCount = data["postCount"];
            delete data["postCount"];
            for(let i = 1; i <= postCount; i++){
                if(!Object.keys(data).includes("post"+i)){
                    postCount += 1;
                    continue;
                }
                let post = data["post"+i];
                let replyCount = Object.keys(post.replies).length;
                let postDiv = '<div id="'+post["postIndex"]+'" onclick="loadPost(this.id)" class="postContainer text-center"><div class="imgBox"><img class="stdImg" src="http://127.0.0.1:8090/storage/post'+post["postIndex"]+'.jpg"></div><a href="#" id="postTitle">'+post["title"]+'|R: '+replyCount+'|I: '+post["postIndex"]+'</a></div>\n'
                document.getElementById("contentGrid").innerHTML += postDiv
                
            }
            GLOBAL.postIndex += maxPosts + 1;
        }
    })
    .catch(err =>{
        if(err == "$none-found" && GLOBAL.postIndex == 1)
        {
            GLOBAL.postIndex += 1; //cheap check to bypass first post if its just about to be posted
        }
        console.log(err);
        errorMessage(err);
        return false;
    });
}

function setupPost()
{
    let elem = document.getElementById("loginWindow");
    let postElem = document.getElementById("postWindow");
    if(elem.style.display == "none" || elem.style.display == "")
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

function reloadPosts()
{
    document.getElementById("contentGrid").innerHTML = "";
    GLOBAL.postIndex = 1;
    loadMore(true);
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