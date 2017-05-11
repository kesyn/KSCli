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
const cheerio = require('cheerio');
var https = require('https');
var AdmZip = require('adm-zip');
var beautifyInstance = require('js-beautify');
var beautify = beautifyInstance.js_beautify
var beautify_html = beautifyInstance.html;
var copydir = require('copy-dir');
const getColors = require('get-image-colors')
const imageminOptipng = require('imagemin-optipng');
import _ from 'lodash'
import * as PSD from 'psd'
var loadingPage = null;
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
export async function parse(dir){
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
        var isLoading = pagename=="loading"?true:false;
        if(!fs.existsSync("sources")){
            fs.mkdirSync("sources/");
        }
        var psd = PSD.fromFile(file);
        psd.parse();
        var docHeight = psd.header.height;
        // console.log(psd.tree().export());
        // console.log(psd.tree().export().children[0].image)
        var imgs = [];
        var pageBackground = "transparent";
        // if(pagename=="page2"){
        //     var layer = (_.find(psd.tree().descendants(), c=>{
        //         // c.export();
        //         return c.name.indexOf("距离IP7还有:100分")>=0;
        //     }));
        //     console.log(layer);
        //     process.abort();
        // }
        // else
        // {
        //     continue;
        // }
        for(var layer of psd.tree().descendants()){
            //console.log(layer.export());
            if(layer.name.indexOf("_")<0){
                continue;
            }
            var layerInfo = layer.export();
            var animation = [{d:0.5,i:1,t:`'fadeIn'`,c:`'in'`}];
            var code = {};
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
            if(isLoading){
                imgInfo.loadingX = layerInfo.left/750;
                imgInfo.loadingY = layerInfo.top/docHeight;
                imgInfo.loadingWidth = layerInfo.width/750;
                imgInfo.loadingHeight = layerInfo.height/docHeight;
            }
            imgInfo.cx = false;
            imgInfo.cy = false;
            imgInfo.bottom = false;
            imgInfo.right = false;
            imgInfo.alpha = 0;
            imgInfo.scale = 1;
            imgInfo.per = 1;
            imgInfo.bk = false;
            imgInfo.input = false;
            imgInfo.txt = false;
            imgInfo.bf = false;
            imgInfo.backcolor = "'transparent'";
            for(var i = 1; i<parts.length-1;i++){
                var p = parts[i];
                if(p==null)continue;
                if(p == "b"){
                    imgInfo.bottom = true;
                    imgInfo.y = layerInfo.bottom - docHeight;

                }
                if(p == "x"){
                    imgInfo.cx = true;
                    imgInfo.x = (layerInfo.left + layerInfo.right)/2 - 750/2;

                }
                if(p == "y"){
                    imgInfo.cy = true;
                    //console.log(layerInfo)
                    //console.log((layerInfo.top + layerInfo.bottom)/2)
                    imgInfo.y = (layerInfo.top + layerInfo.bottom)/2 - docHeight/2;

                    //console.log(imgInfo)
                }
                if(p == "r"){
                    imgInfo.right = true;
                    imgInfo.x = layerInfo.right - 750;

                }
                if(p == "bt"){
                    imgInfo.button = true;
                }
                if(p == "bk"){
                    imgInfo.bk = true;
                }
                if(p=="ip"){
                    imgInfo.input = true;
                }
                if(p=="txt"){
                    imgInfo.txt = true;
                }
                if(p=="bf"){
                    imgInfo.bf = true;
                }
                if(p == "f"){
                    imgInfo.full = true;
                }
                if(p == "g"){
                    imgInfo.global = true;
                }
                if(p=="noin"){
                    imgInfo.disableIn = true;
                }if(p=="noin"){
                    imgInfo.disableIn = true;
                }
                if(p.indexOf("animate")>=0){
                    var inAnimation = _.find(animation, c=>c.c==`'in'`)
                    if(!imgInfo.disableIn){
                        if(!inAnimation){
                            inAnimation = {};
                            animation.push(inAnimation);
                        }
                        var ps = p.split('(')[1].split(')')[0].split('-');
                        if (ps.length > 1)
                            inAnimation.d = ~~ps[1];
                        if (ps.length > 2)
                            inAnimation.i = ~~ps[2];
                        if (ps.length > 0)
                            inAnimation.t = `'${ps[0]}'`;
                        if (ps.length > 3)
                            if (ps[3] == "infinite") {
                                inAnimation.infinite = true;
                            }
                        inAnimation.c = `'in'`
                    }
                    else{
                        _.remove(animation, c=>c.c==`'in'`)
                    }
                }
                if(p.indexOf("waitanimate")>=0){
                    var waitAnimation = _.find(animation, c=>c.c==`'out'`)
                    if(!imgInfo.disableIn){
                        if(!waitAnimation){
                            waitAnimation = {};
                            animation.push(waitAnimation);
                        }
                        var ps = p.split('(')[1].split(')')[0].split('-');
                        if (ps.length > 1)
                            waitAnimation.d = ~~ps[1];
                        if (ps.length > 2)
                            waitAnimation.i = ~~ps[2];
                        if (ps.length > 0)
                            waitAnimation.t = `'${ps[0]}'`;
                        if (ps.length > 3)
                            if (ps[3] == "infinite") {
                                waitAnimation.infinite = true;
                            }
                        if (ps.length > 4)
                            if (ps[4] != "") {
                                waitAnimation.id = ps[4];
                            }
                        waitAnimation.c =`'out'`
                    }
                    else{
                        _.remove(animation, c=>c.c==`'out'`)
                    }
                }
                imgInfo.animation = animation;
                if(p.indexOf("code")>=0){
                    var ps = p.split('(')[1].split(')')[0].split('~~~~');
                    if(ps.length>0){
                        code.codeType = ps[0]
                    }
                    if(ps.length>1){
                        code.code = ps[1]
                    }
                }
                imgInfo.code = code;
            }
            if(imgInfo.bk){
                deleteFolder("cltmp");
                if(!fs.existsSync("cltmp")){
                    fs.mkdirSync("cltmp");
                }
                await layer.saveAsPng("cltmp/" + "bk.png");
                pageBackground = await new Promise((resolve)=>{
                    getColors("cltmp/" + "bk.png").then(colors=>{
                        colors = colors.map(color => color.hex());
                        var index = ~~(colors.length/2);
                        resolve(colors[index]);
                    })
                });
                deleteFolder("cltmp");
                continue;
            }
            if(imgInfo.input){
                deleteFolder("cltmp");
                if(!fs.existsSync("cltmp")){
                    fs.mkdirSync("cltmp");
                }

                await layer.saveAsPng("cltmp/input.png");
                var inputColor = await new Promise((resolve)=>{
                    getColors("cltmp/" + "input.png").then(colors=>{
                        colors = colors.map(color => color.hex());
                        var index = ~~(colors.length/2);
                        resolve(colors[index]);
                    })
                });
                imgInfo.inputColor = inputColor;
                imgInfo.inputSize = sizeOf("cltmp/input.png")
                deleteFolder("cltmp");
                imgs.push(imgInfo);
                continue;
            }
            if(imgInfo.txt){
                imgInfo.layer = layer.export();
            }
            if(imgInfo.global){
                await layer.saveAsPng("sources/" + "global-" + imgInfo.name + ".png");
                imgInfo.fileName = "global-" + imgInfo.name + ".png";
                if(!globaled.has(imgInfo.fileName)){
                    globaled.set(imgInfo.fileName, "added");
                    packages.push({n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height})
                }
            }
            else {
                await layer.saveAsPng("sources/" + pagename + "-" + imgInfo.name + ".png");
                imgInfo.fileName = pagename + "-" + imgInfo.name + ".png";
                packages.push({n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height})
            }
            imgs.push(imgInfo);
        }
        //console.log(pageBackground);
        pages.push({
            pageName: pagename,
            images: _.reverse(imgs),
            bk: pageBackground,
            width: 750,
            height: docHeight
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
export function codesLoading(page){
    var indexFile = fs.readFileSync('index.html', 'utf-8');
    var $ = cheerio.load(indexFile);
    $("#loadingPanel").css("width", "100%").css("height", "100%");

    var html = "";
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
        img.loadingX = (img.loadingX*100)
        img.loadingY = (img.loadingY*100)
        img.loadingWidth = (img.loadingWidth*100)
        img.loadingHeight = (img.loadingHeight*100)
        var ani = img.animation;
        //var ani = [{d:0.5,i:1,t:"'fadeIn'", c:"'in'"}];
        html += `    <!-- ${img.comment} -->
`;
        if(!img.bf) {
                html += `    <img src="sources/${img.fileName}" 
        style="width:${img.loadingWidth+"%"};height:${img.loadingHeight+"%"};left:${img.loadingX+"%!important"};top:${img.loadingY+"%!important"};position:fixed;display:block!important;"
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        />\n`
        }
        else{
            html += `    <div style="background-image: url('sources/${img.fileName}');background-size: cover;background-position: center;width:100%;height:100%;position:fixed;display:block!important;" 
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        ></div>\n`
        }
        if(img.txt){
            position.width = img.layer.width;
            position.height = img.layer.height;
            html += `    <div 
        style="font-size: ${img.loadingHeight+"%"}; width:${img.loadingWidth+"%"};height:${img.loadingHeight+"%"};position:fixed;left:${img.loadingX+"%!important"};top:${img.loadingY+"%!important"}; line-height: 1; color:rgba(${img.layer.text.font.colors[0][0]},${img.layer.text.font.colors[0][1]},${img.layer.text.font.colors[0][2]},${img.layer.text.font.colors[0][3]/255});display:block!important;"
       
        class="${img.name}"
        id="${page.pageName}-${img.name}-text"
        fontInfo="${JSON.stringify(img.layer.text.font.sizes)}-${JSON.stringify(img.layer.text.font.colors)}"
        >${img.layer.text.value}</div>\n`
        }
    }
    $("#loadingPanel").html(html);
    var html = $.html().replace(/\&apos;/g, "'");
    html = beautify_html(html);
    fs.writeFileSync("./index.html", html);
    console.log("loading page fin")
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
        var pageType = page.pageName.indexOf("page")>=0?'page':'widget';
        if(page.pageName=="loading"){
            pageType = "loading"
        }
        if(pageType!="loading") {
            screens.push({
                page: `views/${page.pageName}.html`,
                id: `${page.pageName}`,
                controller: `controllers/${page.pageName}.js`,
                start: false,
                type: pageType
            });
        }
        else{
            //loadingPage = page;
            codesLoading(page)
            continue;
        }
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
            if(!img.bf) {
                if(img.input){
                    position.width = img.inputSize.width;
                    position.height = img.inputSize.height;
                    html += `    <input 
        position="${JSON.stringify(position).replace(/\"/g, "")}" 
        ani="${JSON.stringify(ani).replace(/\"/g, "")}"
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        style="padding:0;border:0;line-height:${position.height+"px"};font-size: ${(position.height-5)+"px"}; color:${img.inputColor}"
        />\n`
                }
                else {
                    html += `    <img src="sources/${img.fileName}" 
        position="${JSON.stringify(position).replace(/\"/g, "")}" 
        ani="${JSON.stringify(ani).replace(/\"/g, "")}"
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        />\n`
                }
            }
            else{
                html += `    <div style="background-image: url('sources/${img.fileName}');background-size: cover;background-position: center" 
        position="{width:window.innerWidth, height:window.innerHeight}" 
        ani="${JSON.stringify(ani).replace(/\"/g, "")}"
        class="${img.name}"
        id="${page.pageName}-${img.name}"
        ></div>\n`
            }
            if(img.txt){
                position.width = img.layer.width;
                position.height = img.layer.height;
                html += `    <div 
        style="font-size: ${img.layer.text.font.sizes[0]+"px"}; line-height: 1; color:rgba(${img.layer.text.font.colors[0][0]},${img.layer.text.font.colors[0][1]},${img.layer.text.font.colors[0][2]},${img.layer.text.font.colors[0][3]/255})"
        position="${JSON.stringify(position).replace(/\"/g, "")}" 
        ani="${JSON.stringify(ani).replace(/\"/g, "")}"
        class="${img.name}"
        id="${page.pageName}-${img.name}-text"
        fontInfo="${JSON.stringify(img.layer.text.font.sizes)}-${JSON.stringify(img.layer.text.font.colors)}"
        >${img.layer.text.value}</div>\n`
            }
            var customJS = ""
            if(img.code){
                switch(img.code.codeType){
                    case "custom":
                        customJS = img.code.code;
                        break;
                    case "open":
                        customJS = `KSApp.widget.show('${img.code.code}')`;
                        break;
                    case "close":
                        customJS = `KSApp.widget.hide('${img.code.code}')`;
                        break;
                    case "jump":
                        customJS = `KSApp.pageService.gotoPage(${img.code.code})`;
                        break;
                    case "animate":
                        customJS = `KSApp.animator.runWaitAnimation('.${img.name}', null, function () {

                }, false);`;
                        break;
                }
            }
            if(img.button){
                js += `\/\/${img.comment} 点击事件\n`
                js += `        KSApp.tools.on("#${page.pageName}-${img.name}","touchstart", function(){
                ${customJS}
        });\n`
            }
        }
        var viewStr = `<div id="${page.pageName}" class="full" style="background-color: ${page.bk}">
${html} 
</div>`;
        if(pageType=="widget"){
            js += `        KSApp.${page.pageName} = this;`
        }
        var jsStr = `var ${page.pageName} = function () {
    this.load = function () {
        ${js}
        KSApp.swipeup = function () {
            
        };
        KSApp.swipedown = function () {
            
        };
    };
};`;
        jsStr = beautify(jsStr);
        if(!fs.existsSync("views")){
            fs.mkdirSync("views/");
        }

        if(!fs.existsSync("controllers")){
            fs.mkdirSync("controllers/");
        }
        if(!fs.existsSync(`controllers/${page.pageName}.js`)) {
            fs.writeFileSync(`controllers/${page.pageName}.js`, jsStr);
        }
        fs.writeFileSync(`views/${page.pageName}.html`, viewStr);
        //console.log(viewStr);
    }
    screens[0].start = true;
    var screenStr = `var screens = ${JSON.stringify(screens)}`.replace(/{/g, "\n{");
    fs.writeFileSync("screens.js", screenStr);

}

export function framework(){
    if(fs.existsSync("index.html")){
        console.log("will not download framework code")
        return;
    }
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