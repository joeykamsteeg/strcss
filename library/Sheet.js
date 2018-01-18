'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var reservedAppliers = ['hover', 'visited', 'active', 'last-child', 'first-child'];

var Sheet = function () {
    function Sheet(strcss) {
        _classCallCheck(this, Sheet);

        this.sheetText = strcss;
        this.sheetRules = this.sheetText.split('\n');
        this.css = '';
        this.map = {};

        this.generateCSS();
        this.applyToDocument();
    }

    _createClass(Sheet, [{
        key: 'generateCSS',
        value: function generateCSS() {
            var _this = this;

            var isScoped = false;
            var isMedia = false;
            var currentScopeUniqueID = '';
            var localVars = [];

            this.sheetRules.map(function (sheetRule) {
                localVars.map(function (localVar) {
                    sheetRule = sheetRule.replace('{' + localVar.key + '}', localVar.value);
                });

                // comment
                if (_this.isLineComment(sheetRule) === true) return;

                // empty lines
                if (_this.getLineShifted(sheetRule).length === 0) return;

                // fontface
                if (_this.isLineFontface(sheetRule) === true && isScoped === false) {
                    _this.css += _this.getLineFontface(sheetRule);
                }

                // var
                else if (_this.isLineVar(sheetRule) === true && isScoped === false) {
                        localVars.push(_this.getLineVar(sheetRule));
                    }

                    // media
                    else if (_this.isLineMedia(sheetRule) === true) {
                            if (isScoped === true) _this.css += ' }';
                            if (isMedia === true) _this.css += ' }';

                            var media = _this.getLineMedia(sheetRule);

                            _this.css += '\n' + media;

                            if (isScoped === true) {
                                _this.css += '';
                                _this.css += '\n.' + currentScopeUniqueID + ' {';
                            }

                            isMedia = true;
                        }

                        // applier
                        else if (_this.isLineApplier(sheetRule) === true && isScoped === true) {
                                var parsedApplier = _this.getParsedApplier(sheetRule);

                                _this.css += ' }';
                                _this.css += '\n.' + currentScopeUniqueID + parsedApplier + ' {';
                            }

                            // target
                            else if (_this.isLineTarget(sheetRule) === true) {
                                    if (isScoped === true) _this.css += ' }';
                                    if (isMedia === true) {
                                        _this.css += ' }';
                                        isMedia = false;
                                    }

                                    var uniqueID = _this.getUniqueID();
                                    var targetName = _this.getTargetName(sheetRule);

                                    if (typeof _this.map[targetName] !== 'undefined') uniqueID = _this.map[targetName];

                                    currentScopeUniqueID = uniqueID;
                                    isScoped = true;

                                    _this.css += '\n.' + uniqueID + ' { /* ' + targetName + ' */ ';
                                    _this.map[targetName] = uniqueID;
                                }

                                // style
                                else if (isScoped === true) {
                                        var styleKeyValue = _this.getStyleKeyValue(sheetRule);
                                        var parsedStyle = _this.getParsedStyle(styleKeyValue);

                                        _this.css += parsedStyle;
                                    }
            });

            if (isScoped === true) this.css += ' }';
        }
    }, {
        key: 'isLineFontface',
        value: function isLineFontface(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted.substring(0, 5) === 'font ';
        }
    }, {
        key: 'isLineTarget',
        value: function isLineTarget(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted.substring(0, 4) === 'map ';
        }
    }, {
        key: 'isLineApplier',
        value: function isLineApplier(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted.substring(0, 3) === 'on ';
        }
    }, {
        key: 'isLineVar',
        value: function isLineVar(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted.substring(0, 4) === 'var ';
        }
    }, {
        key: 'isLineComment',
        value: function isLineComment(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted[0] === '#';
        }
    }, {
        key: 'isLineMedia',
        value: function isLineMedia(sheetRule) {
            var lineShifted = this.getLineShifted(sheetRule);
            return lineShifted.substring(0, 3) === 'at ';
        }
    }, {
        key: 'getLineVar',
        value: function getLineVar(sheetRule) {
            sheetRule = sheetRule.replace('var ', '');
            var key = this.getLineShifted(sheetRule).split(' ')[0];
            var value = this.getLineShifted(sheetRule.replace(key, ''));
            return { key: key, value: value };
        }
    }, {
        key: 'getLineMedia',
        value: function getLineMedia(sheetRule) {
            var mediaName = this.getLineShifted(this.getLineShifted(sheetRule).replace('at ', ''));
            var media = '@media only screen and ';

            switch (mediaName) {
                case 'mobile':
                    media += '(max-width: 767px)';
                    break;
                case 'tablet':
                    media += '(min-width: 768px) and (max-width: 991px)';
                    break;
                case 'desktop':
                    media += '(min-width: 992px) and (max-width: 1199px)';
                    break;
            }

            media += ' { /* ' + mediaName + ' */';
            return media;
        }
    }, {
        key: 'getParsedApplier',
        value: function getParsedApplier(sheetRule) {
            var applier = this.getLineShifted(this.getLineShifted(sheetRule).replace('on ', ''));
            if (reservedAppliers.includes(applier)) return ':' + applier;
            return '.' + applier;
        }
    }, {
        key: 'getTargetName',
        value: function getTargetName(sheetRules) {
            return this.getLineShifted(sheetRules).replace('map ', '');
        }
    }, {
        key: 'getLineShifted',
        value: function getLineShifted(sheetRules) {
            return sheetRules.slice(sheetRules.search(/\S|$/), sheetRules.length);
        }
    }, {
        key: 'getUniqueID',
        value: function getUniqueID() {
            _index.uniques.push('id');
            var id = '_u';
            for (var i = 0; i < 3; i++) {
                id += '' + Math.random().toString(36).substr(2, 5) + _index.uniques.length * (i + 1);
            }return id + '_';
        }
    }, {
        key: 'getStyleKeyValue',
        value: function getStyleKeyValue(sheetText) {
            var key = this.getLineShifted(sheetText).split(' ')[0];
            var value = this.getLineShifted(sheetText.replace(key, ''));
            return {
                key: key,
                value: value
            };
        }
    }, {
        key: 'getLineFontface',
        value: function getLineFontface(sheetText) {
            var splittedSheetText = this.getLineShifted(sheetText).split(' ');
            if (splittedSheetText.length === 2) {
                return '\n@import url(\'https://fonts.googleapis.com/css?family=' + splittedSheetText[1] + '\');';
            } else if (splittedSheetText.length === 3) {
                return '\n@font-face {\n\tfont-family: \'' + splittedSheetText[1] + '\';\n\tfont-weight: normal;\n\tsrc: url(' + splittedSheetText[2] + '); }';
            } else if (splittedSheetText.length === 4) {
                return '\n@font-face {\n\tfont-family: \'' + splittedSheetText[1] + '\';\n\tfont-weight: ' + splittedSheetText[2] + ';\n\tsrc: url(' + splittedSheetText[3] + '); }';
            }
            return '';
        }
    }, {
        key: 'addNumericEndings',
        value: function addNumericEndings(styleKeyValue, suffix) {
            var parsedString = '';
            var valueSplits = styleKeyValue.value.split(' ');
            valueSplits.map(function (valueSplit) {
                var rgx = /^((\d+)?(\.\d+)?\d)$/g;
                var matches = rgx.exec(valueSplit);

                if (matches !== null) {
                    valueSplit = valueSplit.replace(matches[1], '' + matches[1] + suffix);
                }
                parsedString += valueSplit + ' ';
            });
            styleKeyValue.value = parsedString.substr(0, parsedString.length - 1);
        }
    }, {
        key: 'addSpaceSeperators',
        value: function addSpaceSeperators(styleKeyValue, seperator) {
            var parsedString = '';
            var valueSplits = styleKeyValue.value.split(' ');
            valueSplits.map(function (valueSplit) {
                parsedString += '' + valueSplit + seperator + ' ';
            });
            styleKeyValue.value = parsedString.substr(0, parsedString.length - (seperator.length + 1));
        }
    }, {
        key: 'applyToDocument',
        value: function applyToDocument() {
            if (typeof document === 'undefined ' || typeof window === 'undefined') return;

            console.log(this.css);

            var htmlStyleTag = document.createElement("style");
            htmlStyleTag.type = "text/css";
            htmlStyleTag.innerHTML = this.css;
            document.head.appendChild(htmlStyleTag);
        }
    }, {
        key: 'getParsedStyle',
        value: function getParsedStyle(styleKeyValue) {
            switch (styleKeyValue.key) {
                case 'depth':
                case 'order':
                case 'z-index':
                case 'opacity':
                case 'alpha':
                case 'scale':
                case 'transform':
                case 'flex':
                    break;
                case 'gradient':
                case 'background-image':
                    this.addNumericEndings(styleKeyValue, 'deg');
                    break;
                case 'transition':
                case 'transition-duration':
                case 'animation':
                case 'animation-duration':
                    this.addNumericEndings(styleKeyValue, 's');
                    break;
                case 'font-weight':
                    this.addNumericEndings(styleKeyValue, '');
                    break;
                default:
                    this.addNumericEndings(styleKeyValue, 'px');
                    break;
            }
            switch (styleKeyValue.key) {
                case 'gradient':
                    this.addSpaceSeperators(styleKeyValue, ',');
                    styleKeyValue.key = 'background-image';
                    styleKeyValue.value = 'linear-gradient(' + styleKeyValue.value + ')';
                    break;
                case 'shadow':
                    styleKeyValue.key = 'box-shadow';
                    styleKeyValue.value = '0px 0px ' + styleKeyValue.value + ' rgba(0,0,0,0.5)';
                    break;
                case 'align':
                    styleKeyValue.key = 'display';
                    switch (styleKeyValue.value) {
                        case 'left':
                            styleKeyValue.value = 'block;\n\tmargin-left: 0px;\n\tmargin-right: auto';
                            break;
                        case 'center':
                            styleKeyValue.value = 'block;\n\tmargin-left: auto;\n\tmargin-right: auto';
                            break;
                        case 'right':
                            styleKeyValue.value = 'block;\n\tmargin-left: auto;\n\tmargin-right: 0px';
                            break;
                    }
                    break;
                case 'order':
                    styleKeyValue.key = 'z-index';
                    break;
                case 'font':
                    styleKeyValue.key = 'font-family';
                    styleKeyValue.value = '\'' + styleKeyValue.value + '\', sans';
                    break;
                case 'alpha':
                    styleKeyValue.key = 'opacity';
                    break;
                case 'depth':
                    styleKeyValue.key = 'z-index';
                    break;
                case 'text-color':
                    styleKeyValue.key = 'color';
                    break;
                case 'scale':
                    var scaleSplittedValues = styleKeyValue.value.split(' ');
                    styleKeyValue.key = 'transform';
                    if (scaleSplittedValues.length === 2) styleKeyValue.value = 'scale(' + scaleSplittedValues[0] + ', ' + scaleSplittedValues[1] + ')';else styleKeyValue.value = 'scale(' + styleKeyValue.value + ', ' + styleKeyValue.value + ')';
                    break;
                case 'image':
                    styleKeyValue.value = 'url(' + styleKeyValue.value + ');\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tbackground-size: contain';
                    styleKeyValue.key = 'background-image';
                    break;
                case 'wallpaper':
                    styleKeyValue.value = 'url(' + styleKeyValue.value + ');\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tbackground-size: cover';
                    styleKeyValue.key = 'background-image';
                    break;
                case 'frostblur':
                    styleKeyValue.value = 'blur(' + styleKeyValue.value + ')';
                    styleKeyValue.key = '-webkit-backdrop-filter';
                    break;
                case 'scroll':
                    styleKeyValue.key = 'margin';
                    switch (styleKeyValue.value) {
                        case 'horizontal':
                            styleKeyValue.value = '0px;\n\tpadding: 0px\n\toverflow: auto;\n\toverflow-y: hidden;\n\twhite-space: nowrap;\n\t-webkit-overflow-scrolling: touch';
                            break;
                        case 'vertical':
                            styleKeyValue.value = '0px;\n\tpadding: 0px\n\toverflow: scroll;\n\toverflow-x: hidden;\n\twhite-space: nowrap;\n\t-webkit-overflow-scrolling: touch';
                            break;
                        case 'both':
                            styleKeyValue.value = '0px;\n\tpadding: 0px\n\toverflow: scroll;\n\twhite-space: nowrap;\n\t-webkit-overflow-scrolling: touch';
                            break;
                    }
                    break;
                case 'size':
                    var sizeSplittedValues = styleKeyValue.value.split(' ');
                    styleKeyValue.value = sizeSplittedValues[0] + ';\n\theight: ' + (sizeSplittedValues[1] || sizeSplittedValues[0]);
                    styleKeyValue.key = 'width';
                    break;
                case 'min-size':
                    var minSizeSplittedValues = styleKeyValue.value.split(' ');
                    styleKeyValue.value = minSizeSplittedValues[0] + ';\n\tmin-height: ' + (minSizeSplittedValues[1] || minSizeSplittedValues[0]);
                    styleKeyValue.key = 'min-width';
                    break;
                case 'max-size':
                    var maxSizeSplittedValues = styleKeyValue.value.split(' ');
                    styleKeyValue.value = maxSizeSplittedValues[0] + ';\n\tmax-height: ' + (maxSizeSplittedValues[1] || maxSizeSplittedValues[0]);
                    styleKeyValue.key = 'max-width';
                    break;
                case 'rect':
                    styleKeyValue.key = 'top';
                    if (styleKeyValue.value === 'stretch') {
                        styleKeyValue.value = '0px;\n\tleft: 0px;\n\twidth: 100%;\n\theight: 100%';
                    } else if (styleKeyValue.value === 'fit') {
                        styleKeyValue.value = '0px;\n\tright: 0px;\n\tbottom: 0px;\n\tleft: 0px';
                    } else {
                        var splittedValues = styleKeyValue.value.split(' ');
                        switch (splittedValues.length) {
                            case 1:
                                styleKeyValue.value = splittedValues[0] + ';\n\tright: ' + splittedValues[0] + ';\n\tbottom: ' + splittedValues[0] + ';\n\tleft: ' + splittedValues[0];
                                break;
                            case 2:
                                styleKeyValue.value = splittedValues[0] + ';\n\tright: ' + splittedValues[1] + ';\n\tbottom: ' + splittedValues[0] + ';\n\tleft: ' + splittedValues[1];
                                break;
                            case 3:
                                styleKeyValue.value = splittedValues[0] + ';\n\tright: ' + splittedValues[1] + ';\n\tbottom: ' + splittedValues[2] + ';\n\tleft: ' + splittedValues[1];
                                break;
                            case 4:
                                styleKeyValue.value = splittedValues[0] + ';\n\tright: ' + splittedValues[1] + ';\n\tbottom: ' + splittedValues[2] + ';\n\tleft: ' + splittedValues[3];
                                break;
                        }
                    }
                    break;
            }
            return '\n\t' + styleKeyValue.key + ': ' + styleKeyValue.value + ';';
        }
    }]);

    return Sheet;
}();

exports.default = Sheet;