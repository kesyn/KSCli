/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

import glob from 'glob'
import fs from 'fs';
var pinyin = require('pinyin')
var sizeOf = require('image-size');
const imagemin = require('imagemin');
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
            for(var i = 1; i<parts.length-1;i++){
                var p = parts[i];

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
        console.log("packages file complete");
    });

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

}
