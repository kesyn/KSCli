/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

import glob from 'glob'
import fs from 'fs';
var pinyin = require('pinyin')
var sizeOf = require('image-size');
const imagemin = require('imagemin');
var request = require('request');
var unzip = require('unzip');
var https = require('https');
var AdmZip = require('adm-zip');
var copydir = require('copy-dir');
const imageminOptipng = require('imagemin-optipng');
import _ from 'lodash'
import * as PSD from 'psd'
var deleteFolder = module.exports.deleteFolder= function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
var deleteFile = function(path){
    if(fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}
export function parse(dir){
    var files = glob.sync(dir);
    var packages = [];
    var globaled = new Map();
    var pages = [];
    // deleteFolder("tmp");
    // if(!fs.existsSync("tmp")){
    //     fs.mkdirSync("tmp");
    // }
    for(var file of files){
        var pagename = file.replace("psd/", "").replace(".psd", "");
        if(!fs.existsSync("sources")){
            fs.mkdirSync("sources/");
        }
        var psd = PSD.fromFile(file);
        psd.parse();
        // console.log(psd.tree().export());
        // console.log(psd.tree().export().children[0].image)
        var imgs = [];
        for(var layer of psd.tree().descendants()){
            //console.log(layer.export());
            var layerInfo = layer.export();
            var animation = [{d:0.5,i:1,t:`'fadeIn'`,c:`'in'`}];
            var parts = layerInfo.name.replace(".png", "").split('_');
            var py = pinyin(parts[parts.length - 1], {style: pinyin.STYLE_NORMAL, heteronym:false}).map((item, i)=>item[0]);
            var name = "";
            for(var p of py){
                name += p;
            }
            var imgInfo = {
                id: ~~parts[0],
                name: name,
                comment: parts[parts.length - 1],
                width: layerInfo.width,
                height:layerInfo.height,
                pageName: pagename
            }
            imgInfo.x = layerInfo.left;
            imgInfo.y = layerInfo.top;
            imgInfo.cx = false;
            imgInfo.cy = false;
            imgInfo.bottom = false;
            imgInfo.right = false;
            imgInfo.alpha = 0;
            imgInfo.scale = 1;
            imgInfo.per = 1;
            imgInfo.backcolor = "'transparent'";
            for(var i = 1; i<parts.length-1;i++){
                var p = parts[i];
                if(p==null)continue;
                if(p == "b"){
                    imgInfo.bottom = true;
                    imgInfo.y = layerInfo.bottom - 1334;
                }
                if(p == "x"){
                    imgInfo.cx = true;
                    imgInfo.x = (layerInfo.left + layerInfo.right)/2 - 750/2;
                }
                if(p == "y"){
                    imgInfo.cy = true;
                    //console.log(layerInfo)
                    //console.log((layerInfo.top + layerInfo.bottom)/2)
                    imgInfo.y = (layerInfo.top + layerInfo.bottom)/2 - 1334/2;
                    //console.log(imgInfo)
                }
                if(p == "r"){
                    imgInfo.right = true;
                    imgInfo.x = layerInfo.right - 750;
                }
                if(p == "bt"){
                    imgInfo.button = true;
                }
                if(p == "f"){
                    imgInfo.full = true;
                }
                if(p == "g"){
                    imgInfo.global = true;
                }
                if(p.indexOf("animate")>=0){
                    var parts = p.split('(')[1].split(')')[0].split('-');
                    animation[0].d = ~~parts[1];
                    animation[0].i = ~~parts[2];
                    animation[0].t =`'${parts[0]}'`;

                }
                imgInfo.animation = animation;
            }

            if(imgInfo.global){
                layer.saveAsPng("sources/" + "global-" + imgInfo.name + ".png");
                imgInfo.fileName = "global-" + imgInfo.name + ".png";
                if(!globaled.has(imgInfo.fileName)){
                    globaled.set(imgInfo.fileName, "added");
                    packages.push({n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height})
                }

            }
            else {
                layer.saveAsPng("sources/" + pagename + "-" + imgInfo.name + ".png");
                imgInfo.fileName = pagename + "-" + imgInfo.name + ".png";
                packages.push({n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height})
            }
            imgs.push(imgInfo);

        }
        pages.push({
            pageName: pagename,
            images: _.reverse(imgs)
        });
    }
    fs.writeFileSync("pages.json", JSON.stringify(pages));
    console.log("Files Cutted")
    //var packagesjsFileContent = "var files = " + JSON.stringify(packages);
    //console.log(packagesjsFileContent)
    imagemin(['sources/*.{jpg,png}'], 'sources', {
        plugins: [
            imageminOptipng()
        ]
    }).then(files => {
        console.log("Files Compressed");
        sources();
        //fs.writeFileSync("packages.js", packagesjsFileContent);

    });
    codes();
    framework();
}
export function sources(){
    var packages = [];
    var files = glob.sync("sources/*.{jpg,png}");
    for(var file of files){
        var size = sizeOf(file);
        packages.push({n: file.replace("sources/", ""), w: size.width, h:size.height});
    }
    var packagesjsFileContent = "var files = " + JSON.stringify(packages);
    fs.writeFileSync("packages.js", packagesjsFileContent);
    console.log("Arrange packages file complete");
}
export function codes(pagename){
    if(pagename&&pagename.length == null){
        pagename = null;
    }
    var jsonfile = "./pages.json";
    var json = fs.readFileSync(jsonfile, 'utf-8');
    var pages = JSON.parse(json);
    var screens = [];
    for(var page of pages){
        screens.push({
            page: `views/${page.pageName}.html`,
            id: `${page.pageName}`,
            controller: `controllers/${page.pageName}.js`,
            start: false,
            type: 'page'
        });
        if(pagename){
            if(pagename != page.pageName){
                continue;
            }
        }
        var html = "";
        var js = "";
        for(var img of page.images){
            var position = {
                x: img.x,
                y: img.y,
                alpha: img.alpha,
                cx: img.cx,
                cy: img.cy,
                bottom: img.bottom,
                right: img.right,
                scale: img.scale,
                per: img.per,
                backcolor: img.backcolor
            };
            var ani = img.animation;
            //var ani = [{d:0.5,i:1,t:"'fadeIn'", c:"'in'"}];
            html += `    <!-- ${img.comment} -->
`;
            html += `    <img src="sources/${img.fileName}" 
        position="${JSON.stringify(position).replace(/\"/g, "")}" 
        ani="${JSON.stringify(ani).replace(/\"/g, "")}"
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        />\n`
            if(img.button){
                js += `\/\/${img.comment} 点击事件\n`
                js += `        KSApp.tools.on("#${page.pageName}-${img.name}","touchstart", function(){
                
        });`
            }
        }
        var viewStr = `<div id="${page.pageName}" class="full">
${html} 
</div>`;
        var jsStr = `var ${page.pageName} = function () {
    this.load = function () {
        ${js}
        KSApp.swipeup = function () {
            
        };
        KSApp.swipedown = function () {
            
        };
    };
};`;
        if(!fs.existsSync("views")){
            fs.mkdirSync("views/");
        }

        if(!fs.existsSync("controllers")){
            fs.mkdirSync("controllers/");
        }
        fs.writeFileSync(`controllers/${page.pageName}.js`, jsStr);
        fs.writeFileSync(`views/${page.pageName}.html`, viewStr);
        //console.log(viewStr);
    }
    screens[0].start = true;
    var screenStr = `var screens = ${JSON.stringify(screens)}`;
    fs.writeFileSync("screens.js", screenStr);

}

export function framework(){
    deleteFolder("tmp");
    if(!fs.existsSync("tmp")){
        fs.mkdirSync("tmp");
    }
    var tmpFilePath = 'tmp/framework.zip'
    https.get("https://coding.net/u/kesyn/p/positional/git/archive/master", function(response) {
        response.on('data', function (data) {
            fs.appendFileSync(tmpFilePath, data)
        });
        response.on('end', function() {
            var zip = new AdmZip(tmpFilePath)
            zip.extractAllTo("tmp/");
            console.log("extracted");
            setTimeout(()=>{
                copydir('tmp/positional-master/', './', ()=>{
                    return true
                    //console.log("copy complete")
                }, ()=>{
                    console.log("copy complete");
                    deleteFolder("tmp")
                });
            }, 2000);

            //fs.unlink(tmpFilePath)
        })
    });
}

export function clean(){
    deleteFolder("controllers")
    deleteFolder("css")
    deleteFolder("js")
    deleteFolder("sources")
    deleteFolder("views")
    deleteFolder("dist")
    deleteFile("cache.appcache")
    deleteFile("gulpfile.babel.js")
    deleteFile("index.html")
    deleteFile("package.json")
    deleteFile("packages.js")
    deleteFile("pages.json")
    deleteFile("README.md")
    deleteFile("screens.js")
    deleteFile(".gitignore")
    deleteFile(".babelrc")
}