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

function startUpValidation()
{
    if(!fs.existsSync("postIndex.txt"))
    {
        fs.writeFileSync("postIndex.txt", recoverPostIndex("./client/storage/").toString());
        console.log("postIndex file missing, created new file");
    }
    console.log("server starting");
}

module.exports = {startUpValidation, recoverPostIndex, getFirstLine};