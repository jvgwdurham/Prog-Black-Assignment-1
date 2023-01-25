const controller = require("../controllers.js");
const fs = require("fs");
const { send } = require("process");


const resp = {
    send : jest.fn(x => x),
    sendStatus : jest.fn(x => x)
};

test("This test tests the upload post controller", () =>
{
    const numFiles = fs.readdirSync('./client/posts').length
    const req = {body:{
        "postBody" : "test",
        "poster" : "test123"
    }}
    controller.uploadPost(req, resp)
    expect(resp.send).toHaveBeenCalledWith({"postIndex":numFiles.toString()});
})

test("this function tests the server status controller", () => {
    const req = {"test": "test"};
    controller.serverStatus(req, resp)
    expect(resp.send).toHaveBeenCalledWith({"Server-Status":1})
})

test("tests the adding comment controller", ()=>{
    const req = {body:{
        "index" : "1",
        "commenter" : "test",
        "comment" : "test123"
    }}
    controller.addComment(req,resp);
    expect(resp.send).toHaveBeenCalled();
})

test("tests the get posts controller with invalid inputs",() =>{
    const req = {
        "params" : {
            "startIndex" : 1,
            "stopIndex" : -1
        }
    }
    controller.getPosts(req,resp);
    expect(resp.send).toHaveBeenCalledWith({"postStatus":"$invalid-input"});
})

test("tests getPostByIndex with invalid inputs", ()=>{
    const req = {
        "params":{
        "index" : -1
    }}
    controller.getPostByIndex(req,resp);
    expect(resp.send).toHaveBeenCalledWith({"postStatus":"$not-found"})
})
