/* eslint-disable no-unused-vars */
/*global ClientPost, ClientReplies, ClientComment, setCookie, getCookie, calcMaxPosts*/

var GLOBAL = {
    postIndex : 1,
    username : "",
    loggedIn : false
}

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

    fetch("/uploadPost", {
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

    fetch("/addComment", {
        method: "POST",
        headers: {'Content-Type':"application/json"},
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        let post = ClientPost.fromJson(data);
        if(post instanceof ClientPost){
            console.log(post);
            let domInfo = post.buildPostDOM();
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
    fetch("/getPostByIndex/"+id)
    .then(res => res.json())
    .then(data =>
        {
        let post = ClientPost.fromJson(data);
        if(post instanceof ClientPost)
        {
            console.log(post);
            let domInfo = post.buildPostDOM();
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
    unloadPosts();
}

function loadMore(firstLoad = false)
{
    let maxPosts = calcMaxPosts(firstLoad);
    let startIndex = GLOBAL.postIndex;
    let stopIndex = GLOBAL.postIndex + maxPosts;

    fetch("/getPosts/"+startIndex+"/"+stopIndex+"")
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

function hideOverlay(id)
{
    let overlay = document.getElementById(id);
    overlay.style.display = "none";
}

function errorMessage(message)
{
    document.getElementById("errMsg").innerText = message;
    document.getElementById("errorFrame").style.display = "block";
}

function openRules()
{
    document.getElementById("rulesWindow").style.display = "block";
}

function unloadPosts()
{
    document.getElementById("contentGrid").innerHTML = "";
}