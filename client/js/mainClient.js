var GLOBAL_postIndex = 0;
var GLOBAL_username = "";
var GLOBAL_loggedIn = false;

class Replies{
    Replies()
}

class Post{
    Post(poster,title, imageLocation, replies){
        this.poster = poster;
        this.title = title;
        this.imageLocation = imageLocation;
        this.replies = replies;
    }
}

document.addEventListener('click',function(event)
{
    let postElem = document.getElementById("postWindow");
    if(!postElem.contains(event.target))
    {
        postElem.style.display = "none";
    }
});

function logIn()
{
    let username = document.getElementById("usernameInput").value;
    let elem = document.getElementById("loginWindow");
    if(username == "" || username.length > 16)
    {
        return false;
    }
    else
    {
        GLOBAL_username = username;
        GLOBAL_loggedIn = true;
        document.getElementById("username").innerHTML = username;
        elem.style.display = "none";
    }
}

function logOut()
{
    GLOBAL_username = "";
    GLOBAL_loggedIn = false
    document.getElementById("username").innerHTML = "Not Logged In"
    document.getElementById("loginWindow").style.display = "block";

}


function calcMaxPosts()
{
    let h = window.innerHeight-150;
    let w = window.innerWidth;

    const postHeight = 170;
    const postWidth = 256;

    let hmax = Math.floor(h/postHeight);
    let wmax = Math.floor(0.80*(w/postWidth));

    return hmax * wmax - 1
}

function loadMore()
{
    document.getElementById("contentGrid").innerHTML = ""
    let post = '<div id="post1" onclick="loadPost(this.id)" class="postContainer text-center"><div class="imgBox"><img class="stdImg" src="resources/placeholder.png"></div><span id="postTitle">post | R: 3</span></div>\n';
    let maxPosts = calcMaxPosts();
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
    if(elem.style.display == "block")
    {
        console.log("cant open post window")
        return
    }
    if(postElem.style.display == "none")
    {
        console.log("here")
        document.getElementById("postWindow").style.display = "block";
    }
    console.log("clicked");
}

function loadPost(id)
{
    console.log("clicked");
}

