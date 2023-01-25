const fs = require("fs");
const tests = require("../utils.js");

test("tests whether the post index is correct and if getFirstLine works",() =>{
    const numFiles = fs.readdirSync('./client/posts').length
    const postIndex = parseInt(tests.getFirstLine("./postIndex.txt"));
    expect((numFiles == postIndex)).toBe(true);
})

test("tests startup validation",() =>{
    const numFiles = fs.readdirSync('./client/posts').length
    fs.rmSync("./postIndex.txt");
    tests.startUpValidation();
    expect(fs.existsSync("./postIndex.txt")).toBe(true);
    const postIndex = parseInt(tests.getFirstLine("./postIndex.txt"));
    expect(postIndex == numFiles).toBe(true);
})