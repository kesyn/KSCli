#!/usr/bin/env node


/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _h5parser = require('./h5parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var program = require('commander');


program.version('1.0.5');
program.command('parse').description('parse psd file').option('-p, --path', 'path of psd files').action(function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options) {
        var path;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        path = "psd";

                        if (options.path) {
                            path = options.path;
                        }
                        path += "/*";
                        _context.next = 5;
                        return (0, _h5parser.parse)(path);

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());

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