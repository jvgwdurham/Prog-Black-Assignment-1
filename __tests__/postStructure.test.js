const tests = require("../client/js/postStructure.js");

test("testing if an instance of ClientPost can be made from mock data", () =>
{
    let mockData = {"title":"asfd","postIndex":"5","imageLocation":"./storage/post5.jpg","poster":"sdf","replies":{"comment0":{"commenter":"testing","comment":"test123"}}}
    let post = tests.ClientPost.fromJson(mockData);
    expect(post.title).toBe("asfd");
    expect(post.index).toBe("5");
    expect(post.imageLocation).toBe("./storage/post5.jpg");
    expect(post.poster).toBe("sdf");
    expect(post.replies.commentArray[0].commenter).toBe("testing");
    expect(post.replies.commentArray[0].comment).toBe("test123");
})

test("testing if an instance of a post can be converted to JSON", () =>
{
    let post = new tests.ClientPost("asfd","5","sdf");
    post.addComment(new tests.ClientComment("testing","test123"));
    expect(post.toJson()).toStrictEqual({"title":"asfd","postIndex":"5","imageLocation":"./storage/post5.jpg","poster":"sdf","replies":{"comment0":{"commenter":"testing","comment":"test123"}}});
});

test("testing if a valid dom element is produced from a post", () =>
{
    let mockData = {"title":"asfd","postIndex":"5","imageLocation":"./storage/post5.jpg","poster":"sdf","replies":{"comment0":{"commenter":"testing","comment":"test123"}}}
    let post = tests.ClientPost.fromJson(mockData);
    let dom = post.buildPostDOM();
    expect(dom.postInfo).toBe('<label class="text-center" id="poster">Poster: '+post.poster+'</label>\n<img class="mt-3 stdImg" src="'+post.imageLocation+'">\n<label id="p-'+post.index+'" class="text-center mt-1">'+post.title+' |I: '+post.index+'</label>')
    expect(dom.commentString).toBe('<li id="comment0" class="reply list-group-item list-group-item-dark">testing: test123</li>\n');
});

test("testing if adding a comment works", () =>
{
    let post = new tests.ClientPost("asfd","5","sdf");
    post.addComment(new tests.ClientComment("testing","test123"));
    expect(post.getNumberOfComments()).toBe(1);
    expect(post.toJson()).toStrictEqual({"title":"asfd","postIndex":"5","imageLocation":"./storage/post5.jpg","poster":"sdf","replies":{"comment0":{"commenter":"testing","comment":"test123"}}});
});