/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var parse = exports.parse = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(dir) {
        var files, packages, globaled, pages, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, pagename, psd, docHeight, imgs, pageBackground, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, layer, layerInfo, animation, code, parts, py, name, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, p, imgInfo, i, ps;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        files = _glob2.default.sync(dir);
                        packages = [];
                        globaled = new Map();
                        pages = [];
                        // deleteFolder("tmp");
                        // if(!fs.existsSync("tmp")){
                        //     fs.mkdirSync("tmp");
                        // }

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 7;
                        _iterator = files[Symbol.iterator]();

                    case 9:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 129;
                            break;
                        }

                        file = _step.value;
                        pagename = file.replace("psd/", "").replace(".psd", "");

                        if (!_fs2.default.existsSync("sources")) {
                            _fs2.default.mkdirSync("sources/");
                        }
                        psd = PSD.fromFile(file);

                        psd.parse();
                        docHeight = psd.header.height;
                        // console.log(psd.tree().export());
                        // console.log(psd.tree().export().children[0].image)

                        imgs = [];
                        pageBackground = "transparent";
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 21;
                        _iterator2 = psd.tree().descendants()[Symbol.iterator]();

                    case 23:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 111;
                            break;
                        }

                        layer = _step2.value;

                        if (!(layer.name.indexOf("_") < 0)) {
                            _context.next = 27;
                            break;
                        }

                        return _context.abrupt('continue', 108);

                    case 27:
                        layerInfo = layer.export();
                        animation = [{ d: 0.5, i: 1, t: '\'fadeIn\'', c: '\'in\'' }];
                        code = {};
                        parts = layerInfo.name.replace(".png", "").split('_');
                        py = pinyin(parts[parts.length - 1], { style: pinyin.STYLE_NORMAL, heteronym: false }).map(function (item, i) {
                            return item[0];
                        });
                        name = "";
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context.prev = 36;

                        for (_iterator3 = py[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            p = _step3.value;

                            name += p;
                        }
                        _context.next = 44;
                        break;

                    case 40:
                        _context.prev = 40;
                        _context.t0 = _context['catch'](36);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context.t0;

                    case 44:
                        _context.prev = 44;
                        _context.prev = 45;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 47:
                        _context.prev = 47;

                        if (!_didIteratorError3) {
                            _context.next = 50;
                            break;
                        }

                        throw _iteratorError3;

                    case 50:
                        return _context.finish(47);

                    case 51:
                        return _context.finish(44);

                    case 52:
                        imgInfo = {
                            id: ~~parts[0],
                            name: name,
                            comment: parts[parts.length - 1],
                            width: layerInfo.width,
                            height: layerInfo.height,
                            pageName: pagename
                        };

                        imgInfo.x = layerInfo.left;
                        imgInfo.y = layerInfo.top;
                        imgInfo.cx = false;
                        imgInfo.cy = false;
                        imgInfo.bottom = false;
                        imgInfo.right = false;
                        imgInfo.alpha = 0;
                        imgInfo.scale = 1;
                        imgInfo.per = 1;
                        imgInfo.bk = false;
                        imgInfo.bf = false;
                        imgInfo.backcolor = "'transparent'";
                        i = 1;

                    case 66:
                        if (!(i < parts.length - 1)) {
                            _context.next = 86;
                            break;
                        }

                        p = parts[i];

                        if (!(p == null)) {
                            _context.next = 70;
                            break;
                        }

                        return _context.abrupt('continue', 83);

                    case 70:
                        if (p == "b") {
                            imgInfo.bottom = true;
                            imgInfo.y = layerInfo.bottom - docHeight;
                        }
                        if (p == "x") {
                            imgInfo.cx = true;
                            imgInfo.x = (layerInfo.left + layerInfo.right) / 2 - 750 / 2;
                        }
                        if (p == "y") {
                            imgInfo.cy = true;
                            //console.log(layerInfo)
                            //console.log((layerInfo.top + layerInfo.bottom)/2)
                            imgInfo.y = (layerInfo.top + layerInfo.bottom) / 2 - docHeight / 2;
                            //console.log(imgInfo)
                        }
                        if (p == "r") {
                            imgInfo.right = true;
                            imgInfo.x = layerInfo.right - 750;
                        }
                        if (p == "bt") {
                            imgInfo.button = true;
                        }
                        if (p == "bk") {
                            imgInfo.bk = true;
                        }
                        if (p == "bf") {
                            imgInfo.bf = true;
                        }
                        if (p == "f") {
                            imgInfo.full = true;
                        }
                        if (p == "g") {
                            imgInfo.global = true;
                        }
                        if (p.indexOf("animate") >= 0) {
                            ps = p.split('(')[1].split(')')[0].split('-');

                            if (ps.length > 1) animation[0].d = ~~ps[1];
                            if (ps.length > 2) animation[0].i = ~~ps[2];
                            if (ps.length > 0) animation[0].t = '\'' + ps[0] + '\'';
                            if (ps.length > 3) if (ps[3] == "infinite") {
                                animation[0].infinite = true;
                            }
                        }
                        imgInfo.animation = animation;
                        if (p.indexOf("code") >= 0) {
                            ps = p.split('(')[1].split(')')[0].split('~~~~');

                            if (ps.length > 0) {
                                code.codeType = ps[0];
                            }
                            if (ps.length > 1) {
                                code.code = ps[1];
                            }
                        }
                        imgInfo.code = code;

                    case 83:
                        i++;
                        _context.next = 66;
                        break;

                    case 86:
                        if (!imgInfo.bk) {
                            _context.next = 96;
                            break;
                        }

                        deleteFolder("cltmp");
                        if (!_fs2.default.existsSync("cltmp")) {
                            _fs2.default.mkdirSync("cltmp");
                        }
                        _context.next = 91;
                        return layer.saveAsPng("cltmp/" + "bk.png");

                    case 91:
                        _context.next = 93;
                        return new Promise(function (resolve) {
                            getColors("cltmp/" + "bk.png").then(function (colors) {
                                colors = colors.map(function (color) {
                                    return color.hex();
                                });
                                var index = ~~(colors.length / 2);
                                resolve(colors[index]);
                            });
                        });

                    case 93:
                        pageBackground = _context.sent;

                        deleteFolder("cltmp");
                        return _context.abrupt('continue', 108);

                    case 96:
                        if (!imgInfo.global) {
                            _context.next = 103;
                            break;
                        }

                        _context.next = 99;
                        return layer.saveAsPng("sources/" + "global-" + imgInfo.name + ".png");

                    case 99:
                        imgInfo.fileName = "global-" + imgInfo.name + ".png";
                        if (!globaled.has(imgInfo.fileName)) {
                            globaled.set(imgInfo.fileName, "added");
                            packages.push({ n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height });
                        }

                        _context.next = 107;
                        break;

                    case 103:
                        _context.next = 105;
                        return layer.saveAsPng("sources/" + pagename + "-" + imgInfo.name + ".png");

                    case 105:
                        imgInfo.fileName = pagename + "-" + imgInfo.name + ".png";
                        packages.push({ n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height });

                    case 107:
                        imgs.push(imgInfo);

                    case 108:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 23;
                        break;

                    case 111:
                        _context.next = 117;
                        break;

                    case 113:
                        _context.prev = 113;
                        _context.t1 = _context['catch'](21);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t1;

                    case 117:
                        _context.prev = 117;
                        _context.prev = 118;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 120:
                        _context.prev = 120;

                        if (!_didIteratorError2) {
                            _context.next = 123;
                            break;
                        }

                        throw _iteratorError2;

                    case 123:
                        return _context.finish(120);

                    case 124:
                        return _context.finish(117);

                    case 125:
                        //console.log(pageBackground);
                        pages.push({
                            pageName: pagename,
                            images: _lodash2.default.reverse(imgs),
                            bk: pageBackground
                        });

                    case 126:
                        _iteratorNormalCompletion = true;
                        _context.next = 9;
                        break;

                    case 129:
                        _context.next = 135;
                        break;

                    case 131:
                        _context.prev = 131;
                        _context.t2 = _context['catch'](7);
                        _didIteratorError = true;
                        _iteratorError = _context.t2;

                    case 135:
                        _context.prev = 135;
                        _context.prev = 136;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 138:
                        _context.prev = 138;

                        if (!_didIteratorError) {
                            _context.next = 141;
                            break;
                        }

                        throw _iteratorError;

                    case 141:
                        return _context.finish(138);

                    case 142:
                        return _context.finish(135);

                    case 143:
                        _fs2.default.writeFileSync("pages.json", JSON.stringify(pages));
                        console.log("Files Cutted");
                        //var packagesjsFileContent = "var files = " + JSON.stringify(packages);
                        //console.log(packagesjsFileContent)
                        imagemin(['sources/*.{jpg,png}'], 'sources', {
                            plugins: [imageminOptipng()]
                        }).then(function (files) {
                            console.log("Files Compressed");
                            sources();
                            //fs.writeFileSync("packages.js", packagesjsFileContent);
                        });
                        codes();
                        framework();

                    case 148:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[7, 131, 135, 143], [21, 113, 117, 125], [36, 40, 44, 52], [45,, 47, 51], [118,, 120, 124], [136,, 138, 142]]);
    }));

    return function parse(_x) {
        return _ref.apply(this, arguments);
    };
}();

exports.sources = sources;
exports.codes = codes;
exports.framework = framework;
exports.clean = clean;

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _psd = require('psd');

var PSD = _interopRequireWildcard(_psd);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pinyin = require('pinyin');
var sizeOf = require('image-size');
var imagemin = require('imagemin');
var request = require('request');
var unzip = require('unzip');
var https = require('https');
var AdmZip = require('adm-zip');
var beautify = require('js-beautify').js_beautify;
var copydir = require('copy-dir');
var getColors = require('get-image-colors');
var imageminOptipng = require('imagemin-optipng');

var deleteFolder = module.exports.deleteFolder = function (path) {
    var files = [];
    if (_fs2.default.existsSync(path)) {
        files = _fs2.default.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (_fs2.default.statSync(curPath).isDirectory()) {
                // recurse
                deleteFolder(curPath);
            } else {
                // delete file
                _fs2.default.unlinkSync(curPath);
            }
        });
        _fs2.default.rmdirSync(path);
    }
};
var deleteFile = function deleteFile(path) {
    if (_fs2.default.existsSync(path)) {
        _fs2.default.unlinkSync(path);
    }
};
function sources() {
    var packages = [];
    var files = _glob2.default.sync("sources/*.{jpg,png}");
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var file = _step4.value;

            var size = sizeOf(file);
            packages.push({ n: file.replace("sources/", ""), w: size.width, h: size.height });
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    var packagesjsFileContent = "var files = " + JSON.stringify(packages);
    _fs2.default.writeFileSync("packages.js", packagesjsFileContent);
    console.log("Arrange packages file complete");
}
function codes(pagename) {
    if (pagename && pagename.length == null) {
        pagename = null;
    }
    var jsonfile = "./pages.json";
    var json = _fs2.default.readFileSync(jsonfile, 'utf-8');
    var pages = JSON.parse(json);
    var screens = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = pages[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var page = _step5.value;

            var pageType = page.pageName.indexOf("page") >= 0 ? 'page' : 'widget';
            screens.push({
                page: 'views/' + page.pageName + '.html',
                id: '' + page.pageName,
                controller: 'controllers/' + page.pageName + '.js',
                start: false,
                type: pageType
            });
            if (pagename) {
                if (pagename != page.pageName) {
                    continue;
                }
            }
            var html = "";
            var js = "";
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = page.images[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var img = _step6.value;

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
                    html += '    <!-- ' + img.comment + ' -->\n';
                    if (!img.bf) {
                        html += '    <img src="sources/' + img.fileName + '" \n        position="' + JSON.stringify(position).replace(/\"/g, "") + '" \n        ani="' + JSON.stringify(ani).replace(/\"/g, "") + '"\n        class="' + img.name + '"\n        id="' + page.pageName + '-' + img.name + '"\n        />\n';
                    } else {
                        html += '    <div style="background-image: url(\'sources/' + img.fileName + '\');background-size: cover;background-position: center" \n        position="{width:window.innerWidth, height:window.innerHeight}" \n        ani="' + JSON.stringify(ani).replace(/\"/g, "") + '"\n        class="' + img.name + '"\n        id="' + page.pageName + '-' + img.name + '"\n        ></div>\n';
                    }
                    var customJS = "";
                    if (img.code) {
                        switch (img.code.codeType) {
                            case "custom":
                                customJS = img.code.code;
                                break;
                            case "open":
                                customJS = 'KSApp.widget.show(\'' + img.code.code + '\')';
                                break;
                            case "close":
                                customJS = 'KSApp.widget.hide(\'' + img.code.code + '\')';
                                break;
                            case "jump":
                                customJS = 'KSApp.pageService.gotoPage(' + img.code.code + ')';
                                break;
                        }
                    }
                    if (img.button) {
                        js += '//' + img.comment + ' \u70B9\u51FB\u4E8B\u4EF6\n';
                        js += '        KSApp.tools.on("#' + page.pageName + '-' + img.name + '","touchstart", function(){\n                ' + customJS + '\n        });\n';
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            var viewStr = '<div id="' + page.pageName + '" class="full" style="background-color: ' + page.bk + '">\n' + html + ' \n</div>';
            if (pageType == "widget") {
                js += '        KSApp.' + page.pageName + ' = this;';
            }
            var jsStr = 'var ' + page.pageName + ' = function () {\n    this.load = function () {\n        ' + js + '\n        KSApp.swipeup = function () {\n            \n        };\n        KSApp.swipedown = function () {\n            \n        };\n    };\n};';
            jsStr = beautify(jsStr);
            if (!_fs2.default.existsSync("views")) {
                _fs2.default.mkdirSync("views/");
            }

            if (!_fs2.default.existsSync("controllers")) {
                _fs2.default.mkdirSync("controllers/");
            }
            if (!_fs2.default.existsSync('controllers/' + page.pageName + '.js')) {
                _fs2.default.writeFileSync('controllers/' + page.pageName + '.js', jsStr);
            }
            _fs2.default.writeFileSync('views/' + page.pageName + '.html', viewStr);
            //console.log(viewStr);
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    screens[0].start = true;
    var screenStr = ('var screens = ' + JSON.stringify(screens)).replace(/{/g, "\n{");
    _fs2.default.writeFileSync("screens.js", screenStr);
}

function framework() {
    deleteFolder("tmp");
    if (!_fs2.default.existsSync("tmp")) {
        _fs2.default.mkdirSync("tmp");
    }
    var tmpFilePath = 'tmp/framework.zip';
    https.get("https://coding.net/u/kesyn/p/positional/git/archive/master", function (response) {
        response.on('data', function (data) {
            _fs2.default.appendFileSync(tmpFilePath, data);
        });
        response.on('end', function () {
            var zip = new AdmZip(tmpFilePath);
            zip.extractAllTo("tmp/");
            console.log("extracted");
            setTimeout(function () {
                copydir('tmp/positional-master/', './', function () {
                    return true;
                    //console.log("copy complete")
                }, function () {
                    console.log("copy complete");
                    deleteFolder("tmp");
                });
            }, 2000);

            //fs.unlink(tmpFilePath)
        });
    });
}

function clean() {
    deleteFolder("controllers");
    deleteFolder("css");
    deleteFolder("js");
    deleteFolder("sources");
    deleteFolder("views");
    deleteFolder("dist");
    deleteFile("cache.appcache");
    deleteFile("gulpfile.babel.js");
    deleteFile("index.html");
    deleteFile("package.json");
    deleteFile("packages.js");
    deleteFile("pages.json");
    deleteFile("README.md");
    deleteFile("screens.js");
    deleteFile(".gitignore");
    deleteFile(".babelrc");
}