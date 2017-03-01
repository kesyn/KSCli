/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

import glob from 'glob'
import fs from 'fs';
import del from 'del';
var pinyin = require('pinyin')

export function parse(dir){
    var files = glob.sync("psd/*");
    if(fs.existsSync(".tmp")){
        del(['.tmp/**/*'], {dot: true});
    }
    if(!fs.existsSync(".tmp")){
        fs.mkdirSync(".tmp");
    }
    for(var file of files){
        var pagename = file.replace("psd/", "").replace(".psd", "");
        if(!fs.existsSync(".tmp/" + pagename)){
            fs.mkdirSync(".tmp/" + pagename);
        }
        var psd = PSD.fromFile(file);
        psd.parse();
        // console.log(psd.tree().export());
        // console.log(psd.tree().export().children[0].image)
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
                height:layerInfo.height
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
            }

            console.log(imgInfo);

            //layer.saveAsPng(".tmp/" + pagename + "/" + layerInfo.name);
        }
        //psd.tree().descendants()[0].saveAsPng("psd/1.png")
    }
}