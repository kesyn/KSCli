#!/usr/bin/env node


/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

var _h5parser = require('./h5parser');

var program = require('commander');


program.version('1.0.0');
program.command('parse').description('parse psd file').option('-p, --path', 'path of psd files').action(function (options) {
    var path = "psd";
    if (options.path) {
        path = options.path;
    }
    path += "/*";
    (0, _h5parser.parse)(path);
});

program.command('sources').description('Arrange the source files').action(function (options) {
    (0, _h5parser.sources)();
});

program.command('framework').description('Download framework files').action(function () {
    (0, _h5parser.framework)();
});

program.command('codes').description('write codes').option('-p, --pagename', 'path of psd files').action(function (options) {
    (0, _h5parser.codes)(options);
});
program.command('clean').description('Clean solutions').action(function (options) {
    (0, _h5parser.clean)();
});

program.parse(process.argv);