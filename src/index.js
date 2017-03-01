#!/usr/bin/env node

/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

var program = require('commander');
import {parse} from './h5parser'

program.version('1.0.0');
program.command('parse')
    .description('parse psd file')
    .option('-p, --path', 'path of psd files')
    .action((options)=>{
        var path = "psd";
        if(options.path){
            path = options.path;
        }
        path += "/*";
        parse(path);
    })

program.parse(process.argv);