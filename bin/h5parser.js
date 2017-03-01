/**
 * Created by zhangtong from KESYN SOFTWARE on 2017/3/1.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = parse;
exports.sources = sources;

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
function parse(dir) {
    var files = _glob2.default.sync(dir);
    var packages = [];
    var globaled = new Map();
    var pages = [];
    // deleteFolder("tmp");
    // if(!fs.existsSync("tmp")){
    //     fs.mkdirSync("tmp");
    // }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            var pagename = file.replace("psd/", "").replace(".psd", "");
            if (!_fs2.default.existsSync("sources")) {
                _fs2.default.mkdirSync("sources/");
            }
            var psd = PSD.fromFile(file);
            psd.parse();
            // console.log(psd.tree().export());
            // console.log(psd.tree().export().children[0].image)
            var imgs = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = psd.tree().descendants()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var layer = _step2.value;

                    //console.log(layer.export());
                    var layerInfo = layer.export();

                    var parts = layerInfo.name.replace(".png", "").split('_');
                    var py = pinyin(parts[parts.length - 1], { style: pinyin.STYLE_NORMAL, heteronym: false }).map(function (item, i) {
                        return item[0];
                    });
                    var name = "";
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = py[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var p = _step3.value;

                            name += p;
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    var imgInfo = {
                        id: ~~parts[0],
                        name: name,
                        comment: parts[parts.length - 1],
                        width: layerInfo.width,
                        height: layerInfo.height,
                        pageName: pagename
                    };
                    imgInfo.x = layerInfo.left;
                    imgInfo.y = layerInfo.top;
                    for (var i = 1; i < parts.length - 1; i++) {
                        var p = parts[i];

                        if (p == "b") {
                            imgInfo.bottom = true;
                            imgInfo.y = layerInfo.bottom - 1334;
                        }
                        if (p == "x") {
                            imgInfo.cx = true;
                            imgInfo.x = (layerInfo.left + layerInfo.right) / 2 - 750 / 2;
                        }
                        if (p == "y") {
                            imgInfo.cy = true;
                            //console.log(layerInfo)
                            //console.log((layerInfo.top + layerInfo.bottom)/2)
                            imgInfo.y = (layerInfo.top + layerInfo.bottom) / 2 - 1334 / 2;
                            //console.log(imgInfo)
                        }
                        if (p == "r") {
                            imgInfo.right = true;
                            imgInfo.x = layerInfo.right - 750;
                        }
                        if (p == "bt") {
                            imgInfo.button = true;
                        }
                        if (p == "f") {
                            imgInfo.full = true;
                        }
                        if (p == "g") {
                            imgInfo.global = true;
                        }
                    }

                    if (imgInfo.global) {
                        layer.saveAsPng("sources/" + "global-" + imgInfo.name + ".png");
                        imgInfo.fileName = "global-" + imgInfo.name + ".png";
                        if (!globaled.has(imgInfo.fileName)) {
                            globaled.set(imgInfo.fileName, "added");
                            packages.push({ n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height });
                        }
                    } else {
                        layer.saveAsPng("sources/" + pagename + "-" + imgInfo.name + ".png");
                        imgInfo.fileName = pagename + "-" + imgInfo.name + ".png";
                        packages.push({ n: imgInfo.fileName, w: imgInfo.width, h: imgInfo.height });
                    }
                    imgs.push(imgInfo);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            pages.push({
                pageName: pagename,
                images: _lodash2.default.reverse(imgs)
            });
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

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
        console.log("packages file complete");
    });
}
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
}