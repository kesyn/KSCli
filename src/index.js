#!/usr/bin/env node

/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

var program = require('commander');
import {parse, sources, codes, framework, clean} from './h5parser'

program.version('1.0.5');
program.command('parse')
    .description('parse psd file')
    .option('-p, --path', 'path of psd files')
    .action(async (options)=>{
        var path = "psd";
        if(options.path){
            path = options.path;
        }
        path += "/*";
        await parse(path);
    })

program.command('sources')
    .description('Arrange the source files')
    .action((options)=>{
        sources();
    })

program.command('framework')
    .description('Download framework files')
    .action(()=>{
        framework();
    })

program.command('codes')
    .description('write codes')
    .option('-p, --pagename', 'path of psd files')
    .action((options)=>{
        codes(options);
    })
program.command('clean')
    .description('Clean solutions')
    .action((options)=>{
        clean();
    })

program.parse(process.argv);