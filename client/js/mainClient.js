var GLOBAL_postIndex = 0;
var GLOBAL_username = "";
var GLOBAL_loggedIn = false;

if(getCookie("c_username").length > 0)
{
    document.getElementById("loginWindow").style.display = "none";
    document.getElementById("username").innerHTML = getCookie("c_username");
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";" + "SameSite=None; Secure";
  } // This code is pasted from w3 schools
  
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
  } //so is this
  


document.addEventListener('click',function(event)
{
    let postElem = document.getElementById("postWindow");
    let postButton = document.getElementById("postButton");
    if(!postElem.contains(event.target))
    {
        if(postButton.contains(event.target))
        {
            return
        }
        postElem.style.display = "none";
    }
});

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
    if(postElem.style.display == "none")
    {
        document.getElementById("postWindow").style.display = "block";
    }
    console.log("clicked");
}

function changeImage(event)
{
    let img = document.getElementById("uploadimg")
    img.src = URL.createObjectURL(event.target.files[0]);
    console.log(document.getElementById("uploadimg").src);
}

function loadPost(id)
{
    console.log("clicked");
}

