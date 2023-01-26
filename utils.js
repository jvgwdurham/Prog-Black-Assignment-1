'use strict';

const fs = require('fs');

function getFirstLine(filename)
{
    const data = fs.readFileSync(filename,'utf8');
    return data.split('\n').shift();
}

function recoverPostIndex(folder)
{
    let maxVal = 0;
    fs.readdirSync(folder).forEach(file => {
        let num = parseInt(file.substring(4).split(".")[0]);
        if(num > maxVal)
        {
            maxVal = num;
        }
    });
    return maxVal
}

function checkDirStructure()
{
    if(!fs.existsSync("./client/storage/"))
    {
        fs.mkdirSync("./client/storage/",{recursive:true});
        console.log("storage directory missing, remade dir");
    }
    if(!fs.existsSync("./client/posts"))
    {
        fs.mkdirSync("./client/posts/",{recursive:true});
        console.log("posts directory missing, remade dir");
    }
}

function startUpValidation()
{
    checkDirStructure();
    if(!fs.existsSync("postIndex.txt"))
    {
        fs.writeFileSync("postIndex.txt", recoverPostIndex("./client/storage/").toString());
        console.log("postIndex file missing, created new file");
    }
}

module.exports = {startUpValidation, getFirstLine};