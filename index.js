const shell = require("shelljs");
const os = require("os");
var uniqid = require("uniqid");
var glob = require("glob")
var fs = require("fs");
var path = require("path");

class repo {
    constructor() {
        this.path = ""; // where on disk the repo is cloned
        this.id = ""; // the unique id for the repo
        this.rawpath = ""; // the raw path of github files
        this.branch = "master";
        this.url = ""; // the repo url
        this.name = "";
        this.tmpdir = "";
    }
}

let myrepo = new repo();
myrepo.tmpdir = '/tmp';
myrepo.branch = "master";
myrepo.url = "https://github.com/ethereum/remix-plugin.git";
myrepo.id = uniqid(); // assign new id to this repo
myrepo.path = `${myrepo.tmpdir}/${myrepo.id}`;
console.log("cloning", myrepo.url);
console.log(shell.pwd());
const cmd = `git clone --single-branch --branch ${myrepo.branch} ${myrepo.url} ${myrepo.path}`;

let docdir = `${__dirname}/docs/plugin`;
let basedocdir = `${__dirname}/docs`;

console.log(docdir)
console.log(cmd);

shell.exec(cmd, async function (code, stdout, stderr) {
    console.log(stdout)
    glob(`${myrepo.path}/**/*.md`, {}, function (err, files) {
        if (err) throw err;
        let count = 0;
        for (let f of files) {
            console.log(f);
            let destination = `${docdir}${f.replace(myrepo.path,'')}`;
            console.log(path.dirname(destination))
            console.log(destination);
            fs.mkdir(path.dirname(destination), {
                recursive: true
            }, (err) => {
                if (err) throw err;
                fs.copyFile(f, destination, function () {
                    count++;
                    if (count == files.length) {
                        console.log("done");
                        shell.cd(basedocdir);
                        shell.exec(`rm -rf ${docdir}/_build`);
                        shell.exec("make html");
                    }
                });
            });
        }
    })

});