(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Quagga"] = factory();
	else
		root["Quagga"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 123);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _array_helper = __webpack_require__(4);

var _array_helper2 = _interopRequireDefault(_array_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function BarcodeReader(config, supplements) {
    this._row = [];
    this.config = config || {};
    this.supplements = supplements;
    return this;
}

BarcodeReader.prototype._nextUnset = function (line, start) {
    var i;

    if (start === undefined) {
        start = 0;
    }
    for (i = start; i < line.length; i++) {
        if (!line[i]) {
            return i;
        }
    }
    return line.length;
};

BarcodeReader.prototype._matchPattern = function (counter, code, maxSingleError) {
    var i,
        error = 0,
        singleError = 0,
        sum = 0,
        modulo = 0,
        barWidth,
        count,
        scaled;

    maxSingleError = maxSingleError || this.SINGLE_CODE_ERROR || 1;

    for (i = 0; i < counter.length; i++) {
        sum += counter[i];
        modulo += code[i];
    }
    if (sum < modulo) {
        return Number.MAX_VALUE;
    }
    barWidth = sum / modulo;
    maxSingleError *= barWidth;

    for (i = 0; i < counter.length; i++) {
        count = counter[i];
        scaled = code[i] * barWidth;
        singleError = Math.abs(count - scaled) / scaled;
        if (singleError > maxSingleError) {
            return Number.MAX_VALUE;
        }
        error += singleError;
    }
    return error / modulo;
};

BarcodeReader.prototype._nextSet = function (line, offset) {
    var i;

    offset = offset || 0;
    for (i = offset; i < line.length; i++) {
        if (line[i]) {
            return i;
        }
    }
    return line.length;
};

BarcodeReader.prototype._correctBars = function (counter, correction, indices) {
    var length = indices.length,
        tmp = 0;
    while (length--) {
        tmp = counter[indices[length]] * (1 - (1 - correction) / 2);
        if (tmp > 1) {
            counter[indices[length]] = tmp;
        }
    }
};

BarcodeReader.prototype._matchTrace = function (cmpCounter, epsilon) {
    var counter = [],
        i,
        self = this,
        offset = self._nextSet(self._row),
        isWhite = !self._row[offset],
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0
    },
        error;

    if (cmpCounter) {
        for (i = 0; i < cmpCounter.length; i++) {
            counter.push(0);
        }
        for (i = offset; i < self._row.length; i++) {
            if (self._row[i] ^ isWhite) {
                counter[counterPos]++;
            } else {
                if (counterPos === counter.length - 1) {
                    error = self._matchPattern(counter, cmpCounter);

                    if (error < epsilon) {
                        bestMatch.start = i - offset;
                        bestMatch.end = i;
                        bestMatch.counter = counter;
                        return bestMatch;
                    } else {
                        return null;
                    }
                } else {
                    counterPos++;
                }
                counter[counterPos] = 1;
                isWhite = !isWhite;
            }
        }
    } else {
        counter.push(0);
        for (i = offset; i < self._row.length; i++) {
            if (self._row[i] ^ isWhite) {
                counter[counterPos]++;
            } else {
                counterPos++;
                counter.push(0);
                counter[counterPos] = 1;
                isWhite = !isWhite;
            }
        }
    }

    // if cmpCounter was not given
    bestMatch.start = offset;
    bestMatch.end = self._row.length - 1;
    bestMatch.counter = counter;
    return bestMatch;
};

BarcodeReader.prototype.decodePattern = function (pattern) {
    var self = this,
        result;

    self._row = pattern;
    result = self._decode();
    if (result === null) {
        self._row.reverse();
        result = self._decode();
        if (result) {
            result.direction = BarcodeReader.DIRECTION.REVERSE;
            result.start = self._row.length - result.start;
            result.end = self._row.length - result.end;
        }
    } else {
        result.direction = BarcodeReader.DIRECTION.FORWARD;
    }
    if (result) {
        result.format = self.FORMAT;
    }
    return result;
};

BarcodeReader.prototype._matchRange = function (start, end, value) {
    var i;

    start = start < 0 ? 0 : start;
    for (i = start; i < end; i++) {
        if (this._row[i] !== value) {
            return false;
        }
    }
    return true;
};

BarcodeReader.prototype._fillCounters = function (offset, end, isWhite) {
    var self = this,
        counterPos = 0,
        i,
        counters = [];

    isWhite = typeof isWhite !== 'undefined' ? isWhite : true;
    offset = typeof offset !== 'undefined' ? offset : self._nextUnset(self._row);
    end = end || self._row.length;

    counters[counterPos] = 0;
    for (i = offset; i < end; i++) {
        if (self._row[i] ^ isWhite) {
            counters[counterPos]++;
        } else {
            counterPos++;
            counters[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return counters;
};

BarcodeReader.prototype._toCounters = function (start, counter) {
    var self = this,
        numCounters = counter.length,
        end = self._row.length,
        isWhite = !self._row[start],
        i,
        counterPos = 0;

    _array_helper2.default.init(counter, 0);

    for (i = start; i < end; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            counterPos++;
            if (counterPos === numCounters) {
                break;
            } else {
                counter[counterPos] = 1;
                isWhite = !isWhite;
            }
        }
    }

    return counter;
};

Object.defineProperty(BarcodeReader.prototype, "FORMAT", {
    value: 'unknown',
    writeable: false
});

BarcodeReader.DIRECTION = {
    FORWARD: 1,
    REVERSE: -1
};

BarcodeReader.Exception = {
    StartNotFoundException: "Start-Info was not found!",
    CodeNotFoundException: "Code could not be found!",
    PatternNotFoundException: "Pattern could not be found!"
};

BarcodeReader.CONFIG_KEYS = {};

exports.default = BarcodeReader;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _merge2 = __webpack_require__(36);

var _merge3 = _interopRequireDefault(_merge2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EANReader(opts, supplements) {
    opts = (0, _merge3.default)(getDefaulConfig(), opts);
    _barcode_reader2.default.call(this, opts, supplements);
}

function getDefaulConfig() {
    var config = {};

    Object.keys(EANReader.CONFIG_KEYS).forEach(function (key) {
        config[key] = EANReader.CONFIG_KEYS[key].default;
    });
    return config;
}

var properties = {
    CODE_L_START: { value: 0 },
    CODE_G_START: { value: 10 },
    START_PATTERN: { value: [1, 1, 1] },
    STOP_PATTERN: { value: [1, 1, 1] },
    MIDDLE_PATTERN: { value: [1, 1, 1, 1, 1] },
    EXTENSION_START_PATTERN: { value: [1, 1, 2] },
    CODE_PATTERN: { value: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2], [1, 1, 2, 3], [1, 2, 2, 2], [2, 2, 1, 2], [1, 1, 4, 1], [2, 3, 1, 1], [1, 3, 2, 1], [4, 1, 1, 1], [2, 1, 3, 1], [3, 1, 2, 1], [2, 1, 1, 3]] },
    CODE_FREQUENCY: { value: [0, 11, 13, 14, 19, 25, 28, 21, 22, 26] },
    SINGLE_CODE_ERROR: { value: 0.70 },
    AVG_CODE_ERROR: { value: 0.48 },
    FORMAT: { value: "ean_13", writeable: false }
};

EANReader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
EANReader.prototype.constructor = EANReader;

EANReader.prototype._decodeCode = function (start, coderange) {
    var counter = [0, 0, 0, 0],
        i,
        self = this,
        offset = start,
        isWhite = !self._row[offset],
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: start,
        end: start
    },
        code,
        error;

    if (!coderange) {
        coderange = self.CODE_PATTERN.length;
    }

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                for (code = 0; code < coderange; code++) {
                    error = self._matchPattern(counter, self.CODE_PATTERN[code]);
                    if (error < bestMatch.error) {
                        bestMatch.code = code;
                        bestMatch.error = error;
                    }
                }
                bestMatch.end = i;
                if (bestMatch.error > self.AVG_CODE_ERROR) {
                    return null;
                }
                return bestMatch;
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

EANReader.prototype._findPattern = function (pattern, offset, isWhite, tryHarder, epsilon) {
    var counter = [],
        self = this,
        i,
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0
    },
        error,
        j,
        sum;

    if (!offset) {
        offset = self._nextSet(self._row);
    }

    if (isWhite === undefined) {
        isWhite = false;
    }

    if (tryHarder === undefined) {
        tryHarder = true;
    }

    if (epsilon === undefined) {
        epsilon = self.AVG_CODE_ERROR;
    }

    for (i = 0; i < pattern.length; i++) {
        counter[i] = 0;
    }

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                sum = 0;
                for (j = 0; j < counter.length; j++) {
                    sum += counter[j];
                }
                error = self._matchPattern(counter, pattern);

                if (error < epsilon) {
                    bestMatch.error = error;
                    bestMatch.start = i - sum;
                    bestMatch.end = i;
                    return bestMatch;
                }
                if (tryHarder) {
                    for (j = 0; j < counter.length - 2; j++) {
                        counter[j] = counter[j + 2];
                    }
                    counter[counter.length - 2] = 0;
                    counter[counter.length - 1] = 0;
                    counterPos--;
                } else {
                    return null;
                }
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

EANReader.prototype._findStart = function () {
    var self = this,
        leadingWhitespaceStart,
        offset = self._nextSet(self._row),
        startInfo;

    while (!startInfo) {
        startInfo = self._findPattern(self.START_PATTERN, offset);
        if (!startInfo) {
            return null;
        }
        leadingWhitespaceStart = startInfo.start - (startInfo.end - startInfo.start);
        if (leadingWhitespaceStart >= 0) {
            if (self._matchRange(leadingWhitespaceStart, startInfo.start, 0)) {
                return startInfo;
            }
        }
        offset = startInfo.end;
        startInfo = null;
    }
};

EANReader.prototype._verifyTrailingWhitespace = function (endInfo) {
    var self = this,
        trailingWhitespaceEnd;

    trailingWhitespaceEnd = endInfo.end + (endInfo.end - endInfo.start);
    if (trailingWhitespaceEnd < self._row.length) {
        if (self._matchRange(endInfo.end, trailingWhitespaceEnd, 0)) {
            return endInfo;
        }
    }
    return null;
};

EANReader.prototype._findEnd = function (offset, isWhite) {
    var self = this,
        endInfo = self._findPattern(self.STOP_PATTERN, offset, isWhite, false);

    return endInfo !== null ? self._verifyTrailingWhitespace(endInfo) : null;
};

EANReader.prototype._calculateFirstDigit = function (codeFrequency) {
    var i,
        self = this;

    for (i = 0; i < self.CODE_FREQUENCY.length; i++) {
        if (codeFrequency === self.CODE_FREQUENCY[i]) {
            return i;
        }
    }
    return null;
};

EANReader.prototype._decodePayload = function (code, result, decodedCodes) {
    var i,
        self = this,
        codeFrequency = 0x0,
        firstDigit;

    for (i = 0; i < 6; i++) {
        code = self._decodeCode(code.end);
        if (!code) {
            return null;
        }
        if (code.code >= self.CODE_G_START) {
            code.code = code.code - self.CODE_G_START;
            codeFrequency |= 1 << 5 - i;
        } else {
            codeFrequency |= 0 << 5 - i;
        }
        result.push(code.code);
        decodedCodes.push(code);
    }

    firstDigit = self._calculateFirstDigit(codeFrequency);
    if (firstDigit === null) {
        return null;
    }
    result.unshift(firstDigit);

    code = self._findPattern(self.MIDDLE_PATTERN, code.end, true, false);
    if (code === null) {
        return null;
    }
    decodedCodes.push(code);

    for (i = 0; i < 6; i++) {
        code = self._decodeCode(code.end, self.CODE_G_START);
        if (!code) {
            return null;
        }
        decodedCodes.push(code);
        result.push(code.code);
    }

    return code;
};

EANReader.prototype._decode = function () {
    var startInfo,
        self = this,
        code,
        result = [],
        decodedCodes = [],
        resultInfo = {};

    startInfo = self._findStart();
    if (!startInfo) {
        return null;
    }
    code = {
        code: startInfo.code,
        start: startInfo.start,
        end: startInfo.end
    };
    decodedCodes.push(code);
    code = self._decodePayload(code, result, decodedCodes);
    if (!code) {
        return null;
    }
    code = self._findEnd(code.end, false);
    if (!code) {
        return null;
    }

    decodedCodes.push(code);

    // Checksum
    if (!self._checksum(result)) {
        return null;
    }

    if (this.supplements.length > 0) {
        var ext = this._decodeExtensions(code.end);
        if (!ext) {
            return null;
        }
        var lastCode = ext.decodedCodes[ext.decodedCodes.length - 1],
            endInfo = {
            start: lastCode.start + ((lastCode.end - lastCode.start) / 2 | 0),
            end: lastCode.end
        };
        if (!self._verifyTrailingWhitespace(endInfo)) {
            return null;
        }
        resultInfo = {
            supplement: ext,
            code: result.join("") + ext.code
        };
    }

    return _extends({
        code: result.join(""),
        start: startInfo.start,
        end: code.end,
        codeset: "",
        startInfo: startInfo,
        decodedCodes: decodedCodes
    }, resultInfo);
};

EANReader.prototype._decodeExtensions = function (offset) {
    var i,
        start = this._nextSet(this._row, offset),
        startInfo = this._findPattern(this.EXTENSION_START_PATTERN, start, false, false),
        result;

    if (startInfo === null) {
        return null;
    }

    for (i = 0; i < this.supplements.length; i++) {
        result = this.supplements[i].decode(this._row, startInfo.end);
        if (result !== null) {
            return {
                code: result.code,
                start: start,
                startInfo: startInfo,
                end: result.end,
                codeset: "",
                decodedCodes: result.decodedCodes
            };
        }
    }
    return null;
};

EANReader.prototype._checksum = function (result) {
    var sum = 0,
        i;

    for (i = result.length - 2; i >= 0; i -= 2) {
        sum += result[i];
    }
    sum *= 3;
    for (i = result.length - 1; i >= 0; i -= 2) {
        sum += result[i];
    }
    return sum % 10 === 0;
};

EANReader.CONFIG_KEYS = {
    supplements: {
        'type': 'arrayOf(string)',
        'default': [],
        'description': 'Allowed extensions to be decoded (2 and/or 5)'
    }
};

exports.default = EANReader;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(24);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.default = {
    init: function init(arr, val) {
        var l = arr.length;
        while (l--) {
            arr[l] = val;
        }
    },

    /**
     * Shuffles the content of an array
     * @return {Array} the array itself shuffled
     */
    shuffle: function shuffle(arr) {
        var i = arr.length - 1,
            j,
            x;
        for (i; i >= 0; i--) {
            j = Math.floor(Math.random() * i);
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    },

    toPointList: function toPointList(arr) {
        var i,
            j,
            row = [],
            rows = [];
        for (i = 0; i < arr.length; i++) {
            row = [];
            for (j = 0; j < arr[i].length; j++) {
                row[j] = arr[i][j];
            }
            rows[i] = "[" + row.join(",") + "]";
        }
        return "[" + rows.join(",\r\n") + "]";
    },

    /**
     * returns the elements which's score is bigger than the threshold
     * @return {Array} the reduced array
     */
    threshold: function threshold(arr, _threshold, scoreFunc) {
        var i,
            queue = [];
        for (i = 0; i < arr.length; i++) {
            if (scoreFunc.apply(arr, [arr[i]]) >= _threshold) {
                queue.push(arr[i]);
            }
        }
        return queue;
    },

    maxIndex: function maxIndex(arr) {
        var i,
            max = 0;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] > arr[max]) {
                max = i;
            }
        }
        return max;
    },

    max: function max(arr) {
        var i,
            max = 0;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    },

    sum: function sum(arr) {
        var length = arr.length,
            sum = 0;

        while (length--) {
            sum += arr[length];
        }
        return sum;
    }
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = clone

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
function clone(a) {
    var out = new Float32Array(2)
    out[0] = a[0]
    out[1] = a[1]
    return out
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(94),
    listCacheDelete = __webpack_require__(95),
    listCacheGet = __webpack_require__(96),
    listCacheHas = __webpack_require__(97),
    listCacheSet = __webpack_require__(98);

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(12);

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(21),
    getRawTag = __webpack_require__(83),
    objectToString = __webpack_require__(106);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(92);

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(14);

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(23);

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(66),
    getValue = __webpack_require__(84);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(16),
    isLength = __webpack_require__(33);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(9),
    isObject = __webpack_require__(1);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _subImage = __webpack_require__(40);

var _subImage2 = _interopRequireDefault(_subImage);

var _cv_utils = __webpack_require__(39);

var _array_helper = __webpack_require__(4);

var _array_helper2 = _interopRequireDefault(_array_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vec2 = {
    clone: __webpack_require__(6)
};

/**
 * Represents a basic image combining the data and size.
 * In addition, some methods for manipulation are contained.
 * @param size {x,y} The size of the image in pixel
 * @param data {Array} If given, a flat array containing the pixel data
 * @param ArrayType {Type} If given, the desired DataType of the Array (may be typed/non-typed)
 * @param initialize {Boolean} Indicating if the array should be initialized on creation.
 * @returns {ImageWrapper}
 */
function ImageWrapper(size, data, ArrayType, initialize) {
    if (!data) {
        if (ArrayType) {
            this.data = new ArrayType(size.x * size.y);
            if (ArrayType === Array && initialize) {
                _array_helper2.default.init(this.data, 0);
            }
        } else {
            this.data = new Uint8Array(size.x * size.y);
            if (Uint8Array === Array && initialize) {
                _array_helper2.default.init(this.data, 0);
            }
        }
    } else {
        this.data = data;
    }
    this.size = size;
}

/**
 * tests if a position is within the image with a given offset
 * @param imgRef {x, y} The location to test
 * @param border Number the padding value in pixel
 * @returns {Boolean} true if location inside the image's border, false otherwise
 * @see cvd/image.h
 */
ImageWrapper.prototype.inImageWithBorder = function (imgRef, border) {
    return imgRef.x >= border && imgRef.y >= border && imgRef.x < this.size.x - border && imgRef.y < this.size.y - border;
};

/**
 * Performs bilinear sampling
 * @param inImg Image to extract sample from
 * @param x the x-coordinate
 * @param y the y-coordinate
 * @returns the sampled value
 * @see cvd/vision.h
 */
ImageWrapper.sample = function (inImg, x, y) {
    var lx = Math.floor(x);
    var ly = Math.floor(y);
    var w = inImg.size.x;
    var base = ly * inImg.size.x + lx;
    var a = inImg.data[base + 0];
    var b = inImg.data[base + 1];
    var c = inImg.data[base + w];
    var d = inImg.data[base + w + 1];
    var e = a - b;
    x -= lx;
    y -= ly;

    var result = Math.floor(x * (y * (e - c + d) - e) + y * (c - a) + a);
    return result;
};

/**
 * Initializes a given array. Sets each element to zero.
 * @param array {Array} The array to initialize
 */
ImageWrapper.clearArray = function (array) {
    var l = array.length;
    while (l--) {
        array[l] = 0;
    }
};

/**
 * Creates a {SubImage} from the current image ({this}).
 * @param from {ImageRef} The position where to start the {SubImage} from. (top-left corner)
 * @param size {ImageRef} The size of the resulting image
 * @returns {SubImage} A shared part of the original image
 */
ImageWrapper.prototype.subImage = function (from, size) {
    return new _subImage2.default(from, size, this);
};

/**
 * Creates an {ImageWrapper) and copies the needed underlying image-data area
 * @param imageWrapper {ImageWrapper} The target {ImageWrapper} where the data should be copied
 * @param from {ImageRef} The location where to copy from (top-left location)
 */
ImageWrapper.prototype.subImageAsCopy = function (imageWrapper, from) {
    var sizeY = imageWrapper.size.y,
        sizeX = imageWrapper.size.x;
    var x, y;
    for (x = 0; x < sizeX; x++) {
        for (y = 0; y < sizeY; y++) {
            imageWrapper.data[y * sizeX + x] = this.data[(from.y + y) * this.size.x + from.x + x];
        }
    }
};

ImageWrapper.prototype.copyTo = function (imageWrapper) {
    var length = this.data.length,
        srcData = this.data,
        dstData = imageWrapper.data;

    while (length--) {
        dstData[length] = srcData[length];
    }
};

/**
 * Retrieves a given pixel position from the image
 * @param x {Number} The x-position
 * @param y {Number} The y-position
 * @returns {Number} The grayscale value at the pixel-position
 */
ImageWrapper.prototype.get = function (x, y) {
    return this.data[y * this.size.x + x];
};

/**
 * Retrieves a given pixel position from the image
 * @param x {Number} The x-position
 * @param y {Number} The y-position
 * @returns {Number} The grayscale value at the pixel-position
 */
ImageWrapper.prototype.getSafe = function (x, y) {
    var i;

    if (!this.indexMapping) {
        this.indexMapping = {
            x: [],
            y: []
        };
        for (i = 0; i < this.size.x; i++) {
            this.indexMapping.x[i] = i;
            this.indexMapping.x[i + this.size.x] = i;
        }
        for (i = 0; i < this.size.y; i++) {
            this.indexMapping.y[i] = i;
            this.indexMapping.y[i + this.size.y] = i;
        }
    }
    return this.data[this.indexMapping.y[y + this.size.y] * this.size.x + this.indexMapping.x[x + this.size.x]];
};

/**
 * Sets a given pixel position in the image
 * @param x {Number} The x-position
 * @param y {Number} The y-position
 * @param value {Number} The grayscale value to set
 * @returns {ImageWrapper} The Image itself (for possible chaining)
 */
ImageWrapper.prototype.set = function (x, y, value) {
    this.data[y * this.size.x + x] = value;
    return this;
};

/**
 * Sets the border of the image (1 pixel) to zero
 */
ImageWrapper.prototype.zeroBorder = function () {
    var i,
        width = this.size.x,
        height = this.size.y,
        data = this.data;
    for (i = 0; i < width; i++) {
        data[i] = data[(height - 1) * width + i] = 0;
    }
    for (i = 1; i < height - 1; i++) {
        data[i * width] = data[i * width + (width - 1)] = 0;
    }
};

/**
 * Inverts a binary image in place
 */
ImageWrapper.prototype.invert = function () {
    var data = this.data,
        length = data.length;

    while (length--) {
        data[length] = data[length] ? 0 : 1;
    }
};

ImageWrapper.prototype.convolve = function (kernel) {
    var x,
        y,
        kx,
        ky,
        kSize = kernel.length / 2 | 0,
        accu = 0;
    for (y = 0; y < this.size.y; y++) {
        for (x = 0; x < this.size.x; x++) {
            accu = 0;
            for (ky = -kSize; ky <= kSize; ky++) {
                for (kx = -kSize; kx <= kSize; kx++) {
                    accu += kernel[ky + kSize][kx + kSize] * this.getSafe(x + kx, y + ky);
                }
            }
            this.data[y * this.size.x + x] = accu;
        }
    }
};

ImageWrapper.prototype.moments = function (labelcount) {
    var data = this.data,
        x,
        y,
        height = this.size.y,
        width = this.size.x,
        val,
        ysq,
        labelsum = [],
        i,
        label,
        mu11,
        mu02,
        mu20,
        x_,
        y_,
        tmp,
        result = [],
        PI = Math.PI,
        PI_4 = PI / 4;

    if (labelcount <= 0) {
        return result;
    }

    for (i = 0; i < labelcount; i++) {
        labelsum[i] = {
            m00: 0,
            m01: 0,
            m10: 0,
            m11: 0,
            m02: 0,
            m20: 0,
            theta: 0,
            rad: 0
        };
    }

    for (y = 0; y < height; y++) {
        ysq = y * y;
        for (x = 0; x < width; x++) {
            val = data[y * width + x];
            if (val > 0) {
                label = labelsum[val - 1];
                label.m00 += 1;
                label.m01 += y;
                label.m10 += x;
                label.m11 += x * y;
                label.m02 += ysq;
                label.m20 += x * x;
            }
        }
    }

    for (i = 0; i < labelcount; i++) {
        label = labelsum[i];
        if (!isNaN(label.m00) && label.m00 !== 0) {
            x_ = label.m10 / label.m00;
            y_ = label.m01 / label.m00;
            mu11 = label.m11 / label.m00 - x_ * y_;
            mu02 = label.m02 / label.m00 - y_ * y_;
            mu20 = label.m20 / label.m00 - x_ * x_;
            tmp = (mu02 - mu20) / (2 * mu11);
            tmp = 0.5 * Math.atan(tmp) + (mu11 >= 0 ? PI_4 : -PI_4) + PI;
            label.theta = (tmp * 180 / PI + 90) % 180 - 90;
            if (label.theta < 0) {
                label.theta += 180;
            }
            label.rad = tmp > PI ? tmp - PI : tmp;
            label.vec = vec2.clone([Math.cos(tmp), Math.sin(tmp)]);
            result.push(label);
        }
    }

    return result;
};

/**
 * Displays the {ImageWrapper} in a given canvas
 * @param canvas {Canvas} The canvas element to write to
 * @param scale {Number} Scale which is applied to each pixel-value
 */
ImageWrapper.prototype.show = function (canvas, scale) {
    var ctx, frame, data, current, pixel, x, y;

    if (!scale) {
        scale = 1.0;
    }
    ctx = canvas.getContext('2d');
    canvas.width = this.size.x;
    canvas.height = this.size.y;
    frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = frame.data;
    current = 0;
    for (y = 0; y < this.size.y; y++) {
        for (x = 0; x < this.size.x; x++) {
            pixel = y * this.size.x + x;
            current = this.get(x, y) * scale;
            data[pixel * 4 + 0] = current;
            data[pixel * 4 + 1] = current;
            data[pixel * 4 + 2] = current;
            data[pixel * 4 + 3] = 255;
        }
    }
    //frame.data = data;
    ctx.putImageData(frame, 0, 0);
};

/**
 * Displays the {SubImage} in a given canvas
 * @param canvas {Canvas} The canvas element to write to
 * @param scale {Number} Scale which is applied to each pixel-value
 */
ImageWrapper.prototype.overlay = function (canvas, scale, from) {
    if (!scale || scale < 0 || scale > 360) {
        scale = 360;
    }
    var hsv = [0, 1, 1];
    var rgb = [0, 0, 0];
    var whiteRgb = [255, 255, 255];
    var blackRgb = [0, 0, 0];
    var result = [];
    var ctx = canvas.getContext('2d');
    var frame = ctx.getImageData(from.x, from.y, this.size.x, this.size.y);
    var data = frame.data;
    var length = this.data.length;
    while (length--) {
        hsv[0] = this.data[length] * scale;
        result = hsv[0] <= 0 ? whiteRgb : hsv[0] >= 360 ? blackRgb : (0, _cv_utils.hsv2rgb)(hsv, rgb);
        data[length * 4 + 0] = result[0];
        data[length * 4 + 1] = result[1];
        data[length * 4 + 2] = result[2];
        data[length * 4 + 3] = 255;
    }
    ctx.putImageData(frame, from.x, from.y);
};

exports.default = ImageWrapper;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

var _array_helper = __webpack_require__(4);

var _array_helper2 = _interopRequireDefault(_array_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Code39Reader() {
    _barcode_reader2.default.call(this);
}

var properties = {
    ALPHABETH_STRING: { value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%" },
    ALPHABET: { value: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 46, 32, 42, 36, 47, 43, 37] },
    CHARACTER_ENCODINGS: { value: [0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064, 0x109, 0x049, 0x148, 0x019, 0x118, 0x058, 0x00D, 0x10C, 0x04C, 0x01C, 0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106, 0x046, 0x016, 0x181, 0x0C1, 0x1C0, 0x091, 0x190, 0x0D0, 0x085, 0x184, 0x0C4, 0x094, 0x0A8, 0x0A2, 0x08A, 0x02A] },
    ASTERISK: { value: 0x094 },
    FORMAT: { value: "code_39", writeable: false }
};

Code39Reader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
Code39Reader.prototype.constructor = Code39Reader;

Code39Reader.prototype._decode = function () {
    var self = this,
        counters = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        result = [],
        start = self._findStart(),
        decodedChar,
        lastStart,
        pattern,
        nextStart;

    if (!start) {
        return null;
    }
    nextStart = self._nextSet(self._row, start.end);

    do {
        counters = self._toCounters(nextStart, counters);
        pattern = self._toPattern(counters);
        if (pattern < 0) {
            return null;
        }
        decodedChar = self._patternToChar(pattern);
        if (decodedChar < 0) {
            return null;
        }
        result.push(decodedChar);
        lastStart = nextStart;
        nextStart += _array_helper2.default.sum(counters);
        nextStart = self._nextSet(self._row, nextStart);
    } while (decodedChar !== '*');
    result.pop();

    if (!result.length) {
        return null;
    }

    if (!self._verifyTrailingWhitespace(lastStart, nextStart, counters)) {
        return null;
    }

    return {
        code: result.join(""),
        start: start.start,
        end: nextStart,
        startInfo: start,
        decodedCodes: result
    };
};

Code39Reader.prototype._verifyTrailingWhitespace = function (lastStart, nextStart, counters) {
    var trailingWhitespaceEnd,
        patternSize = _array_helper2.default.sum(counters);

    trailingWhitespaceEnd = nextStart - lastStart - patternSize;
    if (trailingWhitespaceEnd * 3 >= patternSize) {
        return true;
    }
    return false;
};

Code39Reader.prototype._patternToChar = function (pattern) {
    var i,
        self = this;

    for (i = 0; i < self.CHARACTER_ENCODINGS.length; i++) {
        if (self.CHARACTER_ENCODINGS[i] === pattern) {
            return String.fromCharCode(self.ALPHABET[i]);
        }
    }
    return -1;
};

Code39Reader.prototype._findNextWidth = function (counters, current) {
    var i,
        minWidth = Number.MAX_VALUE;

    for (i = 0; i < counters.length; i++) {
        if (counters[i] < minWidth && counters[i] > current) {
            minWidth = counters[i];
        }
    }

    return minWidth;
};

Code39Reader.prototype._toPattern = function (counters) {
    var numCounters = counters.length,
        maxNarrowWidth = 0,
        numWideBars = numCounters,
        wideBarWidth = 0,
        self = this,
        pattern,
        i;

    while (numWideBars > 3) {
        maxNarrowWidth = self._findNextWidth(counters, maxNarrowWidth);
        numWideBars = 0;
        pattern = 0;
        for (i = 0; i < numCounters; i++) {
            if (counters[i] > maxNarrowWidth) {
                pattern |= 1 << numCounters - 1 - i;
                numWideBars++;
                wideBarWidth += counters[i];
            }
        }

        if (numWideBars === 3) {
            for (i = 0; i < numCounters && numWideBars > 0; i++) {
                if (counters[i] > maxNarrowWidth) {
                    numWideBars--;
                    if (counters[i] * 2 >= wideBarWidth) {
                        return -1;
                    }
                }
            }
            return pattern;
        }
    }
    return -1;
};

Code39Reader.prototype._findStart = function () {
    var self = this,
        offset = self._nextSet(self._row),
        patternStart = offset,
        counter = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        counterPos = 0,
        isWhite = false,
        i,
        j,
        whiteSpaceMustStart;

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                // find start pattern
                if (self._toPattern(counter) === self.ASTERISK) {
                    whiteSpaceMustStart = Math.floor(Math.max(0, patternStart - (i - patternStart) / 4));
                    if (self._matchRange(whiteSpaceMustStart, patternStart, 0)) {
                        return {
                            start: patternStart,
                            end: i
                        };
                    }
                }

                patternStart += counter[0] + counter[1];
                for (j = 0; j < 7; j++) {
                    counter[j] = counter[j + 2];
                }
                counter[7] = 0;
                counter[8] = 0;
                counterPos--;
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

exports.default = Code39Reader;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(14),
    root = __webpack_require__(3);

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(3);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(13),
    eq = __webpack_require__(12);

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(14);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(122)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(107);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 26 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),
/* 28 */
/***/ (function(module, exports) {

/**
 * Gets the value at `key`, unless `key` is "__proto__".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  return key == '__proto__'
    ? undefined
    : object[key];
}

module.exports = safeGet;


/***/ }),
/* 29 */
/***/ (function(module, exports) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(65),
    isObjectLike = __webpack_require__(5);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),
/* 31 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(3),
    stubFalse = __webpack_require__(120);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17)(module)))

/***/ }),
/* 33 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(67),
    baseUnary = __webpack_require__(74),
    nodeUtil = __webpack_require__(105);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(61),
    baseKeysIn = __webpack_require__(68),
    isArrayLike = __webpack_require__(15);

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__(69),
    createAssigner = __webpack_require__(81);

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

module.exports = merge;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.default = init;

var _barcode_decoder_ = __webpack_require__(41);

var _barcode_decoder_2 = _interopRequireDefault(_barcode_decoder_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(config) {
  return _barcode_decoder_2.default.create(config);
}

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var vec2 = {
    clone: __webpack_require__(6),
    dot: __webpack_require__(54)
    /**
     * Creates a cluster for grouping similar orientations of datapoints
     */
};exports.default = {
    create: function create(point, threshold) {
        var points = [],
            center = {
            rad: 0,
            vec: vec2.clone([0, 0])
        },
            pointMap = {};

        function init() {
            _add(point);
            updateCenter();
        }

        function _add(pointToAdd) {
            pointMap[pointToAdd.id] = pointToAdd;
            points.push(pointToAdd);
        }

        function updateCenter() {
            var i,
                sum = 0;
            for (i = 0; i < points.length; i++) {
                sum += points[i].rad;
            }
            center.rad = sum / points.length;
            center.vec = vec2.clone([Math.cos(center.rad), Math.sin(center.rad)]);
        }

        init();

        return {
            add: function add(pointToAdd) {
                if (!pointMap[pointToAdd.id]) {
                    _add(pointToAdd);
                    updateCenter();
                }
            },
            fits: function fits(otherPoint) {
                // check cosine similarity to center-angle
                var similarity = Math.abs(vec2.dot(otherPoint.point.vec, center.vec));
                if (similarity > threshold) {
                    return true;
                }
                return false;
            },
            getPoints: function getPoints() {
                return points;
            },
            getCenter: function getCenter() {
                return center;
            }
        };
    },
    createPoint: function createPoint(newPoint, id, property) {
        return {
            rad: newPoint[property],
            point: newPoint,
            id: id
        };
    }
};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports._dimensionsConverters = exports.ERODE = exports.DILATE = exports.Tracer = undefined;
exports.imageRef = imageRef;
exports.computeIntegralImage2 = computeIntegralImage2;
exports.computeIntegralImage = computeIntegralImage;
exports.thresholdImage = thresholdImage;
exports.computeHistogram = computeHistogram;
exports.sharpenLine = sharpenLine;
exports.determineOtsuThreshold = determineOtsuThreshold;
exports.otsuThreshold = otsuThreshold;
exports.computeBinaryImage = computeBinaryImage;
exports.cluster = cluster;
exports.dilate = dilate;
exports.erode = erode;
exports.subtract = subtract;
exports.bitwiseOr = bitwiseOr;
exports.countNonZero = countNonZero;
exports.topGeneric = topGeneric;
exports.grayArrayFromImage = grayArrayFromImage;
exports.grayArrayFromContext = grayArrayFromContext;
exports.grayAndHalfSampleFromCanvasData = grayAndHalfSampleFromCanvasData;
exports.computeGray = computeGray;
exports.loadImageArray = loadImageArray;
exports.halfSample = halfSample;
exports.hsv2rgb = hsv2rgb;
exports._computeDivisors = _computeDivisors;
exports.calculatePatchSize = calculatePatchSize;
exports._parseCSSDimensionValues = _parseCSSDimensionValues;
exports.computeImageArea = computeImageArea;

var _cluster = __webpack_require__(38);

var _cluster2 = _interopRequireDefault(_cluster);

var _array_helper = __webpack_require__(4);

var _array_helper2 = _interopRequireDefault(_array_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vec2 = {
    clone: __webpack_require__(6)
};
var vec3 = {
    clone: __webpack_require__(55)
};

/**
 * @param x x-coordinate
 * @param y y-coordinate
 * @return ImageReference {x,y} Coordinate
 */
function imageRef(x, y) {
    var that = {
        x: x,
        y: y,
        toVec2: function toVec2() {
            return vec2.clone([this.x, this.y]);
        },
        toVec3: function toVec3() {
            return vec3.clone([this.x, this.y, 1]);
        },
        round: function round() {
            this.x = this.x > 0.0 ? Math.floor(this.x + 0.5) : Math.floor(this.x - 0.5);
            this.y = this.y > 0.0 ? Math.floor(this.y + 0.5) : Math.floor(this.y - 0.5);
            return this;
        }
    };
    return that;
};

/**
 * Computes an integral image of a given grayscale image.
 * @param imageDataContainer {ImageDataContainer} the image to be integrated
 */
function computeIntegralImage2(imageWrapper, integralWrapper) {
    var imageData = imageWrapper.data;
    var width = imageWrapper.size.x;
    var height = imageWrapper.size.y;
    var integralImageData = integralWrapper.data;
    var sum = 0,
        posA = 0,
        posB = 0,
        posC = 0,
        posD = 0,
        x,
        y;

    // sum up first column
    posB = width;
    sum = 0;
    for (y = 1; y < height; y++) {
        sum += imageData[posA];
        integralImageData[posB] += sum;
        posA += width;
        posB += width;
    }

    posA = 0;
    posB = 1;
    sum = 0;
    for (x = 1; x < width; x++) {
        sum += imageData[posA];
        integralImageData[posB] += sum;
        posA++;
        posB++;
    }

    for (y = 1; y < height; y++) {
        posA = y * width + 1;
        posB = (y - 1) * width + 1;
        posC = y * width;
        posD = (y - 1) * width;
        for (x = 1; x < width; x++) {
            integralImageData[posA] += imageData[posA] + integralImageData[posB] + integralImageData[posC] - integralImageData[posD];
            posA++;
            posB++;
            posC++;
            posD++;
        }
    }
};

function computeIntegralImage(imageWrapper, integralWrapper) {
    var imageData = imageWrapper.data;
    var width = imageWrapper.size.x;
    var height = imageWrapper.size.y;
    var integralImageData = integralWrapper.data;
    var sum = 0;

    // sum up first row
    for (var i = 0; i < width; i++) {
        sum += imageData[i];
        integralImageData[i] = sum;
    }

    for (var v = 1; v < height; v++) {
        sum = 0;
        for (var u = 0; u < width; u++) {
            sum += imageData[v * width + u];
            integralImageData[v * width + u] = sum + integralImageData[(v - 1) * width + u];
        }
    }
};

function thresholdImage(imageWrapper, threshold, targetWrapper) {
    if (!targetWrapper) {
        targetWrapper = imageWrapper;
    }
    var imageData = imageWrapper.data,
        length = imageData.length,
        targetData = targetWrapper.data;

    while (length--) {
        targetData[length] = imageData[length] < threshold ? 1 : 0;
    }
};

function computeHistogram(imageWrapper, bitsPerPixel) {
    if (!bitsPerPixel) {
        bitsPerPixel = 8;
    }
    var imageData = imageWrapper.data,
        length = imageData.length,
        bitShift = 8 - bitsPerPixel,
        bucketCnt = 1 << bitsPerPixel,
        hist = new Int32Array(bucketCnt);

    while (length--) {
        hist[imageData[length] >> bitShift]++;
    }
    return hist;
};

function sharpenLine(line) {
    var i,
        length = line.length,
        left = line[0],
        center = line[1],
        right;

    for (i = 1; i < length - 1; i++) {
        right = line[i + 1];
        //  -1 4 -1 kernel
        line[i - 1] = center * 2 - left - right & 255;
        left = center;
        center = right;
    }
    return line;
};

function determineOtsuThreshold(imageWrapper, bitsPerPixel) {
    if (!bitsPerPixel) {
        bitsPerPixel = 8;
    }
    var hist,
        threshold,
        bitShift = 8 - bitsPerPixel;

    function px(init, end) {
        var sum = 0,
            i;
        for (i = init; i <= end; i++) {
            sum += hist[i];
        }
        return sum;
    }

    function mx(init, end) {
        var i,
            sum = 0;

        for (i = init; i <= end; i++) {
            sum += i * hist[i];
        }

        return sum;
    }

    function determineThreshold() {
        var vet = [0],
            p1,
            p2,
            p12,
            k,
            m1,
            m2,
            m12,
            max = (1 << bitsPerPixel) - 1;

        hist = computeHistogram(imageWrapper, bitsPerPixel);
        for (k = 1; k < max; k++) {
            p1 = px(0, k);
            p2 = px(k + 1, max);
            p12 = p1 * p2;
            if (p12 === 0) {
                p12 = 1;
            }
            m1 = mx(0, k) * p2;
            m2 = mx(k + 1, max) * p1;
            m12 = m1 - m2;
            vet[k] = m12 * m12 / p12;
        }
        return _array_helper2.default.maxIndex(vet);
    }

    threshold = determineThreshold();
    return threshold << bitShift;
};

function otsuThreshold(imageWrapper, targetWrapper) {
    var threshold = determineOtsuThreshold(imageWrapper);

    thresholdImage(imageWrapper, threshold, targetWrapper);
    return threshold;
};

// local thresholding
function computeBinaryImage(imageWrapper, integralWrapper, targetWrapper) {
    computeIntegralImage(imageWrapper, integralWrapper);

    if (!targetWrapper) {
        targetWrapper = imageWrapper;
    }
    var imageData = imageWrapper.data;
    var targetData = targetWrapper.data;
    var width = imageWrapper.size.x;
    var height = imageWrapper.size.y;
    var integralImageData = integralWrapper.data;
    var sum = 0,
        v,
        u,
        kernel = 3,
        A,
        B,
        C,
        D,
        avg,
        size = (kernel * 2 + 1) * (kernel * 2 + 1);

    // clear out top & bottom-border
    for (v = 0; v <= kernel; v++) {
        for (u = 0; u < width; u++) {
            targetData[v * width + u] = 0;
            targetData[(height - 1 - v) * width + u] = 0;
        }
    }

    // clear out left & right border
    for (v = kernel; v < height - kernel; v++) {
        for (u = 0; u <= kernel; u++) {
            targetData[v * width + u] = 0;
            targetData[v * width + (width - 1 - u)] = 0;
        }
    }

    for (v = kernel + 1; v < height - kernel - 1; v++) {
        for (u = kernel + 1; u < width - kernel; u++) {
            A = integralImageData[(v - kernel - 1) * width + (u - kernel - 1)];
            B = integralImageData[(v - kernel - 1) * width + (u + kernel)];
            C = integralImageData[(v + kernel) * width + (u - kernel - 1)];
            D = integralImageData[(v + kernel) * width + (u + kernel)];
            sum = D - C - B + A;
            avg = sum / size;
            targetData[v * width + u] = imageData[v * width + u] > avg + 5 ? 0 : 1;
        }
    }
};

function cluster(points, threshold, property) {
    var i,
        k,
        cluster,
        point,
        clusters = [];

    if (!property) {
        property = "rad";
    }

    function addToCluster(newPoint) {
        var found = false;
        for (k = 0; k < clusters.length; k++) {
            cluster = clusters[k];
            if (cluster.fits(newPoint)) {
                cluster.add(newPoint);
                found = true;
            }
        }
        return found;
    }

    // iterate over each cloud
    for (i = 0; i < points.length; i++) {
        point = _cluster2.default.createPoint(points[i], i, property);
        if (!addToCluster(point)) {
            clusters.push(_cluster2.default.create(point, threshold));
        }
    }
    return clusters;
};

var Tracer = exports.Tracer = {
    trace: function trace(points, vec) {
        var iteration,
            maxIterations = 10,
            top = [],
            result = [],
            centerPos = 0,
            currentPos = 0;

        function trace(idx, forward) {
            var from,
                to,
                toIdx,
                predictedPos,
                thresholdX = 1,
                thresholdY = Math.abs(vec[1] / 10),
                found = false;

            function match(pos, predicted) {
                if (pos.x > predicted.x - thresholdX && pos.x < predicted.x + thresholdX && pos.y > predicted.y - thresholdY && pos.y < predicted.y + thresholdY) {
                    return true;
                } else {
                    return false;
                }
            }

            // check if the next index is within the vec specifications
            // if not, check as long as the threshold is met

            from = points[idx];
            if (forward) {
                predictedPos = {
                    x: from.x + vec[0],
                    y: from.y + vec[1]
                };
            } else {
                predictedPos = {
                    x: from.x - vec[0],
                    y: from.y - vec[1]
                };
            }

            toIdx = forward ? idx + 1 : idx - 1;
            to = points[toIdx];
            while (to && (found = match(to, predictedPos)) !== true && Math.abs(to.y - from.y) < vec[1]) {
                toIdx = forward ? toIdx + 1 : toIdx - 1;
                to = points[toIdx];
            }

            return found ? toIdx : null;
        }

        for (iteration = 0; iteration < maxIterations; iteration++) {
            // randomly select point to start with
            centerPos = Math.floor(Math.random() * points.length);

            // trace forward
            top = [];
            currentPos = centerPos;
            top.push(points[currentPos]);
            while ((currentPos = trace(currentPos, true)) !== null) {
                top.push(points[currentPos]);
            }
            if (centerPos > 0) {
                currentPos = centerPos;
                while ((currentPos = trace(currentPos, false)) !== null) {
                    top.push(points[currentPos]);
                }
            }

            if (top.length > result.length) {
                result = top;
            }
        }
        return result;
    }
};

var DILATE = exports.DILATE = 1;
var ERODE = exports.ERODE = 2;

function dilate(inImageWrapper, outImageWrapper) {
    var v,
        u,
        inImageData = inImageWrapper.data,
        outImageData = outImageWrapper.data,
        height = inImageWrapper.size.y,
        width = inImageWrapper.size.x,
        sum,
        yStart1,
        yStart2,
        xStart1,
        xStart2;

    for (v = 1; v < height - 1; v++) {
        for (u = 1; u < width - 1; u++) {
            yStart1 = v - 1;
            yStart2 = v + 1;
            xStart1 = u - 1;
            xStart2 = u + 1;
            sum = inImageData[yStart1 * width + xStart1] + inImageData[yStart1 * width + xStart2] + inImageData[v * width + u] + inImageData[yStart2 * width + xStart1] + inImageData[yStart2 * width + xStart2];
            outImageData[v * width + u] = sum > 0 ? 1 : 0;
        }
    }
};

function erode(inImageWrapper, outImageWrapper) {
    var v,
        u,
        inImageData = inImageWrapper.data,
        outImageData = outImageWrapper.data,
        height = inImageWrapper.size.y,
        width = inImageWrapper.size.x,
        sum,
        yStart1,
        yStart2,
        xStart1,
        xStart2;

    for (v = 1; v < height - 1; v++) {
        for (u = 1; u < width - 1; u++) {
            yStart1 = v - 1;
            yStart2 = v + 1;
            xStart1 = u - 1;
            xStart2 = u + 1;
            sum = inImageData[yStart1 * width + xStart1] + inImageData[yStart1 * width + xStart2] + inImageData[v * width + u] + inImageData[yStart2 * width + xStart1] + inImageData[yStart2 * width + xStart2];
            outImageData[v * width + u] = sum === 5 ? 1 : 0;
        }
    }
};

function subtract(aImageWrapper, bImageWrapper, resultImageWrapper) {
    if (!resultImageWrapper) {
        resultImageWrapper = aImageWrapper;
    }
    var length = aImageWrapper.data.length,
        aImageData = aImageWrapper.data,
        bImageData = bImageWrapper.data,
        cImageData = resultImageWrapper.data;

    while (length--) {
        cImageData[length] = aImageData[length] - bImageData[length];
    }
};

function bitwiseOr(aImageWrapper, bImageWrapper, resultImageWrapper) {
    if (!resultImageWrapper) {
        resultImageWrapper = aImageWrapper;
    }
    var length = aImageWrapper.data.length,
        aImageData = aImageWrapper.data,
        bImageData = bImageWrapper.data,
        cImageData = resultImageWrapper.data;

    while (length--) {
        cImageData[length] = aImageData[length] || bImageData[length];
    }
};

function countNonZero(imageWrapper) {
    var length = imageWrapper.data.length,
        data = imageWrapper.data,
        sum = 0;

    while (length--) {
        sum += data[length];
    }
    return sum;
};

function topGeneric(list, top, scoreFunc) {
    var i,
        minIdx = 0,
        min = 0,
        queue = [],
        score,
        hit,
        pos;

    for (i = 0; i < top; i++) {
        queue[i] = {
            score: 0,
            item: null
        };
    }

    for (i = 0; i < list.length; i++) {
        score = scoreFunc.apply(this, [list[i]]);
        if (score > min) {
            hit = queue[minIdx];
            hit.score = score;
            hit.item = list[i];
            min = Number.MAX_VALUE;
            for (pos = 0; pos < top; pos++) {
                if (queue[pos].score < min) {
                    min = queue[pos].score;
                    minIdx = pos;
                }
            }
        }
    }

    return queue;
};

function grayArrayFromImage(htmlImage, offsetX, ctx, array) {
    ctx.drawImage(htmlImage, offsetX, 0, htmlImage.width, htmlImage.height);
    var ctxData = ctx.getImageData(offsetX, 0, htmlImage.width, htmlImage.height).data;
    computeGray(ctxData, array);
};

function grayArrayFromContext(ctx, size, offset, array) {
    var ctxData = ctx.getImageData(offset.x, offset.y, size.x, size.y).data;
    computeGray(ctxData, array);
};

function grayAndHalfSampleFromCanvasData(canvasData, size, outArray) {
    var topRowIdx = 0;
    var bottomRowIdx = size.x;
    var endIdx = Math.floor(canvasData.length / 4);
    var outWidth = size.x / 2;
    var outImgIdx = 0;
    var inWidth = size.x;
    var i;

    while (bottomRowIdx < endIdx) {
        for (i = 0; i < outWidth; i++) {
            outArray[outImgIdx] = (0.299 * canvasData[topRowIdx * 4 + 0] + 0.587 * canvasData[topRowIdx * 4 + 1] + 0.114 * canvasData[topRowIdx * 4 + 2] + (0.299 * canvasData[(topRowIdx + 1) * 4 + 0] + 0.587 * canvasData[(topRowIdx + 1) * 4 + 1] + 0.114 * canvasData[(topRowIdx + 1) * 4 + 2]) + (0.299 * canvasData[bottomRowIdx * 4 + 0] + 0.587 * canvasData[bottomRowIdx * 4 + 1] + 0.114 * canvasData[bottomRowIdx * 4 + 2]) + (0.299 * canvasData[(bottomRowIdx + 1) * 4 + 0] + 0.587 * canvasData[(bottomRowIdx + 1) * 4 + 1] + 0.114 * canvasData[(bottomRowIdx + 1) * 4 + 2])) / 4;
            outImgIdx++;
            topRowIdx = topRowIdx + 2;
            bottomRowIdx = bottomRowIdx + 2;
        }
        topRowIdx = topRowIdx + inWidth;
        bottomRowIdx = bottomRowIdx + inWidth;
    }
};

function computeGray(imageData, outArray, config) {
    var l = imageData.length / 4 | 0,
        i,
        singleChannel = config && config.singleChannel === true;

    if (singleChannel) {
        for (i = 0; i < l; i++) {
            outArray[i] = imageData[i * 4 + 0];
        }
    } else {
        for (i = 0; i < l; i++) {
            outArray[i] = 0.299 * imageData[i * 4 + 0] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2];
        }
    }
};

function loadImageArray(src, callback, canvas) {
    if (!canvas) {
        canvas = document.createElement('canvas');
    }
    var img = new Image();
    img.callback = callback;
    img.onload = function () {
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        var array = new Uint8Array(this.width * this.height);
        ctx.drawImage(this, 0, 0);
        var data = ctx.getImageData(0, 0, this.width, this.height).data;
        computeGray(data, array);
        this.callback(array, {
            x: this.width,
            y: this.height
        }, this);
    };
    img.src = src;
};

/**
 * @param inImg {ImageWrapper} input image to be sampled
 * @param outImg {ImageWrapper} to be stored in
 */
function halfSample(inImgWrapper, outImgWrapper) {
    var inImg = inImgWrapper.data;
    var inWidth = inImgWrapper.size.x;
    var outImg = outImgWrapper.data;
    var topRowIdx = 0;
    var bottomRowIdx = inWidth;
    var endIdx = inImg.length;
    var outWidth = inWidth / 2;
    var outImgIdx = 0;
    while (bottomRowIdx < endIdx) {
        for (var i = 0; i < outWidth; i++) {
            outImg[outImgIdx] = Math.floor((inImg[topRowIdx] + inImg[topRowIdx + 1] + inImg[bottomRowIdx] + inImg[bottomRowIdx + 1]) / 4);
            outImgIdx++;
            topRowIdx = topRowIdx + 2;
            bottomRowIdx = bottomRowIdx + 2;
        }
        topRowIdx = topRowIdx + inWidth;
        bottomRowIdx = bottomRowIdx + inWidth;
    }
};

function hsv2rgb(hsv, rgb) {
    var h = hsv[0],
        s = hsv[1],
        v = hsv[2],
        c = v * s,
        x = c * (1 - Math.abs(h / 60 % 2 - 1)),
        m = v - c,
        r = 0,
        g = 0,
        b = 0;

    rgb = rgb || [0, 0, 0];

    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else if (h < 360) {
        r = c;
        b = x;
    }
    rgb[0] = (r + m) * 255 | 0;
    rgb[1] = (g + m) * 255 | 0;
    rgb[2] = (b + m) * 255 | 0;
    return rgb;
};

function _computeDivisors(n) {
    var largeDivisors = [],
        divisors = [],
        i;

    for (i = 1; i < Math.sqrt(n) + 1; i++) {
        if (n % i === 0) {
            divisors.push(i);
            if (i !== n / i) {
                largeDivisors.unshift(Math.floor(n / i));
            }
        }
    }
    return divisors.concat(largeDivisors);
};

function _computeIntersection(arr1, arr2) {
    var i = 0,
        j = 0,
        result = [];

    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] === arr2[j]) {
            result.push(arr1[i]);
            i++;
            j++;
        } else if (arr1[i] > arr2[j]) {
            j++;
        } else {
            i++;
        }
    }
    return result;
};

function calculatePatchSize(patchSize, imgSize) {
    var divisorsX = _computeDivisors(imgSize.x),
        divisorsY = _computeDivisors(imgSize.y),
        wideSide = Math.max(imgSize.x, imgSize.y),
        common = _computeIntersection(divisorsX, divisorsY),
        nrOfPatchesList = [8, 10, 15, 20, 32, 60, 80],
        nrOfPatchesMap = {
        "x-small": 5,
        "small": 4,
        "medium": 3,
        "large": 2,
        "x-large": 1
    },
        nrOfPatchesIdx = nrOfPatchesMap[patchSize] || nrOfPatchesMap.medium,
        nrOfPatches = nrOfPatchesList[nrOfPatchesIdx],
        desiredPatchSize = Math.floor(wideSide / nrOfPatches),
        optimalPatchSize;

    function findPatchSizeForDivisors(divisors) {
        var i = 0,
            found = divisors[Math.floor(divisors.length / 2)];

        while (i < divisors.length - 1 && divisors[i] < desiredPatchSize) {
            i++;
        }
        if (i > 0) {
            if (Math.abs(divisors[i] - desiredPatchSize) > Math.abs(divisors[i - 1] - desiredPatchSize)) {
                found = divisors[i - 1];
            } else {
                found = divisors[i];
            }
        }
        if (desiredPatchSize / found < nrOfPatchesList[nrOfPatchesIdx + 1] / nrOfPatchesList[nrOfPatchesIdx] && desiredPatchSize / found > nrOfPatchesList[nrOfPatchesIdx - 1] / nrOfPatchesList[nrOfPatchesIdx]) {
            return { x: found, y: found };
        }
        return null;
    }

    optimalPatchSize = findPatchSizeForDivisors(common);
    if (!optimalPatchSize) {
        optimalPatchSize = findPatchSizeForDivisors(_computeDivisors(wideSide));
        if (!optimalPatchSize) {
            optimalPatchSize = findPatchSizeForDivisors(_computeDivisors(desiredPatchSize * nrOfPatches));
        }
    }
    return optimalPatchSize;
};

function _parseCSSDimensionValues(value) {
    var dimension = {
        value: parseFloat(value),
        unit: value.indexOf("%") === value.length - 1 ? "%" : "%"
    };

    return dimension;
};

var _dimensionsConverters = exports._dimensionsConverters = {
    top: function top(dimension, context) {
        if (dimension.unit === "%") {
            return Math.floor(context.height * (dimension.value / 100));
        }
    },
    right: function right(dimension, context) {
        if (dimension.unit === "%") {
            return Math.floor(context.width - context.width * (dimension.value / 100));
        }
    },
    bottom: function bottom(dimension, context) {
        if (dimension.unit === "%") {
            return Math.floor(context.height - context.height * (dimension.value / 100));
        }
    },
    left: function left(dimension, context) {
        if (dimension.unit === "%") {
            return Math.floor(context.width * (dimension.value / 100));
        }
    }
};

function computeImageArea(inputWidth, inputHeight, area) {
    var context = { width: inputWidth, height: inputHeight };

    var parsedArea = Object.keys(area).reduce(function (result, key) {
        var value = area[key],
            parsed = _parseCSSDimensionValues(value),
            calculated = _dimensionsConverters[key](parsed, context);

        result[key] = calculated;
        return result;
    }, {});

    return {
        sx: parsedArea.left,
        sy: parsedArea.top,
        sw: parsedArea.right - parsedArea.left,
        sh: parsedArea.bottom - parsedArea.top
    };
};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
/**
 * Construct representing a part of another {ImageWrapper}. Shares data
 * between the parent and the child.
 * @param from {ImageRef} The position where to start the {SubImage} from. (top-left corner)
 * @param size {ImageRef} The size of the resulting image
 * @param I {ImageWrapper} The {ImageWrapper} to share from
 * @returns {SubImage} A shared part of the original image
 */
function SubImage(from, size, I) {
    if (!I) {
        I = {
            data: null,
            size: size
        };
    }
    this.data = I.data;
    this.originalSize = I.size;
    this.I = I;

    this.from = from;
    this.size = size;
}

/**
 * Displays the {SubImage} in a given canvas
 * @param canvas {Canvas} The canvas element to write to
 * @param scale {Number} Scale which is applied to each pixel-value
 */
SubImage.prototype.show = function (canvas, scale) {
    var ctx, frame, data, current, y, x, pixel;

    if (!scale) {
        scale = 1.0;
    }
    ctx = canvas.getContext('2d');
    canvas.width = this.size.x;
    canvas.height = this.size.y;
    frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = frame.data;
    current = 0;
    for (y = 0; y < this.size.y; y++) {
        for (x = 0; x < this.size.x; x++) {
            pixel = y * this.size.x + x;
            current = this.get(x, y) * scale;
            data[pixel * 4 + 0] = current;
            data[pixel * 4 + 1] = current;
            data[pixel * 4 + 2] = current;
            data[pixel * 4 + 3] = 255;
        }
    }
    frame.data = data;
    ctx.putImageData(frame, 0, 0);
};

/**
 * Retrieves a given pixel position from the {SubImage}
 * @param x {Number} The x-position
 * @param y {Number} The y-position
 * @returns {Number} The grayscale value at the pixel-position
 */
SubImage.prototype.get = function (x, y) {
    return this.data[(this.from.y + y) * this.originalSize.x + this.from.x + x];
};

/**
 * Updates the underlying data from a given {ImageWrapper}
 * @param image {ImageWrapper} The updated image
 */
SubImage.prototype.updateData = function (image) {
    this.originalSize = image.size;
    this.data = image.data;
};

/**
 * Updates the position of the shared area
 * @param from {x,y} The new location
 * @returns {SubImage} returns {this} for possible chaining
 */
SubImage.prototype.updateFrom = function (from) {
    this.from = from;
    return this;
};

exports.default = SubImage;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _bresenham = __webpack_require__(42);

var _bresenham2 = _interopRequireDefault(_bresenham);

var _image_wrapper = __webpack_require__(18);

var _image_wrapper2 = _interopRequireDefault(_image_wrapper);

var _code_128_reader = __webpack_require__(45);

var _code_128_reader2 = _interopRequireDefault(_code_128_reader);

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

var _code_39_reader = __webpack_require__(19);

var _code_39_reader2 = _interopRequireDefault(_code_39_reader);

var _code_39_vin_reader = __webpack_require__(46);

var _code_39_vin_reader2 = _interopRequireDefault(_code_39_vin_reader);

var _codabar_reader = __webpack_require__(44);

var _codabar_reader2 = _interopRequireDefault(_codabar_reader);

var _upc_reader = __webpack_require__(53);

var _upc_reader2 = _interopRequireDefault(_upc_reader);

var _ean_8_reader = __webpack_require__(50);

var _ean_8_reader2 = _interopRequireDefault(_ean_8_reader);

var _ean_2_reader = __webpack_require__(48);

var _ean_2_reader2 = _interopRequireDefault(_ean_2_reader);

var _ean_5_reader = __webpack_require__(49);

var _ean_5_reader2 = _interopRequireDefault(_ean_5_reader);

var _upc_e_reader = __webpack_require__(52);

var _upc_e_reader2 = _interopRequireDefault(_upc_e_reader);

var _i2of5_reader = __webpack_require__(51);

var _i2of5_reader2 = _interopRequireDefault(_i2of5_reader);

var _of5_reader = __webpack_require__(43);

var _of5_reader2 = _interopRequireDefault(_of5_reader);

var _code_93_reader = __webpack_require__(47);

var _code_93_reader2 = _interopRequireDefault(_code_93_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vec2clone = __webpack_require__(6);

var READERS = {
    code_128_reader: _code_128_reader2.default,
    ean_reader: _ean_reader2.default,
    ean_5_reader: _ean_5_reader2.default,
    ean_2_reader: _ean_2_reader2.default,
    ean_8_reader: _ean_8_reader2.default,
    code_39_reader: _code_39_reader2.default,
    code_39_vin_reader: _code_39_vin_reader2.default,
    codabar_reader: _codabar_reader2.default,
    upc_reader: _upc_reader2.default,
    upc_e_reader: _upc_e_reader2.default,
    i2of5_reader: _i2of5_reader2.default,
    '2of5_reader': _of5_reader2.default,
    code_93_reader: _code_93_reader2.default
};
exports.default = {
    create: function create(config) {
        var inputImageWrapper = void 0;
        var _barcodeReaders = [];

        initReaders();

        function initReaders() {
            config.readers.forEach(function (readerConfig) {
                var reader,
                    configuration = {},
                    supplements = [];

                if ((typeof readerConfig === 'undefined' ? 'undefined' : _typeof(readerConfig)) === 'object') {
                    reader = readerConfig.format;
                    configuration = readerConfig.config;
                } else if (typeof readerConfig === 'string') {
                    reader = readerConfig;
                }
                if (false) {
                    console.log("Before registering reader: ", reader);
                }
                if (configuration.supplements) {
                    supplements = configuration.supplements.map(function (supplement) {
                        return new READERS[supplement]();
                    });
                }
                _barcodeReaders.push(new READERS[reader](configuration, supplements));
            });
        }

        /**
         * extend the line on both ends
         * @param {Array} line
         * @param {Number} angle
         */
        function getExtendedLine(line, angle, ext) {
            function extendLine(amount) {
                var extension = {
                    y: amount * Math.sin(angle),
                    x: amount * Math.cos(angle)
                };

                line[0].y -= extension.y;
                line[0].x -= extension.x;
                line[1].y += extension.y;
                line[1].x += extension.x;
            }

            // check if inside image
            extendLine(ext);
            while (ext > 1 && (!inputImageWrapper.inImageWithBorder(line[0], 0) || !inputImageWrapper.inImageWithBorder(line[1], 0))) {
                ext -= Math.ceil(ext / 2);
                extendLine(-ext);
            }
            return line;
        }

        function getLine(box) {
            return [{
                x: (box[1][0] - box[0][0]) / 2 + box[0][0],
                y: (box[1][1] - box[0][1]) / 2 + box[0][1]
            }, {
                x: (box[3][0] - box[2][0]) / 2 + box[2][0],
                y: (box[3][1] - box[2][1]) / 2 + box[2][1]
            }];
        }

        function tryDecode(line) {
            var result = null,
                i,
                barcodeLine = _bresenham2.default.getBarcodeLine(inputImageWrapper, line[0], line[1]);

            _bresenham2.default.toBinaryLine(barcodeLine);

            for (i = 0; i < _barcodeReaders.length && result === null; i++) {
                result = _barcodeReaders[i].decodePattern(barcodeLine.line);
            }
            if (result === null) {
                return null;
            }
            return {
                codeResult: result,
                barcodeLine: barcodeLine
            };
        }

        /**
         * This method slices the given area apart and tries to detect a barcode-pattern
         * for each slice. It returns the decoded barcode, or null if nothing was found
         * @param {Array} box
         * @param {Array} line
         * @param {Number} lineAngle
         */
        function tryDecodeBruteForce(box, line, lineAngle) {
            var sideLength = Math.sqrt(Math.pow(box[1][0] - box[0][0], 2) + Math.pow(box[1][1] - box[0][1], 2)),
                i,
                slices = 16,
                result = null,
                dir,
                extension,
                xdir = Math.sin(lineAngle),
                ydir = Math.cos(lineAngle);

            for (i = 1; i < slices && result === null; i++) {
                // move line perpendicular to angle
                dir = sideLength / slices * i * (i % 2 === 0 ? -1 : 1);
                extension = {
                    y: dir * xdir,
                    x: dir * ydir
                };
                line[0].y += extension.x;
                line[0].x -= extension.y;
                line[1].y += extension.x;
                line[1].x -= extension.y;

                result = tryDecode(line);
            }
            return result;
        }

        function getLineLength(line) {
            return Math.sqrt(Math.pow(Math.abs(line[1].y - line[0].y), 2) + Math.pow(Math.abs(line[1].x - line[0].x), 2));
        }

        /**
         * With the help of the configured readers (Code128 or EAN) this function tries to detect a
         * valid barcode pattern within the given area.
         * @param {Object} box The area to search in
         * @returns {Object} the result {codeResult, line, angle, pattern, threshold}
         */
        function decodeFromBoundingBox(box) {
            var line, lineAngle, result, lineLength;

            line = getLine(box);
            lineLength = getLineLength(line);
            lineAngle = Math.atan2(line[1].y - line[0].y, line[1].x - line[0].x);
            line = getExtendedLine(line, lineAngle, Math.floor(lineLength * 0.1));
            if (line === null) {
                return null;
            }

            result = tryDecode(line);
            if (result === null) {
                result = tryDecodeBruteForce(box, line, lineAngle);
            }

            if (result === null) {
                return null;
            }

            return {
                codeResult: result.codeResult,
                line: line,
                angle: lineAngle,
                pattern: result.barcodeLine.line,
                threshold: result.barcodeLine.threshold
            };
        }

        return function decode(imageData) {
            // Warning! Because i'm hacking up someone else's code, i'm just setting
            // a variable that is closed over, that the decode* funcitons will use
            // THIS FUNCTION IS NOT CONCURRENT SAFE! It must only ever be called
            // once at a time, and any concurrent calls will corrupt the imageData
            // and do horrible things!
            var singleColorImageData = new Uint8ClampedArray(imageData.height * imageData.width);
            computeGray(imageData.data, singleColorImageData, false);

            inputImageWrapper = new _image_wrapper2.default({
                y: imageData.height,
                x: imageData.width
            }, singleColorImageData, Uint8ClampedArray, false);

            console.log(inputImageWrapper);
            return decodeFromBoundingBox([vec2clone([0, 0]), vec2clone([0, inputImageWrapper.size.y]), vec2clone([inputImageWrapper.size.x, inputImageWrapper.size.y]), vec2clone([inputImageWrapper.size.x, 0])]);
        };
    }
};


function computeGray(imageData, outArray, singleChannel) {
    var l = imageData.length / 4 | 0,
        i;

    if (singleChannel) {
        for (i = 0; i < l; i++) {
            outArray[i] = imageData[i * 4 + 0];
        }
    } else {
        for (i = 0; i < l; i++) {
            outArray[i] = 0.299 * imageData[i * 4 + 0] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2];
        }
    }
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _image_wrapper = __webpack_require__(18);

var _image_wrapper2 = _interopRequireDefault(_image_wrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bresenham = {};

var Slope = {
    DIR: {
        UP: 1,
        DOWN: -1
    }
};
/**
 * Scans a line of the given image from point p1 to p2 and returns a result object containing
 * gray-scale values (0-255) of the underlying pixels in addition to the min
 * and max values.
 * @param {Object} imageWrapper
 * @param {Object} p1 The start point {x,y}
 * @param {Object} p2 The end point {x,y}
 * @returns {line, min, max}
 */
Bresenham.getBarcodeLine = function (imageWrapper, p1, p2) {
    var x0 = p1.x | 0,
        y0 = p1.y | 0,
        x1 = p2.x | 0,
        y1 = p2.y | 0,
        steep = Math.abs(y1 - y0) > Math.abs(x1 - x0),
        deltax,
        deltay,
        error,
        ystep,
        y,
        tmp,
        x,
        line = [],
        imageData = imageWrapper.data,
        width = imageWrapper.size.x,
        sum = 0,
        val,
        min = 255,
        max = 0;

    function read(a, b) {
        val = imageData[b * width + a];
        sum += val;
        min = val < min ? val : min;
        max = val > max ? val : max;
        line.push(val);
    }

    if (steep) {
        tmp = x0;
        x0 = y0;
        y0 = tmp;

        tmp = x1;
        x1 = y1;
        y1 = tmp;
    }
    if (x0 > x1) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;

        tmp = y0;
        y0 = y1;
        y1 = tmp;
    }
    deltax = x1 - x0;
    deltay = Math.abs(y1 - y0);
    error = deltax / 2 | 0;
    y = y0;
    ystep = y0 < y1 ? 1 : -1;
    for (x = x0; x < x1; x++) {
        if (steep) {
            read(y, x);
        } else {
            read(x, y);
        }
        error = error - deltay;
        if (error < 0) {
            y = y + ystep;
            error = error + deltax;
        }
    }

    return {
        line: line,
        min: min,
        max: max
    };
};

/**
 * Converts the result from getBarcodeLine into a binary representation
 * also considering the frequency and slope of the signal for more robust results
 * @param {Object} result {line, min, max}
 */
Bresenham.toBinaryLine = function (result) {
    var min = result.min,
        max = result.max,
        line = result.line,
        slope,
        slope2,
        center = min + (max - min) / 2,
        extrema = [],
        currentDir,
        dir,
        threshold = (max - min) / 12,
        rThreshold = -threshold,
        i,
        j;

    // 1. find extrema
    currentDir = line[0] > center ? Slope.DIR.UP : Slope.DIR.DOWN;
    extrema.push({
        pos: 0,
        val: line[0]
    });
    for (i = 0; i < line.length - 2; i++) {
        slope = line[i + 1] - line[i];
        slope2 = line[i + 2] - line[i + 1];
        if (slope + slope2 < rThreshold && line[i + 1] < center * 1.5) {
            dir = Slope.DIR.DOWN;
        } else if (slope + slope2 > threshold && line[i + 1] > center * 0.5) {
            dir = Slope.DIR.UP;
        } else {
            dir = currentDir;
        }

        if (currentDir !== dir) {
            extrema.push({
                pos: i,
                val: line[i]
            });
            currentDir = dir;
        }
    }
    extrema.push({
        pos: line.length,
        val: line[line.length - 1]
    });

    for (j = extrema[0].pos; j < extrema[1].pos; j++) {
        line[j] = line[j] > center ? 0 : 1;
    }

    // iterate over extrema and convert to binary based on avg between minmax
    for (i = 1; i < extrema.length - 1; i++) {
        if (extrema[i + 1].val > extrema[i].val) {
            threshold = extrema[i].val + (extrema[i + 1].val - extrema[i].val) / 3 * 2 | 0;
        } else {
            threshold = extrema[i + 1].val + (extrema[i].val - extrema[i + 1].val) / 3 | 0;
        }

        for (j = extrema[i].pos; j < extrema[i + 1].pos; j++) {
            line[j] = line[j] > threshold ? 0 : 1;
        }
    }

    return {
        line: line,
        threshold: threshold
    };
};

/**
 * Used for development only
 */
Bresenham.debug = {
    printFrequency: function printFrequency(line, canvas) {
        var i,
            ctx = canvas.getContext("2d");
        canvas.width = line.length;
        canvas.height = 256;

        ctx.beginPath();
        ctx.strokeStyle = "blue";
        for (i = 0; i < line.length; i++) {
            ctx.moveTo(i, 255);
            ctx.lineTo(i, 255 - line[i]);
        }
        ctx.stroke();
        ctx.closePath();
    },

    printPattern: function printPattern(line, canvas) {
        var ctx = canvas.getContext("2d"),
            i;

        canvas.width = line.length;
        ctx.fillColor = "black";
        for (i = 0; i < line.length; i++) {
            if (line[i] === 1) {
                ctx.fillRect(i, 0, 1, 100);
            }
        }
    }
};

exports.default = Bresenham;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TwoOfFiveReader(opts) {
    _barcode_reader2.default.call(this, opts);
    this.barSpaceRatio = [1, 1];
}

var N = 1,
    W = 3,
    properties = {
    START_PATTERN: { value: [W, N, W, N, N, N] },
    STOP_PATTERN: { value: [W, N, N, N, W] },
    CODE_PATTERN: { value: [[N, N, W, W, N], [W, N, N, N, W], [N, W, N, N, W], [W, W, N, N, N], [N, N, W, N, W], [W, N, W, N, N], [N, W, W, N, N], [N, N, N, W, W], [W, N, N, W, N], [N, W, N, W, N]] },
    SINGLE_CODE_ERROR: { value: 0.78, writable: true },
    AVG_CODE_ERROR: { value: 0.30, writable: true },
    FORMAT: { value: "2of5" }
};

var startPatternLength = properties.START_PATTERN.value.reduce(function (sum, val) {
    return sum + val;
}, 0);

TwoOfFiveReader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
TwoOfFiveReader.prototype.constructor = TwoOfFiveReader;

TwoOfFiveReader.prototype._findPattern = function (pattern, offset, isWhite, tryHarder) {
    var counter = [],
        self = this,
        i,
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0
    },
        error,
        j,
        sum,
        epsilon = self.AVG_CODE_ERROR;

    isWhite = isWhite || false;
    tryHarder = tryHarder || false;

    if (!offset) {
        offset = self._nextSet(self._row);
    }

    for (i = 0; i < pattern.length; i++) {
        counter[i] = 0;
    }

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                sum = 0;
                for (j = 0; j < counter.length; j++) {
                    sum += counter[j];
                }
                error = self._matchPattern(counter, pattern);
                if (error < epsilon) {
                    bestMatch.error = error;
                    bestMatch.start = i - sum;
                    bestMatch.end = i;
                    return bestMatch;
                }
                if (tryHarder) {
                    for (j = 0; j < counter.length - 2; j++) {
                        counter[j] = counter[j + 2];
                    }
                    counter[counter.length - 2] = 0;
                    counter[counter.length - 1] = 0;
                    counterPos--;
                } else {
                    return null;
                }
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

TwoOfFiveReader.prototype._findStart = function () {
    var self = this,
        leadingWhitespaceStart,
        offset = self._nextSet(self._row),
        startInfo,
        narrowBarWidth = 1;

    while (!startInfo) {
        startInfo = self._findPattern(self.START_PATTERN, offset, false, true);
        if (!startInfo) {
            return null;
        }
        narrowBarWidth = Math.floor((startInfo.end - startInfo.start) / startPatternLength);
        leadingWhitespaceStart = startInfo.start - narrowBarWidth * 5;
        if (leadingWhitespaceStart >= 0) {
            if (self._matchRange(leadingWhitespaceStart, startInfo.start, 0)) {
                return startInfo;
            }
        }
        offset = startInfo.end;
        startInfo = null;
    }
};

TwoOfFiveReader.prototype._verifyTrailingWhitespace = function (endInfo) {
    var self = this,
        trailingWhitespaceEnd;

    trailingWhitespaceEnd = endInfo.end + (endInfo.end - endInfo.start) / 2;
    if (trailingWhitespaceEnd < self._row.length) {
        if (self._matchRange(endInfo.end, trailingWhitespaceEnd, 0)) {
            return endInfo;
        }
    }
    return null;
};

TwoOfFiveReader.prototype._findEnd = function () {
    var self = this,
        endInfo,
        tmp,
        offset;

    self._row.reverse();
    offset = self._nextSet(self._row);
    endInfo = self._findPattern(self.STOP_PATTERN, offset, false, true);
    self._row.reverse();

    if (endInfo === null) {
        return null;
    }

    // reverse numbers
    tmp = endInfo.start;
    endInfo.start = self._row.length - endInfo.end;
    endInfo.end = self._row.length - tmp;

    return endInfo !== null ? self._verifyTrailingWhitespace(endInfo) : null;
};

TwoOfFiveReader.prototype._decodeCode = function (counter) {
    var j,
        self = this,
        sum = 0,
        normalized,
        error,
        epsilon = self.AVG_CODE_ERROR,
        code,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0
    };

    for (j = 0; j < counter.length; j++) {
        sum += counter[j];
    }
    for (code = 0; code < self.CODE_PATTERN.length; code++) {
        error = self._matchPattern(counter, self.CODE_PATTERN[code]);
        if (error < bestMatch.error) {
            bestMatch.code = code;
            bestMatch.error = error;
        }
    }
    if (bestMatch.error < epsilon) {
        return bestMatch;
    }
};

TwoOfFiveReader.prototype._decodePayload = function (counters, result, decodedCodes) {
    var i,
        self = this,
        pos = 0,
        counterLength = counters.length,
        counter = [0, 0, 0, 0, 0],
        code;

    while (pos < counterLength) {
        for (i = 0; i < 5; i++) {
            counter[i] = counters[pos] * this.barSpaceRatio[0];
            pos += 2;
        }
        code = self._decodeCode(counter);
        if (!code) {
            return null;
        }
        result.push(code.code + "");
        decodedCodes.push(code);
    }
    return code;
};

TwoOfFiveReader.prototype._verifyCounterLength = function (counters) {
    return counters.length % 10 === 0;
};

TwoOfFiveReader.prototype._decode = function () {
    var startInfo,
        endInfo,
        self = this,
        code,
        result = [],
        decodedCodes = [],
        counters;

    startInfo = self._findStart();
    if (!startInfo) {
        return null;
    }
    decodedCodes.push(startInfo);

    endInfo = self._findEnd();
    if (!endInfo) {
        return null;
    }

    counters = self._fillCounters(startInfo.end, endInfo.start, false);
    if (!self._verifyCounterLength(counters)) {
        return null;
    }
    code = self._decodePayload(counters, result, decodedCodes);
    if (!code) {
        return null;
    }
    if (result.length < 5) {
        return null;
    }

    decodedCodes.push(endInfo);
    return {
        code: result.join(""),
        start: startInfo.start,
        end: endInfo.end,
        startInfo: startInfo,
        decodedCodes: decodedCodes
    };
};

exports.default = TwoOfFiveReader;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CodabarReader() {
    _barcode_reader2.default.call(this);
    this._counters = [];
}

var properties = {
    ALPHABETH_STRING: { value: "0123456789-$:/.+ABCD" },
    ALPHABET: { value: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 45, 36, 58, 47, 46, 43, 65, 66, 67, 68] },
    CHARACTER_ENCODINGS: { value: [0x003, 0x006, 0x009, 0x060, 0x012, 0x042, 0x021, 0x024, 0x030, 0x048, 0x00c, 0x018, 0x045, 0x051, 0x054, 0x015, 0x01A, 0x029, 0x00B, 0x00E] },
    START_END: { value: [0x01A, 0x029, 0x00B, 0x00E] },
    MIN_ENCODED_CHARS: { value: 4 },
    MAX_ACCEPTABLE: { value: 2.0 },
    PADDING: { value: 1.5 },
    FORMAT: { value: "codabar", writeable: false }
};

CodabarReader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
CodabarReader.prototype.constructor = CodabarReader;

CodabarReader.prototype._decode = function () {
    var self = this,
        result = [],
        start,
        decodedChar,
        pattern,
        nextStart,
        end;

    this._counters = self._fillCounters();
    start = self._findStart();
    if (!start) {
        return null;
    }
    nextStart = start.startCounter;

    do {
        pattern = self._toPattern(nextStart);
        if (pattern < 0) {
            return null;
        }
        decodedChar = self._patternToChar(pattern);
        if (decodedChar < 0) {
            return null;
        }
        result.push(decodedChar);
        nextStart += 8;
        if (result.length > 1 && self._isStartEnd(pattern)) {
            break;
        }
    } while (nextStart < self._counters.length);

    // verify end
    if (result.length - 2 < self.MIN_ENCODED_CHARS || !self._isStartEnd(pattern)) {
        return null;
    }

    // verify end white space
    if (!self._verifyWhitespace(start.startCounter, nextStart - 8)) {
        return null;
    }

    if (!self._validateResult(result, start.startCounter)) {
        return null;
    }

    nextStart = nextStart > self._counters.length ? self._counters.length : nextStart;
    end = start.start + self._sumCounters(start.startCounter, nextStart - 8);

    return {
        code: result.join(""),
        start: start.start,
        end: end,
        startInfo: start,
        decodedCodes: result
    };
};

CodabarReader.prototype._verifyWhitespace = function (startCounter, endCounter) {
    if (startCounter - 1 <= 0 || this._counters[startCounter - 1] >= this._calculatePatternLength(startCounter) / 2.0) {
        if (endCounter + 8 >= this._counters.length || this._counters[endCounter + 7] >= this._calculatePatternLength(endCounter) / 2.0) {
            return true;
        }
    }
    return false;
};

CodabarReader.prototype._calculatePatternLength = function (offset) {
    var i,
        sum = 0;

    for (i = offset; i < offset + 7; i++) {
        sum += this._counters[i];
    }

    return sum;
};

CodabarReader.prototype._thresholdResultPattern = function (result, startCounter) {
    var self = this,
        categorization = {
        space: {
            narrow: { size: 0, counts: 0, min: 0, max: Number.MAX_VALUE },
            wide: { size: 0, counts: 0, min: 0, max: Number.MAX_VALUE }
        },
        bar: {
            narrow: { size: 0, counts: 0, min: 0, max: Number.MAX_VALUE },
            wide: { size: 0, counts: 0, min: 0, max: Number.MAX_VALUE }
        }
    },
        kind,
        cat,
        i,
        j,
        pos = startCounter,
        pattern;

    for (i = 0; i < result.length; i++) {
        pattern = self._charToPattern(result[i]);
        for (j = 6; j >= 0; j--) {
            kind = (j & 1) === 2 ? categorization.bar : categorization.space;
            cat = (pattern & 1) === 1 ? kind.wide : kind.narrow;
            cat.size += self._counters[pos + j];
            cat.counts++;
            pattern >>= 1;
        }
        pos += 8;
    }

    ["space", "bar"].forEach(function (key) {
        var newkind = categorization[key];
        newkind.wide.min = Math.floor((newkind.narrow.size / newkind.narrow.counts + newkind.wide.size / newkind.wide.counts) / 2);
        newkind.narrow.max = Math.ceil(newkind.wide.min);
        newkind.wide.max = Math.ceil((newkind.wide.size * self.MAX_ACCEPTABLE + self.PADDING) / newkind.wide.counts);
    });

    return categorization;
};

CodabarReader.prototype._charToPattern = function (char) {
    var self = this,
        charCode = char.charCodeAt(0),
        i;

    for (i = 0; i < self.ALPHABET.length; i++) {
        if (self.ALPHABET[i] === charCode) {
            return self.CHARACTER_ENCODINGS[i];
        }
    }
    return 0x0;
};

CodabarReader.prototype._validateResult = function (result, startCounter) {
    var self = this,
        thresholds = self._thresholdResultPattern(result, startCounter),
        i,
        j,
        kind,
        cat,
        size,
        pos = startCounter,
        pattern;

    for (i = 0; i < result.length; i++) {
        pattern = self._charToPattern(result[i]);
        for (j = 6; j >= 0; j--) {
            kind = (j & 1) === 0 ? thresholds.bar : thresholds.space;
            cat = (pattern & 1) === 1 ? kind.wide : kind.narrow;
            size = self._counters[pos + j];
            if (size < cat.min || size > cat.max) {
                return false;
            }
            pattern >>= 1;
        }
        pos += 8;
    }
    return true;
};

CodabarReader.prototype._patternToChar = function (pattern) {
    var i,
        self = this;

    for (i = 0; i < self.CHARACTER_ENCODINGS.length; i++) {
        if (self.CHARACTER_ENCODINGS[i] === pattern) {
            return String.fromCharCode(self.ALPHABET[i]);
        }
    }
    return -1;
};

CodabarReader.prototype._computeAlternatingThreshold = function (offset, end) {
    var i,
        min = Number.MAX_VALUE,
        max = 0,
        counter;

    for (i = offset; i < end; i += 2) {
        counter = this._counters[i];
        if (counter > max) {
            max = counter;
        }
        if (counter < min) {
            min = counter;
        }
    }

    return (min + max) / 2.0 | 0;
};

CodabarReader.prototype._toPattern = function (offset) {
    var numCounters = 7,
        end = offset + numCounters,
        barThreshold,
        spaceThreshold,
        bitmask = 1 << numCounters - 1,
        pattern = 0,
        i,
        threshold;

    if (end > this._counters.length) {
        return -1;
    }

    barThreshold = this._computeAlternatingThreshold(offset, end);
    spaceThreshold = this._computeAlternatingThreshold(offset + 1, end);

    for (i = 0; i < numCounters; i++) {
        threshold = (i & 1) === 0 ? barThreshold : spaceThreshold;
        if (this._counters[offset + i] > threshold) {
            pattern |= bitmask;
        }
        bitmask >>= 1;
    }

    return pattern;
};

CodabarReader.prototype._isStartEnd = function (pattern) {
    var i;

    for (i = 0; i < this.START_END.length; i++) {
        if (this.START_END[i] === pattern) {
            return true;
        }
    }
    return false;
};

CodabarReader.prototype._sumCounters = function (start, end) {
    var i,
        sum = 0;

    for (i = start; i < end; i++) {
        sum += this._counters[i];
    }
    return sum;
};

CodabarReader.prototype._findStart = function () {
    var self = this,
        i,
        pattern,
        start = self._nextUnset(self._row),
        end;

    for (i = 1; i < this._counters.length; i++) {
        pattern = self._toPattern(i);
        if (pattern !== -1 && self._isStartEnd(pattern)) {
            // TODO: Look for whitespace ahead
            start += self._sumCounters(0, i);
            end = start + self._sumCounters(i, i + 8);
            return {
                start: start,
                end: end,
                startCounter: i,
                endCounter: i + 8
            };
        }
    }
};

exports.default = CodabarReader;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Code128Reader() {
    _barcode_reader2.default.call(this);
}

var properties = {
    CODE_SHIFT: { value: 98 },
    CODE_C: { value: 99 },
    CODE_B: { value: 100 },
    CODE_A: { value: 101 },
    START_CODE_A: { value: 103 },
    START_CODE_B: { value: 104 },
    START_CODE_C: { value: 105 },
    STOP_CODE: { value: 106 },
    CODE_PATTERN: { value: [[2, 1, 2, 2, 2, 2], [2, 2, 2, 1, 2, 2], [2, 2, 2, 2, 2, 1], [1, 2, 1, 2, 2, 3], [1, 2, 1, 3, 2, 2], [1, 3, 1, 2, 2, 2], [1, 2, 2, 2, 1, 3], [1, 2, 2, 3, 1, 2], [1, 3, 2, 2, 1, 2], [2, 2, 1, 2, 1, 3], [2, 2, 1, 3, 1, 2], [2, 3, 1, 2, 1, 2], [1, 1, 2, 2, 3, 2], [1, 2, 2, 1, 3, 2], [1, 2, 2, 2, 3, 1], [1, 1, 3, 2, 2, 2], [1, 2, 3, 1, 2, 2], [1, 2, 3, 2, 2, 1], [2, 2, 3, 2, 1, 1], [2, 2, 1, 1, 3, 2], [2, 2, 1, 2, 3, 1], [2, 1, 3, 2, 1, 2], [2, 2, 3, 1, 1, 2], [3, 1, 2, 1, 3, 1], [3, 1, 1, 2, 2, 2], [3, 2, 1, 1, 2, 2], [3, 2, 1, 2, 2, 1], [3, 1, 2, 2, 1, 2], [3, 2, 2, 1, 1, 2], [3, 2, 2, 2, 1, 1], [2, 1, 2, 1, 2, 3], [2, 1, 2, 3, 2, 1], [2, 3, 2, 1, 2, 1], [1, 1, 1, 3, 2, 3], [1, 3, 1, 1, 2, 3], [1, 3, 1, 3, 2, 1], [1, 1, 2, 3, 1, 3], [1, 3, 2, 1, 1, 3], [1, 3, 2, 3, 1, 1], [2, 1, 1, 3, 1, 3], [2, 3, 1, 1, 1, 3], [2, 3, 1, 3, 1, 1], [1, 1, 2, 1, 3, 3], [1, 1, 2, 3, 3, 1], [1, 3, 2, 1, 3, 1], [1, 1, 3, 1, 2, 3], [1, 1, 3, 3, 2, 1], [1, 3, 3, 1, 2, 1], [3, 1, 3, 1, 2, 1], [2, 1, 1, 3, 3, 1], [2, 3, 1, 1, 3, 1], [2, 1, 3, 1, 1, 3], [2, 1, 3, 3, 1, 1], [2, 1, 3, 1, 3, 1], [3, 1, 1, 1, 2, 3], [3, 1, 1, 3, 2, 1], [3, 3, 1, 1, 2, 1], [3, 1, 2, 1, 1, 3], [3, 1, 2, 3, 1, 1], [3, 3, 2, 1, 1, 1], [3, 1, 4, 1, 1, 1], [2, 2, 1, 4, 1, 1], [4, 3, 1, 1, 1, 1], [1, 1, 1, 2, 2, 4], [1, 1, 1, 4, 2, 2], [1, 2, 1, 1, 2, 4], [1, 2, 1, 4, 2, 1], [1, 4, 1, 1, 2, 2], [1, 4, 1, 2, 2, 1], [1, 1, 2, 2, 1, 4], [1, 1, 2, 4, 1, 2], [1, 2, 2, 1, 1, 4], [1, 2, 2, 4, 1, 1], [1, 4, 2, 1, 1, 2], [1, 4, 2, 2, 1, 1], [2, 4, 1, 2, 1, 1], [2, 2, 1, 1, 1, 4], [4, 1, 3, 1, 1, 1], [2, 4, 1, 1, 1, 2], [1, 3, 4, 1, 1, 1], [1, 1, 1, 2, 4, 2], [1, 2, 1, 1, 4, 2], [1, 2, 1, 2, 4, 1], [1, 1, 4, 2, 1, 2], [1, 2, 4, 1, 1, 2], [1, 2, 4, 2, 1, 1], [4, 1, 1, 2, 1, 2], [4, 2, 1, 1, 1, 2], [4, 2, 1, 2, 1, 1], [2, 1, 2, 1, 4, 1], [2, 1, 4, 1, 2, 1], [4, 1, 2, 1, 2, 1], [1, 1, 1, 1, 4, 3], [1, 1, 1, 3, 4, 1], [1, 3, 1, 1, 4, 1], [1, 1, 4, 1, 1, 3], [1, 1, 4, 3, 1, 1], [4, 1, 1, 1, 1, 3], [4, 1, 1, 3, 1, 1], [1, 1, 3, 1, 4, 1], [1, 1, 4, 1, 3, 1], [3, 1, 1, 1, 4, 1], [4, 1, 1, 1, 3, 1], [2, 1, 1, 4, 1, 2], [2, 1, 1, 2, 1, 4], [2, 1, 1, 2, 3, 2], [2, 3, 3, 1, 1, 1, 2]] },
    SINGLE_CODE_ERROR: { value: 0.64 },
    AVG_CODE_ERROR: { value: 0.30 },
    FORMAT: { value: "code_128", writeable: false },
    MODULE_INDICES: { value: { bar: [0, 2, 4], space: [1, 3, 5] } }
};

Code128Reader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
Code128Reader.prototype.constructor = Code128Reader;

Code128Reader.prototype._decodeCode = function (start, correction) {
    var counter = [0, 0, 0, 0, 0, 0],
        i,
        self = this,
        offset = start,
        isWhite = !self._row[offset],
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: start,
        end: start,
        correction: {
            bar: 1,
            space: 1
        }
    },
        code,
        error;

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                if (correction) {
                    self._correct(counter, correction);
                }
                for (code = 0; code < self.CODE_PATTERN.length; code++) {
                    error = self._matchPattern(counter, self.CODE_PATTERN[code]);
                    if (error < bestMatch.error) {
                        bestMatch.code = code;
                        bestMatch.error = error;
                    }
                }
                bestMatch.end = i;
                if (bestMatch.code === -1 || bestMatch.error > self.AVG_CODE_ERROR) {
                    return null;
                }
                if (self.CODE_PATTERN[bestMatch.code]) {
                    bestMatch.correction.bar = calculateCorrection(self.CODE_PATTERN[bestMatch.code], counter, this.MODULE_INDICES.bar);
                    bestMatch.correction.space = calculateCorrection(self.CODE_PATTERN[bestMatch.code], counter, this.MODULE_INDICES.space);
                }
                return bestMatch;
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

Code128Reader.prototype._correct = function (counter, correction) {
    this._correctBars(counter, correction.bar, this.MODULE_INDICES.bar);
    this._correctBars(counter, correction.space, this.MODULE_INDICES.space);
};

Code128Reader.prototype._findStart = function () {
    var counter = [0, 0, 0, 0, 0, 0],
        i,
        self = this,
        offset = self._nextSet(self._row),
        isWhite = false,
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0,
        correction: {
            bar: 1,
            space: 1
        }
    },
        code,
        error,
        j,
        sum;

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                sum = 0;
                for (j = 0; j < counter.length; j++) {
                    sum += counter[j];
                }
                for (code = self.START_CODE_A; code <= self.START_CODE_C; code++) {
                    error = self._matchPattern(counter, self.CODE_PATTERN[code]);
                    if (error < bestMatch.error) {
                        bestMatch.code = code;
                        bestMatch.error = error;
                    }
                }
                if (bestMatch.error < self.AVG_CODE_ERROR) {
                    bestMatch.start = i - sum;
                    bestMatch.end = i;
                    bestMatch.correction.bar = calculateCorrection(self.CODE_PATTERN[bestMatch.code], counter, this.MODULE_INDICES.bar);
                    bestMatch.correction.space = calculateCorrection(self.CODE_PATTERN[bestMatch.code], counter, this.MODULE_INDICES.space);
                    return bestMatch;
                }

                for (j = 0; j < 4; j++) {
                    counter[j] = counter[j + 2];
                }
                counter[4] = 0;
                counter[5] = 0;
                counterPos--;
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

Code128Reader.prototype._decode = function () {
    var self = this,
        startInfo = self._findStart(),
        code = null,
        done = false,
        result = [],
        multiplier = 0,
        checksum = 0,
        codeset,
        rawResult = [],
        decodedCodes = [],
        shiftNext = false,
        unshift,
        removeLastCharacter = true;

    if (startInfo === null) {
        return null;
    }
    code = {
        code: startInfo.code,
        start: startInfo.start,
        end: startInfo.end,
        correction: {
            bar: startInfo.correction.bar,
            space: startInfo.correction.space
        }
    };
    decodedCodes.push(code);
    checksum = code.code;
    switch (code.code) {
        case self.START_CODE_A:
            codeset = self.CODE_A;
            break;
        case self.START_CODE_B:
            codeset = self.CODE_B;
            break;
        case self.START_CODE_C:
            codeset = self.CODE_C;
            break;
        default:
            return null;
    }

    while (!done) {
        unshift = shiftNext;
        shiftNext = false;
        code = self._decodeCode(code.end, code.correction);
        if (code !== null) {
            if (code.code !== self.STOP_CODE) {
                removeLastCharacter = true;
            }

            if (code.code !== self.STOP_CODE) {
                rawResult.push(code.code);
                multiplier++;
                checksum += multiplier * code.code;
            }
            decodedCodes.push(code);

            switch (codeset) {
                case self.CODE_A:
                    if (code.code < 64) {
                        result.push(String.fromCharCode(32 + code.code));
                    } else if (code.code < 96) {
                        result.push(String.fromCharCode(code.code - 64));
                    } else {
                        if (code.code !== self.STOP_CODE) {
                            removeLastCharacter = false;
                        }
                        switch (code.code) {
                            case self.CODE_SHIFT:
                                shiftNext = true;
                                codeset = self.CODE_B;
                                break;
                            case self.CODE_B:
                                codeset = self.CODE_B;
                                break;
                            case self.CODE_C:
                                codeset = self.CODE_C;
                                break;
                            case self.STOP_CODE:
                                done = true;
                                break;
                        }
                    }
                    break;
                case self.CODE_B:
                    if (code.code < 96) {
                        result.push(String.fromCharCode(32 + code.code));
                    } else {
                        if (code.code !== self.STOP_CODE) {
                            removeLastCharacter = false;
                        }
                        switch (code.code) {
                            case self.CODE_SHIFT:
                                shiftNext = true;
                                codeset = self.CODE_A;
                                break;
                            case self.CODE_A:
                                codeset = self.CODE_A;
                                break;
                            case self.CODE_C:
                                codeset = self.CODE_C;
                                break;
                            case self.STOP_CODE:
                                done = true;
                                break;
                        }
                    }
                    break;
                case self.CODE_C:
                    if (code.code < 100) {
                        result.push(code.code < 10 ? "0" + code.code : code.code);
                    } else {
                        if (code.code !== self.STOP_CODE) {
                            removeLastCharacter = false;
                        }
                        switch (code.code) {
                            case self.CODE_A:
                                codeset = self.CODE_A;
                                break;
                            case self.CODE_B:
                                codeset = self.CODE_B;
                                break;
                            case self.STOP_CODE:
                                done = true;
                                break;
                        }
                    }
                    break;
            }
        } else {
            done = true;
        }
        if (unshift) {
            codeset = codeset === self.CODE_A ? self.CODE_B : self.CODE_A;
        }
    }

    if (code === null) {
        return null;
    }

    code.end = self._nextUnset(self._row, code.end);
    if (!self._verifyTrailingWhitespace(code)) {
        return null;
    }

    checksum -= multiplier * rawResult[rawResult.length - 1];
    if (checksum % 103 !== rawResult[rawResult.length - 1]) {
        return null;
    }

    if (!result.length) {
        return null;
    }

    // remove last code from result (checksum)
    if (removeLastCharacter) {
        result.splice(result.length - 1, 1);
    }

    return {
        code: result.join(""),
        start: startInfo.start,
        end: code.end,
        codeset: codeset,
        startInfo: startInfo,
        decodedCodes: decodedCodes,
        endInfo: code
    };
};

_barcode_reader2.default.prototype._verifyTrailingWhitespace = function (endInfo) {
    var self = this,
        trailingWhitespaceEnd;

    trailingWhitespaceEnd = endInfo.end + (endInfo.end - endInfo.start) / 2;
    if (trailingWhitespaceEnd < self._row.length) {
        if (self._matchRange(endInfo.end, trailingWhitespaceEnd, 0)) {
            return endInfo;
        }
    }
    return null;
};

function calculateCorrection(expected, normalized, indices) {
    var length = indices.length,
        sumNormalized = 0,
        sumExpected = 0;

    while (length--) {
        sumExpected += expected[indices[length]];
        sumNormalized += normalized[indices[length]];
    }
    return sumExpected / sumNormalized;
}

exports.default = Code128Reader;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _code_39_reader = __webpack_require__(19);

var _code_39_reader2 = _interopRequireDefault(_code_39_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Code39VINReader() {
    _code_39_reader2.default.call(this);
}

var patterns = {
    IOQ: /[IOQ]/g,
    AZ09: /[A-Z0-9]{17}/
};

Code39VINReader.prototype = Object.create(_code_39_reader2.default.prototype);
Code39VINReader.prototype.constructor = Code39VINReader;

// Cribbed from:
// https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/client/result/VINResultParser.java
Code39VINReader.prototype._decode = function () {
    var result = _code_39_reader2.default.prototype._decode.apply(this);
    if (!result) {
        return null;
    }

    var code = result.code;

    if (!code) {
        return null;
    }

    code = code.replace(patterns.IOQ, '');

    if (!code.match(patterns.AZ09)) {
        if (false) {
            console.log('Failed AZ09 pattern code:', code);
        }
        return null;
    }

    if (!this._checkChecksum(code)) {
        return null;
    }

    result.code = code;
    return result;
};

Code39VINReader.prototype._checkChecksum = function (code) {
    // TODO
    return !!code;
};

exports.default = Code39VINReader;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

var _array_helper = __webpack_require__(4);

var _array_helper2 = _interopRequireDefault(_array_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Code93Reader() {
    _barcode_reader2.default.call(this);
}

var ALPHABETH_STRING = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%abcd*";

var properties = {
    ALPHABETH_STRING: { value: ALPHABETH_STRING },
    ALPHABET: { value: ALPHABETH_STRING.split('').map(function (char) {
            return char.charCodeAt(0);
        }) },
    CHARACTER_ENCODINGS: { value: [0x114, 0x148, 0x144, 0x142, 0x128, 0x124, 0x122, 0x150, 0x112, 0x10A, 0x1A8, 0x1A4, 0x1A2, 0x194, 0x192, 0x18A, 0x168, 0x164, 0x162, 0x134, 0x11A, 0x158, 0x14C, 0x146, 0x12C, 0x116, 0x1B4, 0x1B2, 0x1AC, 0x1A6, 0x196, 0x19A, 0x16C, 0x166, 0x136, 0x13A, 0x12E, 0x1D4, 0x1D2, 0x1CA, 0x16E, 0x176, 0x1AE, 0x126, 0x1DA, 0x1D6, 0x132, 0x15E] },
    ASTERISK: { value: 0x15E },
    FORMAT: { value: "code_93", writeable: false }
};

Code93Reader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
Code93Reader.prototype.constructor = Code93Reader;

Code93Reader.prototype._decode = function () {
    var self = this,
        counters = [0, 0, 0, 0, 0, 0],
        result = [],
        start = self._findStart(),
        decodedChar,
        lastStart,
        pattern,
        nextStart;

    if (!start) {
        return null;
    }
    nextStart = self._nextSet(self._row, start.end);

    do {
        counters = self._toCounters(nextStart, counters);
        pattern = self._toPattern(counters);
        if (pattern < 0) {
            return null;
        }
        decodedChar = self._patternToChar(pattern);
        if (decodedChar < 0) {
            return null;
        }
        result.push(decodedChar);
        lastStart = nextStart;
        nextStart += _array_helper2.default.sum(counters);
        nextStart = self._nextSet(self._row, nextStart);
    } while (decodedChar !== '*');
    result.pop();

    if (!result.length) {
        return null;
    }

    if (!self._verifyEnd(lastStart, nextStart, counters)) {
        return null;
    }

    if (!self._verifyChecksums(result)) {
        return null;
    }

    result = result.slice(0, result.length - 2);
    if ((result = self._decodeExtended(result)) === null) {
        return null;
    };

    return {
        code: result.join(""),
        start: start.start,
        end: nextStart,
        startInfo: start,
        decodedCodes: result
    };
};

Code93Reader.prototype._verifyEnd = function (lastStart, nextStart) {
    if (lastStart === nextStart || !this._row[nextStart]) {
        return false;
    }
    return true;
};

Code93Reader.prototype._patternToChar = function (pattern) {
    var i,
        self = this;

    for (i = 0; i < self.CHARACTER_ENCODINGS.length; i++) {
        if (self.CHARACTER_ENCODINGS[i] === pattern) {
            return String.fromCharCode(self.ALPHABET[i]);
        }
    }
    return -1;
};

Code93Reader.prototype._toPattern = function (counters) {
    var numCounters = counters.length;
    var pattern = 0;
    var sum = 0;
    for (var i = 0; i < numCounters; i++) {
        sum += counters[i];
    }

    for (var _i = 0; _i < numCounters; _i++) {
        var normalized = Math.round(counters[_i] * 9 / sum);
        if (normalized < 1 || normalized > 4) {
            return -1;
        }
        if ((_i & 1) === 0) {
            for (var j = 0; j < normalized; j++) {
                pattern = pattern << 1 | 1;
            }
        } else {
            pattern <<= normalized;
        }
    }

    return pattern;
};

Code93Reader.prototype._findStart = function () {
    var self = this,
        offset = self._nextSet(self._row),
        patternStart = offset,
        counter = [0, 0, 0, 0, 0, 0],
        counterPos = 0,
        isWhite = false,
        i,
        j,
        whiteSpaceMustStart;

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                // find start pattern
                if (self._toPattern(counter) === self.ASTERISK) {
                    whiteSpaceMustStart = Math.floor(Math.max(0, patternStart - (i - patternStart) / 4));
                    if (self._matchRange(whiteSpaceMustStart, patternStart, 0)) {
                        return {
                            start: patternStart,
                            end: i
                        };
                    }
                }

                patternStart += counter[0] + counter[1];
                for (j = 0; j < 4; j++) {
                    counter[j] = counter[j + 2];
                }
                counter[4] = 0;
                counter[5] = 0;
                counterPos--;
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

Code93Reader.prototype._decodeExtended = function (charArray) {
    var length = charArray.length;
    var result = [];
    for (var i = 0; i < length; i++) {
        var char = charArray[i];
        if (char >= 'a' && char <= 'd') {
            if (i > length - 2) {
                return null;
            }
            var nextChar = charArray[++i];
            var nextCharCode = nextChar.charCodeAt(0);
            var decodedChar = void 0;
            switch (char) {
                case 'a':
                    if (nextChar >= 'A' && nextChar <= 'Z') {
                        decodedChar = String.fromCharCode(nextCharCode - 64);
                    } else {
                        return null;
                    }
                    break;
                case 'b':
                    if (nextChar >= 'A' && nextChar <= 'E') {
                        decodedChar = String.fromCharCode(nextCharCode - 38);
                    } else if (nextChar >= 'F' && nextChar <= 'J') {
                        decodedChar = String.fromCharCode(nextCharCode - 11);
                    } else if (nextChar >= 'K' && nextChar <= 'O') {
                        decodedChar = String.fromCharCode(nextCharCode + 16);
                    } else if (nextChar >= 'P' && nextChar <= 'S') {
                        decodedChar = String.fromCharCode(nextCharCode + 43);
                    } else if (nextChar >= 'T' && nextChar <= 'Z') {
                        decodedChar = String.fromCharCode(127);
                    } else {
                        return null;
                    }
                    break;
                case 'c':
                    if (nextChar >= 'A' && nextChar <= 'O') {
                        decodedChar = String.fromCharCode(nextCharCode - 32);
                    } else if (nextChar === 'Z') {
                        decodedChar = ':';
                    } else {
                        return null;
                    }
                    break;
                case 'd':
                    if (nextChar >= 'A' && nextChar <= 'Z') {
                        decodedChar = String.fromCharCode(nextCharCode + 32);
                    } else {
                        return null;
                    }
                    break;
            }
            result.push(decodedChar);
        } else {
            result.push(char);
        }
    }
    return result;
};

Code93Reader.prototype._verifyChecksums = function (charArray) {
    return this._matchCheckChar(charArray, charArray.length - 2, 20) && this._matchCheckChar(charArray, charArray.length - 1, 15);
};

Code93Reader.prototype._matchCheckChar = function (charArray, index, maxWeight) {
    var _this = this;

    var arrayToCheck = charArray.slice(0, index);
    var length = arrayToCheck.length;
    var weightedSums = arrayToCheck.reduce(function (sum, char, i) {
        var weight = (i * -1 + (length - 1)) % maxWeight + 1;
        var value = _this.ALPHABET.indexOf(char.charCodeAt(0));
        return sum + weight * value;
    }, 0);

    var checkChar = this.ALPHABET[weightedSums % 47];
    return checkChar === charArray[index].charCodeAt(0);
};

exports.default = Code93Reader;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EAN2Reader() {
    _ean_reader2.default.call(this);
}

var properties = {
    FORMAT: { value: "ean_2", writeable: false }
};

EAN2Reader.prototype = Object.create(_ean_reader2.default.prototype, properties);
EAN2Reader.prototype.constructor = EAN2Reader;

EAN2Reader.prototype.decode = function (row, start) {
    this._row = row;
    var counters = [0, 0, 0, 0],
        codeFrequency = 0,
        i = 0,
        offset = start,
        end = this._row.length,
        code,
        result = [],
        decodedCodes = [];

    for (i = 0; i < 2 && offset < end; i++) {
        code = this._decodeCode(offset);
        if (!code) {
            return null;
        }
        decodedCodes.push(code);
        result.push(code.code % 10);
        if (code.code >= this.CODE_G_START) {
            codeFrequency |= 1 << 1 - i;
        }
        if (i != 1) {
            offset = this._nextSet(this._row, code.end);
            offset = this._nextUnset(this._row, offset);
        }
    }

    if (result.length != 2 || parseInt(result.join("")) % 4 !== codeFrequency) {
        return null;
    }
    return {
        code: result.join(""),
        decodedCodes: decodedCodes,
        end: code.end
    };
};

exports.default = EAN2Reader;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EAN5Reader() {
    _ean_reader2.default.call(this);
}

var properties = {
    FORMAT: { value: "ean_5", writeable: false }
};

var CHECK_DIGIT_ENCODINGS = [24, 20, 18, 17, 12, 6, 3, 10, 9, 5];

EAN5Reader.prototype = Object.create(_ean_reader2.default.prototype, properties);
EAN5Reader.prototype.constructor = EAN5Reader;

EAN5Reader.prototype.decode = function (row, start) {
    this._row = row;
    var counters = [0, 0, 0, 0],
        codeFrequency = 0,
        i = 0,
        offset = start,
        end = this._row.length,
        code,
        result = [],
        decodedCodes = [];

    for (i = 0; i < 5 && offset < end; i++) {
        code = this._decodeCode(offset);
        if (!code) {
            return null;
        }
        decodedCodes.push(code);
        result.push(code.code % 10);
        if (code.code >= this.CODE_G_START) {
            codeFrequency |= 1 << 4 - i;
        }
        if (i != 4) {
            offset = this._nextSet(this._row, code.end);
            offset = this._nextUnset(this._row, offset);
        }
    }

    if (result.length != 5) {
        return null;
    }

    if (extensionChecksum(result) !== determineCheckDigit(codeFrequency)) {
        return null;
    }
    return {
        code: result.join(""),
        decodedCodes: decodedCodes,
        end: code.end
    };
};

function determineCheckDigit(codeFrequency) {
    var i;
    for (i = 0; i < 10; i++) {
        if (codeFrequency === CHECK_DIGIT_ENCODINGS[i]) {
            return i;
        }
    }
    return null;
}

function extensionChecksum(result) {
    var length = result.length,
        sum = 0,
        i;

    for (i = length - 2; i >= 0; i -= 2) {
        sum += result[i];
    }
    sum *= 3;
    for (i = length - 1; i >= 0; i -= 2) {
        sum += result[i];
    }
    sum *= 3;
    return sum % 10;
}

exports.default = EAN5Reader;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EAN8Reader(opts, supplements) {
    _ean_reader2.default.call(this, opts, supplements);
}

var properties = {
    FORMAT: { value: "ean_8", writeable: false }
};

EAN8Reader.prototype = Object.create(_ean_reader2.default.prototype, properties);
EAN8Reader.prototype.constructor = EAN8Reader;

EAN8Reader.prototype._decodePayload = function (code, result, decodedCodes) {
    var i,
        self = this;

    for (i = 0; i < 4; i++) {
        code = self._decodeCode(code.end, self.CODE_G_START);
        if (!code) {
            return null;
        }
        result.push(code.code);
        decodedCodes.push(code);
    }

    code = self._findPattern(self.MIDDLE_PATTERN, code.end, true, false);
    if (code === null) {
        return null;
    }
    decodedCodes.push(code);

    for (i = 0; i < 4; i++) {
        code = self._decodeCode(code.end, self.CODE_G_START);
        if (!code) {
            return null;
        }
        decodedCodes.push(code);
        result.push(code.code);
    }

    return code;
};

exports.default = EAN8Reader;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _merge2 = __webpack_require__(36);

var _merge3 = _interopRequireDefault(_merge2);

var _barcode_reader = __webpack_require__(0);

var _barcode_reader2 = _interopRequireDefault(_barcode_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function I2of5Reader(opts) {
    opts = (0, _merge3.default)(getDefaulConfig(), opts);
    _barcode_reader2.default.call(this, opts);
    this.barSpaceRatio = [1, 1];
    if (opts.normalizeBarSpaceWidth) {
        this.SINGLE_CODE_ERROR = 0.38;
        this.AVG_CODE_ERROR = 0.09;
    }
}

function getDefaulConfig() {
    var config = {};

    Object.keys(I2of5Reader.CONFIG_KEYS).forEach(function (key) {
        config[key] = I2of5Reader.CONFIG_KEYS[key].default;
    });
    return config;
}

var N = 1,
    W = 3,
    properties = {
    START_PATTERN: { value: [N, N, N, N] },
    STOP_PATTERN: { value: [N, N, W] },
    CODE_PATTERN: { value: [[N, N, W, W, N], [W, N, N, N, W], [N, W, N, N, W], [W, W, N, N, N], [N, N, W, N, W], [W, N, W, N, N], [N, W, W, N, N], [N, N, N, W, W], [W, N, N, W, N], [N, W, N, W, N]] },
    SINGLE_CODE_ERROR: { value: 0.78, writable: true },
    AVG_CODE_ERROR: { value: 0.25, writable: true },
    MAX_CORRECTION_FACTOR: { value: 5 },
    FORMAT: { value: "i2of5" }
};

I2of5Reader.prototype = Object.create(_barcode_reader2.default.prototype, properties);
I2of5Reader.prototype.constructor = I2of5Reader;

I2of5Reader.prototype._matchPattern = function (counter, code) {
    if (this.config.normalizeBarSpaceWidth) {
        var i,
            counterSum = [0, 0],
            codeSum = [0, 0],
            correction = [0, 0],
            correctionRatio = this.MAX_CORRECTION_FACTOR,
            correctionRatioInverse = 1 / correctionRatio;

        for (i = 0; i < counter.length; i++) {
            counterSum[i % 2] += counter[i];
            codeSum[i % 2] += code[i];
        }
        correction[0] = codeSum[0] / counterSum[0];
        correction[1] = codeSum[1] / counterSum[1];

        correction[0] = Math.max(Math.min(correction[0], correctionRatio), correctionRatioInverse);
        correction[1] = Math.max(Math.min(correction[1], correctionRatio), correctionRatioInverse);
        this.barSpaceRatio = correction;
        for (i = 0; i < counter.length; i++) {
            counter[i] *= this.barSpaceRatio[i % 2];
        }
    }
    return _barcode_reader2.default.prototype._matchPattern.call(this, counter, code);
};

I2of5Reader.prototype._findPattern = function (pattern, offset, isWhite, tryHarder) {
    var counter = [],
        self = this,
        i,
        counterPos = 0,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0
    },
        error,
        j,
        sum,
        normalized,
        epsilon = self.AVG_CODE_ERROR;

    isWhite = isWhite || false;
    tryHarder = tryHarder || false;

    if (!offset) {
        offset = self._nextSet(self._row);
    }

    for (i = 0; i < pattern.length; i++) {
        counter[i] = 0;
    }

    for (i = offset; i < self._row.length; i++) {
        if (self._row[i] ^ isWhite) {
            counter[counterPos]++;
        } else {
            if (counterPos === counter.length - 1) {
                sum = 0;
                for (j = 0; j < counter.length; j++) {
                    sum += counter[j];
                }
                error = self._matchPattern(counter, pattern);
                if (error < epsilon) {
                    bestMatch.error = error;
                    bestMatch.start = i - sum;
                    bestMatch.end = i;
                    return bestMatch;
                }
                if (tryHarder) {
                    for (j = 0; j < counter.length - 2; j++) {
                        counter[j] = counter[j + 2];
                    }
                    counter[counter.length - 2] = 0;
                    counter[counter.length - 1] = 0;
                    counterPos--;
                } else {
                    return null;
                }
            } else {
                counterPos++;
            }
            counter[counterPos] = 1;
            isWhite = !isWhite;
        }
    }
    return null;
};

I2of5Reader.prototype._findStart = function () {
    var self = this,
        leadingWhitespaceStart,
        offset = self._nextSet(self._row),
        startInfo,
        narrowBarWidth = 1;

    while (!startInfo) {
        startInfo = self._findPattern(self.START_PATTERN, offset, false, true);
        if (!startInfo) {
            return null;
        }
        narrowBarWidth = Math.floor((startInfo.end - startInfo.start) / 4);
        leadingWhitespaceStart = startInfo.start - narrowBarWidth * 10;
        if (leadingWhitespaceStart >= 0) {
            if (self._matchRange(leadingWhitespaceStart, startInfo.start, 0)) {
                return startInfo;
            }
        }
        offset = startInfo.end;
        startInfo = null;
    }
};

I2of5Reader.prototype._verifyTrailingWhitespace = function (endInfo) {
    var self = this,
        trailingWhitespaceEnd;

    trailingWhitespaceEnd = endInfo.end + (endInfo.end - endInfo.start) / 2;
    if (trailingWhitespaceEnd < self._row.length) {
        if (self._matchRange(endInfo.end, trailingWhitespaceEnd, 0)) {
            return endInfo;
        }
    }
    return null;
};

I2of5Reader.prototype._findEnd = function () {
    var self = this,
        endInfo,
        tmp;

    self._row.reverse();
    endInfo = self._findPattern(self.STOP_PATTERN);
    self._row.reverse();

    if (endInfo === null) {
        return null;
    }

    // reverse numbers
    tmp = endInfo.start;
    endInfo.start = self._row.length - endInfo.end;
    endInfo.end = self._row.length - tmp;

    return endInfo !== null ? self._verifyTrailingWhitespace(endInfo) : null;
};

I2of5Reader.prototype._decodePair = function (counterPair) {
    var i,
        code,
        codes = [],
        self = this;

    for (i = 0; i < counterPair.length; i++) {
        code = self._decodeCode(counterPair[i]);
        if (!code) {
            return null;
        }
        codes.push(code);
    }
    return codes;
};

I2of5Reader.prototype._decodeCode = function (counter) {
    var j,
        self = this,
        sum = 0,
        normalized,
        error,
        epsilon = self.AVG_CODE_ERROR,
        code,
        bestMatch = {
        error: Number.MAX_VALUE,
        code: -1,
        start: 0,
        end: 0
    };

    for (j = 0; j < counter.length; j++) {
        sum += counter[j];
    }
    for (code = 0; code < self.CODE_PATTERN.length; code++) {
        error = self._matchPattern(counter, self.CODE_PATTERN[code]);
        if (error < bestMatch.error) {
            bestMatch.code = code;
            bestMatch.error = error;
        }
    }
    if (bestMatch.error < epsilon) {
        return bestMatch;
    }
};

I2of5Reader.prototype._decodePayload = function (counters, result, decodedCodes) {
    var i,
        self = this,
        pos = 0,
        counterLength = counters.length,
        counterPair = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        codes;

    while (pos < counterLength) {
        for (i = 0; i < 5; i++) {
            counterPair[0][i] = counters[pos] * this.barSpaceRatio[0];
            counterPair[1][i] = counters[pos + 1] * this.barSpaceRatio[1];
            pos += 2;
        }
        codes = self._decodePair(counterPair);
        if (!codes) {
            return null;
        }
        for (i = 0; i < codes.length; i++) {
            result.push(codes[i].code + "");
            decodedCodes.push(codes[i]);
        }
    }
    return codes;
};

I2of5Reader.prototype._verifyCounterLength = function (counters) {
    return counters.length % 10 === 0;
};

I2of5Reader.prototype._decode = function () {
    var startInfo,
        endInfo,
        self = this,
        code,
        result = [],
        decodedCodes = [],
        counters;

    startInfo = self._findStart();
    if (!startInfo) {
        return null;
    }
    decodedCodes.push(startInfo);

    endInfo = self._findEnd();
    if (!endInfo) {
        return null;
    }

    counters = self._fillCounters(startInfo.end, endInfo.start, false);
    if (!self._verifyCounterLength(counters)) {
        return null;
    }
    code = self._decodePayload(counters, result, decodedCodes);
    if (!code) {
        return null;
    }
    if (result.length % 2 !== 0 || result.length < 6) {
        return null;
    }

    decodedCodes.push(endInfo);
    return {
        code: result.join(""),
        start: startInfo.start,
        end: endInfo.end,
        startInfo: startInfo,
        decodedCodes: decodedCodes
    };
};

I2of5Reader.CONFIG_KEYS = {
    normalizeBarSpaceWidth: {
        'type': 'boolean',
        'default': false,
        'description': 'If true, the reader tries to normalize the' + 'width-difference between bars and spaces'
    }
};

exports.default = I2of5Reader;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function UPCEReader(opts, supplements) {
    _ean_reader2.default.call(this, opts, supplements);
}

var properties = {
    CODE_FREQUENCY: { value: [[56, 52, 50, 49, 44, 38, 35, 42, 41, 37], [7, 11, 13, 14, 19, 25, 28, 21, 22, 26]] },
    STOP_PATTERN: { value: [1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7] },
    FORMAT: { value: "upc_e", writeable: false }
};

UPCEReader.prototype = Object.create(_ean_reader2.default.prototype, properties);
UPCEReader.prototype.constructor = UPCEReader;

UPCEReader.prototype._decodePayload = function (code, result, decodedCodes) {
    var i,
        self = this,
        codeFrequency = 0x0;

    for (i = 0; i < 6; i++) {
        code = self._decodeCode(code.end);
        if (!code) {
            return null;
        }
        if (code.code >= self.CODE_G_START) {
            code.code = code.code - self.CODE_G_START;
            codeFrequency |= 1 << 5 - i;
        }
        result.push(code.code);
        decodedCodes.push(code);
    }
    if (!self._determineParity(codeFrequency, result)) {
        return null;
    }

    return code;
};

UPCEReader.prototype._determineParity = function (codeFrequency, result) {
    var i, nrSystem;

    for (nrSystem = 0; nrSystem < this.CODE_FREQUENCY.length; nrSystem++) {
        for (i = 0; i < this.CODE_FREQUENCY[nrSystem].length; i++) {
            if (codeFrequency === this.CODE_FREQUENCY[nrSystem][i]) {
                result.unshift(nrSystem);
                result.push(i);
                return true;
            }
        }
    }
    return false;
};

UPCEReader.prototype._convertToUPCA = function (result) {
    var upca = [result[0]],
        lastDigit = result[result.length - 2];

    if (lastDigit <= 2) {
        upca = upca.concat(result.slice(1, 3)).concat([lastDigit, 0, 0, 0, 0]).concat(result.slice(3, 6));
    } else if (lastDigit === 3) {
        upca = upca.concat(result.slice(1, 4)).concat([0, 0, 0, 0, 0]).concat(result.slice(4, 6));
    } else if (lastDigit === 4) {
        upca = upca.concat(result.slice(1, 5)).concat([0, 0, 0, 0, 0, result[5]]);
    } else {
        upca = upca.concat(result.slice(1, 6)).concat([0, 0, 0, 0, lastDigit]);
    }

    upca.push(result[result.length - 1]);
    return upca;
};

UPCEReader.prototype._checksum = function (result) {
    return _ean_reader2.default.prototype._checksum.call(this, this._convertToUPCA(result));
};

UPCEReader.prototype._findEnd = function (offset, isWhite) {
    isWhite = true;
    return _ean_reader2.default.prototype._findEnd.call(this, offset, isWhite);
};

UPCEReader.prototype._verifyTrailingWhitespace = function (endInfo) {
    var self = this,
        trailingWhitespaceEnd;

    trailingWhitespaceEnd = endInfo.end + (endInfo.end - endInfo.start) / 2;
    if (trailingWhitespaceEnd < self._row.length) {
        if (self._matchRange(endInfo.end, trailingWhitespaceEnd, 0)) {
            return endInfo;
        }
    }
};

exports.default = UPCEReader;

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _ean_reader = __webpack_require__(2);

var _ean_reader2 = _interopRequireDefault(_ean_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function UPCReader(opts, supplements) {
    _ean_reader2.default.call(this, opts, supplements);
}

var properties = {
    FORMAT: { value: "upc_a", writeable: false }
};

UPCReader.prototype = Object.create(_ean_reader2.default.prototype, properties);
UPCReader.prototype.constructor = UPCReader;

UPCReader.prototype._decode = function () {
    var result = _ean_reader2.default.prototype._decode.call(this);

    if (result && result.code && result.code.length === 13 && result.code.charAt(0) === "0") {
        result.code = result.code.substring(1);
        return result;
    }
    return null;
};

exports.default = UPCReader;

/***/ }),
/* 54 */
/***/ (function(module, exports) {

module.exports = dot

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1]
}

/***/ }),
/* 55 */
/***/ (function(module, exports) {

module.exports = clone;

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
    var out = new Float32Array(3)
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(85),
    hashDelete = __webpack_require__(86),
    hashGet = __webpack_require__(87),
    hashHas = __webpack_require__(88),
    hashSet = __webpack_require__(89);

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(99),
    mapCacheDelete = __webpack_require__(100),
    mapCacheGet = __webpack_require__(101),
    mapCacheHas = __webpack_require__(102),
    mapCacheSet = __webpack_require__(103);

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(7),
    stackClear = __webpack_require__(111),
    stackDelete = __webpack_require__(112),
    stackGet = __webpack_require__(113),
    stackHas = __webpack_require__(114),
    stackSet = __webpack_require__(115);

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(3);

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(73),
    isArguments = __webpack_require__(30),
    isArray = __webpack_require__(31),
    isBuffer = __webpack_require__(32),
    isIndex = __webpack_require__(26),
    isTypedArray = __webpack_require__(34);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(13),
    eq = __webpack_require__(12);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(1);

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var createBaseFor = __webpack_require__(82);

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(9),
    isObjectLike = __webpack_require__(5);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(16),
    isMasked = __webpack_require__(93),
    isObject = __webpack_require__(1),
    toSource = __webpack_require__(116);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(9),
    isLength = __webpack_require__(33),
    isObjectLike = __webpack_require__(5);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(1),
    isPrototype = __webpack_require__(27),
    nativeKeysIn = __webpack_require__(104);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(58),
    assignMergeValue = __webpack_require__(22),
    baseFor = __webpack_require__(64),
    baseMergeDeep = __webpack_require__(70),
    isObject = __webpack_require__(1),
    keysIn = __webpack_require__(35),
    safeGet = __webpack_require__(28);

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var assignMergeValue = __webpack_require__(22),
    cloneBuffer = __webpack_require__(76),
    cloneTypedArray = __webpack_require__(77),
    copyArray = __webpack_require__(78),
    initCloneObject = __webpack_require__(90),
    isArguments = __webpack_require__(30),
    isArray = __webpack_require__(31),
    isArrayLikeObject = __webpack_require__(118),
    isBuffer = __webpack_require__(32),
    isFunction = __webpack_require__(16),
    isObject = __webpack_require__(1),
    isPlainObject = __webpack_require__(119),
    isTypedArray = __webpack_require__(34),
    safeGet = __webpack_require__(28),
    toPlainObject = __webpack_require__(121);

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__(29),
    overRest = __webpack_require__(108),
    setToString = __webpack_require__(109);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__(117),
    defineProperty = __webpack_require__(23),
    identity = __webpack_require__(29);

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),
/* 73 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),
/* 74 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__(59);

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(3);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17)(module)))

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(75);

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),
/* 78 */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(62),
    baseAssignValue = __webpack_require__(13);

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(3);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__(71),
    isIterateeCall = __webpack_require__(91);

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),
/* 82 */
/***/ (function(module, exports) {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(21);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 84 */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(11);

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),
/* 86 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(11);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(11);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(11);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__(63),
    getPrototype = __webpack_require__(25),
    isPrototype = __webpack_require__(27);

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(12),
    isArrayLike = __webpack_require__(15),
    isIndex = __webpack_require__(26),
    isObject = __webpack_require__(1);

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),
/* 92 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(80);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),
/* 94 */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(8);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(8);

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(8);

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(8);

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(56),
    ListCache = __webpack_require__(7),
    Map = __webpack_require__(20);

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(10);

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(10);

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(10);

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(10);

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),
/* 104 */
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(24);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17)(module)))

/***/ }),
/* 106 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 107 */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__(60);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__(72),
    shortOut = __webpack_require__(110);

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),
/* 110 */
/***/ (function(module, exports) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(7);

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),
/* 112 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),
/* 113 */
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),
/* 114 */
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(7),
    Map = __webpack_require__(20),
    MapCache = __webpack_require__(57);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),
/* 116 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),
/* 117 */
/***/ (function(module, exports) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__(15),
    isObjectLike = __webpack_require__(5);

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(9),
    getPrototype = __webpack_require__(25),
    isObjectLike = __webpack_require__(5);

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),
/* 120 */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(79),
    keysIn = __webpack_require__(35);

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;


/***/ }),
/* 122 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(37);


/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA3NGIxZDMyNjA5YzlhOGRhYjRiZCIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2JhcmNvZGVfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzT2JqZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvZWFuX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fcm9vdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2FycmF5X2hlbHBlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc09iamVjdExpa2UuanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbC12ZWMyL2Nsb25lLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19MaXN0Q2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2VxLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlQXNzaWduVmFsdWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbW1vbi9pbWFnZV93cmFwcGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvY29kZV8zOV9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX01hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fU3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19hc3NpZ25NZXJnZVZhbHVlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19kZWZpbmVQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0UHJvdG90eXBlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pc0luZGV4LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pc1Byb3RvdHlwZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc2FmZUdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pZGVudGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQnVmZmVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzTGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzVHlwZWRBcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9rZXlzSW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvbWVyZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3F1YWdnYS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2NsdXN0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbW1vbi9jdl91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL3N1YkltYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9kZWNvZGVyL2JhcmNvZGVfZGVjb2Rlcl8yLmpzIiwid2VicGFjazovLy8uL3NyYy9kZWNvZGVyL2JyZXNlbmhhbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyLzJvZjVfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvY29kYWJhcl9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9jb2RlXzEyOF9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9jb2RlXzM5X3Zpbl9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9jb2RlXzkzX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2Vhbl8yX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2Vhbl81X3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2Vhbl84X3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2kyb2Y1X3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL3VwY19lX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL3VwY19yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbC12ZWMyL2RvdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsLXZlYzMvY2xvbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX0hhc2guanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX01hcENhY2hlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19TdGFjay5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fVWludDhBcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXBwbHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlQ3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlRm9yLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlSXNBcmd1bWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUtleXNJbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZU1lcmdlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlTWVyZ2VEZWVwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlUmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlVGltZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VVbmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY2xvbmVBcnJheUJ1ZmZlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY2xvbmVCdWZmZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Nsb25lVHlwZWRBcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY29weUFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jb3B5T2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY3JlYXRlQmFzZUZvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0UmF3VGFnLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRWYWx1ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faGFzaENsZWFyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoRGVsZXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoSGFzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoU2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pbml0Q2xvbmVPYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzSXRlcmF0ZWVDYWxsLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pc0tleWFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzTWFza2VkLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVDbGVhci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbGlzdENhY2hlRGVsZXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVHZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbGlzdENhY2hlU2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZURlbGV0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcENhY2hlSGFzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZVNldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbmF0aXZlS2V5c0luLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19ub2RlVXRpbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX292ZXJBcmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX292ZXJSZXN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zZXRUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc2hvcnRPdXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3N0YWNrRGVsZXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zdGFja0dldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tIYXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3N0YWNrU2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL190b1NvdXJjZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FycmF5TGlrZU9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL3N0dWJGYWxzZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC90b1BsYWluT2JqZWN0LmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiXSwibmFtZXMiOlsiQmFyY29kZVJlYWRlciIsImNvbmZpZyIsInN1cHBsZW1lbnRzIiwiX3JvdyIsInByb3RvdHlwZSIsIl9uZXh0VW5zZXQiLCJsaW5lIiwic3RhcnQiLCJpIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwiX21hdGNoUGF0dGVybiIsImNvdW50ZXIiLCJjb2RlIiwibWF4U2luZ2xlRXJyb3IiLCJlcnJvciIsInNpbmdsZUVycm9yIiwic3VtIiwibW9kdWxvIiwiYmFyV2lkdGgiLCJjb3VudCIsInNjYWxlZCIsIlNJTkdMRV9DT0RFX0VSUk9SIiwiTnVtYmVyIiwiTUFYX1ZBTFVFIiwiTWF0aCIsImFicyIsIl9uZXh0U2V0Iiwib2Zmc2V0IiwiX2NvcnJlY3RCYXJzIiwiY29ycmVjdGlvbiIsImluZGljZXMiLCJ0bXAiLCJfbWF0Y2hUcmFjZSIsImNtcENvdW50ZXIiLCJlcHNpbG9uIiwic2VsZiIsImlzV2hpdGUiLCJjb3VudGVyUG9zIiwiYmVzdE1hdGNoIiwicHVzaCIsImVuZCIsImRlY29kZVBhdHRlcm4iLCJwYXR0ZXJuIiwicmVzdWx0IiwiX2RlY29kZSIsInJldmVyc2UiLCJkaXJlY3Rpb24iLCJESVJFQ1RJT04iLCJSRVZFUlNFIiwiRk9SV0FSRCIsImZvcm1hdCIsIkZPUk1BVCIsIl9tYXRjaFJhbmdlIiwidmFsdWUiLCJfZmlsbENvdW50ZXJzIiwiY291bnRlcnMiLCJfdG9Db3VudGVycyIsIm51bUNvdW50ZXJzIiwiaW5pdCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5Iiwid3JpdGVhYmxlIiwiRXhjZXB0aW9uIiwiU3RhcnROb3RGb3VuZEV4Y2VwdGlvbiIsIkNvZGVOb3RGb3VuZEV4Y2VwdGlvbiIsIlBhdHRlcm5Ob3RGb3VuZEV4Y2VwdGlvbiIsIkNPTkZJR19LRVlTIiwiRUFOUmVhZGVyIiwib3B0cyIsImdldERlZmF1bENvbmZpZyIsImNhbGwiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImRlZmF1bHQiLCJwcm9wZXJ0aWVzIiwiQ09ERV9MX1NUQVJUIiwiQ09ERV9HX1NUQVJUIiwiU1RBUlRfUEFUVEVSTiIsIlNUT1BfUEFUVEVSTiIsIk1JRERMRV9QQVRURVJOIiwiRVhURU5TSU9OX1NUQVJUX1BBVFRFUk4iLCJDT0RFX1BBVFRFUk4iLCJDT0RFX0ZSRVFVRU5DWSIsIkFWR19DT0RFX0VSUk9SIiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJfZGVjb2RlQ29kZSIsImNvZGVyYW5nZSIsIl9maW5kUGF0dGVybiIsInRyeUhhcmRlciIsImoiLCJfZmluZFN0YXJ0IiwibGVhZGluZ1doaXRlc3BhY2VTdGFydCIsInN0YXJ0SW5mbyIsIl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UiLCJlbmRJbmZvIiwidHJhaWxpbmdXaGl0ZXNwYWNlRW5kIiwiX2ZpbmRFbmQiLCJfY2FsY3VsYXRlRmlyc3REaWdpdCIsImNvZGVGcmVxdWVuY3kiLCJfZGVjb2RlUGF5bG9hZCIsImRlY29kZWRDb2RlcyIsImZpcnN0RGlnaXQiLCJ1bnNoaWZ0IiwicmVzdWx0SW5mbyIsIl9jaGVja3N1bSIsImV4dCIsIl9kZWNvZGVFeHRlbnNpb25zIiwibGFzdENvZGUiLCJzdXBwbGVtZW50Iiwiam9pbiIsImNvZGVzZXQiLCJkZWNvZGUiLCJhcnIiLCJ2YWwiLCJsIiwic2h1ZmZsZSIsIngiLCJmbG9vciIsInJhbmRvbSIsInRvUG9pbnRMaXN0Iiwicm93Iiwicm93cyIsInRocmVzaG9sZCIsInNjb3JlRnVuYyIsInF1ZXVlIiwiYXBwbHkiLCJtYXhJbmRleCIsIm1heCIsInZlYzIiLCJjbG9uZSIsInJlcXVpcmUiLCJJbWFnZVdyYXBwZXIiLCJzaXplIiwiZGF0YSIsIkFycmF5VHlwZSIsImluaXRpYWxpemUiLCJ5IiwiQXJyYXkiLCJVaW50OEFycmF5IiwiaW5JbWFnZVdpdGhCb3JkZXIiLCJpbWdSZWYiLCJib3JkZXIiLCJzYW1wbGUiLCJpbkltZyIsImx4IiwibHkiLCJ3IiwiYmFzZSIsImEiLCJiIiwiYyIsImQiLCJlIiwiY2xlYXJBcnJheSIsImFycmF5Iiwic3ViSW1hZ2UiLCJmcm9tIiwic3ViSW1hZ2VBc0NvcHkiLCJpbWFnZVdyYXBwZXIiLCJzaXplWSIsInNpemVYIiwiY29weVRvIiwic3JjRGF0YSIsImRzdERhdGEiLCJnZXQiLCJnZXRTYWZlIiwiaW5kZXhNYXBwaW5nIiwic2V0IiwiemVyb0JvcmRlciIsIndpZHRoIiwiaGVpZ2h0IiwiaW52ZXJ0IiwiY29udm9sdmUiLCJrZXJuZWwiLCJreCIsImt5Iiwia1NpemUiLCJhY2N1IiwibW9tZW50cyIsImxhYmVsY291bnQiLCJ5c3EiLCJsYWJlbHN1bSIsImxhYmVsIiwibXUxMSIsIm11MDIiLCJtdTIwIiwieF8iLCJ5XyIsIlBJIiwiUElfNCIsIm0wMCIsIm0wMSIsIm0xMCIsIm0xMSIsIm0wMiIsIm0yMCIsInRoZXRhIiwicmFkIiwiaXNOYU4iLCJhdGFuIiwidmVjIiwiY29zIiwic2luIiwic2hvdyIsImNhbnZhcyIsInNjYWxlIiwiY3R4IiwiZnJhbWUiLCJjdXJyZW50IiwicGl4ZWwiLCJnZXRDb250ZXh0IiwiZ2V0SW1hZ2VEYXRhIiwicHV0SW1hZ2VEYXRhIiwib3ZlcmxheSIsImhzdiIsInJnYiIsIndoaXRlUmdiIiwiYmxhY2tSZ2IiLCJDb2RlMzlSZWFkZXIiLCJBTFBIQUJFVEhfU1RSSU5HIiwiQUxQSEFCRVQiLCJDSEFSQUNURVJfRU5DT0RJTkdTIiwiQVNURVJJU0siLCJkZWNvZGVkQ2hhciIsImxhc3RTdGFydCIsIm5leHRTdGFydCIsIl90b1BhdHRlcm4iLCJfcGF0dGVyblRvQ2hhciIsInBvcCIsInBhdHRlcm5TaXplIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiX2ZpbmROZXh0V2lkdGgiLCJtaW5XaWR0aCIsIm1heE5hcnJvd1dpZHRoIiwibnVtV2lkZUJhcnMiLCJ3aWRlQmFyV2lkdGgiLCJwYXR0ZXJuU3RhcnQiLCJ3aGl0ZVNwYWNlTXVzdFN0YXJ0IiwiZG90IiwicG9pbnQiLCJwb2ludHMiLCJjZW50ZXIiLCJwb2ludE1hcCIsImFkZCIsInVwZGF0ZUNlbnRlciIsInBvaW50VG9BZGQiLCJpZCIsImZpdHMiLCJvdGhlclBvaW50Iiwic2ltaWxhcml0eSIsImdldFBvaW50cyIsImdldENlbnRlciIsImNyZWF0ZVBvaW50IiwibmV3UG9pbnQiLCJwcm9wZXJ0eSIsImltYWdlUmVmIiwiY29tcHV0ZUludGVncmFsSW1hZ2UyIiwiY29tcHV0ZUludGVncmFsSW1hZ2UiLCJ0aHJlc2hvbGRJbWFnZSIsImNvbXB1dGVIaXN0b2dyYW0iLCJzaGFycGVuTGluZSIsImRldGVybWluZU90c3VUaHJlc2hvbGQiLCJvdHN1VGhyZXNob2xkIiwiY29tcHV0ZUJpbmFyeUltYWdlIiwiY2x1c3RlciIsImRpbGF0ZSIsImVyb2RlIiwic3VidHJhY3QiLCJiaXR3aXNlT3IiLCJjb3VudE5vblplcm8iLCJ0b3BHZW5lcmljIiwiZ3JheUFycmF5RnJvbUltYWdlIiwiZ3JheUFycmF5RnJvbUNvbnRleHQiLCJncmF5QW5kSGFsZlNhbXBsZUZyb21DYW52YXNEYXRhIiwiY29tcHV0ZUdyYXkiLCJsb2FkSW1hZ2VBcnJheSIsImhhbGZTYW1wbGUiLCJoc3YycmdiIiwiX2NvbXB1dGVEaXZpc29ycyIsImNhbGN1bGF0ZVBhdGNoU2l6ZSIsIl9wYXJzZUNTU0RpbWVuc2lvblZhbHVlcyIsImNvbXB1dGVJbWFnZUFyZWEiLCJ2ZWMzIiwidGhhdCIsInRvVmVjMiIsInRvVmVjMyIsInJvdW5kIiwiaW50ZWdyYWxXcmFwcGVyIiwiaW1hZ2VEYXRhIiwiaW50ZWdyYWxJbWFnZURhdGEiLCJwb3NBIiwicG9zQiIsInBvc0MiLCJwb3NEIiwidiIsInUiLCJ0YXJnZXRXcmFwcGVyIiwidGFyZ2V0RGF0YSIsImJpdHNQZXJQaXhlbCIsImJpdFNoaWZ0IiwiYnVja2V0Q250IiwiaGlzdCIsIkludDMyQXJyYXkiLCJsZWZ0IiwicmlnaHQiLCJweCIsIm14IiwiZGV0ZXJtaW5lVGhyZXNob2xkIiwidmV0IiwicDEiLCJwMiIsInAxMiIsImsiLCJtMSIsIm0yIiwibTEyIiwiQSIsIkIiLCJDIiwiRCIsImF2ZyIsImNsdXN0ZXJzIiwiYWRkVG9DbHVzdGVyIiwiZm91bmQiLCJUcmFjZXIiLCJ0cmFjZSIsIml0ZXJhdGlvbiIsIm1heEl0ZXJhdGlvbnMiLCJ0b3AiLCJjZW50ZXJQb3MiLCJjdXJyZW50UG9zIiwiaWR4IiwiZm9yd2FyZCIsInRvIiwidG9JZHgiLCJwcmVkaWN0ZWRQb3MiLCJ0aHJlc2hvbGRYIiwidGhyZXNob2xkWSIsIm1hdGNoIiwicG9zIiwicHJlZGljdGVkIiwiRElMQVRFIiwiRVJPREUiLCJpbkltYWdlV3JhcHBlciIsIm91dEltYWdlV3JhcHBlciIsImluSW1hZ2VEYXRhIiwib3V0SW1hZ2VEYXRhIiwieVN0YXJ0MSIsInlTdGFydDIiLCJ4U3RhcnQxIiwieFN0YXJ0MiIsImFJbWFnZVdyYXBwZXIiLCJiSW1hZ2VXcmFwcGVyIiwicmVzdWx0SW1hZ2VXcmFwcGVyIiwiYUltYWdlRGF0YSIsImJJbWFnZURhdGEiLCJjSW1hZ2VEYXRhIiwibGlzdCIsIm1pbklkeCIsIm1pbiIsInNjb3JlIiwiaGl0IiwiaXRlbSIsImh0bWxJbWFnZSIsIm9mZnNldFgiLCJkcmF3SW1hZ2UiLCJjdHhEYXRhIiwiY2FudmFzRGF0YSIsIm91dEFycmF5IiwidG9wUm93SWR4IiwiYm90dG9tUm93SWR4IiwiZW5kSWR4Iiwib3V0V2lkdGgiLCJvdXRJbWdJZHgiLCJpbldpZHRoIiwic2luZ2xlQ2hhbm5lbCIsInNyYyIsImNhbGxiYWNrIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW1nIiwiSW1hZ2UiLCJvbmxvYWQiLCJpbkltZ1dyYXBwZXIiLCJvdXRJbWdXcmFwcGVyIiwib3V0SW1nIiwiaCIsInMiLCJtIiwiciIsImciLCJuIiwibGFyZ2VEaXZpc29ycyIsImRpdmlzb3JzIiwic3FydCIsImNvbmNhdCIsIl9jb21wdXRlSW50ZXJzZWN0aW9uIiwiYXJyMSIsImFycjIiLCJwYXRjaFNpemUiLCJpbWdTaXplIiwiZGl2aXNvcnNYIiwiZGl2aXNvcnNZIiwid2lkZVNpZGUiLCJjb21tb24iLCJuck9mUGF0Y2hlc0xpc3QiLCJuck9mUGF0Y2hlc01hcCIsIm5yT2ZQYXRjaGVzSWR4IiwibWVkaXVtIiwibnJPZlBhdGNoZXMiLCJkZXNpcmVkUGF0Y2hTaXplIiwib3B0aW1hbFBhdGNoU2l6ZSIsImZpbmRQYXRjaFNpemVGb3JEaXZpc29ycyIsImRpbWVuc2lvbiIsInBhcnNlRmxvYXQiLCJ1bml0IiwiaW5kZXhPZiIsIl9kaW1lbnNpb25zQ29udmVydGVycyIsImNvbnRleHQiLCJib3R0b20iLCJpbnB1dFdpZHRoIiwiaW5wdXRIZWlnaHQiLCJhcmVhIiwicGFyc2VkQXJlYSIsInJlZHVjZSIsInBhcnNlZCIsImNhbGN1bGF0ZWQiLCJzeCIsInN5Iiwic3ciLCJzaCIsIlN1YkltYWdlIiwiSSIsIm9yaWdpbmFsU2l6ZSIsInVwZGF0ZURhdGEiLCJpbWFnZSIsInVwZGF0ZUZyb20iLCJ2ZWMyY2xvbmUiLCJSRUFERVJTIiwiY29kZV8xMjhfcmVhZGVyIiwiZWFuX3JlYWRlciIsImVhbl81X3JlYWRlciIsImVhbl8yX3JlYWRlciIsImVhbl84X3JlYWRlciIsImNvZGVfMzlfcmVhZGVyIiwiY29kZV8zOV92aW5fcmVhZGVyIiwiY29kYWJhcl9yZWFkZXIiLCJ1cGNfcmVhZGVyIiwidXBjX2VfcmVhZGVyIiwiaTJvZjVfcmVhZGVyIiwiY29kZV85M19yZWFkZXIiLCJpbnB1dEltYWdlV3JhcHBlciIsIl9iYXJjb2RlUmVhZGVycyIsImluaXRSZWFkZXJzIiwicmVhZGVycyIsInJlYWRlckNvbmZpZyIsInJlYWRlciIsImNvbmZpZ3VyYXRpb24iLCJjb25zb2xlIiwibG9nIiwibWFwIiwiZ2V0RXh0ZW5kZWRMaW5lIiwiYW5nbGUiLCJleHRlbmRMaW5lIiwiYW1vdW50IiwiZXh0ZW5zaW9uIiwiY2VpbCIsImdldExpbmUiLCJib3giLCJ0cnlEZWNvZGUiLCJiYXJjb2RlTGluZSIsImdldEJhcmNvZGVMaW5lIiwidG9CaW5hcnlMaW5lIiwiY29kZVJlc3VsdCIsInRyeURlY29kZUJydXRlRm9yY2UiLCJsaW5lQW5nbGUiLCJzaWRlTGVuZ3RoIiwicG93Iiwic2xpY2VzIiwiZGlyIiwieGRpciIsInlkaXIiLCJnZXRMaW5lTGVuZ3RoIiwiZGVjb2RlRnJvbUJvdW5kaW5nQm94IiwibGluZUxlbmd0aCIsImF0YW4yIiwic2luZ2xlQ29sb3JJbWFnZURhdGEiLCJVaW50OENsYW1wZWRBcnJheSIsIkJyZXNlbmhhbSIsIlNsb3BlIiwiRElSIiwiVVAiLCJET1dOIiwieDAiLCJ5MCIsIngxIiwieTEiLCJzdGVlcCIsImRlbHRheCIsImRlbHRheSIsInlzdGVwIiwicmVhZCIsInNsb3BlIiwic2xvcGUyIiwiZXh0cmVtYSIsImN1cnJlbnREaXIiLCJyVGhyZXNob2xkIiwiZGVidWciLCJwcmludEZyZXF1ZW5jeSIsImJlZ2luUGF0aCIsInN0cm9rZVN0eWxlIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwiY2xvc2VQYXRoIiwicHJpbnRQYXR0ZXJuIiwiZmlsbENvbG9yIiwiZmlsbFJlY3QiLCJUd29PZkZpdmVSZWFkZXIiLCJiYXJTcGFjZVJhdGlvIiwiTiIsIlciLCJ3cml0YWJsZSIsInN0YXJ0UGF0dGVybkxlbmd0aCIsIm5hcnJvd0JhcldpZHRoIiwibm9ybWFsaXplZCIsImNvdW50ZXJMZW5ndGgiLCJfdmVyaWZ5Q291bnRlckxlbmd0aCIsIkNvZGFiYXJSZWFkZXIiLCJfY291bnRlcnMiLCJTVEFSVF9FTkQiLCJNSU5fRU5DT0RFRF9DSEFSUyIsIk1BWF9BQ0NFUFRBQkxFIiwiUEFERElORyIsInN0YXJ0Q291bnRlciIsIl9pc1N0YXJ0RW5kIiwiX3ZlcmlmeVdoaXRlc3BhY2UiLCJfdmFsaWRhdGVSZXN1bHQiLCJfc3VtQ291bnRlcnMiLCJlbmRDb3VudGVyIiwiX2NhbGN1bGF0ZVBhdHRlcm5MZW5ndGgiLCJfdGhyZXNob2xkUmVzdWx0UGF0dGVybiIsImNhdGVnb3JpemF0aW9uIiwic3BhY2UiLCJuYXJyb3ciLCJjb3VudHMiLCJ3aWRlIiwiYmFyIiwia2luZCIsImNhdCIsIl9jaGFyVG9QYXR0ZXJuIiwibmV3a2luZCIsImNoYXIiLCJjaGFyQ29kZSIsImNoYXJDb2RlQXQiLCJ0aHJlc2hvbGRzIiwiX2NvbXB1dGVBbHRlcm5hdGluZ1RocmVzaG9sZCIsImJhclRocmVzaG9sZCIsInNwYWNlVGhyZXNob2xkIiwiYml0bWFzayIsIkNvZGUxMjhSZWFkZXIiLCJDT0RFX1NISUZUIiwiQ09ERV9DIiwiQ09ERV9CIiwiQ09ERV9BIiwiU1RBUlRfQ09ERV9BIiwiU1RBUlRfQ09ERV9CIiwiU1RBUlRfQ09ERV9DIiwiU1RPUF9DT0RFIiwiTU9EVUxFX0lORElDRVMiLCJfY29ycmVjdCIsImNhbGN1bGF0ZUNvcnJlY3Rpb24iLCJkb25lIiwibXVsdGlwbGllciIsImNoZWNrc3VtIiwicmF3UmVzdWx0Iiwic2hpZnROZXh0IiwicmVtb3ZlTGFzdENoYXJhY3RlciIsInNwbGljZSIsImV4cGVjdGVkIiwic3VtTm9ybWFsaXplZCIsInN1bUV4cGVjdGVkIiwiQ29kZTM5VklOUmVhZGVyIiwicGF0dGVybnMiLCJJT1EiLCJBWjA5IiwicmVwbGFjZSIsIl9jaGVja0NoZWNrc3VtIiwiQ29kZTkzUmVhZGVyIiwic3BsaXQiLCJfdmVyaWZ5RW5kIiwiX3ZlcmlmeUNoZWNrc3VtcyIsInNsaWNlIiwiX2RlY29kZUV4dGVuZGVkIiwiY2hhckFycmF5IiwibmV4dENoYXIiLCJuZXh0Q2hhckNvZGUiLCJfbWF0Y2hDaGVja0NoYXIiLCJpbmRleCIsIm1heFdlaWdodCIsImFycmF5VG9DaGVjayIsIndlaWdodGVkU3VtcyIsIndlaWdodCIsImNoZWNrQ2hhciIsIkVBTjJSZWFkZXIiLCJwYXJzZUludCIsIkVBTjVSZWFkZXIiLCJDSEVDS19ESUdJVF9FTkNPRElOR1MiLCJleHRlbnNpb25DaGVja3N1bSIsImRldGVybWluZUNoZWNrRGlnaXQiLCJFQU44UmVhZGVyIiwiSTJvZjVSZWFkZXIiLCJub3JtYWxpemVCYXJTcGFjZVdpZHRoIiwiTUFYX0NPUlJFQ1RJT05fRkFDVE9SIiwiY291bnRlclN1bSIsImNvZGVTdW0iLCJjb3JyZWN0aW9uUmF0aW8iLCJjb3JyZWN0aW9uUmF0aW9JbnZlcnNlIiwiX2RlY29kZVBhaXIiLCJjb3VudGVyUGFpciIsImNvZGVzIiwiVVBDRVJlYWRlciIsIl9kZXRlcm1pbmVQYXJpdHkiLCJuclN5c3RlbSIsIl9jb252ZXJ0VG9VUENBIiwidXBjYSIsImxhc3REaWdpdCIsIlVQQ1JlYWRlciIsImNoYXJBdCIsInN1YnN0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztB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QixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7O0FDWEE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDMUJBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsRUFBRTtBQUNiLFdBQVcsTUFBTTtBQUNqQixhQUFhLEVBQUU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsV0FBVyxRQUFRO0FBQ25CLGFBQWEsTUFB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2pCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsU0FBUztBQUN0QixVQUFVO0FBQ1Y7QUFDQSxhQUFhLFNBQVM7QUFDdEIsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDIiwiZmlsZSI6InF1YWdnYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIlF1YWdnYVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJRdWFnZ2FcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTIzKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA3NGIxZDMyNjA5YzlhOGRhYjRiZCIsImltcG9ydCBBcnJheUhlbHBlciBmcm9tICcuLi9jb21tb24vYXJyYXlfaGVscGVyJztcblxuZnVuY3Rpb24gQmFyY29kZVJlYWRlcihjb25maWcsIHN1cHBsZW1lbnRzKSB7XG4gICAgdGhpcy5fcm93ID0gW107XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwge307XG4gICAgdGhpcy5zdXBwbGVtZW50cyA9IHN1cHBsZW1lbnRzO1xuICAgIHJldHVybiB0aGlzO1xufVxuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fbmV4dFVuc2V0ID0gZnVuY3Rpb24obGluZSwgc3RhcnQpIHtcbiAgICB2YXIgaTtcblxuICAgIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBsaW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghbGluZVtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbmUubGVuZ3RoO1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX21hdGNoUGF0dGVybiA9IGZ1bmN0aW9uKGNvdW50ZXIsIGNvZGUsIG1heFNpbmdsZUVycm9yKSB7XG4gICAgdmFyIGksXG4gICAgICAgIGVycm9yID0gMCxcbiAgICAgICAgc2luZ2xlRXJyb3IgPSAwLFxuICAgICAgICBzdW0gPSAwLFxuICAgICAgICBtb2R1bG8gPSAwLFxuICAgICAgICBiYXJXaWR0aCxcbiAgICAgICAgY291bnQsXG4gICAgICAgIHNjYWxlZDtcblxuICAgIG1heFNpbmdsZUVycm9yID0gbWF4U2luZ2xlRXJyb3IgfHwgdGhpcy5TSU5HTEVfQ09ERV9FUlJPUiB8fCAxO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGNvdW50ZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGNvdW50ZXJbaV07XG4gICAgICAgIG1vZHVsbyArPSBjb2RlW2ldO1xuICAgIH1cbiAgICBpZiAoc3VtIDwgbW9kdWxvKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIH1cbiAgICBiYXJXaWR0aCA9IHN1bSAvIG1vZHVsbztcbiAgICBtYXhTaW5nbGVFcnJvciAqPSBiYXJXaWR0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvdW50ID0gY291bnRlcltpXTtcbiAgICAgICAgc2NhbGVkID0gY29kZVtpXSAqIGJhcldpZHRoO1xuICAgICAgICBzaW5nbGVFcnJvciA9IE1hdGguYWJzKGNvdW50IC0gc2NhbGVkKSAvIHNjYWxlZDtcbiAgICAgICAgaWYgKHNpbmdsZUVycm9yID4gbWF4U2luZ2xlRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yICs9IHNpbmdsZUVycm9yO1xuICAgIH1cbiAgICByZXR1cm4gZXJyb3IgLyBtb2R1bG87XG59O1xuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fbmV4dFNldCA9IGZ1bmN0aW9uKGxpbmUsIG9mZnNldCkge1xuICAgIHZhciBpO1xuXG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgbGluZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobGluZVtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbmUubGVuZ3RoO1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX2NvcnJlY3RCYXJzID0gZnVuY3Rpb24oY291bnRlciwgY29ycmVjdGlvbiwgaW5kaWNlcykge1xuICAgIHZhciBsZW5ndGggPSBpbmRpY2VzLmxlbmd0aCxcbiAgICAgICAgdG1wID0gMDtcbiAgICB3aGlsZShsZW5ndGgtLSkge1xuICAgICAgICB0bXAgPSBjb3VudGVyW2luZGljZXNbbGVuZ3RoXV0gKiAoMSAtICgoMSAtIGNvcnJlY3Rpb24pIC8gMikpO1xuICAgICAgICBpZiAodG1wID4gMSkge1xuICAgICAgICAgICAgY291bnRlcltpbmRpY2VzW2xlbmd0aF1dID0gdG1wO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fbWF0Y2hUcmFjZSA9IGZ1bmN0aW9uKGNtcENvdW50ZXIsIGVwc2lsb24pIHtcbiAgICB2YXIgY291bnRlciA9IFtdLFxuICAgICAgICBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBpc1doaXRlID0gIXNlbGYuX3Jvd1tvZmZzZXRdLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yO1xuXG4gICAgaWYgKGNtcENvdW50ZXIpIHtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjbXBDb3VudGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb3VudGVyLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBjb3VudGVyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBzZWxmLl9tYXRjaFBhdHRlcm4oY291bnRlciwgY21wQ291bnRlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yIDwgZXBzaWxvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLnN0YXJ0ID0gaSAtIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb3VudGVyLnB1c2goMCk7XG4gICAgICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICAgICAgY291bnRlci5wdXNoKDApO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIGNtcENvdW50ZXIgd2FzIG5vdCBnaXZlblxuICAgIGJlc3RNYXRjaC5zdGFydCA9IG9mZnNldDtcbiAgICBiZXN0TWF0Y2guZW5kID0gc2VsZi5fcm93Lmxlbmd0aCAtIDE7XG4gICAgYmVzdE1hdGNoLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIHJldHVybiBiZXN0TWF0Y2g7XG59O1xuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5kZWNvZGVQYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgc2VsZi5fcm93ID0gcGF0dGVybjtcbiAgICByZXN1bHQgPSBzZWxmLl9kZWNvZGUoKTtcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgIHNlbGYuX3Jvdy5yZXZlcnNlKCk7XG4gICAgICAgIHJlc3VsdCA9IHNlbGYuX2RlY29kZSgpO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQuZGlyZWN0aW9uID0gQmFyY29kZVJlYWRlci5ESVJFQ1RJT04uUkVWRVJTRTtcbiAgICAgICAgICAgIHJlc3VsdC5zdGFydCA9IHNlbGYuX3Jvdy5sZW5ndGggLSByZXN1bHQuc3RhcnQ7XG4gICAgICAgICAgICByZXN1bHQuZW5kID0gc2VsZi5fcm93Lmxlbmd0aCAtIHJlc3VsdC5lbmQ7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQuZGlyZWN0aW9uID0gQmFyY29kZVJlYWRlci5ESVJFQ1RJT04uRk9SV0FSRDtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgICByZXN1bHQuZm9ybWF0ID0gc2VsZi5GT1JNQVQ7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fbWF0Y2hSYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIHZhbHVlKSB7XG4gICAgdmFyIGk7XG5cbiAgICBzdGFydCA9IHN0YXJ0IDwgMCA/IDAgOiBzdGFydDtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dbaV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fZmlsbENvdW50ZXJzID0gZnVuY3Rpb24ob2Zmc2V0LCBlbmQsIGlzV2hpdGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBpLFxuICAgICAgICBjb3VudGVycyA9IFtdO1xuXG4gICAgaXNXaGl0ZSA9ICh0eXBlb2YgaXNXaGl0ZSAhPT0gJ3VuZGVmaW5lZCcpID8gaXNXaGl0ZSA6IHRydWU7XG4gICAgb2Zmc2V0ID0gKHR5cGVvZiBvZmZzZXQgIT09ICd1bmRlZmluZWQnKSA/IG9mZnNldCA6IHNlbGYuX25leHRVbnNldChzZWxmLl9yb3cpO1xuICAgIGVuZCA9IGVuZCB8fCBzZWxmLl9yb3cubGVuZ3RoO1xuXG4gICAgY291bnRlcnNbY291bnRlclBvc10gPSAwO1xuICAgIGZvciAoaSA9IG9mZnNldDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyc1tjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgY291bnRlcnNbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3VudGVycztcbn07XG5cbkJhcmNvZGVSZWFkZXIucHJvdG90eXBlLl90b0NvdW50ZXJzID0gZnVuY3Rpb24oc3RhcnQsIGNvdW50ZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG51bUNvdW50ZXJzID0gY291bnRlci5sZW5ndGgsXG4gICAgICAgIGVuZCA9IHNlbGYuX3Jvdy5sZW5ndGgsXG4gICAgICAgIGlzV2hpdGUgPSAhc2VsZi5fcm93W3N0YXJ0XSxcbiAgICAgICAgaSxcbiAgICAgICAgY291bnRlclBvcyA9IDA7XG5cbiAgICBBcnJheUhlbHBlci5pbml0KGNvdW50ZXIsIDApO1xuXG4gICAgZm9yICggaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBudW1Db3VudGVycykge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY291bnRlcjtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCYXJjb2RlUmVhZGVyLnByb3RvdHlwZSwgXCJGT1JNQVRcIiwge1xuICAgIHZhbHVlOiAndW5rbm93bicsXG4gICAgd3JpdGVhYmxlOiBmYWxzZVxufSk7XG5cbkJhcmNvZGVSZWFkZXIuRElSRUNUSU9OID0ge1xuICAgIEZPUldBUkQ6IDEsXG4gICAgUkVWRVJTRTogLTFcbn07XG5cbkJhcmNvZGVSZWFkZXIuRXhjZXB0aW9uID0ge1xuICAgIFN0YXJ0Tm90Rm91bmRFeGNlcHRpb246IFwiU3RhcnQtSW5mbyB3YXMgbm90IGZvdW5kIVwiLFxuICAgIENvZGVOb3RGb3VuZEV4Y2VwdGlvbjogXCJDb2RlIGNvdWxkIG5vdCBiZSBmb3VuZCFcIixcbiAgICBQYXR0ZXJuTm90Rm91bmRFeGNlcHRpb246IFwiUGF0dGVybiBjb3VsZCBub3QgYmUgZm91bmQhXCJcbn07XG5cbkJhcmNvZGVSZWFkZXIuQ09ORklHX0tFWVMgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgQmFyY29kZVJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvYmFyY29kZV9yZWFkZXIuanMiLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNPYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5pbXBvcnQge21lcmdlfSBmcm9tICdsb2Rhc2gnO1xuXG5mdW5jdGlvbiBFQU5SZWFkZXIob3B0cywgc3VwcGxlbWVudHMpIHtcbiAgICBvcHRzID0gbWVyZ2UoZ2V0RGVmYXVsQ29uZmlnKCksIG9wdHMpO1xuICAgIEJhcmNvZGVSZWFkZXIuY2FsbCh0aGlzLCBvcHRzLCBzdXBwbGVtZW50cyk7XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bENvbmZpZygpIHtcbiAgICB2YXIgY29uZmlnID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhFQU5SZWFkZXIuQ09ORklHX0tFWVMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGNvbmZpZ1trZXldID0gRUFOUmVhZGVyLkNPTkZJR19LRVlTW2tleV0uZGVmYXVsdDtcbiAgICB9KTtcbiAgICByZXR1cm4gY29uZmlnO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBDT0RFX0xfU1RBUlQ6IHt2YWx1ZTogMH0sXG4gICAgQ09ERV9HX1NUQVJUOiB7dmFsdWU6IDEwfSxcbiAgICBTVEFSVF9QQVRURVJOOiB7dmFsdWU6IFsxLCAxLCAxXX0sXG4gICAgU1RPUF9QQVRURVJOOiB7dmFsdWU6IFsxLCAxLCAxXX0sXG4gICAgTUlERExFX1BBVFRFUk46IHt2YWx1ZTogWzEsIDEsIDEsIDEsIDFdfSxcbiAgICBFWFRFTlNJT05fU1RBUlRfUEFUVEVSTjoge3ZhbHVlOiBbMSwgMSwgMl19LFxuICAgIENPREVfUEFUVEVSTjoge3ZhbHVlOiBbXG4gICAgICAgIFszLCAyLCAxLCAxXSxcbiAgICAgICAgWzIsIDIsIDIsIDFdLFxuICAgICAgICBbMiwgMSwgMiwgMl0sXG4gICAgICAgIFsxLCA0LCAxLCAxXSxcbiAgICAgICAgWzEsIDEsIDMsIDJdLFxuICAgICAgICBbMSwgMiwgMywgMV0sXG4gICAgICAgIFsxLCAxLCAxLCA0XSxcbiAgICAgICAgWzEsIDMsIDEsIDJdLFxuICAgICAgICBbMSwgMiwgMSwgM10sXG4gICAgICAgIFszLCAxLCAxLCAyXSxcbiAgICAgICAgWzEsIDEsIDIsIDNdLFxuICAgICAgICBbMSwgMiwgMiwgMl0sXG4gICAgICAgIFsyLCAyLCAxLCAyXSxcbiAgICAgICAgWzEsIDEsIDQsIDFdLFxuICAgICAgICBbMiwgMywgMSwgMV0sXG4gICAgICAgIFsxLCAzLCAyLCAxXSxcbiAgICAgICAgWzQsIDEsIDEsIDFdLFxuICAgICAgICBbMiwgMSwgMywgMV0sXG4gICAgICAgIFszLCAxLCAyLCAxXSxcbiAgICAgICAgWzIsIDEsIDEsIDNdXG4gICAgXX0sXG4gICAgQ09ERV9GUkVRVUVOQ1k6IHt2YWx1ZTogWzAsIDExLCAxMywgMTQsIDE5LCAyNSwgMjgsIDIxLCAyMiwgMjZdfSxcbiAgICBTSU5HTEVfQ09ERV9FUlJPUjoge3ZhbHVlOiAwLjcwfSxcbiAgICBBVkdfQ09ERV9FUlJPUjoge3ZhbHVlOiAwLjQ4fSxcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJlYW5fMTNcIiwgd3JpdGVhYmxlOiBmYWxzZX1cbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkVBTlJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFQU5SZWFkZXI7XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2RlY29kZUNvZGUgPSBmdW5jdGlvbihzdGFydCwgY29kZXJhbmdlKSB7XG4gICAgdmFyIGNvdW50ZXIgPSBbMCwgMCwgMCwgMF0sXG4gICAgICAgIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBvZmZzZXQgPSBzdGFydCxcbiAgICAgICAgaXNXaGl0ZSA9ICFzZWxmLl9yb3dbb2Zmc2V0XSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHN0YXJ0XG4gICAgICAgIH0sXG4gICAgICAgIGNvZGUsXG4gICAgICAgIGVycm9yO1xuXG4gICAgaWYgKCFjb2RlcmFuZ2UpIHtcbiAgICAgICAgY29kZXJhbmdlID0gc2VsZi5DT0RFX1BBVFRFUk4ubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBjb3VudGVyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvZGUgPSAwOyBjb2RlIDwgY29kZXJhbmdlOyBjb2RlKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBzZWxmLl9tYXRjaFBhdHRlcm4oY291bnRlciwgc2VsZi5DT0RFX1BBVFRFUk5bY29kZV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPCBiZXN0TWF0Y2guZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb2RlID0gY29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgIGlmIChiZXN0TWF0Y2guZXJyb3IgPiBzZWxmLkFWR19DT0RFX0VSUk9SKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2ZpbmRQYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgb2Zmc2V0LCBpc1doaXRlLCB0cnlIYXJkZXIsIGVwc2lsb24pIHtcbiAgICB2YXIgY291bnRlciA9IFtdLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgaSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMFxuICAgICAgICB9LFxuICAgICAgICBlcnJvcixcbiAgICAgICAgaixcbiAgICAgICAgc3VtO1xuXG4gICAgaWYgKCFvZmZzZXQpIHtcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpO1xuICAgIH1cblxuICAgIGlmIChpc1doaXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaXNXaGl0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0cnlIYXJkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0cnlIYXJkZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICggZXBzaWxvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVwc2lsb24gPSBzZWxmLkFWR19DT0RFX0VSUk9SO1xuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb3VudGVyW2ldID0gMDtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIHBhdHRlcm4pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIDwgZXBzaWxvbikge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLnN0YXJ0ID0gaSAtIHN1bTtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVuZCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiZXN0TWF0Y2g7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0cnlIYXJkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aCAtIDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlcltqXSA9IGNvdW50ZXJbaiArIDJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAyXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAxXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0LFxuICAgICAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdyksXG4gICAgICAgIHN0YXJ0SW5mbztcblxuICAgIHdoaWxlICghc3RhcnRJbmZvKSB7XG4gICAgICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRQYXR0ZXJuKHNlbGYuU1RBUlRfUEFUVEVSTiwgb2Zmc2V0KTtcbiAgICAgICAgaWYgKCFzdGFydEluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQgPSBzdGFydEluZm8uc3RhcnQgLSAoc3RhcnRJbmZvLmVuZCAtIHN0YXJ0SW5mby5zdGFydCk7XG4gICAgICAgIGlmIChsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0ID49IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQsIHN0YXJ0SW5mby5zdGFydCwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRJbmZvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9mZnNldCA9IHN0YXJ0SW5mby5lbmQ7XG4gICAgICAgIHN0YXJ0SW5mbyA9IG51bGw7XG4gICAgfVxufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlID0gZnVuY3Rpb24oZW5kSW5mbykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kO1xuXG4gICAgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kID0gZW5kSW5mby5lbmQgKyAoZW5kSW5mby5lbmQgLSBlbmRJbmZvLnN0YXJ0KTtcbiAgICBpZiAodHJhaWxpbmdXaGl0ZXNwYWNlRW5kIDwgc2VsZi5fcm93Lmxlbmd0aCkge1xuICAgICAgICBpZiAoc2VsZi5fbWF0Y2hSYW5nZShlbmRJbmZvLmVuZCwgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVuZEluZm87XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5FQU5SZWFkZXIucHJvdG90eXBlLl9maW5kRW5kID0gZnVuY3Rpb24ob2Zmc2V0LCBpc1doaXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBlbmRJbmZvID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5TVE9QX1BBVFRFUk4sIG9mZnNldCwgaXNXaGl0ZSwgZmFsc2UpO1xuXG4gICAgcmV0dXJuIGVuZEluZm8gIT09IG51bGwgPyBzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UoZW5kSW5mbykgOiBudWxsO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlRmlyc3REaWdpdCA9IGZ1bmN0aW9uKGNvZGVGcmVxdWVuY3kpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHNlbGYuQ09ERV9GUkVRVUVOQ1kubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvZGVGcmVxdWVuY3kgPT09IHNlbGYuQ09ERV9GUkVRVUVOQ1lbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKGNvZGUsIHJlc3VsdCwgZGVjb2RlZENvZGVzKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBjb2RlRnJlcXVlbmN5ID0gMHgwLFxuICAgICAgICBmaXJzdERpZ2l0O1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY29kZS5lbmQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2RlLmNvZGUgPj0gc2VsZi5DT0RFX0dfU1RBUlQpIHtcbiAgICAgICAgICAgIGNvZGUuY29kZSA9IGNvZGUuY29kZSAtIHNlbGYuQ09ERV9HX1NUQVJUO1xuICAgICAgICAgICAgY29kZUZyZXF1ZW5jeSB8PSAxIDw8ICg1IC0gaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb2RlRnJlcXVlbmN5IHw9IDAgPDwgKDUgLSBpKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICB9XG5cbiAgICBmaXJzdERpZ2l0ID0gc2VsZi5fY2FsY3VsYXRlRmlyc3REaWdpdChjb2RlRnJlcXVlbmN5KTtcbiAgICBpZiAoZmlyc3REaWdpdCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LnVuc2hpZnQoZmlyc3REaWdpdCk7XG5cbiAgICBjb2RlID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5NSURETEVfUEFUVEVSTiwgY29kZS5lbmQsIHRydWUsIGZhbHNlKTtcbiAgICBpZiAoY29kZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb2RlLmVuZCwgc2VsZi5DT0RFX0dfU1RBUlQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjb2RlO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXJ0SW5mbyxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXSxcbiAgICAgICAgcmVzdWx0SW5mbyA9IHt9O1xuXG4gICAgc3RhcnRJbmZvID0gc2VsZi5fZmluZFN0YXJ0KCk7XG4gICAgaWYgKCFzdGFydEluZm8pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvZGUgPSB7XG4gICAgICAgIGNvZGU6IHN0YXJ0SW5mby5jb2RlLFxuICAgICAgICBzdGFydDogc3RhcnRJbmZvLnN0YXJ0LFxuICAgICAgICBlbmQ6IHN0YXJ0SW5mby5lbmRcbiAgICB9O1xuICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVQYXlsb2FkKGNvZGUsIHJlc3VsdCwgZGVjb2RlZENvZGVzKTtcbiAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvZGUgPSBzZWxmLl9maW5kRW5kKGNvZGUuZW5kLCBmYWxzZSk7XG4gICAgaWYgKCFjb2RlKXtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG5cbiAgICAvLyBDaGVja3N1bVxuICAgIGlmICghc2VsZi5fY2hlY2tzdW0ocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdXBwbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBleHQgPSB0aGlzLl9kZWNvZGVFeHRlbnNpb25zKGNvZGUuZW5kKTtcbiAgICAgICAgaWYgKCFleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0Q29kZSA9IGV4dC5kZWNvZGVkQ29kZXNbZXh0LmRlY29kZWRDb2Rlcy5sZW5ndGgtMV0sXG4gICAgICAgICAgICBlbmRJbmZvID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBsYXN0Q29kZS5zdGFydCArICgoKGxhc3RDb2RlLmVuZCAtIGxhc3RDb2RlLnN0YXJ0KSAvIDIpIHwgMCksXG4gICAgICAgICAgICAgICAgZW5kOiBsYXN0Q29kZS5lbmRcbiAgICAgICAgICAgIH07XG4gICAgICAgIGlmKCFzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UoZW5kSW5mbykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdEluZm8gPSB7XG4gICAgICAgICAgICBzdXBwbGVtZW50OiBleHQsXG4gICAgICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSArIGV4dC5jb2RlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0SW5mby5zdGFydCxcbiAgICAgICAgZW5kOiBjb2RlLmVuZCxcbiAgICAgICAgY29kZXNldDogXCJcIixcbiAgICAgICAgc3RhcnRJbmZvOiBzdGFydEluZm8sXG4gICAgICAgIGRlY29kZWRDb2RlczogZGVjb2RlZENvZGVzLFxuICAgICAgICAuLi5yZXN1bHRJbmZvXG4gICAgfTtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2RlY29kZUV4dGVuc2lvbnMgPSBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc3RhcnQgPSB0aGlzLl9uZXh0U2V0KHRoaXMuX3Jvdywgb2Zmc2V0KSxcbiAgICAgICAgc3RhcnRJbmZvID0gdGhpcy5fZmluZFBhdHRlcm4odGhpcy5FWFRFTlNJT05fU1RBUlRfUEFUVEVSTiwgc3RhcnQsIGZhbHNlLCBmYWxzZSksXG4gICAgICAgIHJlc3VsdDtcblxuICAgIGlmIChzdGFydEluZm8gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuc3VwcGxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5zdXBwbGVtZW50c1tpXS5kZWNvZGUodGhpcy5fcm93LCBzdGFydEluZm8uZW5kKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb2RlOiByZXN1bHQuY29kZSxcbiAgICAgICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgICAgICBzdGFydEluZm8sXG4gICAgICAgICAgICAgICAgZW5kOiByZXN1bHQuZW5kLFxuICAgICAgICAgICAgICAgIGNvZGVzZXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgZGVjb2RlZENvZGVzOiByZXN1bHQuZGVjb2RlZENvZGVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5FQU5SZWFkZXIucHJvdG90eXBlLl9jaGVja3N1bSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBzdW0gPSAwLCBpO1xuXG4gICAgZm9yICggaSA9IHJlc3VsdC5sZW5ndGggLSAyOyBpID49IDA7IGkgLT0gMikge1xuICAgICAgICBzdW0gKz0gcmVzdWx0W2ldO1xuICAgIH1cbiAgICBzdW0gKj0gMztcbiAgICBmb3IgKCBpID0gcmVzdWx0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAyKSB7XG4gICAgICAgIHN1bSArPSByZXN1bHRbaV07XG4gICAgfVxuICAgIHJldHVybiBzdW0gJSAxMCA9PT0gMDtcbn07XG5cbkVBTlJlYWRlci5DT05GSUdfS0VZUyA9IHtcbiAgICBzdXBwbGVtZW50czoge1xuICAgICAgICAndHlwZSc6ICdhcnJheU9mKHN0cmluZyknLFxuICAgICAgICAnZGVmYXVsdCc6IFtdLFxuICAgICAgICAnZGVzY3JpcHRpb24nOiAnQWxsb3dlZCBleHRlbnNpb25zIHRvIGJlIGRlY29kZWQgKDIgYW5kL29yIDUpJ1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChFQU5SZWFkZXIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9lYW5fcmVhZGVyLmpzIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fcm9vdC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnQgZGVmYXVsdCB7XG4gICAgaW5pdDogZnVuY3Rpb24oYXJyLCB2YWwpIHtcbiAgICAgICAgdmFyIGwgPSBhcnIubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobC0tKSB7XG4gICAgICAgICAgICBhcnJbbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2h1ZmZsZXMgdGhlIGNvbnRlbnQgb2YgYW4gYXJyYXlcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gdGhlIGFycmF5IGl0c2VsZiBzaHVmZmxlZFxuICAgICAqL1xuICAgIHNodWZmbGU6IGZ1bmN0aW9uKGFycikge1xuICAgICAgICB2YXIgaSA9IGFyci5sZW5ndGggLSAxLCBqLCB4O1xuICAgICAgICBmb3IgKGk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICB4ID0gYXJyW2ldO1xuICAgICAgICAgICAgYXJyW2ldID0gYXJyW2pdO1xuICAgICAgICAgICAgYXJyW2pdID0geDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH0sXG5cbiAgICB0b1BvaW50TGlzdDogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIHZhciBpLCBqLCByb3cgPSBbXSwgcm93cyA9IFtdO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcm93ID0gW107XG4gICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGFycltpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHJvd1tqXSA9IGFycltpXVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJvd3NbaV0gPSBcIltcIiArIHJvdy5qb2luKFwiLFwiKSArIFwiXVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIltcIiArIHJvd3Muam9pbihcIixcXHJcXG5cIikgKyBcIl1cIjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgZWxlbWVudHMgd2hpY2gncyBzY29yZSBpcyBiaWdnZXIgdGhhbiB0aGUgdGhyZXNob2xkXG4gICAgICogQHJldHVybiB7QXJyYXl9IHRoZSByZWR1Y2VkIGFycmF5XG4gICAgICovXG4gICAgdGhyZXNob2xkOiBmdW5jdGlvbihhcnIsIHRocmVzaG9sZCwgc2NvcmVGdW5jKSB7XG4gICAgICAgIHZhciBpLCBxdWV1ZSA9IFtdO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHNjb3JlRnVuYy5hcHBseShhcnIsIFthcnJbaV1dKSA+PSB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGFycltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXVlO1xuICAgIH0sXG5cbiAgICBtYXhJbmRleDogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIHZhciBpLCBtYXggPSAwO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA+IGFyclttYXhdKSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH0sXG5cbiAgICBtYXg6IGZ1bmN0aW9uKGFycikge1xuICAgICAgICB2YXIgaSwgbWF4ID0gMDtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBhcnJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgc3VtOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICBzdW0gPSAwO1xuXG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgICAgc3VtICs9IGFycltsZW5ndGhdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdW07XG4gICAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vYXJyYXlfaGVscGVyLmpzIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc09iamVjdExpa2UuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBjbG9uZVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xuZnVuY3Rpb24gY2xvbmUoYSkge1xuICAgIHZhciBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDIpXG4gICAgb3V0WzBdID0gYVswXVxuICAgIG91dFsxXSA9IGFbMV1cbiAgICByZXR1cm4gb3V0XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsLXZlYzIvY2xvbmUuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGxpc3RDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlQ2xlYXInKSxcbiAgICBsaXN0Q2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVEZWxldGUnKSxcbiAgICBsaXN0Q2FjaGVHZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVHZXQnKSxcbiAgICBsaXN0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVIYXMnKSxcbiAgICBsaXN0Q2FjaGVTZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3RDYWNoZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX0xpc3RDYWNoZS5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGBrZXlgIGlzIGZvdW5kIGluIGBhcnJheWAgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzb2NJbmRleE9mO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYXNzb2NJbmRleE9mLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlR2V0VGFnLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0tleWFibGUgPSByZXF1aXJlKCcuL19pc0tleWFibGUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGtleS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXAgZGF0YS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWFwRGF0YShtYXAsIGtleSkge1xuICB2YXIgZGF0YSA9IG1hcC5fX2RhdGFfXztcbiAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgPyBkYXRhW3R5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyAnc3RyaW5nJyA6ICdoYXNoJ11cbiAgICA6IGRhdGEubWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hcERhdGE7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19nZXRNYXBEYXRhLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlQ3JlYXRlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvZXEuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnblZhbHVlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUFzc2lnblZhbHVlLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2dldE5hdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzQXJyYXlMaWtlLmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0Z1bmN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xyXG5cdGlmKCFtb2R1bGUud2VicGFja1BvbHlmaWxsKSB7XHJcblx0XHRtb2R1bGUuZGVwcmVjYXRlID0gZnVuY3Rpb24oKSB7fTtcclxuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xyXG5cdFx0Ly8gbW9kdWxlLnBhcmVudCA9IHVuZGVmaW5lZCBieSBkZWZhdWx0XHJcblx0XHRpZighbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwibG9hZGVkXCIsIHtcclxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmw7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJpZFwiLCB7XHJcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xyXG5cdH1cclxuXHRyZXR1cm4gbW9kdWxlO1xyXG59O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBTdWJJbWFnZSBmcm9tICcuL3N1YkltYWdlJztcbmltcG9ydCB7aHN2MnJnYn0gZnJvbSAnLi4vY29tbW9uL2N2X3V0aWxzJztcbmltcG9ydCBBcnJheUhlbHBlciBmcm9tICcuLi9jb21tb24vYXJyYXlfaGVscGVyJztcbmNvbnN0IHZlYzIgPSB7XG4gICAgY2xvbmU6IHJlcXVpcmUoJ2dsLXZlYzIvY2xvbmUnKSxcbn07XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGJhc2ljIGltYWdlIGNvbWJpbmluZyB0aGUgZGF0YSBhbmQgc2l6ZS5cbiAqIEluIGFkZGl0aW9uLCBzb21lIG1ldGhvZHMgZm9yIG1hbmlwdWxhdGlvbiBhcmUgY29udGFpbmVkLlxuICogQHBhcmFtIHNpemUge3gseX0gVGhlIHNpemUgb2YgdGhlIGltYWdlIGluIHBpeGVsXG4gKiBAcGFyYW0gZGF0YSB7QXJyYXl9IElmIGdpdmVuLCBhIGZsYXQgYXJyYXkgY29udGFpbmluZyB0aGUgcGl4ZWwgZGF0YVxuICogQHBhcmFtIEFycmF5VHlwZSB7VHlwZX0gSWYgZ2l2ZW4sIHRoZSBkZXNpcmVkIERhdGFUeXBlIG9mIHRoZSBBcnJheSAobWF5IGJlIHR5cGVkL25vbi10eXBlZClcbiAqIEBwYXJhbSBpbml0aWFsaXplIHtCb29sZWFufSBJbmRpY2F0aW5nIGlmIHRoZSBhcnJheSBzaG91bGQgYmUgaW5pdGlhbGl6ZWQgb24gY3JlYXRpb24uXG4gKiBAcmV0dXJucyB7SW1hZ2VXcmFwcGVyfVxuICovXG5mdW5jdGlvbiBJbWFnZVdyYXBwZXIoc2l6ZSwgZGF0YSwgQXJyYXlUeXBlLCBpbml0aWFsaXplKSB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIGlmIChBcnJheVR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheVR5cGUoc2l6ZS54ICogc2l6ZS55KTtcbiAgICAgICAgICAgIGlmIChBcnJheVR5cGUgPT09IEFycmF5ICYmIGluaXRpYWxpemUpIHtcbiAgICAgICAgICAgICAgICBBcnJheUhlbHBlci5pbml0KHRoaXMuZGF0YSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShzaXplLnggKiBzaXplLnkpO1xuICAgICAgICAgICAgaWYgKFVpbnQ4QXJyYXkgPT09IEFycmF5ICYmIGluaXRpYWxpemUpIHtcbiAgICAgICAgICAgICAgICBBcnJheUhlbHBlci5pbml0KHRoaXMuZGF0YSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICB0aGlzLnNpemUgPSBzaXplO1xufVxuXG4vKipcbiAqIHRlc3RzIGlmIGEgcG9zaXRpb24gaXMgd2l0aGluIHRoZSBpbWFnZSB3aXRoIGEgZ2l2ZW4gb2Zmc2V0XG4gKiBAcGFyYW0gaW1nUmVmIHt4LCB5fSBUaGUgbG9jYXRpb24gdG8gdGVzdFxuICogQHBhcmFtIGJvcmRlciBOdW1iZXIgdGhlIHBhZGRpbmcgdmFsdWUgaW4gcGl4ZWxcbiAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIGxvY2F0aW9uIGluc2lkZSB0aGUgaW1hZ2UncyBib3JkZXIsIGZhbHNlIG90aGVyd2lzZVxuICogQHNlZSBjdmQvaW1hZ2UuaFxuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLmluSW1hZ2VXaXRoQm9yZGVyID0gZnVuY3Rpb24oaW1nUmVmLCBib3JkZXIpIHtcbiAgICByZXR1cm4gKGltZ1JlZi54ID49IGJvcmRlcilcbiAgICAgICAgJiYgKGltZ1JlZi55ID49IGJvcmRlcilcbiAgICAgICAgJiYgKGltZ1JlZi54IDwgKHRoaXMuc2l6ZS54IC0gYm9yZGVyKSlcbiAgICAgICAgJiYgKGltZ1JlZi55IDwgKHRoaXMuc2l6ZS55IC0gYm9yZGVyKSk7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGJpbGluZWFyIHNhbXBsaW5nXG4gKiBAcGFyYW0gaW5JbWcgSW1hZ2UgdG8gZXh0cmFjdCBzYW1wbGUgZnJvbVxuICogQHBhcmFtIHggdGhlIHgtY29vcmRpbmF0ZVxuICogQHBhcmFtIHkgdGhlIHktY29vcmRpbmF0ZVxuICogQHJldHVybnMgdGhlIHNhbXBsZWQgdmFsdWVcbiAqIEBzZWUgY3ZkL3Zpc2lvbi5oXG4gKi9cbkltYWdlV3JhcHBlci5zYW1wbGUgPSBmdW5jdGlvbihpbkltZywgeCwgeSkge1xuICAgIHZhciBseCA9IE1hdGguZmxvb3IoeCk7XG4gICAgdmFyIGx5ID0gTWF0aC5mbG9vcih5KTtcbiAgICB2YXIgdyA9IGluSW1nLnNpemUueDtcbiAgICB2YXIgYmFzZSA9IGx5ICogaW5JbWcuc2l6ZS54ICsgbHg7XG4gICAgdmFyIGEgPSBpbkltZy5kYXRhW2Jhc2UgKyAwXTtcbiAgICB2YXIgYiA9IGluSW1nLmRhdGFbYmFzZSArIDFdO1xuICAgIHZhciBjID0gaW5JbWcuZGF0YVtiYXNlICsgd107XG4gICAgdmFyIGQgPSBpbkltZy5kYXRhW2Jhc2UgKyB3ICsgMV07XG4gICAgdmFyIGUgPSBhIC0gYjtcbiAgICB4IC09IGx4O1xuICAgIHkgLT0gbHk7XG5cbiAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcih4ICogKHkgKiAoZSAtIGMgKyBkKSAtIGUpICsgeSAqIChjIC0gYSkgKyBhKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhIGdpdmVuIGFycmF5LiBTZXRzIGVhY2ggZWxlbWVudCB0byB6ZXJvLlxuICogQHBhcmFtIGFycmF5IHtBcnJheX0gVGhlIGFycmF5IHRvIGluaXRpYWxpemVcbiAqL1xuSW1hZ2VXcmFwcGVyLmNsZWFyQXJyYXkgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciBsID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsLS0pIHtcbiAgICAgICAgYXJyYXlbbF0gPSAwO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtTdWJJbWFnZX0gZnJvbSB0aGUgY3VycmVudCBpbWFnZSAoe3RoaXN9KS5cbiAqIEBwYXJhbSBmcm9tIHtJbWFnZVJlZn0gVGhlIHBvc2l0aW9uIHdoZXJlIHRvIHN0YXJ0IHRoZSB7U3ViSW1hZ2V9IGZyb20uICh0b3AtbGVmdCBjb3JuZXIpXG4gKiBAcGFyYW0gc2l6ZSB7SW1hZ2VSZWZ9IFRoZSBzaXplIG9mIHRoZSByZXN1bHRpbmcgaW1hZ2VcbiAqIEByZXR1cm5zIHtTdWJJbWFnZX0gQSBzaGFyZWQgcGFydCBvZiB0aGUgb3JpZ2luYWwgaW1hZ2VcbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5zdWJJbWFnZSA9IGZ1bmN0aW9uKGZyb20sIHNpemUpIHtcbiAgICByZXR1cm4gbmV3IFN1YkltYWdlKGZyb20sIHNpemUsIHRoaXMpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIHtJbWFnZVdyYXBwZXIpIGFuZCBjb3BpZXMgdGhlIG5lZWRlZCB1bmRlcmx5aW5nIGltYWdlLWRhdGEgYXJlYVxuICogQHBhcmFtIGltYWdlV3JhcHBlciB7SW1hZ2VXcmFwcGVyfSBUaGUgdGFyZ2V0IHtJbWFnZVdyYXBwZXJ9IHdoZXJlIHRoZSBkYXRhIHNob3VsZCBiZSBjb3BpZWRcbiAqIEBwYXJhbSBmcm9tIHtJbWFnZVJlZn0gVGhlIGxvY2F0aW9uIHdoZXJlIHRvIGNvcHkgZnJvbSAodG9wLWxlZnQgbG9jYXRpb24pXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuc3ViSW1hZ2VBc0NvcHkgPSBmdW5jdGlvbihpbWFnZVdyYXBwZXIsIGZyb20pIHtcbiAgICB2YXIgc2l6ZVkgPSBpbWFnZVdyYXBwZXIuc2l6ZS55LCBzaXplWCA9IGltYWdlV3JhcHBlci5zaXplLng7XG4gICAgdmFyIHgsIHk7XG4gICAgZm9yICggeCA9IDA7IHggPCBzaXplWDsgeCsrKSB7XG4gICAgICAgIGZvciAoIHkgPSAwOyB5IDwgc2l6ZVk7IHkrKykge1xuICAgICAgICAgICAgaW1hZ2VXcmFwcGVyLmRhdGFbeSAqIHNpemVYICsgeF0gPSB0aGlzLmRhdGFbKGZyb20ueSArIHkpICogdGhpcy5zaXplLnggKyBmcm9tLnggKyB4XTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuY29weVRvID0gZnVuY3Rpb24oaW1hZ2VXcmFwcGVyKSB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMuZGF0YS5sZW5ndGgsIHNyY0RhdGEgPSB0aGlzLmRhdGEsIGRzdERhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBkc3REYXRhW2xlbmd0aF0gPSBzcmNEYXRhW2xlbmd0aF07XG4gICAgfVxufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBnaXZlbiBwaXhlbCBwb3NpdGlvbiBmcm9tIHRoZSBpbWFnZVxuICogQHBhcmFtIHgge051bWJlcn0gVGhlIHgtcG9zaXRpb25cbiAqIEBwYXJhbSB5IHtOdW1iZXJ9IFRoZSB5LXBvc2l0aW9uXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgZ3JheXNjYWxlIHZhbHVlIGF0IHRoZSBwaXhlbC1wb3NpdGlvblxuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW3kgKiB0aGlzLnNpemUueCArIHhdO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBnaXZlbiBwaXhlbCBwb3NpdGlvbiBmcm9tIHRoZSBpbWFnZVxuICogQHBhcmFtIHgge051bWJlcn0gVGhlIHgtcG9zaXRpb25cbiAqIEBwYXJhbSB5IHtOdW1iZXJ9IFRoZSB5LXBvc2l0aW9uXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgZ3JheXNjYWxlIHZhbHVlIGF0IHRoZSBwaXhlbC1wb3NpdGlvblxuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLmdldFNhZmUgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoIXRoaXMuaW5kZXhNYXBwaW5nKSB7XG4gICAgICAgIHRoaXMuaW5kZXhNYXBwaW5nID0ge1xuICAgICAgICAgICAgeDogW10sXG4gICAgICAgICAgICB5OiBbXVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5zaXplLng7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcHBpbmcueFtpXSA9IGk7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwcGluZy54W2kgKyB0aGlzLnNpemUueF0gPSBpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNpemUueTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwcGluZy55W2ldID0gaTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXBwaW5nLnlbaSArIHRoaXMuc2l6ZS55XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGF0YVsodGhpcy5pbmRleE1hcHBpbmcueVt5ICsgdGhpcy5zaXplLnldKSAqIHRoaXMuc2l6ZS54ICsgdGhpcy5pbmRleE1hcHBpbmcueFt4ICsgdGhpcy5zaXplLnhdXTtcbn07XG5cbi8qKlxuICogU2V0cyBhIGdpdmVuIHBpeGVsIHBvc2l0aW9uIGluIHRoZSBpbWFnZVxuICogQHBhcmFtIHgge051bWJlcn0gVGhlIHgtcG9zaXRpb25cbiAqIEBwYXJhbSB5IHtOdW1iZXJ9IFRoZSB5LXBvc2l0aW9uXG4gKiBAcGFyYW0gdmFsdWUge051bWJlcn0gVGhlIGdyYXlzY2FsZSB2YWx1ZSB0byBzZXRcbiAqIEByZXR1cm5zIHtJbWFnZVdyYXBwZXJ9IFRoZSBJbWFnZSBpdHNlbGYgKGZvciBwb3NzaWJsZSBjaGFpbmluZylcbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih4LCB5LCB2YWx1ZSkge1xuICAgIHRoaXMuZGF0YVt5ICogdGhpcy5zaXplLnggKyB4XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBib3JkZXIgb2YgdGhlIGltYWdlICgxIHBpeGVsKSB0byB6ZXJvXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuemVyb0JvcmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCB3aWR0aCA9IHRoaXMuc2l6ZS54LCBoZWlnaHQgPSB0aGlzLnNpemUueSwgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICAgICAgZGF0YVtpXSA9IGRhdGFbKGhlaWdodCAtIDEpICogd2lkdGggKyBpXSA9IDA7XG4gICAgfVxuICAgIGZvciAoIGkgPSAxOyBpIDwgaGVpZ2h0IC0gMTsgaSsrKSB7XG4gICAgICAgIGRhdGFbaSAqIHdpZHRoXSA9IGRhdGFbaSAqIHdpZHRoICsgKHdpZHRoIC0gMSldID0gMDtcbiAgICB9XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBiaW5hcnkgaW1hZ2UgaW4gcGxhY2VcbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5pbnZlcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSwgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgZGF0YVtsZW5ndGhdID0gZGF0YVtsZW5ndGhdID8gMCA6IDE7XG4gICAgfVxufTtcblxuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5jb252b2x2ZSA9IGZ1bmN0aW9uKGtlcm5lbCkge1xuICAgIHZhciB4LCB5LCBreCwga3ksIGtTaXplID0gKGtlcm5lbC5sZW5ndGggLyAyKSB8IDAsIGFjY3UgPSAwO1xuICAgIGZvciAoIHkgPSAwOyB5IDwgdGhpcy5zaXplLnk7IHkrKykge1xuICAgICAgICBmb3IgKCB4ID0gMDsgeCA8IHRoaXMuc2l6ZS54OyB4KyspIHtcbiAgICAgICAgICAgIGFjY3UgPSAwO1xuICAgICAgICAgICAgZm9yICgga3kgPSAta1NpemU7IGt5IDw9IGtTaXplOyBreSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICgga3ggPSAta1NpemU7IGt4IDw9IGtTaXplOyBreCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY3UgKz0ga2VybmVsW2t5ICsga1NpemVdW2t4ICsga1NpemVdICogdGhpcy5nZXRTYWZlKHggKyBreCwgeSArIGt5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFbeSAqIHRoaXMuc2l6ZS54ICsgeF0gPSBhY2N1O1xuICAgICAgICB9XG4gICAgfVxufTtcblxuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5tb21lbnRzID0gZnVuY3Rpb24obGFiZWxjb3VudCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBoZWlnaHQgPSB0aGlzLnNpemUueSxcbiAgICAgICAgd2lkdGggPSB0aGlzLnNpemUueCxcbiAgICAgICAgdmFsLFxuICAgICAgICB5c3EsXG4gICAgICAgIGxhYmVsc3VtID0gW10sXG4gICAgICAgIGksXG4gICAgICAgIGxhYmVsLFxuICAgICAgICBtdTExLFxuICAgICAgICBtdTAyLFxuICAgICAgICBtdTIwLFxuICAgICAgICB4XyxcbiAgICAgICAgeV8sXG4gICAgICAgIHRtcCxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIFBJID0gTWF0aC5QSSxcbiAgICAgICAgUElfNCA9IFBJIC8gNDtcblxuICAgIGlmIChsYWJlbGNvdW50IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IGxhYmVsY291bnQ7IGkrKykge1xuICAgICAgICBsYWJlbHN1bVtpXSA9IHtcbiAgICAgICAgICAgIG0wMDogMCxcbiAgICAgICAgICAgIG0wMTogMCxcbiAgICAgICAgICAgIG0xMDogMCxcbiAgICAgICAgICAgIG0xMTogMCxcbiAgICAgICAgICAgIG0wMjogMCxcbiAgICAgICAgICAgIG0yMDogMCxcbiAgICAgICAgICAgIHRoZXRhOiAwLFxuICAgICAgICAgICAgcmFkOiAwXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yICggeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICB5c3EgPSB5ICogeTtcbiAgICAgICAgZm9yICggeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB2YWwgPSBkYXRhW3kgKiB3aWR0aCArIHhdO1xuICAgICAgICAgICAgaWYgKHZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGxhYmVsc3VtW3ZhbCAtIDFdO1xuICAgICAgICAgICAgICAgIGxhYmVsLm0wMCArPSAxO1xuICAgICAgICAgICAgICAgIGxhYmVsLm0wMSArPSB5O1xuICAgICAgICAgICAgICAgIGxhYmVsLm0xMCArPSB4O1xuICAgICAgICAgICAgICAgIGxhYmVsLm0xMSArPSB4ICogeTtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMDIgKz0geXNxO1xuICAgICAgICAgICAgICAgIGxhYmVsLm0yMCArPSB4ICogeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgbGFiZWxjb3VudDsgaSsrKSB7XG4gICAgICAgIGxhYmVsID0gbGFiZWxzdW1baV07XG4gICAgICAgIGlmICghaXNOYU4obGFiZWwubTAwKSAmJiBsYWJlbC5tMDAgIT09IDApIHtcbiAgICAgICAgICAgIHhfID0gbGFiZWwubTEwIC8gbGFiZWwubTAwO1xuICAgICAgICAgICAgeV8gPSBsYWJlbC5tMDEgLyBsYWJlbC5tMDA7XG4gICAgICAgICAgICBtdTExID0gbGFiZWwubTExIC8gbGFiZWwubTAwIC0geF8gKiB5XztcbiAgICAgICAgICAgIG11MDIgPSBsYWJlbC5tMDIgLyBsYWJlbC5tMDAgLSB5XyAqIHlfO1xuICAgICAgICAgICAgbXUyMCA9IGxhYmVsLm0yMCAvIGxhYmVsLm0wMCAtIHhfICogeF87XG4gICAgICAgICAgICB0bXAgPSAobXUwMiAtIG11MjApIC8gKDIgKiBtdTExKTtcbiAgICAgICAgICAgIHRtcCA9IDAuNSAqIE1hdGguYXRhbih0bXApICsgKG11MTEgPj0gMCA/IFBJXzQgOiAtUElfNCApICsgUEk7XG4gICAgICAgICAgICBsYWJlbC50aGV0YSA9ICh0bXAgKiAxODAgLyBQSSArIDkwKSAlIDE4MCAtIDkwO1xuICAgICAgICAgICAgaWYgKGxhYmVsLnRoZXRhIDwgMCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLnRoZXRhICs9IDE4MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhYmVsLnJhZCA9IHRtcCA+IFBJID8gdG1wIC0gUEkgOiB0bXA7XG4gICAgICAgICAgICBsYWJlbC52ZWMgPSB2ZWMyLmNsb25lKFtNYXRoLmNvcyh0bXApLCBNYXRoLnNpbih0bXApXSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChsYWJlbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBEaXNwbGF5cyB0aGUge0ltYWdlV3JhcHBlcn0gaW4gYSBnaXZlbiBjYW52YXNcbiAqIEBwYXJhbSBjYW52YXMge0NhbnZhc30gVGhlIGNhbnZhcyBlbGVtZW50IHRvIHdyaXRlIHRvXG4gKiBAcGFyYW0gc2NhbGUge051bWJlcn0gU2NhbGUgd2hpY2ggaXMgYXBwbGllZCB0byBlYWNoIHBpeGVsLXZhbHVlXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKGNhbnZhcywgc2NhbGUpIHtcbiAgICB2YXIgY3R4LFxuICAgICAgICBmcmFtZSxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgcGl4ZWwsXG4gICAgICAgIHgsXG4gICAgICAgIHk7XG5cbiAgICBpZiAoIXNjYWxlKSB7XG4gICAgICAgIHNjYWxlID0gMS4wO1xuICAgIH1cbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjYW52YXMud2lkdGggPSB0aGlzLnNpemUueDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5zaXplLnk7XG4gICAgZnJhbWUgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgZGF0YSA9IGZyYW1lLmRhdGE7XG4gICAgY3VycmVudCA9IDA7XG4gICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuc2l6ZS55OyB5KyspIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuc2l6ZS54OyB4KyspIHtcbiAgICAgICAgICAgIHBpeGVsID0geSAqIHRoaXMuc2l6ZS54ICsgeDtcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldCh4LCB5KSAqIHNjYWxlO1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAwXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBkYXRhW3BpeGVsICogNCArIDFdID0gY3VycmVudDtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgMl0gPSBjdXJyZW50O1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAzXSA9IDI1NTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2ZyYW1lLmRhdGEgPSBkYXRhO1xuICAgIGN0eC5wdXRJbWFnZURhdGEoZnJhbWUsIDAsIDApO1xufTtcblxuLyoqXG4gKiBEaXNwbGF5cyB0aGUge1N1YkltYWdlfSBpbiBhIGdpdmVuIGNhbnZhc1xuICogQHBhcmFtIGNhbnZhcyB7Q2FudmFzfSBUaGUgY2FudmFzIGVsZW1lbnQgdG8gd3JpdGUgdG9cbiAqIEBwYXJhbSBzY2FsZSB7TnVtYmVyfSBTY2FsZSB3aGljaCBpcyBhcHBsaWVkIHRvIGVhY2ggcGl4ZWwtdmFsdWVcbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5vdmVybGF5ID0gZnVuY3Rpb24oY2FudmFzLCBzY2FsZSwgZnJvbSkge1xuICAgIGlmICghc2NhbGUgfHwgc2NhbGUgPCAwIHx8IHNjYWxlID4gMzYwKSB7XG4gICAgICAgIHNjYWxlID0gMzYwO1xuICAgIH1cbiAgICB2YXIgaHN2ID0gWzAsIDEsIDFdO1xuICAgIHZhciByZ2IgPSBbMCwgMCwgMF07XG4gICAgdmFyIHdoaXRlUmdiID0gWzI1NSwgMjU1LCAyNTVdO1xuICAgIHZhciBibGFja1JnYiA9IFswLCAwLCAwXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBmcmFtZSA9IGN0eC5nZXRJbWFnZURhdGEoZnJvbS54LCBmcm9tLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSk7XG4gICAgdmFyIGRhdGEgPSBmcmFtZS5kYXRhO1xuICAgIHZhciBsZW5ndGggPSB0aGlzLmRhdGEubGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBoc3ZbMF0gPSB0aGlzLmRhdGFbbGVuZ3RoXSAqIHNjYWxlO1xuICAgICAgICByZXN1bHQgPSBoc3ZbMF0gPD0gMCA/IHdoaXRlUmdiIDogaHN2WzBdID49IDM2MCA/IGJsYWNrUmdiIDogaHN2MnJnYihoc3YsIHJnYik7XG4gICAgICAgIGRhdGFbbGVuZ3RoICogNCArIDBdID0gcmVzdWx0WzBdO1xuICAgICAgICBkYXRhW2xlbmd0aCAqIDQgKyAxXSA9IHJlc3VsdFsxXTtcbiAgICAgICAgZGF0YVtsZW5ndGggKiA0ICsgMl0gPSByZXN1bHRbMl07XG4gICAgICAgIGRhdGFbbGVuZ3RoICogNCArIDNdID0gMjU1O1xuICAgIH1cbiAgICBjdHgucHV0SW1hZ2VEYXRhKGZyYW1lLCBmcm9tLngsIGZyb20ueSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJbWFnZVdyYXBwZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2ltYWdlX3dyYXBwZXIuanMiLCJpbXBvcnQgQmFyY29kZVJlYWRlciBmcm9tICcuL2JhcmNvZGVfcmVhZGVyJztcbmltcG9ydCBBcnJheUhlbHBlciBmcm9tICcuLi9jb21tb24vYXJyYXlfaGVscGVyJztcblxuZnVuY3Rpb24gQ29kZTM5UmVhZGVyKCkge1xuICAgIEJhcmNvZGVSZWFkZXIuY2FsbCh0aGlzKTtcbn1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgQUxQSEFCRVRIX1NUUklORzoge3ZhbHVlOiBcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWi0uICokLyslXCJ9LFxuICAgIEFMUEhBQkVUOiB7dmFsdWU6IFs0OCwgNDksIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LFxuICAgICAgICA3OSwgODAsIDgxLCA4MiwgODMsIDg0LCA4NSwgODYsIDg3LCA4OCwgODksIDkwLCA0NSwgNDYsIDMyLCA0MiwgMzYsIDQ3LCA0MywgMzddfSxcbiAgICBDSEFSQUNURVJfRU5DT0RJTkdTOiB7dmFsdWU6IFsweDAzNCwgMHgxMjEsIDB4MDYxLCAweDE2MCwgMHgwMzEsIDB4MTMwLCAweDA3MCwgMHgwMjUsIDB4MTI0LCAweDA2NCwgMHgxMDksIDB4MDQ5LFxuICAgICAgICAweDE0OCwgMHgwMTksIDB4MTE4LCAweDA1OCwgMHgwMEQsIDB4MTBDLCAweDA0QywgMHgwMUMsIDB4MTAzLCAweDA0MywgMHgxNDIsIDB4MDEzLCAweDExMiwgMHgwNTIsIDB4MDA3LCAweDEwNixcbiAgICAgICAgMHgwNDYsIDB4MDE2LCAweDE4MSwgMHgwQzEsIDB4MUMwLCAweDA5MSwgMHgxOTAsIDB4MEQwLCAweDA4NSwgMHgxODQsIDB4MEM0LCAweDA5NCwgMHgwQTgsIDB4MEEyLCAweDA4QSwgMHgwMkFcbiAgICBdfSxcbiAgICBBU1RFUklTSzoge3ZhbHVlOiAweDA5NH0sXG4gICAgRk9STUFUOiB7dmFsdWU6IFwiY29kZV8zOVwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvZGUzOVJlYWRlcjtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBjb3VudGVycyA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIHN0YXJ0ID0gc2VsZi5fZmluZFN0YXJ0KCksXG4gICAgICAgIGRlY29kZWRDaGFyLFxuICAgICAgICBsYXN0U3RhcnQsXG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIG5leHRTdGFydDtcblxuICAgIGlmICghc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG5leHRTdGFydCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93LCBzdGFydC5lbmQpO1xuXG4gICAgZG8ge1xuICAgICAgICBjb3VudGVycyA9IHNlbGYuX3RvQ291bnRlcnMobmV4dFN0YXJ0LCBjb3VudGVycyk7XG4gICAgICAgIHBhdHRlcm4gPSBzZWxmLl90b1BhdHRlcm4oY291bnRlcnMpO1xuICAgICAgICBpZiAocGF0dGVybiA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlY29kZWRDaGFyID0gc2VsZi5fcGF0dGVyblRvQ2hhcihwYXR0ZXJuKTtcbiAgICAgICAgaWYgKGRlY29kZWRDaGFyIDwgMCl7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChkZWNvZGVkQ2hhcik7XG4gICAgICAgIGxhc3RTdGFydCA9IG5leHRTdGFydDtcbiAgICAgICAgbmV4dFN0YXJ0ICs9IEFycmF5SGVscGVyLnN1bShjb3VudGVycyk7XG4gICAgICAgIG5leHRTdGFydCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93LCBuZXh0U3RhcnQpO1xuICAgIH0gd2hpbGUgKGRlY29kZWRDaGFyICE9PSAnKicpO1xuICAgIHJlc3VsdC5wb3AoKTtcblxuICAgIGlmICghcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZShsYXN0U3RhcnQsIG5leHRTdGFydCwgY291bnRlcnMpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBzdGFydDogc3RhcnQuc3RhcnQsXG4gICAgICAgIGVuZDogbmV4dFN0YXJ0LFxuICAgICAgICBzdGFydEluZm86IHN0YXJ0LFxuICAgICAgICBkZWNvZGVkQ29kZXM6IHJlc3VsdFxuICAgIH07XG59O1xuXG5Db2RlMzlSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UgPSBmdW5jdGlvbihsYXN0U3RhcnQsIG5leHRTdGFydCwgY291bnRlcnMpIHtcbiAgICB2YXIgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kLFxuICAgICAgICBwYXR0ZXJuU2l6ZSA9IEFycmF5SGVscGVyLnN1bShjb3VudGVycyk7XG5cbiAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQgPSBuZXh0U3RhcnQgLSBsYXN0U3RhcnQgLSBwYXR0ZXJuU2l6ZTtcbiAgICBpZiAoKHRyYWlsaW5nV2hpdGVzcGFjZUVuZCAqIDMpID49IHBhdHRlcm5TaXplKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Db2RlMzlSZWFkZXIucHJvdG90eXBlLl9wYXR0ZXJuVG9DaGFyID0gZnVuY3Rpb24ocGF0dGVybikge1xuICAgIHZhciBpLFxuICAgICAgICBzZWxmID0gdGhpcztcblxuICAgIGZvciAoaSA9IDA7IGkgPCBzZWxmLkNIQVJBQ1RFUl9FTkNPRElOR1MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuQ0hBUkFDVEVSX0VOQ09ESU5HU1tpXSA9PT0gcGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoc2VsZi5BTFBIQUJFVFtpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufTtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fZmluZE5leHRXaWR0aCA9IGZ1bmN0aW9uKGNvdW50ZXJzLCBjdXJyZW50KSB7XG4gICAgdmFyIGksXG4gICAgICAgIG1pbldpZHRoID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY291bnRlcnNbaV0gPCBtaW5XaWR0aCAmJiBjb3VudGVyc1tpXSA+IGN1cnJlbnQpIHtcbiAgICAgICAgICAgIG1pbldpZHRoID0gY291bnRlcnNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWluV2lkdGg7XG59O1xuXG5Db2RlMzlSZWFkZXIucHJvdG90eXBlLl90b1BhdHRlcm4gPSBmdW5jdGlvbihjb3VudGVycykge1xuICAgIHZhciBudW1Db3VudGVycyA9IGNvdW50ZXJzLmxlbmd0aCxcbiAgICAgICAgbWF4TmFycm93V2lkdGggPSAwLFxuICAgICAgICBudW1XaWRlQmFycyA9IG51bUNvdW50ZXJzLFxuICAgICAgICB3aWRlQmFyV2lkdGggPSAwLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgcGF0dGVybixcbiAgICAgICAgaTtcblxuICAgIHdoaWxlIChudW1XaWRlQmFycyA+IDMpIHtcbiAgICAgICAgbWF4TmFycm93V2lkdGggPSBzZWxmLl9maW5kTmV4dFdpZHRoKGNvdW50ZXJzLCBtYXhOYXJyb3dXaWR0aCk7XG4gICAgICAgIG51bVdpZGVCYXJzID0gMDtcbiAgICAgICAgcGF0dGVybiA9IDA7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1Db3VudGVyczsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY291bnRlcnNbaV0gPiBtYXhOYXJyb3dXaWR0aCkge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gfD0gMSA8PCAobnVtQ291bnRlcnMgLSAxIC0gaSk7XG4gICAgICAgICAgICAgICAgbnVtV2lkZUJhcnMrKztcbiAgICAgICAgICAgICAgICB3aWRlQmFyV2lkdGggKz0gY291bnRlcnNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtV2lkZUJhcnMgPT09IDMpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1Db3VudGVycyAmJiBudW1XaWRlQmFycyA+IDA7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb3VudGVyc1tpXSA+IG1heE5hcnJvd1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bVdpZGVCYXJzLS07XG4gICAgICAgICAgICAgICAgICAgIGlmICgoY291bnRlcnNbaV0gKiAyKSA+PSB3aWRlQmFyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG5cbkNvZGUzOVJlYWRlci5wcm90b3R5cGUuX2ZpbmRTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBwYXR0ZXJuU3RhcnQgPSBvZmZzZXQsXG4gICAgICAgIGNvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBpc1doaXRlID0gZmFsc2UsXG4gICAgICAgIGksXG4gICAgICAgIGosXG4gICAgICAgIHdoaXRlU3BhY2VNdXN0U3RhcnQ7XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gZmluZCBzdGFydCBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX3RvUGF0dGVybihjb3VudGVyKSA9PT0gc2VsZi5BU1RFUklTSykge1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlTXVzdFN0YXJ0ID0gTWF0aC5mbG9vcihNYXRoLm1heCgwLCBwYXR0ZXJuU3RhcnQgLSAoKGkgLSBwYXR0ZXJuU3RhcnQpIC8gNCkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2Uod2hpdGVTcGFjZU11c3RTdGFydCwgcGF0dGVyblN0YXJ0LCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogcGF0dGVyblN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogaVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhdHRlcm5TdGFydCArPSBjb3VudGVyWzBdICsgY291bnRlclsxXTtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IDc7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2pdID0gY291bnRlcltqICsgMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvdW50ZXJbN10gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJbOF0gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2RlMzlSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2NvZGVfMzlfcmVhZGVyLmpzIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX01hcC5qc1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX1N5bWJvbC5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZSBgYXNzaWduVmFsdWVgIGV4Y2VwdCB0aGF0IGl0IGRvZXNuJ3QgYXNzaWduXG4gKiBgdW5kZWZpbmVkYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduTWVyZ2VWYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmICFlcShvYmplY3Rba2V5XSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbk1lcmdlVmFsdWU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19hc3NpZ25NZXJnZVZhbHVlLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fZGVmaW5lUHJvcGVydHkuanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2ZyZWVHbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBvdmVyQXJnID0gcmVxdWlyZSgnLi9fb3ZlckFyZycpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19nZXRQcm90b3R5cGUuanNcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0luZGV4O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faXNJbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faXNQcm90b3R5cGUuanNcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAsIHVubGVzcyBga2V5YCBpcyBcIl9fcHJvdG9fX1wiLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc2FmZUdldChvYmplY3QsIGtleSkge1xuICByZXR1cm4ga2V5ID09ICdfX3Byb3RvX18nXG4gICAgPyB1bmRlZmluZWRcbiAgICA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhZmVHZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zYWZlR2V0LmpzXG4vLyBtb2R1bGUgaWQgPSAyOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pZGVudGl0eS5qc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VJc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vX2Jhc2VJc0FyZ3VtZW50cycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA/IGJhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0FyZ3VtZW50cy5qc1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNBcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gMzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0J1ZmZlci5qc1xuLy8gbW9kdWxlIGlkID0gMzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0xlbmd0aC5qc1xuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VJc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL19iYXNlSXNUeXBlZEFycmF5JyksXG4gICAgYmFzZVVuYXJ5ID0gcmVxdWlyZSgnLi9fYmFzZVVuYXJ5JyksXG4gICAgbm9kZVV0aWwgPSByZXF1aXJlKCcuL19ub2RlVXRpbCcpO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc1R5cGVkQXJyYXk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzVHlwZWRBcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gMzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXNJbiA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzSW4nKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5c0luO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9rZXlzSW4uanNcbi8vIG1vZHVsZSBpZCA9IDM1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlTWVyZ2UgPSByZXF1aXJlKCcuL19iYXNlTWVyZ2UnKSxcbiAgICBjcmVhdGVBc3NpZ25lciA9IHJlcXVpcmUoJy4vX2NyZWF0ZUFzc2lnbmVyJyk7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5hc3NpZ25gIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IG1lcmdlcyBvd24gYW5kXG4gKiBpbmhlcml0ZWQgZW51bWVyYWJsZSBzdHJpbmcga2V5ZWQgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZVxuICogZGVzdGluYXRpb24gb2JqZWN0LiBTb3VyY2UgcHJvcGVydGllcyB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAgYXJlXG4gKiBza2lwcGVkIGlmIGEgZGVzdGluYXRpb24gdmFsdWUgZXhpc3RzLiBBcnJheSBhbmQgcGxhaW4gb2JqZWN0IHByb3BlcnRpZXNcbiAqIGFyZSBtZXJnZWQgcmVjdXJzaXZlbHkuIE90aGVyIG9iamVjdHMgYW5kIHZhbHVlIHR5cGVzIGFyZSBvdmVycmlkZGVuIGJ5XG4gKiBhc3NpZ25tZW50LiBTb3VyY2Ugb2JqZWN0cyBhcmUgYXBwbGllZCBmcm9tIGxlZnQgdG8gcmlnaHQuIFN1YnNlcXVlbnRcbiAqIHNvdXJjZXMgb3ZlcndyaXRlIHByb3BlcnR5IGFzc2lnbm1lbnRzIG9mIHByZXZpb3VzIHNvdXJjZXMuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIG11dGF0ZXMgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjUuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VzXSBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0ge1xuICogICAnYSc6IFt7ICdiJzogMiB9LCB7ICdkJzogNCB9XVxuICogfTtcbiAqXG4gKiB2YXIgb3RoZXIgPSB7XG4gKiAgICdhJzogW3sgJ2MnOiAzIH0sIHsgJ2UnOiA1IH1dXG4gKiB9O1xuICpcbiAqIF8ubWVyZ2Uob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiB7ICdhJzogW3sgJ2InOiAyLCAnYyc6IDMgfSwgeyAnZCc6IDQsICdlJzogNSB9XSB9XG4gKi9cbnZhciBtZXJnZSA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCkge1xuICBiYXNlTWVyZ2Uob2JqZWN0LCBzb3VyY2UsIHNyY0luZGV4KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9tZXJnZS5qc1xuLy8gbW9kdWxlIGlkID0gMzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5pbXBvcnQgQmFyY29kZURlY29kZXIgZnJvbSAnLi9kZWNvZGVyL2JhcmNvZGVfZGVjb2Rlcl8yJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdCAoY29uZmlnKSB7XG4gIHJldHVybiBCYXJjb2RlRGVjb2Rlci5jcmVhdGUoY29uZmlnKVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3F1YWdnYS5qcyIsImNvbnN0IHZlYzIgPSB7XG4gICAgY2xvbmU6IHJlcXVpcmUoJ2dsLXZlYzIvY2xvbmUnKSxcbiAgICBkb3Q6IHJlcXVpcmUoJ2dsLXZlYzIvZG90Jylcbn1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgY2x1c3RlciBmb3IgZ3JvdXBpbmcgc2ltaWxhciBvcmllbnRhdGlvbnMgb2YgZGF0YXBvaW50c1xuICAgICAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24ocG9pbnQsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgcG9pbnRzID0gW10sXG4gICAgICAgICAgICBjZW50ZXIgPSB7XG4gICAgICAgICAgICAgICAgcmFkOiAwLFxuICAgICAgICAgICAgICAgIHZlYzogdmVjMi5jbG9uZShbMCwgMF0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9pbnRNYXAgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgYWRkKHBvaW50KTtcbiAgICAgICAgICAgIHVwZGF0ZUNlbnRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkKHBvaW50VG9BZGQpIHtcbiAgICAgICAgICAgIHBvaW50TWFwW3BvaW50VG9BZGQuaWRdID0gcG9pbnRUb0FkZDtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHBvaW50VG9BZGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ2VudGVyKCkge1xuICAgICAgICAgICAgdmFyIGksIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBwb2ludHNbaV0ucmFkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2VudGVyLnJhZCA9IHN1bSAvIHBvaW50cy5sZW5ndGg7XG4gICAgICAgICAgICBjZW50ZXIudmVjID0gdmVjMi5jbG9uZShbTWF0aC5jb3MoY2VudGVyLnJhZCksIE1hdGguc2luKGNlbnRlci5yYWQpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpbml0KCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFkZDogZnVuY3Rpb24ocG9pbnRUb0FkZCkge1xuICAgICAgICAgICAgICAgIGlmICghcG9pbnRNYXBbcG9pbnRUb0FkZC5pZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkKHBvaW50VG9BZGQpO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZml0czogZnVuY3Rpb24ob3RoZXJQb2ludCkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvc2luZSBzaW1pbGFyaXR5IHRvIGNlbnRlci1hbmdsZVxuICAgICAgICAgICAgICAgIHZhciBzaW1pbGFyaXR5ID0gTWF0aC5hYnModmVjMi5kb3Qob3RoZXJQb2ludC5wb2ludC52ZWMsIGNlbnRlci52ZWMpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2ltaWxhcml0eSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFBvaW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRDZW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjZW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBjcmVhdGVQb2ludDogZnVuY3Rpb24obmV3UG9pbnQsIGlkLCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmFkOiBuZXdQb2ludFtwcm9wZXJ0eV0sXG4gICAgICAgICAgICBwb2ludDogbmV3UG9pbnQsXG4gICAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbW1vbi9jbHVzdGVyLmpzIiwiaW1wb3J0IENsdXN0ZXIyIGZyb20gJy4vY2x1c3Rlcic7XG5pbXBvcnQgQXJyYXlIZWxwZXIgZnJvbSAnLi9hcnJheV9oZWxwZXInO1xuY29uc3QgdmVjMiA9IHtcbiAgICBjbG9uZTogcmVxdWlyZSgnZ2wtdmVjMi9jbG9uZScpLFxufTtcbmNvbnN0IHZlYzMgPSB7XG4gICAgY2xvbmU6IHJlcXVpcmUoJ2dsLXZlYzMvY2xvbmUnKSxcbn07XG5cbi8qKlxuICogQHBhcmFtIHggeC1jb29yZGluYXRlXG4gKiBAcGFyYW0geSB5LWNvb3JkaW5hdGVcbiAqIEByZXR1cm4gSW1hZ2VSZWZlcmVuY2Uge3gseX0gQ29vcmRpbmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW1hZ2VSZWYoeCwgeSkge1xuICAgIHZhciB0aGF0ID0ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICB0b1ZlYzI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZlYzIuY2xvbmUoW3RoaXMueCwgdGhpcy55XSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvVmVjMzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdmVjMy5jbG9uZShbdGhpcy54LCB0aGlzLnksIDFdKTtcbiAgICAgICAgfSxcbiAgICAgICAgcm91bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy54ID0gdGhpcy54ID4gMC4wID8gTWF0aC5mbG9vcih0aGlzLnggKyAwLjUpIDogTWF0aC5mbG9vcih0aGlzLnggLSAwLjUpO1xuICAgICAgICAgICAgdGhpcy55ID0gdGhpcy55ID4gMC4wID8gTWF0aC5mbG9vcih0aGlzLnkgKyAwLjUpIDogTWF0aC5mbG9vcih0aGlzLnkgLSAwLjUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiB0aGF0O1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyBhbiBpbnRlZ3JhbCBpbWFnZSBvZiBhIGdpdmVuIGdyYXlzY2FsZSBpbWFnZS5cbiAqIEBwYXJhbSBpbWFnZURhdGFDb250YWluZXIge0ltYWdlRGF0YUNvbnRhaW5lcn0gdGhlIGltYWdlIHRvIGJlIGludGVncmF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVJbnRlZ3JhbEltYWdlMihpbWFnZVdyYXBwZXIsIGludGVncmFsV3JhcHBlcikge1xuICAgIHZhciBpbWFnZURhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YTtcbiAgICB2YXIgd2lkdGggPSBpbWFnZVdyYXBwZXIuc2l6ZS54O1xuICAgIHZhciBoZWlnaHQgPSBpbWFnZVdyYXBwZXIuc2l6ZS55O1xuICAgIHZhciBpbnRlZ3JhbEltYWdlRGF0YSA9IGludGVncmFsV3JhcHBlci5kYXRhO1xuICAgIHZhciBzdW0gPSAwLCBwb3NBID0gMCwgcG9zQiA9IDAsIHBvc0MgPSAwLCBwb3NEID0gMCwgeCwgeTtcblxuICAgIC8vIHN1bSB1cCBmaXJzdCBjb2x1bW5cbiAgICBwb3NCID0gd2lkdGg7XG4gICAgc3VtID0gMDtcbiAgICBmb3IgKCB5ID0gMTsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIHN1bSArPSBpbWFnZURhdGFbcG9zQV07XG4gICAgICAgIGludGVncmFsSW1hZ2VEYXRhW3Bvc0JdICs9IHN1bTtcbiAgICAgICAgcG9zQSArPSB3aWR0aDtcbiAgICAgICAgcG9zQiArPSB3aWR0aDtcbiAgICB9XG5cbiAgICBwb3NBID0gMDtcbiAgICBwb3NCID0gMTtcbiAgICBzdW0gPSAwO1xuICAgIGZvciAoIHggPSAxOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICBzdW0gKz0gaW1hZ2VEYXRhW3Bvc0FdO1xuICAgICAgICBpbnRlZ3JhbEltYWdlRGF0YVtwb3NCXSArPSBzdW07XG4gICAgICAgIHBvc0ErKztcbiAgICAgICAgcG9zQisrO1xuICAgIH1cblxuICAgIGZvciAoIHkgPSAxOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgcG9zQSA9IHkgKiB3aWR0aCArIDE7XG4gICAgICAgIHBvc0IgPSAoeSAtIDEpICogd2lkdGggKyAxO1xuICAgICAgICBwb3NDID0geSAqIHdpZHRoO1xuICAgICAgICBwb3NEID0gKHkgLSAxKSAqIHdpZHRoO1xuICAgICAgICBmb3IgKCB4ID0gMTsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIGludGVncmFsSW1hZ2VEYXRhW3Bvc0FdICs9XG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhW3Bvc0FdICsgaW50ZWdyYWxJbWFnZURhdGFbcG9zQl0gKyBpbnRlZ3JhbEltYWdlRGF0YVtwb3NDXSAtIGludGVncmFsSW1hZ2VEYXRhW3Bvc0RdO1xuICAgICAgICAgICAgcG9zQSsrO1xuICAgICAgICAgICAgcG9zQisrO1xuICAgICAgICAgICAgcG9zQysrO1xuICAgICAgICAgICAgcG9zRCsrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVJbnRlZ3JhbEltYWdlKGltYWdlV3JhcHBlciwgaW50ZWdyYWxXcmFwcGVyKSB7XG4gICAgdmFyIGltYWdlRGF0YSA9IGltYWdlV3JhcHBlci5kYXRhO1xuICAgIHZhciB3aWR0aCA9IGltYWdlV3JhcHBlci5zaXplLng7XG4gICAgdmFyIGhlaWdodCA9IGltYWdlV3JhcHBlci5zaXplLnk7XG4gICAgdmFyIGludGVncmFsSW1hZ2VEYXRhID0gaW50ZWdyYWxXcmFwcGVyLmRhdGE7XG4gICAgdmFyIHN1bSA9IDA7XG5cbiAgICAvLyBzdW0gdXAgZmlyc3Qgcm93XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBpbWFnZURhdGFbaV07XG4gICAgICAgIGludGVncmFsSW1hZ2VEYXRhW2ldID0gc3VtO1xuICAgIH1cblxuICAgIGZvciAodmFyIHYgPSAxOyB2IDwgaGVpZ2h0OyB2KyspIHtcbiAgICAgICAgc3VtID0gMDtcbiAgICAgICAgZm9yICh2YXIgdSA9IDA7IHUgPCB3aWR0aDsgdSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gaW1hZ2VEYXRhW3YgKiB3aWR0aCArIHVdO1xuICAgICAgICAgICAgaW50ZWdyYWxJbWFnZURhdGFbKCh2KSAqIHdpZHRoKSArIHVdID0gc3VtICsgaW50ZWdyYWxJbWFnZURhdGFbKHYgLSAxKSAqIHdpZHRoICsgdV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyZXNob2xkSW1hZ2UoaW1hZ2VXcmFwcGVyLCB0aHJlc2hvbGQsIHRhcmdldFdyYXBwZXIpIHtcbiAgICBpZiAoIXRhcmdldFdyYXBwZXIpIHtcbiAgICAgICAgdGFyZ2V0V3JhcHBlciA9IGltYWdlV3JhcHBlcjtcbiAgICB9XG4gICAgdmFyIGltYWdlRGF0YSA9IGltYWdlV3JhcHBlci5kYXRhLCBsZW5ndGggPSBpbWFnZURhdGEubGVuZ3RoLCB0YXJnZXREYXRhID0gdGFyZ2V0V3JhcHBlci5kYXRhO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIHRhcmdldERhdGFbbGVuZ3RoXSA9IGltYWdlRGF0YVtsZW5ndGhdIDwgdGhyZXNob2xkID8gMSA6IDA7XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVIaXN0b2dyYW0oaW1hZ2VXcmFwcGVyLCBiaXRzUGVyUGl4ZWwpIHtcbiAgICBpZiAoIWJpdHNQZXJQaXhlbCkge1xuICAgICAgICBiaXRzUGVyUGl4ZWwgPSA4O1xuICAgIH1cbiAgICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIGxlbmd0aCA9IGltYWdlRGF0YS5sZW5ndGgsXG4gICAgICAgIGJpdFNoaWZ0ID0gOCAtIGJpdHNQZXJQaXhlbCxcbiAgICAgICAgYnVja2V0Q250ID0gMSA8PCBiaXRzUGVyUGl4ZWwsXG4gICAgICAgIGhpc3QgPSBuZXcgSW50MzJBcnJheShidWNrZXRDbnQpO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGhpc3RbaW1hZ2VEYXRhW2xlbmd0aF0gPj4gYml0U2hpZnRdKys7XG4gICAgfVxuICAgIHJldHVybiBoaXN0O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYXJwZW5MaW5lKGxpbmUpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgbGVuZ3RoID0gbGluZS5sZW5ndGgsXG4gICAgICAgIGxlZnQgPSBsaW5lWzBdLFxuICAgICAgICBjZW50ZXIgPSBsaW5lWzFdLFxuICAgICAgICByaWdodDtcblxuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgcmlnaHQgPSBsaW5lW2kgKyAxXTtcbiAgICAgICAgLy8gIC0xIDQgLTEga2VybmVsXG4gICAgICAgIGxpbmVbaSAtIDFdID0gKCgoY2VudGVyICogMikgLSBsZWZ0IC0gcmlnaHQpKSAmIDI1NTtcbiAgICAgICAgbGVmdCA9IGNlbnRlcjtcbiAgICAgICAgY2VudGVyID0gcmlnaHQ7XG4gICAgfVxuICAgIHJldHVybiBsaW5lO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZU90c3VUaHJlc2hvbGQoaW1hZ2VXcmFwcGVyLCBiaXRzUGVyUGl4ZWwpIHtcbiAgICBpZiAoIWJpdHNQZXJQaXhlbCkge1xuICAgICAgICBiaXRzUGVyUGl4ZWwgPSA4O1xuICAgIH1cbiAgICB2YXIgaGlzdCxcbiAgICAgICAgdGhyZXNob2xkLFxuICAgICAgICBiaXRTaGlmdCA9IDggLSBiaXRzUGVyUGl4ZWw7XG5cbiAgICBmdW5jdGlvbiBweChpbml0LCBlbmQpIHtcbiAgICAgICAgdmFyIHN1bSA9IDAsIGk7XG4gICAgICAgIGZvciAoIGkgPSBpbml0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gaGlzdFtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG14KGluaXQsIGVuZCkge1xuICAgICAgICB2YXIgaSwgc3VtID0gMDtcblxuICAgICAgICBmb3IgKCBpID0gaW5pdDsgaSA8PSBlbmQ7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGkgKiBoaXN0W2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1bTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXRlcm1pbmVUaHJlc2hvbGQoKSB7XG4gICAgICAgIHZhciB2ZXQgPSBbMF0sIHAxLCBwMiwgcDEyLCBrLCBtMSwgbTIsIG0xMixcbiAgICAgICAgICAgIG1heCA9ICgxIDw8IGJpdHNQZXJQaXhlbCkgLSAxO1xuXG4gICAgICAgIGhpc3QgPSBjb21wdXRlSGlzdG9ncmFtKGltYWdlV3JhcHBlciwgYml0c1BlclBpeGVsKTtcbiAgICAgICAgZm9yICggayA9IDE7IGsgPCBtYXg7IGsrKykge1xuICAgICAgICAgICAgcDEgPSBweCgwLCBrKTtcbiAgICAgICAgICAgIHAyID0gcHgoayArIDEsIG1heCk7XG4gICAgICAgICAgICBwMTIgPSBwMSAqIHAyO1xuICAgICAgICAgICAgaWYgKHAxMiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHAxMiA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtMSA9IG14KDAsIGspICogcDI7XG4gICAgICAgICAgICBtMiA9IG14KGsgKyAxLCBtYXgpICogcDE7XG4gICAgICAgICAgICBtMTIgPSBtMSAtIG0yO1xuICAgICAgICAgICAgdmV0W2tdID0gbTEyICogbTEyIC8gcDEyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheUhlbHBlci5tYXhJbmRleCh2ZXQpO1xuICAgIH1cblxuICAgIHRocmVzaG9sZCA9IGRldGVybWluZVRocmVzaG9sZCgpO1xuICAgIHJldHVybiB0aHJlc2hvbGQgPDwgYml0U2hpZnQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gb3RzdVRocmVzaG9sZChpbWFnZVdyYXBwZXIsIHRhcmdldFdyYXBwZXIpIHtcbiAgICB2YXIgdGhyZXNob2xkID0gZGV0ZXJtaW5lT3RzdVRocmVzaG9sZChpbWFnZVdyYXBwZXIpO1xuXG4gICAgdGhyZXNob2xkSW1hZ2UoaW1hZ2VXcmFwcGVyLCB0aHJlc2hvbGQsIHRhcmdldFdyYXBwZXIpO1xuICAgIHJldHVybiB0aHJlc2hvbGQ7XG59O1xuXG4vLyBsb2NhbCB0aHJlc2hvbGRpbmdcbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlQmluYXJ5SW1hZ2UoaW1hZ2VXcmFwcGVyLCBpbnRlZ3JhbFdyYXBwZXIsIHRhcmdldFdyYXBwZXIpIHtcbiAgICBjb21wdXRlSW50ZWdyYWxJbWFnZShpbWFnZVdyYXBwZXIsIGludGVncmFsV3JhcHBlcik7XG5cbiAgICBpZiAoIXRhcmdldFdyYXBwZXIpIHtcbiAgICAgICAgdGFyZ2V0V3JhcHBlciA9IGltYWdlV3JhcHBlcjtcbiAgICB9XG4gICAgdmFyIGltYWdlRGF0YSA9IGltYWdlV3JhcHBlci5kYXRhO1xuICAgIHZhciB0YXJnZXREYXRhID0gdGFyZ2V0V3JhcHBlci5kYXRhO1xuICAgIHZhciB3aWR0aCA9IGltYWdlV3JhcHBlci5zaXplLng7XG4gICAgdmFyIGhlaWdodCA9IGltYWdlV3JhcHBlci5zaXplLnk7XG4gICAgdmFyIGludGVncmFsSW1hZ2VEYXRhID0gaW50ZWdyYWxXcmFwcGVyLmRhdGE7XG4gICAgdmFyIHN1bSA9IDAsIHYsIHUsIGtlcm5lbCA9IDMsIEEsIEIsIEMsIEQsIGF2Zywgc2l6ZSA9IChrZXJuZWwgKiAyICsgMSkgKiAoa2VybmVsICogMiArIDEpO1xuXG4gICAgLy8gY2xlYXIgb3V0IHRvcCAmIGJvdHRvbS1ib3JkZXJcbiAgICBmb3IgKCB2ID0gMDsgdiA8PSBrZXJuZWw7IHYrKykge1xuICAgICAgICBmb3IgKCB1ID0gMDsgdSA8IHdpZHRoOyB1KyspIHtcbiAgICAgICAgICAgIHRhcmdldERhdGFbKCh2KSAqIHdpZHRoKSArIHVdID0gMDtcbiAgICAgICAgICAgIHRhcmdldERhdGFbKCgoaGVpZ2h0IC0gMSkgLSB2KSAqIHdpZHRoKSArIHVdID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNsZWFyIG91dCBsZWZ0ICYgcmlnaHQgYm9yZGVyXG4gICAgZm9yICggdiA9IGtlcm5lbDsgdiA8IGhlaWdodCAtIGtlcm5lbDsgdisrKSB7XG4gICAgICAgIGZvciAoIHUgPSAwOyB1IDw9IGtlcm5lbDsgdSsrKSB7XG4gICAgICAgICAgICB0YXJnZXREYXRhWygodikgKiB3aWR0aCkgKyB1XSA9IDA7XG4gICAgICAgICAgICB0YXJnZXREYXRhWygodikgKiB3aWR0aCkgKyAod2lkdGggLSAxIC0gdSldID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoIHYgPSBrZXJuZWwgKyAxOyB2IDwgaGVpZ2h0IC0ga2VybmVsIC0gMTsgdisrKSB7XG4gICAgICAgIGZvciAoIHUgPSBrZXJuZWwgKyAxOyB1IDwgd2lkdGggLSBrZXJuZWw7IHUrKykge1xuICAgICAgICAgICAgQSA9IGludGVncmFsSW1hZ2VEYXRhWyh2IC0ga2VybmVsIC0gMSkgKiB3aWR0aCArICh1IC0ga2VybmVsIC0gMSldO1xuICAgICAgICAgICAgQiA9IGludGVncmFsSW1hZ2VEYXRhWyh2IC0ga2VybmVsIC0gMSkgKiB3aWR0aCArICh1ICsga2VybmVsKV07XG4gICAgICAgICAgICBDID0gaW50ZWdyYWxJbWFnZURhdGFbKHYgKyBrZXJuZWwpICogd2lkdGggKyAodSAtIGtlcm5lbCAtIDEpXTtcbiAgICAgICAgICAgIEQgPSBpbnRlZ3JhbEltYWdlRGF0YVsodiArIGtlcm5lbCkgKiB3aWR0aCArICh1ICsga2VybmVsKV07XG4gICAgICAgICAgICBzdW0gPSBEIC0gQyAtIEIgKyBBO1xuICAgICAgICAgICAgYXZnID0gc3VtIC8gKHNpemUpO1xuICAgICAgICAgICAgdGFyZ2V0RGF0YVt2ICogd2lkdGggKyB1XSA9IGltYWdlRGF0YVt2ICogd2lkdGggKyB1XSA+IChhdmcgKyA1KSA/IDAgOiAxO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsdXN0ZXIocG9pbnRzLCB0aHJlc2hvbGQsIHByb3BlcnR5KSB7XG4gICAgdmFyIGksIGssIGNsdXN0ZXIsIHBvaW50LCBjbHVzdGVycyA9IFtdO1xuXG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICBwcm9wZXJ0eSA9IFwicmFkXCI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkVG9DbHVzdGVyKG5ld1BvaW50KSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKCBrID0gMDsgayA8IGNsdXN0ZXJzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBjbHVzdGVyID0gY2x1c3RlcnNba107XG4gICAgICAgICAgICBpZiAoY2x1c3Rlci5maXRzKG5ld1BvaW50KSkge1xuICAgICAgICAgICAgICAgIGNsdXN0ZXIuYWRkKG5ld1BvaW50KTtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cblxuICAgIC8vIGl0ZXJhdGUgb3ZlciBlYWNoIGNsb3VkXG4gICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcG9pbnQgPSBDbHVzdGVyMi5jcmVhdGVQb2ludChwb2ludHNbaV0sIGksIHByb3BlcnR5KTtcbiAgICAgICAgaWYgKCFhZGRUb0NsdXN0ZXIocG9pbnQpKSB7XG4gICAgICAgICAgICBjbHVzdGVycy5wdXNoKENsdXN0ZXIyLmNyZWF0ZShwb2ludCwgdGhyZXNob2xkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNsdXN0ZXJzO1xufTtcblxuZXhwb3J0IGNvbnN0IFRyYWNlciA9IHtcbiAgICB0cmFjZTogZnVuY3Rpb24ocG9pbnRzLCB2ZWMpIHtcbiAgICAgICAgdmFyIGl0ZXJhdGlvbiwgbWF4SXRlcmF0aW9ucyA9IDEwLCB0b3AgPSBbXSwgcmVzdWx0ID0gW10sIGNlbnRlclBvcyA9IDAsIGN1cnJlbnRQb3MgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIHRyYWNlKGlkeCwgZm9yd2FyZCkge1xuICAgICAgICAgICAgdmFyIGZyb20sIHRvLCB0b0lkeCwgcHJlZGljdGVkUG9zLCB0aHJlc2hvbGRYID0gMSwgdGhyZXNob2xkWSA9IE1hdGguYWJzKHZlY1sxXSAvIDEwKSwgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbWF0Y2gocG9zLCBwcmVkaWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zLnggPiAocHJlZGljdGVkLnggLSB0aHJlc2hvbGRYKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcG9zLnggPCAocHJlZGljdGVkLnggKyB0aHJlc2hvbGRYKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcG9zLnkgPiAocHJlZGljdGVkLnkgLSB0aHJlc2hvbGRZKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcG9zLnkgPCAocHJlZGljdGVkLnkgKyB0aHJlc2hvbGRZKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgbmV4dCBpbmRleCBpcyB3aXRoaW4gdGhlIHZlYyBzcGVjaWZpY2F0aW9uc1xuICAgICAgICAgICAgLy8gaWYgbm90LCBjaGVjayBhcyBsb25nIGFzIHRoZSB0aHJlc2hvbGQgaXMgbWV0XG5cbiAgICAgICAgICAgIGZyb20gPSBwb2ludHNbaWR4XTtcbiAgICAgICAgICAgIGlmIChmb3J3YXJkKSB7XG4gICAgICAgICAgICAgICAgcHJlZGljdGVkUG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBmcm9tLnggKyB2ZWNbMF0sXG4gICAgICAgICAgICAgICAgICAgIHk6IGZyb20ueSArIHZlY1sxXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZWRpY3RlZFBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogZnJvbS54IC0gdmVjWzBdLFxuICAgICAgICAgICAgICAgICAgICB5OiBmcm9tLnkgLSB2ZWNbMV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b0lkeCA9IGZvcndhcmQgPyBpZHggKyAxIDogaWR4IC0gMTtcbiAgICAgICAgICAgIHRvID0gcG9pbnRzW3RvSWR4XTtcbiAgICAgICAgICAgIHdoaWxlICh0byAmJiAoIGZvdW5kID0gbWF0Y2godG8sIHByZWRpY3RlZFBvcykpICE9PSB0cnVlICYmIChNYXRoLmFicyh0by55IC0gZnJvbS55KSA8IHZlY1sxXSkpIHtcbiAgICAgICAgICAgICAgICB0b0lkeCA9IGZvcndhcmQgPyB0b0lkeCArIDEgOiB0b0lkeCAtIDE7XG4gICAgICAgICAgICAgICAgdG8gPSBwb2ludHNbdG9JZHhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm91bmQgPyB0b0lkeCA6IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBpdGVyYXRpb24gPSAwOyBpdGVyYXRpb24gPCBtYXhJdGVyYXRpb25zOyBpdGVyYXRpb24rKykge1xuICAgICAgICAgICAgLy8gcmFuZG9tbHkgc2VsZWN0IHBvaW50IHRvIHN0YXJ0IHdpdGhcbiAgICAgICAgICAgIGNlbnRlclBvcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvaW50cy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAvLyB0cmFjZSBmb3J3YXJkXG4gICAgICAgICAgICB0b3AgPSBbXTtcbiAgICAgICAgICAgIGN1cnJlbnRQb3MgPSBjZW50ZXJQb3M7XG4gICAgICAgICAgICB0b3AucHVzaChwb2ludHNbY3VycmVudFBvc10pO1xuICAgICAgICAgICAgd2hpbGUgKCggY3VycmVudFBvcyA9IHRyYWNlKGN1cnJlbnRQb3MsIHRydWUpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRvcC5wdXNoKHBvaW50c1tjdXJyZW50UG9zXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2VudGVyUG9zID4gMCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQb3MgPSBjZW50ZXJQb3M7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCggY3VycmVudFBvcyA9IHRyYWNlKGN1cnJlbnRQb3MsIGZhbHNlKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLnB1c2gocG9pbnRzW2N1cnJlbnRQb3NdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3AubGVuZ3RoID4gcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBESUxBVEUgPSAxO1xuZXhwb3J0IGNvbnN0IEVST0RFID0gMjtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpbGF0ZShpbkltYWdlV3JhcHBlciwgb3V0SW1hZ2VXcmFwcGVyKSB7XG4gICAgdmFyIHYsXG4gICAgICAgIHUsXG4gICAgICAgIGluSW1hZ2VEYXRhID0gaW5JbWFnZVdyYXBwZXIuZGF0YSxcbiAgICAgICAgb3V0SW1hZ2VEYXRhID0gb3V0SW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIGhlaWdodCA9IGluSW1hZ2VXcmFwcGVyLnNpemUueSxcbiAgICAgICAgd2lkdGggPSBpbkltYWdlV3JhcHBlci5zaXplLngsXG4gICAgICAgIHN1bSxcbiAgICAgICAgeVN0YXJ0MSxcbiAgICAgICAgeVN0YXJ0MixcbiAgICAgICAgeFN0YXJ0MSxcbiAgICAgICAgeFN0YXJ0MjtcblxuICAgIGZvciAoIHYgPSAxOyB2IDwgaGVpZ2h0IC0gMTsgdisrKSB7XG4gICAgICAgIGZvciAoIHUgPSAxOyB1IDwgd2lkdGggLSAxOyB1KyspIHtcbiAgICAgICAgICAgIHlTdGFydDEgPSB2IC0gMTtcbiAgICAgICAgICAgIHlTdGFydDIgPSB2ICsgMTtcbiAgICAgICAgICAgIHhTdGFydDEgPSB1IC0gMTtcbiAgICAgICAgICAgIHhTdGFydDIgPSB1ICsgMTtcbiAgICAgICAgICAgIHN1bSA9IGluSW1hZ2VEYXRhW3lTdGFydDEgKiB3aWR0aCArIHhTdGFydDFdICsgaW5JbWFnZURhdGFbeVN0YXJ0MSAqIHdpZHRoICsgeFN0YXJ0Ml0gK1xuICAgICAgICAgICAgaW5JbWFnZURhdGFbdiAqIHdpZHRoICsgdV0gK1xuICAgICAgICAgICAgaW5JbWFnZURhdGFbeVN0YXJ0MiAqIHdpZHRoICsgeFN0YXJ0MV0gKyBpbkltYWdlRGF0YVt5U3RhcnQyICogd2lkdGggKyB4U3RhcnQyXTtcbiAgICAgICAgICAgIG91dEltYWdlRGF0YVt2ICogd2lkdGggKyB1XSA9IHN1bSA+IDAgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBlcm9kZShpbkltYWdlV3JhcHBlciwgb3V0SW1hZ2VXcmFwcGVyKSB7XG4gICAgdmFyIHYsXG4gICAgICAgIHUsXG4gICAgICAgIGluSW1hZ2VEYXRhID0gaW5JbWFnZVdyYXBwZXIuZGF0YSxcbiAgICAgICAgb3V0SW1hZ2VEYXRhID0gb3V0SW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIGhlaWdodCA9IGluSW1hZ2VXcmFwcGVyLnNpemUueSxcbiAgICAgICAgd2lkdGggPSBpbkltYWdlV3JhcHBlci5zaXplLngsXG4gICAgICAgIHN1bSxcbiAgICAgICAgeVN0YXJ0MSxcbiAgICAgICAgeVN0YXJ0MixcbiAgICAgICAgeFN0YXJ0MSxcbiAgICAgICAgeFN0YXJ0MjtcblxuICAgIGZvciAoIHYgPSAxOyB2IDwgaGVpZ2h0IC0gMTsgdisrKSB7XG4gICAgICAgIGZvciAoIHUgPSAxOyB1IDwgd2lkdGggLSAxOyB1KyspIHtcbiAgICAgICAgICAgIHlTdGFydDEgPSB2IC0gMTtcbiAgICAgICAgICAgIHlTdGFydDIgPSB2ICsgMTtcbiAgICAgICAgICAgIHhTdGFydDEgPSB1IC0gMTtcbiAgICAgICAgICAgIHhTdGFydDIgPSB1ICsgMTtcbiAgICAgICAgICAgIHN1bSA9IGluSW1hZ2VEYXRhW3lTdGFydDEgKiB3aWR0aCArIHhTdGFydDFdICsgaW5JbWFnZURhdGFbeVN0YXJ0MSAqIHdpZHRoICsgeFN0YXJ0Ml0gK1xuICAgICAgICAgICAgaW5JbWFnZURhdGFbdiAqIHdpZHRoICsgdV0gK1xuICAgICAgICAgICAgaW5JbWFnZURhdGFbeVN0YXJ0MiAqIHdpZHRoICsgeFN0YXJ0MV0gKyBpbkltYWdlRGF0YVt5U3RhcnQyICogd2lkdGggKyB4U3RhcnQyXTtcbiAgICAgICAgICAgIG91dEltYWdlRGF0YVt2ICogd2lkdGggKyB1XSA9IHN1bSA9PT0gNSA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KGFJbWFnZVdyYXBwZXIsIGJJbWFnZVdyYXBwZXIsIHJlc3VsdEltYWdlV3JhcHBlcikge1xuICAgIGlmICghcmVzdWx0SW1hZ2VXcmFwcGVyKSB7XG4gICAgICAgIHJlc3VsdEltYWdlV3JhcHBlciA9IGFJbWFnZVdyYXBwZXI7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBhSW1hZ2VXcmFwcGVyLmRhdGEubGVuZ3RoLFxuICAgICAgICBhSW1hZ2VEYXRhID0gYUltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBiSW1hZ2VEYXRhID0gYkltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBjSW1hZ2VEYXRhID0gcmVzdWx0SW1hZ2VXcmFwcGVyLmRhdGE7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgY0ltYWdlRGF0YVtsZW5ndGhdID0gYUltYWdlRGF0YVtsZW5ndGhdIC0gYkltYWdlRGF0YVtsZW5ndGhdO1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBiaXR3aXNlT3IoYUltYWdlV3JhcHBlciwgYkltYWdlV3JhcHBlciwgcmVzdWx0SW1hZ2VXcmFwcGVyKSB7XG4gICAgaWYgKCFyZXN1bHRJbWFnZVdyYXBwZXIpIHtcbiAgICAgICAgcmVzdWx0SW1hZ2VXcmFwcGVyID0gYUltYWdlV3JhcHBlcjtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGFJbWFnZVdyYXBwZXIuZGF0YS5sZW5ndGgsXG4gICAgICAgIGFJbWFnZURhdGEgPSBhSW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIGJJbWFnZURhdGEgPSBiSW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIGNJbWFnZURhdGEgPSByZXN1bHRJbWFnZVdyYXBwZXIuZGF0YTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBjSW1hZ2VEYXRhW2xlbmd0aF0gPSBhSW1hZ2VEYXRhW2xlbmd0aF0gfHwgYkltYWdlRGF0YVtsZW5ndGhdO1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3VudE5vblplcm8oaW1hZ2VXcmFwcGVyKSB7XG4gICAgdmFyIGxlbmd0aCA9IGltYWdlV3JhcHBlci5kYXRhLmxlbmd0aCwgZGF0YSA9IGltYWdlV3JhcHBlci5kYXRhLCBzdW0gPSAwO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIHN1bSArPSBkYXRhW2xlbmd0aF07XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdG9wR2VuZXJpYyhsaXN0LCB0b3AsIHNjb3JlRnVuYykge1xuICAgIHZhciBpLCBtaW5JZHggPSAwLCBtaW4gPSAwLCBxdWV1ZSA9IFtdLCBzY29yZSwgaGl0LCBwb3M7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHRvcDsgaSsrKSB7XG4gICAgICAgIHF1ZXVlW2ldID0ge1xuICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICBpdGVtOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yICggaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNjb3JlID0gc2NvcmVGdW5jLmFwcGx5KHRoaXMsIFtsaXN0W2ldXSk7XG4gICAgICAgIGlmIChzY29yZSA+IG1pbikge1xuICAgICAgICAgICAgaGl0ID0gcXVldWVbbWluSWR4XTtcbiAgICAgICAgICAgIGhpdC5zY29yZSA9IHNjb3JlO1xuICAgICAgICAgICAgaGl0Lml0ZW0gPSBsaXN0W2ldO1xuICAgICAgICAgICAgbWluID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgICAgIGZvciAoIHBvcyA9IDA7IHBvcyA8IHRvcDsgcG9zKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocXVldWVbcG9zXS5zY29yZSA8IG1pbikge1xuICAgICAgICAgICAgICAgICAgICBtaW4gPSBxdWV1ZVtwb3NdLnNjb3JlO1xuICAgICAgICAgICAgICAgICAgICBtaW5JZHggPSBwb3M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1ZXVlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdyYXlBcnJheUZyb21JbWFnZShodG1sSW1hZ2UsIG9mZnNldFgsIGN0eCwgYXJyYXkpIHtcbiAgICBjdHguZHJhd0ltYWdlKGh0bWxJbWFnZSwgb2Zmc2V0WCwgMCwgaHRtbEltYWdlLndpZHRoLCBodG1sSW1hZ2UuaGVpZ2h0KTtcbiAgICB2YXIgY3R4RGF0YSA9IGN0eC5nZXRJbWFnZURhdGEob2Zmc2V0WCwgMCwgaHRtbEltYWdlLndpZHRoLCBodG1sSW1hZ2UuaGVpZ2h0KS5kYXRhO1xuICAgIGNvbXB1dGVHcmF5KGN0eERhdGEsIGFycmF5KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBncmF5QXJyYXlGcm9tQ29udGV4dChjdHgsIHNpemUsIG9mZnNldCwgYXJyYXkpIHtcbiAgICB2YXIgY3R4RGF0YSA9IGN0eC5nZXRJbWFnZURhdGEob2Zmc2V0LngsIG9mZnNldC55LCBzaXplLngsIHNpemUueSkuZGF0YTtcbiAgICBjb21wdXRlR3JheShjdHhEYXRhLCBhcnJheSk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ3JheUFuZEhhbGZTYW1wbGVGcm9tQ2FudmFzRGF0YShjYW52YXNEYXRhLCBzaXplLCBvdXRBcnJheSkge1xuICAgIHZhciB0b3BSb3dJZHggPSAwO1xuICAgIHZhciBib3R0b21Sb3dJZHggPSBzaXplLng7XG4gICAgdmFyIGVuZElkeCA9IE1hdGguZmxvb3IoY2FudmFzRGF0YS5sZW5ndGggLyA0KTtcbiAgICB2YXIgb3V0V2lkdGggPSBzaXplLnggLyAyO1xuICAgIHZhciBvdXRJbWdJZHggPSAwO1xuICAgIHZhciBpbldpZHRoID0gc2l6ZS54O1xuICAgIHZhciBpO1xuXG4gICAgd2hpbGUgKGJvdHRvbVJvd0lkeCA8IGVuZElkeCkge1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG91dFdpZHRoOyBpKyspIHtcbiAgICAgICAgICAgIG91dEFycmF5W291dEltZ0lkeF0gPSAoXG4gICAgICAgICAgICAgICAgKDAuMjk5ICogY2FudmFzRGF0YVt0b3BSb3dJZHggKiA0ICsgMF0gK1xuICAgICAgICAgICAgICAgICAwLjU4NyAqIGNhbnZhc0RhdGFbdG9wUm93SWR4ICogNCArIDFdICtcbiAgICAgICAgICAgICAgICAgMC4xMTQgKiBjYW52YXNEYXRhW3RvcFJvd0lkeCAqIDQgKyAyXSkgK1xuICAgICAgICAgICAgICAgICgwLjI5OSAqIGNhbnZhc0RhdGFbKHRvcFJvd0lkeCArIDEpICogNCArIDBdICtcbiAgICAgICAgICAgICAgICAgMC41ODcgKiBjYW52YXNEYXRhWyh0b3BSb3dJZHggKyAxKSAqIDQgKyAxXSArXG4gICAgICAgICAgICAgICAgIDAuMTE0ICogY2FudmFzRGF0YVsodG9wUm93SWR4ICsgMSkgKiA0ICsgMl0pICtcbiAgICAgICAgICAgICAgICAoMC4yOTkgKiBjYW52YXNEYXRhWyhib3R0b21Sb3dJZHgpICogNCArIDBdICtcbiAgICAgICAgICAgICAgICAgMC41ODcgKiBjYW52YXNEYXRhWyhib3R0b21Sb3dJZHgpICogNCArIDFdICtcbiAgICAgICAgICAgICAgICAgMC4xMTQgKiBjYW52YXNEYXRhWyhib3R0b21Sb3dJZHgpICogNCArIDJdKSArXG4gICAgICAgICAgICAgICAgKDAuMjk5ICogY2FudmFzRGF0YVsoYm90dG9tUm93SWR4ICsgMSkgKiA0ICsgMF0gK1xuICAgICAgICAgICAgICAgICAwLjU4NyAqIGNhbnZhc0RhdGFbKGJvdHRvbVJvd0lkeCArIDEpICogNCArIDFdICtcbiAgICAgICAgICAgICAgICAgMC4xMTQgKiBjYW52YXNEYXRhWyhib3R0b21Sb3dJZHggKyAxKSAqIDQgKyAyXSkpIC8gNDtcbiAgICAgICAgICAgIG91dEltZ0lkeCsrO1xuICAgICAgICAgICAgdG9wUm93SWR4ID0gdG9wUm93SWR4ICsgMjtcbiAgICAgICAgICAgIGJvdHRvbVJvd0lkeCA9IGJvdHRvbVJvd0lkeCArIDI7XG4gICAgICAgIH1cbiAgICAgICAgdG9wUm93SWR4ID0gdG9wUm93SWR4ICsgaW5XaWR0aDtcbiAgICAgICAgYm90dG9tUm93SWR4ID0gYm90dG9tUm93SWR4ICsgaW5XaWR0aDtcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUdyYXkoaW1hZ2VEYXRhLCBvdXRBcnJheSwgY29uZmlnKSB7XG4gICAgdmFyIGwgPSAoaW1hZ2VEYXRhLmxlbmd0aCAvIDQpIHwgMCxcbiAgICAgICAgaSxcbiAgICAgICAgc2luZ2xlQ2hhbm5lbCA9IGNvbmZpZyAmJiBjb25maWcuc2luZ2xlQ2hhbm5lbCA9PT0gdHJ1ZTtcblxuICAgIGlmIChzaW5nbGVDaGFubmVsKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIG91dEFycmF5W2ldID0gaW1hZ2VEYXRhW2kgKiA0ICsgMF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRBcnJheVtpXSA9XG4gICAgICAgICAgICAgICAgMC4yOTkgKiBpbWFnZURhdGFbaSAqIDQgKyAwXSArIDAuNTg3ICogaW1hZ2VEYXRhW2kgKiA0ICsgMV0gKyAwLjExNCAqIGltYWdlRGF0YVtpICogNCArIDJdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRJbWFnZUFycmF5KHNyYywgY2FsbGJhY2ssIGNhbnZhcykge1xuICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIH1cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLCAwLCAwKTtcbiAgICAgICAgdmFyIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLCAwLCAwKTtcbiAgICAgICAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5kYXRhO1xuICAgICAgICBjb21wdXRlR3JheShkYXRhLCBhcnJheSk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soYXJyYXksIHtcbiAgICAgICAgICAgIHg6IHRoaXMud2lkdGgsXG4gICAgICAgICAgICB5OiB0aGlzLmhlaWdodFxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9O1xuICAgIGltZy5zcmMgPSBzcmM7XG59O1xuXG4vKipcbiAqIEBwYXJhbSBpbkltZyB7SW1hZ2VXcmFwcGVyfSBpbnB1dCBpbWFnZSB0byBiZSBzYW1wbGVkXG4gKiBAcGFyYW0gb3V0SW1nIHtJbWFnZVdyYXBwZXJ9IHRvIGJlIHN0b3JlZCBpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFsZlNhbXBsZShpbkltZ1dyYXBwZXIsIG91dEltZ1dyYXBwZXIpIHtcbiAgICB2YXIgaW5JbWcgPSBpbkltZ1dyYXBwZXIuZGF0YTtcbiAgICB2YXIgaW5XaWR0aCA9IGluSW1nV3JhcHBlci5zaXplLng7XG4gICAgdmFyIG91dEltZyA9IG91dEltZ1dyYXBwZXIuZGF0YTtcbiAgICB2YXIgdG9wUm93SWR4ID0gMDtcbiAgICB2YXIgYm90dG9tUm93SWR4ID0gaW5XaWR0aDtcbiAgICB2YXIgZW5kSWR4ID0gaW5JbWcubGVuZ3RoO1xuICAgIHZhciBvdXRXaWR0aCA9IGluV2lkdGggLyAyO1xuICAgIHZhciBvdXRJbWdJZHggPSAwO1xuICAgIHdoaWxlIChib3R0b21Sb3dJZHggPCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdXRXaWR0aDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRJbWdbb3V0SW1nSWR4XSA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICAgICAgKGluSW1nW3RvcFJvd0lkeF0gKyBpbkltZ1t0b3BSb3dJZHggKyAxXSArIGluSW1nW2JvdHRvbVJvd0lkeF0gKyBpbkltZ1tib3R0b21Sb3dJZHggKyAxXSkgLyA0KTtcbiAgICAgICAgICAgIG91dEltZ0lkeCsrO1xuICAgICAgICAgICAgdG9wUm93SWR4ID0gdG9wUm93SWR4ICsgMjtcbiAgICAgICAgICAgIGJvdHRvbVJvd0lkeCA9IGJvdHRvbVJvd0lkeCArIDI7XG4gICAgICAgIH1cbiAgICAgICAgdG9wUm93SWR4ID0gdG9wUm93SWR4ICsgaW5XaWR0aDtcbiAgICAgICAgYm90dG9tUm93SWR4ID0gYm90dG9tUm93SWR4ICsgaW5XaWR0aDtcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaHN2MnJnYihoc3YsIHJnYikge1xuICAgIHZhciBoID0gaHN2WzBdLFxuICAgICAgICBzID0gaHN2WzFdLFxuICAgICAgICB2ID0gaHN2WzJdLFxuICAgICAgICBjID0gdiAqIHMsXG4gICAgICAgIHggPSBjICogKDEgLSBNYXRoLmFicygoaCAvIDYwKSAlIDIgLSAxKSksXG4gICAgICAgIG0gPSB2IC0gYyxcbiAgICAgICAgciA9IDAsXG4gICAgICAgIGcgPSAwLFxuICAgICAgICBiID0gMDtcblxuICAgIHJnYiA9IHJnYiB8fCBbMCwgMCwgMF07XG5cbiAgICBpZiAoaCA8IDYwKSB7XG4gICAgICAgIHIgPSBjO1xuICAgICAgICBnID0geDtcbiAgICB9IGVsc2UgaWYgKGggPCAxMjApIHtcbiAgICAgICAgciA9IHg7XG4gICAgICAgIGcgPSBjO1xuICAgIH0gZWxzZSBpZiAoaCA8IDE4MCkge1xuICAgICAgICBnID0gYztcbiAgICAgICAgYiA9IHg7XG4gICAgfSBlbHNlIGlmIChoIDwgMjQwKSB7XG4gICAgICAgIGcgPSB4O1xuICAgICAgICBiID0gYztcbiAgICB9IGVsc2UgaWYgKGggPCAzMDApIHtcbiAgICAgICAgciA9IHg7XG4gICAgICAgIGIgPSBjO1xuICAgIH0gZWxzZSBpZiAoaCA8IDM2MCkge1xuICAgICAgICByID0gYztcbiAgICAgICAgYiA9IHg7XG4gICAgfVxuICAgIHJnYlswXSA9ICgociArIG0pICogMjU1KSB8IDA7XG4gICAgcmdiWzFdID0gKChnICsgbSkgKiAyNTUpIHwgMDtcbiAgICByZ2JbMl0gPSAoKGIgKyBtKSAqIDI1NSkgfCAwO1xuICAgIHJldHVybiByZ2I7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX2NvbXB1dGVEaXZpc29ycyhuKSB7XG4gICAgdmFyIGxhcmdlRGl2aXNvcnMgPSBbXSxcbiAgICAgICAgZGl2aXNvcnMgPSBbXSxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDE7IGkgPCBNYXRoLnNxcnQobikgKyAxOyBpKyspIHtcbiAgICAgICAgaWYgKG4gJSBpID09PSAwKSB7XG4gICAgICAgICAgICBkaXZpc29ycy5wdXNoKGkpO1xuICAgICAgICAgICAgaWYgKGkgIT09IG4gLyBpKSB7XG4gICAgICAgICAgICAgICAgbGFyZ2VEaXZpc29ycy51bnNoaWZ0KE1hdGguZmxvb3IobiAvIGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGl2aXNvcnMuY29uY2F0KGxhcmdlRGl2aXNvcnMpO1xufTtcblxuZnVuY3Rpb24gX2NvbXB1dGVJbnRlcnNlY3Rpb24oYXJyMSwgYXJyMikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgaiA9IDAsXG4gICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgd2hpbGUgKGkgPCBhcnIxLmxlbmd0aCAmJiBqIDwgYXJyMi5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGFycjFbaV0gPT09IGFycjJbal0pIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFycjFbaV0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9IGVsc2UgaWYgKGFycjFbaV0gPiBhcnIyW2pdKSB7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQYXRjaFNpemUocGF0Y2hTaXplLCBpbWdTaXplKSB7XG4gICAgdmFyIGRpdmlzb3JzWCA9IF9jb21wdXRlRGl2aXNvcnMoaW1nU2l6ZS54KSxcbiAgICAgICAgZGl2aXNvcnNZID0gX2NvbXB1dGVEaXZpc29ycyhpbWdTaXplLnkpLFxuICAgICAgICB3aWRlU2lkZSA9IE1hdGgubWF4KGltZ1NpemUueCwgaW1nU2l6ZS55KSxcbiAgICAgICAgY29tbW9uID0gX2NvbXB1dGVJbnRlcnNlY3Rpb24oZGl2aXNvcnNYLCBkaXZpc29yc1kpLFxuICAgICAgICBuck9mUGF0Y2hlc0xpc3QgPSBbOCwgMTAsIDE1LCAyMCwgMzIsIDYwLCA4MF0sXG4gICAgICAgIG5yT2ZQYXRjaGVzTWFwID0ge1xuICAgICAgICAgICAgXCJ4LXNtYWxsXCI6IDUsXG4gICAgICAgICAgICBcInNtYWxsXCI6IDQsXG4gICAgICAgICAgICBcIm1lZGl1bVwiOiAzLFxuICAgICAgICAgICAgXCJsYXJnZVwiOiAyLFxuICAgICAgICAgICAgXCJ4LWxhcmdlXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgbnJPZlBhdGNoZXNJZHggPSBuck9mUGF0Y2hlc01hcFtwYXRjaFNpemVdIHx8IG5yT2ZQYXRjaGVzTWFwLm1lZGl1bSxcbiAgICAgICAgbnJPZlBhdGNoZXMgPSBuck9mUGF0Y2hlc0xpc3RbbnJPZlBhdGNoZXNJZHhdLFxuICAgICAgICBkZXNpcmVkUGF0Y2hTaXplID0gTWF0aC5mbG9vcih3aWRlU2lkZSAvIG5yT2ZQYXRjaGVzKSxcbiAgICAgICAgb3B0aW1hbFBhdGNoU2l6ZTtcblxuICAgIGZ1bmN0aW9uIGZpbmRQYXRjaFNpemVGb3JEaXZpc29ycyhkaXZpc29ycykge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBmb3VuZCA9IGRpdmlzb3JzW01hdGguZmxvb3IoZGl2aXNvcnMubGVuZ3RoIC8gMildO1xuXG4gICAgICAgIHdoaWxlIChpIDwgKGRpdmlzb3JzLmxlbmd0aCAtIDEpICYmIGRpdmlzb3JzW2ldIDwgZGVzaXJlZFBhdGNoU2l6ZSkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpdmlzb3JzW2ldIC0gZGVzaXJlZFBhdGNoU2l6ZSkgPiBNYXRoLmFicyhkaXZpc29yc1tpIC0gMV0gLSBkZXNpcmVkUGF0Y2hTaXplKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gZGl2aXNvcnNbaSAtIDFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGRpdmlzb3JzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZXNpcmVkUGF0Y2hTaXplIC8gZm91bmQgPCBuck9mUGF0Y2hlc0xpc3RbbnJPZlBhdGNoZXNJZHggKyAxXSAvIG5yT2ZQYXRjaGVzTGlzdFtuck9mUGF0Y2hlc0lkeF0gJiZcbiAgICAgICAgICAgIGRlc2lyZWRQYXRjaFNpemUgLyBmb3VuZCA+IG5yT2ZQYXRjaGVzTGlzdFtuck9mUGF0Y2hlc0lkeCAtIDFdIC8gbnJPZlBhdGNoZXNMaXN0W25yT2ZQYXRjaGVzSWR4XSApIHtcbiAgICAgICAgICAgIHJldHVybiB7eDogZm91bmQsIHk6IGZvdW5kfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBvcHRpbWFsUGF0Y2hTaXplID0gZmluZFBhdGNoU2l6ZUZvckRpdmlzb3JzKGNvbW1vbik7XG4gICAgaWYgKCFvcHRpbWFsUGF0Y2hTaXplKSB7XG4gICAgICAgIG9wdGltYWxQYXRjaFNpemUgPSBmaW5kUGF0Y2hTaXplRm9yRGl2aXNvcnMoX2NvbXB1dGVEaXZpc29ycyh3aWRlU2lkZSkpO1xuICAgICAgICBpZiAoIW9wdGltYWxQYXRjaFNpemUpIHtcbiAgICAgICAgICAgIG9wdGltYWxQYXRjaFNpemUgPSBmaW5kUGF0Y2hTaXplRm9yRGl2aXNvcnMoKF9jb21wdXRlRGl2aXNvcnMoZGVzaXJlZFBhdGNoU2l6ZSAqIG5yT2ZQYXRjaGVzKSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpbWFsUGF0Y2hTaXplO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9wYXJzZUNTU0RpbWVuc2lvblZhbHVlcyh2YWx1ZSkge1xuICAgIHZhciBkaW1lbnNpb24gPSB7XG4gICAgICAgIHZhbHVlOiBwYXJzZUZsb2F0KHZhbHVlKSxcbiAgICAgICAgdW5pdDogdmFsdWUuaW5kZXhPZihcIiVcIikgPT09IHZhbHVlLmxlbmd0aCAtIDEgPyBcIiVcIiA6IFwiJVwiXG4gICAgfTtcblxuICAgIHJldHVybiBkaW1lbnNpb247XG59O1xuXG5leHBvcnQgY29uc3QgX2RpbWVuc2lvbnNDb252ZXJ0ZXJzID0ge1xuICAgIHRvcDogZnVuY3Rpb24oZGltZW5zaW9uLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChkaW1lbnNpb24udW5pdCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvbnRleHQuaGVpZ2h0ICogKGRpbWVuc2lvbi52YWx1ZSAvIDEwMCkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByaWdodDogZnVuY3Rpb24oZGltZW5zaW9uLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChkaW1lbnNpb24udW5pdCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvbnRleHQud2lkdGggLSAoY29udGV4dC53aWR0aCAqIChkaW1lbnNpb24udmFsdWUgLyAxMDApKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbTogZnVuY3Rpb24oZGltZW5zaW9uLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChkaW1lbnNpb24udW5pdCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvbnRleHQuaGVpZ2h0IC0gKGNvbnRleHQuaGVpZ2h0ICogKGRpbWVuc2lvbi52YWx1ZSAvIDEwMCkpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbGVmdDogZnVuY3Rpb24oZGltZW5zaW9uLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChkaW1lbnNpb24udW5pdCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvbnRleHQud2lkdGggKiAoZGltZW5zaW9uLnZhbHVlIC8gMTAwKSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUltYWdlQXJlYShpbnB1dFdpZHRoLCBpbnB1dEhlaWdodCwgYXJlYSkge1xuICAgIHZhciBjb250ZXh0ID0ge3dpZHRoOiBpbnB1dFdpZHRoLCBoZWlnaHQ6IGlucHV0SGVpZ2h0fTtcblxuICAgIHZhciBwYXJzZWRBcmVhID0gT2JqZWN0LmtleXMoYXJlYSkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZWFba2V5XSxcbiAgICAgICAgICAgIHBhcnNlZCA9IF9wYXJzZUNTU0RpbWVuc2lvblZhbHVlcyh2YWx1ZSksXG4gICAgICAgICAgICBjYWxjdWxhdGVkID0gX2RpbWVuc2lvbnNDb252ZXJ0ZXJzW2tleV0ocGFyc2VkLCBjb250ZXh0KTtcblxuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGN1bGF0ZWQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3g6IHBhcnNlZEFyZWEubGVmdCxcbiAgICAgICAgc3k6IHBhcnNlZEFyZWEudG9wLFxuICAgICAgICBzdzogcGFyc2VkQXJlYS5yaWdodCAtIHBhcnNlZEFyZWEubGVmdCxcbiAgICAgICAgc2g6IHBhcnNlZEFyZWEuYm90dG9tIC0gcGFyc2VkQXJlYS50b3BcbiAgICB9O1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vY3ZfdXRpbHMuanMiLCIvKipcbiAqIENvbnN0cnVjdCByZXByZXNlbnRpbmcgYSBwYXJ0IG9mIGFub3RoZXIge0ltYWdlV3JhcHBlcn0uIFNoYXJlcyBkYXRhXG4gKiBiZXR3ZWVuIHRoZSBwYXJlbnQgYW5kIHRoZSBjaGlsZC5cbiAqIEBwYXJhbSBmcm9tIHtJbWFnZVJlZn0gVGhlIHBvc2l0aW9uIHdoZXJlIHRvIHN0YXJ0IHRoZSB7U3ViSW1hZ2V9IGZyb20uICh0b3AtbGVmdCBjb3JuZXIpXG4gKiBAcGFyYW0gc2l6ZSB7SW1hZ2VSZWZ9IFRoZSBzaXplIG9mIHRoZSByZXN1bHRpbmcgaW1hZ2VcbiAqIEBwYXJhbSBJIHtJbWFnZVdyYXBwZXJ9IFRoZSB7SW1hZ2VXcmFwcGVyfSB0byBzaGFyZSBmcm9tXG4gKiBAcmV0dXJucyB7U3ViSW1hZ2V9IEEgc2hhcmVkIHBhcnQgb2YgdGhlIG9yaWdpbmFsIGltYWdlXG4gKi9cbmZ1bmN0aW9uIFN1YkltYWdlKGZyb20sIHNpemUsIEkpIHtcbiAgICBpZiAoIUkpIHtcbiAgICAgICAgSSA9IHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IEkuZGF0YTtcbiAgICB0aGlzLm9yaWdpbmFsU2l6ZSA9IEkuc2l6ZTtcbiAgICB0aGlzLkkgPSBJO1xuXG4gICAgdGhpcy5mcm9tID0gZnJvbTtcbiAgICB0aGlzLnNpemUgPSBzaXplO1xufVxuXG4vKipcbiAqIERpc3BsYXlzIHRoZSB7U3ViSW1hZ2V9IGluIGEgZ2l2ZW4gY2FudmFzXG4gKiBAcGFyYW0gY2FudmFzIHtDYW52YXN9IFRoZSBjYW52YXMgZWxlbWVudCB0byB3cml0ZSB0b1xuICogQHBhcmFtIHNjYWxlIHtOdW1iZXJ9IFNjYWxlIHdoaWNoIGlzIGFwcGxpZWQgdG8gZWFjaCBwaXhlbC12YWx1ZVxuICovXG5TdWJJbWFnZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKGNhbnZhcywgc2NhbGUpIHtcbiAgICB2YXIgY3R4LFxuICAgICAgICBmcmFtZSxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgeSxcbiAgICAgICAgeCxcbiAgICAgICAgcGl4ZWw7XG5cbiAgICBpZiAoIXNjYWxlKSB7XG4gICAgICAgIHNjYWxlID0gMS4wO1xuICAgIH1cbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjYW52YXMud2lkdGggPSB0aGlzLnNpemUueDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5zaXplLnk7XG4gICAgZnJhbWUgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgZGF0YSA9IGZyYW1lLmRhdGE7XG4gICAgY3VycmVudCA9IDA7XG4gICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuc2l6ZS55OyB5KyspIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuc2l6ZS54OyB4KyspIHtcbiAgICAgICAgICAgIHBpeGVsID0geSAqIHRoaXMuc2l6ZS54ICsgeDtcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldCh4LCB5KSAqIHNjYWxlO1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAwXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBkYXRhW3BpeGVsICogNCArIDFdID0gY3VycmVudDtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgMl0gPSBjdXJyZW50O1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAzXSA9IDI1NTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmcmFtZS5kYXRhID0gZGF0YTtcbiAgICBjdHgucHV0SW1hZ2VEYXRhKGZyYW1lLCAwLCAwKTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGEgZ2l2ZW4gcGl4ZWwgcG9zaXRpb24gZnJvbSB0aGUge1N1YkltYWdlfVxuICogQHBhcmFtIHgge051bWJlcn0gVGhlIHgtcG9zaXRpb25cbiAqIEBwYXJhbSB5IHtOdW1iZXJ9IFRoZSB5LXBvc2l0aW9uXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgZ3JheXNjYWxlIHZhbHVlIGF0IHRoZSBwaXhlbC1wb3NpdGlvblxuICovXG5TdWJJbWFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB0aGlzLmRhdGFbKHRoaXMuZnJvbS55ICsgeSkgKiB0aGlzLm9yaWdpbmFsU2l6ZS54ICsgdGhpcy5mcm9tLnggKyB4XTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgdW5kZXJseWluZyBkYXRhIGZyb20gYSBnaXZlbiB7SW1hZ2VXcmFwcGVyfVxuICogQHBhcmFtIGltYWdlIHtJbWFnZVdyYXBwZXJ9IFRoZSB1cGRhdGVkIGltYWdlXG4gKi9cblN1YkltYWdlLnByb3RvdHlwZS51cGRhdGVEYXRhID0gZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICB0aGlzLm9yaWdpbmFsU2l6ZSA9IGltYWdlLnNpemU7XG4gICAgdGhpcy5kYXRhID0gaW1hZ2UuZGF0YTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgcG9zaXRpb24gb2YgdGhlIHNoYXJlZCBhcmVhXG4gKiBAcGFyYW0gZnJvbSB7eCx5fSBUaGUgbmV3IGxvY2F0aW9uXG4gKiBAcmV0dXJucyB7U3ViSW1hZ2V9IHJldHVybnMge3RoaXN9IGZvciBwb3NzaWJsZSBjaGFpbmluZ1xuICovXG5TdWJJbWFnZS5wcm90b3R5cGUudXBkYXRlRnJvbSA9IGZ1bmN0aW9uKGZyb20pIHtcbiAgICB0aGlzLmZyb20gPSBmcm9tO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgKFN1YkltYWdlKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vc3ViSW1hZ2UuanMiLCJpbXBvcnQgQnJlc2VuaGFtIGZyb20gJy4vYnJlc2VuaGFtJztcbmltcG9ydCBJbWFnZVdyYXBwZXIgZnJvbSAnLi4vY29tbW9uL2ltYWdlX3dyYXBwZXInO1xuaW1wb3J0IENvZGUxMjhSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2NvZGVfMTI4X3JlYWRlcic7XG5pbXBvcnQgRUFOUmVhZGVyIGZyb20gJy4uL3JlYWRlci9lYW5fcmVhZGVyJztcbmltcG9ydCBDb2RlMzlSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2NvZGVfMzlfcmVhZGVyJztcbmltcG9ydCBDb2RlMzlWSU5SZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2NvZGVfMzlfdmluX3JlYWRlcic7XG5pbXBvcnQgQ29kYWJhclJlYWRlciBmcm9tICcuLi9yZWFkZXIvY29kYWJhcl9yZWFkZXInO1xuaW1wb3J0IFVQQ1JlYWRlciBmcm9tICcuLi9yZWFkZXIvdXBjX3JlYWRlcic7XG5pbXBvcnQgRUFOOFJlYWRlciBmcm9tICcuLi9yZWFkZXIvZWFuXzhfcmVhZGVyJztcbmltcG9ydCBFQU4yUmVhZGVyIGZyb20gJy4uL3JlYWRlci9lYW5fMl9yZWFkZXInO1xuaW1wb3J0IEVBTjVSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2Vhbl81X3JlYWRlcic7XG5pbXBvcnQgVVBDRVJlYWRlciBmcm9tICcuLi9yZWFkZXIvdXBjX2VfcmVhZGVyJztcbmltcG9ydCBJMm9mNVJlYWRlciBmcm9tICcuLi9yZWFkZXIvaTJvZjVfcmVhZGVyJztcbmltcG9ydCBUd29PZkZpdmVSZWFkZXIgZnJvbSAnLi4vcmVhZGVyLzJvZjVfcmVhZGVyJztcbmltcG9ydCBDb2RlOTNSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2NvZGVfOTNfcmVhZGVyJztcbmNvbnN0IHZlYzJjbG9uZSA9IHJlcXVpcmUoJ2dsLXZlYzIvY2xvbmUnKVxuXG5jb25zdCBSRUFERVJTID0ge1xuICAgIGNvZGVfMTI4X3JlYWRlcjogQ29kZTEyOFJlYWRlcixcbiAgICBlYW5fcmVhZGVyOiBFQU5SZWFkZXIsXG4gICAgZWFuXzVfcmVhZGVyOiBFQU41UmVhZGVyLFxuICAgIGVhbl8yX3JlYWRlcjogRUFOMlJlYWRlcixcbiAgICBlYW5fOF9yZWFkZXI6IEVBTjhSZWFkZXIsXG4gICAgY29kZV8zOV9yZWFkZXI6IENvZGUzOVJlYWRlcixcbiAgICBjb2RlXzM5X3Zpbl9yZWFkZXI6IENvZGUzOVZJTlJlYWRlcixcbiAgICBjb2RhYmFyX3JlYWRlcjogQ29kYWJhclJlYWRlcixcbiAgICB1cGNfcmVhZGVyOiBVUENSZWFkZXIsXG4gICAgdXBjX2VfcmVhZGVyOiBVUENFUmVhZGVyLFxuICAgIGkyb2Y1X3JlYWRlcjogSTJvZjVSZWFkZXIsXG4gICAgJzJvZjVfcmVhZGVyJzogVHdvT2ZGaXZlUmVhZGVyLFxuICAgIGNvZGVfOTNfcmVhZGVyOiBDb2RlOTNSZWFkZXJcbn07XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIGxldCBpbnB1dEltYWdlV3JhcHBlclxuICAgICAgbGV0IF9iYXJjb2RlUmVhZGVycyA9IFtdO1xuXG4gICAgICAgIGluaXRSZWFkZXJzKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdFJlYWRlcnMoKSB7XG4gICAgICAgICAgICBjb25maWcucmVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHJlYWRlckNvbmZpZykge1xuICAgICAgICAgICAgICAgIHZhciByZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgc3VwcGxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVhZGVyQ29uZmlnID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICByZWFkZXIgPSByZWFkZXJDb25maWcuZm9ybWF0O1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gcmVhZGVyQ29uZmlnLmNvbmZpZztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByZWFkZXJDb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlciA9IHJlYWRlckNvbmZpZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKEVOVi5kZXZlbG9wbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJlZm9yZSByZWdpc3RlcmluZyByZWFkZXI6IFwiLCByZWFkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5zdXBwbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzdXBwbGVtZW50cyA9IGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdXBwbGVtZW50cy5tYXAoKHN1cHBsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJFQURFUlNbc3VwcGxlbWVudF0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfYmFyY29kZVJlYWRlcnMucHVzaChuZXcgUkVBREVSU1tyZWFkZXJdKGNvbmZpZ3VyYXRpb24sIHN1cHBsZW1lbnRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBleHRlbmQgdGhlIGxpbmUgb24gYm90aCBlbmRzXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpbmVcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRFeHRlbmRlZExpbmUobGluZSwgYW5nbGUsIGV4dCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZXh0ZW5kTGluZShhbW91bnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB5OiBhbW91bnQgKiBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgICAgICAgICAgIHg6IGFtb3VudCAqIE1hdGguY29zKGFuZ2xlKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBsaW5lWzBdLnkgLT0gZXh0ZW5zaW9uLnk7XG4gICAgICAgICAgICAgICAgbGluZVswXS54IC09IGV4dGVuc2lvbi54O1xuICAgICAgICAgICAgICAgIGxpbmVbMV0ueSArPSBleHRlbnNpb24ueTtcbiAgICAgICAgICAgICAgICBsaW5lWzFdLnggKz0gZXh0ZW5zaW9uLng7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGluc2lkZSBpbWFnZVxuICAgICAgICAgICAgZXh0ZW5kTGluZShleHQpO1xuICAgICAgICAgICAgd2hpbGUgKGV4dCA+IDEgJiYgKCFpbnB1dEltYWdlV3JhcHBlci5pbkltYWdlV2l0aEJvcmRlcihsaW5lWzBdLCAwKVxuICAgICAgICAgICAgICAgICAgICB8fCAhaW5wdXRJbWFnZVdyYXBwZXIuaW5JbWFnZVdpdGhCb3JkZXIobGluZVsxXSwgMCkpKSB7XG4gICAgICAgICAgICAgICAgZXh0IC09IE1hdGguY2VpbChleHQgLyAyKTtcbiAgICAgICAgICAgICAgICBleHRlbmRMaW5lKC1leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRMaW5lKGJveCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgeDogKGJveFsxXVswXSAtIGJveFswXVswXSkgLyAyICsgYm94WzBdWzBdLFxuICAgICAgICAgICAgICAgIHk6IChib3hbMV1bMV0gLSBib3hbMF1bMV0pIC8gMiArIGJveFswXVsxXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHg6IChib3hbM11bMF0gLSBib3hbMl1bMF0pIC8gMiArIGJveFsyXVswXSxcbiAgICAgICAgICAgICAgICB5OiAoYm94WzNdWzFdIC0gYm94WzJdWzFdKSAvIDIgKyBib3hbMl1bMV1cbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdHJ5RGVjb2RlKGxpbmUpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgYmFyY29kZUxpbmUgPSBCcmVzZW5oYW0uZ2V0QmFyY29kZUxpbmUoaW5wdXRJbWFnZVdyYXBwZXIsIGxpbmVbMF0sIGxpbmVbMV0pO1xuXG4gICAgICAgICAgICBCcmVzZW5oYW0udG9CaW5hcnlMaW5lKGJhcmNvZGVMaW5lKTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBfYmFyY29kZVJlYWRlcnMubGVuZ3RoICYmIHJlc3VsdCA9PT0gbnVsbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gX2JhcmNvZGVSZWFkZXJzW2ldLmRlY29kZVBhdHRlcm4oYmFyY29kZUxpbmUubGluZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29kZVJlc3VsdDogcmVzdWx0LFxuICAgICAgICAgICAgICAgIGJhcmNvZGVMaW5lOiBiYXJjb2RlTGluZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCBzbGljZXMgdGhlIGdpdmVuIGFyZWEgYXBhcnQgYW5kIHRyaWVzIHRvIGRldGVjdCBhIGJhcmNvZGUtcGF0dGVyblxuICAgICAgICAgKiBmb3IgZWFjaCBzbGljZS4gSXQgcmV0dXJucyB0aGUgZGVjb2RlZCBiYXJjb2RlLCBvciBudWxsIGlmIG5vdGhpbmcgd2FzIGZvdW5kXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGJveFxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBsaW5lXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsaW5lQW5nbGVcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHRyeURlY29kZUJydXRlRm9yY2UoYm94LCBsaW5lLCBsaW5lQW5nbGUpIHtcbiAgICAgICAgICAgIHZhciBzaWRlTGVuZ3RoID0gTWF0aC5zcXJ0KE1hdGgucG93KGJveFsxXVswXSAtIGJveFswXVswXSwgMikgKyBNYXRoLnBvdygoYm94WzFdWzFdIC0gYm94WzBdWzFdKSwgMikpLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgc2xpY2VzID0gMTYsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBkaXIsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uLFxuICAgICAgICAgICAgICAgIHhkaXIgPSBNYXRoLnNpbihsaW5lQW5nbGUpLFxuICAgICAgICAgICAgICAgIHlkaXIgPSBNYXRoLmNvcyhsaW5lQW5nbGUpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMTsgaSA8IHNsaWNlcyAmJiByZXN1bHQgPT09IG51bGw7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIG1vdmUgbGluZSBwZXJwZW5kaWN1bGFyIHRvIGFuZ2xlXG4gICAgICAgICAgICAgICAgZGlyID0gc2lkZUxlbmd0aCAvIHNsaWNlcyAqIGkgKiAoaSAlIDIgPT09IDAgPyAtMSA6IDEpO1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeTogZGlyICogeGRpcixcbiAgICAgICAgICAgICAgICAgICAgeDogZGlyICogeWRpclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbGluZVswXS55ICs9IGV4dGVuc2lvbi54O1xuICAgICAgICAgICAgICAgIGxpbmVbMF0ueCAtPSBleHRlbnNpb24ueTtcbiAgICAgICAgICAgICAgICBsaW5lWzFdLnkgKz0gZXh0ZW5zaW9uLng7XG4gICAgICAgICAgICAgICAgbGluZVsxXS54IC09IGV4dGVuc2lvbi55O1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ5RGVjb2RlKGxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldExpbmVMZW5ndGgobGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhNYXRoLmFicyhsaW5lWzFdLnkgLSBsaW5lWzBdLnkpLCAyKSArXG4gICAgICAgICAgICAgICAgTWF0aC5wb3coTWF0aC5hYnMobGluZVsxXS54IC0gbGluZVswXS54KSwgMikpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpdGggdGhlIGhlbHAgb2YgdGhlIGNvbmZpZ3VyZWQgcmVhZGVycyAoQ29kZTEyOCBvciBFQU4pIHRoaXMgZnVuY3Rpb24gdHJpZXMgdG8gZGV0ZWN0IGFcbiAgICAgICAgICogdmFsaWQgYmFyY29kZSBwYXR0ZXJuIHdpdGhpbiB0aGUgZ2l2ZW4gYXJlYS5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGJveCBUaGUgYXJlYSB0byBzZWFyY2ggaW5cbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gdGhlIHJlc3VsdCB7Y29kZVJlc3VsdCwgbGluZSwgYW5nbGUsIHBhdHRlcm4sIHRocmVzaG9sZH1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGRlY29kZUZyb21Cb3VuZGluZ0JveChib3gpIHtcbiAgICAgICAgICAgIHZhciBsaW5lLFxuICAgICAgICAgICAgICAgIGxpbmVBbmdsZSxcbiAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgbGluZUxlbmd0aDtcblxuICAgICAgICAgICAgbGluZSA9IGdldExpbmUoYm94KTtcbiAgICAgICAgICAgIGxpbmVMZW5ndGggPSBnZXRMaW5lTGVuZ3RoKGxpbmUpO1xuICAgICAgICAgICAgbGluZUFuZ2xlID0gTWF0aC5hdGFuMihsaW5lWzFdLnkgLSBsaW5lWzBdLnksIGxpbmVbMV0ueCAtIGxpbmVbMF0ueCk7XG4gICAgICAgICAgICBsaW5lID0gZ2V0RXh0ZW5kZWRMaW5lKGxpbmUsIGxpbmVBbmdsZSwgTWF0aC5mbG9vcihsaW5lTGVuZ3RoICogMC4xKSk7XG4gICAgICAgICAgICBpZiAobGluZSA9PT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHRyeURlY29kZShsaW5lKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnlEZWNvZGVCcnV0ZUZvcmNlKGJveCwgbGluZSwgbGluZUFuZ2xlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb2RlUmVzdWx0OiByZXN1bHQuY29kZVJlc3VsdCxcbiAgICAgICAgICAgICAgICBsaW5lOiBsaW5lLFxuICAgICAgICAgICAgICAgIGFuZ2xlOiBsaW5lQW5nbGUsXG4gICAgICAgICAgICAgICAgcGF0dGVybjogcmVzdWx0LmJhcmNvZGVMaW5lLmxpbmUsXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiByZXN1bHQuYmFyY29kZUxpbmUudGhyZXNob2xkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGRlY29kZSAoaW1hZ2VEYXRhKSB7XG4gICAgICAgICAgLy8gV2FybmluZyEgQmVjYXVzZSBpJ20gaGFja2luZyB1cCBzb21lb25lIGVsc2UncyBjb2RlLCBpJ20ganVzdCBzZXR0aW5nXG4gICAgICAgICAgLy8gYSB2YXJpYWJsZSB0aGF0IGlzIGNsb3NlZCBvdmVyLCB0aGF0IHRoZSBkZWNvZGUqIGZ1bmNpdG9ucyB3aWxsIHVzZVxuICAgICAgICAgIC8vIFRISVMgRlVOQ1RJT04gSVMgTk9UIENPTkNVUlJFTlQgU0FGRSEgSXQgbXVzdCBvbmx5IGV2ZXIgYmUgY2FsbGVkXG4gICAgICAgICAgLy8gb25jZSBhdCBhIHRpbWUsIGFuZCBhbnkgY29uY3VycmVudCBjYWxscyB3aWxsIGNvcnJ1cHQgdGhlIGltYWdlRGF0YVxuICAgICAgICAgIC8vIGFuZCBkbyBob3JyaWJsZSB0aGluZ3MhXG4gICAgICAgICAgY29uc3Qgc2luZ2xlQ29sb3JJbWFnZURhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoaW1hZ2VEYXRhLmhlaWdodCAqIGltYWdlRGF0YS53aWR0aClcbiAgICAgICAgICBjb21wdXRlR3JheShpbWFnZURhdGEuZGF0YSwgc2luZ2xlQ29sb3JJbWFnZURhdGEsIGZhbHNlKVxuXG4gICAgICAgICAgaW5wdXRJbWFnZVdyYXBwZXIgPSBuZXcgSW1hZ2VXcmFwcGVyKHtcbiAgICAgICAgICAgIHk6IGltYWdlRGF0YS5oZWlnaHQsXG4gICAgICAgICAgICB4OiBpbWFnZURhdGEud2lkdGhcbiAgICAgICAgICB9LCBzaW5nbGVDb2xvckltYWdlRGF0YSwgVWludDhDbGFtcGVkQXJyYXksIGZhbHNlKVxuXG4gICAgICAgICAgY29uc29sZS5sb2coaW5wdXRJbWFnZVdyYXBwZXIpXG4gICAgICAgICAgcmV0dXJuIGRlY29kZUZyb21Cb3VuZGluZ0JveChbXG4gICAgICAgICAgICB2ZWMyY2xvbmUoWzAsIDBdKSxcbiAgICAgICAgICAgIHZlYzJjbG9uZShbMCwgaW5wdXRJbWFnZVdyYXBwZXIuc2l6ZS55XSksXG4gICAgICAgICAgICB2ZWMyY2xvbmUoW2lucHV0SW1hZ2VXcmFwcGVyLnNpemUueCwgaW5wdXRJbWFnZVdyYXBwZXIuc2l6ZS55XSksXG4gICAgICAgICAgICB2ZWMyY2xvbmUoW2lucHV0SW1hZ2VXcmFwcGVyLnNpemUueCwgMF0pLFxuICAgICAgICAgIF0pXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjb21wdXRlR3JheShpbWFnZURhdGEsIG91dEFycmF5LCBzaW5nbGVDaGFubmVsKSB7XG4gICAgdmFyIGwgPSAoaW1hZ2VEYXRhLmxlbmd0aCAvIDQpIHwgMCwgaTtcblxuICAgIGlmIChzaW5nbGVDaGFubmVsKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIG91dEFycmF5W2ldID0gaW1hZ2VEYXRhW2kgKiA0ICsgMF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRBcnJheVtpXSA9XG4gICAgICAgICAgICAgICAgMC4yOTkgKiBpbWFnZURhdGFbaSAqIDQgKyAwXSArIDAuNTg3ICogaW1hZ2VEYXRhW2kgKiA0ICsgMV0gKyAwLjExNCAqIGltYWdlRGF0YVtpICogNCArIDJdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9kZWNvZGVyL2JhcmNvZGVfZGVjb2Rlcl8yLmpzIiwiaW1wb3J0IEltYWdlV3JhcHBlciBmcm9tICcuLi9jb21tb24vaW1hZ2Vfd3JhcHBlcic7XG5cbnZhciBCcmVzZW5oYW0gPSB7fTtcblxudmFyIFNsb3BlID0ge1xuICAgIERJUjoge1xuICAgICAgICBVUDogMSxcbiAgICAgICAgRE9XTjogLTFcbiAgICB9XG59O1xuLyoqXG4gKiBTY2FucyBhIGxpbmUgb2YgdGhlIGdpdmVuIGltYWdlIGZyb20gcG9pbnQgcDEgdG8gcDIgYW5kIHJldHVybnMgYSByZXN1bHQgb2JqZWN0IGNvbnRhaW5pbmdcbiAqIGdyYXktc2NhbGUgdmFsdWVzICgwLTI1NSkgb2YgdGhlIHVuZGVybHlpbmcgcGl4ZWxzIGluIGFkZGl0aW9uIHRvIHRoZSBtaW5cbiAqIGFuZCBtYXggdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlV3JhcHBlclxuICogQHBhcmFtIHtPYmplY3R9IHAxIFRoZSBzdGFydCBwb2ludCB7eCx5fVxuICogQHBhcmFtIHtPYmplY3R9IHAyIFRoZSBlbmQgcG9pbnQge3gseX1cbiAqIEByZXR1cm5zIHtsaW5lLCBtaW4sIG1heH1cbiAqL1xuQnJlc2VuaGFtLmdldEJhcmNvZGVMaW5lID0gZnVuY3Rpb24oaW1hZ2VXcmFwcGVyLCBwMSwgcDIpIHtcbiAgICB2YXIgeDAgPSBwMS54IHwgMCxcbiAgICAgICAgeTAgPSBwMS55IHwgMCxcbiAgICAgICAgeDEgPSBwMi54IHwgMCxcbiAgICAgICAgeTEgPSBwMi55IHwgMCxcbiAgICAgICAgc3RlZXAgPSBNYXRoLmFicyh5MSAtIHkwKSA+IE1hdGguYWJzKHgxIC0geDApLFxuICAgICAgICBkZWx0YXgsXG4gICAgICAgIGRlbHRheSxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHlzdGVwLFxuICAgICAgICB5LFxuICAgICAgICB0bXAsXG4gICAgICAgIHgsXG4gICAgICAgIGxpbmUgPSBbXSxcbiAgICAgICAgaW1hZ2VEYXRhID0gaW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIHdpZHRoID0gaW1hZ2VXcmFwcGVyLnNpemUueCxcbiAgICAgICAgc3VtID0gMCxcbiAgICAgICAgdmFsLFxuICAgICAgICBtaW4gPSAyNTUsXG4gICAgICAgIG1heCA9IDA7XG5cbiAgICBmdW5jdGlvbiByZWFkKGEsIGIpIHtcbiAgICAgICAgdmFsID0gaW1hZ2VEYXRhW2IgKiB3aWR0aCArIGFdO1xuICAgICAgICBzdW0gKz0gdmFsO1xuICAgICAgICBtaW4gPSB2YWwgPCBtaW4gPyB2YWwgOiBtaW47XG4gICAgICAgIG1heCA9IHZhbCA+IG1heCA/IHZhbCA6IG1heDtcbiAgICAgICAgbGluZS5wdXNoKHZhbCk7XG4gICAgfVxuXG4gICAgaWYgKHN0ZWVwKSB7XG4gICAgICAgIHRtcCA9IHgwO1xuICAgICAgICB4MCA9IHkwO1xuICAgICAgICB5MCA9IHRtcDtcblxuICAgICAgICB0bXAgPSB4MTtcbiAgICAgICAgeDEgPSB5MTtcbiAgICAgICAgeTEgPSB0bXA7XG4gICAgfVxuICAgIGlmICh4MCA+IHgxKSB7XG4gICAgICAgIHRtcCA9IHgwO1xuICAgICAgICB4MCA9IHgxO1xuICAgICAgICB4MSA9IHRtcDtcblxuICAgICAgICB0bXAgPSB5MDtcbiAgICAgICAgeTAgPSB5MTtcbiAgICAgICAgeTEgPSB0bXA7XG4gICAgfVxuICAgIGRlbHRheCA9IHgxIC0geDA7XG4gICAgZGVsdGF5ID0gTWF0aC5hYnMoeTEgLSB5MCk7XG4gICAgZXJyb3IgPSAoZGVsdGF4IC8gMikgfCAwO1xuICAgIHkgPSB5MDtcbiAgICB5c3RlcCA9IHkwIDwgeTEgPyAxIDogLTE7XG4gICAgZm9yICggeCA9IHgwOyB4IDwgeDE7IHgrKykge1xuICAgICAgICBpZiAoc3RlZXApe1xuICAgICAgICAgICAgcmVhZCh5LCB4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlYWQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3IgPSBlcnJvciAtIGRlbHRheTtcbiAgICAgICAgaWYgKGVycm9yIDwgMCkge1xuICAgICAgICAgICAgeSA9IHkgKyB5c3RlcDtcbiAgICAgICAgICAgIGVycm9yID0gZXJyb3IgKyBkZWx0YXg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBsaW5lLFxuICAgICAgICBtaW46IG1pbixcbiAgICAgICAgbWF4OiBtYXhcbiAgICB9O1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgcmVzdWx0IGZyb20gZ2V0QmFyY29kZUxpbmUgaW50byBhIGJpbmFyeSByZXByZXNlbnRhdGlvblxuICogYWxzbyBjb25zaWRlcmluZyB0aGUgZnJlcXVlbmN5IGFuZCBzbG9wZSBvZiB0aGUgc2lnbmFsIGZvciBtb3JlIHJvYnVzdCByZXN1bHRzXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzdWx0IHtsaW5lLCBtaW4sIG1heH1cbiAqL1xuQnJlc2VuaGFtLnRvQmluYXJ5TGluZSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBtaW4gPSByZXN1bHQubWluLFxuICAgICAgICBtYXggPSByZXN1bHQubWF4LFxuICAgICAgICBsaW5lID0gcmVzdWx0LmxpbmUsXG4gICAgICAgIHNsb3BlLFxuICAgICAgICBzbG9wZTIsXG4gICAgICAgIGNlbnRlciA9IG1pbiArIChtYXggLSBtaW4pIC8gMixcbiAgICAgICAgZXh0cmVtYSA9IFtdLFxuICAgICAgICBjdXJyZW50RGlyLFxuICAgICAgICBkaXIsXG4gICAgICAgIHRocmVzaG9sZCA9IChtYXggLSBtaW4pIC8gMTIsXG4gICAgICAgIHJUaHJlc2hvbGQgPSAtdGhyZXNob2xkLFxuICAgICAgICBpLFxuICAgICAgICBqO1xuXG4gICAgLy8gMS4gZmluZCBleHRyZW1hXG4gICAgY3VycmVudERpciA9IGxpbmVbMF0gPiBjZW50ZXIgPyBTbG9wZS5ESVIuVVAgOiBTbG9wZS5ESVIuRE9XTjtcbiAgICBleHRyZW1hLnB1c2goe1xuICAgICAgICBwb3M6IDAsXG4gICAgICAgIHZhbDogbGluZVswXVxuICAgIH0pO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgbGluZS5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgc2xvcGUgPSAobGluZVtpICsgMV0gLSBsaW5lW2ldKTtcbiAgICAgICAgc2xvcGUyID0gKGxpbmVbaSArIDJdIC0gbGluZVtpICsgMV0pO1xuICAgICAgICBpZiAoKHNsb3BlICsgc2xvcGUyKSA8IHJUaHJlc2hvbGQgJiYgbGluZVtpICsgMV0gPCAoY2VudGVyICogMS41KSkge1xuICAgICAgICAgICAgZGlyID0gU2xvcGUuRElSLkRPV047XG4gICAgICAgIH0gZWxzZSBpZiAoKHNsb3BlICsgc2xvcGUyKSA+IHRocmVzaG9sZCAmJiBsaW5lW2kgKyAxXSA+IChjZW50ZXIgKiAwLjUpKSB7XG4gICAgICAgICAgICBkaXIgPSBTbG9wZS5ESVIuVVA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXIgPSBjdXJyZW50RGlyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN1cnJlbnREaXIgIT09IGRpcikge1xuICAgICAgICAgICAgZXh0cmVtYS5wdXNoKHtcbiAgICAgICAgICAgICAgICBwb3M6IGksXG4gICAgICAgICAgICAgICAgdmFsOiBsaW5lW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGN1cnJlbnREaXIgPSBkaXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmVtYS5wdXNoKHtcbiAgICAgICAgcG9zOiBsaW5lLmxlbmd0aCxcbiAgICAgICAgdmFsOiBsaW5lW2xpbmUubGVuZ3RoIC0gMV1cbiAgICB9KTtcblxuICAgIGZvciAoIGogPSBleHRyZW1hWzBdLnBvczsgaiA8IGV4dHJlbWFbMV0ucG9zOyBqKyspIHtcbiAgICAgICAgbGluZVtqXSA9IGxpbmVbal0gPiBjZW50ZXIgPyAwIDogMTtcbiAgICB9XG5cbiAgICAvLyBpdGVyYXRlIG92ZXIgZXh0cmVtYSBhbmQgY29udmVydCB0byBiaW5hcnkgYmFzZWQgb24gYXZnIGJldHdlZW4gbWlubWF4XG4gICAgZm9yICggaSA9IDE7IGkgPCBleHRyZW1hLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBpZiAoZXh0cmVtYVtpICsgMV0udmFsID4gZXh0cmVtYVtpXS52YWwpIHtcbiAgICAgICAgICAgIHRocmVzaG9sZCA9IChleHRyZW1hW2ldLnZhbCArICgoZXh0cmVtYVtpICsgMV0udmFsIC0gZXh0cmVtYVtpXS52YWwpIC8gMykgKiAyKSB8IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJlc2hvbGQgPSAoZXh0cmVtYVtpICsgMV0udmFsICsgKChleHRyZW1hW2ldLnZhbCAtIGV4dHJlbWFbaSArIDFdLnZhbCkgLyAzKSkgfCAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggaiA9IGV4dHJlbWFbaV0ucG9zOyBqIDwgZXh0cmVtYVtpICsgMV0ucG9zOyBqKyspIHtcbiAgICAgICAgICAgIGxpbmVbal0gPSBsaW5lW2pdID4gdGhyZXNob2xkID8gMCA6IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBsaW5lLFxuICAgICAgICB0aHJlc2hvbGQ6IHRocmVzaG9sZFxuICAgIH07XG59O1xuXG4vKipcbiAqIFVzZWQgZm9yIGRldmVsb3BtZW50IG9ubHlcbiAqL1xuQnJlc2VuaGFtLmRlYnVnID0ge1xuICAgIHByaW50RnJlcXVlbmN5OiBmdW5jdGlvbihsaW5lLCBjYW52YXMpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBjYW52YXMud2lkdGggPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IDI1NjtcblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmx1ZVwiO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oaSwgMjU1KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oaSwgMjU1IC0gbGluZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgfSxcblxuICAgIHByaW50UGF0dGVybjogZnVuY3Rpb24obGluZSwgY2FudmFzKSB7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLCBpO1xuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICBjdHguZmlsbENvbG9yID0gXCJibGFja1wiO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaW5lW2ldID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KGksIDAsIDEsIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCcmVzZW5oYW07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGVjb2Rlci9icmVzZW5oYW0uanMiLCJpbXBvcnQgQmFyY29kZVJlYWRlciBmcm9tICcuL2JhcmNvZGVfcmVhZGVyJztcblxuZnVuY3Rpb24gVHdvT2ZGaXZlUmVhZGVyKG9wdHMpIHtcbiAgICBCYXJjb2RlUmVhZGVyLmNhbGwodGhpcywgb3B0cyk7XG4gICAgdGhpcy5iYXJTcGFjZVJhdGlvID0gWzEsIDFdO1xufVxuXG52YXIgTiA9IDEsXG4gICAgVyA9IDMsXG4gICAgcHJvcGVydGllcyA9IHtcbiAgICAgICAgU1RBUlRfUEFUVEVSTjoge3ZhbHVlOiBbVywgTiwgVywgTiwgTiwgTl19LFxuICAgICAgICBTVE9QX1BBVFRFUk46IHt2YWx1ZTogW1csIE4sIE4sIE4sIFddfSxcbiAgICAgICAgQ09ERV9QQVRURVJOOiB7dmFsdWU6IFtcbiAgICAgICAgICAgIFtOLCBOLCBXLCBXLCBOXSxcbiAgICAgICAgICAgIFtXLCBOLCBOLCBOLCBXXSxcbiAgICAgICAgICAgIFtOLCBXLCBOLCBOLCBXXSxcbiAgICAgICAgICAgIFtXLCBXLCBOLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBOLCBXLCBOLCBXXSxcbiAgICAgICAgICAgIFtXLCBOLCBXLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBXLCBXLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBOLCBOLCBXLCBXXSxcbiAgICAgICAgICAgIFtXLCBOLCBOLCBXLCBOXSxcbiAgICAgICAgICAgIFtOLCBXLCBOLCBXLCBOXVxuICAgICAgICBdfSxcbiAgICAgICAgU0lOR0xFX0NPREVfRVJST1I6IHt2YWx1ZTogMC43OCwgd3JpdGFibGU6IHRydWV9LFxuICAgICAgICBBVkdfQ09ERV9FUlJPUjoge3ZhbHVlOiAwLjMwLCB3cml0YWJsZTogdHJ1ZX0sXG4gICAgICAgIEZPUk1BVDoge3ZhbHVlOiBcIjJvZjVcIn1cbiAgICB9O1xuXG5jb25zdCBzdGFydFBhdHRlcm5MZW5ndGggPSBwcm9wZXJ0aWVzLlNUQVJUX1BBVFRFUk4udmFsdWUucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFR3b09mRml2ZVJlYWRlcjtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZmluZFBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuLCBvZmZzZXQsIGlzV2hpdGUsIHRyeUhhcmRlcikge1xuICAgIHZhciBjb3VudGVyID0gW10sXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBpLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yLFxuICAgICAgICBqLFxuICAgICAgICBzdW0sXG4gICAgICAgIGVwc2lsb24gPSBzZWxmLkFWR19DT0RFX0VSUk9SO1xuXG4gICAgaXNXaGl0ZSA9IGlzV2hpdGUgfHwgZmFsc2U7XG4gICAgdHJ5SGFyZGVyID0gdHJ5SGFyZGVyIHx8IGZhbHNlO1xuXG4gICAgaWYgKCFvZmZzZXQpIHtcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpO1xuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb3VudGVyW2ldID0gMDtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIHBhdHRlcm4pO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5zdGFydCA9IGkgLSBzdW07XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHJ5SGFyZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aCAtIDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlcltqXSA9IGNvdW50ZXJbaiArIDJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAyXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAxXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0LFxuICAgICAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdyksXG4gICAgICAgIHN0YXJ0SW5mbyxcbiAgICAgICAgbmFycm93QmFyV2lkdGggPSAxO1xuXG4gICAgd2hpbGUgKCFzdGFydEluZm8pIHtcbiAgICAgICAgc3RhcnRJbmZvID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5TVEFSVF9QQVRURVJOLCBvZmZzZXQsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgaWYgKCFzdGFydEluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIG5hcnJvd0JhcldpZHRoID0gTWF0aC5mbG9vcigoc3RhcnRJbmZvLmVuZCAtIHN0YXJ0SW5mby5zdGFydCkgLyBzdGFydFBhdHRlcm5MZW5ndGgpO1xuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0ID0gc3RhcnRJbmZvLnN0YXJ0IC0gbmFycm93QmFyV2lkdGggKiA1O1xuICAgICAgICBpZiAobGVhZGluZ1doaXRlc3BhY2VTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fbWF0Y2hSYW5nZShsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0LCBzdGFydEluZm8uc3RhcnQsIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXJ0SW5mbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgPSBzdGFydEluZm8uZW5kO1xuICAgICAgICBzdGFydEluZm8gPSBudWxsO1xuICAgIH1cbn07XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKGVuZEluZm8pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZDtcblxuICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA9IGVuZEluZm8uZW5kICsgKChlbmRJbmZvLmVuZCAtIGVuZEluZm8uc3RhcnQpIC8gMik7XG4gICAgaWYgKHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA8IHNlbGYuX3Jvdy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UoZW5kSW5mby5lbmQsIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmRJbmZvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZmluZEVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZW5kSW5mbyxcbiAgICAgICAgdG1wLFxuICAgICAgICBvZmZzZXQ7XG5cbiAgICBzZWxmLl9yb3cucmV2ZXJzZSgpO1xuICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KTtcbiAgICBlbmRJbmZvID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5TVE9QX1BBVFRFUk4sIG9mZnNldCwgZmFsc2UsIHRydWUpO1xuICAgIHNlbGYuX3Jvdy5yZXZlcnNlKCk7XG5cbiAgICBpZiAoZW5kSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyByZXZlcnNlIG51bWJlcnNcbiAgICB0bXAgPSBlbmRJbmZvLnN0YXJ0O1xuICAgIGVuZEluZm8uc3RhcnQgPSBzZWxmLl9yb3cubGVuZ3RoIC0gZW5kSW5mby5lbmQ7XG4gICAgZW5kSW5mby5lbmQgPSBzZWxmLl9yb3cubGVuZ3RoIC0gdG1wO1xuXG4gICAgcmV0dXJuIGVuZEluZm8gIT09IG51bGwgPyBzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UoZW5kSW5mbykgOiBudWxsO1xufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlQ29kZSA9IGZ1bmN0aW9uKGNvdW50ZXIpIHtcbiAgICB2YXIgaixcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIHN1bSA9IDAsXG4gICAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBlcHNpbG9uID0gc2VsZi5BVkdfQ09ERV9FUlJPUixcbiAgICAgICAgY29kZSxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAwXG4gICAgICAgIH07XG5cbiAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgfVxuICAgIGZvciAoY29kZSA9IDA7IGNvZGUgPCBzZWxmLkNPREVfUEFUVEVSTi5sZW5ndGg7IGNvZGUrKykge1xuICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBzZWxmLkNPREVfUEFUVEVSTltjb2RlXSk7XG4gICAgICAgIGlmIChlcnJvciA8IGJlc3RNYXRjaC5lcnJvcikge1xuICAgICAgICAgICAgYmVzdE1hdGNoLmNvZGUgPSBjb2RlO1xuICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJlc3RNYXRjaC5lcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICB9XG59O1xuXG5Ud29PZkZpdmVSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24oY291bnRlcnMsIHJlc3VsdCwgZGVjb2RlZENvZGVzKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBwb3MgPSAwLFxuICAgICAgICBjb3VudGVyTGVuZ3RoID0gY291bnRlcnMubGVuZ3RoLFxuICAgICAgICBjb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBjb2RlO1xuXG4gICAgd2hpbGUgKHBvcyA8IGNvdW50ZXJMZW5ndGgpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgY291bnRlcltpXSA9IGNvdW50ZXJzW3Bvc10gKiB0aGlzLmJhclNwYWNlUmF0aW9bMF07XG4gICAgICAgICAgICBwb3MgKz0gMjtcbiAgICAgICAgfVxuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb3VudGVyKTtcbiAgICAgICAgaWYgKCFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUgKyBcIlwiKTtcbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgfVxuICAgIHJldHVybiBjb2RlO1xufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fdmVyaWZ5Q291bnRlckxlbmd0aCA9IGZ1bmN0aW9uKGNvdW50ZXJzKSB7XG4gICAgcmV0dXJuIChjb3VudGVycy5sZW5ndGggJSAxMCA9PT0gMCk7XG59O1xuXG5Ud29PZkZpdmVSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnRJbmZvLFxuICAgICAgICBlbmRJbmZvLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgY29kZSxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGRlY29kZWRDb2RlcyA9IFtdLFxuICAgICAgICBjb3VudGVycztcblxuICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRTdGFydCgpO1xuICAgIGlmICghc3RhcnRJbmZvKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZWNvZGVkQ29kZXMucHVzaChzdGFydEluZm8pO1xuXG4gICAgZW5kSW5mbyA9IHNlbGYuX2ZpbmRFbmQoKTtcbiAgICBpZiAoIWVuZEluZm8pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY291bnRlcnMgPSBzZWxmLl9maWxsQ291bnRlcnMoc3RhcnRJbmZvLmVuZCwgZW5kSW5mby5zdGFydCwgZmFsc2UpO1xuICAgIGlmICghc2VsZi5fdmVyaWZ5Q291bnRlckxlbmd0aChjb3VudGVycykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVQYXlsb2FkKGNvdW50ZXJzLCByZXN1bHQsIGRlY29kZWRDb2Rlcyk7XG4gICAgaWYgKCFjb2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA8IDUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZGVjb2RlZENvZGVzLnB1c2goZW5kSW5mbyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIHN0YXJ0OiBzdGFydEluZm8uc3RhcnQsXG4gICAgICAgIGVuZDogZW5kSW5mby5lbmQsXG4gICAgICAgIHN0YXJ0SW5mbzogc3RhcnRJbmZvLFxuICAgICAgICBkZWNvZGVkQ29kZXM6IGRlY29kZWRDb2Rlc1xuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBUd29PZkZpdmVSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyLzJvZjVfcmVhZGVyLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5cbmZ1bmN0aW9uIENvZGFiYXJSZWFkZXIoKSB7XG4gICAgQmFyY29kZVJlYWRlci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX2NvdW50ZXJzID0gW107XG59XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICAgIEFMUEhBQkVUSF9TVFJJTkc6IHt2YWx1ZTogXCIwMTIzNDU2Nzg5LSQ6Ly4rQUJDRFwifSxcbiAgICBBTFBIQUJFVDoge3ZhbHVlOiBbNDgsIDQ5LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDQ1LCAzNiwgNTgsIDQ3LCA0NiwgNDMsIDY1LCA2NiwgNjcsIDY4XX0sXG4gICAgQ0hBUkFDVEVSX0VOQ09ESU5HUzoge3ZhbHVlOiBbMHgwMDMsIDB4MDA2LCAweDAwOSwgMHgwNjAsIDB4MDEyLCAweDA0MiwgMHgwMjEsIDB4MDI0LCAweDAzMCwgMHgwNDgsIDB4MDBjLCAweDAxOCxcbiAgICAgICAgMHgwNDUsIDB4MDUxLCAweDA1NCwgMHgwMTUsIDB4MDFBLCAweDAyOSwgMHgwMEIsIDB4MDBFXX0sXG4gICAgU1RBUlRfRU5EOiB7dmFsdWU6IFsweDAxQSwgMHgwMjksIDB4MDBCLCAweDAwRV19LFxuICAgIE1JTl9FTkNPREVEX0NIQVJTOiB7dmFsdWU6IDR9LFxuICAgIE1BWF9BQ0NFUFRBQkxFOiB7dmFsdWU6IDIuMH0sXG4gICAgUEFERElORzoge3ZhbHVlOiAxLjV9LFxuICAgIEZPUk1BVDoge3ZhbHVlOiBcImNvZGFiYXJcIiwgd3JpdGVhYmxlOiBmYWxzZX1cbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXJjb2RlUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvZGFiYXJSZWFkZXI7XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgZGVjb2RlZENoYXIsXG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIG5leHRTdGFydCxcbiAgICAgICAgZW5kO1xuXG4gICAgdGhpcy5fY291bnRlcnMgPSBzZWxmLl9maWxsQ291bnRlcnMoKTtcbiAgICBzdGFydCA9IHNlbGYuX2ZpbmRTdGFydCgpO1xuICAgIGlmICghc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG5leHRTdGFydCA9IHN0YXJ0LnN0YXJ0Q291bnRlcjtcblxuICAgIGRvIHtcbiAgICAgICAgcGF0dGVybiA9IHNlbGYuX3RvUGF0dGVybihuZXh0U3RhcnQpO1xuICAgICAgICBpZiAocGF0dGVybiA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlY29kZWRDaGFyID0gc2VsZi5fcGF0dGVyblRvQ2hhcihwYXR0ZXJuKTtcbiAgICAgICAgaWYgKGRlY29kZWRDaGFyIDwgMCl7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChkZWNvZGVkQ2hhcik7XG4gICAgICAgIG5leHRTdGFydCArPSA4O1xuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA+IDEgJiYgc2VsZi5faXNTdGFydEVuZChwYXR0ZXJuKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChuZXh0U3RhcnQgPCBzZWxmLl9jb3VudGVycy5sZW5ndGgpO1xuXG4gICAgLy8gdmVyaWZ5IGVuZFxuICAgIGlmICgocmVzdWx0Lmxlbmd0aCAtIDIpIDwgc2VsZi5NSU5fRU5DT0RFRF9DSEFSUyB8fCAhc2VsZi5faXNTdGFydEVuZChwYXR0ZXJuKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyB2ZXJpZnkgZW5kIHdoaXRlIHNwYWNlXG4gICAgaWYgKCFzZWxmLl92ZXJpZnlXaGl0ZXNwYWNlKHN0YXJ0LnN0YXJ0Q291bnRlciwgbmV4dFN0YXJ0IC0gOCkpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuX3ZhbGlkYXRlUmVzdWx0KHJlc3VsdCwgc3RhcnQuc3RhcnRDb3VudGVyKSl7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIG5leHRTdGFydCA9IG5leHRTdGFydCA+IHNlbGYuX2NvdW50ZXJzLmxlbmd0aCA/IHNlbGYuX2NvdW50ZXJzLmxlbmd0aCA6IG5leHRTdGFydDtcbiAgICBlbmQgPSBzdGFydC5zdGFydCArIHNlbGYuX3N1bUNvdW50ZXJzKHN0YXJ0LnN0YXJ0Q291bnRlciwgbmV4dFN0YXJ0IC0gOCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LnN0YXJ0LFxuICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgc3RhcnRJbmZvOiBzdGFydCxcbiAgICAgICAgZGVjb2RlZENvZGVzOiByZXN1bHRcbiAgICB9O1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeVdoaXRlc3BhY2UgPSBmdW5jdGlvbihzdGFydENvdW50ZXIsIGVuZENvdW50ZXIpIHtcbiAgICBpZiAoKHN0YXJ0Q291bnRlciAtIDEgPD0gMClcbiAgICAgICAgICAgIHx8IHRoaXMuX2NvdW50ZXJzW3N0YXJ0Q291bnRlciAtIDFdID49ICh0aGlzLl9jYWxjdWxhdGVQYXR0ZXJuTGVuZ3RoKHN0YXJ0Q291bnRlcikgLyAyLjApKSB7XG4gICAgICAgIGlmICgoZW5kQ291bnRlciArIDggPj0gdGhpcy5fY291bnRlcnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHx8IHRoaXMuX2NvdW50ZXJzW2VuZENvdW50ZXIgKyA3XSA+PSAodGhpcy5fY2FsY3VsYXRlUGF0dGVybkxlbmd0aChlbmRDb3VudGVyKSAvIDIuMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9jYWxjdWxhdGVQYXR0ZXJuTGVuZ3RoID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgdmFyIGksXG4gICAgICAgIHN1bSA9IDA7XG5cbiAgICBmb3IgKGkgPSBvZmZzZXQ7IGkgPCBvZmZzZXQgKyA3OyBpKyspIHtcbiAgICAgICAgc3VtICs9IHRoaXMuX2NvdW50ZXJzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBzdW07XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fdGhyZXNob2xkUmVzdWx0UGF0dGVybiA9IGZ1bmN0aW9uKHJlc3VsdCwgc3RhcnRDb3VudGVyKXtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNhdGVnb3JpemF0aW9uID0ge1xuICAgICAgICAgICAgc3BhY2U6IHtcbiAgICAgICAgICAgICAgICBuYXJyb3c6IHsgc2l6ZTogMCwgY291bnRzOiAwLCBtaW46IDAsIG1heDogTnVtYmVyLk1BWF9WQUxVRX0sXG4gICAgICAgICAgICAgICAgd2lkZToge3NpemU6IDAsIGNvdW50czogMCwgbWluOiAwLCBtYXg6IE51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFyOiB7XG4gICAgICAgICAgICAgICAgbmFycm93OiB7IHNpemU6IDAsIGNvdW50czogMCwgbWluOiAwLCBtYXg6IE51bWJlci5NQVhfVkFMVUV9LFxuICAgICAgICAgICAgICAgIHdpZGU6IHsgc2l6ZTogMCwgY291bnRzOiAwLCBtaW46IDAsIG1heDogTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAga2luZCxcbiAgICAgICAgY2F0LFxuICAgICAgICBpLFxuICAgICAgICBqLFxuICAgICAgICBwb3MgPSBzdGFydENvdW50ZXIsXG4gICAgICAgIHBhdHRlcm47XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcGF0dGVybiA9IHNlbGYuX2NoYXJUb1BhdHRlcm4ocmVzdWx0W2ldKTtcbiAgICAgICAgZm9yIChqID0gNjsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgIGtpbmQgPSAoaiAmIDEpID09PSAyID8gY2F0ZWdvcml6YXRpb24uYmFyIDogY2F0ZWdvcml6YXRpb24uc3BhY2U7XG4gICAgICAgICAgICBjYXQgPSAocGF0dGVybiAmIDEpID09PSAxID8ga2luZC53aWRlIDoga2luZC5uYXJyb3c7XG4gICAgICAgICAgICBjYXQuc2l6ZSArPSBzZWxmLl9jb3VudGVyc1twb3MgKyBqXTtcbiAgICAgICAgICAgIGNhdC5jb3VudHMrKztcbiAgICAgICAgICAgIHBhdHRlcm4gPj49IDE7XG4gICAgICAgIH1cbiAgICAgICAgcG9zICs9IDg7XG4gICAgfVxuXG4gICAgW1wic3BhY2VcIiwgXCJiYXJcIl0uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgdmFyIG5ld2tpbmQgPSBjYXRlZ29yaXphdGlvbltrZXldO1xuICAgICAgICBuZXdraW5kLndpZGUubWluID1cbiAgICAgICAgICAgIE1hdGguZmxvb3IoKG5ld2tpbmQubmFycm93LnNpemUgLyBuZXdraW5kLm5hcnJvdy5jb3VudHMgKyBuZXdraW5kLndpZGUuc2l6ZSAvIG5ld2tpbmQud2lkZS5jb3VudHMpIC8gMik7XG4gICAgICAgIG5ld2tpbmQubmFycm93Lm1heCA9IE1hdGguY2VpbChuZXdraW5kLndpZGUubWluKTtcbiAgICAgICAgbmV3a2luZC53aWRlLm1heCA9IE1hdGguY2VpbCgobmV3a2luZC53aWRlLnNpemUgKiBzZWxmLk1BWF9BQ0NFUFRBQkxFICsgc2VsZi5QQURESU5HKSAvIG5ld2tpbmQud2lkZS5jb3VudHMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNhdGVnb3JpemF0aW9uO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX2NoYXJUb1BhdHRlcm4gPSBmdW5jdGlvbihjaGFyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBjaGFyQ29kZSA9IGNoYXIuY2hhckNvZGVBdCgwKSxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBzZWxmLkFMUEhBQkVULmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLkFMUEhBQkVUW2ldID09PSBjaGFyQ29kZSl7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAweDA7XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fdmFsaWRhdGVSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQsIHN0YXJ0Q291bnRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdGhyZXNob2xkcyA9IHNlbGYuX3RocmVzaG9sZFJlc3VsdFBhdHRlcm4ocmVzdWx0LCBzdGFydENvdW50ZXIpLFxuICAgICAgICBpLFxuICAgICAgICBqLFxuICAgICAgICBraW5kLFxuICAgICAgICBjYXQsXG4gICAgICAgIHNpemUsXG4gICAgICAgIHBvcyA9IHN0YXJ0Q291bnRlcixcbiAgICAgICAgcGF0dGVybjtcblxuICAgIGZvciAoaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGF0dGVybiA9IHNlbGYuX2NoYXJUb1BhdHRlcm4ocmVzdWx0W2ldKTtcbiAgICAgICAgZm9yIChqID0gNjsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgIGtpbmQgPSAoaiAmIDEpID09PSAwID8gdGhyZXNob2xkcy5iYXIgOiB0aHJlc2hvbGRzLnNwYWNlO1xuICAgICAgICAgICAgY2F0ID0gKHBhdHRlcm4gJiAxKSA9PT0gMSA/IGtpbmQud2lkZSA6IGtpbmQubmFycm93O1xuICAgICAgICAgICAgc2l6ZSA9IHNlbGYuX2NvdW50ZXJzW3BvcyArIGpdO1xuICAgICAgICAgICAgaWYgKHNpemUgPCBjYXQubWluIHx8IHNpemUgPiBjYXQubWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0dGVybiA+Pj0gMTtcbiAgICAgICAgfVxuICAgICAgICBwb3MgKz0gODtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fcGF0dGVyblRvQ2hhciA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLkNIQVJBQ1RFUl9FTkNPRElOR1NbaV0gPT09IHBhdHRlcm4pIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHNlbGYuQUxQSEFCRVRbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9jb21wdXRlQWx0ZXJuYXRpbmdUaHJlc2hvbGQgPSBmdW5jdGlvbihvZmZzZXQsIGVuZCkge1xuICAgIHZhciBpLFxuICAgICAgICBtaW4gPSBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICBtYXggPSAwLFxuICAgICAgICBjb3VudGVyO1xuXG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgZW5kOyBpICs9IDIpe1xuICAgICAgICBjb3VudGVyID0gdGhpcy5fY291bnRlcnNbaV07XG4gICAgICAgIGlmIChjb3VudGVyID4gbWF4KSB7XG4gICAgICAgICAgICBtYXggPSBjb3VudGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb3VudGVyIDwgbWluKSB7XG4gICAgICAgICAgICBtaW4gPSBjb3VudGVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICgobWluICsgbWF4KSAvIDIuMCkgfCAwO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3RvUGF0dGVybiA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgIHZhciBudW1Db3VudGVycyA9IDcsXG4gICAgICAgIGVuZCA9IG9mZnNldCArIG51bUNvdW50ZXJzLFxuICAgICAgICBiYXJUaHJlc2hvbGQsXG4gICAgICAgIHNwYWNlVGhyZXNob2xkLFxuICAgICAgICBiaXRtYXNrID0gMSA8PCAobnVtQ291bnRlcnMgLSAxKSxcbiAgICAgICAgcGF0dGVybiA9IDAsXG4gICAgICAgIGksXG4gICAgICAgIHRocmVzaG9sZDtcblxuICAgIGlmIChlbmQgPiB0aGlzLl9jb3VudGVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGJhclRocmVzaG9sZCA9IHRoaXMuX2NvbXB1dGVBbHRlcm5hdGluZ1RocmVzaG9sZChvZmZzZXQsIGVuZCk7XG4gICAgc3BhY2VUaHJlc2hvbGQgPSB0aGlzLl9jb21wdXRlQWx0ZXJuYXRpbmdUaHJlc2hvbGQob2Zmc2V0ICsgMSwgZW5kKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1Db3VudGVyczsgaSsrKXtcbiAgICAgICAgdGhyZXNob2xkID0gKGkgJiAxKSA9PT0gMCA/IGJhclRocmVzaG9sZCA6IHNwYWNlVGhyZXNob2xkO1xuICAgICAgICBpZiAodGhpcy5fY291bnRlcnNbb2Zmc2V0ICsgaV0gPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gfD0gYml0bWFzaztcbiAgICAgICAgfVxuICAgICAgICBiaXRtYXNrID4+PSAxO1xuICAgIH1cblxuICAgIHJldHVybiBwYXR0ZXJuO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX2lzU3RhcnRFbmQgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5TVEFSVF9FTkQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuU1RBUlRfRU5EW2ldID09PSBwYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fc3VtQ291bnRlcnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHN1bSA9IDA7XG5cbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSB0aGlzLl9jb3VudGVyc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9maW5kU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGksXG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIHN0YXJ0ID0gc2VsZi5fbmV4dFVuc2V0KHNlbGYuX3JvdyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAoaSA9IDE7IGkgPCB0aGlzLl9jb3VudGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXR0ZXJuID0gc2VsZi5fdG9QYXR0ZXJuKGkpO1xuICAgICAgICBpZiAocGF0dGVybiAhPT0gLTEgJiYgc2VsZi5faXNTdGFydEVuZChwYXR0ZXJuKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogTG9vayBmb3Igd2hpdGVzcGFjZSBhaGVhZFxuICAgICAgICAgICAgc3RhcnQgKz0gc2VsZi5fc3VtQ291bnRlcnMoMCwgaSk7XG4gICAgICAgICAgICBlbmQgPSBzdGFydCArIHNlbGYuX3N1bUNvdW50ZXJzKGksIGkgKyA4KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgICAgIGVuZDogZW5kLFxuICAgICAgICAgICAgICAgIHN0YXJ0Q291bnRlcjogaSxcbiAgICAgICAgICAgICAgICBlbmRDb3VudGVyOiBpICsgOFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvZGFiYXJSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2NvZGFiYXJfcmVhZGVyLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5cbmZ1bmN0aW9uIENvZGUxMjhSZWFkZXIoKSB7XG4gICAgQmFyY29kZVJlYWRlci5jYWxsKHRoaXMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBDT0RFX1NISUZUOiB7dmFsdWU6IDk4fSxcbiAgICBDT0RFX0M6IHt2YWx1ZTogOTl9LFxuICAgIENPREVfQjoge3ZhbHVlOiAxMDB9LFxuICAgIENPREVfQToge3ZhbHVlOiAxMDF9LFxuICAgIFNUQVJUX0NPREVfQToge3ZhbHVlOiAxMDN9LFxuICAgIFNUQVJUX0NPREVfQjoge3ZhbHVlOiAxMDR9LFxuICAgIFNUQVJUX0NPREVfQzoge3ZhbHVlOiAxMDV9LFxuICAgIFNUT1BfQ09ERToge3ZhbHVlOiAxMDZ9LFxuICAgIENPREVfUEFUVEVSTjoge3ZhbHVlOiBbXG4gICAgICAgIFsyLCAxLCAyLCAyLCAyLCAyXSxcbiAgICAgICAgWzIsIDIsIDIsIDEsIDIsIDJdLFxuICAgICAgICBbMiwgMiwgMiwgMiwgMiwgMV0sXG4gICAgICAgIFsxLCAyLCAxLCAyLCAyLCAzXSxcbiAgICAgICAgWzEsIDIsIDEsIDMsIDIsIDJdLFxuICAgICAgICBbMSwgMywgMSwgMiwgMiwgMl0sXG4gICAgICAgIFsxLCAyLCAyLCAyLCAxLCAzXSxcbiAgICAgICAgWzEsIDIsIDIsIDMsIDEsIDJdLFxuICAgICAgICBbMSwgMywgMiwgMiwgMSwgMl0sXG4gICAgICAgIFsyLCAyLCAxLCAyLCAxLCAzXSxcbiAgICAgICAgWzIsIDIsIDEsIDMsIDEsIDJdLFxuICAgICAgICBbMiwgMywgMSwgMiwgMSwgMl0sXG4gICAgICAgIFsxLCAxLCAyLCAyLCAzLCAyXSxcbiAgICAgICAgWzEsIDIsIDIsIDEsIDMsIDJdLFxuICAgICAgICBbMSwgMiwgMiwgMiwgMywgMV0sXG4gICAgICAgIFsxLCAxLCAzLCAyLCAyLCAyXSxcbiAgICAgICAgWzEsIDIsIDMsIDEsIDIsIDJdLFxuICAgICAgICBbMSwgMiwgMywgMiwgMiwgMV0sXG4gICAgICAgIFsyLCAyLCAzLCAyLCAxLCAxXSxcbiAgICAgICAgWzIsIDIsIDEsIDEsIDMsIDJdLFxuICAgICAgICBbMiwgMiwgMSwgMiwgMywgMV0sXG4gICAgICAgIFsyLCAxLCAzLCAyLCAxLCAyXSxcbiAgICAgICAgWzIsIDIsIDMsIDEsIDEsIDJdLFxuICAgICAgICBbMywgMSwgMiwgMSwgMywgMV0sXG4gICAgICAgIFszLCAxLCAxLCAyLCAyLCAyXSxcbiAgICAgICAgWzMsIDIsIDEsIDEsIDIsIDJdLFxuICAgICAgICBbMywgMiwgMSwgMiwgMiwgMV0sXG4gICAgICAgIFszLCAxLCAyLCAyLCAxLCAyXSxcbiAgICAgICAgWzMsIDIsIDIsIDEsIDEsIDJdLFxuICAgICAgICBbMywgMiwgMiwgMiwgMSwgMV0sXG4gICAgICAgIFsyLCAxLCAyLCAxLCAyLCAzXSxcbiAgICAgICAgWzIsIDEsIDIsIDMsIDIsIDFdLFxuICAgICAgICBbMiwgMywgMiwgMSwgMiwgMV0sXG4gICAgICAgIFsxLCAxLCAxLCAzLCAyLCAzXSxcbiAgICAgICAgWzEsIDMsIDEsIDEsIDIsIDNdLFxuICAgICAgICBbMSwgMywgMSwgMywgMiwgMV0sXG4gICAgICAgIFsxLCAxLCAyLCAzLCAxLCAzXSxcbiAgICAgICAgWzEsIDMsIDIsIDEsIDEsIDNdLFxuICAgICAgICBbMSwgMywgMiwgMywgMSwgMV0sXG4gICAgICAgIFsyLCAxLCAxLCAzLCAxLCAzXSxcbiAgICAgICAgWzIsIDMsIDEsIDEsIDEsIDNdLFxuICAgICAgICBbMiwgMywgMSwgMywgMSwgMV0sXG4gICAgICAgIFsxLCAxLCAyLCAxLCAzLCAzXSxcbiAgICAgICAgWzEsIDEsIDIsIDMsIDMsIDFdLFxuICAgICAgICBbMSwgMywgMiwgMSwgMywgMV0sXG4gICAgICAgIFsxLCAxLCAzLCAxLCAyLCAzXSxcbiAgICAgICAgWzEsIDEsIDMsIDMsIDIsIDFdLFxuICAgICAgICBbMSwgMywgMywgMSwgMiwgMV0sXG4gICAgICAgIFszLCAxLCAzLCAxLCAyLCAxXSxcbiAgICAgICAgWzIsIDEsIDEsIDMsIDMsIDFdLFxuICAgICAgICBbMiwgMywgMSwgMSwgMywgMV0sXG4gICAgICAgIFsyLCAxLCAzLCAxLCAxLCAzXSxcbiAgICAgICAgWzIsIDEsIDMsIDMsIDEsIDFdLFxuICAgICAgICBbMiwgMSwgMywgMSwgMywgMV0sXG4gICAgICAgIFszLCAxLCAxLCAxLCAyLCAzXSxcbiAgICAgICAgWzMsIDEsIDEsIDMsIDIsIDFdLFxuICAgICAgICBbMywgMywgMSwgMSwgMiwgMV0sXG4gICAgICAgIFszLCAxLCAyLCAxLCAxLCAzXSxcbiAgICAgICAgWzMsIDEsIDIsIDMsIDEsIDFdLFxuICAgICAgICBbMywgMywgMiwgMSwgMSwgMV0sXG4gICAgICAgIFszLCAxLCA0LCAxLCAxLCAxXSxcbiAgICAgICAgWzIsIDIsIDEsIDQsIDEsIDFdLFxuICAgICAgICBbNCwgMywgMSwgMSwgMSwgMV0sXG4gICAgICAgIFsxLCAxLCAxLCAyLCAyLCA0XSxcbiAgICAgICAgWzEsIDEsIDEsIDQsIDIsIDJdLFxuICAgICAgICBbMSwgMiwgMSwgMSwgMiwgNF0sXG4gICAgICAgIFsxLCAyLCAxLCA0LCAyLCAxXSxcbiAgICAgICAgWzEsIDQsIDEsIDEsIDIsIDJdLFxuICAgICAgICBbMSwgNCwgMSwgMiwgMiwgMV0sXG4gICAgICAgIFsxLCAxLCAyLCAyLCAxLCA0XSxcbiAgICAgICAgWzEsIDEsIDIsIDQsIDEsIDJdLFxuICAgICAgICBbMSwgMiwgMiwgMSwgMSwgNF0sXG4gICAgICAgIFsxLCAyLCAyLCA0LCAxLCAxXSxcbiAgICAgICAgWzEsIDQsIDIsIDEsIDEsIDJdLFxuICAgICAgICBbMSwgNCwgMiwgMiwgMSwgMV0sXG4gICAgICAgIFsyLCA0LCAxLCAyLCAxLCAxXSxcbiAgICAgICAgWzIsIDIsIDEsIDEsIDEsIDRdLFxuICAgICAgICBbNCwgMSwgMywgMSwgMSwgMV0sXG4gICAgICAgIFsyLCA0LCAxLCAxLCAxLCAyXSxcbiAgICAgICAgWzEsIDMsIDQsIDEsIDEsIDFdLFxuICAgICAgICBbMSwgMSwgMSwgMiwgNCwgMl0sXG4gICAgICAgIFsxLCAyLCAxLCAxLCA0LCAyXSxcbiAgICAgICAgWzEsIDIsIDEsIDIsIDQsIDFdLFxuICAgICAgICBbMSwgMSwgNCwgMiwgMSwgMl0sXG4gICAgICAgIFsxLCAyLCA0LCAxLCAxLCAyXSxcbiAgICAgICAgWzEsIDIsIDQsIDIsIDEsIDFdLFxuICAgICAgICBbNCwgMSwgMSwgMiwgMSwgMl0sXG4gICAgICAgIFs0LCAyLCAxLCAxLCAxLCAyXSxcbiAgICAgICAgWzQsIDIsIDEsIDIsIDEsIDFdLFxuICAgICAgICBbMiwgMSwgMiwgMSwgNCwgMV0sXG4gICAgICAgIFsyLCAxLCA0LCAxLCAyLCAxXSxcbiAgICAgICAgWzQsIDEsIDIsIDEsIDIsIDFdLFxuICAgICAgICBbMSwgMSwgMSwgMSwgNCwgM10sXG4gICAgICAgIFsxLCAxLCAxLCAzLCA0LCAxXSxcbiAgICAgICAgWzEsIDMsIDEsIDEsIDQsIDFdLFxuICAgICAgICBbMSwgMSwgNCwgMSwgMSwgM10sXG4gICAgICAgIFsxLCAxLCA0LCAzLCAxLCAxXSxcbiAgICAgICAgWzQsIDEsIDEsIDEsIDEsIDNdLFxuICAgICAgICBbNCwgMSwgMSwgMywgMSwgMV0sXG4gICAgICAgIFsxLCAxLCAzLCAxLCA0LCAxXSxcbiAgICAgICAgWzEsIDEsIDQsIDEsIDMsIDFdLFxuICAgICAgICBbMywgMSwgMSwgMSwgNCwgMV0sXG4gICAgICAgIFs0LCAxLCAxLCAxLCAzLCAxXSxcbiAgICAgICAgWzIsIDEsIDEsIDQsIDEsIDJdLFxuICAgICAgICBbMiwgMSwgMSwgMiwgMSwgNF0sXG4gICAgICAgIFsyLCAxLCAxLCAyLCAzLCAyXSxcbiAgICAgICAgWzIsIDMsIDMsIDEsIDEsIDEsIDJdXG4gICAgXX0sXG4gICAgU0lOR0xFX0NPREVfRVJST1I6IHt2YWx1ZTogMC42NH0sXG4gICAgQVZHX0NPREVfRVJST1I6IHt2YWx1ZTogMC4zMH0sXG4gICAgRk9STUFUOiB7dmFsdWU6IFwiY29kZV8xMjhcIiwgd3JpdGVhYmxlOiBmYWxzZX0sXG4gICAgTU9EVUxFX0lORElDRVM6IHt2YWx1ZToge2JhcjogWzAsIDIsIDRdLCBzcGFjZTogWzEsIDMsIDVdfX1cbn07XG5cbkNvZGUxMjhSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXJjb2RlUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvZGUxMjhSZWFkZXI7XG5cbkNvZGUxMjhSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVDb2RlID0gZnVuY3Rpb24oc3RhcnQsIGNvcnJlY3Rpb24pIHtcbiAgICB2YXIgY291bnRlciA9IFswLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgaSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIG9mZnNldCA9IHN0YXJ0LFxuICAgICAgICBpc1doaXRlID0gIXNlbGYuX3Jvd1tvZmZzZXRdLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGVuZDogc3RhcnQsXG4gICAgICAgICAgICBjb3JyZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgYmFyOiAxLFxuICAgICAgICAgICAgICAgIHNwYWNlOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvZGUsXG4gICAgICAgIGVycm9yO1xuXG4gICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJQb3MgPT09IGNvdW50ZXIubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChjb3JyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2NvcnJlY3QoY291bnRlciwgY29ycmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29kZSA9IDA7IGNvZGUgPCBzZWxmLkNPREVfUEFUVEVSTi5sZW5ndGg7IGNvZGUrKykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBzZWxmLkNPREVfUEFUVEVSTltjb2RlXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGJlc3RNYXRjaC5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmNvZGUgPSBjb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVuZCA9IGk7XG4gICAgICAgICAgICAgICAgaWYgKGJlc3RNYXRjaC5jb2RlID09PSAtMSB8fCBiZXN0TWF0Y2guZXJyb3IgPiBzZWxmLkFWR19DT0RFX0VSUk9SKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5DT0RFX1BBVFRFUk5bYmVzdE1hdGNoLmNvZGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb3JyZWN0aW9uLmJhciA9IGNhbGN1bGF0ZUNvcnJlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkNPREVfUEFUVEVSTltiZXN0TWF0Y2guY29kZV0sIGNvdW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk1PRFVMRV9JTkRJQ0VTLmJhcik7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb3JyZWN0aW9uLnNwYWNlID0gY2FsY3VsYXRlQ29ycmVjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuQ09ERV9QQVRURVJOW2Jlc3RNYXRjaC5jb2RlXSwgY291bnRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuTU9EVUxFX0lORElDRVMuc3BhY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNvZGUxMjhSZWFkZXIucHJvdG90eXBlLl9jb3JyZWN0ID0gZnVuY3Rpb24oY291bnRlciwgY29ycmVjdGlvbikge1xuICAgIHRoaXMuX2NvcnJlY3RCYXJzKGNvdW50ZXIsIGNvcnJlY3Rpb24uYmFyLCB0aGlzLk1PRFVMRV9JTkRJQ0VTLmJhcik7XG4gICAgdGhpcy5fY29ycmVjdEJhcnMoY291bnRlciwgY29ycmVjdGlvbi5zcGFjZSwgdGhpcy5NT0RVTEVfSU5ESUNFUy5zcGFjZSk7XG59O1xuXG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdyksXG4gICAgICAgIGlzV2hpdGUgPSBmYWxzZSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMCxcbiAgICAgICAgICAgIGNvcnJlY3Rpb246IHtcbiAgICAgICAgICAgICAgICBiYXI6IDEsXG4gICAgICAgICAgICAgICAgc3BhY2U6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29kZSxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGosXG4gICAgICAgIHN1bTtcblxuICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBjb3VudGVyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBzdW0gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgY291bnRlci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gY291bnRlcltqXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb2RlID0gc2VsZi5TVEFSVF9DT0RFX0E7IGNvZGUgPD0gc2VsZi5TVEFSVF9DT0RFX0M7IGNvZGUrKykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBzZWxmLkNPREVfUEFUVEVSTltjb2RlXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGJlc3RNYXRjaC5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmNvZGUgPSBjb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJlc3RNYXRjaC5lcnJvciA8IHNlbGYuQVZHX0NPREVfRVJST1IpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLnN0YXJ0ID0gaSAtIHN1bTtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVuZCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb3JyZWN0aW9uLmJhciA9IGNhbGN1bGF0ZUNvcnJlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkNPREVfUEFUVEVSTltiZXN0TWF0Y2guY29kZV0sIGNvdW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk1PRFVMRV9JTkRJQ0VTLmJhcik7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb3JyZWN0aW9uLnNwYWNlID0gY2FsY3VsYXRlQ29ycmVjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuQ09ERV9QQVRURVJOW2Jlc3RNYXRjaC5jb2RlXSwgY291bnRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuTU9EVUxFX0lORElDRVMuc3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbal0gPSBjb3VudGVyW2ogKyAyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY291bnRlcls0XSA9IDA7XG4gICAgICAgICAgICAgICAgY291bnRlcls1XSA9IDA7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcy0tO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNvZGUxMjhSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRTdGFydCgpLFxuICAgICAgICBjb2RlID0gbnVsbCxcbiAgICAgICAgZG9uZSA9IGZhbHNlLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgbXVsdGlwbGllciA9IDAsXG4gICAgICAgIGNoZWNrc3VtID0gMCxcbiAgICAgICAgY29kZXNldCxcbiAgICAgICAgcmF3UmVzdWx0ID0gW10sXG4gICAgICAgIGRlY29kZWRDb2RlcyA9IFtdLFxuICAgICAgICBzaGlmdE5leHQgPSBmYWxzZSxcbiAgICAgICAgdW5zaGlmdCxcbiAgICAgICAgcmVtb3ZlTGFzdENoYXJhY3RlciA9IHRydWU7XG5cbiAgICBpZiAoc3RhcnRJbmZvID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb2RlID0ge1xuICAgICAgICBjb2RlOiBzdGFydEluZm8uY29kZSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0SW5mby5zdGFydCxcbiAgICAgICAgZW5kOiBzdGFydEluZm8uZW5kLFxuICAgICAgICBjb3JyZWN0aW9uOiB7XG4gICAgICAgICAgICBiYXI6IHN0YXJ0SW5mby5jb3JyZWN0aW9uLmJhcixcbiAgICAgICAgICAgIHNwYWNlOiBzdGFydEluZm8uY29ycmVjdGlvbi5zcGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICBjaGVja3N1bSA9IGNvZGUuY29kZTtcbiAgICBzd2l0Y2ggKGNvZGUuY29kZSkge1xuICAgIGNhc2Ugc2VsZi5TVEFSVF9DT0RFX0E6XG4gICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBzZWxmLlNUQVJUX0NPREVfQjpcbiAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9CO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIHNlbGYuU1RBUlRfQ09ERV9DOlxuICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0M7XG4gICAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHdoaWxlICghZG9uZSkge1xuICAgICAgICB1bnNoaWZ0ID0gc2hpZnROZXh0O1xuICAgICAgICBzaGlmdE5leHQgPSBmYWxzZTtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY29kZS5lbmQsIGNvZGUuY29ycmVjdGlvbik7XG4gICAgICAgIGlmIChjb2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY29kZS5jb2RlICE9PSBzZWxmLlNUT1BfQ09ERSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZUxhc3RDaGFyYWN0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29kZS5jb2RlICE9PSBzZWxmLlNUT1BfQ09ERSkge1xuICAgICAgICAgICAgICAgIHJhd1Jlc3VsdC5wdXNoKGNvZGUuY29kZSk7XG4gICAgICAgICAgICAgICAgbXVsdGlwbGllcisrO1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IG11bHRpcGxpZXIgKiBjb2RlLmNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcblxuICAgICAgICAgICAgc3dpdGNoIChjb2Rlc2V0KSB7XG4gICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9BOlxuICAgICAgICAgICAgICAgIGlmIChjb2RlLmNvZGUgPCA2NCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKDMyICsgY29kZS5jb2RlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlLmNvZGUgPCA5Nikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUuY29kZSAtIDY0KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuY29kZSAhPT0gc2VsZi5TVE9QX0NPREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUxhc3RDaGFyYWN0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUuY29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9TSElGVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0TmV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0I7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9DOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9DO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5TVE9QX0NPREU6XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQjpcbiAgICAgICAgICAgICAgICBpZiAoY29kZS5jb2RlIDwgOTYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSgzMiArIGNvZGUuY29kZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLmNvZGUgIT09IHNlbGYuU1RPUF9DT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVMYXN0Q2hhcmFjdGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb2RlLmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfU0hJRlQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGlmdE5leHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9BO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0E6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0E7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuU1RPUF9DT0RFOlxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0M6XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUuY29kZSA8IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUgPCAxMCA/IFwiMFwiICsgY29kZS5jb2RlIDogY29kZS5jb2RlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZS5jb2RlICE9PSBzZWxmLlNUT1BfQ09ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGFzdENoYXJhY3RlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZS5jb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0E6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0E7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuU1RPUF9DT0RFOlxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1bnNoaWZ0KSB7XG4gICAgICAgICAgICBjb2Rlc2V0ID0gY29kZXNldCA9PT0gc2VsZi5DT0RFX0EgPyBzZWxmLkNPREVfQiA6IHNlbGYuQ09ERV9BO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29kZS5lbmQgPSBzZWxmLl9uZXh0VW5zZXQoc2VsZi5fcm93LCBjb2RlLmVuZCk7XG4gICAgaWYgKCFzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UoY29kZSkpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjaGVja3N1bSAtPSBtdWx0aXBsaWVyICogcmF3UmVzdWx0W3Jhd1Jlc3VsdC5sZW5ndGggLSAxXTtcbiAgICBpZiAoY2hlY2tzdW0gJSAxMDMgIT09IHJhd1Jlc3VsdFtyYXdSZXN1bHQubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBsYXN0IGNvZGUgZnJvbSByZXN1bHQgKGNoZWNrc3VtKVxuICAgIGlmIChyZW1vdmVMYXN0Q2hhcmFjdGVyKSB7XG4gICAgICAgIHJlc3VsdC5zcGxpY2UocmVzdWx0Lmxlbmd0aCAtIDEsIDEpO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIHN0YXJ0OiBzdGFydEluZm8uc3RhcnQsXG4gICAgICAgIGVuZDogY29kZS5lbmQsXG4gICAgICAgIGNvZGVzZXQ6IGNvZGVzZXQsXG4gICAgICAgIHN0YXJ0SW5mbzogc3RhcnRJbmZvLFxuICAgICAgICBkZWNvZGVkQ29kZXM6IGRlY29kZWRDb2RlcyxcbiAgICAgICAgZW5kSW5mbzogY29kZVxuICAgIH07XG59O1xuXG5cbkJhcmNvZGVSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UgPSBmdW5jdGlvbihlbmRJbmZvKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQ7XG5cbiAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQgPSBlbmRJbmZvLmVuZCArICgoZW5kSW5mby5lbmQgLSBlbmRJbmZvLnN0YXJ0KSAvIDIpO1xuICAgIGlmICh0cmFpbGluZ1doaXRlc3BhY2VFbmQgPCBzZWxmLl9yb3cubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGVuZEluZm8uZW5kLCB0cmFpbGluZ1doaXRlc3BhY2VFbmQsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5kSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvcnJlY3Rpb24oZXhwZWN0ZWQsIG5vcm1hbGl6ZWQsIGluZGljZXMpIHtcbiAgICB2YXIgbGVuZ3RoID0gaW5kaWNlcy5sZW5ndGgsXG4gICAgICAgIHN1bU5vcm1hbGl6ZWQgPSAwLFxuICAgICAgICBzdW1FeHBlY3RlZCA9IDA7XG5cbiAgICB3aGlsZShsZW5ndGgtLSkge1xuICAgICAgICBzdW1FeHBlY3RlZCArPSBleHBlY3RlZFtpbmRpY2VzW2xlbmd0aF1dO1xuICAgICAgICBzdW1Ob3JtYWxpemVkICs9IG5vcm1hbGl6ZWRbaW5kaWNlc1tsZW5ndGhdXTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bUV4cGVjdGVkL3N1bU5vcm1hbGl6ZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvZGUxMjhSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2NvZGVfMTI4X3JlYWRlci5qcyIsImltcG9ydCBDb2RlMzlSZWFkZXIgZnJvbSAnLi9jb2RlXzM5X3JlYWRlcic7XG5cbmZ1bmN0aW9uIENvZGUzOVZJTlJlYWRlcigpIHtcbiAgICBDb2RlMzlSZWFkZXIuY2FsbCh0aGlzKTtcbn1cblxudmFyIHBhdHRlcm5zID0ge1xuICAgIElPUTogL1tJT1FdL2csXG4gICAgQVowOTogL1tBLVowLTldezE3fS9cbn07XG5cbkNvZGUzOVZJTlJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvZGUzOVJlYWRlci5wcm90b3R5cGUpO1xuQ29kZTM5VklOUmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvZGUzOVZJTlJlYWRlcjtcblxuLy8gQ3JpYmJlZCBmcm9tOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3p4aW5nL3p4aW5nL2Jsb2IvbWFzdGVyL2NvcmUvc3JjL21haW4vamF2YS9jb20vZ29vZ2xlL3p4aW5nL2NsaWVudC9yZXN1bHQvVklOUmVzdWx0UGFyc2VyLmphdmFcbkNvZGUzOVZJTlJlYWRlci5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSBDb2RlMzlSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUuYXBwbHkodGhpcyk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGNvZGUgPSByZXN1bHQuY29kZTtcblxuICAgIGlmICghY29kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb2RlID0gY29kZS5yZXBsYWNlKHBhdHRlcm5zLklPUSwgJycpO1xuXG4gICAgaWYgKCFjb2RlLm1hdGNoKHBhdHRlcm5zLkFaMDkpKSB7XG4gICAgICAgIGlmIChFTlYuZGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGYWlsZWQgQVowOSBwYXR0ZXJuIGNvZGU6JywgY29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9jaGVja0NoZWNrc3VtKGNvZGUpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJlc3VsdC5jb2RlID0gY29kZTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuQ29kZTM5VklOUmVhZGVyLnByb3RvdHlwZS5fY2hlY2tDaGVja3N1bSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAvLyBUT0RPXG4gICAgcmV0dXJuICEhY29kZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvZGUzOVZJTlJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvY29kZV8zOV92aW5fcmVhZGVyLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5pbXBvcnQgQXJyYXlIZWxwZXIgZnJvbSAnLi4vY29tbW9uL2FycmF5X2hlbHBlcic7XG5cbmZ1bmN0aW9uIENvZGU5M1JlYWRlcigpIHtcbiAgICBCYXJjb2RlUmVhZGVyLmNhbGwodGhpcyk7XG59XG5cbmNvbnN0IEFMUEhBQkVUSF9TVFJJTkcgPSBcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWi0uICQvKyVhYmNkKlwiO1xuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBBTFBIQUJFVEhfU1RSSU5HOiB7dmFsdWU6IEFMUEhBQkVUSF9TVFJJTkd9LFxuICAgIEFMUEhBQkVUOiB7dmFsdWU6IEFMUEhBQkVUSF9TVFJJTkcuc3BsaXQoJycpLm1hcChjaGFyID0+IGNoYXIuY2hhckNvZGVBdCgwKSl9LFxuICAgIENIQVJBQ1RFUl9FTkNPRElOR1M6IHt2YWx1ZTogW1xuICAgICAgICAweDExNCwgMHgxNDgsIDB4MTQ0LCAweDE0MiwgMHgxMjgsIDB4MTI0LCAweDEyMiwgMHgxNTAsIDB4MTEyLCAweDEwQSxcbiAgICAgICAgMHgxQTgsIDB4MUE0LCAweDFBMiwgMHgxOTQsIDB4MTkyLCAweDE4QSwgMHgxNjgsIDB4MTY0LCAweDE2MiwgMHgxMzQsXG4gICAgICAgIDB4MTFBLCAweDE1OCwgMHgxNEMsIDB4MTQ2LCAweDEyQywgMHgxMTYsIDB4MUI0LCAweDFCMiwgMHgxQUMsIDB4MUE2LFxuICAgICAgICAweDE5NiwgMHgxOUEsIDB4MTZDLCAweDE2NiwgMHgxMzYsIDB4MTNBLCAweDEyRSwgMHgxRDQsIDB4MUQyLCAweDFDQSxcbiAgICAgICAgMHgxNkUsIDB4MTc2LCAweDFBRSwgMHgxMjYsIDB4MURBLCAweDFENiwgMHgxMzIsIDB4MTVFXG4gICAgXX0sXG4gICAgQVNURVJJU0s6IHt2YWx1ZTogMHgxNUV9LFxuICAgIEZPUk1BVDoge3ZhbHVlOiBcImNvZGVfOTNcIiwgd3JpdGVhYmxlOiBmYWxzZX1cbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2RlOTNSZWFkZXI7XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY291bnRlcnMgPSBbMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBzdGFydCA9IHNlbGYuX2ZpbmRTdGFydCgpLFxuICAgICAgICBkZWNvZGVkQ2hhcixcbiAgICAgICAgbGFzdFN0YXJ0LFxuICAgICAgICBwYXR0ZXJuLFxuICAgICAgICBuZXh0U3RhcnQ7XG5cbiAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBuZXh0U3RhcnQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3Jvdywgc3RhcnQuZW5kKTtcblxuICAgIGRvIHtcbiAgICAgICAgY291bnRlcnMgPSBzZWxmLl90b0NvdW50ZXJzKG5leHRTdGFydCwgY291bnRlcnMpO1xuICAgICAgICBwYXR0ZXJuID0gc2VsZi5fdG9QYXR0ZXJuKGNvdW50ZXJzKTtcbiAgICAgICAgaWYgKHBhdHRlcm4gPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkQ2hhciA9IHNlbGYuX3BhdHRlcm5Ub0NoYXIocGF0dGVybik7XG4gICAgICAgIGlmIChkZWNvZGVkQ2hhciA8IDApe1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZGVjb2RlZENoYXIpO1xuICAgICAgICBsYXN0U3RhcnQgPSBuZXh0U3RhcnQ7XG4gICAgICAgIG5leHRTdGFydCArPSBBcnJheUhlbHBlci5zdW0oY291bnRlcnMpO1xuICAgICAgICBuZXh0U3RhcnQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdywgbmV4dFN0YXJ0KTtcbiAgICB9IHdoaWxlIChkZWNvZGVkQ2hhciAhPT0gJyonKTtcbiAgICByZXN1bHQucG9wKCk7XG5cbiAgICBpZiAoIXJlc3VsdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLl92ZXJpZnlFbmQobGFzdFN0YXJ0LCBuZXh0U3RhcnQsIGNvdW50ZXJzKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuX3ZlcmlmeUNoZWNrc3VtcyhyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZSgwLCByZXN1bHQubGVuZ3RoIC0gMik7XG4gICAgaWYgKChyZXN1bHQgPSBzZWxmLl9kZWNvZGVFeHRlbmRlZChyZXN1bHQpKSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIHN0YXJ0OiBzdGFydC5zdGFydCxcbiAgICAgICAgZW5kOiBuZXh0U3RhcnQsXG4gICAgICAgIHN0YXJ0SW5mbzogc3RhcnQsXG4gICAgICAgIGRlY29kZWRDb2RlczogcmVzdWx0XG4gICAgfTtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX3ZlcmlmeUVuZCA9IGZ1bmN0aW9uKGxhc3RTdGFydCwgbmV4dFN0YXJ0KSB7XG4gICAgaWYgKGxhc3RTdGFydCA9PT0gbmV4dFN0YXJ0IHx8ICF0aGlzLl9yb3dbbmV4dFN0YXJ0XSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuQ29kZTkzUmVhZGVyLnByb3RvdHlwZS5fcGF0dGVyblRvQ2hhciA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLkNIQVJBQ1RFUl9FTkNPRElOR1NbaV0gPT09IHBhdHRlcm4pIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHNlbGYuQUxQSEFCRVRbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX3RvUGF0dGVybiA9IGZ1bmN0aW9uKGNvdW50ZXJzKSB7XG4gICAgY29uc3QgbnVtQ291bnRlcnMgPSBjb3VudGVycy5sZW5ndGg7XG4gICAgbGV0IHBhdHRlcm4gPSAwO1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ291bnRlcnM7IGkrKykge1xuICAgICAgICBzdW0gKz0gY291bnRlcnNbaV07XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db3VudGVyczsgaSsrKSB7XG4gICAgICAgIGxldCBub3JtYWxpemVkID0gTWF0aC5yb3VuZChjb3VudGVyc1tpXSAqIDkgLyBzdW0pO1xuICAgICAgICBpZiAobm9ybWFsaXplZCA8IDEgfHwgbm9ybWFsaXplZCA+IDQpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGkgJiAxKSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub3JtYWxpemVkOyBqKyspIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gKHBhdHRlcm4gPDwgMSkgfCAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0dGVybiA8PD0gbm9ybWFsaXplZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXR0ZXJuO1xufTtcblxuQ29kZTkzUmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdyksXG4gICAgICAgIHBhdHRlcm5TdGFydCA9IG9mZnNldCxcbiAgICAgICAgY291bnRlciA9IFswLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGlzV2hpdGUgPSBmYWxzZSxcbiAgICAgICAgaSxcbiAgICAgICAgaixcbiAgICAgICAgd2hpdGVTcGFjZU11c3RTdGFydDtcblxuICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBjb3VudGVyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAvLyBmaW5kIHN0YXJ0IHBhdHRlcm5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fdG9QYXR0ZXJuKGNvdW50ZXIpID09PSBzZWxmLkFTVEVSSVNLKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2VNdXN0U3RhcnQgPSBNYXRoLmZsb29yKE1hdGgubWF4KDAsIHBhdHRlcm5TdGFydCAtICgoaSAtIHBhdHRlcm5TdGFydCkgLyA0KSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fbWF0Y2hSYW5nZSh3aGl0ZVNwYWNlTXVzdFN0YXJ0LCBwYXR0ZXJuU3RhcnQsIDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBwYXR0ZXJuU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiBpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGF0dGVyblN0YXJ0ICs9IGNvdW50ZXJbMF0gKyBjb3VudGVyWzFdO1xuICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbal0gPSBjb3VudGVyW2ogKyAyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY291bnRlcls0XSA9IDA7XG4gICAgICAgICAgICAgICAgY291bnRlcls1XSA9IDA7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcy0tO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX2RlY29kZUV4dGVuZGVkID0gZnVuY3Rpb24oY2hhckFycmF5KSB7XG4gICAgY29uc3QgbGVuZ3RoID0gY2hhckFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoYXIgPSBjaGFyQXJyYXlbaV07XG4gICAgICAgIGlmIChjaGFyID49ICdhJyAmJiBjaGFyIDw9ICdkJykge1xuICAgICAgICAgICAgaWYgKGkgPiAobGVuZ3RoIC0gMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG5leHRDaGFyID0gY2hhckFycmF5WysraV07XG4gICAgICAgICAgICBjb25zdCBuZXh0Q2hhckNvZGUgPSBuZXh0Q2hhci5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgbGV0IGRlY29kZWRDaGFyO1xuICAgICAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICBpZiAobmV4dENoYXIgPj0gJ0EnICYmIG5leHRDaGFyIDw9ICdaJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlIC0gNjQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgICAgIGlmIChuZXh0Q2hhciA+PSAnQScgJiYgbmV4dENoYXIgPD0gJ0UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgLSAzOCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2hhciA+PSAnRicgJiYgbmV4dENoYXIgPD0gJ0onKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgLSAxMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2hhciA+PSAnSycgJiYgbmV4dENoYXIgPD0gJ08nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgKyAxNik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2hhciA+PSAnUCcgJiYgbmV4dENoYXIgPD0gJ1MnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgKyA0Myk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2hhciA+PSAnVCcgJiYgbmV4dENoYXIgPD0gJ1onKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2MnOlxuICAgICAgICAgICAgICAgIGlmIChuZXh0Q2hhciA+PSAnQScgJiYgbmV4dENoYXIgPD0gJ08nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgLSAzMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2hhciA9PT0gJ1onKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gJzonO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgIGlmIChuZXh0Q2hhciA+PSAnQScgJiYgbmV4dENoYXIgPD0gJ1onKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUgKyAzMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2goZGVjb2RlZENoYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX3ZlcmlmeUNoZWNrc3VtcyA9IGZ1bmN0aW9uKGNoYXJBcnJheSkge1xuICAgIHJldHVybiB0aGlzLl9tYXRjaENoZWNrQ2hhcihjaGFyQXJyYXksIGNoYXJBcnJheS5sZW5ndGggLSAyLCAyMClcbiAgICAgICAgJiYgdGhpcy5fbWF0Y2hDaGVja0NoYXIoY2hhckFycmF5LCBjaGFyQXJyYXkubGVuZ3RoIC0gMSwgMTUpO1xufTtcblxuQ29kZTkzUmVhZGVyLnByb3RvdHlwZS5fbWF0Y2hDaGVja0NoYXIgPSBmdW5jdGlvbihjaGFyQXJyYXksIGluZGV4LCBtYXhXZWlnaHQpIHtcbiAgICBjb25zdCBhcnJheVRvQ2hlY2sgPSBjaGFyQXJyYXkuc2xpY2UoMCwgaW5kZXgpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGFycmF5VG9DaGVjay5sZW5ndGg7XG4gICAgY29uc3Qgd2VpZ2h0ZWRTdW1zID0gYXJyYXlUb0NoZWNrLnJlZHVjZSgoc3VtLCBjaGFyLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9ICgoKGkgKiAtMSkgKyAobGVuZ3RoIC0gMSkpICUgbWF4V2VpZ2h0KSArIDE7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5BTFBIQUJFVC5pbmRleE9mKGNoYXIuY2hhckNvZGVBdCgwKSk7XG4gICAgICAgIHJldHVybiBzdW0gKyAod2VpZ2h0ICogdmFsdWUpO1xuICAgIH0sIDApO1xuXG4gICAgY29uc3QgY2hlY2tDaGFyID0gdGhpcy5BTFBIQUJFVFsod2VpZ2h0ZWRTdW1zICUgNDcpXTtcbiAgICByZXR1cm4gY2hlY2tDaGFyID09PSBjaGFyQXJyYXlbaW5kZXhdLmNoYXJDb2RlQXQoMCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2RlOTNSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2NvZGVfOTNfcmVhZGVyLmpzIiwiaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuL2Vhbl9yZWFkZXInO1xuXG5mdW5jdGlvbiBFQU4yUmVhZGVyKCkge1xuICAgIEVBTlJlYWRlci5jYWxsKHRoaXMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJlYW5fMlwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuRUFOMlJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVBTlJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuRUFOMlJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFQU4yUmVhZGVyO1xuXG5FQU4yUmVhZGVyLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihyb3csIHN0YXJ0KSB7XG4gICAgdGhpcy5fcm93ID0gcm93O1xuICAgIHZhciBjb3VudGVycyA9IFswLCAwLCAwLCAwXSxcbiAgICAgICAgY29kZUZyZXF1ZW5jeSA9IDAsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBvZmZzZXQgPSBzdGFydCxcbiAgICAgICAgZW5kID0gdGhpcy5fcm93Lmxlbmd0aCxcbiAgICAgICAgY29kZSxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGRlY29kZWRDb2RlcyA9IFtdO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IDIgJiYgb2Zmc2V0IDwgZW5kOyBpKyspIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2RlY29kZUNvZGUob2Zmc2V0KTtcbiAgICAgICAgaWYgKCFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlICUgMTApO1xuICAgICAgICBpZiAoY29kZS5jb2RlID49IHRoaXMuQ09ERV9HX1NUQVJUKSB7XG4gICAgICAgICAgICBjb2RlRnJlcXVlbmN5IHw9IDEgPDwgKDEgLSBpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSAhPSAxKSB7XG4gICAgICAgICAgICBvZmZzZXQgPSB0aGlzLl9uZXh0U2V0KHRoaXMuX3JvdywgY29kZS5lbmQpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5fbmV4dFVuc2V0KHRoaXMuX3Jvdywgb2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZXN1bHQubGVuZ3RoICE9IDIgfHwgKHBhcnNlSW50KHJlc3VsdC5qb2luKFwiXCIpKSAlIDQpICAhPT0gY29kZUZyZXF1ZW5jeSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIGRlY29kZWRDb2RlcyxcbiAgICAgICAgZW5kOiBjb2RlLmVuZFxuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFQU4yUmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9lYW5fMl9yZWFkZXIuanMiLCJpbXBvcnQgRUFOUmVhZGVyIGZyb20gJy4vZWFuX3JlYWRlcic7XG5cbmZ1bmN0aW9uIEVBTjVSZWFkZXIoKSB7XG4gICAgRUFOUmVhZGVyLmNhbGwodGhpcyk7XG59XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICAgIEZPUk1BVDoge3ZhbHVlOiBcImVhbl81XCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5jb25zdCBDSEVDS19ESUdJVF9FTkNPRElOR1MgPSBbMjQsIDIwLCAxOCwgMTcsIDEyLCA2LCAzLCAxMCwgOSwgNV07XG5cbkVBTjVSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFQU5SZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkVBTjVSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRUFONVJlYWRlcjtcblxuRUFONVJlYWRlci5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24ocm93LCBzdGFydCkge1xuICAgIHRoaXMuX3JvdyA9IHJvdztcbiAgICB2YXIgY291bnRlcnMgPSBbMCwgMCwgMCwgMF0sXG4gICAgICAgIGNvZGVGcmVxdWVuY3kgPSAwLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgb2Zmc2V0ID0gc3RhcnQsXG4gICAgICAgIGVuZCA9IHRoaXMuX3Jvdy5sZW5ndGgsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCA1ICYmIG9mZnNldCA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGNvZGUgPSB0aGlzLl9kZWNvZGVDb2RlKG9mZnNldCk7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvZGUuY29kZSAlIDEwKTtcbiAgICAgICAgaWYgKGNvZGUuY29kZSA+PSB0aGlzLkNPREVfR19TVEFSVCkge1xuICAgICAgICAgICAgY29kZUZyZXF1ZW5jeSB8PSAxIDw8ICg0IC0gaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgIT0gNCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5fbmV4dFNldCh0aGlzLl9yb3csIGNvZGUuZW5kKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHRoaXMuX25leHRVbnNldCh0aGlzLl9yb3csIG9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzdWx0Lmxlbmd0aCAhPSA1KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChleHRlbnNpb25DaGVja3N1bShyZXN1bHQpICE9PSBkZXRlcm1pbmVDaGVja0RpZ2l0KGNvZGVGcmVxdWVuY3kpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSxcbiAgICAgICAgZGVjb2RlZENvZGVzLFxuICAgICAgICBlbmQ6IGNvZGUuZW5kXG4gICAgfTtcbn07XG5cbmZ1bmN0aW9uIGRldGVybWluZUNoZWNrRGlnaXQoY29kZUZyZXF1ZW5jeSkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGlmIChjb2RlRnJlcXVlbmN5ID09PSBDSEVDS19ESUdJVF9FTkNPRElOR1NbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5cbmZ1bmN0aW9uIGV4dGVuc2lvbkNoZWNrc3VtKHJlc3VsdCkge1xuICAgIHZhciBsZW5ndGggPSByZXN1bHQubGVuZ3RoLFxuICAgICAgICBzdW0gPSAwLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gbGVuZ3RoIC0gMjsgaSA+PSAwOyBpIC09IDIpIHtcbiAgICAgICAgc3VtICs9IHJlc3VsdFtpXTtcbiAgICB9XG4gICAgc3VtICo9IDM7XG4gICAgZm9yIChpID0gbGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDIpIHtcbiAgICAgICAgc3VtICs9IHJlc3VsdFtpXTtcbiAgICB9XG4gICAgc3VtICo9IDM7XG4gICAgcmV0dXJuIHN1bSAlIDEwO1xufVxuXG5leHBvcnQgZGVmYXVsdCBFQU41UmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9lYW5fNV9yZWFkZXIuanMiLCJpbXBvcnQgRUFOUmVhZGVyIGZyb20gJy4vZWFuX3JlYWRlcic7XG5cbmZ1bmN0aW9uIEVBTjhSZWFkZXIob3B0cywgc3VwcGxlbWVudHMpIHtcbiAgICBFQU5SZWFkZXIuY2FsbCh0aGlzLCBvcHRzLCBzdXBwbGVtZW50cyk7XG59XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICAgIEZPUk1BVDoge3ZhbHVlOiBcImVhbl84XCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5FQU44UmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRUFOUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5FQU44UmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVBTjhSZWFkZXI7XG5cbkVBTjhSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24oY29kZSwgcmVzdWx0LCBkZWNvZGVkQ29kZXMpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb2RlLmVuZCwgc2VsZi5DT0RFX0dfU1RBUlQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvZGUuY29kZSk7XG4gICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgIH1cblxuICAgIGNvZGUgPSBzZWxmLl9maW5kUGF0dGVybihzZWxmLk1JRERMRV9QQVRURVJOLCBjb2RlLmVuZCwgdHJ1ZSwgZmFsc2UpO1xuICAgIGlmIChjb2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcblxuICAgIGZvciAoIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVDb2RlKGNvZGUuZW5kLCBzZWxmLkNPREVfR19TVEFSVCk7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvZGUuY29kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFQU44UmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9lYW5fOF9yZWFkZXIuanMiLCJpbXBvcnQgQmFyY29kZVJlYWRlciBmcm9tICcuL2JhcmNvZGVfcmVhZGVyJztcbmltcG9ydCB7bWVyZ2V9IGZyb20gJ2xvZGFzaCc7XG5cbmZ1bmN0aW9uIEkyb2Y1UmVhZGVyKG9wdHMpIHtcbiAgICBvcHRzID0gbWVyZ2UoZ2V0RGVmYXVsQ29uZmlnKCksIG9wdHMpO1xuICAgIEJhcmNvZGVSZWFkZXIuY2FsbCh0aGlzLCBvcHRzKTtcbiAgICB0aGlzLmJhclNwYWNlUmF0aW8gPSBbMSwgMV07XG4gICAgaWYgKG9wdHMubm9ybWFsaXplQmFyU3BhY2VXaWR0aCkge1xuICAgICAgICB0aGlzLlNJTkdMRV9DT0RFX0VSUk9SID0gMC4zODtcbiAgICAgICAgdGhpcy5BVkdfQ09ERV9FUlJPUiA9IDAuMDk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWxDb25maWcoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoSTJvZjVSZWFkZXIuQ09ORklHX0tFWVMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGNvbmZpZ1trZXldID0gSTJvZjVSZWFkZXIuQ09ORklHX0tFWVNba2V5XS5kZWZhdWx0O1xuICAgIH0pO1xuICAgIHJldHVybiBjb25maWc7XG59XG5cbnZhciBOID0gMSxcbiAgICBXID0gMyxcbiAgICBwcm9wZXJ0aWVzID0ge1xuICAgICAgICBTVEFSVF9QQVRURVJOOiB7dmFsdWU6IFtOLCBOLCBOLCBOXX0sXG4gICAgICAgIFNUT1BfUEFUVEVSTjoge3ZhbHVlOiBbTiwgTiwgV119LFxuICAgICAgICBDT0RFX1BBVFRFUk46IHt2YWx1ZTogW1xuICAgICAgICAgICAgW04sIE4sIFcsIFcsIE5dLFxuICAgICAgICAgICAgW1csIE4sIE4sIE4sIFddLFxuICAgICAgICAgICAgW04sIFcsIE4sIE4sIFddLFxuICAgICAgICAgICAgW1csIFcsIE4sIE4sIE5dLFxuICAgICAgICAgICAgW04sIE4sIFcsIE4sIFddLFxuICAgICAgICAgICAgW1csIE4sIFcsIE4sIE5dLFxuICAgICAgICAgICAgW04sIFcsIFcsIE4sIE5dLFxuICAgICAgICAgICAgW04sIE4sIE4sIFcsIFddLFxuICAgICAgICAgICAgW1csIE4sIE4sIFcsIE5dLFxuICAgICAgICAgICAgW04sIFcsIE4sIFcsIE5dXG4gICAgICAgIF19LFxuICAgICAgICBTSU5HTEVfQ09ERV9FUlJPUjoge3ZhbHVlOiAwLjc4LCB3cml0YWJsZTogdHJ1ZX0sXG4gICAgICAgIEFWR19DT0RFX0VSUk9SOiB7dmFsdWU6IDAuMjUsIHdyaXRhYmxlOiB0cnVlfSxcbiAgICAgICAgTUFYX0NPUlJFQ1RJT05fRkFDVE9SOiB7dmFsdWU6IDV9LFxuICAgICAgICBGT1JNQVQ6IHt2YWx1ZTogXCJpMm9mNVwifVxuICAgIH07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuSTJvZjVSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSTJvZjVSZWFkZXI7XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fbWF0Y2hQYXR0ZXJuID0gZnVuY3Rpb24oY291bnRlciwgY29kZSkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5ub3JtYWxpemVCYXJTcGFjZVdpZHRoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgY291bnRlclN1bSA9IFswLCAwXSxcbiAgICAgICAgICAgIGNvZGVTdW0gPSBbMCwgMF0sXG4gICAgICAgICAgICBjb3JyZWN0aW9uID0gWzAsIDBdLFxuICAgICAgICAgICAgY29ycmVjdGlvblJhdGlvID0gdGhpcy5NQVhfQ09SUkVDVElPTl9GQUNUT1IsXG4gICAgICAgICAgICBjb3JyZWN0aW9uUmF0aW9JbnZlcnNlID0gMSAvIGNvcnJlY3Rpb25SYXRpbztcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY291bnRlclN1bVtpICUgMl0gKz0gY291bnRlcltpXTtcbiAgICAgICAgICAgIGNvZGVTdW1baSAlIDJdICs9IGNvZGVbaV07XG4gICAgICAgIH1cbiAgICAgICAgY29ycmVjdGlvblswXSA9IGNvZGVTdW1bMF0gLyBjb3VudGVyU3VtWzBdO1xuICAgICAgICBjb3JyZWN0aW9uWzFdID0gY29kZVN1bVsxXSAvIGNvdW50ZXJTdW1bMV07XG5cbiAgICAgICAgY29ycmVjdGlvblswXSA9IE1hdGgubWF4KE1hdGgubWluKGNvcnJlY3Rpb25bMF0sIGNvcnJlY3Rpb25SYXRpbyksIGNvcnJlY3Rpb25SYXRpb0ludmVyc2UpO1xuICAgICAgICBjb3JyZWN0aW9uWzFdID0gTWF0aC5tYXgoTWF0aC5taW4oY29ycmVjdGlvblsxXSwgY29ycmVjdGlvblJhdGlvKSwgY29ycmVjdGlvblJhdGlvSW52ZXJzZSk7XG4gICAgICAgIHRoaXMuYmFyU3BhY2VSYXRpbyA9IGNvcnJlY3Rpb247XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb3VudGVyW2ldICo9IHRoaXMuYmFyU3BhY2VSYXRpb1tpICUgMl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLl9tYXRjaFBhdHRlcm4uY2FsbCh0aGlzLCBjb3VudGVyLCBjb2RlKTtcbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZmluZFBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuLCBvZmZzZXQsIGlzV2hpdGUsIHRyeUhhcmRlcikge1xuICAgIHZhciBjb3VudGVyID0gW10sXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBpLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yLFxuICAgICAgICBqLFxuICAgICAgICBzdW0sXG4gICAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICAgIGVwc2lsb24gPSBzZWxmLkFWR19DT0RFX0VSUk9SO1xuXG4gICAgaXNXaGl0ZSA9IGlzV2hpdGUgfHwgZmFsc2U7XG4gICAgdHJ5SGFyZGVyID0gdHJ5SGFyZGVyIHx8IGZhbHNlO1xuXG4gICAgaWYgKCFvZmZzZXQpIHtcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpO1xuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb3VudGVyW2ldID0gMDtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIHBhdHRlcm4pO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5zdGFydCA9IGkgLSBzdW07XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHJ5SGFyZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aCAtIDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlcltqXSA9IGNvdW50ZXJbaiArIDJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAyXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlci5sZW5ndGggLSAxXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl9maW5kU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQsXG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KSxcbiAgICAgICAgc3RhcnRJbmZvLFxuICAgICAgICBuYXJyb3dCYXJXaWR0aCA9IDE7XG5cbiAgICB3aGlsZSAoIXN0YXJ0SW5mbykge1xuICAgICAgICBzdGFydEluZm8gPSBzZWxmLl9maW5kUGF0dGVybihzZWxmLlNUQVJUX1BBVFRFUk4sIG9mZnNldCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBpZiAoIXN0YXJ0SW5mbykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbmFycm93QmFyV2lkdGggPSBNYXRoLmZsb29yKChzdGFydEluZm8uZW5kIC0gc3RhcnRJbmZvLnN0YXJ0KSAvIDQpO1xuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0ID0gc3RhcnRJbmZvLnN0YXJ0IC0gbmFycm93QmFyV2lkdGggKiAxMDtcbiAgICAgICAgaWYgKGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UobGVhZGluZ1doaXRlc3BhY2VTdGFydCwgc3RhcnRJbmZvLnN0YXJ0LCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFydEluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ID0gc3RhcnRJbmZvLmVuZDtcbiAgICAgICAgc3RhcnRJbmZvID0gbnVsbDtcbiAgICB9XG59O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKGVuZEluZm8pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZDtcblxuICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA9IGVuZEluZm8uZW5kICsgKChlbmRJbmZvLmVuZCAtIGVuZEluZm8uc3RhcnQpIC8gMik7XG4gICAgaWYgKHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA8IHNlbGYuX3Jvdy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UoZW5kSW5mby5lbmQsIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmRJbmZvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl9maW5kRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBlbmRJbmZvLFxuICAgICAgICB0bXA7XG5cbiAgICBzZWxmLl9yb3cucmV2ZXJzZSgpO1xuICAgIGVuZEluZm8gPSBzZWxmLl9maW5kUGF0dGVybihzZWxmLlNUT1BfUEFUVEVSTik7XG4gICAgc2VsZi5fcm93LnJldmVyc2UoKTtcblxuICAgIGlmIChlbmRJbmZvID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldmVyc2UgbnVtYmVyc1xuICAgIHRtcCA9IGVuZEluZm8uc3RhcnQ7XG4gICAgZW5kSW5mby5zdGFydCA9IHNlbGYuX3Jvdy5sZW5ndGggLSBlbmRJbmZvLmVuZDtcbiAgICBlbmRJbmZvLmVuZCA9IHNlbGYuX3Jvdy5sZW5ndGggLSB0bXA7XG5cbiAgICByZXR1cm4gZW5kSW5mbyAhPT0gbnVsbCA/IHNlbGYuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZShlbmRJbmZvKSA6IG51bGw7XG59O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX2RlY29kZVBhaXIgPSBmdW5jdGlvbihjb3VudGVyUGFpcikge1xuICAgIHZhciBpLFxuICAgICAgICBjb2RlLFxuICAgICAgICBjb2RlcyA9IFtdLFxuICAgICAgICBzZWxmID0gdGhpcztcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudGVyUGFpci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb3VudGVyUGFpcltpXSk7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29kZXMucHVzaChjb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVzO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVDb2RlID0gZnVuY3Rpb24oY291bnRlcikge1xuICAgIHZhciBqLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgc3VtID0gMCxcbiAgICAgICAgbm9ybWFsaXplZCxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGVwc2lsb24gPSBzZWxmLkFWR19DT0RFX0VSUk9SLFxuICAgICAgICBjb2RlLFxuICAgICAgICBiZXN0TWF0Y2ggPSB7XG4gICAgICAgICAgICBlcnJvcjogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgIGNvZGU6IC0xLFxuICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICBlbmQ6IDBcbiAgICAgICAgfTtcblxuICAgIGZvciAoIGogPSAwOyBqIDwgY291bnRlci5sZW5ndGg7IGorKykge1xuICAgICAgICBzdW0gKz0gY291bnRlcltqXTtcbiAgICB9XG4gICAgZm9yIChjb2RlID0gMDsgY29kZSA8IHNlbGYuQ09ERV9QQVRURVJOLmxlbmd0aDsgY29kZSsrKSB7XG4gICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIHNlbGYuQ09ERV9QQVRURVJOW2NvZGVdKTtcbiAgICAgICAgaWYgKGVycm9yIDwgYmVzdE1hdGNoLmVycm9yKSB7XG4gICAgICAgICAgICBiZXN0TWF0Y2guY29kZSA9IGNvZGU7XG4gICAgICAgICAgICBiZXN0TWF0Y2guZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdE1hdGNoLmVycm9yIDwgZXBzaWxvbikge1xuICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgIH1cbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKGNvdW50ZXJzLCByZXN1bHQsIGRlY29kZWRDb2Rlcykge1xuICAgIHZhciBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgcG9zID0gMCxcbiAgICAgICAgY291bnRlckxlbmd0aCA9IGNvdW50ZXJzLmxlbmd0aCxcbiAgICAgICAgY291bnRlclBhaXIgPSBbWzAsIDAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMCwgMF1dLFxuICAgICAgICBjb2RlcztcblxuICAgIHdoaWxlIChwb3MgPCBjb3VudGVyTGVuZ3RoKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50ZXJQYWlyWzBdW2ldID0gY291bnRlcnNbcG9zXSAqIHRoaXMuYmFyU3BhY2VSYXRpb1swXTtcbiAgICAgICAgICAgIGNvdW50ZXJQYWlyWzFdW2ldID0gY291bnRlcnNbcG9zICsgMV0gKiB0aGlzLmJhclNwYWNlUmF0aW9bMV07XG4gICAgICAgICAgICBwb3MgKz0gMjtcbiAgICAgICAgfVxuICAgICAgICBjb2RlcyA9IHNlbGYuX2RlY29kZVBhaXIoY291bnRlclBhaXIpO1xuICAgICAgICBpZiAoIWNvZGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNvZGVzW2ldLmNvZGUgKyBcIlwiKTtcbiAgICAgICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29kZXM7XG59O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeUNvdW50ZXJMZW5ndGggPSBmdW5jdGlvbihjb3VudGVycykge1xuICAgIHJldHVybiAoY291bnRlcnMubGVuZ3RoICUgMTAgPT09IDApO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnRJbmZvLFxuICAgICAgICBlbmRJbmZvLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgY29kZSxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGRlY29kZWRDb2RlcyA9IFtdLFxuICAgICAgICBjb3VudGVycztcblxuICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRTdGFydCgpO1xuICAgIGlmICghc3RhcnRJbmZvKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZWNvZGVkQ29kZXMucHVzaChzdGFydEluZm8pO1xuXG4gICAgZW5kSW5mbyA9IHNlbGYuX2ZpbmRFbmQoKTtcbiAgICBpZiAoIWVuZEluZm8pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY291bnRlcnMgPSBzZWxmLl9maWxsQ291bnRlcnMoc3RhcnRJbmZvLmVuZCwgZW5kSW5mby5zdGFydCwgZmFsc2UpO1xuICAgIGlmICghc2VsZi5fdmVyaWZ5Q291bnRlckxlbmd0aChjb3VudGVycykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVQYXlsb2FkKGNvdW50ZXJzLCByZXN1bHQsIGRlY29kZWRDb2Rlcyk7XG4gICAgaWYgKCFjb2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocmVzdWx0Lmxlbmd0aCAlIDIgIT09IDAgfHxcbiAgICAgICAgICAgIHJlc3VsdC5sZW5ndGggPCA2KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGRlY29kZWRDb2Rlcy5wdXNoKGVuZEluZm8pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBzdGFydDogc3RhcnRJbmZvLnN0YXJ0LFxuICAgICAgICBlbmQ6IGVuZEluZm8uZW5kLFxuICAgICAgICBzdGFydEluZm86IHN0YXJ0SW5mbyxcbiAgICAgICAgZGVjb2RlZENvZGVzOiBkZWNvZGVkQ29kZXNcbiAgICB9O1xufTtcblxuSTJvZjVSZWFkZXIuQ09ORklHX0tFWVMgPSB7XG4gICAgbm9ybWFsaXplQmFyU3BhY2VXaWR0aDoge1xuICAgICAgICAndHlwZSc6ICdib29sZWFuJyxcbiAgICAgICAgJ2RlZmF1bHQnOiBmYWxzZSxcbiAgICAgICAgJ2Rlc2NyaXB0aW9uJzogJ0lmIHRydWUsIHRoZSByZWFkZXIgdHJpZXMgdG8gbm9ybWFsaXplIHRoZScgK1xuICAgICAgICAnd2lkdGgtZGlmZmVyZW5jZSBiZXR3ZWVuIGJhcnMgYW5kIHNwYWNlcydcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJMm9mNVJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvaTJvZjVfcmVhZGVyLmpzIiwiaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuL2Vhbl9yZWFkZXInO1xuXG5mdW5jdGlvbiBVUENFUmVhZGVyKG9wdHMsIHN1cHBsZW1lbnRzKSB7XG4gICAgRUFOUmVhZGVyLmNhbGwodGhpcywgb3B0cywgc3VwcGxlbWVudHMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBDT0RFX0ZSRVFVRU5DWToge3ZhbHVlOiBbXG4gICAgICAgIFsgNTYsIDUyLCA1MCwgNDksIDQ0LCAzOCwgMzUsIDQyLCA0MSwgMzcgXSxcbiAgICAgICAgWzcsIDExLCAxMywgMTQsIDE5LCAyNSwgMjgsIDIxLCAyMiwgMjZdXX0sXG4gICAgU1RPUF9QQVRURVJOOiB7IHZhbHVlOiBbMSAvIDYgKiA3LCAxIC8gNiAqIDcsIDEgLyA2ICogNywgMSAvIDYgKiA3LCAxIC8gNiAqIDcsIDEgLyA2ICogN119LFxuICAgIEZPUk1BVDoge3ZhbHVlOiBcInVwY19lXCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5VUENFUmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRUFOUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5VUENFUmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFVQQ0VSZWFkZXI7XG5cblVQQ0VSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24oY29kZSwgcmVzdWx0LCBkZWNvZGVkQ29kZXMpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvZGVGcmVxdWVuY3kgPSAweDA7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb2RlLmVuZCk7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvZGUuY29kZSA+PSBzZWxmLkNPREVfR19TVEFSVCkge1xuICAgICAgICAgICAgY29kZS5jb2RlID0gY29kZS5jb2RlIC0gc2VsZi5DT0RFX0dfU1RBUlQ7XG4gICAgICAgICAgICBjb2RlRnJlcXVlbmN5IHw9IDEgPDwgKDUgLSBpKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICB9XG4gICAgaWYgKCFzZWxmLl9kZXRlcm1pbmVQYXJpdHkoY29kZUZyZXF1ZW5jeSwgcmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY29kZTtcbn07XG5cblVQQ0VSZWFkZXIucHJvdG90eXBlLl9kZXRlcm1pbmVQYXJpdHkgPSBmdW5jdGlvbihjb2RlRnJlcXVlbmN5LCByZXN1bHQpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgbnJTeXN0ZW07XG5cbiAgICBmb3IgKG5yU3lzdGVtID0gMDsgbnJTeXN0ZW0gPCB0aGlzLkNPREVfRlJFUVVFTkNZLmxlbmd0aDsgbnJTeXN0ZW0rKyl7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5DT0RFX0ZSRVFVRU5DWVtuclN5c3RlbV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChjb2RlRnJlcXVlbmN5ID09PSB0aGlzLkNPREVfRlJFUVVFTkNZW25yU3lzdGVtXVtpXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC51bnNoaWZ0KG5yU3lzdGVtKTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5VUENFUmVhZGVyLnByb3RvdHlwZS5fY29udmVydFRvVVBDQSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciB1cGNhID0gW3Jlc3VsdFswXV0sXG4gICAgICAgIGxhc3REaWdpdCA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMl07XG5cbiAgICBpZiAobGFzdERpZ2l0IDw9IDIpIHtcbiAgICAgICAgdXBjYSA9IHVwY2EuY29uY2F0KHJlc3VsdC5zbGljZSgxLCAzKSlcbiAgICAgICAgICAgIC5jb25jYXQoW2xhc3REaWdpdCwgMCwgMCwgMCwgMF0pXG4gICAgICAgICAgICAuY29uY2F0KHJlc3VsdC5zbGljZSgzLCA2KSk7XG4gICAgfSBlbHNlIGlmIChsYXN0RGlnaXQgPT09IDMpIHtcbiAgICAgICAgdXBjYSA9IHVwY2EuY29uY2F0KHJlc3VsdC5zbGljZSgxLCA0KSlcbiAgICAgICAgICAgIC5jb25jYXQoWzAsIDAsIDAsIDAsIDBdKVxuICAgICAgICAgICAgLmNvbmNhdChyZXN1bHQuc2xpY2UoNCwgNikpO1xuICAgIH0gZWxzZSBpZiAobGFzdERpZ2l0ID09PSA0KSB7XG4gICAgICAgIHVwY2EgPSB1cGNhLmNvbmNhdChyZXN1bHQuc2xpY2UoMSwgNSkpXG4gICAgICAgICAgICAuY29uY2F0KFswLCAwLCAwLCAwLCAwLCByZXN1bHRbNV1dKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1cGNhID0gdXBjYS5jb25jYXQocmVzdWx0LnNsaWNlKDEsIDYpKVxuICAgICAgICAgICAgLmNvbmNhdChbMCwgMCwgMCwgMCwgbGFzdERpZ2l0XSk7XG4gICAgfVxuXG4gICAgdXBjYS5wdXNoKHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0pO1xuICAgIHJldHVybiB1cGNhO1xufTtcblxuVVBDRVJlYWRlci5wcm90b3R5cGUuX2NoZWNrc3VtID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIEVBTlJlYWRlci5wcm90b3R5cGUuX2NoZWNrc3VtLmNhbGwodGhpcywgdGhpcy5fY29udmVydFRvVVBDQShyZXN1bHQpKTtcbn07XG5cblVQQ0VSZWFkZXIucHJvdG90eXBlLl9maW5kRW5kID0gZnVuY3Rpb24ob2Zmc2V0LCBpc1doaXRlKSB7XG4gICAgaXNXaGl0ZSA9IHRydWU7XG4gICAgcmV0dXJuIEVBTlJlYWRlci5wcm90b3R5cGUuX2ZpbmRFbmQuY2FsbCh0aGlzLCBvZmZzZXQsIGlzV2hpdGUpO1xufTtcblxuVVBDRVJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKGVuZEluZm8pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZDtcblxuICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA9IGVuZEluZm8uZW5kICsgKChlbmRJbmZvLmVuZCAtIGVuZEluZm8uc3RhcnQpIC8gMik7XG4gICAgaWYgKHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA8IHNlbGYuX3Jvdy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UoZW5kSW5mby5lbmQsIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmRJbmZvO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVVBDRVJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvdXBjX2VfcmVhZGVyLmpzIiwiaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuL2Vhbl9yZWFkZXInO1xuXG5mdW5jdGlvbiBVUENSZWFkZXIob3B0cywgc3VwcGxlbWVudHMpIHtcbiAgICBFQU5SZWFkZXIuY2FsbCh0aGlzLCBvcHRzLCBzdXBwbGVtZW50cyk7XG59XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICAgIEZPUk1BVDoge3ZhbHVlOiBcInVwY19hXCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5VUENSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFQU5SZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcblVQQ1JlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBVUENSZWFkZXI7XG5cblVQQ1JlYWRlci5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSBFQU5SZWFkZXIucHJvdG90eXBlLl9kZWNvZGUuY2FsbCh0aGlzKTtcblxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmNvZGUgJiYgcmVzdWx0LmNvZGUubGVuZ3RoID09PSAxMyAmJiByZXN1bHQuY29kZS5jaGFyQXQoMCkgPT09IFwiMFwiKSB7XG4gICAgICAgIHJlc3VsdC5jb2RlID0gcmVzdWx0LmNvZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVQQ1JlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvdXBjX3JlYWRlci5qcyIsIm1vZHVsZS5leHBvcnRzID0gZG90XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5mdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsLXZlYzIvZG90LmpzXG4vLyBtb2R1bGUgaWQgPSA1NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGNsb25lO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xuZnVuY3Rpb24gY2xvbmUoYSkge1xuICAgIHZhciBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDMpXG4gICAgb3V0WzBdID0gYVswXVxuICAgIG91dFsxXSA9IGFbMV1cbiAgICBvdXRbMl0gPSBhWzJdXG4gICAgcmV0dXJuIG91dFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbC12ZWMzL2Nsb25lLmpzXG4vLyBtb2R1bGUgaWQgPSA1NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzaENsZWFyID0gcmVxdWlyZSgnLi9faGFzaENsZWFyJyksXG4gICAgaGFzaERlbGV0ZSA9IHJlcXVpcmUoJy4vX2hhc2hEZWxldGUnKSxcbiAgICBoYXNoR2V0ID0gcmVxdWlyZSgnLi9faGFzaEdldCcpLFxuICAgIGhhc2hIYXMgPSByZXF1aXJlKCcuL19oYXNoSGFzJyksXG4gICAgaGFzaFNldCA9IHJlcXVpcmUoJy4vX2hhc2hTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFzaDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX0hhc2guanNcbi8vIG1vZHVsZSBpZCA9IDU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBtYXBDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVDbGVhcicpLFxuICAgIG1hcENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVEZWxldGUnKSxcbiAgICBtYXBDYWNoZUdldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlR2V0JyksXG4gICAgbWFwQ2FjaGVIYXMgPSByZXF1aXJlKCcuL19tYXBDYWNoZUhhcycpLFxuICAgIG1hcENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ2FjaGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19NYXBDYWNoZS5qc1xuLy8gbW9kdWxlIGlkID0gNTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIHN0YWNrQ2xlYXIgPSByZXF1aXJlKCcuL19zdGFja0NsZWFyJyksXG4gICAgc3RhY2tEZWxldGUgPSByZXF1aXJlKCcuL19zdGFja0RlbGV0ZScpLFxuICAgIHN0YWNrR2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tHZXQnKSxcbiAgICBzdGFja0hhcyA9IHJlcXVpcmUoJy4vX3N0YWNrSGFzJyksXG4gICAgc3RhY2tTZXQgPSByZXF1aXJlKCcuL19zdGFja1NldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2s7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19TdGFjay5qc1xuLy8gbW9kdWxlIGlkID0gNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFVpbnQ4QXJyYXkgPSByb290LlVpbnQ4QXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVWludDhBcnJheTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX1VpbnQ4QXJyYXkuanNcbi8vIG1vZHVsZSBpZCA9IDU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2FwcGx5LmpzXG4vLyBtb2R1bGUgaWQgPSA2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZVRpbWVzID0gcmVxdWlyZSgnLi9fYmFzZVRpbWVzJyksXG4gICAgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TGlrZUtleXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19hcnJheUxpa2VLZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSA2MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19hc3NpZ25WYWx1ZS5qc1xuLy8gbW9kdWxlIGlkID0gNjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gVGhlIG9iamVjdCB0byBpbmhlcml0IGZyb20uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0KCkge31cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvKSB7XG4gICAgaWYgKCFpc09iamVjdChwcm90bykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKG9iamVjdENyZWF0ZSkge1xuICAgICAgcmV0dXJuIG9iamVjdENyZWF0ZShwcm90byk7XG4gICAgfVxuICAgIG9iamVjdC5wcm90b3R5cGUgPSBwcm90bztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IG9iamVjdDtcbiAgICBvYmplY3QucHJvdG90eXBlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlQ3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY3JlYXRlQmFzZUZvciA9IHJlcXVpcmUoJy4vX2NyZWF0ZUJhc2VGb3InKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VGb3I7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlRm9yLmpzXG4vLyBtb2R1bGUgaWQgPSA2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VJc0FyZ3VtZW50cy5qc1xuLy8gbW9kdWxlIGlkID0gNjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc01hc2tlZCA9IHJlcXVpcmUoJy4vX2lzTWFza2VkJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc05hdGl2ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gNjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc1R5cGVkQXJyYXk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlSXNUeXBlZEFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXNJbiA9IHJlcXVpcmUoJy4vX25hdGl2ZUtleXNJbicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VLZXlzSW47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlS2V5c0luLmpzXG4vLyBtb2R1bGUgaWQgPSA2OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgU3RhY2sgPSByZXF1aXJlKCcuL19TdGFjaycpLFxuICAgIGFzc2lnbk1lcmdlVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25NZXJnZVZhbHVlJyksXG4gICAgYmFzZUZvciA9IHJlcXVpcmUoJy4vX2Jhc2VGb3InKSxcbiAgICBiYXNlTWVyZ2VEZWVwID0gcmVxdWlyZSgnLi9fYmFzZU1lcmdlRGVlcCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyksXG4gICAgc2FmZUdldCA9IHJlcXVpcmUoJy4vX3NhZmVHZXQnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tZXJnZWAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IHNyY0luZGV4IFRoZSBpbmRleCBvZiBgc291cmNlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdlZCB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIHNvdXJjZSB2YWx1ZXMgYW5kIHRoZWlyIG1lcmdlZFxuICogIGNvdW50ZXJwYXJ0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplciwgc3RhY2spIHtcbiAgaWYgKG9iamVjdCA9PT0gc291cmNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJhc2VGb3Ioc291cmNlLCBmdW5jdGlvbihzcmNWYWx1ZSwga2V5KSB7XG4gICAgaWYgKGlzT2JqZWN0KHNyY1ZhbHVlKSkge1xuICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgc3JjSW5kZXgsIGJhc2VNZXJnZSwgY3VzdG9taXplciwgc3RhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgICAgPyBjdXN0b21pemVyKHNhZmVHZXQob2JqZWN0LCBrZXkpLCBzcmNWYWx1ZSwgKGtleSArICcnKSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKVxuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBzcmNWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH0sIGtleXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZU1lcmdlLmpzXG4vLyBtb2R1bGUgaWQgPSA2OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzaWduTWVyZ2VWYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnbk1lcmdlVmFsdWUnKSxcbiAgICBjbG9uZUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQnVmZmVyJyksXG4gICAgY2xvbmVUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fY2xvbmVUeXBlZEFycmF5JyksXG4gICAgY29weUFycmF5ID0gcmVxdWlyZSgnLi9fY29weUFycmF5JyksXG4gICAgaW5pdENsb25lT2JqZWN0ID0gcmVxdWlyZSgnLi9faW5pdENsb25lT2JqZWN0JyksXG4gICAgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQXJyYXlMaWtlT2JqZWN0ID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZU9iamVjdCcpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnLi9pc1BsYWluT2JqZWN0JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKSxcbiAgICBzYWZlR2V0ID0gcmVxdWlyZSgnLi9fc2FmZUdldCcpLFxuICAgIHRvUGxhaW5PYmplY3QgPSByZXF1aXJlKCcuL3RvUGxhaW5PYmplY3QnKTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VNZXJnZWAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBtZXJnZXMgYW5kIHRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBlbmFibGluZyBvYmplY3RzIHdpdGggY2lyY3VsYXJcbiAqIHJlZmVyZW5jZXMgdG8gYmUgbWVyZ2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBtZXJnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcmNJbmRleCBUaGUgaW5kZXggb2YgYHNvdXJjZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXJnZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1lcmdlIHZhbHVlcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgc291cmNlIHZhbHVlcyBhbmQgdGhlaXIgbWVyZ2VkXG4gKiAgY291bnRlcnBhcnRzLlxuICovXG5mdW5jdGlvbiBiYXNlTWVyZ2VEZWVwKG9iamVjdCwgc291cmNlLCBrZXksIHNyY0luZGV4LCBtZXJnZUZ1bmMsIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIHZhciBvYmpWYWx1ZSA9IHNhZmVHZXQob2JqZWN0LCBrZXkpLFxuICAgICAgc3JjVmFsdWUgPSBzYWZlR2V0KHNvdXJjZSwga2V5KSxcbiAgICAgIHN0YWNrZWQgPSBzdGFjay5nZXQoc3JjVmFsdWUpO1xuXG4gIGlmIChzdGFja2VkKSB7XG4gICAgYXNzaWduTWVyZ2VWYWx1ZShvYmplY3QsIGtleSwgc3RhY2tlZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICA/IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCAoa2V5ICsgJycpLCBvYmplY3QsIHNvdXJjZSwgc3RhY2spXG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgdmFyIGlzQ29tbW9uID0gbmV3VmFsdWUgPT09IHVuZGVmaW5lZDtcblxuICBpZiAoaXNDb21tb24pIHtcbiAgICB2YXIgaXNBcnIgPSBpc0FycmF5KHNyY1ZhbHVlKSxcbiAgICAgICAgaXNCdWZmID0gIWlzQXJyICYmIGlzQnVmZmVyKHNyY1ZhbHVlKSxcbiAgICAgICAgaXNUeXBlZCA9ICFpc0FyciAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheShzcmNWYWx1ZSk7XG5cbiAgICBuZXdWYWx1ZSA9IHNyY1ZhbHVlO1xuICAgIGlmIChpc0FyciB8fCBpc0J1ZmYgfHwgaXNUeXBlZCkge1xuICAgICAgaWYgKGlzQXJyYXkob2JqVmFsdWUpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gb2JqVmFsdWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc0FycmF5TGlrZU9iamVjdChvYmpWYWx1ZSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBjb3B5QXJyYXkob2JqVmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNCdWZmKSB7XG4gICAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgICAgIG5ld1ZhbHVlID0gY2xvbmVCdWZmZXIoc3JjVmFsdWUsIHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNUeXBlZCkge1xuICAgICAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgICAgICBuZXdWYWx1ZSA9IGNsb25lVHlwZWRBcnJheShzcmNWYWx1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbmV3VmFsdWUgPSBbXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQbGFpbk9iamVjdChzcmNWYWx1ZSkgfHwgaXNBcmd1bWVudHMoc3JjVmFsdWUpKSB7XG4gICAgICBuZXdWYWx1ZSA9IG9ialZhbHVlO1xuICAgICAgaWYgKGlzQXJndW1lbnRzKG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IHRvUGxhaW5PYmplY3Qob2JqVmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIWlzT2JqZWN0KG9ialZhbHVlKSB8fCAoc3JjSW5kZXggJiYgaXNGdW5jdGlvbihvYmpWYWx1ZSkpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gaW5pdENsb25lT2JqZWN0KHNyY1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBpZiAoaXNDb21tb24pIHtcbiAgICAvLyBSZWN1cnNpdmVseSBtZXJnZSBvYmplY3RzIGFuZCBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBzdGFjay5zZXQoc3JjVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICBtZXJnZUZ1bmMobmV3VmFsdWUsIHNyY1ZhbHVlLCBzcmNJbmRleCwgY3VzdG9taXplciwgc3RhY2spO1xuICAgIHN0YWNrWydkZWxldGUnXShzcmNWYWx1ZSk7XG4gIH1cbiAgYXNzaWduTWVyZ2VWYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNZXJnZURlZXA7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlTWVyZ2VEZWVwLmpzXG4vLyBtb2R1bGUgaWQgPSA3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5JyksXG4gICAgb3ZlclJlc3QgPSByZXF1aXJlKCcuL19vdmVyUmVzdCcpLFxuICAgIHNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fc2V0VG9TdHJpbmcnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVJlc3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlUmVzdC5qc1xuLy8gbW9kdWxlIGlkID0gNzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNvbnN0YW50ID0gcmVxdWlyZSgnLi9jb25zdGFudCcpLFxuICAgIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNldFRvU3RyaW5nO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUaW1lcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VUaW1lcy5qc1xuLy8gbW9kdWxlIGlkID0gNzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmFyeTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VVbmFyeS5qc1xuLy8gbW9kdWxlIGlkID0gNzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIFVpbnQ4QXJyYXkgPSByZXF1aXJlKCcuL19VaW50OEFycmF5Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBhcnJheUJ1ZmZlcmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGFycmF5QnVmZmVyIFRoZSBhcnJheSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBhcnJheSBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBhcnJheUJ1ZmZlci5jb25zdHJ1Y3RvcihhcnJheUJ1ZmZlci5ieXRlTGVuZ3RoKTtcbiAgbmV3IFVpbnQ4QXJyYXkocmVzdWx0KS5zZXQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUFycmF5QnVmZmVyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY2xvbmVBcnJheUJ1ZmZlci5qc1xuLy8gbW9kdWxlIGlkID0gNzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkLFxuICAgIGFsbG9jVW5zYWZlID0gQnVmZmVyID8gQnVmZmVyLmFsbG9jVW5zYWZlIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiAgYGJ1ZmZlcmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgVGhlIGJ1ZmZlciB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7QnVmZmVyfSBSZXR1cm5zIHRoZSBjbG9uZWQgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBjbG9uZUJ1ZmZlcihidWZmZXIsIGlzRGVlcCkge1xuICBpZiAoaXNEZWVwKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5zbGljZSgpO1xuICB9XG4gIHZhciBsZW5ndGggPSBidWZmZXIubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gYWxsb2NVbnNhZmUgPyBhbGxvY1Vuc2FmZShsZW5ndGgpIDogbmV3IGJ1ZmZlci5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIGJ1ZmZlci5jb3B5KHJlc3VsdCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVCdWZmZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19jbG9uZUJ1ZmZlci5qc1xuLy8gbW9kdWxlIGlkID0gNzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNsb25lQXJyYXlCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUFycmF5QnVmZmVyJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGB0eXBlZEFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHR5cGVkQXJyYXkgVGhlIHR5cGVkIGFycmF5IHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCB0eXBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gY2xvbmVUeXBlZEFycmF5KHR5cGVkQXJyYXksIGlzRGVlcCkge1xuICB2YXIgYnVmZmVyID0gaXNEZWVwID8gY2xvbmVBcnJheUJ1ZmZlcih0eXBlZEFycmF5LmJ1ZmZlcikgOiB0eXBlZEFycmF5LmJ1ZmZlcjtcbiAgcmV0dXJuIG5ldyB0eXBlZEFycmF5LmNvbnN0cnVjdG9yKGJ1ZmZlciwgdHlwZWRBcnJheS5ieXRlT2Zmc2V0LCB0eXBlZEFycmF5Lmxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVUeXBlZEFycmF5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY2xvbmVUeXBlZEFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA3N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGBzb3VyY2VgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcblxuICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtpbmRleF0gPSBzb3VyY2VbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5QXJyYXk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19jb3B5QXJyYXkuanNcbi8vIG1vZHVsZSBpZCA9IDc4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyk7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlPYmplY3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19jb3B5T2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlSnNEYXRhO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY29yZUpzRGF0YS5qc1xuLy8gbW9kdWxlIGlkID0gODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VSZXN0ID0gcmVxdWlyZSgnLi9fYmFzZVJlc3QnKSxcbiAgICBpc0l0ZXJhdGVlQ2FsbCA9IHJlcXVpcmUoJy4vX2lzSXRlcmF0ZWVDYWxsJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQXNzaWduZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qc1xuLy8gbW9kdWxlIGlkID0gODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQmFzZUZvcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2NyZWF0ZUJhc2VGb3IuanNcbi8vIG1vZHVsZSBpZCA9IDgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2dldFJhd1RhZy5qc1xuLy8gbW9kdWxlIGlkID0gODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VmFsdWU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19nZXRWYWx1ZS5qc1xuLy8gbW9kdWxlIGlkID0gODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoQ2xlYXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19oYXNoQ2xlYXIuanNcbi8vIG1vZHVsZSBpZCA9IDg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2hhc2hEZWxldGUuanNcbi8vIG1vZHVsZSBpZCA9IDg2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hHZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19oYXNoR2V0LmpzXG4vLyBtb2R1bGUgaWQgPSA4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faGFzaEhhcy5qc1xuLy8gbW9kdWxlIGlkID0gODhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHRoaXMuc2l6ZSArPSB0aGlzLmhhcyhrZXkpID8gMCA6IDE7XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoU2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faGFzaFNldC5qc1xuLy8gbW9kdWxlIGlkID0gODlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCcuL19iYXNlQ3JlYXRlJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZU9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgIWlzUHJvdG90eXBlKG9iamVjdCkpXG4gICAgPyBiYXNlQ3JlYXRlKGdldFByb3RvdHlwZShvYmplY3QpKVxuICAgIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lT2JqZWN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faW5pdENsb25lT2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSXRlcmF0ZWVDYWxsO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanNcbi8vIG1vZHVsZSBpZCA9IDkxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0tleWFibGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19pc0tleWFibGUuanNcbi8vIG1vZHVsZSBpZCA9IDkyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjb3JlSnNEYXRhID0gcmVxdWlyZSgnLi9fY29yZUpzRGF0YScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTWFza2VkO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faXNNYXNrZWQuanNcbi8vIG1vZHVsZSBpZCA9IDkzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVDbGVhcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzXG4vLyBtb2R1bGUgaWQgPSA5NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVEZWxldGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanNcbi8vIG1vZHVsZSBpZCA9IDk1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVHZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19saXN0Q2FjaGVHZXQuanNcbi8vIG1vZHVsZSBpZCA9IDk2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGFzc29jSW5kZXhPZih0aGlzLl9fZGF0YV9fLCBrZXkpID4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlSGFzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbGlzdENhY2hlSGFzLmpzXG4vLyBtb2R1bGUgaWQgPSA5N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVTZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19saXN0Q2FjaGVTZXQuanNcbi8vIG1vZHVsZSBpZCA9IDk4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBIYXNoID0gcmVxdWlyZSgnLi9fSGFzaCcpLFxuICAgIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLnNpemUgPSAwO1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVDbGVhcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX21hcENhY2hlQ2xlYXIuanNcbi8vIG1vZHVsZSBpZCA9IDk5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUdldDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX21hcENhY2hlR2V0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19tYXBDYWNoZUhhcy5qc1xuLy8gbW9kdWxlIGlkID0gMTAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19tYXBDYWNoZVNldC5qc1xuLy8gbW9kdWxlIGlkID0gMTAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX25hdGl2ZUtleXNJbi5qc1xuLy8gbW9kdWxlIGlkID0gMTA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19ub2RlVXRpbC5qc1xuLy8gbW9kdWxlIGlkID0gMTA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDEwNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fb3ZlckFyZy5qc1xuLy8gbW9kdWxlIGlkID0gMTA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlclJlc3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19vdmVyUmVzdC5qc1xuLy8gbW9kdWxlIGlkID0gMTA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlU2V0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19iYXNlU2V0VG9TdHJpbmcnKSxcbiAgICBzaG9ydE91dCA9IHJlcXVpcmUoJy4vX3Nob3J0T3V0Jyk7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9TdHJpbmc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zZXRUb1N0cmluZy5qc1xuLy8gbW9kdWxlIGlkID0gMTA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG9ydE91dDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX3Nob3J0T3V0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrQ2xlYXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zdGFja0NsZWFyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrRGVsZXRlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc3RhY2tEZWxldGUuanNcbi8vIG1vZHVsZSBpZCA9IDExMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzdGFja0dldChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tHZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zdGFja0dldC5qc1xuLy8gbW9kdWxlIGlkID0gMTEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ2hlY2tzIGlmIGEgc3RhY2sgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0hhcyhrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tIYXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zdGFja0hhcy5qc1xuLy8gbW9kdWxlIGlkID0gMTE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBNYXBDYWNoZSA9IHJlcXVpcmUoJy4vX01hcENhY2hlJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIExpc3RDYWNoZSkge1xuICAgIHZhciBwYWlycyA9IGRhdGEuX19kYXRhX187XG4gICAgaWYgKCFNYXAgfHwgKHBhaXJzLmxlbmd0aCA8IExBUkdFX0FSUkFZX1NJWkUgLSAxKSkge1xuICAgICAgcGFpcnMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgdGhpcy5zaXplID0gKytkYXRhLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrU2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc3RhY2tTZXQuanNcbi8vIG1vZHVsZSBpZCA9IDExNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9Tb3VyY2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL190b1NvdXJjZS5qc1xuLy8gbW9kdWxlIGlkID0gMTE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnN0YW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9jb25zdGFudC5qc1xuLy8gbW9kdWxlIGlkID0gMTE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uaXNBcnJheUxpa2VgIGV4Y2VwdCB0aGF0IGl0IGFsc28gY2hlY2tzIGlmIGB2YWx1ZWBcbiAqIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS1saWtlIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2VPYmplY3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzQXJyYXlMaWtlT2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzUGxhaW5PYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDExOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9zdHViRmFsc2UuanNcbi8vIG1vZHVsZSBpZCA9IDEyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBwbGFpbiBvYmplY3QgZmxhdHRlbmluZyBpbmhlcml0ZWQgZW51bWVyYWJsZSBzdHJpbmdcbiAqIGtleWVkIHByb3BlcnRpZXMgb2YgYHZhbHVlYCB0byBvd24gcHJvcGVydGllcyBvZiB0aGUgcGxhaW4gb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY29udmVydGVkIHBsYWluIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5hc3NpZ24oeyAnYSc6IDEgfSwgbmV3IEZvbyk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyIH1cbiAqXG4gKiBfLmFzc2lnbih7ICdhJzogMSB9LCBfLnRvUGxhaW5PYmplY3QobmV3IEZvbykpO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzIH1cbiAqL1xuZnVuY3Rpb24gdG9QbGFpbk9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gY29weU9iamVjdCh2YWx1ZSwga2V5c0luKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9QbGFpbk9iamVjdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvdG9QbGFpbk9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gMTIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMTIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=