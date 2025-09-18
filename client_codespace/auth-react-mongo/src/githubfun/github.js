import axios from 'axios'
//const bcrypt = import('bcryptjs')
//const jwt = import('jsonwebtoken')
//Utility files are fetched from github repository allotted, as no server is used
//ETag == sha
let githubdir = {
    owner: 'progetti-da-collaborare',
    repo: 'files-da-condividere',     //github repository
    auth: 'Bearer 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',     //token for repository access through account authentication
};

//ETag serves to rewrite the same version of the file for not to produce new versions
const getFileETag = async path => {
    try{
        console.log(`getFileETag(${path})`);
        if(!!!githubdir.auth) throw new Error("Authorisation not fulfilled or failed/ in file " + __filename + "/ getFileETag(path)");
        return await fetch(
            `https://api.github.com/repos/${githubdir.owner}/${githubdir.repo}/contents/${path}`,
            {
                "method": "GET",
        //      "credentials": "include",
                //"mode": "no-cors",
                "headers": {"Authorization":`${githubdir.auth}`,
                            "Accept": "application/vnd.github.v3.raw"},
            }
        )
    //  .then(resp=>{console.log(resp); return resp;})
        .then(resp=>{if(resp.status !== 200) throw new Error("File is not created yet or the filepath is wrong"); return resp})
        .then(resp=>resp.headers.get("ETag"))
        .then(resp=>{
                let L = resp.length; 
                let r = resp.substring(1,L-1);
                return r
        })
    } catch(e) {
        console.log(`ERROR: ${e.message}`)
    }
}
  
//https://github.com/krakenjs/zoid/issues/222
//It's necessary to translate letters in cyrillica to base64
const btoaU = (str) => {
    try{
        console.log(`btoaU(${str})`);
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
    } catch(e) {
        console.log(`ERROR: ${e.message}`)
    }
  }

//Сохранить файл в гитхаб репозиторий
const pushFile = async (title, content) => {
    try{
        console.log(`pushFile(${title})`)
        const tag = await getFileETag(title);
        const data = {
            message: "a new commit message",
            committer: {"name": "progetti-da-collaborare","email": "AndrSlav13@yandex.ru"},
            content: btoaU(content),
        };
        if(!!tag) data.sha = tag;
        await fetch(
            `https://api.github.com/repos/${githubdir.owner}/${githubdir.repo}/contents/${title}`,
            {
                "method": "PUT",
        //      "credentials": "include",
                "headers": {"Authorization": `${githubdir.auth}`,
                            "Accept": "application/vnd.github+json",
                            "X-GitHub-Api-Version": "2022-11-28"},
                "body":JSON.stringify(data)
            }
        )
        .then(resp=>resp.text())
        .then(console.log)
    } catch(e) {
        console.log(`ERROR: ${e.message}`)
    }
}


const getGitPage = async title => {
    try{
        console.log(`getGitPage(${title})`)
        const url = `https://api.github.com/repos/${githubdir.owner}/${githubdir.repo}/contents/${title}`;
        const headers = {
          Authorization: `${githubdir.auth}`,
          Accept: 'application/vnd.github.v3.raw',
        };
        const data = await axios.get(url, { headers });
        console.log(data);
        console.log(data.data);
        return data.data;
    } catch(e) {
        console.log(`ERROR: ${e.message}`)
    }
}

export {pushFile, getGitPage}