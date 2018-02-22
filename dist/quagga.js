(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(factory.toString()).default;
	else if(typeof exports === 'object')
		exports["Quagga"] = factory(factory.toString()).default;
	else
		root["Quagga"] = factory(factory.toString()).default;
})(this, function(__factorySource__) {
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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_array_helper__ = __webpack_require__(4);


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

    __WEBPACK_IMPORTED_MODULE_0__common_array_helper__["a" /* default */].init(counter, 0);

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

/* harmony default export */ __webpack_exports__["a"] = (BarcodeReader);

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_merge__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_merge___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash_merge__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__barcode_reader__ = __webpack_require__(0);


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };




function EANReader(opts, supplements) {
    opts = __WEBPACK_IMPORTED_MODULE_0_lodash_merge___default()(getDefaulConfig(), opts);
    __WEBPACK_IMPORTED_MODULE_1__barcode_reader__["a" /* default */].call(this, opts, supplements);
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

EANReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_1__barcode_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (EANReader);

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
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
});

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__subImage__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__common_cv_utils__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__common_array_helper__ = __webpack_require__(4);



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
                __WEBPACK_IMPORTED_MODULE_2__common_array_helper__["a" /* default */].init(this.data, 0);
            }
        } else {
            this.data = new Uint8Array(size.x * size.y);
            if (Uint8Array === Array && initialize) {
                __WEBPACK_IMPORTED_MODULE_2__common_array_helper__["a" /* default */].init(this.data, 0);
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
    return new __WEBPACK_IMPORTED_MODULE_0__subImage__["a" /* default */](from, size, this);
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
        result = hsv[0] <= 0 ? whiteRgb : hsv[0] >= 360 ? blackRgb : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__common_cv_utils__["a" /* hsv2rgb */])(hsv, rgb);
        data[length * 4 + 0] = result[0];
        data[length * 4 + 1] = result[1];
        data[length * 4 + 2] = result[2];
        data[length * 4 + 3] = 255;
    }
    ctx.putImageData(frame, from.x, from.y);
};

/* harmony default export */ __webpack_exports__["a"] = (ImageWrapper);

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__barcode_reader__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__common_array_helper__ = __webpack_require__(4);



function Code39Reader() {
    __WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].call(this);
}

var properties = {
    ALPHABETH_STRING: { value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%" },
    ALPHABET: { value: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 46, 32, 42, 36, 47, 43, 37] },
    CHARACTER_ENCODINGS: { value: [0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064, 0x109, 0x049, 0x148, 0x019, 0x118, 0x058, 0x00D, 0x10C, 0x04C, 0x01C, 0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106, 0x046, 0x016, 0x181, 0x0C1, 0x1C0, 0x091, 0x190, 0x0D0, 0x085, 0x184, 0x0C4, 0x094, 0x0A8, 0x0A2, 0x08A, 0x02A] },
    ASTERISK: { value: 0x094 },
    FORMAT: { value: "code_39", writeable: false }
};

Code39Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype, properties);
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
        nextStart += __WEBPACK_IMPORTED_MODULE_1__common_array_helper__["a" /* default */].sum(counters);
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
        patternSize = __WEBPACK_IMPORTED_MODULE_1__common_array_helper__["a" /* default */].sum(counters);

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

/* harmony default export */ __webpack_exports__["a"] = (Code39Reader);

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["default"] = init;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decoder_barcode_decoder_2__ = __webpack_require__(41);



function init(config) {
  return __WEBPACK_IMPORTED_MODULE_0__decoder_barcode_decoder_2__["a" /* default */].create(config);
}

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var vec2 = {
    clone: __webpack_require__(6),
    dot: __webpack_require__(54)
    /**
     * Creates a cluster for grouping similar orientations of datapoints
     */
};/* harmony default export */ __webpack_exports__["a"] = ({
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
});

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export imageRef */
/* unused harmony export computeIntegralImage2 */
/* unused harmony export computeIntegralImage */
/* unused harmony export thresholdImage */
/* unused harmony export computeHistogram */
/* unused harmony export sharpenLine */
/* unused harmony export determineOtsuThreshold */
/* unused harmony export otsuThreshold */
/* unused harmony export computeBinaryImage */
/* unused harmony export cluster */
/* unused harmony export Tracer */
/* unused harmony export DILATE */
/* unused harmony export ERODE */
/* unused harmony export dilate */
/* unused harmony export erode */
/* unused harmony export subtract */
/* unused harmony export bitwiseOr */
/* unused harmony export countNonZero */
/* unused harmony export topGeneric */
/* unused harmony export grayArrayFromImage */
/* unused harmony export grayArrayFromContext */
/* unused harmony export grayAndHalfSampleFromCanvasData */
/* unused harmony export computeGray */
/* unused harmony export loadImageArray */
/* unused harmony export halfSample */
/* harmony export (immutable) */ __webpack_exports__["a"] = hsv2rgb;
/* unused harmony export _computeDivisors */
/* unused harmony export calculatePatchSize */
/* unused harmony export _parseCSSDimensionValues */
/* unused harmony export _dimensionsConverters */
/* unused harmony export computeImageArea */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__cluster__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__array_helper__ = __webpack_require__(4);


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
        return __WEBPACK_IMPORTED_MODULE_1__array_helper__["a" /* default */].maxIndex(vet);
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
        point = __WEBPACK_IMPORTED_MODULE_0__cluster__["a" /* default */].createPoint(points[i], i, property);
        if (!addToCluster(point)) {
            clusters.push(__WEBPACK_IMPORTED_MODULE_0__cluster__["a" /* default */].create(point, threshold));
        }
    }
    return clusters;
};

var Tracer = {
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

var DILATE = 1;
var ERODE = 2;

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

var _dimensionsConverters = {
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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* harmony default export */ __webpack_exports__["a"] = (SubImage);

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bresenham__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__common_image_wrapper__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__reader_code_128_reader__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__reader_ean_reader__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__reader_code_39_reader__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__reader_code_39_vin_reader__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__reader_codabar_reader__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__reader_upc_reader__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__reader_ean_8_reader__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__reader_ean_2_reader__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__reader_ean_5_reader__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__reader_upc_e_reader__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__reader_i2of5_reader__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__reader_2of5_reader__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__reader_code_93_reader__ = __webpack_require__(47);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
















var vec2clone = __webpack_require__(6);

var READERS = {
    code_128_reader: __WEBPACK_IMPORTED_MODULE_2__reader_code_128_reader__["a" /* default */],
    ean_reader: __WEBPACK_IMPORTED_MODULE_3__reader_ean_reader__["a" /* default */],
    ean_5_reader: __WEBPACK_IMPORTED_MODULE_10__reader_ean_5_reader__["a" /* default */],
    ean_2_reader: __WEBPACK_IMPORTED_MODULE_9__reader_ean_2_reader__["a" /* default */],
    ean_8_reader: __WEBPACK_IMPORTED_MODULE_8__reader_ean_8_reader__["a" /* default */],
    code_39_reader: __WEBPACK_IMPORTED_MODULE_4__reader_code_39_reader__["a" /* default */],
    code_39_vin_reader: __WEBPACK_IMPORTED_MODULE_5__reader_code_39_vin_reader__["a" /* default */],
    codabar_reader: __WEBPACK_IMPORTED_MODULE_6__reader_codabar_reader__["a" /* default */],
    upc_reader: __WEBPACK_IMPORTED_MODULE_7__reader_upc_reader__["a" /* default */],
    upc_e_reader: __WEBPACK_IMPORTED_MODULE_11__reader_upc_e_reader__["a" /* default */],
    i2of5_reader: __WEBPACK_IMPORTED_MODULE_12__reader_i2of5_reader__["a" /* default */],
    '2of5_reader': __WEBPACK_IMPORTED_MODULE_13__reader_2of5_reader__["a" /* default */],
    code_93_reader: __WEBPACK_IMPORTED_MODULE_14__reader_code_93_reader__["a" /* default */]
};
/* harmony default export */ __webpack_exports__["a"] = ({
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
                if (true) {
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
                barcodeLine = __WEBPACK_IMPORTED_MODULE_0__bresenham__["a" /* default */].getBarcodeLine(inputImageWrapper, line[0], line[1]);

            __WEBPACK_IMPORTED_MODULE_0__bresenham__["a" /* default */].toBinaryLine(barcodeLine);

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

            inputImageWrapper = new __WEBPACK_IMPORTED_MODULE_1__common_image_wrapper__["a" /* default */]({
                y: imageData.height,
                x: imageData.width
            }, singleColorImageData, Uint8ClampedArray, false);

            console.log(inputImageWrapper);
            return decodeFromBoundingBox([vec2clone([0, 0]), vec2clone([0, inputImageWrapper.size.y]), vec2clone([inputImageWrapper.size.x, inputImageWrapper.size.y]), vec2clone([inputImageWrapper.size.x, 0])]);
        };
    }
});

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_image_wrapper__ = __webpack_require__(18);


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

/* harmony default export */ __webpack_exports__["a"] = (Bresenham);

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__barcode_reader__ = __webpack_require__(0);


function TwoOfFiveReader(opts) {
    __WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].call(this, opts);
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

TwoOfFiveReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (TwoOfFiveReader);

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__barcode_reader__ = __webpack_require__(0);


function CodabarReader() {
    __WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].call(this);
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

CodabarReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (CodabarReader);

/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__barcode_reader__ = __webpack_require__(0);


function Code128Reader() {
    __WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].call(this);
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

Code128Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype, properties);
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

__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype._verifyTrailingWhitespace = function (endInfo) {
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

/* harmony default export */ __webpack_exports__["a"] = (Code128Reader);

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__code_39_reader__ = __webpack_require__(19);


function Code39VINReader() {
    __WEBPACK_IMPORTED_MODULE_0__code_39_reader__["a" /* default */].call(this);
}

var patterns = {
    IOQ: /[IOQ]/g,
    AZ09: /[A-Z0-9]{17}/
};

Code39VINReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__code_39_reader__["a" /* default */].prototype);
Code39VINReader.prototype.constructor = Code39VINReader;

// Cribbed from:
// https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/client/result/VINResultParser.java
Code39VINReader.prototype._decode = function () {
    var result = __WEBPACK_IMPORTED_MODULE_0__code_39_reader__["a" /* default */].prototype._decode.apply(this);
    if (!result) {
        return null;
    }

    var code = result.code;

    if (!code) {
        return null;
    }

    code = code.replace(patterns.IOQ, '');

    if (!code.match(patterns.AZ09)) {
        if (true) {
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

/* harmony default export */ __webpack_exports__["a"] = (Code39VINReader);

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__barcode_reader__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__common_array_helper__ = __webpack_require__(4);



function Code93Reader() {
    __WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].call(this);
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

Code93Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__barcode_reader__["a" /* default */].prototype, properties);
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
        nextStart += __WEBPACK_IMPORTED_MODULE_1__common_array_helper__["a" /* default */].sum(counters);
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

/* harmony default export */ __webpack_exports__["a"] = (Code93Reader);

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ean_reader__ = __webpack_require__(2);


function EAN2Reader() {
    __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].call(this);
}

var properties = {
    FORMAT: { value: "ean_2", writeable: false }
};

EAN2Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (EAN2Reader);

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ean_reader__ = __webpack_require__(2);


function EAN5Reader() {
    __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].call(this);
}

var properties = {
    FORMAT: { value: "ean_5", writeable: false }
};

var CHECK_DIGIT_ENCODINGS = [24, 20, 18, 17, 12, 6, 3, 10, 9, 5];

EAN5Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (EAN5Reader);

/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ean_reader__ = __webpack_require__(2);


function EAN8Reader(opts, supplements) {
    __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].call(this, opts, supplements);
}

var properties = {
    FORMAT: { value: "ean_8", writeable: false }
};

EAN8Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype, properties);
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

/* harmony default export */ __webpack_exports__["a"] = (EAN8Reader);

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_merge__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_merge___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash_merge__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__barcode_reader__ = __webpack_require__(0);




function I2of5Reader(opts) {
    opts = __WEBPACK_IMPORTED_MODULE_0_lodash_merge___default()(getDefaulConfig(), opts);
    __WEBPACK_IMPORTED_MODULE_1__barcode_reader__["a" /* default */].call(this, opts);
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

I2of5Reader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_1__barcode_reader__["a" /* default */].prototype, properties);
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
    return __WEBPACK_IMPORTED_MODULE_1__barcode_reader__["a" /* default */].prototype._matchPattern.call(this, counter, code);
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

/* harmony default export */ __webpack_exports__["a"] = (I2of5Reader);

/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ean_reader__ = __webpack_require__(2);


function UPCEReader(opts, supplements) {
    __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].call(this, opts, supplements);
}

var properties = {
    CODE_FREQUENCY: { value: [[56, 52, 50, 49, 44, 38, 35, 42, 41, 37], [7, 11, 13, 14, 19, 25, 28, 21, 22, 26]] },
    STOP_PATTERN: { value: [1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7, 1 / 6 * 7] },
    FORMAT: { value: "upc_e", writeable: false }
};

UPCEReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype, properties);
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
    return __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype._checksum.call(this, this._convertToUPCA(result));
};

UPCEReader.prototype._findEnd = function (offset, isWhite) {
    isWhite = true;
    return __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype._findEnd.call(this, offset, isWhite);
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

/* harmony default export */ __webpack_exports__["a"] = (UPCEReader);

/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ean_reader__ = __webpack_require__(2);


function UPCReader(opts, supplements) {
    __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].call(this, opts, supplements);
}

var properties = {
    FORMAT: { value: "upc_a", writeable: false }
};

UPCReader.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype, properties);
UPCReader.prototype.constructor = UPCReader;

UPCReader.prototype._decode = function () {
    var result = __WEBPACK_IMPORTED_MODULE_0__ean_reader__["a" /* default */].prototype._decode.call(this);

    if (result && result.code && result.code.length === 13 && result.code.charAt(0) === "0") {
        result.code = result.code.substring(1);
        return result;
    }
    return null;
};

/* harmony default export */ __webpack_exports__["a"] = (UPCReader);

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
/******/ ])
});
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9teU1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDQzNGM2ZjM3MDFhNWZjYjlkMjVmIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvYmFyY29kZV9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNPYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9lYW5fcmVhZGVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19yb290LmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vYXJyYXlfaGVscGVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsLXZlYzIvY2xvbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXNzb2NJbmRleE9mLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRNYXBEYXRhLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19uYXRpdmVDcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvZXEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzRnVuY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2ltYWdlX3dyYXBwZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9jb2RlXzM5X3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fTWFwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19TeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Fzc2lnbk1lcmdlVmFsdWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzSW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zYWZlR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lkZW50aXR5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQXJndW1lbnRzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNCdWZmZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNMZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2tleXNJbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9tZXJnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcXVhZ2dhLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vY2x1c3Rlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2N2X3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vc3ViSW1hZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29kZXIvYmFyY29kZV9kZWNvZGVyXzIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29kZXIvYnJlc2VuaGFtLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvMm9mNV9yZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlYWRlci9jb2RhYmFyX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2NvZGVfMTI4X3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2NvZGVfMzlfdmluX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVhZGVyL2NvZGVfOTNfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvZWFuXzJfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvZWFuXzVfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvZWFuXzhfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvaTJvZjVfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvdXBjX2VfcmVhZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZWFkZXIvdXBjX3JlYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsLXZlYzIvZG90LmpzIiwid2VicGFjazovLy8uL34vZ2wtdmVjMy9jbG9uZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fSGFzaC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fTWFwQ2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX1N0YWNrLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19VaW50OEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19hcHBseS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXJyYXlMaWtlS2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXNzaWduVmFsdWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VDcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VGb3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUlzTmF0aXZlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlSXNUeXBlZEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlS2V5c0luLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlTWVyZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VNZXJnZURlZXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlU2V0VG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZVVuYXJ5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jbG9uZUFycmF5QnVmZmVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jbG9uZUJ1ZmZlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY2xvbmVUeXBlZEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jb3B5QXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2NvcHlPYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2NvcmVKc0RhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2NyZWF0ZUFzc2lnbmVyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jcmVhdGVCYXNlRm9yLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRSYXdUYWcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2dldFZhbHVlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoQ2xlYXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2hhc2hEZWxldGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2hhc2hHZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2hhc2hIYXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2hhc2hTZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzS2V5YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNNYXNrZWQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbGlzdENhY2hlSGFzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVTZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcENhY2hlQ2xlYXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZUdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbWFwQ2FjaGVIYXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX25vZGVVdGlsLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fb3ZlckFyZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fb3ZlclJlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3NldFRvU3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zaG9ydE91dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tDbGVhci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tEZWxldGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zdGFja0hhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tTZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3RvU291cmNlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2NvbnN0YW50LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQXJyYXlMaWtlT2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzUGxhaW5PYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL3RvUGxhaW5PYmplY3QuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyJdLCJuYW1lcyI6WyJCYXJjb2RlUmVhZGVyIiwiY29uZmlnIiwic3VwcGxlbWVudHMiLCJfcm93IiwicHJvdG90eXBlIiwiX25leHRVbnNldCIsImxpbmUiLCJzdGFydCIsImkiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJfbWF0Y2hQYXR0ZXJuIiwiY291bnRlciIsImNvZGUiLCJtYXhTaW5nbGVFcnJvciIsImVycm9yIiwic2luZ2xlRXJyb3IiLCJzdW0iLCJtb2R1bG8iLCJiYXJXaWR0aCIsImNvdW50Iiwic2NhbGVkIiwiU0lOR0xFX0NPREVfRVJST1IiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJNYXRoIiwiYWJzIiwiX25leHRTZXQiLCJvZmZzZXQiLCJfY29ycmVjdEJhcnMiLCJjb3JyZWN0aW9uIiwiaW5kaWNlcyIsInRtcCIsIl9tYXRjaFRyYWNlIiwiY21wQ291bnRlciIsImVwc2lsb24iLCJzZWxmIiwiaXNXaGl0ZSIsImNvdW50ZXJQb3MiLCJiZXN0TWF0Y2giLCJwdXNoIiwiZW5kIiwiZGVjb2RlUGF0dGVybiIsInBhdHRlcm4iLCJyZXN1bHQiLCJfZGVjb2RlIiwicmV2ZXJzZSIsImRpcmVjdGlvbiIsIkRJUkVDVElPTiIsIlJFVkVSU0UiLCJGT1JXQVJEIiwiZm9ybWF0IiwiRk9STUFUIiwiX21hdGNoUmFuZ2UiLCJ2YWx1ZSIsIl9maWxsQ291bnRlcnMiLCJjb3VudGVycyIsIl90b0NvdW50ZXJzIiwibnVtQ291bnRlcnMiLCJBcnJheUhlbHBlciIsImluaXQiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsIndyaXRlYWJsZSIsIkV4Y2VwdGlvbiIsIlN0YXJ0Tm90Rm91bmRFeGNlcHRpb24iLCJDb2RlTm90Rm91bmRFeGNlcHRpb24iLCJQYXR0ZXJuTm90Rm91bmRFeGNlcHRpb24iLCJDT05GSUdfS0VZUyIsIkVBTlJlYWRlciIsIm9wdHMiLCJnZXREZWZhdWxDb25maWciLCJjYWxsIiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJkZWZhdWx0IiwicHJvcGVydGllcyIsIkNPREVfTF9TVEFSVCIsIkNPREVfR19TVEFSVCIsIlNUQVJUX1BBVFRFUk4iLCJTVE9QX1BBVFRFUk4iLCJNSURETEVfUEFUVEVSTiIsIkVYVEVOU0lPTl9TVEFSVF9QQVRURVJOIiwiQ09ERV9QQVRURVJOIiwiQ09ERV9GUkVRVUVOQ1kiLCJBVkdfQ09ERV9FUlJPUiIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiX2RlY29kZUNvZGUiLCJjb2RlcmFuZ2UiLCJfZmluZFBhdHRlcm4iLCJ0cnlIYXJkZXIiLCJqIiwiX2ZpbmRTdGFydCIsImxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQiLCJzdGFydEluZm8iLCJfdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlIiwiZW5kSW5mbyIsInRyYWlsaW5nV2hpdGVzcGFjZUVuZCIsIl9maW5kRW5kIiwiX2NhbGN1bGF0ZUZpcnN0RGlnaXQiLCJjb2RlRnJlcXVlbmN5IiwiX2RlY29kZVBheWxvYWQiLCJkZWNvZGVkQ29kZXMiLCJmaXJzdERpZ2l0IiwidW5zaGlmdCIsInJlc3VsdEluZm8iLCJfY2hlY2tzdW0iLCJleHQiLCJfZGVjb2RlRXh0ZW5zaW9ucyIsImxhc3RDb2RlIiwic3VwcGxlbWVudCIsImpvaW4iLCJjb2Rlc2V0IiwiZGVjb2RlIiwiYXJyIiwidmFsIiwibCIsInNodWZmbGUiLCJ4IiwiZmxvb3IiLCJyYW5kb20iLCJ0b1BvaW50TGlzdCIsInJvdyIsInJvd3MiLCJ0aHJlc2hvbGQiLCJzY29yZUZ1bmMiLCJxdWV1ZSIsImFwcGx5IiwibWF4SW5kZXgiLCJtYXgiLCJ2ZWMyIiwiY2xvbmUiLCJyZXF1aXJlIiwiSW1hZ2VXcmFwcGVyIiwic2l6ZSIsImRhdGEiLCJBcnJheVR5cGUiLCJpbml0aWFsaXplIiwieSIsIkFycmF5IiwiVWludDhBcnJheSIsImluSW1hZ2VXaXRoQm9yZGVyIiwiaW1nUmVmIiwiYm9yZGVyIiwic2FtcGxlIiwiaW5JbWciLCJseCIsImx5IiwidyIsImJhc2UiLCJhIiwiYiIsImMiLCJkIiwiZSIsImNsZWFyQXJyYXkiLCJhcnJheSIsInN1YkltYWdlIiwiZnJvbSIsInN1YkltYWdlQXNDb3B5IiwiaW1hZ2VXcmFwcGVyIiwic2l6ZVkiLCJzaXplWCIsImNvcHlUbyIsInNyY0RhdGEiLCJkc3REYXRhIiwiZ2V0IiwiZ2V0U2FmZSIsImluZGV4TWFwcGluZyIsInNldCIsInplcm9Cb3JkZXIiLCJ3aWR0aCIsImhlaWdodCIsImludmVydCIsImNvbnZvbHZlIiwia2VybmVsIiwia3giLCJreSIsImtTaXplIiwiYWNjdSIsIm1vbWVudHMiLCJsYWJlbGNvdW50IiwieXNxIiwibGFiZWxzdW0iLCJsYWJlbCIsIm11MTEiLCJtdTAyIiwibXUyMCIsInhfIiwieV8iLCJQSSIsIlBJXzQiLCJtMDAiLCJtMDEiLCJtMTAiLCJtMTEiLCJtMDIiLCJtMjAiLCJ0aGV0YSIsInJhZCIsImlzTmFOIiwiYXRhbiIsInZlYyIsImNvcyIsInNpbiIsInNob3ciLCJjYW52YXMiLCJzY2FsZSIsImN0eCIsImZyYW1lIiwiY3VycmVudCIsInBpeGVsIiwiZ2V0Q29udGV4dCIsImdldEltYWdlRGF0YSIsInB1dEltYWdlRGF0YSIsIm92ZXJsYXkiLCJoc3YiLCJyZ2IiLCJ3aGl0ZVJnYiIsImJsYWNrUmdiIiwiaHN2MnJnYiIsIkNvZGUzOVJlYWRlciIsIkFMUEhBQkVUSF9TVFJJTkciLCJBTFBIQUJFVCIsIkNIQVJBQ1RFUl9FTkNPRElOR1MiLCJBU1RFUklTSyIsImRlY29kZWRDaGFyIiwibGFzdFN0YXJ0IiwibmV4dFN0YXJ0IiwiX3RvUGF0dGVybiIsIl9wYXR0ZXJuVG9DaGFyIiwicG9wIiwicGF0dGVyblNpemUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJfZmluZE5leHRXaWR0aCIsIm1pbldpZHRoIiwibWF4TmFycm93V2lkdGgiLCJudW1XaWRlQmFycyIsIndpZGVCYXJXaWR0aCIsInBhdHRlcm5TdGFydCIsIndoaXRlU3BhY2VNdXN0U3RhcnQiLCJCYXJjb2RlRGVjb2RlciIsImRvdCIsInBvaW50IiwicG9pbnRzIiwiY2VudGVyIiwicG9pbnRNYXAiLCJhZGQiLCJ1cGRhdGVDZW50ZXIiLCJwb2ludFRvQWRkIiwiaWQiLCJmaXRzIiwib3RoZXJQb2ludCIsInNpbWlsYXJpdHkiLCJnZXRQb2ludHMiLCJnZXRDZW50ZXIiLCJjcmVhdGVQb2ludCIsIm5ld1BvaW50IiwicHJvcGVydHkiLCJ2ZWMzIiwiaW1hZ2VSZWYiLCJ0aGF0IiwidG9WZWMyIiwidG9WZWMzIiwicm91bmQiLCJjb21wdXRlSW50ZWdyYWxJbWFnZTIiLCJpbnRlZ3JhbFdyYXBwZXIiLCJpbWFnZURhdGEiLCJpbnRlZ3JhbEltYWdlRGF0YSIsInBvc0EiLCJwb3NCIiwicG9zQyIsInBvc0QiLCJjb21wdXRlSW50ZWdyYWxJbWFnZSIsInYiLCJ1IiwidGhyZXNob2xkSW1hZ2UiLCJ0YXJnZXRXcmFwcGVyIiwidGFyZ2V0RGF0YSIsImNvbXB1dGVIaXN0b2dyYW0iLCJiaXRzUGVyUGl4ZWwiLCJiaXRTaGlmdCIsImJ1Y2tldENudCIsImhpc3QiLCJJbnQzMkFycmF5Iiwic2hhcnBlbkxpbmUiLCJsZWZ0IiwicmlnaHQiLCJkZXRlcm1pbmVPdHN1VGhyZXNob2xkIiwicHgiLCJteCIsImRldGVybWluZVRocmVzaG9sZCIsInZldCIsInAxIiwicDIiLCJwMTIiLCJrIiwibTEiLCJtMiIsIm0xMiIsIm90c3VUaHJlc2hvbGQiLCJjb21wdXRlQmluYXJ5SW1hZ2UiLCJBIiwiQiIsIkMiLCJEIiwiYXZnIiwiY2x1c3RlciIsImNsdXN0ZXJzIiwiYWRkVG9DbHVzdGVyIiwiZm91bmQiLCJDbHVzdGVyMiIsIlRyYWNlciIsInRyYWNlIiwiaXRlcmF0aW9uIiwibWF4SXRlcmF0aW9ucyIsInRvcCIsImNlbnRlclBvcyIsImN1cnJlbnRQb3MiLCJpZHgiLCJmb3J3YXJkIiwidG8iLCJ0b0lkeCIsInByZWRpY3RlZFBvcyIsInRocmVzaG9sZFgiLCJ0aHJlc2hvbGRZIiwibWF0Y2giLCJwb3MiLCJwcmVkaWN0ZWQiLCJESUxBVEUiLCJFUk9ERSIsImRpbGF0ZSIsImluSW1hZ2VXcmFwcGVyIiwib3V0SW1hZ2VXcmFwcGVyIiwiaW5JbWFnZURhdGEiLCJvdXRJbWFnZURhdGEiLCJ5U3RhcnQxIiwieVN0YXJ0MiIsInhTdGFydDEiLCJ4U3RhcnQyIiwiZXJvZGUiLCJzdWJ0cmFjdCIsImFJbWFnZVdyYXBwZXIiLCJiSW1hZ2VXcmFwcGVyIiwicmVzdWx0SW1hZ2VXcmFwcGVyIiwiYUltYWdlRGF0YSIsImJJbWFnZURhdGEiLCJjSW1hZ2VEYXRhIiwiYml0d2lzZU9yIiwiY291bnROb25aZXJvIiwidG9wR2VuZXJpYyIsImxpc3QiLCJtaW5JZHgiLCJtaW4iLCJzY29yZSIsImhpdCIsIml0ZW0iLCJncmF5QXJyYXlGcm9tSW1hZ2UiLCJodG1sSW1hZ2UiLCJvZmZzZXRYIiwiZHJhd0ltYWdlIiwiY3R4RGF0YSIsImNvbXB1dGVHcmF5IiwiZ3JheUFycmF5RnJvbUNvbnRleHQiLCJncmF5QW5kSGFsZlNhbXBsZUZyb21DYW52YXNEYXRhIiwiY2FudmFzRGF0YSIsIm91dEFycmF5IiwidG9wUm93SWR4IiwiYm90dG9tUm93SWR4IiwiZW5kSWR4Iiwib3V0V2lkdGgiLCJvdXRJbWdJZHgiLCJpbldpZHRoIiwic2luZ2xlQ2hhbm5lbCIsImxvYWRJbWFnZUFycmF5Iiwic3JjIiwiY2FsbGJhY2siLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbWciLCJJbWFnZSIsIm9ubG9hZCIsImhhbGZTYW1wbGUiLCJpbkltZ1dyYXBwZXIiLCJvdXRJbWdXcmFwcGVyIiwib3V0SW1nIiwiaCIsInMiLCJtIiwiciIsImciLCJfY29tcHV0ZURpdmlzb3JzIiwibiIsImxhcmdlRGl2aXNvcnMiLCJkaXZpc29ycyIsInNxcnQiLCJjb25jYXQiLCJfY29tcHV0ZUludGVyc2VjdGlvbiIsImFycjEiLCJhcnIyIiwiY2FsY3VsYXRlUGF0Y2hTaXplIiwicGF0Y2hTaXplIiwiaW1nU2l6ZSIsImRpdmlzb3JzWCIsImRpdmlzb3JzWSIsIndpZGVTaWRlIiwiY29tbW9uIiwibnJPZlBhdGNoZXNMaXN0IiwibnJPZlBhdGNoZXNNYXAiLCJuck9mUGF0Y2hlc0lkeCIsIm1lZGl1bSIsIm5yT2ZQYXRjaGVzIiwiZGVzaXJlZFBhdGNoU2l6ZSIsIm9wdGltYWxQYXRjaFNpemUiLCJmaW5kUGF0Y2hTaXplRm9yRGl2aXNvcnMiLCJfcGFyc2VDU1NEaW1lbnNpb25WYWx1ZXMiLCJkaW1lbnNpb24iLCJwYXJzZUZsb2F0IiwidW5pdCIsImluZGV4T2YiLCJfZGltZW5zaW9uc0NvbnZlcnRlcnMiLCJjb250ZXh0IiwiYm90dG9tIiwiY29tcHV0ZUltYWdlQXJlYSIsImlucHV0V2lkdGgiLCJpbnB1dEhlaWdodCIsImFyZWEiLCJwYXJzZWRBcmVhIiwicmVkdWNlIiwicGFyc2VkIiwiY2FsY3VsYXRlZCIsInN4Iiwic3kiLCJzdyIsInNoIiwiU3ViSW1hZ2UiLCJJIiwib3JpZ2luYWxTaXplIiwidXBkYXRlRGF0YSIsImltYWdlIiwidXBkYXRlRnJvbSIsInZlYzJjbG9uZSIsIlJFQURFUlMiLCJjb2RlXzEyOF9yZWFkZXIiLCJlYW5fcmVhZGVyIiwiZWFuXzVfcmVhZGVyIiwiZWFuXzJfcmVhZGVyIiwiZWFuXzhfcmVhZGVyIiwiY29kZV8zOV9yZWFkZXIiLCJjb2RlXzM5X3Zpbl9yZWFkZXIiLCJjb2RhYmFyX3JlYWRlciIsInVwY19yZWFkZXIiLCJ1cGNfZV9yZWFkZXIiLCJpMm9mNV9yZWFkZXIiLCJjb2RlXzkzX3JlYWRlciIsIkNvZGU5M1JlYWRlciIsImlucHV0SW1hZ2VXcmFwcGVyIiwiX2JhcmNvZGVSZWFkZXJzIiwiaW5pdFJlYWRlcnMiLCJyZWFkZXJzIiwicmVhZGVyQ29uZmlnIiwicmVhZGVyIiwiY29uZmlndXJhdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJtYXAiLCJnZXRFeHRlbmRlZExpbmUiLCJhbmdsZSIsImV4dGVuZExpbmUiLCJhbW91bnQiLCJleHRlbnNpb24iLCJjZWlsIiwiZ2V0TGluZSIsImJveCIsInRyeURlY29kZSIsImJhcmNvZGVMaW5lIiwiQnJlc2VuaGFtIiwiZ2V0QmFyY29kZUxpbmUiLCJ0b0JpbmFyeUxpbmUiLCJjb2RlUmVzdWx0IiwidHJ5RGVjb2RlQnJ1dGVGb3JjZSIsImxpbmVBbmdsZSIsInNpZGVMZW5ndGgiLCJwb3ciLCJzbGljZXMiLCJkaXIiLCJ4ZGlyIiwieWRpciIsImdldExpbmVMZW5ndGgiLCJkZWNvZGVGcm9tQm91bmRpbmdCb3giLCJsaW5lTGVuZ3RoIiwiYXRhbjIiLCJzaW5nbGVDb2xvckltYWdlRGF0YSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiU2xvcGUiLCJESVIiLCJVUCIsIkRPV04iLCJ4MCIsInkwIiwieDEiLCJ5MSIsInN0ZWVwIiwiZGVsdGF4IiwiZGVsdGF5IiwieXN0ZXAiLCJyZWFkIiwic2xvcGUiLCJzbG9wZTIiLCJleHRyZW1hIiwiY3VycmVudERpciIsInJUaHJlc2hvbGQiLCJkZWJ1ZyIsInByaW50RnJlcXVlbmN5IiwiYmVnaW5QYXRoIiwic3Ryb2tlU3R5bGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJwcmludFBhdHRlcm4iLCJmaWxsQ29sb3IiLCJmaWxsUmVjdCIsIlR3b09mRml2ZVJlYWRlciIsImJhclNwYWNlUmF0aW8iLCJOIiwiVyIsIndyaXRhYmxlIiwic3RhcnRQYXR0ZXJuTGVuZ3RoIiwibmFycm93QmFyV2lkdGgiLCJub3JtYWxpemVkIiwiY291bnRlckxlbmd0aCIsIl92ZXJpZnlDb3VudGVyTGVuZ3RoIiwiQ29kYWJhclJlYWRlciIsIl9jb3VudGVycyIsIlNUQVJUX0VORCIsIk1JTl9FTkNPREVEX0NIQVJTIiwiTUFYX0FDQ0VQVEFCTEUiLCJQQURESU5HIiwic3RhcnRDb3VudGVyIiwiX2lzU3RhcnRFbmQiLCJfdmVyaWZ5V2hpdGVzcGFjZSIsIl92YWxpZGF0ZVJlc3VsdCIsIl9zdW1Db3VudGVycyIsImVuZENvdW50ZXIiLCJfY2FsY3VsYXRlUGF0dGVybkxlbmd0aCIsIl90aHJlc2hvbGRSZXN1bHRQYXR0ZXJuIiwiY2F0ZWdvcml6YXRpb24iLCJzcGFjZSIsIm5hcnJvdyIsImNvdW50cyIsIndpZGUiLCJiYXIiLCJraW5kIiwiY2F0IiwiX2NoYXJUb1BhdHRlcm4iLCJuZXdraW5kIiwiY2hhciIsImNoYXJDb2RlIiwiY2hhckNvZGVBdCIsInRocmVzaG9sZHMiLCJfY29tcHV0ZUFsdGVybmF0aW5nVGhyZXNob2xkIiwiYmFyVGhyZXNob2xkIiwic3BhY2VUaHJlc2hvbGQiLCJiaXRtYXNrIiwiQ29kZTEyOFJlYWRlciIsIkNPREVfU0hJRlQiLCJDT0RFX0MiLCJDT0RFX0IiLCJDT0RFX0EiLCJTVEFSVF9DT0RFX0EiLCJTVEFSVF9DT0RFX0IiLCJTVEFSVF9DT0RFX0MiLCJTVE9QX0NPREUiLCJNT0RVTEVfSU5ESUNFUyIsIl9jb3JyZWN0IiwiY2FsY3VsYXRlQ29ycmVjdGlvbiIsImRvbmUiLCJtdWx0aXBsaWVyIiwiY2hlY2tzdW0iLCJyYXdSZXN1bHQiLCJzaGlmdE5leHQiLCJyZW1vdmVMYXN0Q2hhcmFjdGVyIiwic3BsaWNlIiwiZXhwZWN0ZWQiLCJzdW1Ob3JtYWxpemVkIiwic3VtRXhwZWN0ZWQiLCJDb2RlMzlWSU5SZWFkZXIiLCJwYXR0ZXJucyIsIklPUSIsIkFaMDkiLCJyZXBsYWNlIiwiX2NoZWNrQ2hlY2tzdW0iLCJzcGxpdCIsIl92ZXJpZnlFbmQiLCJfdmVyaWZ5Q2hlY2tzdW1zIiwic2xpY2UiLCJfZGVjb2RlRXh0ZW5kZWQiLCJjaGFyQXJyYXkiLCJuZXh0Q2hhciIsIm5leHRDaGFyQ29kZSIsIl9tYXRjaENoZWNrQ2hhciIsImluZGV4IiwibWF4V2VpZ2h0IiwiYXJyYXlUb0NoZWNrIiwid2VpZ2h0ZWRTdW1zIiwid2VpZ2h0IiwiY2hlY2tDaGFyIiwiRUFOMlJlYWRlciIsInBhcnNlSW50IiwiRUFONVJlYWRlciIsIkNIRUNLX0RJR0lUX0VOQ09ESU5HUyIsImV4dGVuc2lvbkNoZWNrc3VtIiwiZGV0ZXJtaW5lQ2hlY2tEaWdpdCIsIkVBTjhSZWFkZXIiLCJJMm9mNVJlYWRlciIsIm5vcm1hbGl6ZUJhclNwYWNlV2lkdGgiLCJNQVhfQ09SUkVDVElPTl9GQUNUT1IiLCJjb3VudGVyU3VtIiwiY29kZVN1bSIsImNvcnJlY3Rpb25SYXRpbyIsImNvcnJlY3Rpb25SYXRpb0ludmVyc2UiLCJfZGVjb2RlUGFpciIsImNvdW50ZXJQYWlyIiwiY29kZXMiLCJVUENFUmVhZGVyIiwiX2RldGVybWluZVBhcml0eSIsIm5yU3lzdGVtIiwiX2NvbnZlcnRUb1VQQ0EiLCJ1cGNhIiwibGFzdERpZ2l0IiwiVVBDUmVhZGVyIiwiY2hhckF0Iiwic3Vic3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDUkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQ2hFQTs7QUFFQSxTQUFTQSxhQUFULENBQXVCQyxNQUF2QixFQUErQkMsV0FBL0IsRUFBNEM7QUFDeEMsU0FBS0MsSUFBTCxHQUFZLEVBQVo7QUFDQSxTQUFLRixNQUFMLEdBQWNBLFVBQVUsRUFBeEI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFdBQU8sSUFBUDtBQUNIOztBQUVERixjQUFjSSxTQUFkLENBQXdCQyxVQUF4QixHQUFxQyxVQUFTQyxJQUFULEVBQWVDLEtBQWYsRUFBc0I7QUFDdkQsUUFBSUMsQ0FBSjs7QUFFQSxRQUFJRCxVQUFVRSxTQUFkLEVBQXlCO0FBQ3JCRixnQkFBUSxDQUFSO0FBQ0g7QUFDRCxTQUFLQyxJQUFJRCxLQUFULEVBQWdCQyxJQUFJRixLQUFLSSxNQUF6QixFQUFpQ0YsR0FBakMsRUFBc0M7QUFDbEMsWUFBSSxDQUFDRixLQUFLRSxDQUFMLENBQUwsRUFBYztBQUNWLG1CQUFPQSxDQUFQO0FBQ0g7QUFDSjtBQUNELFdBQU9GLEtBQUtJLE1BQVo7QUFDSCxDQVpEOztBQWNBVixjQUFjSSxTQUFkLENBQXdCTyxhQUF4QixHQUF3QyxVQUFTQyxPQUFULEVBQWtCQyxJQUFsQixFQUF3QkMsY0FBeEIsRUFBd0M7QUFDNUUsUUFBSU4sQ0FBSjtBQUFBLFFBQ0lPLFFBQVEsQ0FEWjtBQUFBLFFBRUlDLGNBQWMsQ0FGbEI7QUFBQSxRQUdJQyxNQUFNLENBSFY7QUFBQSxRQUlJQyxTQUFTLENBSmI7QUFBQSxRQUtJQyxRQUxKO0FBQUEsUUFNSUMsS0FOSjtBQUFBLFFBT0lDLE1BUEo7O0FBU0FQLHFCQUFpQkEsa0JBQWtCLEtBQUtRLGlCQUF2QixJQUE0QyxDQUE3RDs7QUFFQSxTQUFLZCxJQUFJLENBQVQsRUFBWUEsSUFBSUksUUFBUUYsTUFBeEIsRUFBZ0NGLEdBQWhDLEVBQXFDO0FBQ2pDUyxlQUFPTCxRQUFRSixDQUFSLENBQVA7QUFDQVUsa0JBQVVMLEtBQUtMLENBQUwsQ0FBVjtBQUNIO0FBQ0QsUUFBSVMsTUFBTUMsTUFBVixFQUFrQjtBQUNkLGVBQU9LLE9BQU9DLFNBQWQ7QUFDSDtBQUNETCxlQUFXRixNQUFNQyxNQUFqQjtBQUNBSixzQkFBa0JLLFFBQWxCOztBQUVBLFNBQUtYLElBQUksQ0FBVCxFQUFZQSxJQUFJSSxRQUFRRixNQUF4QixFQUFnQ0YsR0FBaEMsRUFBcUM7QUFDakNZLGdCQUFRUixRQUFRSixDQUFSLENBQVI7QUFDQWEsaUJBQVNSLEtBQUtMLENBQUwsSUFBVVcsUUFBbkI7QUFDQUgsc0JBQWNTLEtBQUtDLEdBQUwsQ0FBU04sUUFBUUMsTUFBakIsSUFBMkJBLE1BQXpDO0FBQ0EsWUFBSUwsY0FBY0YsY0FBbEIsRUFBa0M7QUFDOUIsbUJBQU9TLE9BQU9DLFNBQWQ7QUFDSDtBQUNEVCxpQkFBU0MsV0FBVDtBQUNIO0FBQ0QsV0FBT0QsUUFBUUcsTUFBZjtBQUNILENBaENEOztBQWtDQWxCLGNBQWNJLFNBQWQsQ0FBd0J1QixRQUF4QixHQUFtQyxVQUFTckIsSUFBVCxFQUFlc0IsTUFBZixFQUF1QjtBQUN0RCxRQUFJcEIsQ0FBSjs7QUFFQW9CLGFBQVNBLFVBQVUsQ0FBbkI7QUFDQSxTQUFLcEIsSUFBSW9CLE1BQVQsRUFBaUJwQixJQUFJRixLQUFLSSxNQUExQixFQUFrQ0YsR0FBbEMsRUFBdUM7QUFDbkMsWUFBSUYsS0FBS0UsQ0FBTCxDQUFKLEVBQWE7QUFDVCxtQkFBT0EsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPRixLQUFLSSxNQUFaO0FBQ0gsQ0FWRDs7QUFZQVYsY0FBY0ksU0FBZCxDQUF3QnlCLFlBQXhCLEdBQXVDLFVBQVNqQixPQUFULEVBQWtCa0IsVUFBbEIsRUFBOEJDLE9BQTlCLEVBQXVDO0FBQzFFLFFBQUlyQixTQUFTcUIsUUFBUXJCLE1BQXJCO0FBQUEsUUFDSXNCLE1BQU0sQ0FEVjtBQUVBLFdBQU10QixRQUFOLEVBQWdCO0FBQ1pzQixjQUFNcEIsUUFBUW1CLFFBQVFyQixNQUFSLENBQVIsS0FBNEIsSUFBSyxDQUFDLElBQUlvQixVQUFMLElBQW1CLENBQXBELENBQU47QUFDQSxZQUFJRSxNQUFNLENBQVYsRUFBYTtBQUNUcEIsb0JBQVFtQixRQUFRckIsTUFBUixDQUFSLElBQTJCc0IsR0FBM0I7QUFDSDtBQUNKO0FBQ0osQ0FURDs7QUFXQWhDLGNBQWNJLFNBQWQsQ0FBd0I2QixXQUF4QixHQUFzQyxVQUFTQyxVQUFULEVBQXFCQyxPQUFyQixFQUE4QjtBQUNoRSxRQUFJdkIsVUFBVSxFQUFkO0FBQUEsUUFDSUosQ0FESjtBQUFBLFFBRUk0QixPQUFPLElBRlg7QUFBQSxRQUdJUixTQUFTUSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixDQUhiO0FBQUEsUUFJSWtDLFVBQVUsQ0FBQ0QsS0FBS2pDLElBQUwsQ0FBVXlCLE1BQVYsQ0FKZjtBQUFBLFFBS0lVLGFBQWEsQ0FMakI7QUFBQSxRQU1JQyxZQUFZO0FBQ1J4QixlQUFPUSxPQUFPQyxTQUROO0FBRVJYLGNBQU0sQ0FBQyxDQUZDO0FBR1JOLGVBQU87QUFIQyxLQU5oQjtBQUFBLFFBV0lRLEtBWEo7O0FBYUEsUUFBSW1CLFVBQUosRUFBZ0I7QUFDWixhQUFNMUIsSUFBSSxDQUFWLEVBQWFBLElBQUkwQixXQUFXeEIsTUFBNUIsRUFBb0NGLEdBQXBDLEVBQXlDO0FBQ3JDSSxvQkFBUTRCLElBQVIsQ0FBYSxDQUFiO0FBQ0g7QUFDRCxhQUFNaEMsSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLGdCQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJ6Qix3QkFBUTBCLFVBQVI7QUFDSCxhQUZELE1BRU87QUFDSCxvQkFBSUEsZUFBZTFCLFFBQVFGLE1BQVIsR0FBaUIsQ0FBcEMsRUFBdUM7QUFDbkNLLDRCQUFRcUIsS0FBS3pCLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCc0IsVUFBNUIsQ0FBUjs7QUFFQSx3QkFBSW5CLFFBQVFvQixPQUFaLEVBQXFCO0FBQ2pCSSxrQ0FBVWhDLEtBQVYsR0FBa0JDLElBQUlvQixNQUF0QjtBQUNBVyxrQ0FBVUUsR0FBVixHQUFnQmpDLENBQWhCO0FBQ0ErQixrQ0FBVTNCLE9BQVYsR0FBb0JBLE9BQXBCO0FBQ0EsK0JBQU8yQixTQUFQO0FBQ0gscUJBTEQsTUFLTztBQUNILCtCQUFPLElBQVA7QUFDSDtBQUNKLGlCQVhELE1BV087QUFDSEQ7QUFDSDtBQUNEMUIsd0JBQVEwQixVQUFSLElBQXNCLENBQXRCO0FBQ0FELDBCQUFVLENBQUNBLE9BQVg7QUFDSDtBQUNKO0FBQ0osS0ExQkQsTUEwQk87QUFDSHpCLGdCQUFRNEIsSUFBUixDQUFhLENBQWI7QUFDQSxhQUFNaEMsSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLGdCQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJ6Qix3QkFBUTBCLFVBQVI7QUFDSCxhQUZELE1BRU87QUFDSEE7QUFDQTFCLHdCQUFRNEIsSUFBUixDQUFhLENBQWI7QUFDQTVCLHdCQUFRMEIsVUFBUixJQUFzQixDQUF0QjtBQUNBRCwwQkFBVSxDQUFDQSxPQUFYO0FBQ0g7QUFDSjtBQUNKOztBQUVEO0FBQ0FFLGNBQVVoQyxLQUFWLEdBQWtCcUIsTUFBbEI7QUFDQVcsY0FBVUUsR0FBVixHQUFnQkwsS0FBS2pDLElBQUwsQ0FBVU8sTUFBVixHQUFtQixDQUFuQztBQUNBNkIsY0FBVTNCLE9BQVYsR0FBb0JBLE9BQXBCO0FBQ0EsV0FBTzJCLFNBQVA7QUFDSCxDQTNERDs7QUE2REF2QyxjQUFjSSxTQUFkLENBQXdCc0MsYUFBeEIsR0FBd0MsVUFBU0MsT0FBVCxFQUFrQjtBQUN0RCxRQUFJUCxPQUFPLElBQVg7QUFBQSxRQUNJUSxNQURKOztBQUdBUixTQUFLakMsSUFBTCxHQUFZd0MsT0FBWjtBQUNBQyxhQUFTUixLQUFLUyxPQUFMLEVBQVQ7QUFDQSxRQUFJRCxXQUFXLElBQWYsRUFBcUI7QUFDakJSLGFBQUtqQyxJQUFMLENBQVUyQyxPQUFWO0FBQ0FGLGlCQUFTUixLQUFLUyxPQUFMLEVBQVQ7QUFDQSxZQUFJRCxNQUFKLEVBQVk7QUFDUkEsbUJBQU9HLFNBQVAsR0FBbUIvQyxjQUFjZ0QsU0FBZCxDQUF3QkMsT0FBM0M7QUFDQUwsbUJBQU9yQyxLQUFQLEdBQWU2QixLQUFLakMsSUFBTCxDQUFVTyxNQUFWLEdBQW1Ca0MsT0FBT3JDLEtBQXpDO0FBQ0FxQyxtQkFBT0gsR0FBUCxHQUFhTCxLQUFLakMsSUFBTCxDQUFVTyxNQUFWLEdBQW1Ca0MsT0FBT0gsR0FBdkM7QUFDSDtBQUNKLEtBUkQsTUFRTztBQUNIRyxlQUFPRyxTQUFQLEdBQW1CL0MsY0FBY2dELFNBQWQsQ0FBd0JFLE9BQTNDO0FBQ0g7QUFDRCxRQUFJTixNQUFKLEVBQVk7QUFDUkEsZUFBT08sTUFBUCxHQUFnQmYsS0FBS2dCLE1BQXJCO0FBQ0g7QUFDRCxXQUFPUixNQUFQO0FBQ0gsQ0FyQkQ7O0FBdUJBNUMsY0FBY0ksU0FBZCxDQUF3QmlELFdBQXhCLEdBQXNDLFVBQVM5QyxLQUFULEVBQWdCa0MsR0FBaEIsRUFBcUJhLEtBQXJCLEVBQTRCO0FBQzlELFFBQUk5QyxDQUFKOztBQUVBRCxZQUFRQSxRQUFRLENBQVIsR0FBWSxDQUFaLEdBQWdCQSxLQUF4QjtBQUNBLFNBQUtDLElBQUlELEtBQVQsRUFBZ0JDLElBQUlpQyxHQUFwQixFQUF5QmpDLEdBQXpCLEVBQThCO0FBQzFCLFlBQUksS0FBS0wsSUFBTCxDQUFVSyxDQUFWLE1BQWlCOEMsS0FBckIsRUFBNEI7QUFDeEIsbUJBQU8sS0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQVZEOztBQVlBdEQsY0FBY0ksU0FBZCxDQUF3Qm1ELGFBQXhCLEdBQXdDLFVBQVMzQixNQUFULEVBQWlCYSxHQUFqQixFQUFzQkosT0FBdEIsRUFBK0I7QUFDbkUsUUFBSUQsT0FBTyxJQUFYO0FBQUEsUUFDSUUsYUFBYSxDQURqQjtBQUFBLFFBRUk5QixDQUZKO0FBQUEsUUFHSWdELFdBQVcsRUFIZjs7QUFLQW5CLGNBQVcsT0FBT0EsT0FBUCxLQUFtQixXQUFwQixHQUFtQ0EsT0FBbkMsR0FBNkMsSUFBdkQ7QUFDQVQsYUFBVSxPQUFPQSxNQUFQLEtBQWtCLFdBQW5CLEdBQWtDQSxNQUFsQyxHQUEyQ1EsS0FBSy9CLFVBQUwsQ0FBZ0IrQixLQUFLakMsSUFBckIsQ0FBcEQ7QUFDQXNDLFVBQU1BLE9BQU9MLEtBQUtqQyxJQUFMLENBQVVPLE1BQXZCOztBQUVBOEMsYUFBU2xCLFVBQVQsSUFBdUIsQ0FBdkI7QUFDQSxTQUFLOUIsSUFBSW9CLE1BQVQsRUFBaUJwQixJQUFJaUMsR0FBckIsRUFBMEJqQyxHQUExQixFQUErQjtBQUMzQixZQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJtQixxQkFBU2xCLFVBQVQ7QUFDSCxTQUZELE1BRU87QUFDSEE7QUFDQWtCLHFCQUFTbEIsVUFBVCxJQUF1QixDQUF2QjtBQUNBRCxzQkFBVSxDQUFDQSxPQUFYO0FBQ0g7QUFDSjtBQUNELFdBQU9tQixRQUFQO0FBQ0gsQ0FyQkQ7O0FBdUJBeEQsY0FBY0ksU0FBZCxDQUF3QnFELFdBQXhCLEdBQXNDLFVBQVNsRCxLQUFULEVBQWdCSyxPQUFoQixFQUF5QjtBQUMzRCxRQUFJd0IsT0FBTyxJQUFYO0FBQUEsUUFDSXNCLGNBQWM5QyxRQUFRRixNQUQxQjtBQUFBLFFBRUkrQixNQUFNTCxLQUFLakMsSUFBTCxDQUFVTyxNQUZwQjtBQUFBLFFBR0kyQixVQUFVLENBQUNELEtBQUtqQyxJQUFMLENBQVVJLEtBQVYsQ0FIZjtBQUFBLFFBSUlDLENBSko7QUFBQSxRQUtJOEIsYUFBYSxDQUxqQjs7QUFPQXFCLElBQUEscUVBQUFBLENBQVlDLElBQVosQ0FBaUJoRCxPQUFqQixFQUEwQixDQUExQjs7QUFFQSxTQUFNSixJQUFJRCxLQUFWLEVBQWlCQyxJQUFJaUMsR0FBckIsRUFBMEJqQyxHQUExQixFQUErQjtBQUMzQixZQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJ6QixvQkFBUTBCLFVBQVI7QUFDSCxTQUZELE1BRU87QUFDSEE7QUFDQSxnQkFBSUEsZUFBZW9CLFdBQW5CLEVBQWdDO0FBQzVCO0FBQ0gsYUFGRCxNQUVPO0FBQ0g5Qyx3QkFBUTBCLFVBQVIsSUFBc0IsQ0FBdEI7QUFDQUQsMEJBQVUsQ0FBQ0EsT0FBWDtBQUNIO0FBQ0o7QUFDSjs7QUFFRCxXQUFPekIsT0FBUDtBQUNILENBekJEOztBQTJCQWlELE9BQU9DLGNBQVAsQ0FBc0I5RCxjQUFjSSxTQUFwQyxFQUErQyxRQUEvQyxFQUF5RDtBQUNyRGtELFdBQU8sU0FEOEM7QUFFckRTLGVBQVc7QUFGMEMsQ0FBekQ7O0FBS0EvRCxjQUFjZ0QsU0FBZCxHQUEwQjtBQUN0QkUsYUFBUyxDQURhO0FBRXRCRCxhQUFTLENBQUM7QUFGWSxDQUExQjs7QUFLQWpELGNBQWNnRSxTQUFkLEdBQTBCO0FBQ3RCQyw0QkFBd0IsMkJBREY7QUFFdEJDLDJCQUF1QiwwQkFGRDtBQUd0QkMsOEJBQTBCO0FBSEosQ0FBMUI7O0FBTUFuRSxjQUFjb0UsV0FBZCxHQUE0QixFQUE1Qjs7QUFFQSx5REFBZXBFLGFBQWYsRTs7Ozs7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0FDOUJBOzs7QUFHQSxTQUFTcUUsU0FBVCxDQUFtQkMsSUFBbkIsRUFBeUJwRSxXQUF6QixFQUFzQztBQUNsQ29FLFdBQU8scURBQU1DLGlCQUFOLEVBQXlCRCxJQUF6QixDQUFQO0FBQ0F0RSxJQUFBLGdFQUFBQSxDQUFjd0UsSUFBZCxDQUFtQixJQUFuQixFQUF5QkYsSUFBekIsRUFBK0JwRSxXQUEvQjtBQUNIOztBQUVELFNBQVNxRSxlQUFULEdBQTJCO0FBQ3ZCLFFBQUl0RSxTQUFTLEVBQWI7O0FBRUE0RCxXQUFPWSxJQUFQLENBQVlKLFVBQVVELFdBQXRCLEVBQW1DTSxPQUFuQyxDQUEyQyxVQUFTQyxHQUFULEVBQWM7QUFDckQxRSxlQUFPMEUsR0FBUCxJQUFjTixVQUFVRCxXQUFWLENBQXNCTyxHQUF0QixFQUEyQkMsT0FBekM7QUFDSCxLQUZEO0FBR0EsV0FBTzNFLE1BQVA7QUFDSDs7QUFFRCxJQUFJNEUsYUFBYTtBQUNiQyxrQkFBYyxFQUFDeEIsT0FBTyxDQUFSLEVBREQ7QUFFYnlCLGtCQUFjLEVBQUN6QixPQUFPLEVBQVIsRUFGRDtBQUdiMEIsbUJBQWUsRUFBQzFCLE9BQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBUixFQUhGO0FBSWIyQixrQkFBYyxFQUFDM0IsT0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFSLEVBSkQ7QUFLYjRCLG9CQUFnQixFQUFDNUIsT0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQVIsRUFMSDtBQU1iNkIsNkJBQXlCLEVBQUM3QixPQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQVIsRUFOWjtBQU9iOEIsa0JBQWMsRUFBQzlCLE9BQU8sQ0FDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBRGtCLEVBRWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUZrQixFQUdsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FIa0IsRUFJbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBSmtCLEVBS2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUxrQixFQU1sQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FOa0IsRUFPbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBUGtCLEVBUWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQVJrQixFQVNsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FUa0IsRUFVbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBVmtCLEVBV2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQVhrQixFQVlsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0Faa0IsRUFhbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBYmtCLEVBY2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQWRrQixFQWVsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0Fma0IsRUFnQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQWhCa0IsRUFpQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQWpCa0IsRUFrQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQWxCa0IsRUFtQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQW5Ca0IsRUFvQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQXBCa0IsQ0FBUixFQVBEO0FBNkJiK0Isb0JBQWdCLEVBQUMvQixPQUFPLENBQUMsQ0FBRCxFQUFJLEVBQUosRUFBUSxFQUFSLEVBQVksRUFBWixFQUFnQixFQUFoQixFQUFvQixFQUFwQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxFQUFoQyxFQUFvQyxFQUFwQyxDQUFSLEVBN0JIO0FBOEJiaEMsdUJBQW1CLEVBQUNnQyxPQUFPLElBQVIsRUE5Qk47QUErQmJnQyxvQkFBZ0IsRUFBQ2hDLE9BQU8sSUFBUixFQS9CSDtBQWdDYkYsWUFBUSxFQUFDRSxPQUFPLFFBQVIsRUFBa0JTLFdBQVcsS0FBN0I7QUFoQ0ssQ0FBakI7O0FBbUNBTSxVQUFVakUsU0FBVixHQUFzQnlELE9BQU8wQixNQUFQLENBQWMsZ0VBQUF2RixDQUFjSSxTQUE1QixFQUF1Q3lFLFVBQXZDLENBQXRCO0FBQ0FSLFVBQVVqRSxTQUFWLENBQW9Cb0YsV0FBcEIsR0FBa0NuQixTQUFsQzs7QUFFQUEsVUFBVWpFLFNBQVYsQ0FBb0JxRixXQUFwQixHQUFrQyxVQUFTbEYsS0FBVCxFQUFnQm1GLFNBQWhCLEVBQTJCO0FBQ3pELFFBQUk5RSxVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFkO0FBQUEsUUFDSUosQ0FESjtBQUFBLFFBRUk0QixPQUFPLElBRlg7QUFBQSxRQUdJUixTQUFTckIsS0FIYjtBQUFBLFFBSUk4QixVQUFVLENBQUNELEtBQUtqQyxJQUFMLENBQVV5QixNQUFWLENBSmY7QUFBQSxRQUtJVSxhQUFhLENBTGpCO0FBQUEsUUFNSUMsWUFBWTtBQUNSeEIsZUFBT1EsT0FBT0MsU0FETjtBQUVSWCxjQUFNLENBQUMsQ0FGQztBQUdSTixlQUFPQSxLQUhDO0FBSVJrQyxhQUFLbEM7QUFKRyxLQU5oQjtBQUFBLFFBWUlNLElBWko7QUFBQSxRQWFJRSxLQWJKOztBQWVBLFFBQUksQ0FBQzJFLFNBQUwsRUFBZ0I7QUFDWkEsb0JBQVl0RCxLQUFLZ0QsWUFBTCxDQUFrQjFFLE1BQTlCO0FBQ0g7O0FBRUQsU0FBTUYsSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLFlBQUk0QixLQUFLakMsSUFBTCxDQUFVSyxDQUFWLElBQWU2QixPQUFuQixFQUE0QjtBQUN4QnpCLG9CQUFRMEIsVUFBUjtBQUNILFNBRkQsTUFFTztBQUNILGdCQUFJQSxlQUFlMUIsUUFBUUYsTUFBUixHQUFpQixDQUFwQyxFQUF1QztBQUNuQyxxQkFBS0csT0FBTyxDQUFaLEVBQWVBLE9BQU82RSxTQUF0QixFQUFpQzdFLE1BQWpDLEVBQXlDO0FBQ3JDRSw0QkFBUXFCLEtBQUt6QixhQUFMLENBQW1CQyxPQUFuQixFQUE0QndCLEtBQUtnRCxZQUFMLENBQWtCdkUsSUFBbEIsQ0FBNUIsQ0FBUjtBQUNBLHdCQUFJRSxRQUFRd0IsVUFBVXhCLEtBQXRCLEVBQTZCO0FBQ3pCd0Isa0NBQVUxQixJQUFWLEdBQWlCQSxJQUFqQjtBQUNBMEIsa0NBQVV4QixLQUFWLEdBQWtCQSxLQUFsQjtBQUNIO0FBQ0o7QUFDRHdCLDBCQUFVRSxHQUFWLEdBQWdCakMsQ0FBaEI7QUFDQSxvQkFBSStCLFVBQVV4QixLQUFWLEdBQWtCcUIsS0FBS2tELGNBQTNCLEVBQTJDO0FBQ3ZDLDJCQUFPLElBQVA7QUFDSDtBQUNELHVCQUFPL0MsU0FBUDtBQUNILGFBYkQsTUFhTztBQUNIRDtBQUNIO0FBQ0QxQixvQkFBUTBCLFVBQVIsSUFBc0IsQ0FBdEI7QUFDQUQsc0JBQVUsQ0FBQ0EsT0FBWDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQTdDRDs7QUErQ0FnQyxVQUFVakUsU0FBVixDQUFvQnVGLFlBQXBCLEdBQW1DLFVBQVNoRCxPQUFULEVBQWtCZixNQUFsQixFQUEwQlMsT0FBMUIsRUFBbUN1RCxTQUFuQyxFQUE4Q3pELE9BQTlDLEVBQXVEO0FBQ3RGLFFBQUl2QixVQUFVLEVBQWQ7QUFBQSxRQUNJd0IsT0FBTyxJQURYO0FBQUEsUUFFSTVCLENBRko7QUFBQSxRQUdJOEIsYUFBYSxDQUhqQjtBQUFBLFFBSUlDLFlBQVk7QUFDUnhCLGVBQU9RLE9BQU9DLFNBRE47QUFFUlgsY0FBTSxDQUFDLENBRkM7QUFHUk4sZUFBTyxDQUhDO0FBSVJrQyxhQUFLO0FBSkcsS0FKaEI7QUFBQSxRQVVJMUIsS0FWSjtBQUFBLFFBV0k4RSxDQVhKO0FBQUEsUUFZSTVFLEdBWko7O0FBY0EsUUFBSSxDQUFDVyxNQUFMLEVBQWE7QUFDVEEsaUJBQVNRLEtBQUtULFFBQUwsQ0FBY1MsS0FBS2pDLElBQW5CLENBQVQ7QUFDSDs7QUFFRCxRQUFJa0MsWUFBWTVCLFNBQWhCLEVBQTJCO0FBQ3ZCNEIsa0JBQVUsS0FBVjtBQUNIOztBQUVELFFBQUl1RCxjQUFjbkYsU0FBbEIsRUFBNkI7QUFDekJtRixvQkFBWSxJQUFaO0FBQ0g7O0FBRUQsUUFBS3pELFlBQVkxQixTQUFqQixFQUE0QjtBQUN4QjBCLGtCQUFVQyxLQUFLa0QsY0FBZjtBQUNIOztBQUVELFNBQU05RSxJQUFJLENBQVYsRUFBYUEsSUFBSW1DLFFBQVFqQyxNQUF6QixFQUFpQ0YsR0FBakMsRUFBc0M7QUFDbENJLGdCQUFRSixDQUFSLElBQWEsQ0FBYjtBQUNIOztBQUVELFNBQU1BLElBQUlvQixNQUFWLEVBQWtCcEIsSUFBSTRCLEtBQUtqQyxJQUFMLENBQVVPLE1BQWhDLEVBQXdDRixHQUF4QyxFQUE2QztBQUN6QyxZQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJ6QixvQkFBUTBCLFVBQVI7QUFDSCxTQUZELE1BRU87QUFDSCxnQkFBSUEsZUFBZTFCLFFBQVFGLE1BQVIsR0FBaUIsQ0FBcEMsRUFBdUM7QUFDbkNPLHNCQUFNLENBQU47QUFDQSxxQkFBTTRFLElBQUksQ0FBVixFQUFhQSxJQUFJakYsUUFBUUYsTUFBekIsRUFBaUNtRixHQUFqQyxFQUFzQztBQUNsQzVFLDJCQUFPTCxRQUFRaUYsQ0FBUixDQUFQO0FBQ0g7QUFDRDlFLHdCQUFRcUIsS0FBS3pCLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCK0IsT0FBNUIsQ0FBUjs7QUFFQSxvQkFBSTVCLFFBQVFvQixPQUFaLEVBQXFCO0FBQ2pCSSw4QkFBVXhCLEtBQVYsR0FBa0JBLEtBQWxCO0FBQ0F3Qiw4QkFBVWhDLEtBQVYsR0FBa0JDLElBQUlTLEdBQXRCO0FBQ0FzQiw4QkFBVUUsR0FBVixHQUFnQmpDLENBQWhCO0FBQ0EsMkJBQU8rQixTQUFQO0FBQ0g7QUFDRCxvQkFBSXFELFNBQUosRUFBZTtBQUNYLHlCQUFNQyxJQUFJLENBQVYsRUFBYUEsSUFBSWpGLFFBQVFGLE1BQVIsR0FBaUIsQ0FBbEMsRUFBcUNtRixHQUFyQyxFQUEwQztBQUN0Q2pGLGdDQUFRaUYsQ0FBUixJQUFhakYsUUFBUWlGLElBQUksQ0FBWixDQUFiO0FBQ0g7QUFDRGpGLDRCQUFRQSxRQUFRRixNQUFSLEdBQWlCLENBQXpCLElBQThCLENBQTlCO0FBQ0FFLDRCQUFRQSxRQUFRRixNQUFSLEdBQWlCLENBQXpCLElBQThCLENBQTlCO0FBQ0E0QjtBQUNILGlCQVBELE1BT087QUFDSCwyQkFBTyxJQUFQO0FBQ0g7QUFDSixhQXZCRCxNQXVCTztBQUNIQTtBQUNIO0FBQ0QxQixvQkFBUTBCLFVBQVIsSUFBc0IsQ0FBdEI7QUFDQUQsc0JBQVUsQ0FBQ0EsT0FBWDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQXRFRDs7QUF3RUFnQyxVQUFVakUsU0FBVixDQUFvQjBGLFVBQXBCLEdBQWlDLFlBQVc7QUFDeEMsUUFBSTFELE9BQU8sSUFBWDtBQUFBLFFBQ0kyRCxzQkFESjtBQUFBLFFBRUluRSxTQUFTUSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixDQUZiO0FBQUEsUUFHSTZGLFNBSEo7O0FBS0EsV0FBTyxDQUFDQSxTQUFSLEVBQW1CO0FBQ2ZBLG9CQUFZNUQsS0FBS3VELFlBQUwsQ0FBa0J2RCxLQUFLNEMsYUFBdkIsRUFBc0NwRCxNQUF0QyxDQUFaO0FBQ0EsWUFBSSxDQUFDb0UsU0FBTCxFQUFnQjtBQUNaLG1CQUFPLElBQVA7QUFDSDtBQUNERCxpQ0FBeUJDLFVBQVV6RixLQUFWLElBQW1CeUYsVUFBVXZELEdBQVYsR0FBZ0J1RCxVQUFVekYsS0FBN0MsQ0FBekI7QUFDQSxZQUFJd0YsMEJBQTBCLENBQTlCLEVBQWlDO0FBQzdCLGdCQUFJM0QsS0FBS2lCLFdBQUwsQ0FBaUIwQyxzQkFBakIsRUFBeUNDLFVBQVV6RixLQUFuRCxFQUEwRCxDQUExRCxDQUFKLEVBQWtFO0FBQzlELHVCQUFPeUYsU0FBUDtBQUNIO0FBQ0o7QUFDRHBFLGlCQUFTb0UsVUFBVXZELEdBQW5CO0FBQ0F1RCxvQkFBWSxJQUFaO0FBQ0g7QUFDSixDQXBCRDs7QUFzQkEzQixVQUFVakUsU0FBVixDQUFvQjZGLHlCQUFwQixHQUFnRCxVQUFTQyxPQUFULEVBQWtCO0FBQzlELFFBQUk5RCxPQUFPLElBQVg7QUFBQSxRQUNJK0QscUJBREo7O0FBR0FBLDRCQUF3QkQsUUFBUXpELEdBQVIsSUFBZXlELFFBQVF6RCxHQUFSLEdBQWN5RCxRQUFRM0YsS0FBckMsQ0FBeEI7QUFDQSxRQUFJNEYsd0JBQXdCL0QsS0FBS2pDLElBQUwsQ0FBVU8sTUFBdEMsRUFBOEM7QUFDMUMsWUFBSTBCLEtBQUtpQixXQUFMLENBQWlCNkMsUUFBUXpELEdBQXpCLEVBQThCMEQscUJBQTlCLEVBQXFELENBQXJELENBQUosRUFBNkQ7QUFDekQsbUJBQU9ELE9BQVA7QUFDSDtBQUNKO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0FYRDs7QUFhQTdCLFVBQVVqRSxTQUFWLENBQW9CZ0csUUFBcEIsR0FBK0IsVUFBU3hFLE1BQVQsRUFBaUJTLE9BQWpCLEVBQTBCO0FBQ3JELFFBQUlELE9BQU8sSUFBWDtBQUFBLFFBQ0k4RCxVQUFVOUQsS0FBS3VELFlBQUwsQ0FBa0J2RCxLQUFLNkMsWUFBdkIsRUFBcUNyRCxNQUFyQyxFQUE2Q1MsT0FBN0MsRUFBc0QsS0FBdEQsQ0FEZDs7QUFHQSxXQUFPNkQsWUFBWSxJQUFaLEdBQW1COUQsS0FBSzZELHlCQUFMLENBQStCQyxPQUEvQixDQUFuQixHQUE2RCxJQUFwRTtBQUNILENBTEQ7O0FBT0E3QixVQUFVakUsU0FBVixDQUFvQmlHLG9CQUFwQixHQUEyQyxVQUFTQyxhQUFULEVBQXdCO0FBQy9ELFFBQUk5RixDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDs7QUFHQSxTQUFNNUIsSUFBSSxDQUFWLEVBQWFBLElBQUk0QixLQUFLaUQsY0FBTCxDQUFvQjNFLE1BQXJDLEVBQTZDRixHQUE3QyxFQUFrRDtBQUM5QyxZQUFJOEYsa0JBQWtCbEUsS0FBS2lELGNBQUwsQ0FBb0I3RSxDQUFwQixDQUF0QixFQUE4QztBQUMxQyxtQkFBT0EsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQVZEOztBQVlBNkQsVUFBVWpFLFNBQVYsQ0FBb0JtRyxjQUFwQixHQUFxQyxVQUFTMUYsSUFBVCxFQUFlK0IsTUFBZixFQUF1QjRELFlBQXZCLEVBQXFDO0FBQ3RFLFFBQUloRyxDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDtBQUFBLFFBRUlrRSxnQkFBZ0IsR0FGcEI7QUFBQSxRQUdJRyxVQUhKOztBQUtBLFNBQU1qRyxJQUFJLENBQVYsRUFBYUEsSUFBSSxDQUFqQixFQUFvQkEsR0FBcEIsRUFBeUI7QUFDckJLLGVBQU91QixLQUFLcUQsV0FBTCxDQUFpQjVFLEtBQUs0QixHQUF0QixDQUFQO0FBQ0EsWUFBSSxDQUFDNUIsSUFBTCxFQUFXO0FBQ1AsbUJBQU8sSUFBUDtBQUNIO0FBQ0QsWUFBSUEsS0FBS0EsSUFBTCxJQUFhdUIsS0FBSzJDLFlBQXRCLEVBQW9DO0FBQ2hDbEUsaUJBQUtBLElBQUwsR0FBWUEsS0FBS0EsSUFBTCxHQUFZdUIsS0FBSzJDLFlBQTdCO0FBQ0F1Qiw2QkFBaUIsS0FBTSxJQUFJOUYsQ0FBM0I7QUFDSCxTQUhELE1BR087QUFDSDhGLDZCQUFpQixLQUFNLElBQUk5RixDQUEzQjtBQUNIO0FBQ0RvQyxlQUFPSixJQUFQLENBQVkzQixLQUFLQSxJQUFqQjtBQUNBMkYscUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDSDs7QUFFRDRGLGlCQUFhckUsS0FBS2lFLG9CQUFMLENBQTBCQyxhQUExQixDQUFiO0FBQ0EsUUFBSUcsZUFBZSxJQUFuQixFQUF5QjtBQUNyQixlQUFPLElBQVA7QUFDSDtBQUNEN0QsV0FBTzhELE9BQVAsQ0FBZUQsVUFBZjs7QUFFQTVGLFdBQU91QixLQUFLdUQsWUFBTCxDQUFrQnZELEtBQUs4QyxjQUF2QixFQUF1Q3JFLEtBQUs0QixHQUE1QyxFQUFpRCxJQUFqRCxFQUF1RCxLQUF2RCxDQUFQO0FBQ0EsUUFBSTVCLFNBQVMsSUFBYixFQUFtQjtBQUNmLGVBQU8sSUFBUDtBQUNIO0FBQ0QyRixpQkFBYWhFLElBQWIsQ0FBa0IzQixJQUFsQjs7QUFFQSxTQUFNTCxJQUFJLENBQVYsRUFBYUEsSUFBSSxDQUFqQixFQUFvQkEsR0FBcEIsRUFBeUI7QUFDckJLLGVBQU91QixLQUFLcUQsV0FBTCxDQUFpQjVFLEtBQUs0QixHQUF0QixFQUEyQkwsS0FBSzJDLFlBQWhDLENBQVA7QUFDQSxZQUFJLENBQUNsRSxJQUFMLEVBQVc7QUFDUCxtQkFBTyxJQUFQO0FBQ0g7QUFDRDJGLHFCQUFhaEUsSUFBYixDQUFrQjNCLElBQWxCO0FBQ0ErQixlQUFPSixJQUFQLENBQVkzQixLQUFLQSxJQUFqQjtBQUNIOztBQUVELFdBQU9BLElBQVA7QUFDSCxDQTNDRDs7QUE2Q0F3RCxVQUFVakUsU0FBVixDQUFvQnlDLE9BQXBCLEdBQThCLFlBQVc7QUFDckMsUUFBSW1ELFNBQUo7QUFBQSxRQUNJNUQsT0FBTyxJQURYO0FBQUEsUUFFSXZCLElBRko7QUFBQSxRQUdJK0IsU0FBUyxFQUhiO0FBQUEsUUFJSTRELGVBQWUsRUFKbkI7QUFBQSxRQUtJRyxhQUFhLEVBTGpCOztBQU9BWCxnQkFBWTVELEtBQUswRCxVQUFMLEVBQVo7QUFDQSxRQUFJLENBQUNFLFNBQUwsRUFBZ0I7QUFDWixlQUFPLElBQVA7QUFDSDtBQUNEbkYsV0FBTztBQUNIQSxjQUFNbUYsVUFBVW5GLElBRGI7QUFFSE4sZUFBT3lGLFVBQVV6RixLQUZkO0FBR0hrQyxhQUFLdUQsVUFBVXZEO0FBSFosS0FBUDtBQUtBK0QsaUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDQUEsV0FBT3VCLEtBQUttRSxjQUFMLENBQW9CMUYsSUFBcEIsRUFBMEIrQixNQUExQixFQUFrQzRELFlBQWxDLENBQVA7QUFDQSxRQUFJLENBQUMzRixJQUFMLEVBQVc7QUFDUCxlQUFPLElBQVA7QUFDSDtBQUNEQSxXQUFPdUIsS0FBS2dFLFFBQUwsQ0FBY3ZGLEtBQUs0QixHQUFuQixFQUF3QixLQUF4QixDQUFQO0FBQ0EsUUFBSSxDQUFDNUIsSUFBTCxFQUFVO0FBQ04sZUFBTyxJQUFQO0FBQ0g7O0FBRUQyRixpQkFBYWhFLElBQWIsQ0FBa0IzQixJQUFsQjs7QUFFQTtBQUNBLFFBQUksQ0FBQ3VCLEtBQUt3RSxTQUFMLENBQWVoRSxNQUFmLENBQUwsRUFBNkI7QUFDekIsZUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSSxLQUFLMUMsV0FBTCxDQUFpQlEsTUFBakIsR0FBMEIsQ0FBOUIsRUFBaUM7QUFDN0IsWUFBSW1HLE1BQU0sS0FBS0MsaUJBQUwsQ0FBdUJqRyxLQUFLNEIsR0FBNUIsQ0FBVjtBQUNBLFlBQUksQ0FBQ29FLEdBQUwsRUFBVTtBQUNOLG1CQUFPLElBQVA7QUFDSDtBQUNELFlBQUlFLFdBQVdGLElBQUlMLFlBQUosQ0FBaUJLLElBQUlMLFlBQUosQ0FBaUI5RixNQUFqQixHQUF3QixDQUF6QyxDQUFmO0FBQUEsWUFDSXdGLFVBQVU7QUFDTjNGLG1CQUFPd0csU0FBU3hHLEtBQVQsSUFBbUIsQ0FBQ3dHLFNBQVN0RSxHQUFULEdBQWVzRSxTQUFTeEcsS0FBekIsSUFBa0MsQ0FBbkMsR0FBd0MsQ0FBMUQsQ0FERDtBQUVOa0MsaUJBQUtzRSxTQUFTdEU7QUFGUixTQURkO0FBS0EsWUFBRyxDQUFDTCxLQUFLNkQseUJBQUwsQ0FBK0JDLE9BQS9CLENBQUosRUFBNkM7QUFDekMsbUJBQU8sSUFBUDtBQUNIO0FBQ0RTLHFCQUFhO0FBQ1RLLHdCQUFZSCxHQURIO0FBRVRoRyxrQkFBTStCLE9BQU9xRSxJQUFQLENBQVksRUFBWixJQUFrQkosSUFBSWhHO0FBRm5CLFNBQWI7QUFJSDs7QUFFRDtBQUNJQSxjQUFNK0IsT0FBT3FFLElBQVAsQ0FBWSxFQUFaLENBRFY7QUFFSTFHLGVBQU95RixVQUFVekYsS0FGckI7QUFHSWtDLGFBQUs1QixLQUFLNEIsR0FIZDtBQUlJeUUsaUJBQVMsRUFKYjtBQUtJbEIsbUJBQVdBLFNBTGY7QUFNSVEsc0JBQWNBO0FBTmxCLE9BT09HLFVBUFA7QUFTSCxDQTlERDs7QUFnRUF0QyxVQUFVakUsU0FBVixDQUFvQjBHLGlCQUFwQixHQUF3QyxVQUFTbEYsTUFBVCxFQUFpQjtBQUNyRCxRQUFJcEIsQ0FBSjtBQUFBLFFBQ0lELFFBQVEsS0FBS29CLFFBQUwsQ0FBYyxLQUFLeEIsSUFBbkIsRUFBeUJ5QixNQUF6QixDQURaO0FBQUEsUUFFSW9FLFlBQVksS0FBS0wsWUFBTCxDQUFrQixLQUFLUix1QkFBdkIsRUFBZ0Q1RSxLQUFoRCxFQUF1RCxLQUF2RCxFQUE4RCxLQUE5RCxDQUZoQjtBQUFBLFFBR0lxQyxNQUhKOztBQUtBLFFBQUlvRCxjQUFjLElBQWxCLEVBQXdCO0FBQ3BCLGVBQU8sSUFBUDtBQUNIOztBQUVELFNBQUt4RixJQUFJLENBQVQsRUFBWUEsSUFBSSxLQUFLTixXQUFMLENBQWlCUSxNQUFqQyxFQUF5Q0YsR0FBekMsRUFBOEM7QUFDMUNvQyxpQkFBUyxLQUFLMUMsV0FBTCxDQUFpQk0sQ0FBakIsRUFBb0IyRyxNQUFwQixDQUEyQixLQUFLaEgsSUFBaEMsRUFBc0M2RixVQUFVdkQsR0FBaEQsQ0FBVDtBQUNBLFlBQUlHLFdBQVcsSUFBZixFQUFxQjtBQUNqQixtQkFBTztBQUNIL0Isc0JBQU0rQixPQUFPL0IsSUFEVjtBQUVITiw0QkFGRztBQUdIeUYsb0NBSEc7QUFJSHZELHFCQUFLRyxPQUFPSCxHQUpUO0FBS0h5RSx5QkFBUyxFQUxOO0FBTUhWLDhCQUFjNUQsT0FBTzREO0FBTmxCLGFBQVA7QUFRSDtBQUNKO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0F4QkQ7O0FBMEJBbkMsVUFBVWpFLFNBQVYsQ0FBb0J3RyxTQUFwQixHQUFnQyxVQUFTaEUsTUFBVCxFQUFpQjtBQUM3QyxRQUFJM0IsTUFBTSxDQUFWO0FBQUEsUUFBYVQsQ0FBYjs7QUFFQSxTQUFNQSxJQUFJb0MsT0FBT2xDLE1BQVAsR0FBZ0IsQ0FBMUIsRUFBNkJGLEtBQUssQ0FBbEMsRUFBcUNBLEtBQUssQ0FBMUMsRUFBNkM7QUFDekNTLGVBQU8yQixPQUFPcEMsQ0FBUCxDQUFQO0FBQ0g7QUFDRFMsV0FBTyxDQUFQO0FBQ0EsU0FBTVQsSUFBSW9DLE9BQU9sQyxNQUFQLEdBQWdCLENBQTFCLEVBQTZCRixLQUFLLENBQWxDLEVBQXFDQSxLQUFLLENBQTFDLEVBQTZDO0FBQ3pDUyxlQUFPMkIsT0FBT3BDLENBQVAsQ0FBUDtBQUNIO0FBQ0QsV0FBT1MsTUFBTSxFQUFOLEtBQWEsQ0FBcEI7QUFDSCxDQVhEOztBQWFBb0QsVUFBVUQsV0FBVixHQUF3QjtBQUNwQmxFLGlCQUFhO0FBQ1QsZ0JBQVEsaUJBREM7QUFFVCxtQkFBVyxFQUZGO0FBR1QsdUJBQWU7QUFITjtBQURPLENBQXhCOztBQVFBLHlEQUFnQm1FLFNBQWhCLEU7Ozs7OztBQ2hZQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FDUkEseURBQWU7QUFDWFQsVUFBTSxjQUFTd0QsR0FBVCxFQUFjQyxHQUFkLEVBQW1CO0FBQ3JCLFlBQUlDLElBQUlGLElBQUkxRyxNQUFaO0FBQ0EsZUFBTzRHLEdBQVAsRUFBWTtBQUNSRixnQkFBSUUsQ0FBSixJQUFTRCxHQUFUO0FBQ0g7QUFDSixLQU5VOztBQVFYOzs7O0FBSUFFLGFBQVMsaUJBQVNILEdBQVQsRUFBYztBQUNuQixZQUFJNUcsSUFBSTRHLElBQUkxRyxNQUFKLEdBQWEsQ0FBckI7QUFBQSxZQUF3Qm1GLENBQXhCO0FBQUEsWUFBMkIyQixDQUEzQjtBQUNBLGFBQUtoSCxDQUFMLEVBQVFBLEtBQUssQ0FBYixFQUFnQkEsR0FBaEIsRUFBcUI7QUFDakJxRixnQkFBSXBFLEtBQUtnRyxLQUFMLENBQVdoRyxLQUFLaUcsTUFBTCxLQUFnQmxILENBQTNCLENBQUo7QUFDQWdILGdCQUFJSixJQUFJNUcsQ0FBSixDQUFKO0FBQ0E0RyxnQkFBSTVHLENBQUosSUFBUzRHLElBQUl2QixDQUFKLENBQVQ7QUFDQXVCLGdCQUFJdkIsQ0FBSixJQUFTMkIsQ0FBVDtBQUNIO0FBQ0QsZUFBT0osR0FBUDtBQUNILEtBckJVOztBQXVCWE8saUJBQWEscUJBQVNQLEdBQVQsRUFBYztBQUN2QixZQUFJNUcsQ0FBSjtBQUFBLFlBQU9xRixDQUFQO0FBQUEsWUFBVStCLE1BQU0sRUFBaEI7QUFBQSxZQUFvQkMsT0FBTyxFQUEzQjtBQUNBLGFBQU1ySCxJQUFJLENBQVYsRUFBYUEsSUFBSTRHLElBQUkxRyxNQUFyQixFQUE2QkYsR0FBN0IsRUFBa0M7QUFDOUJvSCxrQkFBTSxFQUFOO0FBQ0EsaUJBQU0vQixJQUFJLENBQVYsRUFBYUEsSUFBSXVCLElBQUk1RyxDQUFKLEVBQU9FLE1BQXhCLEVBQWdDbUYsR0FBaEMsRUFBcUM7QUFDakMrQixvQkFBSS9CLENBQUosSUFBU3VCLElBQUk1RyxDQUFKLEVBQU9xRixDQUFQLENBQVQ7QUFDSDtBQUNEZ0MsaUJBQUtySCxDQUFMLElBQVUsTUFBTW9ILElBQUlYLElBQUosQ0FBUyxHQUFULENBQU4sR0FBc0IsR0FBaEM7QUFDSDtBQUNELGVBQU8sTUFBTVksS0FBS1osSUFBTCxDQUFVLE9BQVYsQ0FBTixHQUEyQixHQUFsQztBQUNILEtBakNVOztBQW1DWDs7OztBQUlBYSxlQUFXLG1CQUFTVixHQUFULEVBQWNVLFVBQWQsRUFBeUJDLFNBQXpCLEVBQW9DO0FBQzNDLFlBQUl2SCxDQUFKO0FBQUEsWUFBT3dILFFBQVEsRUFBZjtBQUNBLGFBQU14SCxJQUFJLENBQVYsRUFBYUEsSUFBSTRHLElBQUkxRyxNQUFyQixFQUE2QkYsR0FBN0IsRUFBa0M7QUFDOUIsZ0JBQUl1SCxVQUFVRSxLQUFWLENBQWdCYixHQUFoQixFQUFxQixDQUFDQSxJQUFJNUcsQ0FBSixDQUFELENBQXJCLEtBQWtDc0gsVUFBdEMsRUFBaUQ7QUFDN0NFLHNCQUFNeEYsSUFBTixDQUFXNEUsSUFBSTVHLENBQUosQ0FBWDtBQUNIO0FBQ0o7QUFDRCxlQUFPd0gsS0FBUDtBQUNILEtBL0NVOztBQWlEWEUsY0FBVSxrQkFBU2QsR0FBVCxFQUFjO0FBQ3BCLFlBQUk1RyxDQUFKO0FBQUEsWUFBTzJILE1BQU0sQ0FBYjtBQUNBLGFBQU0zSCxJQUFJLENBQVYsRUFBYUEsSUFBSTRHLElBQUkxRyxNQUFyQixFQUE2QkYsR0FBN0IsRUFBa0M7QUFDOUIsZ0JBQUk0RyxJQUFJNUcsQ0FBSixJQUFTNEcsSUFBSWUsR0FBSixDQUFiLEVBQXVCO0FBQ25CQSxzQkFBTTNILENBQU47QUFDSDtBQUNKO0FBQ0QsZUFBTzJILEdBQVA7QUFDSCxLQXpEVTs7QUEyRFhBLFNBQUssYUFBU2YsR0FBVCxFQUFjO0FBQ2YsWUFBSTVHLENBQUo7QUFBQSxZQUFPMkgsTUFBTSxDQUFiO0FBQ0EsYUFBTTNILElBQUksQ0FBVixFQUFhQSxJQUFJNEcsSUFBSTFHLE1BQXJCLEVBQTZCRixHQUE3QixFQUFrQztBQUM5QixnQkFBSTRHLElBQUk1RyxDQUFKLElBQVMySCxHQUFiLEVBQWtCO0FBQ2RBLHNCQUFNZixJQUFJNUcsQ0FBSixDQUFOO0FBQ0g7QUFDSjtBQUNELGVBQU8ySCxHQUFQO0FBQ0gsS0FuRVU7O0FBcUVYbEgsU0FBSyxhQUFTbUcsR0FBVCxFQUFjO0FBQ2YsWUFBSTFHLFNBQVMwRyxJQUFJMUcsTUFBakI7QUFBQSxZQUNJTyxNQUFNLENBRFY7O0FBR0EsZUFBT1AsUUFBUCxFQUFpQjtBQUNiTyxtQkFBT21HLElBQUkxRyxNQUFKLENBQVA7QUFDSDtBQUNELGVBQU9PLEdBQVA7QUFDSDtBQTdFVSxDQUFmLEU7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDNUJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMvQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsV0FBVyxFQUFFO0FBQ2IsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMzQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDakJBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNwQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxFQUFFO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDeEJBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNoQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2hDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBLElBQU1tSCxPQUFPO0FBQ1RDLFdBQU8sbUJBQUFDLENBQVEsQ0FBUjtBQURFLENBQWI7O0FBSUE7Ozs7Ozs7OztBQVNBLFNBQVNDLFlBQVQsQ0FBc0JDLElBQXRCLEVBQTRCQyxJQUE1QixFQUFrQ0MsU0FBbEMsRUFBNkNDLFVBQTdDLEVBQXlEO0FBQ3JELFFBQUksQ0FBQ0YsSUFBTCxFQUFXO0FBQ1AsWUFBSUMsU0FBSixFQUFlO0FBQ1gsaUJBQUtELElBQUwsR0FBWSxJQUFJQyxTQUFKLENBQWNGLEtBQUtoQixDQUFMLEdBQVNnQixLQUFLSSxDQUE1QixDQUFaO0FBQ0EsZ0JBQUlGLGNBQWNHLEtBQWQsSUFBdUJGLFVBQTNCLEVBQXVDO0FBQ25DaEYsZ0JBQUEscUVBQUFBLENBQVlDLElBQVosQ0FBaUIsS0FBSzZFLElBQXRCLEVBQTRCLENBQTVCO0FBQ0g7QUFDSixTQUxELE1BS087QUFDSCxpQkFBS0EsSUFBTCxHQUFZLElBQUlLLFVBQUosQ0FBZU4sS0FBS2hCLENBQUwsR0FBU2dCLEtBQUtJLENBQTdCLENBQVo7QUFDQSxnQkFBSUUsZUFBZUQsS0FBZixJQUF3QkYsVUFBNUIsRUFBd0M7QUFDcENoRixnQkFBQSxxRUFBQUEsQ0FBWUMsSUFBWixDQUFpQixLQUFLNkUsSUFBdEIsRUFBNEIsQ0FBNUI7QUFDSDtBQUNKO0FBQ0osS0FaRCxNQVlPO0FBQ0gsYUFBS0EsSUFBTCxHQUFZQSxJQUFaO0FBQ0g7QUFDRCxTQUFLRCxJQUFMLEdBQVlBLElBQVo7QUFDSDs7QUFFRDs7Ozs7OztBQU9BRCxhQUFhbkksU0FBYixDQUF1QjJJLGlCQUF2QixHQUEyQyxVQUFTQyxNQUFULEVBQWlCQyxNQUFqQixFQUF5QjtBQUNoRSxXQUFRRCxPQUFPeEIsQ0FBUCxJQUFZeUIsTUFBYixJQUNDRCxPQUFPSixDQUFQLElBQVlLLE1BRGIsSUFFQ0QsT0FBT3hCLENBQVAsR0FBWSxLQUFLZ0IsSUFBTCxDQUFVaEIsQ0FBVixHQUFjeUIsTUFGM0IsSUFHQ0QsT0FBT0osQ0FBUCxHQUFZLEtBQUtKLElBQUwsQ0FBVUksQ0FBVixHQUFjSyxNQUhsQztBQUlILENBTEQ7O0FBT0E7Ozs7Ozs7O0FBUUFWLGFBQWFXLE1BQWIsR0FBc0IsVUFBU0MsS0FBVCxFQUFnQjNCLENBQWhCLEVBQW1Cb0IsQ0FBbkIsRUFBc0I7QUFDeEMsUUFBSVEsS0FBSzNILEtBQUtnRyxLQUFMLENBQVdELENBQVgsQ0FBVDtBQUNBLFFBQUk2QixLQUFLNUgsS0FBS2dHLEtBQUwsQ0FBV21CLENBQVgsQ0FBVDtBQUNBLFFBQUlVLElBQUlILE1BQU1YLElBQU4sQ0FBV2hCLENBQW5CO0FBQ0EsUUFBSStCLE9BQU9GLEtBQUtGLE1BQU1YLElBQU4sQ0FBV2hCLENBQWhCLEdBQW9CNEIsRUFBL0I7QUFDQSxRQUFJSSxJQUFJTCxNQUFNVixJQUFOLENBQVdjLE9BQU8sQ0FBbEIsQ0FBUjtBQUNBLFFBQUlFLElBQUlOLE1BQU1WLElBQU4sQ0FBV2MsT0FBTyxDQUFsQixDQUFSO0FBQ0EsUUFBSUcsSUFBSVAsTUFBTVYsSUFBTixDQUFXYyxPQUFPRCxDQUFsQixDQUFSO0FBQ0EsUUFBSUssSUFBSVIsTUFBTVYsSUFBTixDQUFXYyxPQUFPRCxDQUFQLEdBQVcsQ0FBdEIsQ0FBUjtBQUNBLFFBQUlNLElBQUlKLElBQUlDLENBQVo7QUFDQWpDLFNBQUs0QixFQUFMO0FBQ0FSLFNBQUtTLEVBQUw7O0FBRUEsUUFBSXpHLFNBQVNuQixLQUFLZ0csS0FBTCxDQUFXRCxLQUFLb0IsS0FBS2dCLElBQUlGLENBQUosR0FBUUMsQ0FBYixJQUFrQkMsQ0FBdkIsSUFBNEJoQixLQUFLYyxJQUFJRixDQUFULENBQTVCLEdBQTBDQSxDQUFyRCxDQUFiO0FBQ0EsV0FBTzVHLE1BQVA7QUFDSCxDQWZEOztBQWlCQTs7OztBQUlBMkYsYUFBYXNCLFVBQWIsR0FBMEIsVUFBU0MsS0FBVCxFQUFnQjtBQUN0QyxRQUFJeEMsSUFBSXdDLE1BQU1wSixNQUFkO0FBQ0EsV0FBTzRHLEdBQVAsRUFBWTtBQUNSd0MsY0FBTXhDLENBQU4sSUFBVyxDQUFYO0FBQ0g7QUFDSixDQUxEOztBQU9BOzs7Ozs7QUFNQWlCLGFBQWFuSSxTQUFiLENBQXVCMkosUUFBdkIsR0FBa0MsVUFBU0MsSUFBVCxFQUFleEIsSUFBZixFQUFxQjtBQUNuRCxXQUFPLElBQUksMERBQUosQ0FBYXdCLElBQWIsRUFBbUJ4QixJQUFuQixFQUF5QixJQUF6QixDQUFQO0FBQ0gsQ0FGRDs7QUFJQTs7Ozs7QUFLQUQsYUFBYW5JLFNBQWIsQ0FBdUI2SixjQUF2QixHQUF3QyxVQUFTQyxZQUFULEVBQXVCRixJQUF2QixFQUE2QjtBQUNqRSxRQUFJRyxRQUFRRCxhQUFhMUIsSUFBYixDQUFrQkksQ0FBOUI7QUFBQSxRQUFpQ3dCLFFBQVFGLGFBQWExQixJQUFiLENBQWtCaEIsQ0FBM0Q7QUFDQSxRQUFJQSxDQUFKLEVBQU9vQixDQUFQO0FBQ0EsU0FBTXBCLElBQUksQ0FBVixFQUFhQSxJQUFJNEMsS0FBakIsRUFBd0I1QyxHQUF4QixFQUE2QjtBQUN6QixhQUFNb0IsSUFBSSxDQUFWLEVBQWFBLElBQUl1QixLQUFqQixFQUF3QnZCLEdBQXhCLEVBQTZCO0FBQ3pCc0IseUJBQWF6QixJQUFiLENBQWtCRyxJQUFJd0IsS0FBSixHQUFZNUMsQ0FBOUIsSUFBbUMsS0FBS2lCLElBQUwsQ0FBVSxDQUFDdUIsS0FBS3BCLENBQUwsR0FBU0EsQ0FBVixJQUFlLEtBQUtKLElBQUwsQ0FBVWhCLENBQXpCLEdBQTZCd0MsS0FBS3hDLENBQWxDLEdBQXNDQSxDQUFoRCxDQUFuQztBQUNIO0FBQ0o7QUFDSixDQVJEOztBQVVBZSxhQUFhbkksU0FBYixDQUF1QmlLLE1BQXZCLEdBQWdDLFVBQVNILFlBQVQsRUFBdUI7QUFDbkQsUUFBSXhKLFNBQVMsS0FBSytILElBQUwsQ0FBVS9ILE1BQXZCO0FBQUEsUUFBK0I0SixVQUFVLEtBQUs3QixJQUE5QztBQUFBLFFBQW9EOEIsVUFBVUwsYUFBYXpCLElBQTNFOztBQUVBLFdBQU8vSCxRQUFQLEVBQWlCO0FBQ2I2SixnQkFBUTdKLE1BQVIsSUFBa0I0SixRQUFRNUosTUFBUixDQUFsQjtBQUNIO0FBQ0osQ0FORDs7QUFRQTs7Ozs7O0FBTUE2SCxhQUFhbkksU0FBYixDQUF1Qm9LLEdBQXZCLEdBQTZCLFVBQVNoRCxDQUFULEVBQVlvQixDQUFaLEVBQWU7QUFDeEMsV0FBTyxLQUFLSCxJQUFMLENBQVVHLElBQUksS0FBS0osSUFBTCxDQUFVaEIsQ0FBZCxHQUFrQkEsQ0FBNUIsQ0FBUDtBQUNILENBRkQ7O0FBSUE7Ozs7OztBQU1BZSxhQUFhbkksU0FBYixDQUF1QnFLLE9BQXZCLEdBQWlDLFVBQVNqRCxDQUFULEVBQVlvQixDQUFaLEVBQWU7QUFDNUMsUUFBSXBJLENBQUo7O0FBRUEsUUFBSSxDQUFDLEtBQUtrSyxZQUFWLEVBQXdCO0FBQ3BCLGFBQUtBLFlBQUwsR0FBb0I7QUFDaEJsRCxlQUFHLEVBRGE7QUFFaEJvQixlQUFHO0FBRmEsU0FBcEI7QUFJQSxhQUFLcEksSUFBSSxDQUFULEVBQVlBLElBQUksS0FBS2dJLElBQUwsQ0FBVWhCLENBQTFCLEVBQTZCaEgsR0FBN0IsRUFBa0M7QUFDOUIsaUJBQUtrSyxZQUFMLENBQWtCbEQsQ0FBbEIsQ0FBb0JoSCxDQUFwQixJQUF5QkEsQ0FBekI7QUFDQSxpQkFBS2tLLFlBQUwsQ0FBa0JsRCxDQUFsQixDQUFvQmhILElBQUksS0FBS2dJLElBQUwsQ0FBVWhCLENBQWxDLElBQXVDaEgsQ0FBdkM7QUFDSDtBQUNELGFBQUtBLElBQUksQ0FBVCxFQUFZQSxJQUFJLEtBQUtnSSxJQUFMLENBQVVJLENBQTFCLEVBQTZCcEksR0FBN0IsRUFBa0M7QUFDOUIsaUJBQUtrSyxZQUFMLENBQWtCOUIsQ0FBbEIsQ0FBb0JwSSxDQUFwQixJQUF5QkEsQ0FBekI7QUFDQSxpQkFBS2tLLFlBQUwsQ0FBa0I5QixDQUFsQixDQUFvQnBJLElBQUksS0FBS2dJLElBQUwsQ0FBVUksQ0FBbEMsSUFBdUNwSSxDQUF2QztBQUNIO0FBQ0o7QUFDRCxXQUFPLEtBQUtpSSxJQUFMLENBQVcsS0FBS2lDLFlBQUwsQ0FBa0I5QixDQUFsQixDQUFvQkEsSUFBSSxLQUFLSixJQUFMLENBQVVJLENBQWxDLENBQUQsR0FBeUMsS0FBS0osSUFBTCxDQUFVaEIsQ0FBbkQsR0FBdUQsS0FBS2tELFlBQUwsQ0FBa0JsRCxDQUFsQixDQUFvQkEsSUFBSSxLQUFLZ0IsSUFBTCxDQUFVaEIsQ0FBbEMsQ0FBakUsQ0FBUDtBQUNILENBbEJEOztBQW9CQTs7Ozs7OztBQU9BZSxhQUFhbkksU0FBYixDQUF1QnVLLEdBQXZCLEdBQTZCLFVBQVNuRCxDQUFULEVBQVlvQixDQUFaLEVBQWV0RixLQUFmLEVBQXNCO0FBQy9DLFNBQUttRixJQUFMLENBQVVHLElBQUksS0FBS0osSUFBTCxDQUFVaEIsQ0FBZCxHQUFrQkEsQ0FBNUIsSUFBaUNsRSxLQUFqQztBQUNBLFdBQU8sSUFBUDtBQUNILENBSEQ7O0FBS0E7OztBQUdBaUYsYUFBYW5JLFNBQWIsQ0FBdUJ3SyxVQUF2QixHQUFvQyxZQUFXO0FBQzNDLFFBQUlwSyxDQUFKO0FBQUEsUUFBT3FLLFFBQVEsS0FBS3JDLElBQUwsQ0FBVWhCLENBQXpCO0FBQUEsUUFBNEJzRCxTQUFTLEtBQUt0QyxJQUFMLENBQVVJLENBQS9DO0FBQUEsUUFBa0RILE9BQU8sS0FBS0EsSUFBOUQ7QUFDQSxTQUFNakksSUFBSSxDQUFWLEVBQWFBLElBQUlxSyxLQUFqQixFQUF3QnJLLEdBQXhCLEVBQTZCO0FBQ3pCaUksYUFBS2pJLENBQUwsSUFBVWlJLEtBQUssQ0FBQ3FDLFNBQVMsQ0FBVixJQUFlRCxLQUFmLEdBQXVCckssQ0FBNUIsSUFBaUMsQ0FBM0M7QUFDSDtBQUNELFNBQU1BLElBQUksQ0FBVixFQUFhQSxJQUFJc0ssU0FBUyxDQUExQixFQUE2QnRLLEdBQTdCLEVBQWtDO0FBQzlCaUksYUFBS2pJLElBQUlxSyxLQUFULElBQWtCcEMsS0FBS2pJLElBQUlxSyxLQUFKLElBQWFBLFFBQVEsQ0FBckIsQ0FBTCxJQUFnQyxDQUFsRDtBQUNIO0FBQ0osQ0FSRDs7QUFVQTs7O0FBR0F0QyxhQUFhbkksU0FBYixDQUF1QjJLLE1BQXZCLEdBQWdDLFlBQVc7QUFDdkMsUUFBSXRDLE9BQU8sS0FBS0EsSUFBaEI7QUFBQSxRQUFzQi9ILFNBQVMrSCxLQUFLL0gsTUFBcEM7O0FBRUEsV0FBT0EsUUFBUCxFQUFpQjtBQUNiK0gsYUFBSy9ILE1BQUwsSUFBZStILEtBQUsvSCxNQUFMLElBQWUsQ0FBZixHQUFtQixDQUFsQztBQUNIO0FBQ0osQ0FORDs7QUFRQTZILGFBQWFuSSxTQUFiLENBQXVCNEssUUFBdkIsR0FBa0MsVUFBU0MsTUFBVCxFQUFpQjtBQUMvQyxRQUFJekQsQ0FBSjtBQUFBLFFBQU9vQixDQUFQO0FBQUEsUUFBVXNDLEVBQVY7QUFBQSxRQUFjQyxFQUFkO0FBQUEsUUFBa0JDLFFBQVNILE9BQU92SyxNQUFQLEdBQWdCLENBQWpCLEdBQXNCLENBQWhEO0FBQUEsUUFBbUQySyxPQUFPLENBQTFEO0FBQ0EsU0FBTXpDLElBQUksQ0FBVixFQUFhQSxJQUFJLEtBQUtKLElBQUwsQ0FBVUksQ0FBM0IsRUFBOEJBLEdBQTlCLEVBQW1DO0FBQy9CLGFBQU1wQixJQUFJLENBQVYsRUFBYUEsSUFBSSxLQUFLZ0IsSUFBTCxDQUFVaEIsQ0FBM0IsRUFBOEJBLEdBQTlCLEVBQW1DO0FBQy9CNkQsbUJBQU8sQ0FBUDtBQUNBLGlCQUFNRixLQUFLLENBQUNDLEtBQVosRUFBbUJELE1BQU1DLEtBQXpCLEVBQWdDRCxJQUFoQyxFQUFzQztBQUNsQyxxQkFBTUQsS0FBSyxDQUFDRSxLQUFaLEVBQW1CRixNQUFNRSxLQUF6QixFQUFnQ0YsSUFBaEMsRUFBc0M7QUFDbENHLDRCQUFRSixPQUFPRSxLQUFLQyxLQUFaLEVBQW1CRixLQUFLRSxLQUF4QixJQUFpQyxLQUFLWCxPQUFMLENBQWFqRCxJQUFJMEQsRUFBakIsRUFBcUJ0QyxJQUFJdUMsRUFBekIsQ0FBekM7QUFDSDtBQUNKO0FBQ0QsaUJBQUsxQyxJQUFMLENBQVVHLElBQUksS0FBS0osSUFBTCxDQUFVaEIsQ0FBZCxHQUFrQkEsQ0FBNUIsSUFBaUM2RCxJQUFqQztBQUNIO0FBQ0o7QUFDSixDQWJEOztBQWVBOUMsYUFBYW5JLFNBQWIsQ0FBdUJrTCxPQUF2QixHQUFpQyxVQUFTQyxVQUFULEVBQXFCO0FBQ2xELFFBQUk5QyxPQUFPLEtBQUtBLElBQWhCO0FBQUEsUUFDSWpCLENBREo7QUFBQSxRQUVJb0IsQ0FGSjtBQUFBLFFBR0lrQyxTQUFTLEtBQUt0QyxJQUFMLENBQVVJLENBSHZCO0FBQUEsUUFJSWlDLFFBQVEsS0FBS3JDLElBQUwsQ0FBVWhCLENBSnRCO0FBQUEsUUFLSUgsR0FMSjtBQUFBLFFBTUltRSxHQU5KO0FBQUEsUUFPSUMsV0FBVyxFQVBmO0FBQUEsUUFRSWpMLENBUko7QUFBQSxRQVNJa0wsS0FUSjtBQUFBLFFBVUlDLElBVko7QUFBQSxRQVdJQyxJQVhKO0FBQUEsUUFZSUMsSUFaSjtBQUFBLFFBYUlDLEVBYko7QUFBQSxRQWNJQyxFQWRKO0FBQUEsUUFlSS9KLEdBZko7QUFBQSxRQWdCSVksU0FBUyxFQWhCYjtBQUFBLFFBaUJJb0osS0FBS3ZLLEtBQUt1SyxFQWpCZDtBQUFBLFFBa0JJQyxPQUFPRCxLQUFLLENBbEJoQjs7QUFvQkEsUUFBSVQsY0FBYyxDQUFsQixFQUFxQjtBQUNqQixlQUFPM0ksTUFBUDtBQUNIOztBQUVELFNBQU1wQyxJQUFJLENBQVYsRUFBYUEsSUFBSStLLFVBQWpCLEVBQTZCL0ssR0FBN0IsRUFBa0M7QUFDOUJpTCxpQkFBU2pMLENBQVQsSUFBYztBQUNWMEwsaUJBQUssQ0FESztBQUVWQyxpQkFBSyxDQUZLO0FBR1ZDLGlCQUFLLENBSEs7QUFJVkMsaUJBQUssQ0FKSztBQUtWQyxpQkFBSyxDQUxLO0FBTVZDLGlCQUFLLENBTks7QUFPVkMsbUJBQU8sQ0FQRztBQVFWQyxpQkFBSztBQVJLLFNBQWQ7QUFVSDs7QUFFRCxTQUFNN0QsSUFBSSxDQUFWLEVBQWFBLElBQUlrQyxNQUFqQixFQUF5QmxDLEdBQXpCLEVBQThCO0FBQzFCNEMsY0FBTTVDLElBQUlBLENBQVY7QUFDQSxhQUFNcEIsSUFBSSxDQUFWLEVBQWFBLElBQUlxRCxLQUFqQixFQUF3QnJELEdBQXhCLEVBQTZCO0FBQ3pCSCxrQkFBTW9CLEtBQUtHLElBQUlpQyxLQUFKLEdBQVlyRCxDQUFqQixDQUFOO0FBQ0EsZ0JBQUlILE1BQU0sQ0FBVixFQUFhO0FBQ1RxRSx3QkFBUUQsU0FBU3BFLE1BQU0sQ0FBZixDQUFSO0FBQ0FxRSxzQkFBTVEsR0FBTixJQUFhLENBQWI7QUFDQVIsc0JBQU1TLEdBQU4sSUFBYXZELENBQWI7QUFDQThDLHNCQUFNVSxHQUFOLElBQWE1RSxDQUFiO0FBQ0FrRSxzQkFBTVcsR0FBTixJQUFhN0UsSUFBSW9CLENBQWpCO0FBQ0E4QyxzQkFBTVksR0FBTixJQUFhZCxHQUFiO0FBQ0FFLHNCQUFNYSxHQUFOLElBQWEvRSxJQUFJQSxDQUFqQjtBQUNIO0FBQ0o7QUFDSjs7QUFFRCxTQUFNaEgsSUFBSSxDQUFWLEVBQWFBLElBQUkrSyxVQUFqQixFQUE2Qi9LLEdBQTdCLEVBQWtDO0FBQzlCa0wsZ0JBQVFELFNBQVNqTCxDQUFULENBQVI7QUFDQSxZQUFJLENBQUNrTSxNQUFNaEIsTUFBTVEsR0FBWixDQUFELElBQXFCUixNQUFNUSxHQUFOLEtBQWMsQ0FBdkMsRUFBMEM7QUFDdENKLGlCQUFLSixNQUFNVSxHQUFOLEdBQVlWLE1BQU1RLEdBQXZCO0FBQ0FILGlCQUFLTCxNQUFNUyxHQUFOLEdBQVlULE1BQU1RLEdBQXZCO0FBQ0FQLG1CQUFPRCxNQUFNVyxHQUFOLEdBQVlYLE1BQU1RLEdBQWxCLEdBQXdCSixLQUFLQyxFQUFwQztBQUNBSCxtQkFBT0YsTUFBTVksR0FBTixHQUFZWixNQUFNUSxHQUFsQixHQUF3QkgsS0FBS0EsRUFBcEM7QUFDQUYsbUJBQU9ILE1BQU1hLEdBQU4sR0FBWWIsTUFBTVEsR0FBbEIsR0FBd0JKLEtBQUtBLEVBQXBDO0FBQ0E5SixrQkFBTSxDQUFDNEosT0FBT0MsSUFBUixLQUFpQixJQUFJRixJQUFyQixDQUFOO0FBQ0EzSixrQkFBTSxNQUFNUCxLQUFLa0wsSUFBTCxDQUFVM0ssR0FBVixDQUFOLElBQXdCMkosUUFBUSxDQUFSLEdBQVlNLElBQVosR0FBbUIsQ0FBQ0EsSUFBNUMsSUFBcURELEVBQTNEO0FBQ0FOLGtCQUFNYyxLQUFOLEdBQWMsQ0FBQ3hLLE1BQU0sR0FBTixHQUFZZ0ssRUFBWixHQUFpQixFQUFsQixJQUF3QixHQUF4QixHQUE4QixFQUE1QztBQUNBLGdCQUFJTixNQUFNYyxLQUFOLEdBQWMsQ0FBbEIsRUFBcUI7QUFDakJkLHNCQUFNYyxLQUFOLElBQWUsR0FBZjtBQUNIO0FBQ0RkLGtCQUFNZSxHQUFOLEdBQVl6SyxNQUFNZ0ssRUFBTixHQUFXaEssTUFBTWdLLEVBQWpCLEdBQXNCaEssR0FBbEM7QUFDQTBKLGtCQUFNa0IsR0FBTixHQUFZeEUsS0FBS0MsS0FBTCxDQUFXLENBQUM1RyxLQUFLb0wsR0FBTCxDQUFTN0ssR0FBVCxDQUFELEVBQWdCUCxLQUFLcUwsR0FBTCxDQUFTOUssR0FBVCxDQUFoQixDQUFYLENBQVo7QUFDQVksbUJBQU9KLElBQVAsQ0FBWWtKLEtBQVo7QUFDSDtBQUNKOztBQUVELFdBQU85SSxNQUFQO0FBQ0gsQ0EzRUQ7O0FBNkVBOzs7OztBQUtBMkYsYUFBYW5JLFNBQWIsQ0FBdUIyTSxJQUF2QixHQUE4QixVQUFTQyxNQUFULEVBQWlCQyxLQUFqQixFQUF3QjtBQUNsRCxRQUFJQyxHQUFKLEVBQ0lDLEtBREosRUFFSTFFLElBRkosRUFHSTJFLE9BSEosRUFJSUMsS0FKSixFQUtJN0YsQ0FMSixFQU1Jb0IsQ0FOSjs7QUFRQSxRQUFJLENBQUNxRSxLQUFMLEVBQVk7QUFDUkEsZ0JBQVEsR0FBUjtBQUNIO0FBQ0RDLFVBQU1GLE9BQU9NLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBTjtBQUNBTixXQUFPbkMsS0FBUCxHQUFlLEtBQUtyQyxJQUFMLENBQVVoQixDQUF6QjtBQUNBd0YsV0FBT2xDLE1BQVAsR0FBZ0IsS0FBS3RDLElBQUwsQ0FBVUksQ0FBMUI7QUFDQXVFLFlBQVFELElBQUlLLFlBQUosQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBcEIsRUFBdUJQLE9BQU9uQyxLQUE5QixFQUFxQ21DLE9BQU9sQyxNQUE1QyxDQUFSO0FBQ0FyQyxXQUFPMEUsTUFBTTFFLElBQWI7QUFDQTJFLGNBQVUsQ0FBVjtBQUNBLFNBQUt4RSxJQUFJLENBQVQsRUFBWUEsSUFBSSxLQUFLSixJQUFMLENBQVVJLENBQTFCLEVBQTZCQSxHQUE3QixFQUFrQztBQUM5QixhQUFLcEIsSUFBSSxDQUFULEVBQVlBLElBQUksS0FBS2dCLElBQUwsQ0FBVWhCLENBQTFCLEVBQTZCQSxHQUE3QixFQUFrQztBQUM5QjZGLG9CQUFRekUsSUFBSSxLQUFLSixJQUFMLENBQVVoQixDQUFkLEdBQWtCQSxDQUExQjtBQUNBNEYsc0JBQVUsS0FBSzVDLEdBQUwsQ0FBU2hELENBQVQsRUFBWW9CLENBQVosSUFBaUJxRSxLQUEzQjtBQUNBeEUsaUJBQUs0RSxRQUFRLENBQVIsR0FBWSxDQUFqQixJQUFzQkQsT0FBdEI7QUFDQTNFLGlCQUFLNEUsUUFBUSxDQUFSLEdBQVksQ0FBakIsSUFBc0JELE9BQXRCO0FBQ0EzRSxpQkFBSzRFLFFBQVEsQ0FBUixHQUFZLENBQWpCLElBQXNCRCxPQUF0QjtBQUNBM0UsaUJBQUs0RSxRQUFRLENBQVIsR0FBWSxDQUFqQixJQUFzQixHQUF0QjtBQUNIO0FBQ0o7QUFDRDtBQUNBSCxRQUFJTSxZQUFKLENBQWlCTCxLQUFqQixFQUF3QixDQUF4QixFQUEyQixDQUEzQjtBQUNILENBOUJEOztBQWdDQTs7Ozs7QUFLQTVFLGFBQWFuSSxTQUFiLENBQXVCcU4sT0FBdkIsR0FBaUMsVUFBU1QsTUFBVCxFQUFpQkMsS0FBakIsRUFBd0JqRCxJQUF4QixFQUE4QjtBQUMzRCxRQUFJLENBQUNpRCxLQUFELElBQVVBLFFBQVEsQ0FBbEIsSUFBdUJBLFFBQVEsR0FBbkMsRUFBd0M7QUFDcENBLGdCQUFRLEdBQVI7QUFDSDtBQUNELFFBQUlTLE1BQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBVjtBQUNBLFFBQUlDLE1BQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBVjtBQUNBLFFBQUlDLFdBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FBZjtBQUNBLFFBQUlDLFdBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBZjtBQUNBLFFBQUlqTCxTQUFTLEVBQWI7QUFDQSxRQUFJc0ssTUFBTUYsT0FBT00sVUFBUCxDQUFrQixJQUFsQixDQUFWO0FBQ0EsUUFBSUgsUUFBUUQsSUFBSUssWUFBSixDQUFpQnZELEtBQUt4QyxDQUF0QixFQUF5QndDLEtBQUtwQixDQUE5QixFQUFpQyxLQUFLSixJQUFMLENBQVVoQixDQUEzQyxFQUE4QyxLQUFLZ0IsSUFBTCxDQUFVSSxDQUF4RCxDQUFaO0FBQ0EsUUFBSUgsT0FBTzBFLE1BQU0xRSxJQUFqQjtBQUNBLFFBQUkvSCxTQUFTLEtBQUsrSCxJQUFMLENBQVUvSCxNQUF2QjtBQUNBLFdBQU9BLFFBQVAsRUFBaUI7QUFDYmdOLFlBQUksQ0FBSixJQUFTLEtBQUtqRixJQUFMLENBQVUvSCxNQUFWLElBQW9CdU0sS0FBN0I7QUFDQXJLLGlCQUFTOEssSUFBSSxDQUFKLEtBQVUsQ0FBVixHQUFjRSxRQUFkLEdBQXlCRixJQUFJLENBQUosS0FBVSxHQUFWLEdBQWdCRyxRQUFoQixHQUEyQix3RkFBQUMsQ0FBUUosR0FBUixFQUFhQyxHQUFiLENBQTdEO0FBQ0FsRixhQUFLL0gsU0FBUyxDQUFULEdBQWEsQ0FBbEIsSUFBdUJrQyxPQUFPLENBQVAsQ0FBdkI7QUFDQTZGLGFBQUsvSCxTQUFTLENBQVQsR0FBYSxDQUFsQixJQUF1QmtDLE9BQU8sQ0FBUCxDQUF2QjtBQUNBNkYsYUFBSy9ILFNBQVMsQ0FBVCxHQUFhLENBQWxCLElBQXVCa0MsT0FBTyxDQUFQLENBQXZCO0FBQ0E2RixhQUFLL0gsU0FBUyxDQUFULEdBQWEsQ0FBbEIsSUFBdUIsR0FBdkI7QUFDSDtBQUNEd00sUUFBSU0sWUFBSixDQUFpQkwsS0FBakIsRUFBd0JuRCxLQUFLeEMsQ0FBN0IsRUFBZ0N3QyxLQUFLcEIsQ0FBckM7QUFDSCxDQXRCRDs7QUF3QkEseURBQWVMLFlBQWYsRTs7Ozs7Ozs7O0FDNVZBO0FBQ0E7O0FBRUEsU0FBU3dGLFlBQVQsR0FBd0I7QUFDcEIvTixJQUFBLGdFQUFBQSxDQUFjd0UsSUFBZCxDQUFtQixJQUFuQjtBQUNIOztBQUVELElBQUlLLGFBQWE7QUFDYm1KLHNCQUFrQixFQUFDMUssT0FBTyw4Q0FBUixFQURMO0FBRWIySyxjQUFVLEVBQUMzSyxPQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixFQUFpQixFQUFqQixFQUFxQixFQUFyQixFQUF5QixFQUF6QixFQUE2QixFQUE3QixFQUFpQyxFQUFqQyxFQUFxQyxFQUFyQyxFQUF5QyxFQUF6QyxFQUE2QyxFQUE3QyxFQUFpRCxFQUFqRCxFQUFxRCxFQUFyRCxFQUF5RCxFQUF6RCxFQUE2RCxFQUE3RCxFQUFpRSxFQUFqRSxFQUFxRSxFQUFyRSxFQUF5RSxFQUF6RSxFQUE2RSxFQUE3RSxFQUFpRixFQUFqRixFQUFxRixFQUFyRixFQUF5RixFQUF6RixFQUE2RixFQUE3RixFQUNkLEVBRGMsRUFDVixFQURVLEVBQ04sRUFETSxFQUNGLEVBREUsRUFDRSxFQURGLEVBQ00sRUFETixFQUNVLEVBRFYsRUFDYyxFQURkLEVBQ2tCLEVBRGxCLEVBQ3NCLEVBRHRCLEVBQzBCLEVBRDFCLEVBQzhCLEVBRDlCLEVBQ2tDLEVBRGxDLEVBQ3NDLEVBRHRDLEVBQzBDLEVBRDFDLEVBQzhDLEVBRDlDLEVBQ2tELEVBRGxELEVBQ3NELEVBRHRELEVBQzBELEVBRDFELEVBQzhELEVBRDlELENBQVIsRUFGRztBQUliNEsseUJBQXFCLEVBQUM1SyxPQUFPLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLEVBQTJDLEtBQTNDLEVBQWtELEtBQWxELEVBQXlELEtBQXpELEVBQWdFLEtBQWhFLEVBQXVFLEtBQXZFLEVBQThFLEtBQTlFLEVBQ3pCLEtBRHlCLEVBQ2xCLEtBRGtCLEVBQ1gsS0FEVyxFQUNKLEtBREksRUFDRyxLQURILEVBQ1UsS0FEVixFQUNpQixLQURqQixFQUN3QixLQUR4QixFQUMrQixLQUQvQixFQUNzQyxLQUR0QyxFQUM2QyxLQUQ3QyxFQUNvRCxLQURwRCxFQUMyRCxLQUQzRCxFQUNrRSxLQURsRSxFQUN5RSxLQUR6RSxFQUNnRixLQURoRixFQUV6QixLQUZ5QixFQUVsQixLQUZrQixFQUVYLEtBRlcsRUFFSixLQUZJLEVBRUcsS0FGSCxFQUVVLEtBRlYsRUFFaUIsS0FGakIsRUFFd0IsS0FGeEIsRUFFK0IsS0FGL0IsRUFFc0MsS0FGdEMsRUFFNkMsS0FGN0MsRUFFb0QsS0FGcEQsRUFFMkQsS0FGM0QsRUFFa0UsS0FGbEUsRUFFeUUsS0FGekUsRUFFZ0YsS0FGaEYsQ0FBUixFQUpSO0FBUWI2SyxjQUFVLEVBQUM3SyxPQUFPLEtBQVIsRUFSRztBQVNiRixZQUFRLEVBQUNFLE9BQU8sU0FBUixFQUFtQlMsV0FBVyxLQUE5QjtBQVRLLENBQWpCOztBQVlBZ0ssYUFBYTNOLFNBQWIsR0FBeUJ5RCxPQUFPMEIsTUFBUCxDQUFjLGdFQUFBdkYsQ0FBY0ksU0FBNUIsRUFBdUN5RSxVQUF2QyxDQUF6QjtBQUNBa0osYUFBYTNOLFNBQWIsQ0FBdUJvRixXQUF2QixHQUFxQ3VJLFlBQXJDOztBQUVBQSxhQUFhM04sU0FBYixDQUF1QnlDLE9BQXZCLEdBQWlDLFlBQVc7QUFDeEMsUUFBSVQsT0FBTyxJQUFYO0FBQUEsUUFDSW9CLFdBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixDQURmO0FBQUEsUUFFSVosU0FBUyxFQUZiO0FBQUEsUUFHSXJDLFFBQVE2QixLQUFLMEQsVUFBTCxFQUhaO0FBQUEsUUFJSXNJLFdBSko7QUFBQSxRQUtJQyxTQUxKO0FBQUEsUUFNSTFMLE9BTko7QUFBQSxRQU9JMkwsU0FQSjs7QUFTQSxRQUFJLENBQUMvTixLQUFMLEVBQVk7QUFDUixlQUFPLElBQVA7QUFDSDtBQUNEK04sZ0JBQVlsTSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixFQUF5QkksTUFBTWtDLEdBQS9CLENBQVo7O0FBRUEsT0FBRztBQUNDZSxtQkFBV3BCLEtBQUtxQixXQUFMLENBQWlCNkssU0FBakIsRUFBNEI5SyxRQUE1QixDQUFYO0FBQ0FiLGtCQUFVUCxLQUFLbU0sVUFBTCxDQUFnQi9LLFFBQWhCLENBQVY7QUFDQSxZQUFJYixVQUFVLENBQWQsRUFBaUI7QUFDYixtQkFBTyxJQUFQO0FBQ0g7QUFDRHlMLHNCQUFjaE0sS0FBS29NLGNBQUwsQ0FBb0I3TCxPQUFwQixDQUFkO0FBQ0EsWUFBSXlMLGNBQWMsQ0FBbEIsRUFBb0I7QUFDaEIsbUJBQU8sSUFBUDtBQUNIO0FBQ0R4TCxlQUFPSixJQUFQLENBQVk0TCxXQUFaO0FBQ0FDLG9CQUFZQyxTQUFaO0FBQ0FBLHFCQUFhLHFFQUFBM0ssQ0FBWTFDLEdBQVosQ0FBZ0J1QyxRQUFoQixDQUFiO0FBQ0E4SyxvQkFBWWxNLEtBQUtULFFBQUwsQ0FBY1MsS0FBS2pDLElBQW5CLEVBQXlCbU8sU0FBekIsQ0FBWjtBQUNILEtBZEQsUUFjU0YsZ0JBQWdCLEdBZHpCO0FBZUF4TCxXQUFPNkwsR0FBUDs7QUFFQSxRQUFJLENBQUM3TCxPQUFPbEMsTUFBWixFQUFvQjtBQUNoQixlQUFPLElBQVA7QUFDSDs7QUFFRCxRQUFJLENBQUMwQixLQUFLNkQseUJBQUwsQ0FBK0JvSSxTQUEvQixFQUEwQ0MsU0FBMUMsRUFBcUQ5SyxRQUFyRCxDQUFMLEVBQXFFO0FBQ2pFLGVBQU8sSUFBUDtBQUNIOztBQUVELFdBQU87QUFDSDNDLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIMUcsZUFBT0EsTUFBTUEsS0FGVjtBQUdIa0MsYUFBSzZMLFNBSEY7QUFJSHRJLG1CQUFXekYsS0FKUjtBQUtIaUcsc0JBQWM1RDtBQUxYLEtBQVA7QUFPSCxDQS9DRDs7QUFpREFtTCxhQUFhM04sU0FBYixDQUF1QjZGLHlCQUF2QixHQUFtRCxVQUFTb0ksU0FBVCxFQUFvQkMsU0FBcEIsRUFBK0I5SyxRQUEvQixFQUF5QztBQUN4RixRQUFJMkMscUJBQUo7QUFBQSxRQUNJdUksY0FBYyxxRUFBQS9LLENBQVkxQyxHQUFaLENBQWdCdUMsUUFBaEIsQ0FEbEI7O0FBR0EyQyw0QkFBd0JtSSxZQUFZRCxTQUFaLEdBQXdCSyxXQUFoRDtBQUNBLFFBQUt2SSx3QkFBd0IsQ0FBekIsSUFBK0J1SSxXQUFuQyxFQUFnRDtBQUM1QyxlQUFPLElBQVA7QUFDSDtBQUNELFdBQU8sS0FBUDtBQUNILENBVEQ7O0FBV0FYLGFBQWEzTixTQUFiLENBQXVCb08sY0FBdkIsR0FBd0MsVUFBUzdMLE9BQVQsRUFBa0I7QUFDdEQsUUFBSW5DLENBQUo7QUFBQSxRQUNJNEIsT0FBTyxJQURYOztBQUdBLFNBQUs1QixJQUFJLENBQVQsRUFBWUEsSUFBSTRCLEtBQUs4TCxtQkFBTCxDQUF5QnhOLE1BQXpDLEVBQWlERixHQUFqRCxFQUFzRDtBQUNsRCxZQUFJNEIsS0FBSzhMLG1CQUFMLENBQXlCMU4sQ0FBekIsTUFBZ0NtQyxPQUFwQyxFQUE2QztBQUN6QyxtQkFBT2dNLE9BQU9DLFlBQVAsQ0FBb0J4TSxLQUFLNkwsUUFBTCxDQUFjek4sQ0FBZCxDQUFwQixDQUFQO0FBQ0g7QUFDSjtBQUNELFdBQU8sQ0FBQyxDQUFSO0FBQ0gsQ0FWRDs7QUFZQXVOLGFBQWEzTixTQUFiLENBQXVCeU8sY0FBdkIsR0FBd0MsVUFBU3JMLFFBQVQsRUFBbUI0SixPQUFuQixFQUE0QjtBQUNoRSxRQUFJNU0sQ0FBSjtBQUFBLFFBQ0lzTyxXQUFXdk4sT0FBT0MsU0FEdEI7O0FBR0EsU0FBS2hCLElBQUksQ0FBVCxFQUFZQSxJQUFJZ0QsU0FBUzlDLE1BQXpCLEVBQWlDRixHQUFqQyxFQUFzQztBQUNsQyxZQUFJZ0QsU0FBU2hELENBQVQsSUFBY3NPLFFBQWQsSUFBMEJ0TCxTQUFTaEQsQ0FBVCxJQUFjNE0sT0FBNUMsRUFBcUQ7QUFDakQwQix1QkFBV3RMLFNBQVNoRCxDQUFULENBQVg7QUFDSDtBQUNKOztBQUVELFdBQU9zTyxRQUFQO0FBQ0gsQ0FYRDs7QUFhQWYsYUFBYTNOLFNBQWIsQ0FBdUJtTyxVQUF2QixHQUFvQyxVQUFTL0ssUUFBVCxFQUFtQjtBQUNuRCxRQUFJRSxjQUFjRixTQUFTOUMsTUFBM0I7QUFBQSxRQUNJcU8saUJBQWlCLENBRHJCO0FBQUEsUUFFSUMsY0FBY3RMLFdBRmxCO0FBQUEsUUFHSXVMLGVBQWUsQ0FIbkI7QUFBQSxRQUlJN00sT0FBTyxJQUpYO0FBQUEsUUFLSU8sT0FMSjtBQUFBLFFBTUluQyxDQU5KOztBQVFBLFdBQU93TyxjQUFjLENBQXJCLEVBQXdCO0FBQ3BCRCx5QkFBaUIzTSxLQUFLeU0sY0FBTCxDQUFvQnJMLFFBQXBCLEVBQThCdUwsY0FBOUIsQ0FBakI7QUFDQUMsc0JBQWMsQ0FBZDtBQUNBck0sa0JBQVUsQ0FBVjtBQUNBLGFBQUtuQyxJQUFJLENBQVQsRUFBWUEsSUFBSWtELFdBQWhCLEVBQTZCbEQsR0FBN0IsRUFBa0M7QUFDOUIsZ0JBQUlnRCxTQUFTaEQsQ0FBVCxJQUFjdU8sY0FBbEIsRUFBa0M7QUFDOUJwTSwyQkFBVyxLQUFNZSxjQUFjLENBQWQsR0FBa0JsRCxDQUFuQztBQUNBd087QUFDQUMsZ0NBQWdCekwsU0FBU2hELENBQVQsQ0FBaEI7QUFDSDtBQUNKOztBQUVELFlBQUl3TyxnQkFBZ0IsQ0FBcEIsRUFBdUI7QUFDbkIsaUJBQUt4TyxJQUFJLENBQVQsRUFBWUEsSUFBSWtELFdBQUosSUFBbUJzTCxjQUFjLENBQTdDLEVBQWdEeE8sR0FBaEQsRUFBcUQ7QUFDakQsb0JBQUlnRCxTQUFTaEQsQ0FBVCxJQUFjdU8sY0FBbEIsRUFBa0M7QUFDOUJDO0FBQ0Esd0JBQUt4TCxTQUFTaEQsQ0FBVCxJQUFjLENBQWYsSUFBcUJ5TyxZQUF6QixFQUF1QztBQUNuQywrQkFBTyxDQUFDLENBQVI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxtQkFBT3RNLE9BQVA7QUFDSDtBQUNKO0FBQ0QsV0FBTyxDQUFDLENBQVI7QUFDSCxDQWxDRDs7QUFvQ0FvTCxhQUFhM04sU0FBYixDQUF1QjBGLFVBQXZCLEdBQW9DLFlBQVc7QUFDM0MsUUFBSTFELE9BQU8sSUFBWDtBQUFBLFFBQ0lSLFNBQVNRLEtBQUtULFFBQUwsQ0FBY1MsS0FBS2pDLElBQW5CLENBRGI7QUFBQSxRQUVJK08sZUFBZXROLE1BRm5CO0FBQUEsUUFHSWhCLFVBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixDQUhkO0FBQUEsUUFJSTBCLGFBQWEsQ0FKakI7QUFBQSxRQUtJRCxVQUFVLEtBTGQ7QUFBQSxRQU1JN0IsQ0FOSjtBQUFBLFFBT0lxRixDQVBKO0FBQUEsUUFRSXNKLG1CQVJKOztBQVVBLFNBQU0zTyxJQUFJb0IsTUFBVixFQUFrQnBCLElBQUk0QixLQUFLakMsSUFBTCxDQUFVTyxNQUFoQyxFQUF3Q0YsR0FBeEMsRUFBNkM7QUFDekMsWUFBSTRCLEtBQUtqQyxJQUFMLENBQVVLLENBQVYsSUFBZTZCLE9BQW5CLEVBQTRCO0FBQ3hCekIsb0JBQVEwQixVQUFSO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsZ0JBQUlBLGVBQWUxQixRQUFRRixNQUFSLEdBQWlCLENBQXBDLEVBQXVDO0FBQ25DO0FBQ0Esb0JBQUkwQixLQUFLbU0sVUFBTCxDQUFnQjNOLE9BQWhCLE1BQTZCd0IsS0FBSytMLFFBQXRDLEVBQWdEO0FBQzVDZ0IsMENBQXNCMU4sS0FBS2dHLEtBQUwsQ0FBV2hHLEtBQUswRyxHQUFMLENBQVMsQ0FBVCxFQUFZK0csZUFBZ0IsQ0FBQzFPLElBQUkwTyxZQUFMLElBQXFCLENBQWpELENBQVgsQ0FBdEI7QUFDQSx3QkFBSTlNLEtBQUtpQixXQUFMLENBQWlCOEwsbUJBQWpCLEVBQXNDRCxZQUF0QyxFQUFvRCxDQUFwRCxDQUFKLEVBQTREO0FBQ3hELCtCQUFPO0FBQ0gzTyxtQ0FBTzJPLFlBREo7QUFFSHpNLGlDQUFLakM7QUFGRix5QkFBUDtBQUlIO0FBQ0o7O0FBRUQwTyxnQ0FBZ0J0TyxRQUFRLENBQVIsSUFBYUEsUUFBUSxDQUFSLENBQTdCO0FBQ0EscUJBQU1pRixJQUFJLENBQVYsRUFBYUEsSUFBSSxDQUFqQixFQUFvQkEsR0FBcEIsRUFBeUI7QUFDckJqRiw0QkFBUWlGLENBQVIsSUFBYWpGLFFBQVFpRixJQUFJLENBQVosQ0FBYjtBQUNIO0FBQ0RqRix3QkFBUSxDQUFSLElBQWEsQ0FBYjtBQUNBQSx3QkFBUSxDQUFSLElBQWEsQ0FBYjtBQUNBMEI7QUFDSCxhQW5CRCxNQW1CTztBQUNIQTtBQUNIO0FBQ0QxQixvQkFBUTBCLFVBQVIsSUFBc0IsQ0FBdEI7QUFDQUQsc0JBQVUsQ0FBQ0EsT0FBWDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQTFDRDs7QUE0Q0EseURBQWUwTCxZQUFmLEU7Ozs7OztBQzNMQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNOQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDTEE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLEVBQUU7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25CQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7QUFFRDs7Ozs7OztBQ1ZBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FDSEE7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ0xBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3hCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxFQUFFO0FBQ2Y7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixrQkFBa0IsRUFBRTtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLGtCQUFrQixFQUFFO0FBQ2xFO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN6QkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7OztBQ3JDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2xDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMxQkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE1BQU07QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsVUFBVTtBQUNyQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0EsWUFBWSxTQUFTLEdBQUcsU0FBUztBQUNqQztBQUNBO0FBQ0E7QUFDQSxZQUFZLFNBQVMsR0FBRyxTQUFTO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBLFVBQVUsUUFBUSxpQkFBaUIsR0FBRyxpQkFBaUI7QUFDdkQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDs7Ozs7Ozs7Ozs7O0FDckNBOztBQUVlLFNBQVNuSyxJQUFULENBQWUzRCxNQUFmLEVBQXVCO0FBQ3BDLFNBQU8sMkVBQUFtUCxDQUFlN0osTUFBZixDQUFzQnRGLE1BQXRCLENBQVA7QUFDRCxDOzs7Ozs7O0FDTEQsSUFBTW1JLE9BQU87QUFDVEMsV0FBTyxtQkFBQUMsQ0FBUSxDQUFSLENBREU7QUFFVCtHLFNBQUssbUJBQUEvRyxDQUFRLEVBQVI7QUFFTDs7O0FBSlMsQ0FBYixDQU9BLHlEQUFlO0FBQ1gvQyxZQUFRLGdCQUFTK0osS0FBVCxFQUFnQnhILFNBQWhCLEVBQTJCO0FBQy9CLFlBQUl5SCxTQUFTLEVBQWI7QUFBQSxZQUNJQyxTQUFTO0FBQ0wvQyxpQkFBSyxDQURBO0FBRUxHLGlCQUFLeEUsS0FBS0MsS0FBTCxDQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBWDtBQUZBLFNBRGI7QUFBQSxZQUtJb0gsV0FBVyxFQUxmOztBQU9BLGlCQUFTN0wsSUFBVCxHQUFnQjtBQUNaOEwsaUJBQUlKLEtBQUo7QUFDQUs7QUFDSDs7QUFFRCxpQkFBU0QsSUFBVCxDQUFhRSxVQUFiLEVBQXlCO0FBQ3JCSCxxQkFBU0csV0FBV0MsRUFBcEIsSUFBMEJELFVBQTFCO0FBQ0FMLG1CQUFPL00sSUFBUCxDQUFZb04sVUFBWjtBQUNIOztBQUVELGlCQUFTRCxZQUFULEdBQXdCO0FBQ3BCLGdCQUFJblAsQ0FBSjtBQUFBLGdCQUFPUyxNQUFNLENBQWI7QUFDQSxpQkFBTVQsSUFBSSxDQUFWLEVBQWFBLElBQUkrTyxPQUFPN08sTUFBeEIsRUFBZ0NGLEdBQWhDLEVBQXFDO0FBQ2pDUyx1QkFBT3NPLE9BQU8vTyxDQUFQLEVBQVVpTSxHQUFqQjtBQUNIO0FBQ0QrQyxtQkFBTy9DLEdBQVAsR0FBYXhMLE1BQU1zTyxPQUFPN08sTUFBMUI7QUFDQThPLG1CQUFPNUMsR0FBUCxHQUFheEUsS0FBS0MsS0FBTCxDQUFXLENBQUM1RyxLQUFLb0wsR0FBTCxDQUFTMkMsT0FBTy9DLEdBQWhCLENBQUQsRUFBdUJoTCxLQUFLcUwsR0FBTCxDQUFTMEMsT0FBTy9DLEdBQWhCLENBQXZCLENBQVgsQ0FBYjtBQUNIOztBQUVEN0k7O0FBRUEsZUFBTztBQUNIOEwsaUJBQUssYUFBU0UsVUFBVCxFQUFxQjtBQUN0QixvQkFBSSxDQUFDSCxTQUFTRyxXQUFXQyxFQUFwQixDQUFMLEVBQThCO0FBQzFCSCx5QkFBSUUsVUFBSjtBQUNBRDtBQUNIO0FBQ0osYUFORTtBQU9IRyxrQkFBTSxjQUFTQyxVQUFULEVBQXFCO0FBQ3ZCO0FBQ0Esb0JBQUlDLGFBQWF2TyxLQUFLQyxHQUFMLENBQVMwRyxLQUFLaUgsR0FBTCxDQUFTVSxXQUFXVCxLQUFYLENBQWlCMUMsR0FBMUIsRUFBK0I0QyxPQUFPNUMsR0FBdEMsQ0FBVCxDQUFqQjtBQUNBLG9CQUFJb0QsYUFBYWxJLFNBQWpCLEVBQTRCO0FBQ3hCLDJCQUFPLElBQVA7QUFDSDtBQUNELHVCQUFPLEtBQVA7QUFDSCxhQWRFO0FBZUhtSSx1QkFBVyxxQkFBVztBQUNsQix1QkFBT1YsTUFBUDtBQUNILGFBakJFO0FBa0JIVyx1QkFBVyxxQkFBVztBQUNsQix1QkFBT1YsTUFBUDtBQUNIO0FBcEJFLFNBQVA7QUFzQkgsS0FwRFU7QUFxRFhXLGlCQUFhLHFCQUFTQyxRQUFULEVBQW1CUCxFQUFuQixFQUF1QlEsUUFBdkIsRUFBaUM7QUFDMUMsZUFBTztBQUNINUQsaUJBQUsyRCxTQUFTQyxRQUFULENBREY7QUFFSGYsbUJBQU9jLFFBRko7QUFHSFAsZ0JBQUlBO0FBSEQsU0FBUDtBQUtIO0FBM0RVLENBQWYsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1BBO0FBQ0E7QUFDQSxJQUFNekgsT0FBTztBQUNUQyxXQUFPLG1CQUFBQyxDQUFRLENBQVI7QUFERSxDQUFiO0FBR0EsSUFBTWdJLE9BQU87QUFDVGpJLFdBQU8sbUJBQUFDLENBQVEsRUFBUjtBQURFLENBQWI7O0FBSUE7Ozs7O0FBS08sU0FBU2lJLFFBQVQsQ0FBa0IvSSxDQUFsQixFQUFxQm9CLENBQXJCLEVBQXdCO0FBQzNCLFFBQUk0SCxPQUFPO0FBQ1BoSixXQUFHQSxDQURJO0FBRVBvQixXQUFHQSxDQUZJO0FBR1A2SCxnQkFBUSxrQkFBVztBQUNmLG1CQUFPckksS0FBS0MsS0FBTCxDQUFXLENBQUMsS0FBS2IsQ0FBTixFQUFTLEtBQUtvQixDQUFkLENBQVgsQ0FBUDtBQUNILFNBTE07QUFNUDhILGdCQUFRLGtCQUFXO0FBQ2YsbUJBQU9KLEtBQUtqSSxLQUFMLENBQVcsQ0FBQyxLQUFLYixDQUFOLEVBQVMsS0FBS29CLENBQWQsRUFBaUIsQ0FBakIsQ0FBWCxDQUFQO0FBQ0gsU0FSTTtBQVNQK0gsZUFBTyxpQkFBVztBQUNkLGlCQUFLbkosQ0FBTCxHQUFTLEtBQUtBLENBQUwsR0FBUyxHQUFULEdBQWUvRixLQUFLZ0csS0FBTCxDQUFXLEtBQUtELENBQUwsR0FBUyxHQUFwQixDQUFmLEdBQTBDL0YsS0FBS2dHLEtBQUwsQ0FBVyxLQUFLRCxDQUFMLEdBQVMsR0FBcEIsQ0FBbkQ7QUFDQSxpQkFBS29CLENBQUwsR0FBUyxLQUFLQSxDQUFMLEdBQVMsR0FBVCxHQUFlbkgsS0FBS2dHLEtBQUwsQ0FBVyxLQUFLbUIsQ0FBTCxHQUFTLEdBQXBCLENBQWYsR0FBMENuSCxLQUFLZ0csS0FBTCxDQUFXLEtBQUttQixDQUFMLEdBQVMsR0FBcEIsQ0FBbkQ7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7QUFiTSxLQUFYO0FBZUEsV0FBTzRILElBQVA7QUFDSDs7QUFFRDs7OztBQUlPLFNBQVNJLHFCQUFULENBQStCMUcsWUFBL0IsRUFBNkMyRyxlQUE3QyxFQUE4RDtBQUNqRSxRQUFJQyxZQUFZNUcsYUFBYXpCLElBQTdCO0FBQ0EsUUFBSW9DLFFBQVFYLGFBQWExQixJQUFiLENBQWtCaEIsQ0FBOUI7QUFDQSxRQUFJc0QsU0FBU1osYUFBYTFCLElBQWIsQ0FBa0JJLENBQS9CO0FBQ0EsUUFBSW1JLG9CQUFvQkYsZ0JBQWdCcEksSUFBeEM7QUFDQSxRQUFJeEgsTUFBTSxDQUFWO0FBQUEsUUFBYStQLE9BQU8sQ0FBcEI7QUFBQSxRQUF1QkMsT0FBTyxDQUE5QjtBQUFBLFFBQWlDQyxPQUFPLENBQXhDO0FBQUEsUUFBMkNDLE9BQU8sQ0FBbEQ7QUFBQSxRQUFxRDNKLENBQXJEO0FBQUEsUUFBd0RvQixDQUF4RDs7QUFFQTtBQUNBcUksV0FBT3BHLEtBQVA7QUFDQTVKLFVBQU0sQ0FBTjtBQUNBLFNBQU0ySCxJQUFJLENBQVYsRUFBYUEsSUFBSWtDLE1BQWpCLEVBQXlCbEMsR0FBekIsRUFBOEI7QUFDMUIzSCxlQUFPNlAsVUFBVUUsSUFBVixDQUFQO0FBQ0FELDBCQUFrQkUsSUFBbEIsS0FBMkJoUSxHQUEzQjtBQUNBK1AsZ0JBQVFuRyxLQUFSO0FBQ0FvRyxnQkFBUXBHLEtBQVI7QUFDSDs7QUFFRG1HLFdBQU8sQ0FBUDtBQUNBQyxXQUFPLENBQVA7QUFDQWhRLFVBQU0sQ0FBTjtBQUNBLFNBQU11RyxJQUFJLENBQVYsRUFBYUEsSUFBSXFELEtBQWpCLEVBQXdCckQsR0FBeEIsRUFBNkI7QUFDekJ2RyxlQUFPNlAsVUFBVUUsSUFBVixDQUFQO0FBQ0FELDBCQUFrQkUsSUFBbEIsS0FBMkJoUSxHQUEzQjtBQUNBK1A7QUFDQUM7QUFDSDs7QUFFRCxTQUFNckksSUFBSSxDQUFWLEVBQWFBLElBQUlrQyxNQUFqQixFQUF5QmxDLEdBQXpCLEVBQThCO0FBQzFCb0ksZUFBT3BJLElBQUlpQyxLQUFKLEdBQVksQ0FBbkI7QUFDQW9HLGVBQU8sQ0FBQ3JJLElBQUksQ0FBTCxJQUFVaUMsS0FBVixHQUFrQixDQUF6QjtBQUNBcUcsZUFBT3RJLElBQUlpQyxLQUFYO0FBQ0FzRyxlQUFPLENBQUN2SSxJQUFJLENBQUwsSUFBVWlDLEtBQWpCO0FBQ0EsYUFBTXJELElBQUksQ0FBVixFQUFhQSxJQUFJcUQsS0FBakIsRUFBd0JyRCxHQUF4QixFQUE2QjtBQUN6QnVKLDhCQUFrQkMsSUFBbEIsS0FDSUYsVUFBVUUsSUFBVixJQUFrQkQsa0JBQWtCRSxJQUFsQixDQUFsQixHQUE0Q0Ysa0JBQWtCRyxJQUFsQixDQUE1QyxHQUFzRUgsa0JBQWtCSSxJQUFsQixDQUQxRTtBQUVBSDtBQUNBQztBQUNBQztBQUNBQztBQUNIO0FBQ0o7QUFDSjs7QUFFTSxTQUFTQyxvQkFBVCxDQUE4QmxILFlBQTlCLEVBQTRDMkcsZUFBNUMsRUFBNkQ7QUFDaEUsUUFBSUMsWUFBWTVHLGFBQWF6QixJQUE3QjtBQUNBLFFBQUlvQyxRQUFRWCxhQUFhMUIsSUFBYixDQUFrQmhCLENBQTlCO0FBQ0EsUUFBSXNELFNBQVNaLGFBQWExQixJQUFiLENBQWtCSSxDQUEvQjtBQUNBLFFBQUltSSxvQkFBb0JGLGdCQUFnQnBJLElBQXhDO0FBQ0EsUUFBSXhILE1BQU0sQ0FBVjs7QUFFQTtBQUNBLFNBQUssSUFBSVQsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcUssS0FBcEIsRUFBMkJySyxHQUEzQixFQUFnQztBQUM1QlMsZUFBTzZQLFVBQVV0USxDQUFWLENBQVA7QUFDQXVRLDBCQUFrQnZRLENBQWxCLElBQXVCUyxHQUF2QjtBQUNIOztBQUVELFNBQUssSUFBSW9RLElBQUksQ0FBYixFQUFnQkEsSUFBSXZHLE1BQXBCLEVBQTRCdUcsR0FBNUIsRUFBaUM7QUFDN0JwUSxjQUFNLENBQU47QUFDQSxhQUFLLElBQUlxUSxJQUFJLENBQWIsRUFBZ0JBLElBQUl6RyxLQUFwQixFQUEyQnlHLEdBQTNCLEVBQWdDO0FBQzVCclEsbUJBQU82UCxVQUFVTyxJQUFJeEcsS0FBSixHQUFZeUcsQ0FBdEIsQ0FBUDtBQUNBUCw4QkFBb0JNLENBQUQsR0FBTXhHLEtBQVAsR0FBZ0J5RyxDQUFsQyxJQUF1Q3JRLE1BQU04UCxrQkFBa0IsQ0FBQ00sSUFBSSxDQUFMLElBQVV4RyxLQUFWLEdBQWtCeUcsQ0FBcEMsQ0FBN0M7QUFDSDtBQUNKO0FBQ0o7O0FBRU0sU0FBU0MsY0FBVCxDQUF3QnJILFlBQXhCLEVBQXNDcEMsU0FBdEMsRUFBaUQwSixhQUFqRCxFQUFnRTtBQUNuRSxRQUFJLENBQUNBLGFBQUwsRUFBb0I7QUFDaEJBLHdCQUFnQnRILFlBQWhCO0FBQ0g7QUFDRCxRQUFJNEcsWUFBWTVHLGFBQWF6QixJQUE3QjtBQUFBLFFBQW1DL0gsU0FBU29RLFVBQVVwUSxNQUF0RDtBQUFBLFFBQThEK1EsYUFBYUQsY0FBYy9JLElBQXpGOztBQUVBLFdBQU8vSCxRQUFQLEVBQWlCO0FBQ2IrUSxtQkFBVy9RLE1BQVgsSUFBcUJvUSxVQUFVcFEsTUFBVixJQUFvQm9ILFNBQXBCLEdBQWdDLENBQWhDLEdBQW9DLENBQXpEO0FBQ0g7QUFDSjs7QUFFTSxTQUFTNEosZ0JBQVQsQ0FBMEJ4SCxZQUExQixFQUF3Q3lILFlBQXhDLEVBQXNEO0FBQ3pELFFBQUksQ0FBQ0EsWUFBTCxFQUFtQjtBQUNmQSx1QkFBZSxDQUFmO0FBQ0g7QUFDRCxRQUFJYixZQUFZNUcsYUFBYXpCLElBQTdCO0FBQUEsUUFDSS9ILFNBQVNvUSxVQUFVcFEsTUFEdkI7QUFBQSxRQUVJa1IsV0FBVyxJQUFJRCxZQUZuQjtBQUFBLFFBR0lFLFlBQVksS0FBS0YsWUFIckI7QUFBQSxRQUlJRyxPQUFPLElBQUlDLFVBQUosQ0FBZUYsU0FBZixDQUpYOztBQU1BLFdBQU9uUixRQUFQLEVBQWlCO0FBQ2JvUixhQUFLaEIsVUFBVXBRLE1BQVYsS0FBcUJrUixRQUExQjtBQUNIO0FBQ0QsV0FBT0UsSUFBUDtBQUNIOztBQUVNLFNBQVNFLFdBQVQsQ0FBcUIxUixJQUFyQixFQUEyQjtBQUM5QixRQUFJRSxDQUFKO0FBQUEsUUFDSUUsU0FBU0osS0FBS0ksTUFEbEI7QUFBQSxRQUVJdVIsT0FBTzNSLEtBQUssQ0FBTCxDQUZYO0FBQUEsUUFHSWtQLFNBQVNsUCxLQUFLLENBQUwsQ0FIYjtBQUFBLFFBSUk0UixLQUpKOztBQU1BLFNBQUsxUixJQUFJLENBQVQsRUFBWUEsSUFBSUUsU0FBUyxDQUF6QixFQUE0QkYsR0FBNUIsRUFBaUM7QUFDN0IwUixnQkFBUTVSLEtBQUtFLElBQUksQ0FBVCxDQUFSO0FBQ0E7QUFDQUYsYUFBS0UsSUFBSSxDQUFULElBQWlCZ1AsU0FBUyxDQUFWLEdBQWV5QyxJQUFmLEdBQXNCQyxLQUF4QixHQUFrQyxHQUFoRDtBQUNBRCxlQUFPekMsTUFBUDtBQUNBQSxpQkFBUzBDLEtBQVQ7QUFDSDtBQUNELFdBQU81UixJQUFQO0FBQ0g7O0FBRU0sU0FBUzZSLHNCQUFULENBQWdDakksWUFBaEMsRUFBOEN5SCxZQUE5QyxFQUE0RDtBQUMvRCxRQUFJLENBQUNBLFlBQUwsRUFBbUI7QUFDZkEsdUJBQWUsQ0FBZjtBQUNIO0FBQ0QsUUFBSUcsSUFBSjtBQUFBLFFBQ0loSyxTQURKO0FBQUEsUUFFSThKLFdBQVcsSUFBSUQsWUFGbkI7O0FBSUEsYUFBU1MsRUFBVCxDQUFZeE8sSUFBWixFQUFrQm5CLEdBQWxCLEVBQXVCO0FBQ25CLFlBQUl4QixNQUFNLENBQVY7QUFBQSxZQUFhVCxDQUFiO0FBQ0EsYUFBTUEsSUFBSW9ELElBQVYsRUFBZ0JwRCxLQUFLaUMsR0FBckIsRUFBMEJqQyxHQUExQixFQUErQjtBQUMzQlMsbUJBQU82USxLQUFLdFIsQ0FBTCxDQUFQO0FBQ0g7QUFDRCxlQUFPUyxHQUFQO0FBQ0g7O0FBRUQsYUFBU29SLEVBQVQsQ0FBWXpPLElBQVosRUFBa0JuQixHQUFsQixFQUF1QjtBQUNuQixZQUFJakMsQ0FBSjtBQUFBLFlBQU9TLE1BQU0sQ0FBYjs7QUFFQSxhQUFNVCxJQUFJb0QsSUFBVixFQUFnQnBELEtBQUtpQyxHQUFyQixFQUEwQmpDLEdBQTFCLEVBQStCO0FBQzNCUyxtQkFBT1QsSUFBSXNSLEtBQUt0UixDQUFMLENBQVg7QUFDSDs7QUFFRCxlQUFPUyxHQUFQO0FBQ0g7O0FBRUQsYUFBU3FSLGtCQUFULEdBQThCO0FBQzFCLFlBQUlDLE1BQU0sQ0FBQyxDQUFELENBQVY7QUFBQSxZQUFlQyxFQUFmO0FBQUEsWUFBbUJDLEVBQW5CO0FBQUEsWUFBdUJDLEdBQXZCO0FBQUEsWUFBNEJDLENBQTVCO0FBQUEsWUFBK0JDLEVBQS9CO0FBQUEsWUFBbUNDLEVBQW5DO0FBQUEsWUFBdUNDLEdBQXZDO0FBQUEsWUFDSTNLLE1BQU0sQ0FBQyxLQUFLd0osWUFBTixJQUFzQixDQURoQzs7QUFHQUcsZUFBT0osaUJBQWlCeEgsWUFBakIsRUFBK0J5SCxZQUEvQixDQUFQO0FBQ0EsYUFBTWdCLElBQUksQ0FBVixFQUFhQSxJQUFJeEssR0FBakIsRUFBc0J3SyxHQUF0QixFQUEyQjtBQUN2QkgsaUJBQUtKLEdBQUcsQ0FBSCxFQUFNTyxDQUFOLENBQUw7QUFDQUYsaUJBQUtMLEdBQUdPLElBQUksQ0FBUCxFQUFVeEssR0FBVixDQUFMO0FBQ0F1SyxrQkFBTUYsS0FBS0MsRUFBWDtBQUNBLGdCQUFJQyxRQUFRLENBQVosRUFBZTtBQUNYQSxzQkFBTSxDQUFOO0FBQ0g7QUFDREUsaUJBQUtQLEdBQUcsQ0FBSCxFQUFNTSxDQUFOLElBQVdGLEVBQWhCO0FBQ0FJLGlCQUFLUixHQUFHTSxJQUFJLENBQVAsRUFBVXhLLEdBQVYsSUFBaUJxSyxFQUF0QjtBQUNBTSxrQkFBTUYsS0FBS0MsRUFBWDtBQUNBTixnQkFBSUksQ0FBSixJQUFTRyxNQUFNQSxHQUFOLEdBQVlKLEdBQXJCO0FBQ0g7QUFDRCxlQUFPLDhEQUFBL08sQ0FBWXVFLFFBQVosQ0FBcUJxSyxHQUFyQixDQUFQO0FBQ0g7O0FBRUR6SyxnQkFBWXdLLG9CQUFaO0FBQ0EsV0FBT3hLLGFBQWE4SixRQUFwQjtBQUNIOztBQUVNLFNBQVNtQixhQUFULENBQXVCN0ksWUFBdkIsRUFBcUNzSCxhQUFyQyxFQUFvRDtBQUN2RCxRQUFJMUosWUFBWXFLLHVCQUF1QmpJLFlBQXZCLENBQWhCOztBQUVBcUgsbUJBQWVySCxZQUFmLEVBQTZCcEMsU0FBN0IsRUFBd0MwSixhQUF4QztBQUNBLFdBQU8xSixTQUFQO0FBQ0g7O0FBRUQ7QUFDTyxTQUFTa0wsa0JBQVQsQ0FBNEI5SSxZQUE1QixFQUEwQzJHLGVBQTFDLEVBQTJEVyxhQUEzRCxFQUEwRTtBQUM3RUoseUJBQXFCbEgsWUFBckIsRUFBbUMyRyxlQUFuQzs7QUFFQSxRQUFJLENBQUNXLGFBQUwsRUFBb0I7QUFDaEJBLHdCQUFnQnRILFlBQWhCO0FBQ0g7QUFDRCxRQUFJNEcsWUFBWTVHLGFBQWF6QixJQUE3QjtBQUNBLFFBQUlnSixhQUFhRCxjQUFjL0ksSUFBL0I7QUFDQSxRQUFJb0MsUUFBUVgsYUFBYTFCLElBQWIsQ0FBa0JoQixDQUE5QjtBQUNBLFFBQUlzRCxTQUFTWixhQUFhMUIsSUFBYixDQUFrQkksQ0FBL0I7QUFDQSxRQUFJbUksb0JBQW9CRixnQkFBZ0JwSSxJQUF4QztBQUNBLFFBQUl4SCxNQUFNLENBQVY7QUFBQSxRQUFhb1EsQ0FBYjtBQUFBLFFBQWdCQyxDQUFoQjtBQUFBLFFBQW1CckcsU0FBUyxDQUE1QjtBQUFBLFFBQStCZ0ksQ0FBL0I7QUFBQSxRQUFrQ0MsQ0FBbEM7QUFBQSxRQUFxQ0MsQ0FBckM7QUFBQSxRQUF3Q0MsQ0FBeEM7QUFBQSxRQUEyQ0MsR0FBM0M7QUFBQSxRQUFnRDdLLE9BQU8sQ0FBQ3lDLFNBQVMsQ0FBVCxHQUFhLENBQWQsS0FBb0JBLFNBQVMsQ0FBVCxHQUFhLENBQWpDLENBQXZEOztBQUVBO0FBQ0EsU0FBTW9HLElBQUksQ0FBVixFQUFhQSxLQUFLcEcsTUFBbEIsRUFBMEJvRyxHQUExQixFQUErQjtBQUMzQixhQUFNQyxJQUFJLENBQVYsRUFBYUEsSUFBSXpHLEtBQWpCLEVBQXdCeUcsR0FBeEIsRUFBNkI7QUFDekJHLHVCQUFhSixDQUFELEdBQU14RyxLQUFQLEdBQWdCeUcsQ0FBM0IsSUFBZ0MsQ0FBaEM7QUFDQUcsdUJBQVksQ0FBRTNHLFNBQVMsQ0FBVixHQUFldUcsQ0FBaEIsSUFBcUJ4RyxLQUF0QixHQUErQnlHLENBQTFDLElBQStDLENBQS9DO0FBQ0g7QUFDSjs7QUFFRDtBQUNBLFNBQU1ELElBQUlwRyxNQUFWLEVBQWtCb0csSUFBSXZHLFNBQVNHLE1BQS9CLEVBQXVDb0csR0FBdkMsRUFBNEM7QUFDeEMsYUFBTUMsSUFBSSxDQUFWLEVBQWFBLEtBQUtyRyxNQUFsQixFQUEwQnFHLEdBQTFCLEVBQStCO0FBQzNCRyx1QkFBYUosQ0FBRCxHQUFNeEcsS0FBUCxHQUFnQnlHLENBQTNCLElBQWdDLENBQWhDO0FBQ0FHLHVCQUFhSixDQUFELEdBQU14RyxLQUFQLElBQWlCQSxRQUFRLENBQVIsR0FBWXlHLENBQTdCLENBQVgsSUFBOEMsQ0FBOUM7QUFDSDtBQUNKOztBQUVELFNBQU1ELElBQUlwRyxTQUFTLENBQW5CLEVBQXNCb0csSUFBSXZHLFNBQVNHLE1BQVQsR0FBa0IsQ0FBNUMsRUFBK0NvRyxHQUEvQyxFQUFvRDtBQUNoRCxhQUFNQyxJQUFJckcsU0FBUyxDQUFuQixFQUFzQnFHLElBQUl6RyxRQUFRSSxNQUFsQyxFQUEwQ3FHLEdBQTFDLEVBQStDO0FBQzNDMkIsZ0JBQUlsQyxrQkFBa0IsQ0FBQ00sSUFBSXBHLE1BQUosR0FBYSxDQUFkLElBQW1CSixLQUFuQixJQUE0QnlHLElBQUlyRyxNQUFKLEdBQWEsQ0FBekMsQ0FBbEIsQ0FBSjtBQUNBaUksZ0JBQUluQyxrQkFBa0IsQ0FBQ00sSUFBSXBHLE1BQUosR0FBYSxDQUFkLElBQW1CSixLQUFuQixJQUE0QnlHLElBQUlyRyxNQUFoQyxDQUFsQixDQUFKO0FBQ0FrSSxnQkFBSXBDLGtCQUFrQixDQUFDTSxJQUFJcEcsTUFBTCxJQUFlSixLQUFmLElBQXdCeUcsSUFBSXJHLE1BQUosR0FBYSxDQUFyQyxDQUFsQixDQUFKO0FBQ0FtSSxnQkFBSXJDLGtCQUFrQixDQUFDTSxJQUFJcEcsTUFBTCxJQUFlSixLQUFmLElBQXdCeUcsSUFBSXJHLE1BQTVCLENBQWxCLENBQUo7QUFDQWhLLGtCQUFNbVMsSUFBSUQsQ0FBSixHQUFRRCxDQUFSLEdBQVlELENBQWxCO0FBQ0FJLGtCQUFNcFMsTUFBT3VILElBQWI7QUFDQWlKLHVCQUFXSixJQUFJeEcsS0FBSixHQUFZeUcsQ0FBdkIsSUFBNEJSLFVBQVVPLElBQUl4RyxLQUFKLEdBQVl5RyxDQUF0QixJQUE0QitCLE1BQU0sQ0FBbEMsR0FBdUMsQ0FBdkMsR0FBMkMsQ0FBdkU7QUFDSDtBQUNKO0FBQ0o7O0FBRU0sU0FBU0MsT0FBVCxDQUFpQi9ELE1BQWpCLEVBQXlCekgsU0FBekIsRUFBb0N1SSxRQUFwQyxFQUE4QztBQUNqRCxRQUFJN1AsQ0FBSjtBQUFBLFFBQU9tUyxDQUFQO0FBQUEsUUFBVVcsT0FBVjtBQUFBLFFBQW1CaEUsS0FBbkI7QUFBQSxRQUEwQmlFLFdBQVcsRUFBckM7O0FBRUEsUUFBSSxDQUFDbEQsUUFBTCxFQUFlO0FBQ1hBLG1CQUFXLEtBQVg7QUFDSDs7QUFFRCxhQUFTbUQsWUFBVCxDQUFzQnBELFFBQXRCLEVBQWdDO0FBQzVCLFlBQUlxRCxRQUFRLEtBQVo7QUFDQSxhQUFNZCxJQUFJLENBQVYsRUFBYUEsSUFBSVksU0FBUzdTLE1BQTFCLEVBQWtDaVMsR0FBbEMsRUFBdUM7QUFDbkNXLHNCQUFVQyxTQUFTWixDQUFULENBQVY7QUFDQSxnQkFBSVcsUUFBUXhELElBQVIsQ0FBYU0sUUFBYixDQUFKLEVBQTRCO0FBQ3hCa0Qsd0JBQVE1RCxHQUFSLENBQVlVLFFBQVo7QUFDQXFELHdCQUFRLElBQVI7QUFDSDtBQUNKO0FBQ0QsZUFBT0EsS0FBUDtBQUNIOztBQUVEO0FBQ0EsU0FBTWpULElBQUksQ0FBVixFQUFhQSxJQUFJK08sT0FBTzdPLE1BQXhCLEVBQWdDRixHQUFoQyxFQUFxQztBQUNqQzhPLGdCQUFRLHlEQUFBb0UsQ0FBU3ZELFdBQVQsQ0FBcUJaLE9BQU8vTyxDQUFQLENBQXJCLEVBQWdDQSxDQUFoQyxFQUFtQzZQLFFBQW5DLENBQVI7QUFDQSxZQUFJLENBQUNtRCxhQUFhbEUsS0FBYixDQUFMLEVBQTBCO0FBQ3RCaUUscUJBQVMvUSxJQUFULENBQWMseURBQUFrUixDQUFTbk8sTUFBVCxDQUFnQitKLEtBQWhCLEVBQXVCeEgsU0FBdkIsQ0FBZDtBQUNIO0FBQ0o7QUFDRCxXQUFPeUwsUUFBUDtBQUNIOztBQUVNLElBQU1JLFNBQVM7QUFDbEJDLFdBQU8sZUFBU3JFLE1BQVQsRUFBaUIzQyxHQUFqQixFQUFzQjtBQUN6QixZQUFJaUgsU0FBSjtBQUFBLFlBQWVDLGdCQUFnQixFQUEvQjtBQUFBLFlBQW1DQyxNQUFNLEVBQXpDO0FBQUEsWUFBNkNuUixTQUFTLEVBQXREO0FBQUEsWUFBMERvUixZQUFZLENBQXRFO0FBQUEsWUFBeUVDLGFBQWEsQ0FBdEY7O0FBRUEsaUJBQVNMLEtBQVQsQ0FBZU0sR0FBZixFQUFvQkMsT0FBcEIsRUFBNkI7QUFDekIsZ0JBQUluSyxJQUFKO0FBQUEsZ0JBQVVvSyxFQUFWO0FBQUEsZ0JBQWNDLEtBQWQ7QUFBQSxnQkFBcUJDLFlBQXJCO0FBQUEsZ0JBQW1DQyxhQUFhLENBQWhEO0FBQUEsZ0JBQW1EQyxhQUFhL1MsS0FBS0MsR0FBTCxDQUFTa0wsSUFBSSxDQUFKLElBQVMsRUFBbEIsQ0FBaEU7QUFBQSxnQkFBdUY2RyxRQUFRLEtBQS9GOztBQUVBLHFCQUFTZ0IsS0FBVCxDQUFlQyxHQUFmLEVBQW9CQyxTQUFwQixFQUErQjtBQUMzQixvQkFBSUQsSUFBSWxOLENBQUosR0FBU21OLFVBQVVuTixDQUFWLEdBQWMrTSxVQUF2QixJQUNPRyxJQUFJbE4sQ0FBSixHQUFTbU4sVUFBVW5OLENBQVYsR0FBYytNLFVBRDlCLElBRU9HLElBQUk5TCxDQUFKLEdBQVMrTCxVQUFVL0wsQ0FBVixHQUFjNEwsVUFGOUIsSUFHT0UsSUFBSTlMLENBQUosR0FBUytMLFVBQVUvTCxDQUFWLEdBQWM0TCxVQUhsQyxFQUcrQztBQUMzQywyQkFBTyxJQUFQO0FBQ0gsaUJBTEQsTUFLTztBQUNILDJCQUFPLEtBQVA7QUFDSDtBQUNKOztBQUVEO0FBQ0E7O0FBRUF4SyxtQkFBT3VGLE9BQU8yRSxHQUFQLENBQVA7QUFDQSxnQkFBSUMsT0FBSixFQUFhO0FBQ1RHLCtCQUFlO0FBQ1g5TSx1QkFBR3dDLEtBQUt4QyxDQUFMLEdBQVNvRixJQUFJLENBQUosQ0FERDtBQUVYaEUsdUJBQUdvQixLQUFLcEIsQ0FBTCxHQUFTZ0UsSUFBSSxDQUFKO0FBRkQsaUJBQWY7QUFJSCxhQUxELE1BS087QUFDSDBILCtCQUFlO0FBQ1g5TSx1QkFBR3dDLEtBQUt4QyxDQUFMLEdBQVNvRixJQUFJLENBQUosQ0FERDtBQUVYaEUsdUJBQUdvQixLQUFLcEIsQ0FBTCxHQUFTZ0UsSUFBSSxDQUFKO0FBRkQsaUJBQWY7QUFJSDs7QUFFRHlILG9CQUFRRixVQUFVRCxNQUFNLENBQWhCLEdBQW9CQSxNQUFNLENBQWxDO0FBQ0FFLGlCQUFLN0UsT0FBTzhFLEtBQVAsQ0FBTDtBQUNBLG1CQUFPRCxNQUFNLENBQUVYLFFBQVFnQixNQUFNTCxFQUFOLEVBQVVFLFlBQVYsQ0FBVixNQUF1QyxJQUE3QyxJQUFzRDdTLEtBQUtDLEdBQUwsQ0FBUzBTLEdBQUd4TCxDQUFILEdBQU9vQixLQUFLcEIsQ0FBckIsSUFBMEJnRSxJQUFJLENBQUosQ0FBdkYsRUFBZ0c7QUFDNUZ5SCx3QkFBUUYsVUFBVUUsUUFBUSxDQUFsQixHQUFzQkEsUUFBUSxDQUF0QztBQUNBRCxxQkFBSzdFLE9BQU84RSxLQUFQLENBQUw7QUFDSDs7QUFFRCxtQkFBT1osUUFBUVksS0FBUixHQUFnQixJQUF2QjtBQUNIOztBQUVELGFBQU1SLFlBQVksQ0FBbEIsRUFBcUJBLFlBQVlDLGFBQWpDLEVBQWdERCxXQUFoRCxFQUE2RDtBQUN6RDtBQUNBRyx3QkFBWXZTLEtBQUtnRyxLQUFMLENBQVdoRyxLQUFLaUcsTUFBTCxLQUFnQjZILE9BQU83TyxNQUFsQyxDQUFaOztBQUVBO0FBQ0FxVCxrQkFBTSxFQUFOO0FBQ0FFLHlCQUFhRCxTQUFiO0FBQ0FELGdCQUFJdlIsSUFBSixDQUFTK00sT0FBTzBFLFVBQVAsQ0FBVDtBQUNBLG1CQUFPLENBQUVBLGFBQWFMLE1BQU1LLFVBQU4sRUFBa0IsSUFBbEIsQ0FBZixNQUE0QyxJQUFuRCxFQUF5RDtBQUNyREYsb0JBQUl2UixJQUFKLENBQVMrTSxPQUFPMEUsVUFBUCxDQUFUO0FBQ0g7QUFDRCxnQkFBSUQsWUFBWSxDQUFoQixFQUFtQjtBQUNmQyw2QkFBYUQsU0FBYjtBQUNBLHVCQUFPLENBQUVDLGFBQWFMLE1BQU1LLFVBQU4sRUFBa0IsS0FBbEIsQ0FBZixNQUE2QyxJQUFwRCxFQUEwRDtBQUN0REYsd0JBQUl2UixJQUFKLENBQVMrTSxPQUFPMEUsVUFBUCxDQUFUO0FBQ0g7QUFDSjs7QUFFRCxnQkFBSUYsSUFBSXJULE1BQUosR0FBYWtDLE9BQU9sQyxNQUF4QixFQUFnQztBQUM1QmtDLHlCQUFTbVIsR0FBVDtBQUNIO0FBQ0o7QUFDRCxlQUFPblIsTUFBUDtBQUNIO0FBbkVpQixDQUFmOztBQXNFQSxJQUFNZ1MsU0FBUyxDQUFmO0FBQ0EsSUFBTUMsUUFBUSxDQUFkOztBQUVBLFNBQVNDLE1BQVQsQ0FBZ0JDLGNBQWhCLEVBQWdDQyxlQUFoQyxFQUFpRDtBQUNwRCxRQUFJM0QsQ0FBSjtBQUFBLFFBQ0lDLENBREo7QUFBQSxRQUVJMkQsY0FBY0YsZUFBZXRNLElBRmpDO0FBQUEsUUFHSXlNLGVBQWVGLGdCQUFnQnZNLElBSG5DO0FBQUEsUUFJSXFDLFNBQVNpSyxlQUFldk0sSUFBZixDQUFvQkksQ0FKakM7QUFBQSxRQUtJaUMsUUFBUWtLLGVBQWV2TSxJQUFmLENBQW9CaEIsQ0FMaEM7QUFBQSxRQU1JdkcsR0FOSjtBQUFBLFFBT0lrVSxPQVBKO0FBQUEsUUFRSUMsT0FSSjtBQUFBLFFBU0lDLE9BVEo7QUFBQSxRQVVJQyxPQVZKOztBQVlBLFNBQU1qRSxJQUFJLENBQVYsRUFBYUEsSUFBSXZHLFNBQVMsQ0FBMUIsRUFBNkJ1RyxHQUE3QixFQUFrQztBQUM5QixhQUFNQyxJQUFJLENBQVYsRUFBYUEsSUFBSXpHLFFBQVEsQ0FBekIsRUFBNEJ5RyxHQUE1QixFQUFpQztBQUM3QjZELHNCQUFVOUQsSUFBSSxDQUFkO0FBQ0ErRCxzQkFBVS9ELElBQUksQ0FBZDtBQUNBZ0Usc0JBQVUvRCxJQUFJLENBQWQ7QUFDQWdFLHNCQUFVaEUsSUFBSSxDQUFkO0FBQ0FyUSxrQkFBTWdVLFlBQVlFLFVBQVV0SyxLQUFWLEdBQWtCd0ssT0FBOUIsSUFBeUNKLFlBQVlFLFVBQVV0SyxLQUFWLEdBQWtCeUssT0FBOUIsQ0FBekMsR0FDTkwsWUFBWTVELElBQUl4RyxLQUFKLEdBQVl5RyxDQUF4QixDQURNLEdBRU4yRCxZQUFZRyxVQUFVdkssS0FBVixHQUFrQndLLE9BQTlCLENBRk0sR0FFbUNKLFlBQVlHLFVBQVV2SyxLQUFWLEdBQWtCeUssT0FBOUIsQ0FGekM7QUFHQUoseUJBQWE3RCxJQUFJeEcsS0FBSixHQUFZeUcsQ0FBekIsSUFBOEJyUSxNQUFNLENBQU4sR0FBVSxDQUFWLEdBQWMsQ0FBNUM7QUFDSDtBQUNKO0FBQ0o7O0FBRU0sU0FBU3NVLEtBQVQsQ0FBZVIsY0FBZixFQUErQkMsZUFBL0IsRUFBZ0Q7QUFDbkQsUUFBSTNELENBQUo7QUFBQSxRQUNJQyxDQURKO0FBQUEsUUFFSTJELGNBQWNGLGVBQWV0TSxJQUZqQztBQUFBLFFBR0l5TSxlQUFlRixnQkFBZ0J2TSxJQUhuQztBQUFBLFFBSUlxQyxTQUFTaUssZUFBZXZNLElBQWYsQ0FBb0JJLENBSmpDO0FBQUEsUUFLSWlDLFFBQVFrSyxlQUFldk0sSUFBZixDQUFvQmhCLENBTGhDO0FBQUEsUUFNSXZHLEdBTko7QUFBQSxRQU9Ja1UsT0FQSjtBQUFBLFFBUUlDLE9BUko7QUFBQSxRQVNJQyxPQVRKO0FBQUEsUUFVSUMsT0FWSjs7QUFZQSxTQUFNakUsSUFBSSxDQUFWLEVBQWFBLElBQUl2RyxTQUFTLENBQTFCLEVBQTZCdUcsR0FBN0IsRUFBa0M7QUFDOUIsYUFBTUMsSUFBSSxDQUFWLEVBQWFBLElBQUl6RyxRQUFRLENBQXpCLEVBQTRCeUcsR0FBNUIsRUFBaUM7QUFDN0I2RCxzQkFBVTlELElBQUksQ0FBZDtBQUNBK0Qsc0JBQVUvRCxJQUFJLENBQWQ7QUFDQWdFLHNCQUFVL0QsSUFBSSxDQUFkO0FBQ0FnRSxzQkFBVWhFLElBQUksQ0FBZDtBQUNBclEsa0JBQU1nVSxZQUFZRSxVQUFVdEssS0FBVixHQUFrQndLLE9BQTlCLElBQXlDSixZQUFZRSxVQUFVdEssS0FBVixHQUFrQnlLLE9BQTlCLENBQXpDLEdBQ05MLFlBQVk1RCxJQUFJeEcsS0FBSixHQUFZeUcsQ0FBeEIsQ0FETSxHQUVOMkQsWUFBWUcsVUFBVXZLLEtBQVYsR0FBa0J3SyxPQUE5QixDQUZNLEdBRW1DSixZQUFZRyxVQUFVdkssS0FBVixHQUFrQnlLLE9BQTlCLENBRnpDO0FBR0FKLHlCQUFhN0QsSUFBSXhHLEtBQUosR0FBWXlHLENBQXpCLElBQThCclEsUUFBUSxDQUFSLEdBQVksQ0FBWixHQUFnQixDQUE5QztBQUNIO0FBQ0o7QUFDSjs7QUFFTSxTQUFTdVUsUUFBVCxDQUFrQkMsYUFBbEIsRUFBaUNDLGFBQWpDLEVBQWdEQyxrQkFBaEQsRUFBb0U7QUFDdkUsUUFBSSxDQUFDQSxrQkFBTCxFQUF5QjtBQUNyQkEsNkJBQXFCRixhQUFyQjtBQUNIO0FBQ0QsUUFBSS9VLFNBQVMrVSxjQUFjaE4sSUFBZCxDQUFtQi9ILE1BQWhDO0FBQUEsUUFDSWtWLGFBQWFILGNBQWNoTixJQUQvQjtBQUFBLFFBRUlvTixhQUFhSCxjQUFjak4sSUFGL0I7QUFBQSxRQUdJcU4sYUFBYUgsbUJBQW1CbE4sSUFIcEM7O0FBS0EsV0FBTy9ILFFBQVAsRUFBaUI7QUFDYm9WLG1CQUFXcFYsTUFBWCxJQUFxQmtWLFdBQVdsVixNQUFYLElBQXFCbVYsV0FBV25WLE1BQVgsQ0FBMUM7QUFDSDtBQUNKOztBQUVNLFNBQVNxVixTQUFULENBQW1CTixhQUFuQixFQUFrQ0MsYUFBbEMsRUFBaURDLGtCQUFqRCxFQUFxRTtBQUN4RSxRQUFJLENBQUNBLGtCQUFMLEVBQXlCO0FBQ3JCQSw2QkFBcUJGLGFBQXJCO0FBQ0g7QUFDRCxRQUFJL1UsU0FBUytVLGNBQWNoTixJQUFkLENBQW1CL0gsTUFBaEM7QUFBQSxRQUNJa1YsYUFBYUgsY0FBY2hOLElBRC9CO0FBQUEsUUFFSW9OLGFBQWFILGNBQWNqTixJQUYvQjtBQUFBLFFBR0lxTixhQUFhSCxtQkFBbUJsTixJQUhwQzs7QUFLQSxXQUFPL0gsUUFBUCxFQUFpQjtBQUNib1YsbUJBQVdwVixNQUFYLElBQXFCa1YsV0FBV2xWLE1BQVgsS0FBc0JtVixXQUFXblYsTUFBWCxDQUEzQztBQUNIO0FBQ0o7O0FBRU0sU0FBU3NWLFlBQVQsQ0FBc0I5TCxZQUF0QixFQUFvQztBQUN2QyxRQUFJeEosU0FBU3dKLGFBQWF6QixJQUFiLENBQWtCL0gsTUFBL0I7QUFBQSxRQUF1QytILE9BQU95QixhQUFhekIsSUFBM0Q7QUFBQSxRQUFpRXhILE1BQU0sQ0FBdkU7O0FBRUEsV0FBT1AsUUFBUCxFQUFpQjtBQUNiTyxlQUFPd0gsS0FBSy9ILE1BQUwsQ0FBUDtBQUNIO0FBQ0QsV0FBT08sR0FBUDtBQUNIOztBQUVNLFNBQVNnVixVQUFULENBQW9CQyxJQUFwQixFQUEwQm5DLEdBQTFCLEVBQStCaE0sU0FBL0IsRUFBMEM7QUFDN0MsUUFBSXZILENBQUo7QUFBQSxRQUFPMlYsU0FBUyxDQUFoQjtBQUFBLFFBQW1CQyxNQUFNLENBQXpCO0FBQUEsUUFBNEJwTyxRQUFRLEVBQXBDO0FBQUEsUUFBd0NxTyxLQUF4QztBQUFBLFFBQStDQyxHQUEvQztBQUFBLFFBQW9ENUIsR0FBcEQ7O0FBRUEsU0FBTWxVLElBQUksQ0FBVixFQUFhQSxJQUFJdVQsR0FBakIsRUFBc0J2VCxHQUF0QixFQUEyQjtBQUN2QndILGNBQU14SCxDQUFOLElBQVc7QUFDUDZWLG1CQUFPLENBREE7QUFFUEUsa0JBQU07QUFGQyxTQUFYO0FBSUg7O0FBRUQsU0FBTS9WLElBQUksQ0FBVixFQUFhQSxJQUFJMFYsS0FBS3hWLE1BQXRCLEVBQThCRixHQUE5QixFQUFtQztBQUMvQjZWLGdCQUFRdE8sVUFBVUUsS0FBVixDQUFnQixJQUFoQixFQUFzQixDQUFDaU8sS0FBSzFWLENBQUwsQ0FBRCxDQUF0QixDQUFSO0FBQ0EsWUFBSTZWLFFBQVFELEdBQVosRUFBaUI7QUFDYkUsa0JBQU10TyxNQUFNbU8sTUFBTixDQUFOO0FBQ0FHLGdCQUFJRCxLQUFKLEdBQVlBLEtBQVo7QUFDQUMsZ0JBQUlDLElBQUosR0FBV0wsS0FBSzFWLENBQUwsQ0FBWDtBQUNBNFYsa0JBQU03VSxPQUFPQyxTQUFiO0FBQ0EsaUJBQU1rVCxNQUFNLENBQVosRUFBZUEsTUFBTVgsR0FBckIsRUFBMEJXLEtBQTFCLEVBQWlDO0FBQzdCLG9CQUFJMU0sTUFBTTBNLEdBQU4sRUFBVzJCLEtBQVgsR0FBbUJELEdBQXZCLEVBQTRCO0FBQ3hCQSwwQkFBTXBPLE1BQU0wTSxHQUFOLEVBQVcyQixLQUFqQjtBQUNBRiw2QkFBU3pCLEdBQVQ7QUFDSDtBQUNKO0FBQ0o7QUFDSjs7QUFFRCxXQUFPMU0sS0FBUDtBQUNIOztBQUVNLFNBQVN3TyxrQkFBVCxDQUE0QkMsU0FBNUIsRUFBdUNDLE9BQXZDLEVBQWdEeEosR0FBaEQsRUFBcURwRCxLQUFyRCxFQUE0RDtBQUMvRG9ELFFBQUl5SixTQUFKLENBQWNGLFNBQWQsRUFBeUJDLE9BQXpCLEVBQWtDLENBQWxDLEVBQXFDRCxVQUFVNUwsS0FBL0MsRUFBc0Q0TCxVQUFVM0wsTUFBaEU7QUFDQSxRQUFJOEwsVUFBVTFKLElBQUlLLFlBQUosQ0FBaUJtSixPQUFqQixFQUEwQixDQUExQixFQUE2QkQsVUFBVTVMLEtBQXZDLEVBQThDNEwsVUFBVTNMLE1BQXhELEVBQWdFckMsSUFBOUU7QUFDQW9PLGdCQUFZRCxPQUFaLEVBQXFCOU0sS0FBckI7QUFDSDs7QUFFTSxTQUFTZ04sb0JBQVQsQ0FBOEI1SixHQUE5QixFQUFtQzFFLElBQW5DLEVBQXlDNUcsTUFBekMsRUFBaURrSSxLQUFqRCxFQUF3RDtBQUMzRCxRQUFJOE0sVUFBVTFKLElBQUlLLFlBQUosQ0FBaUIzTCxPQUFPNEYsQ0FBeEIsRUFBMkI1RixPQUFPZ0gsQ0FBbEMsRUFBcUNKLEtBQUtoQixDQUExQyxFQUE2Q2dCLEtBQUtJLENBQWxELEVBQXFESCxJQUFuRTtBQUNBb08sZ0JBQVlELE9BQVosRUFBcUI5TSxLQUFyQjtBQUNIOztBQUVNLFNBQVNpTiwrQkFBVCxDQUF5Q0MsVUFBekMsRUFBcUR4TyxJQUFyRCxFQUEyRHlPLFFBQTNELEVBQXFFO0FBQ3hFLFFBQUlDLFlBQVksQ0FBaEI7QUFDQSxRQUFJQyxlQUFlM08sS0FBS2hCLENBQXhCO0FBQ0EsUUFBSTRQLFNBQVMzVixLQUFLZ0csS0FBTCxDQUFXdVAsV0FBV3RXLE1BQVgsR0FBb0IsQ0FBL0IsQ0FBYjtBQUNBLFFBQUkyVyxXQUFXN08sS0FBS2hCLENBQUwsR0FBUyxDQUF4QjtBQUNBLFFBQUk4UCxZQUFZLENBQWhCO0FBQ0EsUUFBSUMsVUFBVS9PLEtBQUtoQixDQUFuQjtBQUNBLFFBQUloSCxDQUFKOztBQUVBLFdBQU8yVyxlQUFlQyxNQUF0QixFQUE4QjtBQUMxQixhQUFNNVcsSUFBSSxDQUFWLEVBQWFBLElBQUk2VyxRQUFqQixFQUEyQjdXLEdBQTNCLEVBQWdDO0FBQzVCeVcscUJBQVNLLFNBQVQsSUFBc0IsQ0FDakIsUUFBUU4sV0FBV0UsWUFBWSxDQUFaLEdBQWdCLENBQTNCLENBQVIsR0FDQSxRQUFRRixXQUFXRSxZQUFZLENBQVosR0FBZ0IsQ0FBM0IsQ0FEUixHQUVBLFFBQVFGLFdBQVdFLFlBQVksQ0FBWixHQUFnQixDQUEzQixDQUZULElBR0MsUUFBUUYsV0FBVyxDQUFDRSxZQUFZLENBQWIsSUFBa0IsQ0FBbEIsR0FBc0IsQ0FBakMsQ0FBUixHQUNBLFFBQVFGLFdBQVcsQ0FBQ0UsWUFBWSxDQUFiLElBQWtCLENBQWxCLEdBQXNCLENBQWpDLENBRFIsR0FFQSxRQUFRRixXQUFXLENBQUNFLFlBQVksQ0FBYixJQUFrQixDQUFsQixHQUFzQixDQUFqQyxDQUxULEtBTUMsUUFBUUYsV0FBWUcsWUFBRCxHQUFpQixDQUFqQixHQUFxQixDQUFoQyxDQUFSLEdBQ0EsUUFBUUgsV0FBWUcsWUFBRCxHQUFpQixDQUFqQixHQUFxQixDQUFoQyxDQURSLEdBRUEsUUFBUUgsV0FBWUcsWUFBRCxHQUFpQixDQUFqQixHQUFxQixDQUFoQyxDQVJULEtBU0MsUUFBUUgsV0FBVyxDQUFDRyxlQUFlLENBQWhCLElBQXFCLENBQXJCLEdBQXlCLENBQXBDLENBQVIsR0FDQSxRQUFRSCxXQUFXLENBQUNHLGVBQWUsQ0FBaEIsSUFBcUIsQ0FBckIsR0FBeUIsQ0FBcEMsQ0FEUixHQUVBLFFBQVFILFdBQVcsQ0FBQ0csZUFBZSxDQUFoQixJQUFxQixDQUFyQixHQUF5QixDQUFwQyxDQVhULENBRGtCLElBWWtDLENBWnhEO0FBYUFHO0FBQ0FKLHdCQUFZQSxZQUFZLENBQXhCO0FBQ0FDLDJCQUFlQSxlQUFlLENBQTlCO0FBQ0g7QUFDREQsb0JBQVlBLFlBQVlLLE9BQXhCO0FBQ0FKLHVCQUFlQSxlQUFlSSxPQUE5QjtBQUNIO0FBQ0o7O0FBRU0sU0FBU1YsV0FBVCxDQUFxQi9GLFNBQXJCLEVBQWdDbUcsUUFBaEMsRUFBMENoWCxNQUExQyxFQUFrRDtBQUNyRCxRQUFJcUgsSUFBS3dKLFVBQVVwUSxNQUFWLEdBQW1CLENBQXBCLEdBQXlCLENBQWpDO0FBQUEsUUFDSUYsQ0FESjtBQUFBLFFBRUlnWCxnQkFBZ0J2WCxVQUFVQSxPQUFPdVgsYUFBUCxLQUF5QixJQUZ2RDs7QUFJQSxRQUFJQSxhQUFKLEVBQW1CO0FBQ2YsYUFBS2hYLElBQUksQ0FBVCxFQUFZQSxJQUFJOEcsQ0FBaEIsRUFBbUI5RyxHQUFuQixFQUF3QjtBQUNwQnlXLHFCQUFTelcsQ0FBVCxJQUFjc1EsVUFBVXRRLElBQUksQ0FBSixHQUFRLENBQWxCLENBQWQ7QUFDSDtBQUNKLEtBSkQsTUFJTztBQUNILGFBQUtBLElBQUksQ0FBVCxFQUFZQSxJQUFJOEcsQ0FBaEIsRUFBbUI5RyxHQUFuQixFQUF3QjtBQUNwQnlXLHFCQUFTelcsQ0FBVCxJQUNJLFFBQVFzUSxVQUFVdFEsSUFBSSxDQUFKLEdBQVEsQ0FBbEIsQ0FBUixHQUErQixRQUFRc1EsVUFBVXRRLElBQUksQ0FBSixHQUFRLENBQWxCLENBQXZDLEdBQThELFFBQVFzUSxVQUFVdFEsSUFBSSxDQUFKLEdBQVEsQ0FBbEIsQ0FEMUU7QUFFSDtBQUNKO0FBQ0o7O0FBRU0sU0FBU2lYLGNBQVQsQ0FBd0JDLEdBQXhCLEVBQTZCQyxRQUE3QixFQUF1QzNLLE1BQXZDLEVBQStDO0FBQ2xELFFBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1RBLGlCQUFTNEssU0FBU0MsYUFBVCxDQUF1QixRQUF2QixDQUFUO0FBQ0g7QUFDRCxRQUFJQyxNQUFNLElBQUlDLEtBQUosRUFBVjtBQUNBRCxRQUFJSCxRQUFKLEdBQWVBLFFBQWY7QUFDQUcsUUFBSUUsTUFBSixHQUFhLFlBQVc7QUFDcEJoTCxlQUFPbkMsS0FBUCxHQUFlLEtBQUtBLEtBQXBCO0FBQ0FtQyxlQUFPbEMsTUFBUCxHQUFnQixLQUFLQSxNQUFyQjtBQUNBLFlBQUlvQyxNQUFNRixPQUFPTSxVQUFQLENBQWtCLElBQWxCLENBQVY7QUFDQUosWUFBSXlKLFNBQUosQ0FBYyxJQUFkLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCO0FBQ0EsWUFBSTdNLFFBQVEsSUFBSWhCLFVBQUosQ0FBZSxLQUFLK0IsS0FBTCxHQUFhLEtBQUtDLE1BQWpDLENBQVo7QUFDQW9DLFlBQUl5SixTQUFKLENBQWMsSUFBZCxFQUFvQixDQUFwQixFQUF1QixDQUF2QjtBQUNBLFlBQUlsTyxPQUFPeUUsSUFBSUssWUFBSixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixLQUFLMUMsS0FBNUIsRUFBbUMsS0FBS0MsTUFBeEMsRUFBZ0RyQyxJQUEzRDtBQUNBb08sb0JBQVlwTyxJQUFaLEVBQWtCcUIsS0FBbEI7QUFDQSxhQUFLNk4sUUFBTCxDQUFjN04sS0FBZCxFQUFxQjtBQUNqQnRDLGVBQUcsS0FBS3FELEtBRFM7QUFFakJqQyxlQUFHLEtBQUtrQztBQUZTLFNBQXJCLEVBR0csSUFISDtBQUlILEtBYkQ7QUFjQWdOLFFBQUlKLEdBQUosR0FBVUEsR0FBVjtBQUNIOztBQUVEOzs7O0FBSU8sU0FBU08sVUFBVCxDQUFvQkMsWUFBcEIsRUFBa0NDLGFBQWxDLEVBQWlEO0FBQ3BELFFBQUloUCxRQUFRK08sYUFBYXpQLElBQXpCO0FBQ0EsUUFBSThPLFVBQVVXLGFBQWExUCxJQUFiLENBQWtCaEIsQ0FBaEM7QUFDQSxRQUFJNFEsU0FBU0QsY0FBYzFQLElBQTNCO0FBQ0EsUUFBSXlPLFlBQVksQ0FBaEI7QUFDQSxRQUFJQyxlQUFlSSxPQUFuQjtBQUNBLFFBQUlILFNBQVNqTyxNQUFNekksTUFBbkI7QUFDQSxRQUFJMlcsV0FBV0UsVUFBVSxDQUF6QjtBQUNBLFFBQUlELFlBQVksQ0FBaEI7QUFDQSxXQUFPSCxlQUFlQyxNQUF0QixFQUE4QjtBQUMxQixhQUFLLElBQUk1VyxJQUFJLENBQWIsRUFBZ0JBLElBQUk2VyxRQUFwQixFQUE4QjdXLEdBQTlCLEVBQW1DO0FBQy9CNFgsbUJBQU9kLFNBQVAsSUFBb0I3VixLQUFLZ0csS0FBTCxDQUNoQixDQUFDMEIsTUFBTStOLFNBQU4sSUFBbUIvTixNQUFNK04sWUFBWSxDQUFsQixDQUFuQixHQUEwQy9OLE1BQU1nTyxZQUFOLENBQTFDLEdBQWdFaE8sTUFBTWdPLGVBQWUsQ0FBckIsQ0FBakUsSUFBNEYsQ0FENUUsQ0FBcEI7QUFFQUc7QUFDQUosd0JBQVlBLFlBQVksQ0FBeEI7QUFDQUMsMkJBQWVBLGVBQWUsQ0FBOUI7QUFDSDtBQUNERCxvQkFBWUEsWUFBWUssT0FBeEI7QUFDQUosdUJBQWVBLGVBQWVJLE9BQTlCO0FBQ0g7QUFDSjs7QUFFTSxTQUFTekosT0FBVCxDQUFpQkosR0FBakIsRUFBc0JDLEdBQXRCLEVBQTJCO0FBQzlCLFFBQUkwSyxJQUFJM0ssSUFBSSxDQUFKLENBQVI7QUFBQSxRQUNJNEssSUFBSTVLLElBQUksQ0FBSixDQURSO0FBQUEsUUFFSTJELElBQUkzRCxJQUFJLENBQUosQ0FGUjtBQUFBLFFBR0loRSxJQUFJMkgsSUFBSWlILENBSFo7QUFBQSxRQUlJOVEsSUFBSWtDLEtBQUssSUFBSWpJLEtBQUtDLEdBQUwsQ0FBVTJXLElBQUksRUFBTCxHQUFXLENBQVgsR0FBZSxDQUF4QixDQUFULENBSlI7QUFBQSxRQUtJRSxJQUFJbEgsSUFBSTNILENBTFo7QUFBQSxRQU1JOE8sSUFBSSxDQU5SO0FBQUEsUUFPSUMsSUFBSSxDQVBSO0FBQUEsUUFRSWhQLElBQUksQ0FSUjs7QUFVQWtFLFVBQU1BLE9BQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBYjs7QUFFQSxRQUFJMEssSUFBSSxFQUFSLEVBQVk7QUFDUkcsWUFBSTlPLENBQUo7QUFDQStPLFlBQUlqUixDQUFKO0FBQ0gsS0FIRCxNQUdPLElBQUk2USxJQUFJLEdBQVIsRUFBYTtBQUNoQkcsWUFBSWhSLENBQUo7QUFDQWlSLFlBQUkvTyxDQUFKO0FBQ0gsS0FITSxNQUdBLElBQUkyTyxJQUFJLEdBQVIsRUFBYTtBQUNoQkksWUFBSS9PLENBQUo7QUFDQUQsWUFBSWpDLENBQUo7QUFDSCxLQUhNLE1BR0EsSUFBSTZRLElBQUksR0FBUixFQUFhO0FBQ2hCSSxZQUFJalIsQ0FBSjtBQUNBaUMsWUFBSUMsQ0FBSjtBQUNILEtBSE0sTUFHQSxJQUFJMk8sSUFBSSxHQUFSLEVBQWE7QUFDaEJHLFlBQUloUixDQUFKO0FBQ0FpQyxZQUFJQyxDQUFKO0FBQ0gsS0FITSxNQUdBLElBQUkyTyxJQUFJLEdBQVIsRUFBYTtBQUNoQkcsWUFBSTlPLENBQUo7QUFDQUQsWUFBSWpDLENBQUo7QUFDSDtBQUNEbUcsUUFBSSxDQUFKLElBQVUsQ0FBQzZLLElBQUlELENBQUwsSUFBVSxHQUFYLEdBQWtCLENBQTNCO0FBQ0E1SyxRQUFJLENBQUosSUFBVSxDQUFDOEssSUFBSUYsQ0FBTCxJQUFVLEdBQVgsR0FBa0IsQ0FBM0I7QUFDQTVLLFFBQUksQ0FBSixJQUFVLENBQUNsRSxJQUFJOE8sQ0FBTCxJQUFVLEdBQVgsR0FBa0IsQ0FBM0I7QUFDQSxXQUFPNUssR0FBUDtBQUNIOztBQUVNLFNBQVMrSyxnQkFBVCxDQUEwQkMsQ0FBMUIsRUFBNkI7QUFDaEMsUUFBSUMsZ0JBQWdCLEVBQXBCO0FBQUEsUUFDSUMsV0FBVyxFQURmO0FBQUEsUUFFSXJZLENBRko7O0FBSUEsU0FBS0EsSUFBSSxDQUFULEVBQVlBLElBQUlpQixLQUFLcVgsSUFBTCxDQUFVSCxDQUFWLElBQWUsQ0FBL0IsRUFBa0NuWSxHQUFsQyxFQUF1QztBQUNuQyxZQUFJbVksSUFBSW5ZLENBQUosS0FBVSxDQUFkLEVBQWlCO0FBQ2JxWSxxQkFBU3JXLElBQVQsQ0FBY2hDLENBQWQ7QUFDQSxnQkFBSUEsTUFBTW1ZLElBQUluWSxDQUFkLEVBQWlCO0FBQ2JvWSw4QkFBY2xTLE9BQWQsQ0FBc0JqRixLQUFLZ0csS0FBTCxDQUFXa1IsSUFBSW5ZLENBQWYsQ0FBdEI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxXQUFPcVksU0FBU0UsTUFBVCxDQUFnQkgsYUFBaEIsQ0FBUDtBQUNIOztBQUVELFNBQVNJLG9CQUFULENBQThCQyxJQUE5QixFQUFvQ0MsSUFBcEMsRUFBMEM7QUFDdEMsUUFBSTFZLElBQUksQ0FBUjtBQUFBLFFBQ0lxRixJQUFJLENBRFI7QUFBQSxRQUVJakQsU0FBUyxFQUZiOztBQUlBLFdBQU9wQyxJQUFJeVksS0FBS3ZZLE1BQVQsSUFBbUJtRixJQUFJcVQsS0FBS3hZLE1BQW5DLEVBQTJDO0FBQ3ZDLFlBQUl1WSxLQUFLelksQ0FBTCxNQUFZMFksS0FBS3JULENBQUwsQ0FBaEIsRUFBeUI7QUFDckJqRCxtQkFBT0osSUFBUCxDQUFZeVcsS0FBS3pZLENBQUwsQ0FBWjtBQUNBQTtBQUNBcUY7QUFDSCxTQUpELE1BSU8sSUFBSW9ULEtBQUt6WSxDQUFMLElBQVUwWSxLQUFLclQsQ0FBTCxDQUFkLEVBQXVCO0FBQzFCQTtBQUNILFNBRk0sTUFFQTtBQUNIckY7QUFDSDtBQUNKO0FBQ0QsV0FBT29DLE1BQVA7QUFDSDs7QUFFTSxTQUFTdVcsa0JBQVQsQ0FBNEJDLFNBQTVCLEVBQXVDQyxPQUF2QyxFQUFnRDtBQUNuRCxRQUFJQyxZQUFZWixpQkFBaUJXLFFBQVE3UixDQUF6QixDQUFoQjtBQUFBLFFBQ0krUixZQUFZYixpQkFBaUJXLFFBQVF6USxDQUF6QixDQURoQjtBQUFBLFFBRUk0USxXQUFXL1gsS0FBSzBHLEdBQUwsQ0FBU2tSLFFBQVE3UixDQUFqQixFQUFvQjZSLFFBQVF6USxDQUE1QixDQUZmO0FBQUEsUUFHSTZRLFNBQVNULHFCQUFxQk0sU0FBckIsRUFBZ0NDLFNBQWhDLENBSGI7QUFBQSxRQUlJRyxrQkFBa0IsQ0FBQyxDQUFELEVBQUksRUFBSixFQUFRLEVBQVIsRUFBWSxFQUFaLEVBQWdCLEVBQWhCLEVBQW9CLEVBQXBCLEVBQXdCLEVBQXhCLENBSnRCO0FBQUEsUUFLSUMsaUJBQWlCO0FBQ2IsbUJBQVcsQ0FERTtBQUViLGlCQUFTLENBRkk7QUFHYixrQkFBVSxDQUhHO0FBSWIsaUJBQVMsQ0FKSTtBQUtiLG1CQUFXO0FBTEUsS0FMckI7QUFBQSxRQVlJQyxpQkFBaUJELGVBQWVQLFNBQWYsS0FBNkJPLGVBQWVFLE1BWmpFO0FBQUEsUUFhSUMsY0FBY0osZ0JBQWdCRSxjQUFoQixDQWJsQjtBQUFBLFFBY0lHLG1CQUFtQnRZLEtBQUtnRyxLQUFMLENBQVcrUixXQUFXTSxXQUF0QixDQWR2QjtBQUFBLFFBZUlFLGdCQWZKOztBQWlCQSxhQUFTQyx3QkFBVCxDQUFrQ3BCLFFBQWxDLEVBQTRDO0FBQ3hDLFlBQUlyWSxJQUFJLENBQVI7QUFBQSxZQUNJaVQsUUFBUW9GLFNBQVNwWCxLQUFLZ0csS0FBTCxDQUFXb1IsU0FBU25ZLE1BQVQsR0FBa0IsQ0FBN0IsQ0FBVCxDQURaOztBQUdBLGVBQU9GLElBQUtxWSxTQUFTblksTUFBVCxHQUFrQixDQUF2QixJQUE2Qm1ZLFNBQVNyWSxDQUFULElBQWN1WixnQkFBbEQsRUFBb0U7QUFDaEV2WjtBQUNIO0FBQ0QsWUFBSUEsSUFBSSxDQUFSLEVBQVc7QUFDUCxnQkFBSWlCLEtBQUtDLEdBQUwsQ0FBU21YLFNBQVNyWSxDQUFULElBQWN1WixnQkFBdkIsSUFBMkN0WSxLQUFLQyxHQUFMLENBQVNtWCxTQUFTclksSUFBSSxDQUFiLElBQWtCdVosZ0JBQTNCLENBQS9DLEVBQTZGO0FBQ3pGdEcsd0JBQVFvRixTQUFTclksSUFBSSxDQUFiLENBQVI7QUFDSCxhQUZELE1BRU87QUFDSGlULHdCQUFRb0YsU0FBU3JZLENBQVQsQ0FBUjtBQUNIO0FBQ0o7QUFDRCxZQUFJdVosbUJBQW1CdEcsS0FBbkIsR0FBMkJpRyxnQkFBZ0JFLGlCQUFpQixDQUFqQyxJQUFzQ0YsZ0JBQWdCRSxjQUFoQixDQUFqRSxJQUNBRyxtQkFBbUJ0RyxLQUFuQixHQUEyQmlHLGdCQUFnQkUsaUJBQWlCLENBQWpDLElBQXNDRixnQkFBZ0JFLGNBQWhCLENBRHJFLEVBQ3VHO0FBQ25HLG1CQUFPLEVBQUNwUyxHQUFHaU0sS0FBSixFQUFXN0ssR0FBRzZLLEtBQWQsRUFBUDtBQUNIO0FBQ0QsZUFBTyxJQUFQO0FBQ0g7O0FBRUR1Ryx1QkFBbUJDLHlCQUF5QlIsTUFBekIsQ0FBbkI7QUFDQSxRQUFJLENBQUNPLGdCQUFMLEVBQXVCO0FBQ25CQSwyQkFBbUJDLHlCQUF5QnZCLGlCQUFpQmMsUUFBakIsQ0FBekIsQ0FBbkI7QUFDQSxZQUFJLENBQUNRLGdCQUFMLEVBQXVCO0FBQ25CQSwrQkFBbUJDLHlCQUEwQnZCLGlCQUFpQnFCLG1CQUFtQkQsV0FBcEMsQ0FBMUIsQ0FBbkI7QUFDSDtBQUNKO0FBQ0QsV0FBT0UsZ0JBQVA7QUFDSDs7QUFFTSxTQUFTRSx3QkFBVCxDQUFrQzVXLEtBQWxDLEVBQXlDO0FBQzVDLFFBQUk2VyxZQUFZO0FBQ1o3VyxlQUFPOFcsV0FBVzlXLEtBQVgsQ0FESztBQUVaK1csY0FBTS9XLE1BQU1nWCxPQUFOLENBQWMsR0FBZCxNQUF1QmhYLE1BQU01QyxNQUFOLEdBQWUsQ0FBdEMsR0FBMEMsR0FBMUMsR0FBZ0Q7QUFGMUMsS0FBaEI7O0FBS0EsV0FBT3laLFNBQVA7QUFDSDs7QUFFTSxJQUFNSSx3QkFBd0I7QUFDakN4RyxTQUFLLGFBQVNvRyxTQUFULEVBQW9CSyxPQUFwQixFQUE2QjtBQUM5QixZQUFJTCxVQUFVRSxJQUFWLEtBQW1CLEdBQXZCLEVBQTRCO0FBQ3hCLG1CQUFPNVksS0FBS2dHLEtBQUwsQ0FBVytTLFFBQVExUCxNQUFSLElBQWtCcVAsVUFBVTdXLEtBQVYsR0FBa0IsR0FBcEMsQ0FBWCxDQUFQO0FBQ0g7QUFDSixLQUxnQztBQU1qQzRPLFdBQU8sZUFBU2lJLFNBQVQsRUFBb0JLLE9BQXBCLEVBQTZCO0FBQ2hDLFlBQUlMLFVBQVVFLElBQVYsS0FBbUIsR0FBdkIsRUFBNEI7QUFDeEIsbUJBQU81WSxLQUFLZ0csS0FBTCxDQUFXK1MsUUFBUTNQLEtBQVIsR0FBaUIyUCxRQUFRM1AsS0FBUixJQUFpQnNQLFVBQVU3VyxLQUFWLEdBQWtCLEdBQW5DLENBQTVCLENBQVA7QUFDSDtBQUNKLEtBVmdDO0FBV2pDbVgsWUFBUSxnQkFBU04sU0FBVCxFQUFvQkssT0FBcEIsRUFBNkI7QUFDakMsWUFBSUwsVUFBVUUsSUFBVixLQUFtQixHQUF2QixFQUE0QjtBQUN4QixtQkFBTzVZLEtBQUtnRyxLQUFMLENBQVcrUyxRQUFRMVAsTUFBUixHQUFrQjBQLFFBQVExUCxNQUFSLElBQWtCcVAsVUFBVTdXLEtBQVYsR0FBa0IsR0FBcEMsQ0FBN0IsQ0FBUDtBQUNIO0FBQ0osS0FmZ0M7QUFnQmpDMk8sVUFBTSxjQUFTa0ksU0FBVCxFQUFvQkssT0FBcEIsRUFBNkI7QUFDL0IsWUFBSUwsVUFBVUUsSUFBVixLQUFtQixHQUF2QixFQUE0QjtBQUN4QixtQkFBTzVZLEtBQUtnRyxLQUFMLENBQVcrUyxRQUFRM1AsS0FBUixJQUFpQnNQLFVBQVU3VyxLQUFWLEdBQWtCLEdBQW5DLENBQVgsQ0FBUDtBQUNIO0FBQ0o7QUFwQmdDLENBQTlCOztBQXVCQSxTQUFTb1gsZ0JBQVQsQ0FBMEJDLFVBQTFCLEVBQXNDQyxXQUF0QyxFQUFtREMsSUFBbkQsRUFBeUQ7QUFDNUQsUUFBSUwsVUFBVSxFQUFDM1AsT0FBTzhQLFVBQVIsRUFBb0I3UCxRQUFROFAsV0FBNUIsRUFBZDs7QUFFQSxRQUFJRSxhQUFhalgsT0FBT1ksSUFBUCxDQUFZb1csSUFBWixFQUFrQkUsTUFBbEIsQ0FBeUIsVUFBU25ZLE1BQVQsRUFBaUIrQixHQUFqQixFQUFzQjtBQUM1RCxZQUFJckIsUUFBUXVYLEtBQUtsVyxHQUFMLENBQVo7QUFBQSxZQUNJcVcsU0FBU2QseUJBQXlCNVcsS0FBekIsQ0FEYjtBQUFBLFlBRUkyWCxhQUFhVixzQkFBc0I1VixHQUF0QixFQUEyQnFXLE1BQTNCLEVBQW1DUixPQUFuQyxDQUZqQjs7QUFJQTVYLGVBQU8rQixHQUFQLElBQWNzVyxVQUFkO0FBQ0EsZUFBT3JZLE1BQVA7QUFDSCxLQVBnQixFQU9kLEVBUGMsQ0FBakI7O0FBU0EsV0FBTztBQUNIc1ksWUFBSUosV0FBVzdJLElBRFo7QUFFSGtKLFlBQUlMLFdBQVcvRyxHQUZaO0FBR0hxSCxZQUFJTixXQUFXNUksS0FBWCxHQUFtQjRJLFdBQVc3SSxJQUgvQjtBQUlIb0osWUFBSVAsV0FBV0wsTUFBWCxHQUFvQkssV0FBVy9HO0FBSmhDLEtBQVA7QUFNSCxFOzs7Ozs7O0FDOXVCRDs7Ozs7Ozs7QUFRQSxTQUFTdUgsUUFBVCxDQUFrQnRSLElBQWxCLEVBQXdCeEIsSUFBeEIsRUFBOEIrUyxDQUE5QixFQUFpQztBQUM3QixRQUFJLENBQUNBLENBQUwsRUFBUTtBQUNKQSxZQUFJO0FBQ0E5UyxrQkFBTSxJQUROO0FBRUFELGtCQUFNQTtBQUZOLFNBQUo7QUFJSDtBQUNELFNBQUtDLElBQUwsR0FBWThTLEVBQUU5UyxJQUFkO0FBQ0EsU0FBSytTLFlBQUwsR0FBb0JELEVBQUUvUyxJQUF0QjtBQUNBLFNBQUsrUyxDQUFMLEdBQVNBLENBQVQ7O0FBRUEsU0FBS3ZSLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUt4QixJQUFMLEdBQVlBLElBQVo7QUFDSDs7QUFFRDs7Ozs7QUFLQThTLFNBQVNsYixTQUFULENBQW1CMk0sSUFBbkIsR0FBMEIsVUFBU0MsTUFBVCxFQUFpQkMsS0FBakIsRUFBd0I7QUFDOUMsUUFBSUMsR0FBSixFQUNJQyxLQURKLEVBRUkxRSxJQUZKLEVBR0kyRSxPQUhKLEVBSUl4RSxDQUpKLEVBS0lwQixDQUxKLEVBTUk2RixLQU5KOztBQVFBLFFBQUksQ0FBQ0osS0FBTCxFQUFZO0FBQ1JBLGdCQUFRLEdBQVI7QUFDSDtBQUNEQyxVQUFNRixPQUFPTSxVQUFQLENBQWtCLElBQWxCLENBQU47QUFDQU4sV0FBT25DLEtBQVAsR0FBZSxLQUFLckMsSUFBTCxDQUFVaEIsQ0FBekI7QUFDQXdGLFdBQU9sQyxNQUFQLEdBQWdCLEtBQUt0QyxJQUFMLENBQVVJLENBQTFCO0FBQ0F1RSxZQUFRRCxJQUFJSyxZQUFKLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLEVBQXVCUCxPQUFPbkMsS0FBOUIsRUFBcUNtQyxPQUFPbEMsTUFBNUMsQ0FBUjtBQUNBckMsV0FBTzBFLE1BQU0xRSxJQUFiO0FBQ0EyRSxjQUFVLENBQVY7QUFDQSxTQUFLeEUsSUFBSSxDQUFULEVBQVlBLElBQUksS0FBS0osSUFBTCxDQUFVSSxDQUExQixFQUE2QkEsR0FBN0IsRUFBa0M7QUFDOUIsYUFBS3BCLElBQUksQ0FBVCxFQUFZQSxJQUFJLEtBQUtnQixJQUFMLENBQVVoQixDQUExQixFQUE2QkEsR0FBN0IsRUFBa0M7QUFDOUI2RixvQkFBUXpFLElBQUksS0FBS0osSUFBTCxDQUFVaEIsQ0FBZCxHQUFrQkEsQ0FBMUI7QUFDQTRGLHNCQUFVLEtBQUs1QyxHQUFMLENBQVNoRCxDQUFULEVBQVlvQixDQUFaLElBQWlCcUUsS0FBM0I7QUFDQXhFLGlCQUFLNEUsUUFBUSxDQUFSLEdBQVksQ0FBakIsSUFBc0JELE9BQXRCO0FBQ0EzRSxpQkFBSzRFLFFBQVEsQ0FBUixHQUFZLENBQWpCLElBQXNCRCxPQUF0QjtBQUNBM0UsaUJBQUs0RSxRQUFRLENBQVIsR0FBWSxDQUFqQixJQUFzQkQsT0FBdEI7QUFDQTNFLGlCQUFLNEUsUUFBUSxDQUFSLEdBQVksQ0FBakIsSUFBc0IsR0FBdEI7QUFDSDtBQUNKO0FBQ0RGLFVBQU0xRSxJQUFOLEdBQWFBLElBQWI7QUFDQXlFLFFBQUlNLFlBQUosQ0FBaUJMLEtBQWpCLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCO0FBQ0gsQ0E5QkQ7O0FBZ0NBOzs7Ozs7QUFNQW1PLFNBQVNsYixTQUFULENBQW1Cb0ssR0FBbkIsR0FBeUIsVUFBU2hELENBQVQsRUFBWW9CLENBQVosRUFBZTtBQUNwQyxXQUFPLEtBQUtILElBQUwsQ0FBVSxDQUFDLEtBQUt1QixJQUFMLENBQVVwQixDQUFWLEdBQWNBLENBQWYsSUFBb0IsS0FBSzRTLFlBQUwsQ0FBa0JoVSxDQUF0QyxHQUEwQyxLQUFLd0MsSUFBTCxDQUFVeEMsQ0FBcEQsR0FBd0RBLENBQWxFLENBQVA7QUFDSCxDQUZEOztBQUlBOzs7O0FBSUE4VCxTQUFTbGIsU0FBVCxDQUFtQnFiLFVBQW5CLEdBQWdDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDNUMsU0FBS0YsWUFBTCxHQUFvQkUsTUFBTWxULElBQTFCO0FBQ0EsU0FBS0MsSUFBTCxHQUFZaVQsTUFBTWpULElBQWxCO0FBQ0gsQ0FIRDs7QUFLQTs7Ozs7QUFLQTZTLFNBQVNsYixTQUFULENBQW1CdWIsVUFBbkIsR0FBZ0MsVUFBUzNSLElBQVQsRUFBZTtBQUMzQyxTQUFLQSxJQUFMLEdBQVlBLElBQVo7QUFDQSxXQUFPLElBQVA7QUFDSCxDQUhEOztBQUtBLHlEQUFnQnNSLFFBQWhCLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNTSxZQUFZLG1CQUFBdFQsQ0FBUSxDQUFSLENBQWxCOztBQUVBLElBQU11VCxVQUFVO0FBQ1pDLHFCQUFpQix3RUFETDtBQUVaQyxnQkFBWSxtRUFGQTtBQUdaQyxrQkFBYyxzRUFIRjtBQUlaQyxrQkFBYyxxRUFKRjtBQUtaQyxrQkFBYyxxRUFMRjtBQU1aQyxvQkFBZ0IsdUVBTko7QUFPWkMsd0JBQW9CLDJFQVBSO0FBUVpDLG9CQUFnQix1RUFSSjtBQVNaQyxnQkFBWSxtRUFUQTtBQVVaQyxrQkFBYyxzRUFWRjtBQVdaQyxrQkFBYyxzRUFYRjtBQVlaLG1CQUFlLHFFQVpIO0FBYVpDLG9CQUFnQix3RUFBQUM7QUFiSixDQUFoQjtBQWVBLHlEQUFlO0FBQ1huWCxZQUFRLGdCQUFTdEYsTUFBVCxFQUFpQjtBQUN2QixZQUFJMGMsMEJBQUo7QUFDQSxZQUFJQyxrQkFBa0IsRUFBdEI7O0FBRUVDOztBQUVBLGlCQUFTQSxXQUFULEdBQXVCO0FBQ25CNWMsbUJBQU82YyxPQUFQLENBQWVwWSxPQUFmLENBQXVCLFVBQVNxWSxZQUFULEVBQXVCO0FBQzFDLG9CQUFJQyxNQUFKO0FBQUEsb0JBQ0lDLGdCQUFnQixFQURwQjtBQUFBLG9CQUVJL2MsY0FBYyxFQUZsQjs7QUFJQSxvQkFBSSxRQUFPNmMsWUFBUCx5Q0FBT0EsWUFBUCxPQUF3QixRQUE1QixFQUFzQztBQUNsQ0MsNkJBQVNELGFBQWE1WixNQUF0QjtBQUNBOFosb0NBQWdCRixhQUFhOWMsTUFBN0I7QUFDSCxpQkFIRCxNQUdPLElBQUksT0FBTzhjLFlBQVAsS0FBd0IsUUFBNUIsRUFBc0M7QUFDekNDLDZCQUFTRCxZQUFUO0FBQ0g7QUFDRCxvQkFBSSxJQUFKLEVBQXFCO0FBQ2pCRyw0QkFBUUMsR0FBUixDQUFZLDZCQUFaLEVBQTJDSCxNQUEzQztBQUNIO0FBQ0Qsb0JBQUlDLGNBQWMvYyxXQUFsQixFQUErQjtBQUMzQkEsa0NBQWMrYyxjQUNUL2MsV0FEUyxDQUNHa2QsR0FESCxDQUNPLFVBQUNwVyxVQUFELEVBQWdCO0FBQzdCLCtCQUFPLElBQUk2VSxRQUFRN1UsVUFBUixDQUFKLEVBQVA7QUFDSCxxQkFIUyxDQUFkO0FBSUg7QUFDRDRWLGdDQUFnQnBhLElBQWhCLENBQXFCLElBQUlxWixRQUFRbUIsTUFBUixDQUFKLENBQW9CQyxhQUFwQixFQUFtQy9jLFdBQW5DLENBQXJCO0FBQ0gsYUFyQkQ7QUFzQkg7O0FBRUQ7Ozs7O0FBS0EsaUJBQVNtZCxlQUFULENBQXlCL2MsSUFBekIsRUFBK0JnZCxLQUEvQixFQUFzQ3pXLEdBQXRDLEVBQTJDO0FBQ3ZDLHFCQUFTMFcsVUFBVCxDQUFvQkMsTUFBcEIsRUFBNEI7QUFDeEIsb0JBQUlDLFlBQVk7QUFDWjdVLHVCQUFHNFUsU0FBUy9iLEtBQUtxTCxHQUFMLENBQVN3USxLQUFULENBREE7QUFFWjlWLHVCQUFHZ1csU0FBUy9iLEtBQUtvTCxHQUFMLENBQVN5USxLQUFUO0FBRkEsaUJBQWhCOztBQUtBaGQscUJBQUssQ0FBTCxFQUFRc0ksQ0FBUixJQUFhNlUsVUFBVTdVLENBQXZCO0FBQ0F0SSxxQkFBSyxDQUFMLEVBQVFrSCxDQUFSLElBQWFpVyxVQUFValcsQ0FBdkI7QUFDQWxILHFCQUFLLENBQUwsRUFBUXNJLENBQVIsSUFBYTZVLFVBQVU3VSxDQUF2QjtBQUNBdEkscUJBQUssQ0FBTCxFQUFRa0gsQ0FBUixJQUFhaVcsVUFBVWpXLENBQXZCO0FBQ0g7O0FBRUQ7QUFDQStWLHVCQUFXMVcsR0FBWDtBQUNBLG1CQUFPQSxNQUFNLENBQU4sS0FBWSxDQUFDOFYsa0JBQWtCNVQsaUJBQWxCLENBQW9DekksS0FBSyxDQUFMLENBQXBDLEVBQTZDLENBQTdDLENBQUQsSUFDUixDQUFDcWMsa0JBQWtCNVQsaUJBQWxCLENBQW9DekksS0FBSyxDQUFMLENBQXBDLEVBQTZDLENBQTdDLENBREwsQ0FBUCxFQUM4RDtBQUMxRHVHLHVCQUFPcEYsS0FBS2ljLElBQUwsQ0FBVTdXLE1BQU0sQ0FBaEIsQ0FBUDtBQUNBMFcsMkJBQVcsQ0FBQzFXLEdBQVo7QUFDSDtBQUNELG1CQUFPdkcsSUFBUDtBQUNIOztBQUVELGlCQUFTcWQsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDbEIsbUJBQU8sQ0FBQztBQUNKcFcsbUJBQUcsQ0FBQ29XLElBQUksQ0FBSixFQUFPLENBQVAsSUFBWUEsSUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFiLElBQTBCLENBQTFCLEdBQThCQSxJQUFJLENBQUosRUFBTyxDQUFQLENBRDdCO0FBRUpoVixtQkFBRyxDQUFDZ1YsSUFBSSxDQUFKLEVBQU8sQ0FBUCxJQUFZQSxJQUFJLENBQUosRUFBTyxDQUFQLENBQWIsSUFBMEIsQ0FBMUIsR0FBOEJBLElBQUksQ0FBSixFQUFPLENBQVA7QUFGN0IsYUFBRCxFQUdKO0FBQ0NwVyxtQkFBRyxDQUFDb1csSUFBSSxDQUFKLEVBQU8sQ0FBUCxJQUFZQSxJQUFJLENBQUosRUFBTyxDQUFQLENBQWIsSUFBMEIsQ0FBMUIsR0FBOEJBLElBQUksQ0FBSixFQUFPLENBQVAsQ0FEbEM7QUFFQ2hWLG1CQUFHLENBQUNnVixJQUFJLENBQUosRUFBTyxDQUFQLElBQVlBLElBQUksQ0FBSixFQUFPLENBQVAsQ0FBYixJQUEwQixDQUExQixHQUE4QkEsSUFBSSxDQUFKLEVBQU8sQ0FBUDtBQUZsQyxhQUhJLENBQVA7QUFPSDs7QUFFRCxpQkFBU0MsU0FBVCxDQUFtQnZkLElBQW5CLEVBQXlCO0FBQ3JCLGdCQUFJc0MsU0FBUyxJQUFiO0FBQUEsZ0JBQ0lwQyxDQURKO0FBQUEsZ0JBRUlzZCxjQUFjLDJEQUFBQyxDQUFVQyxjQUFWLENBQXlCckIsaUJBQXpCLEVBQTRDcmMsS0FBSyxDQUFMLENBQTVDLEVBQXFEQSxLQUFLLENBQUwsQ0FBckQsQ0FGbEI7O0FBSUF5ZCxZQUFBLDJEQUFBQSxDQUFVRSxZQUFWLENBQXVCSCxXQUF2Qjs7QUFFQSxpQkFBTXRkLElBQUksQ0FBVixFQUFhQSxJQUFJb2MsZ0JBQWdCbGMsTUFBcEIsSUFBOEJrQyxXQUFXLElBQXRELEVBQTREcEMsR0FBNUQsRUFBaUU7QUFDN0RvQyx5QkFBU2dhLGdCQUFnQnBjLENBQWhCLEVBQW1Ca0MsYUFBbkIsQ0FBaUNvYixZQUFZeGQsSUFBN0MsQ0FBVDtBQUNIO0FBQ0QsZ0JBQUlzQyxXQUFXLElBQWYsRUFBb0I7QUFDaEIsdUJBQU8sSUFBUDtBQUNIO0FBQ0QsbUJBQU87QUFDSHNiLDRCQUFZdGIsTUFEVDtBQUVIa2IsNkJBQWFBO0FBRlYsYUFBUDtBQUlIOztBQUVEOzs7Ozs7O0FBT0EsaUJBQVNLLG1CQUFULENBQTZCUCxHQUE3QixFQUFrQ3RkLElBQWxDLEVBQXdDOGQsU0FBeEMsRUFBbUQ7QUFDL0MsZ0JBQUlDLGFBQWE1YyxLQUFLcVgsSUFBTCxDQUFVclgsS0FBSzZjLEdBQUwsQ0FBU1YsSUFBSSxDQUFKLEVBQU8sQ0FBUCxJQUFZQSxJQUFJLENBQUosRUFBTyxDQUFQLENBQXJCLEVBQWdDLENBQWhDLElBQXFDbmMsS0FBSzZjLEdBQUwsQ0FBVVYsSUFBSSxDQUFKLEVBQU8sQ0FBUCxJQUFZQSxJQUFJLENBQUosRUFBTyxDQUFQLENBQXRCLEVBQWtDLENBQWxDLENBQS9DLENBQWpCO0FBQUEsZ0JBQ0lwZCxDQURKO0FBQUEsZ0JBRUkrZCxTQUFTLEVBRmI7QUFBQSxnQkFHSTNiLFNBQVMsSUFIYjtBQUFBLGdCQUlJNGIsR0FKSjtBQUFBLGdCQUtJZixTQUxKO0FBQUEsZ0JBTUlnQixPQUFPaGQsS0FBS3FMLEdBQUwsQ0FBU3NSLFNBQVQsQ0FOWDtBQUFBLGdCQU9JTSxPQUFPamQsS0FBS29MLEdBQUwsQ0FBU3VSLFNBQVQsQ0FQWDs7QUFTQSxpQkFBTTVkLElBQUksQ0FBVixFQUFhQSxJQUFJK2QsTUFBSixJQUFjM2IsV0FBVyxJQUF0QyxFQUE0Q3BDLEdBQTVDLEVBQWlEO0FBQzdDO0FBQ0FnZSxzQkFBTUgsYUFBYUUsTUFBYixHQUFzQi9kLENBQXRCLElBQTJCQSxJQUFJLENBQUosS0FBVSxDQUFWLEdBQWMsQ0FBQyxDQUFmLEdBQW1CLENBQTlDLENBQU47QUFDQWlkLDRCQUFZO0FBQ1I3VSx1QkFBRzRWLE1BQU1DLElBREQ7QUFFUmpYLHVCQUFHZ1gsTUFBTUU7QUFGRCxpQkFBWjtBQUlBcGUscUJBQUssQ0FBTCxFQUFRc0ksQ0FBUixJQUFhNlUsVUFBVWpXLENBQXZCO0FBQ0FsSCxxQkFBSyxDQUFMLEVBQVFrSCxDQUFSLElBQWFpVyxVQUFVN1UsQ0FBdkI7QUFDQXRJLHFCQUFLLENBQUwsRUFBUXNJLENBQVIsSUFBYTZVLFVBQVVqVyxDQUF2QjtBQUNBbEgscUJBQUssQ0FBTCxFQUFRa0gsQ0FBUixJQUFhaVcsVUFBVTdVLENBQXZCOztBQUVBaEcseUJBQVNpYixVQUFVdmQsSUFBVixDQUFUO0FBQ0g7QUFDRCxtQkFBT3NDLE1BQVA7QUFDSDs7QUFFRCxpQkFBUytiLGFBQVQsQ0FBdUJyZSxJQUF2QixFQUE2QjtBQUN6QixtQkFBT21CLEtBQUtxWCxJQUFMLENBQ0hyWCxLQUFLNmMsR0FBTCxDQUFTN2MsS0FBS0MsR0FBTCxDQUFTcEIsS0FBSyxDQUFMLEVBQVFzSSxDQUFSLEdBQVl0SSxLQUFLLENBQUwsRUFBUXNJLENBQTdCLENBQVQsRUFBMEMsQ0FBMUMsSUFDQW5ILEtBQUs2YyxHQUFMLENBQVM3YyxLQUFLQyxHQUFMLENBQVNwQixLQUFLLENBQUwsRUFBUWtILENBQVIsR0FBWWxILEtBQUssQ0FBTCxFQUFRa0gsQ0FBN0IsQ0FBVCxFQUEwQyxDQUExQyxDQUZHLENBQVA7QUFHSDs7QUFFRDs7Ozs7O0FBTUEsaUJBQVNvWCxxQkFBVCxDQUErQmhCLEdBQS9CLEVBQW9DO0FBQ2hDLGdCQUFJdGQsSUFBSixFQUNJOGQsU0FESixFQUVJeGIsTUFGSixFQUdJaWMsVUFISjs7QUFLQXZlLG1CQUFPcWQsUUFBUUMsR0FBUixDQUFQO0FBQ0FpQix5QkFBYUYsY0FBY3JlLElBQWQsQ0FBYjtBQUNBOGQsd0JBQVkzYyxLQUFLcWQsS0FBTCxDQUFXeGUsS0FBSyxDQUFMLEVBQVFzSSxDQUFSLEdBQVl0SSxLQUFLLENBQUwsRUFBUXNJLENBQS9CLEVBQWtDdEksS0FBSyxDQUFMLEVBQVFrSCxDQUFSLEdBQVlsSCxLQUFLLENBQUwsRUFBUWtILENBQXRELENBQVo7QUFDQWxILG1CQUFPK2MsZ0JBQWdCL2MsSUFBaEIsRUFBc0I4ZCxTQUF0QixFQUFpQzNjLEtBQUtnRyxLQUFMLENBQVdvWCxhQUFhLEdBQXhCLENBQWpDLENBQVA7QUFDQSxnQkFBSXZlLFNBQVMsSUFBYixFQUFrQjtBQUNkLHVCQUFPLElBQVA7QUFDSDs7QUFFRHNDLHFCQUFTaWIsVUFBVXZkLElBQVYsQ0FBVDtBQUNBLGdCQUFJc0MsV0FBVyxJQUFmLEVBQXFCO0FBQ2pCQSx5QkFBU3ViLG9CQUFvQlAsR0FBcEIsRUFBeUJ0ZCxJQUF6QixFQUErQjhkLFNBQS9CLENBQVQ7QUFDSDs7QUFFRCxnQkFBSXhiLFdBQVcsSUFBZixFQUFxQjtBQUNqQix1QkFBTyxJQUFQO0FBQ0g7O0FBSUQsbUJBQU87QUFDSHNiLDRCQUFZdGIsT0FBT3NiLFVBRGhCO0FBRUg1ZCxzQkFBTUEsSUFGSDtBQUdIZ2QsdUJBQU9jLFNBSEo7QUFJSHpiLHlCQUFTQyxPQUFPa2IsV0FBUCxDQUFtQnhkLElBSnpCO0FBS0h3SCwyQkFBV2xGLE9BQU9rYixXQUFQLENBQW1CaFc7QUFMM0IsYUFBUDtBQU9IOztBQUVELGVBQU8sU0FBU1gsTUFBVCxDQUFpQjJKLFNBQWpCLEVBQTRCO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBTWlPLHVCQUF1QixJQUFJQyxpQkFBSixDQUFzQmxPLFVBQVVoRyxNQUFWLEdBQW1CZ0csVUFBVWpHLEtBQW5ELENBQTdCO0FBQ0FnTSx3QkFBWS9GLFVBQVVySSxJQUF0QixFQUE0QnNXLG9CQUE1QixFQUFrRCxLQUFsRDs7QUFFQXBDLGdDQUFvQixJQUFJLHNFQUFKLENBQWlCO0FBQ25DL1QsbUJBQUdrSSxVQUFVaEcsTUFEc0I7QUFFbkN0RCxtQkFBR3NKLFVBQVVqRztBQUZzQixhQUFqQixFQUdqQmtVLG9CQUhpQixFQUdLQyxpQkFITCxFQUd3QixLQUh4QixDQUFwQjs7QUFLQTlCLG9CQUFRQyxHQUFSLENBQVlSLGlCQUFaO0FBQ0EsbUJBQU9pQyxzQkFBc0IsQ0FDM0JoRCxVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVixDQUQyQixFQUUzQkEsVUFBVSxDQUFDLENBQUQsRUFBSWUsa0JBQWtCblUsSUFBbEIsQ0FBdUJJLENBQTNCLENBQVYsQ0FGMkIsRUFHM0JnVCxVQUFVLENBQUNlLGtCQUFrQm5VLElBQWxCLENBQXVCaEIsQ0FBeEIsRUFBMkJtVixrQkFBa0JuVSxJQUFsQixDQUF1QkksQ0FBbEQsQ0FBVixDQUgyQixFQUkzQmdULFVBQVUsQ0FBQ2Usa0JBQWtCblUsSUFBbEIsQ0FBdUJoQixDQUF4QixFQUEyQixDQUEzQixDQUFWLENBSjJCLENBQXRCLENBQVA7QUFNRCxTQXJCRDtBQXNCSDtBQS9MVSxDQUFmOztBQWtNQSxTQUFTcVAsV0FBVCxDQUFxQi9GLFNBQXJCLEVBQWdDbUcsUUFBaEMsRUFBMENPLGFBQTFDLEVBQXlEO0FBQ3JELFFBQUlsUSxJQUFLd0osVUFBVXBRLE1BQVYsR0FBbUIsQ0FBcEIsR0FBeUIsQ0FBakM7QUFBQSxRQUFvQ0YsQ0FBcEM7O0FBRUEsUUFBSWdYLGFBQUosRUFBbUI7QUFDZixhQUFLaFgsSUFBSSxDQUFULEVBQVlBLElBQUk4RyxDQUFoQixFQUFtQjlHLEdBQW5CLEVBQXdCO0FBQ3BCeVcscUJBQVN6VyxDQUFULElBQWNzUSxVQUFVdFEsSUFBSSxDQUFKLEdBQVEsQ0FBbEIsQ0FBZDtBQUNIO0FBQ0osS0FKRCxNQUlPO0FBQ0gsYUFBS0EsSUFBSSxDQUFULEVBQVlBLElBQUk4RyxDQUFoQixFQUFtQjlHLEdBQW5CLEVBQXdCO0FBQ3BCeVcscUJBQVN6VyxDQUFULElBQ0ksUUFBUXNRLFVBQVV0USxJQUFJLENBQUosR0FBUSxDQUFsQixDQUFSLEdBQStCLFFBQVFzUSxVQUFVdFEsSUFBSSxDQUFKLEdBQVEsQ0FBbEIsQ0FBdkMsR0FBOEQsUUFBUXNRLFVBQVV0USxJQUFJLENBQUosR0FBUSxDQUFsQixDQUQxRTtBQUVIO0FBQ0o7QUFDSixFOzs7Ozs7OztBQy9PRDs7QUFFQSxJQUFJdWQsWUFBWSxFQUFoQjs7QUFFQSxJQUFJa0IsUUFBUTtBQUNSQyxTQUFLO0FBQ0RDLFlBQUksQ0FESDtBQUVEQyxjQUFNLENBQUM7QUFGTjtBQURHLENBQVo7QUFNQTs7Ozs7Ozs7O0FBU0FyQixVQUFVQyxjQUFWLEdBQTJCLFVBQVM5VCxZQUFULEVBQXVCc0ksRUFBdkIsRUFBMkJDLEVBQTNCLEVBQStCO0FBQ3RELFFBQUk0TSxLQUFLN00sR0FBR2hMLENBQUgsR0FBTyxDQUFoQjtBQUFBLFFBQ0k4WCxLQUFLOU0sR0FBRzVKLENBQUgsR0FBTyxDQURoQjtBQUFBLFFBRUkyVyxLQUFLOU0sR0FBR2pMLENBQUgsR0FBTyxDQUZoQjtBQUFBLFFBR0lnWSxLQUFLL00sR0FBRzdKLENBQUgsR0FBTyxDQUhoQjtBQUFBLFFBSUk2VyxRQUFRaGUsS0FBS0MsR0FBTCxDQUFTOGQsS0FBS0YsRUFBZCxJQUFvQjdkLEtBQUtDLEdBQUwsQ0FBUzZkLEtBQUtGLEVBQWQsQ0FKaEM7QUFBQSxRQUtJSyxNQUxKO0FBQUEsUUFNSUMsTUFOSjtBQUFBLFFBT0k1ZSxLQVBKO0FBQUEsUUFRSTZlLEtBUko7QUFBQSxRQVNJaFgsQ0FUSjtBQUFBLFFBVUk1RyxHQVZKO0FBQUEsUUFXSXdGLENBWEo7QUFBQSxRQVlJbEgsT0FBTyxFQVpYO0FBQUEsUUFhSXdRLFlBQVk1RyxhQUFhekIsSUFiN0I7QUFBQSxRQWNJb0MsUUFBUVgsYUFBYTFCLElBQWIsQ0FBa0JoQixDQWQ5QjtBQUFBLFFBZUl2RyxNQUFNLENBZlY7QUFBQSxRQWdCSW9HLEdBaEJKO0FBQUEsUUFpQkkrTyxNQUFNLEdBakJWO0FBQUEsUUFrQklqTyxNQUFNLENBbEJWOztBQW9CQSxhQUFTMFgsSUFBVCxDQUFjclcsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDaEJwQyxjQUFNeUosVUFBVXJILElBQUlvQixLQUFKLEdBQVlyQixDQUF0QixDQUFOO0FBQ0F2SSxlQUFPb0csR0FBUDtBQUNBK08sY0FBTS9PLE1BQU0rTyxHQUFOLEdBQVkvTyxHQUFaLEdBQWtCK08sR0FBeEI7QUFDQWpPLGNBQU1kLE1BQU1jLEdBQU4sR0FBWWQsR0FBWixHQUFrQmMsR0FBeEI7QUFDQTdILGFBQUtrQyxJQUFMLENBQVU2RSxHQUFWO0FBQ0g7O0FBRUQsUUFBSW9ZLEtBQUosRUFBVztBQUNQemQsY0FBTXFkLEVBQU47QUFDQUEsYUFBS0MsRUFBTDtBQUNBQSxhQUFLdGQsR0FBTDs7QUFFQUEsY0FBTXVkLEVBQU47QUFDQUEsYUFBS0MsRUFBTDtBQUNBQSxhQUFLeGQsR0FBTDtBQUNIO0FBQ0QsUUFBSXFkLEtBQUtFLEVBQVQsRUFBYTtBQUNUdmQsY0FBTXFkLEVBQU47QUFDQUEsYUFBS0UsRUFBTDtBQUNBQSxhQUFLdmQsR0FBTDs7QUFFQUEsY0FBTXNkLEVBQU47QUFDQUEsYUFBS0UsRUFBTDtBQUNBQSxhQUFLeGQsR0FBTDtBQUNIO0FBQ0QwZCxhQUFTSCxLQUFLRixFQUFkO0FBQ0FNLGFBQVNsZSxLQUFLQyxHQUFMLENBQVM4ZCxLQUFLRixFQUFkLENBQVQ7QUFDQXZlLFlBQVMyZSxTQUFTLENBQVYsR0FBZSxDQUF2QjtBQUNBOVcsUUFBSTBXLEVBQUo7QUFDQU0sWUFBUU4sS0FBS0UsRUFBTCxHQUFVLENBQVYsR0FBYyxDQUFDLENBQXZCO0FBQ0EsU0FBTWhZLElBQUk2WCxFQUFWLEVBQWM3WCxJQUFJK1gsRUFBbEIsRUFBc0IvWCxHQUF0QixFQUEyQjtBQUN2QixZQUFJaVksS0FBSixFQUFVO0FBQ05JLGlCQUFLalgsQ0FBTCxFQUFRcEIsQ0FBUjtBQUNILFNBRkQsTUFFTztBQUNIcVksaUJBQUtyWSxDQUFMLEVBQVFvQixDQUFSO0FBQ0g7QUFDRDdILGdCQUFRQSxRQUFRNGUsTUFBaEI7QUFDQSxZQUFJNWUsUUFBUSxDQUFaLEVBQWU7QUFDWDZILGdCQUFJQSxJQUFJZ1gsS0FBUjtBQUNBN2Usb0JBQVFBLFFBQVEyZSxNQUFoQjtBQUNIO0FBQ0o7O0FBRUQsV0FBTztBQUNIcGYsY0FBTUEsSUFESDtBQUVIOFYsYUFBS0EsR0FGRjtBQUdIak8sYUFBS0E7QUFIRixLQUFQO0FBS0gsQ0F0RUQ7O0FBd0VBOzs7OztBQUtBNFYsVUFBVUUsWUFBVixHQUF5QixVQUFTcmIsTUFBVCxFQUFpQjtBQUN0QyxRQUFJd1QsTUFBTXhULE9BQU93VCxHQUFqQjtBQUFBLFFBQ0lqTyxNQUFNdkYsT0FBT3VGLEdBRGpCO0FBQUEsUUFFSTdILE9BQU9zQyxPQUFPdEMsSUFGbEI7QUFBQSxRQUdJd2YsS0FISjtBQUFBLFFBSUlDLE1BSko7QUFBQSxRQUtJdlEsU0FBUzRHLE1BQU0sQ0FBQ2pPLE1BQU1pTyxHQUFQLElBQWMsQ0FMakM7QUFBQSxRQU1JNEosVUFBVSxFQU5kO0FBQUEsUUFPSUMsVUFQSjtBQUFBLFFBUUl6QixHQVJKO0FBQUEsUUFTSTFXLFlBQVksQ0FBQ0ssTUFBTWlPLEdBQVAsSUFBYyxFQVQ5QjtBQUFBLFFBVUk4SixhQUFhLENBQUNwWSxTQVZsQjtBQUFBLFFBV0l0SCxDQVhKO0FBQUEsUUFZSXFGLENBWko7O0FBY0E7QUFDQW9hLGlCQUFhM2YsS0FBSyxDQUFMLElBQVVrUCxNQUFWLEdBQW1CeVAsTUFBTUMsR0FBTixDQUFVQyxFQUE3QixHQUFrQ0YsTUFBTUMsR0FBTixDQUFVRSxJQUF6RDtBQUNBWSxZQUFReGQsSUFBUixDQUFhO0FBQ1RrUyxhQUFLLENBREk7QUFFVHJOLGFBQUsvRyxLQUFLLENBQUw7QUFGSSxLQUFiO0FBSUEsU0FBTUUsSUFBSSxDQUFWLEVBQWFBLElBQUlGLEtBQUtJLE1BQUwsR0FBYyxDQUEvQixFQUFrQ0YsR0FBbEMsRUFBdUM7QUFDbkNzZixnQkFBU3hmLEtBQUtFLElBQUksQ0FBVCxJQUFjRixLQUFLRSxDQUFMLENBQXZCO0FBQ0F1ZixpQkFBVXpmLEtBQUtFLElBQUksQ0FBVCxJQUFjRixLQUFLRSxJQUFJLENBQVQsQ0FBeEI7QUFDQSxZQUFLc2YsUUFBUUMsTUFBVCxHQUFtQkcsVUFBbkIsSUFBaUM1ZixLQUFLRSxJQUFJLENBQVQsSUFBZWdQLFNBQVMsR0FBN0QsRUFBbUU7QUFDL0RnUCxrQkFBTVMsTUFBTUMsR0FBTixDQUFVRSxJQUFoQjtBQUNILFNBRkQsTUFFTyxJQUFLVSxRQUFRQyxNQUFULEdBQW1CalksU0FBbkIsSUFBZ0N4SCxLQUFLRSxJQUFJLENBQVQsSUFBZWdQLFNBQVMsR0FBNUQsRUFBa0U7QUFDckVnUCxrQkFBTVMsTUFBTUMsR0FBTixDQUFVQyxFQUFoQjtBQUNILFNBRk0sTUFFQTtBQUNIWCxrQkFBTXlCLFVBQU47QUFDSDs7QUFFRCxZQUFJQSxlQUFlekIsR0FBbkIsRUFBd0I7QUFDcEJ3QixvQkFBUXhkLElBQVIsQ0FBYTtBQUNUa1MscUJBQUtsVSxDQURJO0FBRVQ2RyxxQkFBSy9HLEtBQUtFLENBQUw7QUFGSSxhQUFiO0FBSUF5Zix5QkFBYXpCLEdBQWI7QUFDSDtBQUNKO0FBQ0R3QixZQUFReGQsSUFBUixDQUFhO0FBQ1RrUyxhQUFLcFUsS0FBS0ksTUFERDtBQUVUMkcsYUFBSy9HLEtBQUtBLEtBQUtJLE1BQUwsR0FBYyxDQUFuQjtBQUZJLEtBQWI7O0FBS0EsU0FBTW1GLElBQUltYSxRQUFRLENBQVIsRUFBV3RMLEdBQXJCLEVBQTBCN08sSUFBSW1hLFFBQVEsQ0FBUixFQUFXdEwsR0FBekMsRUFBOEM3TyxHQUE5QyxFQUFtRDtBQUMvQ3ZGLGFBQUt1RixDQUFMLElBQVV2RixLQUFLdUYsQ0FBTCxJQUFVMkosTUFBVixHQUFtQixDQUFuQixHQUF1QixDQUFqQztBQUNIOztBQUVEO0FBQ0EsU0FBTWhQLElBQUksQ0FBVixFQUFhQSxJQUFJd2YsUUFBUXRmLE1BQVIsR0FBaUIsQ0FBbEMsRUFBcUNGLEdBQXJDLEVBQTBDO0FBQ3RDLFlBQUl3ZixRQUFReGYsSUFBSSxDQUFaLEVBQWU2RyxHQUFmLEdBQXFCMlksUUFBUXhmLENBQVIsRUFBVzZHLEdBQXBDLEVBQXlDO0FBQ3JDUyx3QkFBYWtZLFFBQVF4ZixDQUFSLEVBQVc2RyxHQUFYLEdBQWtCLENBQUMyWSxRQUFReGYsSUFBSSxDQUFaLEVBQWU2RyxHQUFmLEdBQXFCMlksUUFBUXhmLENBQVIsRUFBVzZHLEdBQWpDLElBQXdDLENBQXpDLEdBQThDLENBQWhFLEdBQXFFLENBQWpGO0FBQ0gsU0FGRCxNQUVPO0FBQ0hTLHdCQUFha1ksUUFBUXhmLElBQUksQ0FBWixFQUFlNkcsR0FBZixHQUFzQixDQUFDMlksUUFBUXhmLENBQVIsRUFBVzZHLEdBQVgsR0FBaUIyWSxRQUFReGYsSUFBSSxDQUFaLEVBQWU2RyxHQUFqQyxJQUF3QyxDQUEvRCxHQUFxRSxDQUFqRjtBQUNIOztBQUVELGFBQU14QixJQUFJbWEsUUFBUXhmLENBQVIsRUFBV2tVLEdBQXJCLEVBQTBCN08sSUFBSW1hLFFBQVF4ZixJQUFJLENBQVosRUFBZWtVLEdBQTdDLEVBQWtEN08sR0FBbEQsRUFBdUQ7QUFDbkR2RixpQkFBS3VGLENBQUwsSUFBVXZGLEtBQUt1RixDQUFMLElBQVVpQyxTQUFWLEdBQXNCLENBQXRCLEdBQTBCLENBQXBDO0FBQ0g7QUFDSjs7QUFFRCxXQUFPO0FBQ0h4SCxjQUFNQSxJQURIO0FBRUh3SCxtQkFBV0E7QUFGUixLQUFQO0FBSUgsQ0FsRUQ7O0FBb0VBOzs7QUFHQWlXLFVBQVVvQyxLQUFWLEdBQWtCO0FBQ2RDLG9CQUFnQix3QkFBUzlmLElBQVQsRUFBZTBNLE1BQWYsRUFBdUI7QUFDbkMsWUFBSXhNLENBQUo7QUFBQSxZQUNJME0sTUFBTUYsT0FBT00sVUFBUCxDQUFrQixJQUFsQixDQURWO0FBRUFOLGVBQU9uQyxLQUFQLEdBQWV2SyxLQUFLSSxNQUFwQjtBQUNBc00sZUFBT2xDLE1BQVAsR0FBZ0IsR0FBaEI7O0FBRUFvQyxZQUFJbVQsU0FBSjtBQUNBblQsWUFBSW9ULFdBQUosR0FBa0IsTUFBbEI7QUFDQSxhQUFNOWYsSUFBSSxDQUFWLEVBQWFBLElBQUlGLEtBQUtJLE1BQXRCLEVBQThCRixHQUE5QixFQUFtQztBQUMvQjBNLGdCQUFJcVQsTUFBSixDQUFXL2YsQ0FBWCxFQUFjLEdBQWQ7QUFDQTBNLGdCQUFJc1QsTUFBSixDQUFXaGdCLENBQVgsRUFBYyxNQUFNRixLQUFLRSxDQUFMLENBQXBCO0FBQ0g7QUFDRDBNLFlBQUl1VCxNQUFKO0FBQ0F2VCxZQUFJd1QsU0FBSjtBQUNILEtBZmE7O0FBaUJkQyxrQkFBYyxzQkFBU3JnQixJQUFULEVBQWUwTSxNQUFmLEVBQXVCO0FBQ2pDLFlBQUlFLE1BQU1GLE9BQU9NLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBVjtBQUFBLFlBQW1DOU0sQ0FBbkM7O0FBRUF3TSxlQUFPbkMsS0FBUCxHQUFldkssS0FBS0ksTUFBcEI7QUFDQXdNLFlBQUkwVCxTQUFKLEdBQWdCLE9BQWhCO0FBQ0EsYUFBTXBnQixJQUFJLENBQVYsRUFBYUEsSUFBSUYsS0FBS0ksTUFBdEIsRUFBOEJGLEdBQTlCLEVBQW1DO0FBQy9CLGdCQUFJRixLQUFLRSxDQUFMLE1BQVksQ0FBaEIsRUFBbUI7QUFDZjBNLG9CQUFJMlQsUUFBSixDQUFhcmdCLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0IsR0FBdEI7QUFDSDtBQUNKO0FBQ0o7QUEzQmEsQ0FBbEI7O0FBOEJBLHlEQUFldWQsU0FBZixFOzs7Ozs7OztBQ3JNQTs7QUFFQSxTQUFTK0MsZUFBVCxDQUF5QnhjLElBQXpCLEVBQStCO0FBQzNCdEUsSUFBQSxnRUFBQUEsQ0FBY3dFLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUJGLElBQXpCO0FBQ0EsU0FBS3ljLGFBQUwsR0FBcUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFyQjtBQUNIOztBQUVELElBQUlDLElBQUksQ0FBUjtBQUFBLElBQ0lDLElBQUksQ0FEUjtBQUFBLElBRUlwYyxhQUFhO0FBQ1RHLG1CQUFlLEVBQUMxQixPQUFPLENBQUMyZCxDQUFELEVBQUlELENBQUosRUFBT0MsQ0FBUCxFQUFVRCxDQUFWLEVBQWFBLENBQWIsRUFBZ0JBLENBQWhCLENBQVIsRUFETjtBQUVUL2Isa0JBQWMsRUFBQzNCLE9BQU8sQ0FBQzJkLENBQUQsRUFBSUQsQ0FBSixFQUFPQSxDQUFQLEVBQVVBLENBQVYsRUFBYUMsQ0FBYixDQUFSLEVBRkw7QUFHVDdiLGtCQUFjLEVBQUM5QixPQUFPLENBQ2xCLENBQUMwZCxDQUFELEVBQUlBLENBQUosRUFBT0MsQ0FBUCxFQUFVQSxDQUFWLEVBQWFELENBQWIsQ0FEa0IsRUFFbEIsQ0FBQ0MsQ0FBRCxFQUFJRCxDQUFKLEVBQU9BLENBQVAsRUFBVUEsQ0FBVixFQUFhQyxDQUFiLENBRmtCLEVBR2xCLENBQUNELENBQUQsRUFBSUMsQ0FBSixFQUFPRCxDQUFQLEVBQVVBLENBQVYsRUFBYUMsQ0FBYixDQUhrQixFQUlsQixDQUFDQSxDQUFELEVBQUlBLENBQUosRUFBT0QsQ0FBUCxFQUFVQSxDQUFWLEVBQWFBLENBQWIsQ0FKa0IsRUFLbEIsQ0FBQ0EsQ0FBRCxFQUFJQSxDQUFKLEVBQU9DLENBQVAsRUFBVUQsQ0FBVixFQUFhQyxDQUFiLENBTGtCLEVBTWxCLENBQUNBLENBQUQsRUFBSUQsQ0FBSixFQUFPQyxDQUFQLEVBQVVELENBQVYsRUFBYUEsQ0FBYixDQU5rQixFQU9sQixDQUFDQSxDQUFELEVBQUlDLENBQUosRUFBT0EsQ0FBUCxFQUFVRCxDQUFWLEVBQWFBLENBQWIsQ0FQa0IsRUFRbEIsQ0FBQ0EsQ0FBRCxFQUFJQSxDQUFKLEVBQU9BLENBQVAsRUFBVUMsQ0FBVixFQUFhQSxDQUFiLENBUmtCLEVBU2xCLENBQUNBLENBQUQsRUFBSUQsQ0FBSixFQUFPQSxDQUFQLEVBQVVDLENBQVYsRUFBYUQsQ0FBYixDQVRrQixFQVVsQixDQUFDQSxDQUFELEVBQUlDLENBQUosRUFBT0QsQ0FBUCxFQUFVQyxDQUFWLEVBQWFELENBQWIsQ0FWa0IsQ0FBUixFQUhMO0FBZVQxZix1QkFBbUIsRUFBQ2dDLE9BQU8sSUFBUixFQUFjNGQsVUFBVSxJQUF4QixFQWZWO0FBZ0JUNWIsb0JBQWdCLEVBQUNoQyxPQUFPLElBQVIsRUFBYzRkLFVBQVUsSUFBeEIsRUFoQlA7QUFpQlQ5ZCxZQUFRLEVBQUNFLE9BQU8sTUFBUjtBQWpCQyxDQUZqQjs7QUFzQkEsSUFBTTZkLHFCQUFxQnRjLFdBQVdHLGFBQVgsQ0FBeUIxQixLQUF6QixDQUErQnlYLE1BQS9CLENBQXNDLFVBQUM5WixHQUFELEVBQU1vRyxHQUFOO0FBQUEsV0FBY3BHLE1BQU1vRyxHQUFwQjtBQUFBLENBQXRDLEVBQStELENBQS9ELENBQTNCOztBQUVBeVosZ0JBQWdCMWdCLFNBQWhCLEdBQTRCeUQsT0FBTzBCLE1BQVAsQ0FBYyxnRUFBQXZGLENBQWNJLFNBQTVCLEVBQXVDeUUsVUFBdkMsQ0FBNUI7QUFDQWljLGdCQUFnQjFnQixTQUFoQixDQUEwQm9GLFdBQTFCLEdBQXdDc2IsZUFBeEM7O0FBRUFBLGdCQUFnQjFnQixTQUFoQixDQUEwQnVGLFlBQTFCLEdBQXlDLFVBQVNoRCxPQUFULEVBQWtCZixNQUFsQixFQUEwQlMsT0FBMUIsRUFBbUN1RCxTQUFuQyxFQUE4QztBQUNuRixRQUFJaEYsVUFBVSxFQUFkO0FBQUEsUUFDSXdCLE9BQU8sSUFEWDtBQUFBLFFBRUk1QixDQUZKO0FBQUEsUUFHSThCLGFBQWEsQ0FIakI7QUFBQSxRQUlJQyxZQUFZO0FBQ1J4QixlQUFPUSxPQUFPQyxTQUROO0FBRVJYLGNBQU0sQ0FBQyxDQUZDO0FBR1JOLGVBQU8sQ0FIQztBQUlSa0MsYUFBSztBQUpHLEtBSmhCO0FBQUEsUUFVSTFCLEtBVko7QUFBQSxRQVdJOEUsQ0FYSjtBQUFBLFFBWUk1RSxHQVpKO0FBQUEsUUFhSWtCLFVBQVVDLEtBQUtrRCxjQWJuQjs7QUFlQWpELGNBQVVBLFdBQVcsS0FBckI7QUFDQXVELGdCQUFZQSxhQUFhLEtBQXpCOztBQUVBLFFBQUksQ0FBQ2hFLE1BQUwsRUFBYTtBQUNUQSxpQkFBU1EsS0FBS1QsUUFBTCxDQUFjUyxLQUFLakMsSUFBbkIsQ0FBVDtBQUNIOztBQUVELFNBQU1LLElBQUksQ0FBVixFQUFhQSxJQUFJbUMsUUFBUWpDLE1BQXpCLEVBQWlDRixHQUFqQyxFQUFzQztBQUNsQ0ksZ0JBQVFKLENBQVIsSUFBYSxDQUFiO0FBQ0g7O0FBRUQsU0FBTUEsSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLFlBQUk0QixLQUFLakMsSUFBTCxDQUFVSyxDQUFWLElBQWU2QixPQUFuQixFQUE0QjtBQUN4QnpCLG9CQUFRMEIsVUFBUjtBQUNILFNBRkQsTUFFTztBQUNILGdCQUFJQSxlQUFlMUIsUUFBUUYsTUFBUixHQUFpQixDQUFwQyxFQUF1QztBQUNuQ08sc0JBQU0sQ0FBTjtBQUNBLHFCQUFNNEUsSUFBSSxDQUFWLEVBQWFBLElBQUlqRixRQUFRRixNQUF6QixFQUFpQ21GLEdBQWpDLEVBQXNDO0FBQ2xDNUUsMkJBQU9MLFFBQVFpRixDQUFSLENBQVA7QUFDSDtBQUNEOUUsd0JBQVFxQixLQUFLekIsYUFBTCxDQUFtQkMsT0FBbkIsRUFBNEIrQixPQUE1QixDQUFSO0FBQ0Esb0JBQUk1QixRQUFRb0IsT0FBWixFQUFxQjtBQUNqQkksOEJBQVV4QixLQUFWLEdBQWtCQSxLQUFsQjtBQUNBd0IsOEJBQVVoQyxLQUFWLEdBQWtCQyxJQUFJUyxHQUF0QjtBQUNBc0IsOEJBQVVFLEdBQVYsR0FBZ0JqQyxDQUFoQjtBQUNBLDJCQUFPK0IsU0FBUDtBQUNIO0FBQ0Qsb0JBQUlxRCxTQUFKLEVBQWU7QUFDWCx5QkFBS0MsSUFBSSxDQUFULEVBQVlBLElBQUlqRixRQUFRRixNQUFSLEdBQWlCLENBQWpDLEVBQW9DbUYsR0FBcEMsRUFBeUM7QUFDckNqRixnQ0FBUWlGLENBQVIsSUFBYWpGLFFBQVFpRixJQUFJLENBQVosQ0FBYjtBQUNIO0FBQ0RqRiw0QkFBUUEsUUFBUUYsTUFBUixHQUFpQixDQUF6QixJQUE4QixDQUE5QjtBQUNBRSw0QkFBUUEsUUFBUUYsTUFBUixHQUFpQixDQUF6QixJQUE4QixDQUE5QjtBQUNBNEI7QUFDSCxpQkFQRCxNQU9PO0FBQ0gsMkJBQU8sSUFBUDtBQUNIO0FBQ0osYUF0QkQsTUFzQk87QUFDSEE7QUFDSDtBQUNEMUIsb0JBQVEwQixVQUFSLElBQXNCLENBQXRCO0FBQ0FELHNCQUFVLENBQUNBLE9BQVg7QUFDSDtBQUNKO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0E3REQ7O0FBK0RBeWUsZ0JBQWdCMWdCLFNBQWhCLENBQTBCMEYsVUFBMUIsR0FBdUMsWUFBVztBQUM5QyxRQUFJMUQsT0FBTyxJQUFYO0FBQUEsUUFDSTJELHNCQURKO0FBQUEsUUFFSW5FLFNBQVNRLEtBQUtULFFBQUwsQ0FBY1MsS0FBS2pDLElBQW5CLENBRmI7QUFBQSxRQUdJNkYsU0FISjtBQUFBLFFBSUlvYixpQkFBaUIsQ0FKckI7O0FBTUEsV0FBTyxDQUFDcGIsU0FBUixFQUFtQjtBQUNmQSxvQkFBWTVELEtBQUt1RCxZQUFMLENBQWtCdkQsS0FBSzRDLGFBQXZCLEVBQXNDcEQsTUFBdEMsRUFBOEMsS0FBOUMsRUFBcUQsSUFBckQsQ0FBWjtBQUNBLFlBQUksQ0FBQ29FLFNBQUwsRUFBZ0I7QUFDWixtQkFBTyxJQUFQO0FBQ0g7QUFDRG9iLHlCQUFpQjNmLEtBQUtnRyxLQUFMLENBQVcsQ0FBQ3pCLFVBQVV2RCxHQUFWLEdBQWdCdUQsVUFBVXpGLEtBQTNCLElBQW9DNGdCLGtCQUEvQyxDQUFqQjtBQUNBcGIsaUNBQXlCQyxVQUFVekYsS0FBVixHQUFrQjZnQixpQkFBaUIsQ0FBNUQ7QUFDQSxZQUFJcmIsMEJBQTBCLENBQTlCLEVBQWlDO0FBQzdCLGdCQUFJM0QsS0FBS2lCLFdBQUwsQ0FBaUIwQyxzQkFBakIsRUFBeUNDLFVBQVV6RixLQUFuRCxFQUEwRCxDQUExRCxDQUFKLEVBQWtFO0FBQzlELHVCQUFPeUYsU0FBUDtBQUNIO0FBQ0o7QUFDRHBFLGlCQUFTb0UsVUFBVXZELEdBQW5CO0FBQ0F1RCxvQkFBWSxJQUFaO0FBQ0g7QUFDSixDQXRCRDs7QUF3QkE4YSxnQkFBZ0IxZ0IsU0FBaEIsQ0FBMEI2Rix5QkFBMUIsR0FBc0QsVUFBU0MsT0FBVCxFQUFrQjtBQUNwRSxRQUFJOUQsT0FBTyxJQUFYO0FBQUEsUUFDSStELHFCQURKOztBQUdBQSw0QkFBd0JELFFBQVF6RCxHQUFSLEdBQWUsQ0FBQ3lELFFBQVF6RCxHQUFSLEdBQWN5RCxRQUFRM0YsS0FBdkIsSUFBZ0MsQ0FBdkU7QUFDQSxRQUFJNEYsd0JBQXdCL0QsS0FBS2pDLElBQUwsQ0FBVU8sTUFBdEMsRUFBOEM7QUFDMUMsWUFBSTBCLEtBQUtpQixXQUFMLENBQWlCNkMsUUFBUXpELEdBQXpCLEVBQThCMEQscUJBQTlCLEVBQXFELENBQXJELENBQUosRUFBNkQ7QUFDekQsbUJBQU9ELE9BQVA7QUFDSDtBQUNKO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0FYRDs7QUFhQTRhLGdCQUFnQjFnQixTQUFoQixDQUEwQmdHLFFBQTFCLEdBQXFDLFlBQVc7QUFDNUMsUUFBSWhFLE9BQU8sSUFBWDtBQUFBLFFBQ0k4RCxPQURKO0FBQUEsUUFFSWxFLEdBRko7QUFBQSxRQUdJSixNQUhKOztBQUtBUSxTQUFLakMsSUFBTCxDQUFVMkMsT0FBVjtBQUNBbEIsYUFBU1EsS0FBS1QsUUFBTCxDQUFjUyxLQUFLakMsSUFBbkIsQ0FBVDtBQUNBK0YsY0FBVTlELEtBQUt1RCxZQUFMLENBQWtCdkQsS0FBSzZDLFlBQXZCLEVBQXFDckQsTUFBckMsRUFBNkMsS0FBN0MsRUFBb0QsSUFBcEQsQ0FBVjtBQUNBUSxTQUFLakMsSUFBTCxDQUFVMkMsT0FBVjs7QUFFQSxRQUFJb0QsWUFBWSxJQUFoQixFQUFzQjtBQUNsQixlQUFPLElBQVA7QUFDSDs7QUFFRDtBQUNBbEUsVUFBTWtFLFFBQVEzRixLQUFkO0FBQ0EyRixZQUFRM0YsS0FBUixHQUFnQjZCLEtBQUtqQyxJQUFMLENBQVVPLE1BQVYsR0FBbUJ3RixRQUFRekQsR0FBM0M7QUFDQXlELFlBQVF6RCxHQUFSLEdBQWNMLEtBQUtqQyxJQUFMLENBQVVPLE1BQVYsR0FBbUJzQixHQUFqQzs7QUFFQSxXQUFPa0UsWUFBWSxJQUFaLEdBQW1COUQsS0FBSzZELHlCQUFMLENBQStCQyxPQUEvQixDQUFuQixHQUE2RCxJQUFwRTtBQUNILENBckJEOztBQXVCQTRhLGdCQUFnQjFnQixTQUFoQixDQUEwQnFGLFdBQTFCLEdBQXdDLFVBQVM3RSxPQUFULEVBQWtCO0FBQ3RELFFBQUlpRixDQUFKO0FBQUEsUUFDSXpELE9BQU8sSUFEWDtBQUFBLFFBRUluQixNQUFNLENBRlY7QUFBQSxRQUdJb2dCLFVBSEo7QUFBQSxRQUlJdGdCLEtBSko7QUFBQSxRQUtJb0IsVUFBVUMsS0FBS2tELGNBTG5CO0FBQUEsUUFNSXpFLElBTko7QUFBQSxRQU9JMEIsWUFBWTtBQUNSeEIsZUFBT1EsT0FBT0MsU0FETjtBQUVSWCxjQUFNLENBQUMsQ0FGQztBQUdSTixlQUFPLENBSEM7QUFJUmtDLGFBQUs7QUFKRyxLQVBoQjs7QUFjQSxTQUFNb0QsSUFBSSxDQUFWLEVBQWFBLElBQUlqRixRQUFRRixNQUF6QixFQUFpQ21GLEdBQWpDLEVBQXNDO0FBQ2xDNUUsZUFBT0wsUUFBUWlGLENBQVIsQ0FBUDtBQUNIO0FBQ0QsU0FBS2hGLE9BQU8sQ0FBWixFQUFlQSxPQUFPdUIsS0FBS2dELFlBQUwsQ0FBa0IxRSxNQUF4QyxFQUFnREcsTUFBaEQsRUFBd0Q7QUFDcERFLGdCQUFRcUIsS0FBS3pCLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCd0IsS0FBS2dELFlBQUwsQ0FBa0J2RSxJQUFsQixDQUE1QixDQUFSO0FBQ0EsWUFBSUUsUUFBUXdCLFVBQVV4QixLQUF0QixFQUE2QjtBQUN6QndCLHNCQUFVMUIsSUFBVixHQUFpQkEsSUFBakI7QUFDQTBCLHNCQUFVeEIsS0FBVixHQUFrQkEsS0FBbEI7QUFDSDtBQUNKO0FBQ0QsUUFBSXdCLFVBQVV4QixLQUFWLEdBQWtCb0IsT0FBdEIsRUFBK0I7QUFDM0IsZUFBT0ksU0FBUDtBQUNIO0FBQ0osQ0E1QkQ7O0FBOEJBdWUsZ0JBQWdCMWdCLFNBQWhCLENBQTBCbUcsY0FBMUIsR0FBMkMsVUFBUy9DLFFBQVQsRUFBbUJaLE1BQW5CLEVBQTJCNEQsWUFBM0IsRUFBeUM7QUFDaEYsUUFBSWhHLENBQUo7QUFBQSxRQUNJNEIsT0FBTyxJQURYO0FBQUEsUUFFSXNTLE1BQU0sQ0FGVjtBQUFBLFFBR0k0TSxnQkFBZ0I5ZCxTQUFTOUMsTUFIN0I7QUFBQSxRQUlJRSxVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FKZDtBQUFBLFFBS0lDLElBTEo7O0FBT0EsV0FBTzZULE1BQU00TSxhQUFiLEVBQTRCO0FBQ3hCLGFBQUs5Z0IsSUFBSSxDQUFULEVBQVlBLElBQUksQ0FBaEIsRUFBbUJBLEdBQW5CLEVBQXdCO0FBQ3BCSSxvQkFBUUosQ0FBUixJQUFhZ0QsU0FBU2tSLEdBQVQsSUFBZ0IsS0FBS3FNLGFBQUwsQ0FBbUIsQ0FBbkIsQ0FBN0I7QUFDQXJNLG1CQUFPLENBQVA7QUFDSDtBQUNEN1QsZUFBT3VCLEtBQUtxRCxXQUFMLENBQWlCN0UsT0FBakIsQ0FBUDtBQUNBLFlBQUksQ0FBQ0MsSUFBTCxFQUFXO0FBQ1AsbUJBQU8sSUFBUDtBQUNIO0FBQ0QrQixlQUFPSixJQUFQLENBQVkzQixLQUFLQSxJQUFMLEdBQVksRUFBeEI7QUFDQTJGLHFCQUFhaEUsSUFBYixDQUFrQjNCLElBQWxCO0FBQ0g7QUFDRCxXQUFPQSxJQUFQO0FBQ0gsQ0FyQkQ7O0FBdUJBaWdCLGdCQUFnQjFnQixTQUFoQixDQUEwQm1oQixvQkFBMUIsR0FBaUQsVUFBUy9kLFFBQVQsRUFBbUI7QUFDaEUsV0FBUUEsU0FBUzlDLE1BQVQsR0FBa0IsRUFBbEIsS0FBeUIsQ0FBakM7QUFDSCxDQUZEOztBQUlBb2dCLGdCQUFnQjFnQixTQUFoQixDQUEwQnlDLE9BQTFCLEdBQW9DLFlBQVc7QUFDM0MsUUFBSW1ELFNBQUo7QUFBQSxRQUNJRSxPQURKO0FBQUEsUUFFSTlELE9BQU8sSUFGWDtBQUFBLFFBR0l2QixJQUhKO0FBQUEsUUFJSStCLFNBQVMsRUFKYjtBQUFBLFFBS0k0RCxlQUFlLEVBTG5CO0FBQUEsUUFNSWhELFFBTko7O0FBUUF3QyxnQkFBWTVELEtBQUswRCxVQUFMLEVBQVo7QUFDQSxRQUFJLENBQUNFLFNBQUwsRUFBZ0I7QUFDWixlQUFPLElBQVA7QUFDSDtBQUNEUSxpQkFBYWhFLElBQWIsQ0FBa0J3RCxTQUFsQjs7QUFFQUUsY0FBVTlELEtBQUtnRSxRQUFMLEVBQVY7QUFDQSxRQUFJLENBQUNGLE9BQUwsRUFBYztBQUNWLGVBQU8sSUFBUDtBQUNIOztBQUVEMUMsZUFBV3BCLEtBQUttQixhQUFMLENBQW1CeUMsVUFBVXZELEdBQTdCLEVBQWtDeUQsUUFBUTNGLEtBQTFDLEVBQWlELEtBQWpELENBQVg7QUFDQSxRQUFJLENBQUM2QixLQUFLbWYsb0JBQUwsQ0FBMEIvZCxRQUExQixDQUFMLEVBQTBDO0FBQ3RDLGVBQU8sSUFBUDtBQUNIO0FBQ0QzQyxXQUFPdUIsS0FBS21FLGNBQUwsQ0FBb0IvQyxRQUFwQixFQUE4QlosTUFBOUIsRUFBc0M0RCxZQUF0QyxDQUFQO0FBQ0EsUUFBSSxDQUFDM0YsSUFBTCxFQUFXO0FBQ1AsZUFBTyxJQUFQO0FBQ0g7QUFDRCxRQUFJK0IsT0FBT2xDLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUI7QUFDbkIsZUFBTyxJQUFQO0FBQ0g7O0FBRUQ4RixpQkFBYWhFLElBQWIsQ0FBa0IwRCxPQUFsQjtBQUNBLFdBQU87QUFDSHJGLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIMUcsZUFBT3lGLFVBQVV6RixLQUZkO0FBR0hrQyxhQUFLeUQsUUFBUXpELEdBSFY7QUFJSHVELG1CQUFXQSxTQUpSO0FBS0hRLHNCQUFjQTtBQUxYLEtBQVA7QUFPSCxDQXhDRDs7QUEwQ0EseURBQWVzYSxlQUFmLEU7Ozs7Ozs7O0FDaFFBOztBQUVBLFNBQVNVLGFBQVQsR0FBeUI7QUFDckJ4aEIsSUFBQSxnRUFBQUEsQ0FBY3dFLElBQWQsQ0FBbUIsSUFBbkI7QUFDQSxTQUFLaWQsU0FBTCxHQUFpQixFQUFqQjtBQUNIOztBQUVELElBQUk1YyxhQUFhO0FBQ2JtSixzQkFBa0IsRUFBQzFLLE9BQU8sc0JBQVIsRUFETDtBQUViMkssY0FBVSxFQUFDM0ssT0FBTyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFBcUIsRUFBckIsRUFBeUIsRUFBekIsRUFBNkIsRUFBN0IsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsRUFBeUMsRUFBekMsRUFBNkMsRUFBN0MsRUFBaUQsRUFBakQsRUFBcUQsRUFBckQsRUFBeUQsRUFBekQsRUFBNkQsRUFBN0QsRUFBaUUsRUFBakUsRUFBcUUsRUFBckUsRUFBeUUsRUFBekUsRUFBNkUsRUFBN0UsQ0FBUixFQUZHO0FBR2I0Syx5QkFBcUIsRUFBQzVLLE9BQU8sQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsS0FBcEMsRUFBMkMsS0FBM0MsRUFBa0QsS0FBbEQsRUFBeUQsS0FBekQsRUFBZ0UsS0FBaEUsRUFBdUUsS0FBdkUsRUFBOEUsS0FBOUUsRUFDekIsS0FEeUIsRUFDbEIsS0FEa0IsRUFDWCxLQURXLEVBQ0osS0FESSxFQUNHLEtBREgsRUFDVSxLQURWLEVBQ2lCLEtBRGpCLEVBQ3dCLEtBRHhCLENBQVIsRUFIUjtBQUtib2UsZUFBVyxFQUFDcGUsT0FBTyxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQUFSLEVBTEU7QUFNYnFlLHVCQUFtQixFQUFDcmUsT0FBTyxDQUFSLEVBTk47QUFPYnNlLG9CQUFnQixFQUFDdGUsT0FBTyxHQUFSLEVBUEg7QUFRYnVlLGFBQVMsRUFBQ3ZlLE9BQU8sR0FBUixFQVJJO0FBU2JGLFlBQVEsRUFBQ0UsT0FBTyxTQUFSLEVBQW1CUyxXQUFXLEtBQTlCO0FBVEssQ0FBakI7O0FBWUF5ZCxjQUFjcGhCLFNBQWQsR0FBMEJ5RCxPQUFPMEIsTUFBUCxDQUFjLGdFQUFBdkYsQ0FBY0ksU0FBNUIsRUFBdUN5RSxVQUF2QyxDQUExQjtBQUNBMmMsY0FBY3BoQixTQUFkLENBQXdCb0YsV0FBeEIsR0FBc0NnYyxhQUF0Qzs7QUFFQUEsY0FBY3BoQixTQUFkLENBQXdCeUMsT0FBeEIsR0FBa0MsWUFBVztBQUN6QyxRQUFJVCxPQUFPLElBQVg7QUFBQSxRQUNJUSxTQUFTLEVBRGI7QUFBQSxRQUVJckMsS0FGSjtBQUFBLFFBR0k2TixXQUhKO0FBQUEsUUFJSXpMLE9BSko7QUFBQSxRQUtJMkwsU0FMSjtBQUFBLFFBTUk3TCxHQU5KOztBQVFBLFNBQUtnZixTQUFMLEdBQWlCcmYsS0FBS21CLGFBQUwsRUFBakI7QUFDQWhELFlBQVE2QixLQUFLMEQsVUFBTCxFQUFSO0FBQ0EsUUFBSSxDQUFDdkYsS0FBTCxFQUFZO0FBQ1IsZUFBTyxJQUFQO0FBQ0g7QUFDRCtOLGdCQUFZL04sTUFBTXVoQixZQUFsQjs7QUFFQSxPQUFHO0FBQ0NuZixrQkFBVVAsS0FBS21NLFVBQUwsQ0FBZ0JELFNBQWhCLENBQVY7QUFDQSxZQUFJM0wsVUFBVSxDQUFkLEVBQWlCO0FBQ2IsbUJBQU8sSUFBUDtBQUNIO0FBQ0R5TCxzQkFBY2hNLEtBQUtvTSxjQUFMLENBQW9CN0wsT0FBcEIsQ0FBZDtBQUNBLFlBQUl5TCxjQUFjLENBQWxCLEVBQW9CO0FBQ2hCLG1CQUFPLElBQVA7QUFDSDtBQUNEeEwsZUFBT0osSUFBUCxDQUFZNEwsV0FBWjtBQUNBRSxxQkFBYSxDQUFiO0FBQ0EsWUFBSTFMLE9BQU9sQyxNQUFQLEdBQWdCLENBQWhCLElBQXFCMEIsS0FBSzJmLFdBQUwsQ0FBaUJwZixPQUFqQixDQUF6QixFQUFvRDtBQUNoRDtBQUNIO0FBQ0osS0FkRCxRQWNTMkwsWUFBWWxNLEtBQUtxZixTQUFMLENBQWUvZ0IsTUFkcEM7O0FBZ0JBO0FBQ0EsUUFBS2tDLE9BQU9sQyxNQUFQLEdBQWdCLENBQWpCLEdBQXNCMEIsS0FBS3VmLGlCQUEzQixJQUFnRCxDQUFDdmYsS0FBSzJmLFdBQUwsQ0FBaUJwZixPQUFqQixDQUFyRCxFQUFnRjtBQUM1RSxlQUFPLElBQVA7QUFDSDs7QUFFRDtBQUNBLFFBQUksQ0FBQ1AsS0FBSzRmLGlCQUFMLENBQXVCemhCLE1BQU11aEIsWUFBN0IsRUFBMkN4VCxZQUFZLENBQXZELENBQUwsRUFBK0Q7QUFDM0QsZUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSSxDQUFDbE0sS0FBSzZmLGVBQUwsQ0FBcUJyZixNQUFyQixFQUE2QnJDLE1BQU11aEIsWUFBbkMsQ0FBTCxFQUFzRDtBQUNsRCxlQUFPLElBQVA7QUFDSDs7QUFFRHhULGdCQUFZQSxZQUFZbE0sS0FBS3FmLFNBQUwsQ0FBZS9nQixNQUEzQixHQUFvQzBCLEtBQUtxZixTQUFMLENBQWUvZ0IsTUFBbkQsR0FBNEQ0TixTQUF4RTtBQUNBN0wsVUFBTWxDLE1BQU1BLEtBQU4sR0FBYzZCLEtBQUs4ZixZQUFMLENBQWtCM2hCLE1BQU11aEIsWUFBeEIsRUFBc0N4VCxZQUFZLENBQWxELENBQXBCOztBQUVBLFdBQU87QUFDSHpOLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIMUcsZUFBT0EsTUFBTUEsS0FGVjtBQUdIa0MsYUFBS0EsR0FIRjtBQUlIdUQsbUJBQVd6RixLQUpSO0FBS0hpRyxzQkFBYzVEO0FBTFgsS0FBUDtBQU9ILENBeEREOztBQTBEQTRlLGNBQWNwaEIsU0FBZCxDQUF3QjRoQixpQkFBeEIsR0FBNEMsVUFBU0YsWUFBVCxFQUF1QkssVUFBdkIsRUFBbUM7QUFDM0UsUUFBS0wsZUFBZSxDQUFmLElBQW9CLENBQXJCLElBQ08sS0FBS0wsU0FBTCxDQUFlSyxlQUFlLENBQTlCLEtBQXFDLEtBQUtNLHVCQUFMLENBQTZCTixZQUE3QixJQUE2QyxHQUQ3RixFQUNtRztBQUMvRixZQUFLSyxhQUFhLENBQWIsSUFBa0IsS0FBS1YsU0FBTCxDQUFlL2dCLE1BQWxDLElBQ08sS0FBSytnQixTQUFMLENBQWVVLGFBQWEsQ0FBNUIsS0FBbUMsS0FBS0MsdUJBQUwsQ0FBNkJELFVBQTdCLElBQTJDLEdBRHpGLEVBQytGO0FBQzNGLG1CQUFPLElBQVA7QUFDSDtBQUNKO0FBQ0QsV0FBTyxLQUFQO0FBQ0gsQ0FURDs7QUFXQVgsY0FBY3BoQixTQUFkLENBQXdCZ2lCLHVCQUF4QixHQUFrRCxVQUFTeGdCLE1BQVQsRUFBaUI7QUFDL0QsUUFBSXBCLENBQUo7QUFBQSxRQUNJUyxNQUFNLENBRFY7O0FBR0EsU0FBS1QsSUFBSW9CLE1BQVQsRUFBaUJwQixJQUFJb0IsU0FBUyxDQUE5QixFQUFpQ3BCLEdBQWpDLEVBQXNDO0FBQ2xDUyxlQUFPLEtBQUt3Z0IsU0FBTCxDQUFlamhCLENBQWYsQ0FBUDtBQUNIOztBQUVELFdBQU9TLEdBQVA7QUFDSCxDQVREOztBQVdBdWdCLGNBQWNwaEIsU0FBZCxDQUF3QmlpQix1QkFBeEIsR0FBa0QsVUFBU3pmLE1BQVQsRUFBaUJrZixZQUFqQixFQUE4QjtBQUM1RSxRQUFJMWYsT0FBTyxJQUFYO0FBQUEsUUFDSWtnQixpQkFBaUI7QUFDYkMsZUFBTztBQUNIQyxvQkFBUSxFQUFFaGEsTUFBTSxDQUFSLEVBQVdpYSxRQUFRLENBQW5CLEVBQXNCck0sS0FBSyxDQUEzQixFQUE4QmpPLEtBQUs1RyxPQUFPQyxTQUExQyxFQURMO0FBRUhraEIsa0JBQU0sRUFBQ2xhLE1BQU0sQ0FBUCxFQUFVaWEsUUFBUSxDQUFsQixFQUFxQnJNLEtBQUssQ0FBMUIsRUFBNkJqTyxLQUFLNUcsT0FBT0MsU0FBekM7QUFGSCxTQURNO0FBS2JtaEIsYUFBSztBQUNESCxvQkFBUSxFQUFFaGEsTUFBTSxDQUFSLEVBQVdpYSxRQUFRLENBQW5CLEVBQXNCck0sS0FBSyxDQUEzQixFQUE4QmpPLEtBQUs1RyxPQUFPQyxTQUExQyxFQURQO0FBRURraEIsa0JBQU0sRUFBRWxhLE1BQU0sQ0FBUixFQUFXaWEsUUFBUSxDQUFuQixFQUFzQnJNLEtBQUssQ0FBM0IsRUFBOEJqTyxLQUFLNUcsT0FBT0MsU0FBMUM7QUFGTDtBQUxRLEtBRHJCO0FBQUEsUUFXSW9oQixJQVhKO0FBQUEsUUFZSUMsR0FaSjtBQUFBLFFBYUlyaUIsQ0FiSjtBQUFBLFFBY0lxRixDQWRKO0FBQUEsUUFlSTZPLE1BQU1vTixZQWZWO0FBQUEsUUFnQkluZixPQWhCSjs7QUFrQkEsU0FBS25DLElBQUksQ0FBVCxFQUFZQSxJQUFJb0MsT0FBT2xDLE1BQXZCLEVBQStCRixHQUEvQixFQUFtQztBQUMvQm1DLGtCQUFVUCxLQUFLMGdCLGNBQUwsQ0FBb0JsZ0IsT0FBT3BDLENBQVAsQ0FBcEIsQ0FBVjtBQUNBLGFBQUtxRixJQUFJLENBQVQsRUFBWUEsS0FBSyxDQUFqQixFQUFvQkEsR0FBcEIsRUFBeUI7QUFDckIrYyxtQkFBTyxDQUFDL2MsSUFBSSxDQUFMLE1BQVksQ0FBWixHQUFnQnljLGVBQWVLLEdBQS9CLEdBQXFDTCxlQUFlQyxLQUEzRDtBQUNBTSxrQkFBTSxDQUFDbGdCLFVBQVUsQ0FBWCxNQUFrQixDQUFsQixHQUFzQmlnQixLQUFLRixJQUEzQixHQUFrQ0UsS0FBS0osTUFBN0M7QUFDQUssZ0JBQUlyYSxJQUFKLElBQVlwRyxLQUFLcWYsU0FBTCxDQUFlL00sTUFBTTdPLENBQXJCLENBQVo7QUFDQWdkLGdCQUFJSixNQUFKO0FBQ0E5Zix3QkFBWSxDQUFaO0FBQ0g7QUFDRCtSLGVBQU8sQ0FBUDtBQUNIOztBQUVELEtBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUJoUSxPQUFqQixDQUF5QixVQUFTQyxHQUFULEVBQWM7QUFDbkMsWUFBSW9lLFVBQVVULGVBQWUzZCxHQUFmLENBQWQ7QUFDQW9lLGdCQUFRTCxJQUFSLENBQWF0TSxHQUFiLEdBQ0kzVSxLQUFLZ0csS0FBTCxDQUFXLENBQUNzYixRQUFRUCxNQUFSLENBQWVoYSxJQUFmLEdBQXNCdWEsUUFBUVAsTUFBUixDQUFlQyxNQUFyQyxHQUE4Q00sUUFBUUwsSUFBUixDQUFhbGEsSUFBYixHQUFvQnVhLFFBQVFMLElBQVIsQ0FBYUQsTUFBaEYsSUFBMEYsQ0FBckcsQ0FESjtBQUVBTSxnQkFBUVAsTUFBUixDQUFlcmEsR0FBZixHQUFxQjFHLEtBQUtpYyxJQUFMLENBQVVxRixRQUFRTCxJQUFSLENBQWF0TSxHQUF2QixDQUFyQjtBQUNBMk0sZ0JBQVFMLElBQVIsQ0FBYXZhLEdBQWIsR0FBbUIxRyxLQUFLaWMsSUFBTCxDQUFVLENBQUNxRixRQUFRTCxJQUFSLENBQWFsYSxJQUFiLEdBQW9CcEcsS0FBS3dmLGNBQXpCLEdBQTBDeGYsS0FBS3lmLE9BQWhELElBQTJEa0IsUUFBUUwsSUFBUixDQUFhRCxNQUFsRixDQUFuQjtBQUNILEtBTkQ7O0FBUUEsV0FBT0gsY0FBUDtBQUNILENBeENEOztBQTBDQWQsY0FBY3BoQixTQUFkLENBQXdCMGlCLGNBQXhCLEdBQXlDLFVBQVNFLElBQVQsRUFBZTtBQUNwRCxRQUFJNWdCLE9BQU8sSUFBWDtBQUFBLFFBQ0k2Z0IsV0FBV0QsS0FBS0UsVUFBTCxDQUFnQixDQUFoQixDQURmO0FBQUEsUUFFSTFpQixDQUZKOztBQUlBLFNBQUtBLElBQUksQ0FBVCxFQUFZQSxJQUFJNEIsS0FBSzZMLFFBQUwsQ0FBY3ZOLE1BQTlCLEVBQXNDRixHQUF0QyxFQUEyQztBQUN2QyxZQUFJNEIsS0FBSzZMLFFBQUwsQ0FBY3pOLENBQWQsTUFBcUJ5aUIsUUFBekIsRUFBa0M7QUFDOUIsbUJBQU83Z0IsS0FBSzhMLG1CQUFMLENBQXlCMU4sQ0FBekIsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLEdBQVA7QUFDSCxDQVhEOztBQWFBZ2hCLGNBQWNwaEIsU0FBZCxDQUF3QjZoQixlQUF4QixHQUEwQyxVQUFTcmYsTUFBVCxFQUFpQmtmLFlBQWpCLEVBQStCO0FBQ3JFLFFBQUkxZixPQUFPLElBQVg7QUFBQSxRQUNJK2dCLGFBQWEvZ0IsS0FBS2lnQix1QkFBTCxDQUE2QnpmLE1BQTdCLEVBQXFDa2YsWUFBckMsQ0FEakI7QUFBQSxRQUVJdGhCLENBRko7QUFBQSxRQUdJcUYsQ0FISjtBQUFBLFFBSUkrYyxJQUpKO0FBQUEsUUFLSUMsR0FMSjtBQUFBLFFBTUlyYSxJQU5KO0FBQUEsUUFPSWtNLE1BQU1vTixZQVBWO0FBQUEsUUFRSW5mLE9BUko7O0FBVUEsU0FBS25DLElBQUksQ0FBVCxFQUFZQSxJQUFJb0MsT0FBT2xDLE1BQXZCLEVBQStCRixHQUEvQixFQUFvQztBQUNoQ21DLGtCQUFVUCxLQUFLMGdCLGNBQUwsQ0FBb0JsZ0IsT0FBT3BDLENBQVAsQ0FBcEIsQ0FBVjtBQUNBLGFBQUtxRixJQUFJLENBQVQsRUFBWUEsS0FBSyxDQUFqQixFQUFvQkEsR0FBcEIsRUFBeUI7QUFDckIrYyxtQkFBTyxDQUFDL2MsSUFBSSxDQUFMLE1BQVksQ0FBWixHQUFnQnNkLFdBQVdSLEdBQTNCLEdBQWlDUSxXQUFXWixLQUFuRDtBQUNBTSxrQkFBTSxDQUFDbGdCLFVBQVUsQ0FBWCxNQUFrQixDQUFsQixHQUFzQmlnQixLQUFLRixJQUEzQixHQUFrQ0UsS0FBS0osTUFBN0M7QUFDQWhhLG1CQUFPcEcsS0FBS3FmLFNBQUwsQ0FBZS9NLE1BQU03TyxDQUFyQixDQUFQO0FBQ0EsZ0JBQUkyQyxPQUFPcWEsSUFBSXpNLEdBQVgsSUFBa0I1TixPQUFPcWEsSUFBSTFhLEdBQWpDLEVBQXNDO0FBQ2xDLHVCQUFPLEtBQVA7QUFDSDtBQUNEeEYsd0JBQVksQ0FBWjtBQUNIO0FBQ0QrUixlQUFPLENBQVA7QUFDSDtBQUNELFdBQU8sSUFBUDtBQUNILENBekJEOztBQTJCQThNLGNBQWNwaEIsU0FBZCxDQUF3Qm9PLGNBQXhCLEdBQXlDLFVBQVM3TCxPQUFULEVBQWtCO0FBQ3ZELFFBQUluQyxDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDs7QUFHQSxTQUFLNUIsSUFBSSxDQUFULEVBQVlBLElBQUk0QixLQUFLOEwsbUJBQUwsQ0FBeUJ4TixNQUF6QyxFQUFpREYsR0FBakQsRUFBc0Q7QUFDbEQsWUFBSTRCLEtBQUs4TCxtQkFBTCxDQUF5QjFOLENBQXpCLE1BQWdDbUMsT0FBcEMsRUFBNkM7QUFDekMsbUJBQU9nTSxPQUFPQyxZQUFQLENBQW9CeE0sS0FBSzZMLFFBQUwsQ0FBY3pOLENBQWQsQ0FBcEIsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLENBQUMsQ0FBUjtBQUNILENBVkQ7O0FBWUFnaEIsY0FBY3BoQixTQUFkLENBQXdCZ2pCLDRCQUF4QixHQUF1RCxVQUFTeGhCLE1BQVQsRUFBaUJhLEdBQWpCLEVBQXNCO0FBQ3pFLFFBQUlqQyxDQUFKO0FBQUEsUUFDSTRWLE1BQU03VSxPQUFPQyxTQURqQjtBQUFBLFFBRUkyRyxNQUFNLENBRlY7QUFBQSxRQUdJdkgsT0FISjs7QUFLQSxTQUFLSixJQUFJb0IsTUFBVCxFQUFpQnBCLElBQUlpQyxHQUFyQixFQUEwQmpDLEtBQUssQ0FBL0IsRUFBaUM7QUFDN0JJLGtCQUFVLEtBQUs2Z0IsU0FBTCxDQUFlamhCLENBQWYsQ0FBVjtBQUNBLFlBQUlJLFVBQVV1SCxHQUFkLEVBQW1CO0FBQ2ZBLGtCQUFNdkgsT0FBTjtBQUNIO0FBQ0QsWUFBSUEsVUFBVXdWLEdBQWQsRUFBbUI7QUFDZkEsa0JBQU14VixPQUFOO0FBQ0g7QUFDSjs7QUFFRCxXQUFRLENBQUN3VixNQUFNak8sR0FBUCxJQUFjLEdBQWYsR0FBc0IsQ0FBN0I7QUFDSCxDQWpCRDs7QUFtQkFxWixjQUFjcGhCLFNBQWQsQ0FBd0JtTyxVQUF4QixHQUFxQyxVQUFTM00sTUFBVCxFQUFpQjtBQUNsRCxRQUFJOEIsY0FBYyxDQUFsQjtBQUFBLFFBQ0lqQixNQUFNYixTQUFTOEIsV0FEbkI7QUFBQSxRQUVJMmYsWUFGSjtBQUFBLFFBR0lDLGNBSEo7QUFBQSxRQUlJQyxVQUFVLEtBQU03ZixjQUFjLENBSmxDO0FBQUEsUUFLSWYsVUFBVSxDQUxkO0FBQUEsUUFNSW5DLENBTko7QUFBQSxRQU9Jc0gsU0FQSjs7QUFTQSxRQUFJckYsTUFBTSxLQUFLZ2YsU0FBTCxDQUFlL2dCLE1BQXpCLEVBQWlDO0FBQzdCLGVBQU8sQ0FBQyxDQUFSO0FBQ0g7O0FBRUQyaUIsbUJBQWUsS0FBS0QsNEJBQUwsQ0FBa0N4aEIsTUFBbEMsRUFBMENhLEdBQTFDLENBQWY7QUFDQTZnQixxQkFBaUIsS0FBS0YsNEJBQUwsQ0FBa0N4aEIsU0FBUyxDQUEzQyxFQUE4Q2EsR0FBOUMsQ0FBakI7O0FBRUEsU0FBS2pDLElBQUksQ0FBVCxFQUFZQSxJQUFJa0QsV0FBaEIsRUFBNkJsRCxHQUE3QixFQUFpQztBQUM3QnNILG9CQUFZLENBQUN0SCxJQUFJLENBQUwsTUFBWSxDQUFaLEdBQWdCNmlCLFlBQWhCLEdBQStCQyxjQUEzQztBQUNBLFlBQUksS0FBSzdCLFNBQUwsQ0FBZTdmLFNBQVNwQixDQUF4QixJQUE2QnNILFNBQWpDLEVBQTRDO0FBQ3hDbkYsdUJBQVc0Z0IsT0FBWDtBQUNIO0FBQ0RBLG9CQUFZLENBQVo7QUFDSDs7QUFFRCxXQUFPNWdCLE9BQVA7QUFDSCxDQTFCRDs7QUE0QkE2ZSxjQUFjcGhCLFNBQWQsQ0FBd0IyaEIsV0FBeEIsR0FBc0MsVUFBU3BmLE9BQVQsRUFBa0I7QUFDcEQsUUFBSW5DLENBQUo7O0FBRUEsU0FBS0EsSUFBSSxDQUFULEVBQVlBLElBQUksS0FBS2toQixTQUFMLENBQWVoaEIsTUFBL0IsRUFBdUNGLEdBQXZDLEVBQTRDO0FBQ3hDLFlBQUksS0FBS2toQixTQUFMLENBQWVsaEIsQ0FBZixNQUFzQm1DLE9BQTFCLEVBQW1DO0FBQy9CLG1CQUFPLElBQVA7QUFDSDtBQUNKO0FBQ0QsV0FBTyxLQUFQO0FBQ0gsQ0FURDs7QUFXQTZlLGNBQWNwaEIsU0FBZCxDQUF3QjhoQixZQUF4QixHQUF1QyxVQUFTM2hCLEtBQVQsRUFBZ0JrQyxHQUFoQixFQUFxQjtBQUN4RCxRQUFJakMsQ0FBSjtBQUFBLFFBQ0lTLE1BQU0sQ0FEVjs7QUFHQSxTQUFLVCxJQUFJRCxLQUFULEVBQWdCQyxJQUFJaUMsR0FBcEIsRUFBeUJqQyxHQUF6QixFQUE4QjtBQUMxQlMsZUFBTyxLQUFLd2dCLFNBQUwsQ0FBZWpoQixDQUFmLENBQVA7QUFDSDtBQUNELFdBQU9TLEdBQVA7QUFDSCxDQVJEOztBQVVBdWdCLGNBQWNwaEIsU0FBZCxDQUF3QjBGLFVBQXhCLEdBQXFDLFlBQVc7QUFDNUMsUUFBSTFELE9BQU8sSUFBWDtBQUFBLFFBQ0k1QixDQURKO0FBQUEsUUFFSW1DLE9BRko7QUFBQSxRQUdJcEMsUUFBUTZCLEtBQUsvQixVQUFMLENBQWdCK0IsS0FBS2pDLElBQXJCLENBSFo7QUFBQSxRQUlJc0MsR0FKSjs7QUFNQSxTQUFLakMsSUFBSSxDQUFULEVBQVlBLElBQUksS0FBS2loQixTQUFMLENBQWUvZ0IsTUFBL0IsRUFBdUNGLEdBQXZDLEVBQTRDO0FBQ3hDbUMsa0JBQVVQLEtBQUttTSxVQUFMLENBQWdCL04sQ0FBaEIsQ0FBVjtBQUNBLFlBQUltQyxZQUFZLENBQUMsQ0FBYixJQUFrQlAsS0FBSzJmLFdBQUwsQ0FBaUJwZixPQUFqQixDQUF0QixFQUFpRDtBQUM3QztBQUNBcEMscUJBQVM2QixLQUFLOGYsWUFBTCxDQUFrQixDQUFsQixFQUFxQjFoQixDQUFyQixDQUFUO0FBQ0FpQyxrQkFBTWxDLFFBQVE2QixLQUFLOGYsWUFBTCxDQUFrQjFoQixDQUFsQixFQUFxQkEsSUFBSSxDQUF6QixDQUFkO0FBQ0EsbUJBQU87QUFDSEQsdUJBQU9BLEtBREo7QUFFSGtDLHFCQUFLQSxHQUZGO0FBR0hxZiw4QkFBY3RoQixDQUhYO0FBSUgyaEIsNEJBQVkzaEIsSUFBSTtBQUpiLGFBQVA7QUFNSDtBQUNKO0FBQ0osQ0FyQkQ7O0FBdUJBLHlEQUFlZ2hCLGFBQWYsRTs7Ozs7Ozs7QUMvUkE7O0FBRUEsU0FBU2dDLGFBQVQsR0FBeUI7QUFDckJ4akIsSUFBQSxnRUFBQUEsQ0FBY3dFLElBQWQsQ0FBbUIsSUFBbkI7QUFDSDs7QUFFRCxJQUFJSyxhQUFhO0FBQ2I0ZSxnQkFBWSxFQUFDbmdCLE9BQU8sRUFBUixFQURDO0FBRWJvZ0IsWUFBUSxFQUFDcGdCLE9BQU8sRUFBUixFQUZLO0FBR2JxZ0IsWUFBUSxFQUFDcmdCLE9BQU8sR0FBUixFQUhLO0FBSWJzZ0IsWUFBUSxFQUFDdGdCLE9BQU8sR0FBUixFQUpLO0FBS2J1Z0Isa0JBQWMsRUFBQ3ZnQixPQUFPLEdBQVIsRUFMRDtBQU1id2dCLGtCQUFjLEVBQUN4Z0IsT0FBTyxHQUFSLEVBTkQ7QUFPYnlnQixrQkFBYyxFQUFDemdCLE9BQU8sR0FBUixFQVBEO0FBUWIwZ0IsZUFBVyxFQUFDMWdCLE9BQU8sR0FBUixFQVJFO0FBU2I4QixrQkFBYyxFQUFDOUIsT0FBTyxDQUNsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBRGtCLEVBRWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FGa0IsRUFHbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQUhrQixFQUlsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBSmtCLEVBS2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FMa0IsRUFNbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQU5rQixFQU9sQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBUGtCLEVBUWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FSa0IsRUFTbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQVRrQixFQVVsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBVmtCLEVBV2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FYa0IsRUFZbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQVprQixFQWFsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBYmtCLEVBY2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0Fka0IsRUFlbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWZrQixFQWdCbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWhCa0IsRUFpQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FqQmtCLEVBa0JsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBbEJrQixFQW1CbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQW5Ca0IsRUFvQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FwQmtCLEVBcUJsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBckJrQixFQXNCbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXRCa0IsRUF1QmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F2QmtCLEVBd0JsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBeEJrQixFQXlCbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXpCa0IsRUEwQmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0ExQmtCLEVBMkJsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBM0JrQixFQTRCbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTVCa0IsRUE2QmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0E3QmtCLEVBOEJsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBOUJrQixFQStCbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQS9Ca0IsRUFnQ2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FoQ2tCLEVBaUNsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBakNrQixFQWtDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWxDa0IsRUFtQ2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FuQ2tCLEVBb0NsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBcENrQixFQXFDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXJDa0IsRUFzQ2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F0Q2tCLEVBdUNsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBdkNrQixFQXdDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXhDa0IsRUF5Q2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F6Q2tCLEVBMENsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBMUNrQixFQTJDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTNDa0IsRUE0Q2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0E1Q2tCLEVBNkNsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBN0NrQixFQThDbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTlDa0IsRUErQ2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0EvQ2tCLEVBZ0RsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBaERrQixFQWlEbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWpEa0IsRUFrRGxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FsRGtCLEVBbURsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBbkRrQixFQW9EbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXBEa0IsRUFxRGxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FyRGtCLEVBc0RsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBdERrQixFQXVEbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXZEa0IsRUF3RGxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F4RGtCLEVBeURsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBekRrQixFQTBEbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTFEa0IsRUEyRGxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0EzRGtCLEVBNERsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBNURrQixFQTZEbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTdEa0IsRUE4RGxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0E5RGtCLEVBK0RsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBL0RrQixFQWdFbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWhFa0IsRUFpRWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FqRWtCLEVBa0VsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBbEVrQixFQW1FbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQW5Fa0IsRUFvRWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FwRWtCLEVBcUVsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBckVrQixFQXNFbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXRFa0IsRUF1RWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F2RWtCLEVBd0VsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBeEVrQixFQXlFbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXpFa0IsRUEwRWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0ExRWtCLEVBMkVsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBM0VrQixFQTRFbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTVFa0IsRUE2RWxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0E3RWtCLEVBOEVsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBOUVrQixFQStFbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQS9Fa0IsRUFnRmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FoRmtCLEVBaUZsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBakZrQixFQWtGbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWxGa0IsRUFtRmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FuRmtCLEVBb0ZsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBcEZrQixFQXFGbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXJGa0IsRUFzRmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F0RmtCLEVBdUZsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBdkZrQixFQXdGbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXhGa0IsRUF5RmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F6RmtCLEVBMEZsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBMUZrQixFQTJGbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTNGa0IsRUE0RmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0E1RmtCLEVBNkZsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBN0ZrQixFQThGbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTlGa0IsRUErRmxCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0EvRmtCLEVBZ0dsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBaEdrQixFQWlHbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQWpHa0IsRUFrR2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FsR2tCLEVBbUdsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBbkdrQixFQW9HbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXBHa0IsRUFxR2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FyR2tCLEVBc0dsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBdEdrQixFQXVHbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQXZHa0IsRUF3R2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0F4R2tCLEVBeUdsQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBekdrQixFQTBHbEIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQTFHa0IsRUEyR2xCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0EzR2tCLENBQVIsRUFURDtBQXNIYmhDLHVCQUFtQixFQUFDZ0MsT0FBTyxJQUFSLEVBdEhOO0FBdUhiZ0Msb0JBQWdCLEVBQUNoQyxPQUFPLElBQVIsRUF2SEg7QUF3SGJGLFlBQVEsRUFBQ0UsT0FBTyxVQUFSLEVBQW9CUyxXQUFXLEtBQS9CLEVBeEhLO0FBeUhia2dCLG9CQUFnQixFQUFDM2dCLE9BQU8sRUFBQ3FmLEtBQUssQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBTixFQUFpQkosT0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUF4QixFQUFSO0FBekhILENBQWpCOztBQTRIQWlCLGNBQWNwakIsU0FBZCxHQUEwQnlELE9BQU8wQixNQUFQLENBQWMsZ0VBQUF2RixDQUFjSSxTQUE1QixFQUF1Q3lFLFVBQXZDLENBQTFCO0FBQ0EyZSxjQUFjcGpCLFNBQWQsQ0FBd0JvRixXQUF4QixHQUFzQ2dlLGFBQXRDOztBQUVBQSxjQUFjcGpCLFNBQWQsQ0FBd0JxRixXQUF4QixHQUFzQyxVQUFTbEYsS0FBVCxFQUFnQnVCLFVBQWhCLEVBQTRCO0FBQzlELFFBQUlsQixVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZDtBQUFBLFFBQ0lKLENBREo7QUFBQSxRQUVJNEIsT0FBTyxJQUZYO0FBQUEsUUFHSVIsU0FBU3JCLEtBSGI7QUFBQSxRQUlJOEIsVUFBVSxDQUFDRCxLQUFLakMsSUFBTCxDQUFVeUIsTUFBVixDQUpmO0FBQUEsUUFLSVUsYUFBYSxDQUxqQjtBQUFBLFFBTUlDLFlBQVk7QUFDUnhCLGVBQU9RLE9BQU9DLFNBRE47QUFFUlgsY0FBTSxDQUFDLENBRkM7QUFHUk4sZUFBT0EsS0FIQztBQUlSa0MsYUFBS2xDLEtBSkc7QUFLUnVCLG9CQUFZO0FBQ1I2Z0IsaUJBQUssQ0FERztBQUVSSixtQkFBTztBQUZDO0FBTEosS0FOaEI7QUFBQSxRQWdCSTFoQixJQWhCSjtBQUFBLFFBaUJJRSxLQWpCSjs7QUFtQkEsU0FBTVAsSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLFlBQUk0QixLQUFLakMsSUFBTCxDQUFVSyxDQUFWLElBQWU2QixPQUFuQixFQUE0QjtBQUN4QnpCLG9CQUFRMEIsVUFBUjtBQUNILFNBRkQsTUFFTztBQUNILGdCQUFJQSxlQUFlMUIsUUFBUUYsTUFBUixHQUFpQixDQUFwQyxFQUF1QztBQUNuQyxvQkFBSW9CLFVBQUosRUFBZ0I7QUFDWk0seUJBQUs4aEIsUUFBTCxDQUFjdGpCLE9BQWQsRUFBdUJrQixVQUF2QjtBQUNIO0FBQ0QscUJBQUtqQixPQUFPLENBQVosRUFBZUEsT0FBT3VCLEtBQUtnRCxZQUFMLENBQWtCMUUsTUFBeEMsRUFBZ0RHLE1BQWhELEVBQXdEO0FBQ3BERSw0QkFBUXFCLEtBQUt6QixhQUFMLENBQW1CQyxPQUFuQixFQUE0QndCLEtBQUtnRCxZQUFMLENBQWtCdkUsSUFBbEIsQ0FBNUIsQ0FBUjtBQUNBLHdCQUFJRSxRQUFRd0IsVUFBVXhCLEtBQXRCLEVBQTZCO0FBQ3pCd0Isa0NBQVUxQixJQUFWLEdBQWlCQSxJQUFqQjtBQUNBMEIsa0NBQVV4QixLQUFWLEdBQWtCQSxLQUFsQjtBQUNIO0FBQ0o7QUFDRHdCLDBCQUFVRSxHQUFWLEdBQWdCakMsQ0FBaEI7QUFDQSxvQkFBSStCLFVBQVUxQixJQUFWLEtBQW1CLENBQUMsQ0FBcEIsSUFBeUIwQixVQUFVeEIsS0FBVixHQUFrQnFCLEtBQUtrRCxjQUFwRCxFQUFvRTtBQUNoRSwyQkFBTyxJQUFQO0FBQ0g7QUFDRCxvQkFBSWxELEtBQUtnRCxZQUFMLENBQWtCN0MsVUFBVTFCLElBQTVCLENBQUosRUFBdUM7QUFDbkMwQiw4QkFBVVQsVUFBVixDQUFxQjZnQixHQUFyQixHQUEyQndCLG9CQUN2Qi9oQixLQUFLZ0QsWUFBTCxDQUFrQjdDLFVBQVUxQixJQUE1QixDQUR1QixFQUNZRCxPQURaLEVBRXZCLEtBQUtxakIsY0FBTCxDQUFvQnRCLEdBRkcsQ0FBM0I7QUFHQXBnQiw4QkFBVVQsVUFBVixDQUFxQnlnQixLQUFyQixHQUE2QjRCLG9CQUN6Qi9oQixLQUFLZ0QsWUFBTCxDQUFrQjdDLFVBQVUxQixJQUE1QixDQUR5QixFQUNVRCxPQURWLEVBRXpCLEtBQUtxakIsY0FBTCxDQUFvQjFCLEtBRkssQ0FBN0I7QUFHSDtBQUNELHVCQUFPaGdCLFNBQVA7QUFDSCxhQXhCRCxNQXdCTztBQUNIRDtBQUNIO0FBQ0QxQixvQkFBUTBCLFVBQVIsSUFBc0IsQ0FBdEI7QUFDQUQsc0JBQVUsQ0FBQ0EsT0FBWDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQXhERDs7QUEwREFtaEIsY0FBY3BqQixTQUFkLENBQXdCOGpCLFFBQXhCLEdBQW1DLFVBQVN0akIsT0FBVCxFQUFrQmtCLFVBQWxCLEVBQThCO0FBQzdELFNBQUtELFlBQUwsQ0FBa0JqQixPQUFsQixFQUEyQmtCLFdBQVc2Z0IsR0FBdEMsRUFBMkMsS0FBS3NCLGNBQUwsQ0FBb0J0QixHQUEvRDtBQUNBLFNBQUs5Z0IsWUFBTCxDQUFrQmpCLE9BQWxCLEVBQTJCa0IsV0FBV3lnQixLQUF0QyxFQUE2QyxLQUFLMEIsY0FBTCxDQUFvQjFCLEtBQWpFO0FBQ0gsQ0FIRDs7QUFLQWlCLGNBQWNwakIsU0FBZCxDQUF3QjBGLFVBQXhCLEdBQXFDLFlBQVc7QUFDNUMsUUFBSWxGLFVBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFkO0FBQUEsUUFDSUosQ0FESjtBQUFBLFFBRUk0QixPQUFPLElBRlg7QUFBQSxRQUdJUixTQUFTUSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixDQUhiO0FBQUEsUUFJSWtDLFVBQVUsS0FKZDtBQUFBLFFBS0lDLGFBQWEsQ0FMakI7QUFBQSxRQU1JQyxZQUFZO0FBQ1J4QixlQUFPUSxPQUFPQyxTQUROO0FBRVJYLGNBQU0sQ0FBQyxDQUZDO0FBR1JOLGVBQU8sQ0FIQztBQUlSa0MsYUFBSyxDQUpHO0FBS1JYLG9CQUFZO0FBQ1I2Z0IsaUJBQUssQ0FERztBQUVSSixtQkFBTztBQUZDO0FBTEosS0FOaEI7QUFBQSxRQWdCSTFoQixJQWhCSjtBQUFBLFFBaUJJRSxLQWpCSjtBQUFBLFFBa0JJOEUsQ0FsQko7QUFBQSxRQW1CSTVFLEdBbkJKOztBQXFCQSxTQUFNVCxJQUFJb0IsTUFBVixFQUFrQnBCLElBQUk0QixLQUFLakMsSUFBTCxDQUFVTyxNQUFoQyxFQUF3Q0YsR0FBeEMsRUFBNkM7QUFDekMsWUFBSTRCLEtBQUtqQyxJQUFMLENBQVVLLENBQVYsSUFBZTZCLE9BQW5CLEVBQTRCO0FBQ3hCekIsb0JBQVEwQixVQUFSO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsZ0JBQUlBLGVBQWUxQixRQUFRRixNQUFSLEdBQWlCLENBQXBDLEVBQXVDO0FBQ25DTyxzQkFBTSxDQUFOO0FBQ0EscUJBQU00RSxJQUFJLENBQVYsRUFBYUEsSUFBSWpGLFFBQVFGLE1BQXpCLEVBQWlDbUYsR0FBakMsRUFBc0M7QUFDbEM1RSwyQkFBT0wsUUFBUWlGLENBQVIsQ0FBUDtBQUNIO0FBQ0QscUJBQUtoRixPQUFPdUIsS0FBS3loQixZQUFqQixFQUErQmhqQixRQUFRdUIsS0FBSzJoQixZQUE1QyxFQUEwRGxqQixNQUExRCxFQUFrRTtBQUM5REUsNEJBQVFxQixLQUFLekIsYUFBTCxDQUFtQkMsT0FBbkIsRUFBNEJ3QixLQUFLZ0QsWUFBTCxDQUFrQnZFLElBQWxCLENBQTVCLENBQVI7QUFDQSx3QkFBSUUsUUFBUXdCLFVBQVV4QixLQUF0QixFQUE2QjtBQUN6QndCLGtDQUFVMUIsSUFBVixHQUFpQkEsSUFBakI7QUFDQTBCLGtDQUFVeEIsS0FBVixHQUFrQkEsS0FBbEI7QUFDSDtBQUNKO0FBQ0Qsb0JBQUl3QixVQUFVeEIsS0FBVixHQUFrQnFCLEtBQUtrRCxjQUEzQixFQUEyQztBQUN2Qy9DLDhCQUFVaEMsS0FBVixHQUFrQkMsSUFBSVMsR0FBdEI7QUFDQXNCLDhCQUFVRSxHQUFWLEdBQWdCakMsQ0FBaEI7QUFDQStCLDhCQUFVVCxVQUFWLENBQXFCNmdCLEdBQXJCLEdBQTJCd0Isb0JBQ3ZCL2hCLEtBQUtnRCxZQUFMLENBQWtCN0MsVUFBVTFCLElBQTVCLENBRHVCLEVBQ1lELE9BRFosRUFFdkIsS0FBS3FqQixjQUFMLENBQW9CdEIsR0FGRyxDQUEzQjtBQUdBcGdCLDhCQUFVVCxVQUFWLENBQXFCeWdCLEtBQXJCLEdBQTZCNEIsb0JBQ3pCL2hCLEtBQUtnRCxZQUFMLENBQWtCN0MsVUFBVTFCLElBQTVCLENBRHlCLEVBQ1VELE9BRFYsRUFFekIsS0FBS3FqQixjQUFMLENBQW9CMUIsS0FGSyxDQUE3QjtBQUdBLDJCQUFPaGdCLFNBQVA7QUFDSDs7QUFFRCxxQkFBTXNELElBQUksQ0FBVixFQUFhQSxJQUFJLENBQWpCLEVBQW9CQSxHQUFwQixFQUF5QjtBQUNyQmpGLDRCQUFRaUYsQ0FBUixJQUFhakYsUUFBUWlGLElBQUksQ0FBWixDQUFiO0FBQ0g7QUFDRGpGLHdCQUFRLENBQVIsSUFBYSxDQUFiO0FBQ0FBLHdCQUFRLENBQVIsSUFBYSxDQUFiO0FBQ0EwQjtBQUNILGFBOUJELE1BOEJPO0FBQ0hBO0FBQ0g7QUFDRDFCLG9CQUFRMEIsVUFBUixJQUFzQixDQUF0QjtBQUNBRCxzQkFBVSxDQUFDQSxPQUFYO0FBQ0g7QUFDSjtBQUNELFdBQU8sSUFBUDtBQUNILENBaEVEOztBQWtFQW1oQixjQUFjcGpCLFNBQWQsQ0FBd0J5QyxPQUF4QixHQUFrQyxZQUFXO0FBQ3pDLFFBQUlULE9BQU8sSUFBWDtBQUFBLFFBQ0k0RCxZQUFZNUQsS0FBSzBELFVBQUwsRUFEaEI7QUFBQSxRQUVJakYsT0FBTyxJQUZYO0FBQUEsUUFHSXVqQixPQUFPLEtBSFg7QUFBQSxRQUlJeGhCLFNBQVMsRUFKYjtBQUFBLFFBS0l5aEIsYUFBYSxDQUxqQjtBQUFBLFFBTUlDLFdBQVcsQ0FOZjtBQUFBLFFBT0lwZCxPQVBKO0FBQUEsUUFRSXFkLFlBQVksRUFSaEI7QUFBQSxRQVNJL2QsZUFBZSxFQVRuQjtBQUFBLFFBVUlnZSxZQUFZLEtBVmhCO0FBQUEsUUFXSTlkLE9BWEo7QUFBQSxRQVlJK2Qsc0JBQXNCLElBWjFCOztBQWNBLFFBQUl6ZSxjQUFjLElBQWxCLEVBQXdCO0FBQ3BCLGVBQU8sSUFBUDtBQUNIO0FBQ0RuRixXQUFPO0FBQ0hBLGNBQU1tRixVQUFVbkYsSUFEYjtBQUVITixlQUFPeUYsVUFBVXpGLEtBRmQ7QUFHSGtDLGFBQUt1RCxVQUFVdkQsR0FIWjtBQUlIWCxvQkFBWTtBQUNSNmdCLGlCQUFLM2MsVUFBVWxFLFVBQVYsQ0FBcUI2Z0IsR0FEbEI7QUFFUkosbUJBQU92YyxVQUFVbEUsVUFBVixDQUFxQnlnQjtBQUZwQjtBQUpULEtBQVA7QUFTQS9iLGlCQUFhaEUsSUFBYixDQUFrQjNCLElBQWxCO0FBQ0F5akIsZUFBV3pqQixLQUFLQSxJQUFoQjtBQUNBLFlBQVFBLEtBQUtBLElBQWI7QUFDQSxhQUFLdUIsS0FBS3loQixZQUFWO0FBQ0kzYyxzQkFBVTlFLEtBQUt3aEIsTUFBZjtBQUNBO0FBQ0osYUFBS3hoQixLQUFLMGhCLFlBQVY7QUFDSTVjLHNCQUFVOUUsS0FBS3VoQixNQUFmO0FBQ0E7QUFDSixhQUFLdmhCLEtBQUsyaEIsWUFBVjtBQUNJN2Msc0JBQVU5RSxLQUFLc2hCLE1BQWY7QUFDQTtBQUNKO0FBQ0ksbUJBQU8sSUFBUDtBQVhKOztBQWNBLFdBQU8sQ0FBQ1UsSUFBUixFQUFjO0FBQ1YxZCxrQkFBVThkLFNBQVY7QUFDQUEsb0JBQVksS0FBWjtBQUNBM2pCLGVBQU91QixLQUFLcUQsV0FBTCxDQUFpQjVFLEtBQUs0QixHQUF0QixFQUEyQjVCLEtBQUtpQixVQUFoQyxDQUFQO0FBQ0EsWUFBSWpCLFNBQVMsSUFBYixFQUFtQjtBQUNmLGdCQUFJQSxLQUFLQSxJQUFMLEtBQWN1QixLQUFLNGhCLFNBQXZCLEVBQWtDO0FBQzlCUyxzQ0FBc0IsSUFBdEI7QUFDSDs7QUFFRCxnQkFBSTVqQixLQUFLQSxJQUFMLEtBQWN1QixLQUFLNGhCLFNBQXZCLEVBQWtDO0FBQzlCTywwQkFBVS9oQixJQUFWLENBQWUzQixLQUFLQSxJQUFwQjtBQUNBd2pCO0FBQ0FDLDRCQUFZRCxhQUFheGpCLEtBQUtBLElBQTlCO0FBQ0g7QUFDRDJGLHlCQUFhaEUsSUFBYixDQUFrQjNCLElBQWxCOztBQUVBLG9CQUFRcUcsT0FBUjtBQUNBLHFCQUFLOUUsS0FBS3doQixNQUFWO0FBQ0ksd0JBQUkvaUIsS0FBS0EsSUFBTCxHQUFZLEVBQWhCLEVBQW9CO0FBQ2hCK0IsK0JBQU9KLElBQVAsQ0FBWW1NLE9BQU9DLFlBQVAsQ0FBb0IsS0FBSy9OLEtBQUtBLElBQTlCLENBQVo7QUFDSCxxQkFGRCxNQUVPLElBQUlBLEtBQUtBLElBQUwsR0FBWSxFQUFoQixFQUFvQjtBQUN2QitCLCtCQUFPSixJQUFQLENBQVltTSxPQUFPQyxZQUFQLENBQW9CL04sS0FBS0EsSUFBTCxHQUFZLEVBQWhDLENBQVo7QUFDSCxxQkFGTSxNQUVBO0FBQ0gsNEJBQUlBLEtBQUtBLElBQUwsS0FBY3VCLEtBQUs0aEIsU0FBdkIsRUFBa0M7QUFDOUJTLGtEQUFzQixLQUF0QjtBQUNIO0FBQ0QsZ0NBQVE1akIsS0FBS0EsSUFBYjtBQUNBLGlDQUFLdUIsS0FBS3FoQixVQUFWO0FBQ0llLDRDQUFZLElBQVo7QUFDQXRkLDBDQUFVOUUsS0FBS3VoQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3ZoQixLQUFLdWhCLE1BQVY7QUFDSXpjLDBDQUFVOUUsS0FBS3VoQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3ZoQixLQUFLc2hCLE1BQVY7QUFDSXhjLDBDQUFVOUUsS0FBS3NoQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3RoQixLQUFLNGhCLFNBQVY7QUFDSUksdUNBQU8sSUFBUDtBQUNBO0FBYko7QUFlSDtBQUNEO0FBQ0oscUJBQUtoaUIsS0FBS3VoQixNQUFWO0FBQ0ksd0JBQUk5aUIsS0FBS0EsSUFBTCxHQUFZLEVBQWhCLEVBQW9CO0FBQ2hCK0IsK0JBQU9KLElBQVAsQ0FBWW1NLE9BQU9DLFlBQVAsQ0FBb0IsS0FBSy9OLEtBQUtBLElBQTlCLENBQVo7QUFDSCxxQkFGRCxNQUVPO0FBQ0gsNEJBQUlBLEtBQUtBLElBQUwsS0FBY3VCLEtBQUs0aEIsU0FBdkIsRUFBa0M7QUFDOUJTLGtEQUFzQixLQUF0QjtBQUNIO0FBQ0QsZ0NBQVE1akIsS0FBS0EsSUFBYjtBQUNBLGlDQUFLdUIsS0FBS3FoQixVQUFWO0FBQ0llLDRDQUFZLElBQVo7QUFDQXRkLDBDQUFVOUUsS0FBS3doQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3hoQixLQUFLd2hCLE1BQVY7QUFDSTFjLDBDQUFVOUUsS0FBS3doQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3hoQixLQUFLc2hCLE1BQVY7QUFDSXhjLDBDQUFVOUUsS0FBS3NoQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3RoQixLQUFLNGhCLFNBQVY7QUFDSUksdUNBQU8sSUFBUDtBQUNBO0FBYko7QUFlSDtBQUNEO0FBQ0oscUJBQUtoaUIsS0FBS3NoQixNQUFWO0FBQ0ksd0JBQUk3aUIsS0FBS0EsSUFBTCxHQUFZLEdBQWhCLEVBQXFCO0FBQ2pCK0IsK0JBQU9KLElBQVAsQ0FBWTNCLEtBQUtBLElBQUwsR0FBWSxFQUFaLEdBQWlCLE1BQU1BLEtBQUtBLElBQTVCLEdBQW1DQSxLQUFLQSxJQUFwRDtBQUNILHFCQUZELE1BRU87QUFDSCw0QkFBSUEsS0FBS0EsSUFBTCxLQUFjdUIsS0FBSzRoQixTQUF2QixFQUFrQztBQUM5QlMsa0RBQXNCLEtBQXRCO0FBQ0g7QUFDRCxnQ0FBUTVqQixLQUFLQSxJQUFiO0FBQ0EsaUNBQUt1QixLQUFLd2hCLE1BQVY7QUFDSTFjLDBDQUFVOUUsS0FBS3doQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3hoQixLQUFLdWhCLE1BQVY7QUFDSXpjLDBDQUFVOUUsS0FBS3VoQixNQUFmO0FBQ0E7QUFDSixpQ0FBS3ZoQixLQUFLNGhCLFNBQVY7QUFDSUksdUNBQU8sSUFBUDtBQUNBO0FBVEo7QUFXSDtBQUNEO0FBdEVKO0FBd0VILFNBcEZELE1Bb0ZPO0FBQ0hBLG1CQUFPLElBQVA7QUFDSDtBQUNELFlBQUkxZCxPQUFKLEVBQWE7QUFDVFEsc0JBQVVBLFlBQVk5RSxLQUFLd2hCLE1BQWpCLEdBQTBCeGhCLEtBQUt1aEIsTUFBL0IsR0FBd0N2aEIsS0FBS3doQixNQUF2RDtBQUNIO0FBQ0o7O0FBRUQsUUFBSS9pQixTQUFTLElBQWIsRUFBbUI7QUFDZixlQUFPLElBQVA7QUFDSDs7QUFFREEsU0FBSzRCLEdBQUwsR0FBV0wsS0FBSy9CLFVBQUwsQ0FBZ0IrQixLQUFLakMsSUFBckIsRUFBMkJVLEtBQUs0QixHQUFoQyxDQUFYO0FBQ0EsUUFBSSxDQUFDTCxLQUFLNkQseUJBQUwsQ0FBK0JwRixJQUEvQixDQUFMLEVBQTBDO0FBQ3RDLGVBQU8sSUFBUDtBQUNIOztBQUVEeWpCLGdCQUFZRCxhQUFhRSxVQUFVQSxVQUFVN2pCLE1BQVYsR0FBbUIsQ0FBN0IsQ0FBekI7QUFDQSxRQUFJNGpCLFdBQVcsR0FBWCxLQUFtQkMsVUFBVUEsVUFBVTdqQixNQUFWLEdBQW1CLENBQTdCLENBQXZCLEVBQXdEO0FBQ3BELGVBQU8sSUFBUDtBQUNIOztBQUVELFFBQUksQ0FBQ2tDLE9BQU9sQyxNQUFaLEVBQW9CO0FBQ2hCLGVBQU8sSUFBUDtBQUNIOztBQUVEO0FBQ0EsUUFBSStqQixtQkFBSixFQUF5QjtBQUNyQjdoQixlQUFPOGhCLE1BQVAsQ0FBYzloQixPQUFPbEMsTUFBUCxHQUFnQixDQUE5QixFQUFpQyxDQUFqQztBQUNIOztBQUdELFdBQU87QUFDSEcsY0FBTStCLE9BQU9xRSxJQUFQLENBQVksRUFBWixDQURIO0FBRUgxRyxlQUFPeUYsVUFBVXpGLEtBRmQ7QUFHSGtDLGFBQUs1QixLQUFLNEIsR0FIUDtBQUlIeUUsaUJBQVNBLE9BSk47QUFLSGxCLG1CQUFXQSxTQUxSO0FBTUhRLHNCQUFjQSxZQU5YO0FBT0hOLGlCQUFTckY7QUFQTixLQUFQO0FBU0gsQ0E1S0Q7O0FBK0tBLGdFQUFBYixDQUFjSSxTQUFkLENBQXdCNkYseUJBQXhCLEdBQW9ELFVBQVNDLE9BQVQsRUFBa0I7QUFDbEUsUUFBSTlELE9BQU8sSUFBWDtBQUFBLFFBQ0krRCxxQkFESjs7QUFHQUEsNEJBQXdCRCxRQUFRekQsR0FBUixHQUFlLENBQUN5RCxRQUFRekQsR0FBUixHQUFjeUQsUUFBUTNGLEtBQXZCLElBQWdDLENBQXZFO0FBQ0EsUUFBSTRGLHdCQUF3Qi9ELEtBQUtqQyxJQUFMLENBQVVPLE1BQXRDLEVBQThDO0FBQzFDLFlBQUkwQixLQUFLaUIsV0FBTCxDQUFpQjZDLFFBQVF6RCxHQUF6QixFQUE4QjBELHFCQUE5QixFQUFxRCxDQUFyRCxDQUFKLEVBQTZEO0FBQ3pELG1CQUFPRCxPQUFQO0FBQ0g7QUFDSjtBQUNELFdBQU8sSUFBUDtBQUNILENBWEQ7O0FBYUEsU0FBU2llLG1CQUFULENBQTZCUSxRQUE3QixFQUF1Q3RELFVBQXZDLEVBQW1EdGYsT0FBbkQsRUFBNEQ7QUFDeEQsUUFBSXJCLFNBQVNxQixRQUFRckIsTUFBckI7QUFBQSxRQUNJa2tCLGdCQUFnQixDQURwQjtBQUFBLFFBRUlDLGNBQWMsQ0FGbEI7O0FBSUEsV0FBTW5rQixRQUFOLEVBQWdCO0FBQ1pta0IsdUJBQWVGLFNBQVM1aUIsUUFBUXJCLE1BQVIsQ0FBVCxDQUFmO0FBQ0Fra0IseUJBQWlCdkQsV0FBV3RmLFFBQVFyQixNQUFSLENBQVgsQ0FBakI7QUFDSDtBQUNELFdBQU9ta0IsY0FBWUQsYUFBbkI7QUFDSDs7QUFFRCx5REFBZXBCLGFBQWYsRTs7Ozs7Ozs7QUM5Y0E7O0FBRUEsU0FBU3NCLGVBQVQsR0FBMkI7QUFDdkIvVyxJQUFBLGdFQUFBQSxDQUFhdkosSUFBYixDQUFrQixJQUFsQjtBQUNIOztBQUVELElBQUl1Z0IsV0FBVztBQUNYQyxTQUFLLFFBRE07QUFFWEMsVUFBTTtBQUZLLENBQWY7O0FBS0FILGdCQUFnQjFrQixTQUFoQixHQUE0QnlELE9BQU8wQixNQUFQLENBQWMsZ0VBQUF3SSxDQUFhM04sU0FBM0IsQ0FBNUI7QUFDQTBrQixnQkFBZ0Ixa0IsU0FBaEIsQ0FBMEJvRixXQUExQixHQUF3Q3NmLGVBQXhDOztBQUVBO0FBQ0E7QUFDQUEsZ0JBQWdCMWtCLFNBQWhCLENBQTBCeUMsT0FBMUIsR0FBb0MsWUFBVztBQUMzQyxRQUFJRCxTQUFTLGdFQUFBbUwsQ0FBYTNOLFNBQWIsQ0FBdUJ5QyxPQUF2QixDQUErQm9GLEtBQS9CLENBQXFDLElBQXJDLENBQWI7QUFDQSxRQUFJLENBQUNyRixNQUFMLEVBQWE7QUFDVCxlQUFPLElBQVA7QUFDSDs7QUFFRCxRQUFJL0IsT0FBTytCLE9BQU8vQixJQUFsQjs7QUFFQSxRQUFJLENBQUNBLElBQUwsRUFBVztBQUNQLGVBQU8sSUFBUDtBQUNIOztBQUVEQSxXQUFPQSxLQUFLcWtCLE9BQUwsQ0FBYUgsU0FBU0MsR0FBdEIsRUFBMkIsRUFBM0IsQ0FBUDs7QUFFQSxRQUFJLENBQUNua0IsS0FBSzRULEtBQUwsQ0FBV3NRLFNBQVNFLElBQXBCLENBQUwsRUFBZ0M7QUFDNUIsWUFBSSxJQUFKLEVBQXFCO0FBQ2pCL0gsb0JBQVFDLEdBQVIsQ0FBWSwyQkFBWixFQUF5Q3RjLElBQXpDO0FBQ0g7QUFDRCxlQUFPLElBQVA7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBS3NrQixjQUFMLENBQW9CdGtCLElBQXBCLENBQUwsRUFBZ0M7QUFDNUIsZUFBTyxJQUFQO0FBQ0g7O0FBRUQrQixXQUFPL0IsSUFBUCxHQUFjQSxJQUFkO0FBQ0EsV0FBTytCLE1BQVA7QUFDSCxDQTNCRDs7QUE2QkFraUIsZ0JBQWdCMWtCLFNBQWhCLENBQTBCK2tCLGNBQTFCLEdBQTJDLFVBQVN0a0IsSUFBVCxFQUFlO0FBQ3REO0FBQ0EsV0FBTyxDQUFDLENBQUNBLElBQVQ7QUFDSCxDQUhEOztBQUtBLHlEQUFlaWtCLGVBQWYsRTs7Ozs7Ozs7O0FDbERBO0FBQ0E7O0FBRUEsU0FBU3BJLFlBQVQsR0FBd0I7QUFDcEIxYyxJQUFBLGdFQUFBQSxDQUFjd0UsSUFBZCxDQUFtQixJQUFuQjtBQUNIOztBQUVELElBQU13SixtQkFBbUIsa0RBQXpCOztBQUVBLElBQUluSixhQUFhO0FBQ2JtSixzQkFBa0IsRUFBQzFLLE9BQU8wSyxnQkFBUixFQURMO0FBRWJDLGNBQVUsRUFBQzNLLE9BQU8wSyxpQkFBaUJvWCxLQUFqQixDQUF1QixFQUF2QixFQUEyQmhJLEdBQTNCLENBQStCO0FBQUEsbUJBQVE0RixLQUFLRSxVQUFMLENBQWdCLENBQWhCLENBQVI7QUFBQSxTQUEvQixDQUFSLEVBRkc7QUFHYmhWLHlCQUFxQixFQUFDNUssT0FBTyxDQUN6QixLQUR5QixFQUNsQixLQURrQixFQUNYLEtBRFcsRUFDSixLQURJLEVBQ0csS0FESCxFQUNVLEtBRFYsRUFDaUIsS0FEakIsRUFDd0IsS0FEeEIsRUFDK0IsS0FEL0IsRUFDc0MsS0FEdEMsRUFFekIsS0FGeUIsRUFFbEIsS0FGa0IsRUFFWCxLQUZXLEVBRUosS0FGSSxFQUVHLEtBRkgsRUFFVSxLQUZWLEVBRWlCLEtBRmpCLEVBRXdCLEtBRnhCLEVBRStCLEtBRi9CLEVBRXNDLEtBRnRDLEVBR3pCLEtBSHlCLEVBR2xCLEtBSGtCLEVBR1gsS0FIVyxFQUdKLEtBSEksRUFHRyxLQUhILEVBR1UsS0FIVixFQUdpQixLQUhqQixFQUd3QixLQUh4QixFQUcrQixLQUgvQixFQUdzQyxLQUh0QyxFQUl6QixLQUp5QixFQUlsQixLQUprQixFQUlYLEtBSlcsRUFJSixLQUpJLEVBSUcsS0FKSCxFQUlVLEtBSlYsRUFJaUIsS0FKakIsRUFJd0IsS0FKeEIsRUFJK0IsS0FKL0IsRUFJc0MsS0FKdEMsRUFLekIsS0FMeUIsRUFLbEIsS0FMa0IsRUFLWCxLQUxXLEVBS0osS0FMSSxFQUtHLEtBTEgsRUFLVSxLQUxWLEVBS2lCLEtBTGpCLEVBS3dCLEtBTHhCLENBQVIsRUFIUjtBQVViNkssY0FBVSxFQUFDN0ssT0FBTyxLQUFSLEVBVkc7QUFXYkYsWUFBUSxFQUFDRSxPQUFPLFNBQVIsRUFBbUJTLFdBQVcsS0FBOUI7QUFYSyxDQUFqQjs7QUFjQTJZLGFBQWF0YyxTQUFiLEdBQXlCeUQsT0FBTzBCLE1BQVAsQ0FBYyxnRUFBQXZGLENBQWNJLFNBQTVCLEVBQXVDeUUsVUFBdkMsQ0FBekI7QUFDQTZYLGFBQWF0YyxTQUFiLENBQXVCb0YsV0FBdkIsR0FBcUNrWCxZQUFyQzs7QUFFQUEsYUFBYXRjLFNBQWIsQ0FBdUJ5QyxPQUF2QixHQUFpQyxZQUFXO0FBQ3hDLFFBQUlULE9BQU8sSUFBWDtBQUFBLFFBQ0lvQixXQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FEZjtBQUFBLFFBRUlaLFNBQVMsRUFGYjtBQUFBLFFBR0lyQyxRQUFRNkIsS0FBSzBELFVBQUwsRUFIWjtBQUFBLFFBSUlzSSxXQUpKO0FBQUEsUUFLSUMsU0FMSjtBQUFBLFFBTUkxTCxPQU5KO0FBQUEsUUFPSTJMLFNBUEo7O0FBU0EsUUFBSSxDQUFDL04sS0FBTCxFQUFZO0FBQ1IsZUFBTyxJQUFQO0FBQ0g7QUFDRCtOLGdCQUFZbE0sS0FBS1QsUUFBTCxDQUFjUyxLQUFLakMsSUFBbkIsRUFBeUJJLE1BQU1rQyxHQUEvQixDQUFaOztBQUVBLE9BQUc7QUFDQ2UsbUJBQVdwQixLQUFLcUIsV0FBTCxDQUFpQjZLLFNBQWpCLEVBQTRCOUssUUFBNUIsQ0FBWDtBQUNBYixrQkFBVVAsS0FBS21NLFVBQUwsQ0FBZ0IvSyxRQUFoQixDQUFWO0FBQ0EsWUFBSWIsVUFBVSxDQUFkLEVBQWlCO0FBQ2IsbUJBQU8sSUFBUDtBQUNIO0FBQ0R5TCxzQkFBY2hNLEtBQUtvTSxjQUFMLENBQW9CN0wsT0FBcEIsQ0FBZDtBQUNBLFlBQUl5TCxjQUFjLENBQWxCLEVBQW9CO0FBQ2hCLG1CQUFPLElBQVA7QUFDSDtBQUNEeEwsZUFBT0osSUFBUCxDQUFZNEwsV0FBWjtBQUNBQyxvQkFBWUMsU0FBWjtBQUNBQSxxQkFBYSxxRUFBQTNLLENBQVkxQyxHQUFaLENBQWdCdUMsUUFBaEIsQ0FBYjtBQUNBOEssb0JBQVlsTSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixFQUF5Qm1PLFNBQXpCLENBQVo7QUFDSCxLQWRELFFBY1NGLGdCQUFnQixHQWR6QjtBQWVBeEwsV0FBTzZMLEdBQVA7O0FBRUEsUUFBSSxDQUFDN0wsT0FBT2xDLE1BQVosRUFBb0I7QUFDaEIsZUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSSxDQUFDMEIsS0FBS2lqQixVQUFMLENBQWdCaFgsU0FBaEIsRUFBMkJDLFNBQTNCLEVBQXNDOUssUUFBdEMsQ0FBTCxFQUFzRDtBQUNsRCxlQUFPLElBQVA7QUFDSDs7QUFFRCxRQUFJLENBQUNwQixLQUFLa2pCLGdCQUFMLENBQXNCMWlCLE1BQXRCLENBQUwsRUFBb0M7QUFDaEMsZUFBTyxJQUFQO0FBQ0g7O0FBRURBLGFBQVNBLE9BQU8yaUIsS0FBUCxDQUFhLENBQWIsRUFBZ0IzaUIsT0FBT2xDLE1BQVAsR0FBZ0IsQ0FBaEMsQ0FBVDtBQUNBLFFBQUksQ0FBQ2tDLFNBQVNSLEtBQUtvakIsZUFBTCxDQUFxQjVpQixNQUFyQixDQUFWLE1BQTRDLElBQWhELEVBQXNEO0FBQ2xELGVBQU8sSUFBUDtBQUNIOztBQUVELFdBQU87QUFDSC9CLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIMUcsZUFBT0EsTUFBTUEsS0FGVjtBQUdIa0MsYUFBSzZMLFNBSEY7QUFJSHRJLG1CQUFXekYsS0FKUjtBQUtIaUcsc0JBQWM1RDtBQUxYLEtBQVA7QUFPSCxDQXhERDs7QUEwREE4WixhQUFhdGMsU0FBYixDQUF1QmlsQixVQUF2QixHQUFvQyxVQUFTaFgsU0FBVCxFQUFvQkMsU0FBcEIsRUFBK0I7QUFDL0QsUUFBSUQsY0FBY0MsU0FBZCxJQUEyQixDQUFDLEtBQUtuTyxJQUFMLENBQVVtTyxTQUFWLENBQWhDLEVBQXNEO0FBQ2xELGVBQU8sS0FBUDtBQUNIO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0FMRDs7QUFPQW9PLGFBQWF0YyxTQUFiLENBQXVCb08sY0FBdkIsR0FBd0MsVUFBUzdMLE9BQVQsRUFBa0I7QUFDdEQsUUFBSW5DLENBQUo7QUFBQSxRQUNJNEIsT0FBTyxJQURYOztBQUdBLFNBQUs1QixJQUFJLENBQVQsRUFBWUEsSUFBSTRCLEtBQUs4TCxtQkFBTCxDQUF5QnhOLE1BQXpDLEVBQWlERixHQUFqRCxFQUFzRDtBQUNsRCxZQUFJNEIsS0FBSzhMLG1CQUFMLENBQXlCMU4sQ0FBekIsTUFBZ0NtQyxPQUFwQyxFQUE2QztBQUN6QyxtQkFBT2dNLE9BQU9DLFlBQVAsQ0FBb0J4TSxLQUFLNkwsUUFBTCxDQUFjek4sQ0FBZCxDQUFwQixDQUFQO0FBQ0g7QUFDSjtBQUNELFdBQU8sQ0FBQyxDQUFSO0FBQ0gsQ0FWRDs7QUFZQWtjLGFBQWF0YyxTQUFiLENBQXVCbU8sVUFBdkIsR0FBb0MsVUFBUy9LLFFBQVQsRUFBbUI7QUFDbkQsUUFBTUUsY0FBY0YsU0FBUzlDLE1BQTdCO0FBQ0EsUUFBSWlDLFVBQVUsQ0FBZDtBQUNBLFFBQUkxQixNQUFNLENBQVY7QUFDQSxTQUFLLElBQUlULElBQUksQ0FBYixFQUFnQkEsSUFBSWtELFdBQXBCLEVBQWlDbEQsR0FBakMsRUFBc0M7QUFDbENTLGVBQU91QyxTQUFTaEQsQ0FBVCxDQUFQO0FBQ0g7O0FBRUQsU0FBSyxJQUFJQSxLQUFJLENBQWIsRUFBZ0JBLEtBQUlrRCxXQUFwQixFQUFpQ2xELElBQWpDLEVBQXNDO0FBQ2xDLFlBQUk2Z0IsYUFBYTVmLEtBQUtrUCxLQUFMLENBQVduTixTQUFTaEQsRUFBVCxJQUFjLENBQWQsR0FBa0JTLEdBQTdCLENBQWpCO0FBQ0EsWUFBSW9nQixhQUFhLENBQWIsSUFBa0JBLGFBQWEsQ0FBbkMsRUFBc0M7QUFDbEMsbUJBQU8sQ0FBQyxDQUFSO0FBQ0g7QUFDRCxZQUFJLENBQUM3Z0IsS0FBSSxDQUFMLE1BQVksQ0FBaEIsRUFBbUI7QUFDZixpQkFBSyxJQUFJcUYsSUFBSSxDQUFiLEVBQWdCQSxJQUFJd2IsVUFBcEIsRUFBZ0N4YixHQUFoQyxFQUFxQztBQUNqQ2xELDBCQUFXQSxXQUFXLENBQVosR0FBaUIsQ0FBM0I7QUFDSDtBQUNKLFNBSkQsTUFJTztBQUNIQSx3QkFBWTBlLFVBQVo7QUFDSDtBQUNKOztBQUVELFdBQU8xZSxPQUFQO0FBQ0gsQ0F2QkQ7O0FBeUJBK1osYUFBYXRjLFNBQWIsQ0FBdUIwRixVQUF2QixHQUFvQyxZQUFXO0FBQzNDLFFBQUkxRCxPQUFPLElBQVg7QUFBQSxRQUNJUixTQUFTUSxLQUFLVCxRQUFMLENBQWNTLEtBQUtqQyxJQUFuQixDQURiO0FBQUEsUUFFSStPLGVBQWV0TixNQUZuQjtBQUFBLFFBR0loQixVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FIZDtBQUFBLFFBSUkwQixhQUFhLENBSmpCO0FBQUEsUUFLSUQsVUFBVSxLQUxkO0FBQUEsUUFNSTdCLENBTko7QUFBQSxRQU9JcUYsQ0FQSjtBQUFBLFFBUUlzSixtQkFSSjs7QUFVQSxTQUFNM08sSUFBSW9CLE1BQVYsRUFBa0JwQixJQUFJNEIsS0FBS2pDLElBQUwsQ0FBVU8sTUFBaEMsRUFBd0NGLEdBQXhDLEVBQTZDO0FBQ3pDLFlBQUk0QixLQUFLakMsSUFBTCxDQUFVSyxDQUFWLElBQWU2QixPQUFuQixFQUE0QjtBQUN4QnpCLG9CQUFRMEIsVUFBUjtBQUNILFNBRkQsTUFFTztBQUNILGdCQUFJQSxlQUFlMUIsUUFBUUYsTUFBUixHQUFpQixDQUFwQyxFQUF1QztBQUNuQztBQUNBLG9CQUFJMEIsS0FBS21NLFVBQUwsQ0FBZ0IzTixPQUFoQixNQUE2QndCLEtBQUsrTCxRQUF0QyxFQUFnRDtBQUM1Q2dCLDBDQUFzQjFOLEtBQUtnRyxLQUFMLENBQVdoRyxLQUFLMEcsR0FBTCxDQUFTLENBQVQsRUFBWStHLGVBQWdCLENBQUMxTyxJQUFJME8sWUFBTCxJQUFxQixDQUFqRCxDQUFYLENBQXRCO0FBQ0Esd0JBQUk5TSxLQUFLaUIsV0FBTCxDQUFpQjhMLG1CQUFqQixFQUFzQ0QsWUFBdEMsRUFBb0QsQ0FBcEQsQ0FBSixFQUE0RDtBQUN4RCwrQkFBTztBQUNIM08sbUNBQU8yTyxZQURKO0FBRUh6TSxpQ0FBS2pDO0FBRkYseUJBQVA7QUFJSDtBQUNKOztBQUVEME8sZ0NBQWdCdE8sUUFBUSxDQUFSLElBQWFBLFFBQVEsQ0FBUixDQUE3QjtBQUNBLHFCQUFNaUYsSUFBSSxDQUFWLEVBQWFBLElBQUksQ0FBakIsRUFBb0JBLEdBQXBCLEVBQXlCO0FBQ3JCakYsNEJBQVFpRixDQUFSLElBQWFqRixRQUFRaUYsSUFBSSxDQUFaLENBQWI7QUFDSDtBQUNEakYsd0JBQVEsQ0FBUixJQUFhLENBQWI7QUFDQUEsd0JBQVEsQ0FBUixJQUFhLENBQWI7QUFDQTBCO0FBQ0gsYUFuQkQsTUFtQk87QUFDSEE7QUFDSDtBQUNEMUIsb0JBQVEwQixVQUFSLElBQXNCLENBQXRCO0FBQ0FELHNCQUFVLENBQUNBLE9BQVg7QUFDSDtBQUNKO0FBQ0QsV0FBTyxJQUFQO0FBQ0gsQ0ExQ0Q7O0FBNENBcWEsYUFBYXRjLFNBQWIsQ0FBdUJvbEIsZUFBdkIsR0FBeUMsVUFBU0MsU0FBVCxFQUFvQjtBQUN6RCxRQUFNL2tCLFNBQVMra0IsVUFBVS9rQixNQUF6QjtBQUNBLFFBQU1rQyxTQUFTLEVBQWY7QUFDQSxTQUFLLElBQUlwQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlFLE1BQXBCLEVBQTRCRixHQUE1QixFQUFpQztBQUM3QixZQUFNd2lCLE9BQU95QyxVQUFVamxCLENBQVYsQ0FBYjtBQUNBLFlBQUl3aUIsUUFBUSxHQUFSLElBQWVBLFFBQVEsR0FBM0IsRUFBZ0M7QUFDNUIsZ0JBQUl4aUIsSUFBS0UsU0FBUyxDQUFsQixFQUFzQjtBQUNsQix1QkFBTyxJQUFQO0FBQ0g7QUFDRCxnQkFBTWdsQixXQUFXRCxVQUFVLEVBQUVqbEIsQ0FBWixDQUFqQjtBQUNBLGdCQUFNbWxCLGVBQWVELFNBQVN4QyxVQUFULENBQW9CLENBQXBCLENBQXJCO0FBQ0EsZ0JBQUk5VSxvQkFBSjtBQUNBLG9CQUFRNFUsSUFBUjtBQUNBLHFCQUFLLEdBQUw7QUFDSSx3QkFBSTBDLFlBQVksR0FBWixJQUFtQkEsWUFBWSxHQUFuQyxFQUF3QztBQUNwQ3RYLHNDQUFjTyxPQUFPQyxZQUFQLENBQW9CK1csZUFBZSxFQUFuQyxDQUFkO0FBQ0gscUJBRkQsTUFFTztBQUNILCtCQUFPLElBQVA7QUFDSDtBQUNEO0FBQ0oscUJBQUssR0FBTDtBQUNJLHdCQUFJRCxZQUFZLEdBQVosSUFBbUJBLFlBQVksR0FBbkMsRUFBd0M7QUFDcEN0WCxzQ0FBY08sT0FBT0MsWUFBUCxDQUFvQitXLGVBQWUsRUFBbkMsQ0FBZDtBQUNILHFCQUZELE1BRU8sSUFBSUQsWUFBWSxHQUFaLElBQW1CQSxZQUFZLEdBQW5DLEVBQXdDO0FBQzNDdFgsc0NBQWNPLE9BQU9DLFlBQVAsQ0FBb0IrVyxlQUFlLEVBQW5DLENBQWQ7QUFDSCxxQkFGTSxNQUVBLElBQUlELFlBQVksR0FBWixJQUFtQkEsWUFBWSxHQUFuQyxFQUF3QztBQUMzQ3RYLHNDQUFjTyxPQUFPQyxZQUFQLENBQW9CK1csZUFBZSxFQUFuQyxDQUFkO0FBQ0gscUJBRk0sTUFFQSxJQUFJRCxZQUFZLEdBQVosSUFBbUJBLFlBQVksR0FBbkMsRUFBd0M7QUFDM0N0WCxzQ0FBY08sT0FBT0MsWUFBUCxDQUFvQitXLGVBQWUsRUFBbkMsQ0FBZDtBQUNILHFCQUZNLE1BRUEsSUFBSUQsWUFBWSxHQUFaLElBQW1CQSxZQUFZLEdBQW5DLEVBQXdDO0FBQzNDdFgsc0NBQWNPLE9BQU9DLFlBQVAsQ0FBb0IsR0FBcEIsQ0FBZDtBQUNILHFCQUZNLE1BRUE7QUFDSCwrQkFBTyxJQUFQO0FBQ0g7QUFDRDtBQUNKLHFCQUFLLEdBQUw7QUFDSSx3QkFBSThXLFlBQVksR0FBWixJQUFtQkEsWUFBWSxHQUFuQyxFQUF3QztBQUNwQ3RYLHNDQUFjTyxPQUFPQyxZQUFQLENBQW9CK1csZUFBZSxFQUFuQyxDQUFkO0FBQ0gscUJBRkQsTUFFTyxJQUFJRCxhQUFhLEdBQWpCLEVBQXNCO0FBQ3pCdFgsc0NBQWMsR0FBZDtBQUNILHFCQUZNLE1BRUE7QUFDSCwrQkFBTyxJQUFQO0FBQ0g7QUFDRDtBQUNKLHFCQUFLLEdBQUw7QUFDSSx3QkFBSXNYLFlBQVksR0FBWixJQUFtQkEsWUFBWSxHQUFuQyxFQUF3QztBQUNwQ3RYLHNDQUFjTyxPQUFPQyxZQUFQLENBQW9CK1csZUFBZSxFQUFuQyxDQUFkO0FBQ0gscUJBRkQsTUFFTztBQUNILCtCQUFPLElBQVA7QUFDSDtBQUNEO0FBdENKO0FBd0NBL2lCLG1CQUFPSixJQUFQLENBQVk0TCxXQUFaO0FBQ0gsU0FoREQsTUFnRE87QUFDSHhMLG1CQUFPSixJQUFQLENBQVl3Z0IsSUFBWjtBQUNIO0FBQ0o7QUFDRCxXQUFPcGdCLE1BQVA7QUFDSCxDQTFERDs7QUE0REE4WixhQUFhdGMsU0FBYixDQUF1QmtsQixnQkFBdkIsR0FBMEMsVUFBU0csU0FBVCxFQUFvQjtBQUMxRCxXQUFPLEtBQUtHLGVBQUwsQ0FBcUJILFNBQXJCLEVBQWdDQSxVQUFVL2tCLE1BQVYsR0FBbUIsQ0FBbkQsRUFBc0QsRUFBdEQsS0FDQSxLQUFLa2xCLGVBQUwsQ0FBcUJILFNBQXJCLEVBQWdDQSxVQUFVL2tCLE1BQVYsR0FBbUIsQ0FBbkQsRUFBc0QsRUFBdEQsQ0FEUDtBQUVILENBSEQ7O0FBS0FnYyxhQUFhdGMsU0FBYixDQUF1QndsQixlQUF2QixHQUF5QyxVQUFTSCxTQUFULEVBQW9CSSxLQUFwQixFQUEyQkMsU0FBM0IsRUFBc0M7QUFBQTs7QUFDM0UsUUFBTUMsZUFBZU4sVUFBVUYsS0FBVixDQUFnQixDQUFoQixFQUFtQk0sS0FBbkIsQ0FBckI7QUFDQSxRQUFNbmxCLFNBQVNxbEIsYUFBYXJsQixNQUE1QjtBQUNBLFFBQU1zbEIsZUFBZUQsYUFBYWhMLE1BQWIsQ0FBb0IsVUFBQzlaLEdBQUQsRUFBTStoQixJQUFOLEVBQVl4aUIsQ0FBWixFQUFrQjtBQUN2RCxZQUFNeWxCLFNBQVUsQ0FBRXpsQixJQUFJLENBQUMsQ0FBTixJQUFZRSxTQUFTLENBQXJCLENBQUQsSUFBNEJvbEIsU0FBN0IsR0FBMEMsQ0FBekQ7QUFDQSxZQUFNeGlCLFFBQVEsTUFBSzJLLFFBQUwsQ0FBY3FNLE9BQWQsQ0FBc0IwSSxLQUFLRSxVQUFMLENBQWdCLENBQWhCLENBQXRCLENBQWQ7QUFDQSxlQUFPamlCLE1BQU9nbEIsU0FBUzNpQixLQUF2QjtBQUNILEtBSm9CLEVBSWxCLENBSmtCLENBQXJCOztBQU1BLFFBQU00aUIsWUFBWSxLQUFLalksUUFBTCxDQUFlK1gsZUFBZSxFQUE5QixDQUFsQjtBQUNBLFdBQU9FLGNBQWNULFVBQVVJLEtBQVYsRUFBaUIzQyxVQUFqQixDQUE0QixDQUE1QixDQUFyQjtBQUNILENBWEQ7O0FBYUEseURBQWV4RyxZQUFmLEU7Ozs7Ozs7O0FDMVBBOztBQUVBLFNBQVN5SixVQUFULEdBQXNCO0FBQ2xCOWhCLElBQUEsNERBQUFBLENBQVVHLElBQVYsQ0FBZSxJQUFmO0FBQ0g7O0FBRUQsSUFBSUssYUFBYTtBQUNiekIsWUFBUSxFQUFDRSxPQUFPLE9BQVIsRUFBaUJTLFdBQVcsS0FBNUI7QUFESyxDQUFqQjs7QUFJQW9pQixXQUFXL2xCLFNBQVgsR0FBdUJ5RCxPQUFPMEIsTUFBUCxDQUFjLDREQUFBbEIsQ0FBVWpFLFNBQXhCLEVBQW1DeUUsVUFBbkMsQ0FBdkI7QUFDQXNoQixXQUFXL2xCLFNBQVgsQ0FBcUJvRixXQUFyQixHQUFtQzJnQixVQUFuQzs7QUFFQUEsV0FBVy9sQixTQUFYLENBQXFCK0csTUFBckIsR0FBOEIsVUFBU1MsR0FBVCxFQUFjckgsS0FBZCxFQUFxQjtBQUMvQyxTQUFLSixJQUFMLEdBQVl5SCxHQUFaO0FBQ0EsUUFBSXBFLFdBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQWY7QUFBQSxRQUNJOEMsZ0JBQWdCLENBRHBCO0FBQUEsUUFFSTlGLElBQUksQ0FGUjtBQUFBLFFBR0lvQixTQUFTckIsS0FIYjtBQUFBLFFBSUlrQyxNQUFNLEtBQUt0QyxJQUFMLENBQVVPLE1BSnBCO0FBQUEsUUFLSUcsSUFMSjtBQUFBLFFBTUkrQixTQUFTLEVBTmI7QUFBQSxRQU9JNEQsZUFBZSxFQVBuQjs7QUFTQSxTQUFLaEcsSUFBSSxDQUFULEVBQVlBLElBQUksQ0FBSixJQUFTb0IsU0FBU2EsR0FBOUIsRUFBbUNqQyxHQUFuQyxFQUF3QztBQUNwQ0ssZUFBTyxLQUFLNEUsV0FBTCxDQUFpQjdELE1BQWpCLENBQVA7QUFDQSxZQUFJLENBQUNmLElBQUwsRUFBVztBQUNQLG1CQUFPLElBQVA7QUFDSDtBQUNEMkYscUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDQStCLGVBQU9KLElBQVAsQ0FBWTNCLEtBQUtBLElBQUwsR0FBWSxFQUF4QjtBQUNBLFlBQUlBLEtBQUtBLElBQUwsSUFBYSxLQUFLa0UsWUFBdEIsRUFBb0M7QUFDaEN1Qiw2QkFBaUIsS0FBTSxJQUFJOUYsQ0FBM0I7QUFDSDtBQUNELFlBQUlBLEtBQUssQ0FBVCxFQUFZO0FBQ1JvQixxQkFBUyxLQUFLRCxRQUFMLENBQWMsS0FBS3hCLElBQW5CLEVBQXlCVSxLQUFLNEIsR0FBOUIsQ0FBVDtBQUNBYixxQkFBUyxLQUFLdkIsVUFBTCxDQUFnQixLQUFLRixJQUFyQixFQUEyQnlCLE1BQTNCLENBQVQ7QUFDSDtBQUNKOztBQUVELFFBQUlnQixPQUFPbEMsTUFBUCxJQUFpQixDQUFqQixJQUF1QjBsQixTQUFTeGpCLE9BQU9xRSxJQUFQLENBQVksRUFBWixDQUFULElBQTRCLENBQTdCLEtBQXFDWCxhQUEvRCxFQUE4RTtBQUMxRSxlQUFPLElBQVA7QUFDSDtBQUNELFdBQU87QUFDSHpGLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIVCxrQ0FGRztBQUdIL0QsYUFBSzVCLEtBQUs0QjtBQUhQLEtBQVA7QUFLSCxDQW5DRDs7QUFxQ0EseURBQWUwakIsVUFBZixFOzs7Ozs7OztBQ2xEQTs7QUFFQSxTQUFTRSxVQUFULEdBQXNCO0FBQ2xCaGlCLElBQUEsNERBQUFBLENBQVVHLElBQVYsQ0FBZSxJQUFmO0FBQ0g7O0FBRUQsSUFBSUssYUFBYTtBQUNiekIsWUFBUSxFQUFDRSxPQUFPLE9BQVIsRUFBaUJTLFdBQVcsS0FBNUI7QUFESyxDQUFqQjs7QUFJQSxJQUFNdWlCLHdCQUF3QixDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsRUFBMkIsRUFBM0IsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsQ0FBOUI7O0FBRUFELFdBQVdqbUIsU0FBWCxHQUF1QnlELE9BQU8wQixNQUFQLENBQWMsNERBQUFsQixDQUFVakUsU0FBeEIsRUFBbUN5RSxVQUFuQyxDQUF2QjtBQUNBd2hCLFdBQVdqbUIsU0FBWCxDQUFxQm9GLFdBQXJCLEdBQW1DNmdCLFVBQW5DOztBQUVBQSxXQUFXam1CLFNBQVgsQ0FBcUIrRyxNQUFyQixHQUE4QixVQUFTUyxHQUFULEVBQWNySCxLQUFkLEVBQXFCO0FBQy9DLFNBQUtKLElBQUwsR0FBWXlILEdBQVo7QUFDQSxRQUFJcEUsV0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBZjtBQUFBLFFBQ0k4QyxnQkFBZ0IsQ0FEcEI7QUFBQSxRQUVJOUYsSUFBSSxDQUZSO0FBQUEsUUFHSW9CLFNBQVNyQixLQUhiO0FBQUEsUUFJSWtDLE1BQU0sS0FBS3RDLElBQUwsQ0FBVU8sTUFKcEI7QUFBQSxRQUtJRyxJQUxKO0FBQUEsUUFNSStCLFNBQVMsRUFOYjtBQUFBLFFBT0k0RCxlQUFlLEVBUG5COztBQVNBLFNBQUtoRyxJQUFJLENBQVQsRUFBWUEsSUFBSSxDQUFKLElBQVNvQixTQUFTYSxHQUE5QixFQUFtQ2pDLEdBQW5DLEVBQXdDO0FBQ3BDSyxlQUFPLEtBQUs0RSxXQUFMLENBQWlCN0QsTUFBakIsQ0FBUDtBQUNBLFlBQUksQ0FBQ2YsSUFBTCxFQUFXO0FBQ1AsbUJBQU8sSUFBUDtBQUNIO0FBQ0QyRixxQkFBYWhFLElBQWIsQ0FBa0IzQixJQUFsQjtBQUNBK0IsZUFBT0osSUFBUCxDQUFZM0IsS0FBS0EsSUFBTCxHQUFZLEVBQXhCO0FBQ0EsWUFBSUEsS0FBS0EsSUFBTCxJQUFhLEtBQUtrRSxZQUF0QixFQUFvQztBQUNoQ3VCLDZCQUFpQixLQUFNLElBQUk5RixDQUEzQjtBQUNIO0FBQ0QsWUFBSUEsS0FBSyxDQUFULEVBQVk7QUFDUm9CLHFCQUFTLEtBQUtELFFBQUwsQ0FBYyxLQUFLeEIsSUFBbkIsRUFBeUJVLEtBQUs0QixHQUE5QixDQUFUO0FBQ0FiLHFCQUFTLEtBQUt2QixVQUFMLENBQWdCLEtBQUtGLElBQXJCLEVBQTJCeUIsTUFBM0IsQ0FBVDtBQUNIO0FBQ0o7O0FBRUQsUUFBSWdCLE9BQU9sQyxNQUFQLElBQWlCLENBQXJCLEVBQXdCO0FBQ3BCLGVBQU8sSUFBUDtBQUNIOztBQUVELFFBQUk2bEIsa0JBQWtCM2pCLE1BQWxCLE1BQThCNGpCLG9CQUFvQmxnQixhQUFwQixDQUFsQyxFQUFzRTtBQUNsRSxlQUFPLElBQVA7QUFDSDtBQUNELFdBQU87QUFDSHpGLGNBQU0rQixPQUFPcUUsSUFBUCxDQUFZLEVBQVosQ0FESDtBQUVIVCxrQ0FGRztBQUdIL0QsYUFBSzVCLEtBQUs0QjtBQUhQLEtBQVA7QUFLSCxDQXZDRDs7QUF5Q0EsU0FBUytqQixtQkFBVCxDQUE2QmxnQixhQUE3QixFQUE0QztBQUN4QyxRQUFJOUYsQ0FBSjtBQUNBLFNBQUtBLElBQUksQ0FBVCxFQUFZQSxJQUFJLEVBQWhCLEVBQW9CQSxHQUFwQixFQUF5QjtBQUNyQixZQUFJOEYsa0JBQWtCZ2dCLHNCQUFzQjlsQixDQUF0QixDQUF0QixFQUFnRDtBQUM1QyxtQkFBT0EsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSDs7QUFHRCxTQUFTK2xCLGlCQUFULENBQTJCM2pCLE1BQTNCLEVBQW1DO0FBQy9CLFFBQUlsQyxTQUFTa0MsT0FBT2xDLE1BQXBCO0FBQUEsUUFDSU8sTUFBTSxDQURWO0FBQUEsUUFFSVQsQ0FGSjs7QUFJQSxTQUFLQSxJQUFJRSxTQUFTLENBQWxCLEVBQXFCRixLQUFLLENBQTFCLEVBQTZCQSxLQUFLLENBQWxDLEVBQXFDO0FBQ2pDUyxlQUFPMkIsT0FBT3BDLENBQVAsQ0FBUDtBQUNIO0FBQ0RTLFdBQU8sQ0FBUDtBQUNBLFNBQUtULElBQUlFLFNBQVMsQ0FBbEIsRUFBcUJGLEtBQUssQ0FBMUIsRUFBNkJBLEtBQUssQ0FBbEMsRUFBcUM7QUFDakNTLGVBQU8yQixPQUFPcEMsQ0FBUCxDQUFQO0FBQ0g7QUFDRFMsV0FBTyxDQUFQO0FBQ0EsV0FBT0EsTUFBTSxFQUFiO0FBQ0g7O0FBRUQseURBQWVvbEIsVUFBZixFOzs7Ozs7OztBQ25GQTs7QUFFQSxTQUFTSSxVQUFULENBQW9CbmlCLElBQXBCLEVBQTBCcEUsV0FBMUIsRUFBdUM7QUFDbkNtRSxJQUFBLDREQUFBQSxDQUFVRyxJQUFWLENBQWUsSUFBZixFQUFxQkYsSUFBckIsRUFBMkJwRSxXQUEzQjtBQUNIOztBQUVELElBQUkyRSxhQUFhO0FBQ2J6QixZQUFRLEVBQUNFLE9BQU8sT0FBUixFQUFpQlMsV0FBVyxLQUE1QjtBQURLLENBQWpCOztBQUlBMGlCLFdBQVdybUIsU0FBWCxHQUF1QnlELE9BQU8wQixNQUFQLENBQWMsNERBQUFsQixDQUFVakUsU0FBeEIsRUFBbUN5RSxVQUFuQyxDQUF2QjtBQUNBNGhCLFdBQVdybUIsU0FBWCxDQUFxQm9GLFdBQXJCLEdBQW1DaWhCLFVBQW5DOztBQUVBQSxXQUFXcm1CLFNBQVgsQ0FBcUJtRyxjQUFyQixHQUFzQyxVQUFTMUYsSUFBVCxFQUFlK0IsTUFBZixFQUF1QjRELFlBQXZCLEVBQXFDO0FBQ3ZFLFFBQUloRyxDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDs7QUFHQSxTQUFNNUIsSUFBSSxDQUFWLEVBQWFBLElBQUksQ0FBakIsRUFBb0JBLEdBQXBCLEVBQXlCO0FBQ3JCSyxlQUFPdUIsS0FBS3FELFdBQUwsQ0FBaUI1RSxLQUFLNEIsR0FBdEIsRUFBMkJMLEtBQUsyQyxZQUFoQyxDQUFQO0FBQ0EsWUFBSSxDQUFDbEUsSUFBTCxFQUFXO0FBQ1AsbUJBQU8sSUFBUDtBQUNIO0FBQ0QrQixlQUFPSixJQUFQLENBQVkzQixLQUFLQSxJQUFqQjtBQUNBMkYscUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDSDs7QUFFREEsV0FBT3VCLEtBQUt1RCxZQUFMLENBQWtCdkQsS0FBSzhDLGNBQXZCLEVBQXVDckUsS0FBSzRCLEdBQTVDLEVBQWlELElBQWpELEVBQXVELEtBQXZELENBQVA7QUFDQSxRQUFJNUIsU0FBUyxJQUFiLEVBQW1CO0FBQ2YsZUFBTyxJQUFQO0FBQ0g7QUFDRDJGLGlCQUFhaEUsSUFBYixDQUFrQjNCLElBQWxCOztBQUVBLFNBQU1MLElBQUksQ0FBVixFQUFhQSxJQUFJLENBQWpCLEVBQW9CQSxHQUFwQixFQUF5QjtBQUNyQkssZUFBT3VCLEtBQUtxRCxXQUFMLENBQWlCNUUsS0FBSzRCLEdBQXRCLEVBQTJCTCxLQUFLMkMsWUFBaEMsQ0FBUDtBQUNBLFlBQUksQ0FBQ2xFLElBQUwsRUFBVztBQUNQLG1CQUFPLElBQVA7QUFDSDtBQUNEMkYscUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDQStCLGVBQU9KLElBQVAsQ0FBWTNCLEtBQUtBLElBQWpCO0FBQ0g7O0FBRUQsV0FBT0EsSUFBUDtBQUNILENBN0JEOztBQStCQSx5REFBZTRsQixVQUFmLEU7Ozs7Ozs7Ozs7O0FDNUNBOzs7QUFHQSxTQUFTQyxXQUFULENBQXFCcGlCLElBQXJCLEVBQTJCO0FBQ3ZCQSxXQUFPLHFEQUFNQyxpQkFBTixFQUF5QkQsSUFBekIsQ0FBUDtBQUNBdEUsSUFBQSxnRUFBQUEsQ0FBY3dFLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUJGLElBQXpCO0FBQ0EsU0FBS3ljLGFBQUwsR0FBcUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFyQjtBQUNBLFFBQUl6YyxLQUFLcWlCLHNCQUFULEVBQWlDO0FBQzdCLGFBQUtybEIsaUJBQUwsR0FBeUIsSUFBekI7QUFDQSxhQUFLZ0UsY0FBTCxHQUFzQixJQUF0QjtBQUNIO0FBQ0o7O0FBRUQsU0FBU2YsZUFBVCxHQUEyQjtBQUN2QixRQUFJdEUsU0FBUyxFQUFiOztBQUVBNEQsV0FBT1ksSUFBUCxDQUFZaWlCLFlBQVl0aUIsV0FBeEIsRUFBcUNNLE9BQXJDLENBQTZDLFVBQVNDLEdBQVQsRUFBYztBQUN2RDFFLGVBQU8wRSxHQUFQLElBQWMraEIsWUFBWXRpQixXQUFaLENBQXdCTyxHQUF4QixFQUE2QkMsT0FBM0M7QUFDSCxLQUZEO0FBR0EsV0FBTzNFLE1BQVA7QUFDSDs7QUFFRCxJQUFJK2dCLElBQUksQ0FBUjtBQUFBLElBQ0lDLElBQUksQ0FEUjtBQUFBLElBRUlwYyxhQUFhO0FBQ1RHLG1CQUFlLEVBQUMxQixPQUFPLENBQUMwZCxDQUFELEVBQUlBLENBQUosRUFBT0EsQ0FBUCxFQUFVQSxDQUFWLENBQVIsRUFETjtBQUVUL2Isa0JBQWMsRUFBQzNCLE9BQU8sQ0FBQzBkLENBQUQsRUFBSUEsQ0FBSixFQUFPQyxDQUFQLENBQVIsRUFGTDtBQUdUN2Isa0JBQWMsRUFBQzlCLE9BQU8sQ0FDbEIsQ0FBQzBkLENBQUQsRUFBSUEsQ0FBSixFQUFPQyxDQUFQLEVBQVVBLENBQVYsRUFBYUQsQ0FBYixDQURrQixFQUVsQixDQUFDQyxDQUFELEVBQUlELENBQUosRUFBT0EsQ0FBUCxFQUFVQSxDQUFWLEVBQWFDLENBQWIsQ0FGa0IsRUFHbEIsQ0FBQ0QsQ0FBRCxFQUFJQyxDQUFKLEVBQU9ELENBQVAsRUFBVUEsQ0FBVixFQUFhQyxDQUFiLENBSGtCLEVBSWxCLENBQUNBLENBQUQsRUFBSUEsQ0FBSixFQUFPRCxDQUFQLEVBQVVBLENBQVYsRUFBYUEsQ0FBYixDQUprQixFQUtsQixDQUFDQSxDQUFELEVBQUlBLENBQUosRUFBT0MsQ0FBUCxFQUFVRCxDQUFWLEVBQWFDLENBQWIsQ0FMa0IsRUFNbEIsQ0FBQ0EsQ0FBRCxFQUFJRCxDQUFKLEVBQU9DLENBQVAsRUFBVUQsQ0FBVixFQUFhQSxDQUFiLENBTmtCLEVBT2xCLENBQUNBLENBQUQsRUFBSUMsQ0FBSixFQUFPQSxDQUFQLEVBQVVELENBQVYsRUFBYUEsQ0FBYixDQVBrQixFQVFsQixDQUFDQSxDQUFELEVBQUlBLENBQUosRUFBT0EsQ0FBUCxFQUFVQyxDQUFWLEVBQWFBLENBQWIsQ0FSa0IsRUFTbEIsQ0FBQ0EsQ0FBRCxFQUFJRCxDQUFKLEVBQU9BLENBQVAsRUFBVUMsQ0FBVixFQUFhRCxDQUFiLENBVGtCLEVBVWxCLENBQUNBLENBQUQsRUFBSUMsQ0FBSixFQUFPRCxDQUFQLEVBQVVDLENBQVYsRUFBYUQsQ0FBYixDQVZrQixDQUFSLEVBSEw7QUFlVDFmLHVCQUFtQixFQUFDZ0MsT0FBTyxJQUFSLEVBQWM0ZCxVQUFVLElBQXhCLEVBZlY7QUFnQlQ1YixvQkFBZ0IsRUFBQ2hDLE9BQU8sSUFBUixFQUFjNGQsVUFBVSxJQUF4QixFQWhCUDtBQWlCVDBGLDJCQUF1QixFQUFDdGpCLE9BQU8sQ0FBUixFQWpCZDtBQWtCVEYsWUFBUSxFQUFDRSxPQUFPLE9BQVI7QUFsQkMsQ0FGakI7O0FBdUJBb2pCLFlBQVl0bUIsU0FBWixHQUF3QnlELE9BQU8wQixNQUFQLENBQWMsZ0VBQUF2RixDQUFjSSxTQUE1QixFQUF1Q3lFLFVBQXZDLENBQXhCO0FBQ0E2aEIsWUFBWXRtQixTQUFaLENBQXNCb0YsV0FBdEIsR0FBb0NraEIsV0FBcEM7O0FBRUFBLFlBQVl0bUIsU0FBWixDQUFzQk8sYUFBdEIsR0FBc0MsVUFBU0MsT0FBVCxFQUFrQkMsSUFBbEIsRUFBd0I7QUFDMUQsUUFBSSxLQUFLWixNQUFMLENBQVkwbUIsc0JBQWhCLEVBQXdDO0FBQ3BDLFlBQUlubUIsQ0FBSjtBQUFBLFlBQ0lxbUIsYUFBYSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGpCO0FBQUEsWUFFSUMsVUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRmQ7QUFBQSxZQUdJaGxCLGFBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUhqQjtBQUFBLFlBSUlpbEIsa0JBQWtCLEtBQUtILHFCQUozQjtBQUFBLFlBS0lJLHlCQUF5QixJQUFJRCxlQUxqQzs7QUFPQSxhQUFLdm1CLElBQUksQ0FBVCxFQUFZQSxJQUFJSSxRQUFRRixNQUF4QixFQUFnQ0YsR0FBaEMsRUFBcUM7QUFDakNxbUIsdUJBQVdybUIsSUFBSSxDQUFmLEtBQXFCSSxRQUFRSixDQUFSLENBQXJCO0FBQ0FzbUIsb0JBQVF0bUIsSUFBSSxDQUFaLEtBQWtCSyxLQUFLTCxDQUFMLENBQWxCO0FBQ0g7QUFDRHNCLG1CQUFXLENBQVgsSUFBZ0JnbEIsUUFBUSxDQUFSLElBQWFELFdBQVcsQ0FBWCxDQUE3QjtBQUNBL2tCLG1CQUFXLENBQVgsSUFBZ0JnbEIsUUFBUSxDQUFSLElBQWFELFdBQVcsQ0FBWCxDQUE3Qjs7QUFFQS9rQixtQkFBVyxDQUFYLElBQWdCTCxLQUFLMEcsR0FBTCxDQUFTMUcsS0FBSzJVLEdBQUwsQ0FBU3RVLFdBQVcsQ0FBWCxDQUFULEVBQXdCaWxCLGVBQXhCLENBQVQsRUFBbURDLHNCQUFuRCxDQUFoQjtBQUNBbGxCLG1CQUFXLENBQVgsSUFBZ0JMLEtBQUswRyxHQUFMLENBQVMxRyxLQUFLMlUsR0FBTCxDQUFTdFUsV0FBVyxDQUFYLENBQVQsRUFBd0JpbEIsZUFBeEIsQ0FBVCxFQUFtREMsc0JBQW5ELENBQWhCO0FBQ0EsYUFBS2pHLGFBQUwsR0FBcUJqZixVQUFyQjtBQUNBLGFBQUt0QixJQUFJLENBQVQsRUFBWUEsSUFBSUksUUFBUUYsTUFBeEIsRUFBZ0NGLEdBQWhDLEVBQXFDO0FBQ2pDSSxvQkFBUUosQ0FBUixLQUFjLEtBQUt1Z0IsYUFBTCxDQUFtQnZnQixJQUFJLENBQXZCLENBQWQ7QUFDSDtBQUNKO0FBQ0QsV0FBTyxnRUFBQVIsQ0FBY0ksU0FBZCxDQUF3Qk8sYUFBeEIsQ0FBc0M2RCxJQUF0QyxDQUEyQyxJQUEzQyxFQUFpRDVELE9BQWpELEVBQTBEQyxJQUExRCxDQUFQO0FBQ0gsQ0F4QkQ7O0FBMEJBNmxCLFlBQVl0bUIsU0FBWixDQUFzQnVGLFlBQXRCLEdBQXFDLFVBQVNoRCxPQUFULEVBQWtCZixNQUFsQixFQUEwQlMsT0FBMUIsRUFBbUN1RCxTQUFuQyxFQUE4QztBQUMvRSxRQUFJaEYsVUFBVSxFQUFkO0FBQUEsUUFDSXdCLE9BQU8sSUFEWDtBQUFBLFFBRUk1QixDQUZKO0FBQUEsUUFHSThCLGFBQWEsQ0FIakI7QUFBQSxRQUlJQyxZQUFZO0FBQ1J4QixlQUFPUSxPQUFPQyxTQUROO0FBRVJYLGNBQU0sQ0FBQyxDQUZDO0FBR1JOLGVBQU8sQ0FIQztBQUlSa0MsYUFBSztBQUpHLEtBSmhCO0FBQUEsUUFVSTFCLEtBVko7QUFBQSxRQVdJOEUsQ0FYSjtBQUFBLFFBWUk1RSxHQVpKO0FBQUEsUUFhSW9nQixVQWJKO0FBQUEsUUFjSWxmLFVBQVVDLEtBQUtrRCxjQWRuQjs7QUFnQkFqRCxjQUFVQSxXQUFXLEtBQXJCO0FBQ0F1RCxnQkFBWUEsYUFBYSxLQUF6Qjs7QUFFQSxRQUFJLENBQUNoRSxNQUFMLEVBQWE7QUFDVEEsaUJBQVNRLEtBQUtULFFBQUwsQ0FBY1MsS0FBS2pDLElBQW5CLENBQVQ7QUFDSDs7QUFFRCxTQUFNSyxJQUFJLENBQVYsRUFBYUEsSUFBSW1DLFFBQVFqQyxNQUF6QixFQUFpQ0YsR0FBakMsRUFBc0M7QUFDbENJLGdCQUFRSixDQUFSLElBQWEsQ0FBYjtBQUNIOztBQUVELFNBQU1BLElBQUlvQixNQUFWLEVBQWtCcEIsSUFBSTRCLEtBQUtqQyxJQUFMLENBQVVPLE1BQWhDLEVBQXdDRixHQUF4QyxFQUE2QztBQUN6QyxZQUFJNEIsS0FBS2pDLElBQUwsQ0FBVUssQ0FBVixJQUFlNkIsT0FBbkIsRUFBNEI7QUFDeEJ6QixvQkFBUTBCLFVBQVI7QUFDSCxTQUZELE1BRU87QUFDSCxnQkFBSUEsZUFBZTFCLFFBQVFGLE1BQVIsR0FBaUIsQ0FBcEMsRUFBdUM7QUFDbkNPLHNCQUFNLENBQU47QUFDQSxxQkFBTTRFLElBQUksQ0FBVixFQUFhQSxJQUFJakYsUUFBUUYsTUFBekIsRUFBaUNtRixHQUFqQyxFQUFzQztBQUNsQzVFLDJCQUFPTCxRQUFRaUYsQ0FBUixDQUFQO0FBQ0g7QUFDRDlFLHdCQUFRcUIsS0FBS3pCLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCK0IsT0FBNUIsQ0FBUjtBQUNBLG9CQUFJNUIsUUFBUW9CLE9BQVosRUFBcUI7QUFDakJJLDhCQUFVeEIsS0FBVixHQUFrQkEsS0FBbEI7QUFDQXdCLDhCQUFVaEMsS0FBVixHQUFrQkMsSUFBSVMsR0FBdEI7QUFDQXNCLDhCQUFVRSxHQUFWLEdBQWdCakMsQ0FBaEI7QUFDQSwyQkFBTytCLFNBQVA7QUFDSDtBQUNELG9CQUFJcUQsU0FBSixFQUFlO0FBQ1gseUJBQUtDLElBQUksQ0FBVCxFQUFZQSxJQUFJakYsUUFBUUYsTUFBUixHQUFpQixDQUFqQyxFQUFvQ21GLEdBQXBDLEVBQXlDO0FBQ3JDakYsZ0NBQVFpRixDQUFSLElBQWFqRixRQUFRaUYsSUFBSSxDQUFaLENBQWI7QUFDSDtBQUNEakYsNEJBQVFBLFFBQVFGLE1BQVIsR0FBaUIsQ0FBekIsSUFBOEIsQ0FBOUI7QUFDQUUsNEJBQVFBLFFBQVFGLE1BQVIsR0FBaUIsQ0FBekIsSUFBOEIsQ0FBOUI7QUFDQTRCO0FBQ0gsaUJBUEQsTUFPTztBQUNILDJCQUFPLElBQVA7QUFDSDtBQUNKLGFBdEJELE1Bc0JPO0FBQ0hBO0FBQ0g7QUFDRDFCLG9CQUFRMEIsVUFBUixJQUFzQixDQUF0QjtBQUNBRCxzQkFBVSxDQUFDQSxPQUFYO0FBQ0g7QUFDSjtBQUNELFdBQU8sSUFBUDtBQUNILENBOUREOztBQWdFQXFrQixZQUFZdG1CLFNBQVosQ0FBc0IwRixVQUF0QixHQUFtQyxZQUFXO0FBQzFDLFFBQUkxRCxPQUFPLElBQVg7QUFBQSxRQUNJMkQsc0JBREo7QUFBQSxRQUVJbkUsU0FBU1EsS0FBS1QsUUFBTCxDQUFjUyxLQUFLakMsSUFBbkIsQ0FGYjtBQUFBLFFBR0k2RixTQUhKO0FBQUEsUUFJSW9iLGlCQUFpQixDQUpyQjs7QUFNQSxXQUFPLENBQUNwYixTQUFSLEVBQW1CO0FBQ2ZBLG9CQUFZNUQsS0FBS3VELFlBQUwsQ0FBa0J2RCxLQUFLNEMsYUFBdkIsRUFBc0NwRCxNQUF0QyxFQUE4QyxLQUE5QyxFQUFxRCxJQUFyRCxDQUFaO0FBQ0EsWUFBSSxDQUFDb0UsU0FBTCxFQUFnQjtBQUNaLG1CQUFPLElBQVA7QUFDSDtBQUNEb2IseUJBQWlCM2YsS0FBS2dHLEtBQUwsQ0FBVyxDQUFDekIsVUFBVXZELEdBQVYsR0FBZ0J1RCxVQUFVekYsS0FBM0IsSUFBb0MsQ0FBL0MsQ0FBakI7QUFDQXdGLGlDQUF5QkMsVUFBVXpGLEtBQVYsR0FBa0I2Z0IsaUJBQWlCLEVBQTVEO0FBQ0EsWUFBSXJiLDBCQUEwQixDQUE5QixFQUFpQztBQUM3QixnQkFBSTNELEtBQUtpQixXQUFMLENBQWlCMEMsc0JBQWpCLEVBQXlDQyxVQUFVekYsS0FBbkQsRUFBMEQsQ0FBMUQsQ0FBSixFQUFrRTtBQUM5RCx1QkFBT3lGLFNBQVA7QUFDSDtBQUNKO0FBQ0RwRSxpQkFBU29FLFVBQVV2RCxHQUFuQjtBQUNBdUQsb0JBQVksSUFBWjtBQUNIO0FBQ0osQ0F0QkQ7O0FBd0JBMGdCLFlBQVl0bUIsU0FBWixDQUFzQjZGLHlCQUF0QixHQUFrRCxVQUFTQyxPQUFULEVBQWtCO0FBQ2hFLFFBQUk5RCxPQUFPLElBQVg7QUFBQSxRQUNJK0QscUJBREo7O0FBR0FBLDRCQUF3QkQsUUFBUXpELEdBQVIsR0FBZSxDQUFDeUQsUUFBUXpELEdBQVIsR0FBY3lELFFBQVEzRixLQUF2QixJQUFnQyxDQUF2RTtBQUNBLFFBQUk0Rix3QkFBd0IvRCxLQUFLakMsSUFBTCxDQUFVTyxNQUF0QyxFQUE4QztBQUMxQyxZQUFJMEIsS0FBS2lCLFdBQUwsQ0FBaUI2QyxRQUFRekQsR0FBekIsRUFBOEIwRCxxQkFBOUIsRUFBcUQsQ0FBckQsQ0FBSixFQUE2RDtBQUN6RCxtQkFBT0QsT0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQVhEOztBQWFBd2dCLFlBQVl0bUIsU0FBWixDQUFzQmdHLFFBQXRCLEdBQWlDLFlBQVc7QUFDeEMsUUFBSWhFLE9BQU8sSUFBWDtBQUFBLFFBQ0k4RCxPQURKO0FBQUEsUUFFSWxFLEdBRko7O0FBSUFJLFNBQUtqQyxJQUFMLENBQVUyQyxPQUFWO0FBQ0FvRCxjQUFVOUQsS0FBS3VELFlBQUwsQ0FBa0J2RCxLQUFLNkMsWUFBdkIsQ0FBVjtBQUNBN0MsU0FBS2pDLElBQUwsQ0FBVTJDLE9BQVY7O0FBRUEsUUFBSW9ELFlBQVksSUFBaEIsRUFBc0I7QUFDbEIsZUFBTyxJQUFQO0FBQ0g7O0FBRUQ7QUFDQWxFLFVBQU1rRSxRQUFRM0YsS0FBZDtBQUNBMkYsWUFBUTNGLEtBQVIsR0FBZ0I2QixLQUFLakMsSUFBTCxDQUFVTyxNQUFWLEdBQW1Cd0YsUUFBUXpELEdBQTNDO0FBQ0F5RCxZQUFRekQsR0FBUixHQUFjTCxLQUFLakMsSUFBTCxDQUFVTyxNQUFWLEdBQW1Cc0IsR0FBakM7O0FBRUEsV0FBT2tFLFlBQVksSUFBWixHQUFtQjlELEtBQUs2RCx5QkFBTCxDQUErQkMsT0FBL0IsQ0FBbkIsR0FBNkQsSUFBcEU7QUFDSCxDQW5CRDs7QUFxQkF3Z0IsWUFBWXRtQixTQUFaLENBQXNCNm1CLFdBQXRCLEdBQW9DLFVBQVNDLFdBQVQsRUFBc0I7QUFDdEQsUUFBSTFtQixDQUFKO0FBQUEsUUFDSUssSUFESjtBQUFBLFFBRUlzbUIsUUFBUSxFQUZaO0FBQUEsUUFHSS9rQixPQUFPLElBSFg7O0FBS0EsU0FBSzVCLElBQUksQ0FBVCxFQUFZQSxJQUFJMG1CLFlBQVl4bUIsTUFBNUIsRUFBb0NGLEdBQXBDLEVBQXlDO0FBQ3JDSyxlQUFPdUIsS0FBS3FELFdBQUwsQ0FBaUJ5aEIsWUFBWTFtQixDQUFaLENBQWpCLENBQVA7QUFDQSxZQUFJLENBQUNLLElBQUwsRUFBVztBQUNQLG1CQUFPLElBQVA7QUFDSDtBQUNEc21CLGNBQU0za0IsSUFBTixDQUFXM0IsSUFBWDtBQUNIO0FBQ0QsV0FBT3NtQixLQUFQO0FBQ0gsQ0FkRDs7QUFnQkFULFlBQVl0bUIsU0FBWixDQUFzQnFGLFdBQXRCLEdBQW9DLFVBQVM3RSxPQUFULEVBQWtCO0FBQ2xELFFBQUlpRixDQUFKO0FBQUEsUUFDSXpELE9BQU8sSUFEWDtBQUFBLFFBRUluQixNQUFNLENBRlY7QUFBQSxRQUdJb2dCLFVBSEo7QUFBQSxRQUlJdGdCLEtBSko7QUFBQSxRQUtJb0IsVUFBVUMsS0FBS2tELGNBTG5CO0FBQUEsUUFNSXpFLElBTko7QUFBQSxRQU9JMEIsWUFBWTtBQUNSeEIsZUFBT1EsT0FBT0MsU0FETjtBQUVSWCxjQUFNLENBQUMsQ0FGQztBQUdSTixlQUFPLENBSEM7QUFJUmtDLGFBQUs7QUFKRyxLQVBoQjs7QUFjQSxTQUFNb0QsSUFBSSxDQUFWLEVBQWFBLElBQUlqRixRQUFRRixNQUF6QixFQUFpQ21GLEdBQWpDLEVBQXNDO0FBQ2xDNUUsZUFBT0wsUUFBUWlGLENBQVIsQ0FBUDtBQUNIO0FBQ0QsU0FBS2hGLE9BQU8sQ0FBWixFQUFlQSxPQUFPdUIsS0FBS2dELFlBQUwsQ0FBa0IxRSxNQUF4QyxFQUFnREcsTUFBaEQsRUFBd0Q7QUFDcERFLGdCQUFRcUIsS0FBS3pCLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCd0IsS0FBS2dELFlBQUwsQ0FBa0J2RSxJQUFsQixDQUE1QixDQUFSO0FBQ0EsWUFBSUUsUUFBUXdCLFVBQVV4QixLQUF0QixFQUE2QjtBQUN6QndCLHNCQUFVMUIsSUFBVixHQUFpQkEsSUFBakI7QUFDQTBCLHNCQUFVeEIsS0FBVixHQUFrQkEsS0FBbEI7QUFDSDtBQUNKO0FBQ0QsUUFBSXdCLFVBQVV4QixLQUFWLEdBQWtCb0IsT0FBdEIsRUFBK0I7QUFDM0IsZUFBT0ksU0FBUDtBQUNIO0FBQ0osQ0E1QkQ7O0FBOEJBbWtCLFlBQVl0bUIsU0FBWixDQUFzQm1HLGNBQXRCLEdBQXVDLFVBQVMvQyxRQUFULEVBQW1CWixNQUFuQixFQUEyQjRELFlBQTNCLEVBQXlDO0FBQzVFLFFBQUloRyxDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDtBQUFBLFFBRUlzUyxNQUFNLENBRlY7QUFBQSxRQUdJNE0sZ0JBQWdCOWQsU0FBUzlDLE1BSDdCO0FBQUEsUUFJSXdtQixjQUFjLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixDQUFELEVBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FBbEIsQ0FKbEI7QUFBQSxRQUtJQyxLQUxKOztBQU9BLFdBQU96UyxNQUFNNE0sYUFBYixFQUE0QjtBQUN4QixhQUFLOWdCLElBQUksQ0FBVCxFQUFZQSxJQUFJLENBQWhCLEVBQW1CQSxHQUFuQixFQUF3QjtBQUNwQjBtQix3QkFBWSxDQUFaLEVBQWUxbUIsQ0FBZixJQUFvQmdELFNBQVNrUixHQUFULElBQWdCLEtBQUtxTSxhQUFMLENBQW1CLENBQW5CLENBQXBDO0FBQ0FtRyx3QkFBWSxDQUFaLEVBQWUxbUIsQ0FBZixJQUFvQmdELFNBQVNrUixNQUFNLENBQWYsSUFBb0IsS0FBS3FNLGFBQUwsQ0FBbUIsQ0FBbkIsQ0FBeEM7QUFDQXJNLG1CQUFPLENBQVA7QUFDSDtBQUNEeVMsZ0JBQVEva0IsS0FBSzZrQixXQUFMLENBQWlCQyxXQUFqQixDQUFSO0FBQ0EsWUFBSSxDQUFDQyxLQUFMLEVBQVk7QUFDUixtQkFBTyxJQUFQO0FBQ0g7QUFDRCxhQUFLM21CLElBQUksQ0FBVCxFQUFZQSxJQUFJMm1CLE1BQU16bUIsTUFBdEIsRUFBOEJGLEdBQTlCLEVBQW1DO0FBQy9Cb0MsbUJBQU9KLElBQVAsQ0FBWTJrQixNQUFNM21CLENBQU4sRUFBU0ssSUFBVCxHQUFnQixFQUE1QjtBQUNBMkYseUJBQWFoRSxJQUFiLENBQWtCMmtCLE1BQU0zbUIsQ0FBTixDQUFsQjtBQUNIO0FBQ0o7QUFDRCxXQUFPMm1CLEtBQVA7QUFDSCxDQXhCRDs7QUEwQkFULFlBQVl0bUIsU0FBWixDQUFzQm1oQixvQkFBdEIsR0FBNkMsVUFBUy9kLFFBQVQsRUFBbUI7QUFDNUQsV0FBUUEsU0FBUzlDLE1BQVQsR0FBa0IsRUFBbEIsS0FBeUIsQ0FBakM7QUFDSCxDQUZEOztBQUlBZ21CLFlBQVl0bUIsU0FBWixDQUFzQnlDLE9BQXRCLEdBQWdDLFlBQVc7QUFDdkMsUUFBSW1ELFNBQUo7QUFBQSxRQUNJRSxPQURKO0FBQUEsUUFFSTlELE9BQU8sSUFGWDtBQUFBLFFBR0l2QixJQUhKO0FBQUEsUUFJSStCLFNBQVMsRUFKYjtBQUFBLFFBS0k0RCxlQUFlLEVBTG5CO0FBQUEsUUFNSWhELFFBTko7O0FBUUF3QyxnQkFBWTVELEtBQUswRCxVQUFMLEVBQVo7QUFDQSxRQUFJLENBQUNFLFNBQUwsRUFBZ0I7QUFDWixlQUFPLElBQVA7QUFDSDtBQUNEUSxpQkFBYWhFLElBQWIsQ0FBa0J3RCxTQUFsQjs7QUFFQUUsY0FBVTlELEtBQUtnRSxRQUFMLEVBQVY7QUFDQSxRQUFJLENBQUNGLE9BQUwsRUFBYztBQUNWLGVBQU8sSUFBUDtBQUNIOztBQUVEMUMsZUFBV3BCLEtBQUttQixhQUFMLENBQW1CeUMsVUFBVXZELEdBQTdCLEVBQWtDeUQsUUFBUTNGLEtBQTFDLEVBQWlELEtBQWpELENBQVg7QUFDQSxRQUFJLENBQUM2QixLQUFLbWYsb0JBQUwsQ0FBMEIvZCxRQUExQixDQUFMLEVBQTBDO0FBQ3RDLGVBQU8sSUFBUDtBQUNIO0FBQ0QzQyxXQUFPdUIsS0FBS21FLGNBQUwsQ0FBb0IvQyxRQUFwQixFQUE4QlosTUFBOUIsRUFBc0M0RCxZQUF0QyxDQUFQO0FBQ0EsUUFBSSxDQUFDM0YsSUFBTCxFQUFXO0FBQ1AsZUFBTyxJQUFQO0FBQ0g7QUFDRCxRQUFJK0IsT0FBT2xDLE1BQVAsR0FBZ0IsQ0FBaEIsS0FBc0IsQ0FBdEIsSUFDSWtDLE9BQU9sQyxNQUFQLEdBQWdCLENBRHhCLEVBQzJCO0FBQ3ZCLGVBQU8sSUFBUDtBQUNIOztBQUVEOEYsaUJBQWFoRSxJQUFiLENBQWtCMEQsT0FBbEI7QUFDQSxXQUFPO0FBQ0hyRixjQUFNK0IsT0FBT3FFLElBQVAsQ0FBWSxFQUFaLENBREg7QUFFSDFHLGVBQU95RixVQUFVekYsS0FGZDtBQUdIa0MsYUFBS3lELFFBQVF6RCxHQUhWO0FBSUh1RCxtQkFBV0EsU0FKUjtBQUtIUSxzQkFBY0E7QUFMWCxLQUFQO0FBT0gsQ0F6Q0Q7O0FBMkNBa2dCLFlBQVl0aUIsV0FBWixHQUEwQjtBQUN0QnVpQiw0QkFBd0I7QUFDcEIsZ0JBQVEsU0FEWTtBQUVwQixtQkFBVyxLQUZTO0FBR3BCLHVCQUFlLCtDQUNmO0FBSm9CO0FBREYsQ0FBMUI7O0FBU0EseURBQWVELFdBQWYsRTs7Ozs7Ozs7QUNwVUE7O0FBRUEsU0FBU1UsVUFBVCxDQUFvQjlpQixJQUFwQixFQUEwQnBFLFdBQTFCLEVBQXVDO0FBQ25DbUUsSUFBQSw0REFBQUEsQ0FBVUcsSUFBVixDQUFlLElBQWYsRUFBcUJGLElBQXJCLEVBQTJCcEUsV0FBM0I7QUFDSDs7QUFFRCxJQUFJMkUsYUFBYTtBQUNiUSxvQkFBZ0IsRUFBQy9CLE9BQU8sQ0FDcEIsQ0FBRSxFQUFGLEVBQU0sRUFBTixFQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCLEVBQTlCLEVBQWtDLEVBQWxDLEVBQXNDLEVBQXRDLENBRG9CLEVBRXBCLENBQUMsQ0FBRCxFQUFJLEVBQUosRUFBUSxFQUFSLEVBQVksRUFBWixFQUFnQixFQUFoQixFQUFvQixFQUFwQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxFQUFoQyxFQUFvQyxFQUFwQyxDQUZvQixDQUFSLEVBREg7QUFJYjJCLGtCQUFjLEVBQUUzQixPQUFPLENBQUMsSUFBSSxDQUFKLEdBQVEsQ0FBVCxFQUFZLElBQUksQ0FBSixHQUFRLENBQXBCLEVBQXVCLElBQUksQ0FBSixHQUFRLENBQS9CLEVBQWtDLElBQUksQ0FBSixHQUFRLENBQTFDLEVBQTZDLElBQUksQ0FBSixHQUFRLENBQXJELEVBQXdELElBQUksQ0FBSixHQUFRLENBQWhFLENBQVQsRUFKRDtBQUtiRixZQUFRLEVBQUNFLE9BQU8sT0FBUixFQUFpQlMsV0FBVyxLQUE1QjtBQUxLLENBQWpCOztBQVFBcWpCLFdBQVdobkIsU0FBWCxHQUF1QnlELE9BQU8wQixNQUFQLENBQWMsNERBQUFsQixDQUFVakUsU0FBeEIsRUFBbUN5RSxVQUFuQyxDQUF2QjtBQUNBdWlCLFdBQVdobkIsU0FBWCxDQUFxQm9GLFdBQXJCLEdBQW1DNGhCLFVBQW5DOztBQUVBQSxXQUFXaG5CLFNBQVgsQ0FBcUJtRyxjQUFyQixHQUFzQyxVQUFTMUYsSUFBVCxFQUFlK0IsTUFBZixFQUF1QjRELFlBQXZCLEVBQXFDO0FBQ3ZFLFFBQUloRyxDQUFKO0FBQUEsUUFDSTRCLE9BQU8sSUFEWDtBQUFBLFFBRUlrRSxnQkFBZ0IsR0FGcEI7O0FBSUEsU0FBTTlGLElBQUksQ0FBVixFQUFhQSxJQUFJLENBQWpCLEVBQW9CQSxHQUFwQixFQUF5QjtBQUNyQkssZUFBT3VCLEtBQUtxRCxXQUFMLENBQWlCNUUsS0FBSzRCLEdBQXRCLENBQVA7QUFDQSxZQUFJLENBQUM1QixJQUFMLEVBQVc7QUFDUCxtQkFBTyxJQUFQO0FBQ0g7QUFDRCxZQUFJQSxLQUFLQSxJQUFMLElBQWF1QixLQUFLMkMsWUFBdEIsRUFBb0M7QUFDaENsRSxpQkFBS0EsSUFBTCxHQUFZQSxLQUFLQSxJQUFMLEdBQVl1QixLQUFLMkMsWUFBN0I7QUFDQXVCLDZCQUFpQixLQUFNLElBQUk5RixDQUEzQjtBQUNIO0FBQ0RvQyxlQUFPSixJQUFQLENBQVkzQixLQUFLQSxJQUFqQjtBQUNBMkYscUJBQWFoRSxJQUFiLENBQWtCM0IsSUFBbEI7QUFDSDtBQUNELFFBQUksQ0FBQ3VCLEtBQUtpbEIsZ0JBQUwsQ0FBc0IvZ0IsYUFBdEIsRUFBcUMxRCxNQUFyQyxDQUFMLEVBQW1EO0FBQy9DLGVBQU8sSUFBUDtBQUNIOztBQUVELFdBQU8vQixJQUFQO0FBQ0gsQ0F0QkQ7O0FBd0JBdW1CLFdBQVdobkIsU0FBWCxDQUFxQmluQixnQkFBckIsR0FBd0MsVUFBUy9nQixhQUFULEVBQXdCMUQsTUFBeEIsRUFBZ0M7QUFDcEUsUUFBSXBDLENBQUosRUFDSThtQixRQURKOztBQUdBLFNBQUtBLFdBQVcsQ0FBaEIsRUFBbUJBLFdBQVcsS0FBS2ppQixjQUFMLENBQW9CM0UsTUFBbEQsRUFBMEQ0bUIsVUFBMUQsRUFBcUU7QUFDakUsYUFBTTltQixJQUFJLENBQVYsRUFBYUEsSUFBSSxLQUFLNkUsY0FBTCxDQUFvQmlpQixRQUFwQixFQUE4QjVtQixNQUEvQyxFQUF1REYsR0FBdkQsRUFBNEQ7QUFDeEQsZ0JBQUk4RixrQkFBa0IsS0FBS2pCLGNBQUwsQ0FBb0JpaUIsUUFBcEIsRUFBOEI5bUIsQ0FBOUIsQ0FBdEIsRUFBd0Q7QUFDcERvQyx1QkFBTzhELE9BQVAsQ0FBZTRnQixRQUFmO0FBQ0Exa0IsdUJBQU9KLElBQVAsQ0FBWWhDLENBQVo7QUFDQSx1QkFBTyxJQUFQO0FBQ0g7QUFDSjtBQUNKO0FBQ0QsV0FBTyxLQUFQO0FBQ0gsQ0FkRDs7QUFnQkE0bUIsV0FBV2huQixTQUFYLENBQXFCbW5CLGNBQXJCLEdBQXNDLFVBQVMza0IsTUFBVCxFQUFpQjtBQUNuRCxRQUFJNGtCLE9BQU8sQ0FBQzVrQixPQUFPLENBQVAsQ0FBRCxDQUFYO0FBQUEsUUFDSTZrQixZQUFZN2tCLE9BQU9BLE9BQU9sQyxNQUFQLEdBQWdCLENBQXZCLENBRGhCOztBQUdBLFFBQUkrbUIsYUFBYSxDQUFqQixFQUFvQjtBQUNoQkQsZUFBT0EsS0FBS3pPLE1BQUwsQ0FBWW5XLE9BQU8yaUIsS0FBUCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBWixFQUNGeE0sTUFERSxDQUNLLENBQUMwTyxTQUFELEVBQVksQ0FBWixFQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FETCxFQUVGMU8sTUFGRSxDQUVLblcsT0FBTzJpQixLQUFQLENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUZMLENBQVA7QUFHSCxLQUpELE1BSU8sSUFBSWtDLGNBQWMsQ0FBbEIsRUFBcUI7QUFDeEJELGVBQU9BLEtBQUt6TyxNQUFMLENBQVluVyxPQUFPMmlCLEtBQVAsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLENBQVosRUFDRnhNLE1BREUsQ0FDSyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBREwsRUFFRkEsTUFGRSxDQUVLblcsT0FBTzJpQixLQUFQLENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUZMLENBQVA7QUFHSCxLQUpNLE1BSUEsSUFBSWtDLGNBQWMsQ0FBbEIsRUFBcUI7QUFDeEJELGVBQU9BLEtBQUt6TyxNQUFMLENBQVluVyxPQUFPMmlCLEtBQVAsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLENBQVosRUFDRnhNLE1BREUsQ0FDSyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCblcsT0FBTyxDQUFQLENBQWhCLENBREwsQ0FBUDtBQUVILEtBSE0sTUFHQTtBQUNINGtCLGVBQU9BLEtBQUt6TyxNQUFMLENBQVluVyxPQUFPMmlCLEtBQVAsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLENBQVosRUFDRnhNLE1BREUsQ0FDSyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYTBPLFNBQWIsQ0FETCxDQUFQO0FBRUg7O0FBRURELFNBQUtobEIsSUFBTCxDQUFVSSxPQUFPQSxPQUFPbEMsTUFBUCxHQUFnQixDQUF2QixDQUFWO0FBQ0EsV0FBTzhtQixJQUFQO0FBQ0gsQ0F0QkQ7O0FBd0JBSixXQUFXaG5CLFNBQVgsQ0FBcUJ3RyxTQUFyQixHQUFpQyxVQUFTaEUsTUFBVCxFQUFpQjtBQUM5QyxXQUFPLDREQUFBeUIsQ0FBVWpFLFNBQVYsQ0FBb0J3RyxTQUFwQixDQUE4QnBDLElBQTlCLENBQW1DLElBQW5DLEVBQXlDLEtBQUsraUIsY0FBTCxDQUFvQjNrQixNQUFwQixDQUF6QyxDQUFQO0FBQ0gsQ0FGRDs7QUFJQXdrQixXQUFXaG5CLFNBQVgsQ0FBcUJnRyxRQUFyQixHQUFnQyxVQUFTeEUsTUFBVCxFQUFpQlMsT0FBakIsRUFBMEI7QUFDdERBLGNBQVUsSUFBVjtBQUNBLFdBQU8sNERBQUFnQyxDQUFVakUsU0FBVixDQUFvQmdHLFFBQXBCLENBQTZCNUIsSUFBN0IsQ0FBa0MsSUFBbEMsRUFBd0M1QyxNQUF4QyxFQUFnRFMsT0FBaEQsQ0FBUDtBQUNILENBSEQ7O0FBS0Era0IsV0FBV2huQixTQUFYLENBQXFCNkYseUJBQXJCLEdBQWlELFVBQVNDLE9BQVQsRUFBa0I7QUFDL0QsUUFBSTlELE9BQU8sSUFBWDtBQUFBLFFBQ0krRCxxQkFESjs7QUFHQUEsNEJBQXdCRCxRQUFRekQsR0FBUixHQUFlLENBQUN5RCxRQUFRekQsR0FBUixHQUFjeUQsUUFBUTNGLEtBQXZCLElBQWdDLENBQXZFO0FBQ0EsUUFBSTRGLHdCQUF3Qi9ELEtBQUtqQyxJQUFMLENBQVVPLE1BQXRDLEVBQThDO0FBQzFDLFlBQUkwQixLQUFLaUIsV0FBTCxDQUFpQjZDLFFBQVF6RCxHQUF6QixFQUE4QjBELHFCQUE5QixFQUFxRCxDQUFyRCxDQUFKLEVBQTZEO0FBQ3pELG1CQUFPRCxPQUFQO0FBQ0g7QUFDSjtBQUNKLENBVkQ7O0FBWUEseURBQWVraEIsVUFBZixFOzs7Ozs7OztBQ3RHQTs7QUFFQSxTQUFTTSxTQUFULENBQW1CcGpCLElBQW5CLEVBQXlCcEUsV0FBekIsRUFBc0M7QUFDbENtRSxJQUFBLDREQUFBQSxDQUFVRyxJQUFWLENBQWUsSUFBZixFQUFxQkYsSUFBckIsRUFBMkJwRSxXQUEzQjtBQUNIOztBQUVELElBQUkyRSxhQUFhO0FBQ2J6QixZQUFRLEVBQUNFLE9BQU8sT0FBUixFQUFpQlMsV0FBVyxLQUE1QjtBQURLLENBQWpCOztBQUlBMmpCLFVBQVV0bkIsU0FBVixHQUFzQnlELE9BQU8wQixNQUFQLENBQWMsNERBQUFsQixDQUFVakUsU0FBeEIsRUFBbUN5RSxVQUFuQyxDQUF0QjtBQUNBNmlCLFVBQVV0bkIsU0FBVixDQUFvQm9GLFdBQXBCLEdBQWtDa2lCLFNBQWxDOztBQUVBQSxVQUFVdG5CLFNBQVYsQ0FBb0J5QyxPQUFwQixHQUE4QixZQUFXO0FBQ3JDLFFBQUlELFNBQVMsNERBQUF5QixDQUFVakUsU0FBVixDQUFvQnlDLE9BQXBCLENBQTRCMkIsSUFBNUIsQ0FBaUMsSUFBakMsQ0FBYjs7QUFFQSxRQUFJNUIsVUFBVUEsT0FBTy9CLElBQWpCLElBQXlCK0IsT0FBTy9CLElBQVAsQ0FBWUgsTUFBWixLQUF1QixFQUFoRCxJQUFzRGtDLE9BQU8vQixJQUFQLENBQVk4bUIsTUFBWixDQUFtQixDQUFuQixNQUEwQixHQUFwRixFQUF5RjtBQUNyRi9rQixlQUFPL0IsSUFBUCxHQUFjK0IsT0FBTy9CLElBQVAsQ0FBWSttQixTQUFaLENBQXNCLENBQXRCLENBQWQ7QUFDQSxlQUFPaGxCLE1BQVA7QUFDSDtBQUNELFdBQU8sSUFBUDtBQUNILENBUkQ7O0FBVUEseURBQWU4a0IsU0FBZixFOzs7Ozs7QUN2QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7O0FDWEE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDMUJBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsRUFBRTtBQUNiLFdBQVcsTUFBTTtBQUNqQixhQUFhLEVBQUU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsV0FBVyxRQUFRO0FBQ25CLGFBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2hEQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsRUFBRTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMzQkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7O0FDN0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsT0FBTztBQUNwQjtBQUNBOztBQUVBOzs7Ozs7O0FDZkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DOztBQUVwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM5Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzNEQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsU0FBUztBQUNwQixXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzdGQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7Ozs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsU0FBUztBQUNwQixhQUFhLE1BQU07QUFDbkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDYkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFlBQVk7QUFDdkIsYUFBYSxZQUFZO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2ZBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7QUNsQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsV0FBVyxNQUFNO0FBQ2pCLGFBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNuQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE1BQU07QUFDakIsV0FBVyxPQUFPLFdBQVc7QUFDN0IsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7O0FBRXhCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDdkNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNMQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBOzs7Ozs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN4QkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxFQUFFO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNaQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDaEJBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLEVBQUU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM3QkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3RCQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixXQUFXLEVBQUU7QUFDYixXQUFXLEVBQUU7QUFDYixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZEE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDWkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNsQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNsQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2ZBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDekJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNwQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2ZBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25CQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUM7O0FBRUQ7Ozs7Ozs7O0FDckJBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsU0FBUztBQUNwQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZEE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixXQUFXLE9BQU87QUFDbEIsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ25DQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsU0FBUztBQUNwQixhQUFhLFNBQVM7QUFDdEI7QUFDQTs7QUFFQTs7Ozs7OztBQ2JBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2JBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQSx3Q0FBd0MsU0FBUztBQUNqRDtBQUNBO0FBQ0EsV0FBVyxTQUFTLEdBQUcsU0FBUztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN6QkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2hDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsaUJBQWlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2pCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsU0FBUztBQUN0QixVQUFVO0FBQ1Y7QUFDQSxhQUFhLFNBQVM7QUFDdEIsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDIiwiZmlsZSI6InF1YWdnYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoZmFjdG9yeS50b1N0cmluZygpKS5kZWZhdWx0O1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiUXVhZ2dhXCJdID0gZmFjdG9yeShmYWN0b3J5LnRvU3RyaW5nKCkpLmRlZmF1bHQ7XG5cdGVsc2Vcblx0XHRyb290W1wiUXVhZ2dhXCJdID0gZmFjdG9yeShmYWN0b3J5LnRvU3RyaW5nKCkpLmRlZmF1bHQ7XG59KSh0aGlzLCBmdW5jdGlvbihfX2ZhY3RvcnlTb3VyY2VfXykge1xucmV0dXJuIFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL215TW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEyMyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDM0YzZmMzcwMWE1ZmNiOWQyNWYiLCJpbXBvcnQgQXJyYXlIZWxwZXIgZnJvbSAnLi4vY29tbW9uL2FycmF5X2hlbHBlcic7XG5cbmZ1bmN0aW9uIEJhcmNvZGVSZWFkZXIoY29uZmlnLCBzdXBwbGVtZW50cykge1xuICAgIHRoaXMuX3JvdyA9IFtdO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIHRoaXMuc3VwcGxlbWVudHMgPSBzdXBwbGVtZW50cztcbiAgICByZXR1cm4gdGhpcztcbn1cblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX25leHRVbnNldCA9IGZ1bmN0aW9uKGxpbmUsIHN0YXJ0KSB7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgbGluZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIWxpbmVbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lLmxlbmd0aDtcbn07XG5cbkJhcmNvZGVSZWFkZXIucHJvdG90eXBlLl9tYXRjaFBhdHRlcm4gPSBmdW5jdGlvbihjb3VudGVyLCBjb2RlLCBtYXhTaW5nbGVFcnJvcikge1xuICAgIHZhciBpLFxuICAgICAgICBlcnJvciA9IDAsXG4gICAgICAgIHNpbmdsZUVycm9yID0gMCxcbiAgICAgICAgc3VtID0gMCxcbiAgICAgICAgbW9kdWxvID0gMCxcbiAgICAgICAgYmFyV2lkdGgsXG4gICAgICAgIGNvdW50LFxuICAgICAgICBzY2FsZWQ7XG5cbiAgICBtYXhTaW5nbGVFcnJvciA9IG1heFNpbmdsZUVycm9yIHx8IHRoaXMuU0lOR0xFX0NPREVfRVJST1IgfHwgMTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBjb3VudGVyW2ldO1xuICAgICAgICBtb2R1bG8gKz0gY29kZVtpXTtcbiAgICB9XG4gICAgaWYgKHN1bSA8IG1vZHVsbykge1xuICAgICAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB9XG4gICAgYmFyV2lkdGggPSBzdW0gLyBtb2R1bG87XG4gICAgbWF4U2luZ2xlRXJyb3IgKj0gYmFyV2lkdGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb3VudCA9IGNvdW50ZXJbaV07XG4gICAgICAgIHNjYWxlZCA9IGNvZGVbaV0gKiBiYXJXaWR0aDtcbiAgICAgICAgc2luZ2xlRXJyb3IgPSBNYXRoLmFicyhjb3VudCAtIHNjYWxlZCkgLyBzY2FsZWQ7XG4gICAgICAgIGlmIChzaW5nbGVFcnJvciA+IG1heFNpbmdsZUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgfVxuICAgICAgICBlcnJvciArPSBzaW5nbGVFcnJvcjtcbiAgICB9XG4gICAgcmV0dXJuIGVycm9yIC8gbW9kdWxvO1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX25leHRTZXQgPSBmdW5jdGlvbihsaW5lLCBvZmZzZXQpIHtcbiAgICB2YXIgaTtcblxuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICAgIGZvciAoaSA9IG9mZnNldDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGxpbmVbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lLmxlbmd0aDtcbn07XG5cbkJhcmNvZGVSZWFkZXIucHJvdG90eXBlLl9jb3JyZWN0QmFycyA9IGZ1bmN0aW9uKGNvdW50ZXIsIGNvcnJlY3Rpb24sIGluZGljZXMpIHtcbiAgICB2YXIgbGVuZ3RoID0gaW5kaWNlcy5sZW5ndGgsXG4gICAgICAgIHRtcCA9IDA7XG4gICAgd2hpbGUobGVuZ3RoLS0pIHtcbiAgICAgICAgdG1wID0gY291bnRlcltpbmRpY2VzW2xlbmd0aF1dICogKDEgLSAoKDEgLSBjb3JyZWN0aW9uKSAvIDIpKTtcbiAgICAgICAgaWYgKHRtcCA+IDEpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbaW5kaWNlc1tsZW5ndGhdXSA9IHRtcDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX21hdGNoVHJhY2UgPSBmdW5jdGlvbihjbXBDb3VudGVyLCBlcHNpbG9uKSB7XG4gICAgdmFyIGNvdW50ZXIgPSBbXSxcbiAgICAgICAgaSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KSxcbiAgICAgICAgaXNXaGl0ZSA9ICFzZWxmLl9yb3dbb2Zmc2V0XSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjtcblxuICAgIGlmIChjbXBDb3VudGVyKSB7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY21wQ291bnRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY291bnRlci5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIGNtcENvdW50ZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5zdGFydCA9IGkgLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZW5kID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb3VudGVyID0gY291bnRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZXN0TWF0Y2g7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY291bnRlci5wdXNoKDApO1xuICAgICAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIucHVzaCgwKTtcbiAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBjbXBDb3VudGVyIHdhcyBub3QgZ2l2ZW5cbiAgICBiZXN0TWF0Y2guc3RhcnQgPSBvZmZzZXQ7XG4gICAgYmVzdE1hdGNoLmVuZCA9IHNlbGYuX3Jvdy5sZW5ndGggLSAxO1xuICAgIGJlc3RNYXRjaC5jb3VudGVyID0gY291bnRlcjtcbiAgICByZXR1cm4gYmVzdE1hdGNoO1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuZGVjb2RlUGF0dGVybiA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHJlc3VsdDtcblxuICAgIHNlbGYuX3JvdyA9IHBhdHRlcm47XG4gICAgcmVzdWx0ID0gc2VsZi5fZGVjb2RlKCk7XG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICBzZWxmLl9yb3cucmV2ZXJzZSgpO1xuICAgICAgICByZXN1bHQgPSBzZWxmLl9kZWNvZGUoKTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0LmRpcmVjdGlvbiA9IEJhcmNvZGVSZWFkZXIuRElSRUNUSU9OLlJFVkVSU0U7XG4gICAgICAgICAgICByZXN1bHQuc3RhcnQgPSBzZWxmLl9yb3cubGVuZ3RoIC0gcmVzdWx0LnN0YXJ0O1xuICAgICAgICAgICAgcmVzdWx0LmVuZCA9IHNlbGYuX3Jvdy5sZW5ndGggLSByZXN1bHQuZW5kO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LmRpcmVjdGlvbiA9IEJhcmNvZGVSZWFkZXIuRElSRUNUSU9OLkZPUldBUkQ7XG4gICAgfVxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgcmVzdWx0LmZvcm1hdCA9IHNlbGYuRk9STUFUO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX21hdGNoUmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgZW5kLCB2YWx1ZSkge1xuICAgIHZhciBpO1xuXG4gICAgc3RhcnQgPSBzdGFydCA8IDAgPyAwIDogc3RhcnQ7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5fcm93W2ldICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuQmFyY29kZVJlYWRlci5wcm90b3R5cGUuX2ZpbGxDb3VudGVycyA9IGZ1bmN0aW9uKG9mZnNldCwgZW5kLCBpc1doaXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgaSxcbiAgICAgICAgY291bnRlcnMgPSBbXTtcblxuICAgIGlzV2hpdGUgPSAodHlwZW9mIGlzV2hpdGUgIT09ICd1bmRlZmluZWQnKSA/IGlzV2hpdGUgOiB0cnVlO1xuICAgIG9mZnNldCA9ICh0eXBlb2Ygb2Zmc2V0ICE9PSAndW5kZWZpbmVkJykgPyBvZmZzZXQgOiBzZWxmLl9uZXh0VW5zZXQoc2VsZi5fcm93KTtcbiAgICBlbmQgPSBlbmQgfHwgc2VsZi5fcm93Lmxlbmd0aDtcblxuICAgIGNvdW50ZXJzW2NvdW50ZXJQb3NdID0gMDtcbiAgICBmb3IgKGkgPSBvZmZzZXQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcnNbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIGNvdW50ZXJzW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnRlcnM7XG59O1xuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fdG9Db3VudGVycyA9IGZ1bmN0aW9uKHN0YXJ0LCBjb3VudGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBudW1Db3VudGVycyA9IGNvdW50ZXIubGVuZ3RoLFxuICAgICAgICBlbmQgPSBzZWxmLl9yb3cubGVuZ3RoLFxuICAgICAgICBpc1doaXRlID0gIXNlbGYuX3Jvd1tzdGFydF0sXG4gICAgICAgIGksXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwO1xuXG4gICAgQXJyYXlIZWxwZXIuaW5pdChjb3VudGVyLCAwKTtcblxuICAgIGZvciAoIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gbnVtQ291bnRlcnMpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvdW50ZXI7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIFwiRk9STUFUXCIsIHtcbiAgICB2YWx1ZTogJ3Vua25vd24nLFxuICAgIHdyaXRlYWJsZTogZmFsc2Vcbn0pO1xuXG5CYXJjb2RlUmVhZGVyLkRJUkVDVElPTiA9IHtcbiAgICBGT1JXQVJEOiAxLFxuICAgIFJFVkVSU0U6IC0xXG59O1xuXG5CYXJjb2RlUmVhZGVyLkV4Y2VwdGlvbiA9IHtcbiAgICBTdGFydE5vdEZvdW5kRXhjZXB0aW9uOiBcIlN0YXJ0LUluZm8gd2FzIG5vdCBmb3VuZCFcIixcbiAgICBDb2RlTm90Rm91bmRFeGNlcHRpb246IFwiQ29kZSBjb3VsZCBub3QgYmUgZm91bmQhXCIsXG4gICAgUGF0dGVybk5vdEZvdW5kRXhjZXB0aW9uOiBcIlBhdHRlcm4gY291bGQgbm90IGJlIGZvdW5kIVwiXG59O1xuXG5CYXJjb2RlUmVhZGVyLkNPTkZJR19LRVlTID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IEJhcmNvZGVSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2JhcmNvZGVfcmVhZGVyLmpzIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzT2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBCYXJjb2RlUmVhZGVyIGZyb20gJy4vYmFyY29kZV9yZWFkZXInO1xuaW1wb3J0IHttZXJnZX0gZnJvbSAnbG9kYXNoJztcblxuZnVuY3Rpb24gRUFOUmVhZGVyKG9wdHMsIHN1cHBsZW1lbnRzKSB7XG4gICAgb3B0cyA9IG1lcmdlKGdldERlZmF1bENvbmZpZygpLCBvcHRzKTtcbiAgICBCYXJjb2RlUmVhZGVyLmNhbGwodGhpcywgb3B0cywgc3VwcGxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBnZXREZWZhdWxDb25maWcoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoRUFOUmVhZGVyLkNPTkZJR19LRVlTKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBjb25maWdba2V5XSA9IEVBTlJlYWRlci5DT05GSUdfS0VZU1trZXldLmRlZmF1bHQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbmZpZztcbn1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgQ09ERV9MX1NUQVJUOiB7dmFsdWU6IDB9LFxuICAgIENPREVfR19TVEFSVDoge3ZhbHVlOiAxMH0sXG4gICAgU1RBUlRfUEFUVEVSTjoge3ZhbHVlOiBbMSwgMSwgMV19LFxuICAgIFNUT1BfUEFUVEVSTjoge3ZhbHVlOiBbMSwgMSwgMV19LFxuICAgIE1JRERMRV9QQVRURVJOOiB7dmFsdWU6IFsxLCAxLCAxLCAxLCAxXX0sXG4gICAgRVhURU5TSU9OX1NUQVJUX1BBVFRFUk46IHt2YWx1ZTogWzEsIDEsIDJdfSxcbiAgICBDT0RFX1BBVFRFUk46IHt2YWx1ZTogW1xuICAgICAgICBbMywgMiwgMSwgMV0sXG4gICAgICAgIFsyLCAyLCAyLCAxXSxcbiAgICAgICAgWzIsIDEsIDIsIDJdLFxuICAgICAgICBbMSwgNCwgMSwgMV0sXG4gICAgICAgIFsxLCAxLCAzLCAyXSxcbiAgICAgICAgWzEsIDIsIDMsIDFdLFxuICAgICAgICBbMSwgMSwgMSwgNF0sXG4gICAgICAgIFsxLCAzLCAxLCAyXSxcbiAgICAgICAgWzEsIDIsIDEsIDNdLFxuICAgICAgICBbMywgMSwgMSwgMl0sXG4gICAgICAgIFsxLCAxLCAyLCAzXSxcbiAgICAgICAgWzEsIDIsIDIsIDJdLFxuICAgICAgICBbMiwgMiwgMSwgMl0sXG4gICAgICAgIFsxLCAxLCA0LCAxXSxcbiAgICAgICAgWzIsIDMsIDEsIDFdLFxuICAgICAgICBbMSwgMywgMiwgMV0sXG4gICAgICAgIFs0LCAxLCAxLCAxXSxcbiAgICAgICAgWzIsIDEsIDMsIDFdLFxuICAgICAgICBbMywgMSwgMiwgMV0sXG4gICAgICAgIFsyLCAxLCAxLCAzXVxuICAgIF19LFxuICAgIENPREVfRlJFUVVFTkNZOiB7dmFsdWU6IFswLCAxMSwgMTMsIDE0LCAxOSwgMjUsIDI4LCAyMSwgMjIsIDI2XX0sXG4gICAgU0lOR0xFX0NPREVfRVJST1I6IHt2YWx1ZTogMC43MH0sXG4gICAgQVZHX0NPREVfRVJST1I6IHt2YWx1ZTogMC40OH0sXG4gICAgRk9STUFUOiB7dmFsdWU6IFwiZWFuXzEzXCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5FQU5SZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXJjb2RlUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5FQU5SZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRUFOUmVhZGVyO1xuXG5FQU5SZWFkZXIucHJvdG90eXBlLl9kZWNvZGVDb2RlID0gZnVuY3Rpb24oc3RhcnQsIGNvZGVyYW5nZSkge1xuICAgIHZhciBjb3VudGVyID0gWzAsIDAsIDAsIDBdLFxuICAgICAgICBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgb2Zmc2V0ID0gc3RhcnQsXG4gICAgICAgIGlzV2hpdGUgPSAhc2VsZi5fcm93W29mZnNldF0sXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBiZXN0TWF0Y2ggPSB7XG4gICAgICAgICAgICBlcnJvcjogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgIGNvZGU6IC0xLFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBzdGFydFxuICAgICAgICB9LFxuICAgICAgICBjb2RlLFxuICAgICAgICBlcnJvcjtcblxuICAgIGlmICghY29kZXJhbmdlKSB7XG4gICAgICAgIGNvZGVyYW5nZSA9IHNlbGYuQ09ERV9QQVRURVJOLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb2RlID0gMDsgY29kZSA8IGNvZGVyYW5nZTsgY29kZSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gc2VsZi5fbWF0Y2hQYXR0ZXJuKGNvdW50ZXIsIHNlbGYuQ09ERV9QQVRURVJOW2NvZGVdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yIDwgYmVzdE1hdGNoLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guY29kZSA9IGNvZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZW5kID0gaTtcbiAgICAgICAgICAgICAgICBpZiAoYmVzdE1hdGNoLmVycm9yID4gc2VsZi5BVkdfQ09ERV9FUlJPUikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5FQU5SZWFkZXIucHJvdG90eXBlLl9maW5kUGF0dGVybiA9IGZ1bmN0aW9uKHBhdHRlcm4sIG9mZnNldCwgaXNXaGl0ZSwgdHJ5SGFyZGVyLCBlcHNpbG9uKSB7XG4gICAgdmFyIGNvdW50ZXIgPSBbXSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGksXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBiZXN0TWF0Y2ggPSB7XG4gICAgICAgICAgICBlcnJvcjogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgIGNvZGU6IC0xLFxuICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICBlbmQ6IDBcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGosXG4gICAgICAgIHN1bTtcblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KTtcbiAgICB9XG5cbiAgICBpZiAoaXNXaGl0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlzV2hpdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodHJ5SGFyZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdHJ5SGFyZGVyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIGVwc2lsb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlcHNpbG9uID0gc2VsZi5BVkdfQ09ERV9FUlJPUjtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY291bnRlcltpXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJQb3MgPT09IGNvdW50ZXIubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBjb3VudGVyW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBwYXR0ZXJuKTtcblxuICAgICAgICAgICAgICAgIGlmIChlcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5zdGFydCA9IGkgLSBzdW07XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVzdE1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHJ5SGFyZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgY291bnRlci5sZW5ndGggLSAyOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbal0gPSBjb3VudGVyW2ogKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMl0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyUG9zLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2ZpbmRTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbGVhZGluZ1doaXRlc3BhY2VTdGFydCxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBzdGFydEluZm87XG5cbiAgICB3aGlsZSAoIXN0YXJ0SW5mbykge1xuICAgICAgICBzdGFydEluZm8gPSBzZWxmLl9maW5kUGF0dGVybihzZWxmLlNUQVJUX1BBVFRFUk4sIG9mZnNldCk7XG4gICAgICAgIGlmICghc3RhcnRJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0ID0gc3RhcnRJbmZvLnN0YXJ0IC0gKHN0YXJ0SW5mby5lbmQgLSBzdGFydEluZm8uc3RhcnQpO1xuICAgICAgICBpZiAobGVhZGluZ1doaXRlc3BhY2VTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fbWF0Y2hSYW5nZShsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0LCBzdGFydEluZm8uc3RhcnQsIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXJ0SW5mbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgPSBzdGFydEluZm8uZW5kO1xuICAgICAgICBzdGFydEluZm8gPSBudWxsO1xuICAgIH1cbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeVRyYWlsaW5nV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKGVuZEluZm8pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZDtcblxuICAgIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA9IGVuZEluZm8uZW5kICsgKGVuZEluZm8uZW5kIC0gZW5kSW5mby5zdGFydCk7XG4gICAgaWYgKHRyYWlsaW5nV2hpdGVzcGFjZUVuZCA8IHNlbGYuX3Jvdy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UoZW5kSW5mby5lbmQsIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmRJbmZvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fZmluZEVuZCA9IGZ1bmN0aW9uKG9mZnNldCwgaXNXaGl0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZW5kSW5mbyA9IHNlbGYuX2ZpbmRQYXR0ZXJuKHNlbGYuU1RPUF9QQVRURVJOLCBvZmZzZXQsIGlzV2hpdGUsIGZhbHNlKTtcblxuICAgIHJldHVybiBlbmRJbmZvICE9PSBudWxsID8gc2VsZi5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlKGVuZEluZm8pIDogbnVsbDtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUZpcnN0RGlnaXQgPSBmdW5jdGlvbihjb2RlRnJlcXVlbmN5KSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCBzZWxmLkNPREVfRlJFUVVFTkNZLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjb2RlRnJlcXVlbmN5ID09PSBzZWxmLkNPREVfRlJFUVVFTkNZW2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2RlY29kZVBheWxvYWQgPSBmdW5jdGlvbihjb2RlLCByZXN1bHQsIGRlY29kZWRDb2Rlcykge1xuICAgIHZhciBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgY29kZUZyZXF1ZW5jeSA9IDB4MCxcbiAgICAgICAgZmlyc3REaWdpdDtcblxuICAgIGZvciAoIGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVDb2RlKGNvZGUuZW5kKTtcbiAgICAgICAgaWYgKCFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29kZS5jb2RlID49IHNlbGYuQ09ERV9HX1NUQVJUKSB7XG4gICAgICAgICAgICBjb2RlLmNvZGUgPSBjb2RlLmNvZGUgLSBzZWxmLkNPREVfR19TVEFSVDtcbiAgICAgICAgICAgIGNvZGVGcmVxdWVuY3kgfD0gMSA8PCAoNSAtIGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29kZUZyZXF1ZW5jeSB8PSAwIDw8ICg1IC0gaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlKTtcbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgfVxuXG4gICAgZmlyc3REaWdpdCA9IHNlbGYuX2NhbGN1bGF0ZUZpcnN0RGlnaXQoY29kZUZyZXF1ZW5jeSk7XG4gICAgaWYgKGZpcnN0RGlnaXQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC51bnNoaWZ0KGZpcnN0RGlnaXQpO1xuXG4gICAgY29kZSA9IHNlbGYuX2ZpbmRQYXR0ZXJuKHNlbGYuTUlERExFX1BBVFRFUk4sIGNvZGUuZW5kLCB0cnVlLCBmYWxzZSk7XG4gICAgaWYgKGNvZGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY29kZS5lbmQsIHNlbGYuQ09ERV9HX1NUQVJUKTtcbiAgICAgICAgaWYgKCFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29kZTtcbn07XG5cbkVBTlJlYWRlci5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFydEluZm8sXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBjb2RlLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgZGVjb2RlZENvZGVzID0gW10sXG4gICAgICAgIHJlc3VsdEluZm8gPSB7fTtcblxuICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRTdGFydCgpO1xuICAgIGlmICghc3RhcnRJbmZvKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb2RlID0ge1xuICAgICAgICBjb2RlOiBzdGFydEluZm8uY29kZSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0SW5mby5zdGFydCxcbiAgICAgICAgZW5kOiBzdGFydEluZm8uZW5kXG4gICAgfTtcbiAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICBjb2RlID0gc2VsZi5fZGVjb2RlUGF5bG9hZChjb2RlLCByZXN1bHQsIGRlY29kZWRDb2Rlcyk7XG4gICAgaWYgKCFjb2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb2RlID0gc2VsZi5fZmluZEVuZChjb2RlLmVuZCwgZmFsc2UpO1xuICAgIGlmICghY29kZSl7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuXG4gICAgLy8gQ2hlY2tzdW1cbiAgICBpZiAoIXNlbGYuX2NoZWNrc3VtKHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3VwcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZXh0ID0gdGhpcy5fZGVjb2RlRXh0ZW5zaW9ucyhjb2RlLmVuZCk7XG4gICAgICAgIGlmICghZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGFzdENvZGUgPSBleHQuZGVjb2RlZENvZGVzW2V4dC5kZWNvZGVkQ29kZXMubGVuZ3RoLTFdLFxuICAgICAgICAgICAgZW5kSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogbGFzdENvZGUuc3RhcnQgKyAoKChsYXN0Q29kZS5lbmQgLSBsYXN0Q29kZS5zdGFydCkgLyAyKSB8IDApLFxuICAgICAgICAgICAgICAgIGVuZDogbGFzdENvZGUuZW5kXG4gICAgICAgICAgICB9O1xuICAgICAgICBpZighc2VsZi5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlKGVuZEluZm8pKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRJbmZvID0ge1xuICAgICAgICAgICAgc3VwcGxlbWVudDogZXh0LFxuICAgICAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIikgKyBleHQuY29kZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIHN0YXJ0OiBzdGFydEluZm8uc3RhcnQsXG4gICAgICAgIGVuZDogY29kZS5lbmQsXG4gICAgICAgIGNvZGVzZXQ6IFwiXCIsXG4gICAgICAgIHN0YXJ0SW5mbzogc3RhcnRJbmZvLFxuICAgICAgICBkZWNvZGVkQ29kZXM6IGRlY29kZWRDb2RlcyxcbiAgICAgICAgLi4ucmVzdWx0SW5mb1xuICAgIH07XG59O1xuXG5FQU5SZWFkZXIucHJvdG90eXBlLl9kZWNvZGVFeHRlbnNpb25zID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgdmFyIGksXG4gICAgICAgIHN0YXJ0ID0gdGhpcy5fbmV4dFNldCh0aGlzLl9yb3csIG9mZnNldCksXG4gICAgICAgIHN0YXJ0SW5mbyA9IHRoaXMuX2ZpbmRQYXR0ZXJuKHRoaXMuRVhURU5TSU9OX1NUQVJUX1BBVFRFUk4sIHN0YXJ0LCBmYWxzZSwgZmFsc2UpLFxuICAgICAgICByZXN1bHQ7XG5cbiAgICBpZiAoc3RhcnRJbmZvID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnN1cHBsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuc3VwcGxlbWVudHNbaV0uZGVjb2RlKHRoaXMuX3Jvdywgc3RhcnRJbmZvLmVuZCk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29kZTogcmVzdWx0LmNvZGUsXG4gICAgICAgICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgICAgICAgc3RhcnRJbmZvLFxuICAgICAgICAgICAgICAgIGVuZDogcmVzdWx0LmVuZCxcbiAgICAgICAgICAgICAgICBjb2Rlc2V0OiBcIlwiLFxuICAgICAgICAgICAgICAgIGRlY29kZWRDb2RlczogcmVzdWx0LmRlY29kZWRDb2Rlc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuRUFOUmVhZGVyLnByb3RvdHlwZS5fY2hlY2tzdW0gPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgc3VtID0gMCwgaTtcblxuICAgIGZvciAoIGkgPSByZXN1bHQubGVuZ3RoIC0gMjsgaSA+PSAwOyBpIC09IDIpIHtcbiAgICAgICAgc3VtICs9IHJlc3VsdFtpXTtcbiAgICB9XG4gICAgc3VtICo9IDM7XG4gICAgZm9yICggaSA9IHJlc3VsdC5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMikge1xuICAgICAgICBzdW0gKz0gcmVzdWx0W2ldO1xuICAgIH1cbiAgICByZXR1cm4gc3VtICUgMTAgPT09IDA7XG59O1xuXG5FQU5SZWFkZXIuQ09ORklHX0tFWVMgPSB7XG4gICAgc3VwcGxlbWVudHM6IHtcbiAgICAgICAgJ3R5cGUnOiAnYXJyYXlPZihzdHJpbmcpJyxcbiAgICAgICAgJ2RlZmF1bHQnOiBbXSxcbiAgICAgICAgJ2Rlc2NyaXB0aW9uJzogJ0FsbG93ZWQgZXh0ZW5zaW9ucyB0byBiZSBkZWNvZGVkICgyIGFuZC9vciA1KSdcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoRUFOUmVhZGVyKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvZWFuX3JlYWRlci5qcyIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX3Jvb3QuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IGRlZmF1bHQge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgICAgIHZhciBsID0gYXJyLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGwtLSkge1xuICAgICAgICAgICAgYXJyW2xdID0gdmFsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNodWZmbGVzIHRoZSBjb250ZW50IG9mIGFuIGFycmF5XG4gICAgICogQHJldHVybiB7QXJyYXl9IHRoZSBhcnJheSBpdHNlbGYgc2h1ZmZsZWRcbiAgICAgKi9cbiAgICBzaHVmZmxlOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgdmFyIGkgPSBhcnIubGVuZ3RoIC0gMSwgaiwgeDtcbiAgICAgICAgZm9yIChpOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgeCA9IGFycltpXTtcbiAgICAgICAgICAgIGFycltpXSA9IGFycltqXTtcbiAgICAgICAgICAgIGFycltqXSA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LFxuXG4gICAgdG9Qb2ludExpc3Q6IGZ1bmN0aW9uKGFycikge1xuICAgICAgICB2YXIgaSwgaiwgcm93ID0gW10sIHJvd3MgPSBbXTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJvdyA9IFtdO1xuICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBhcnJbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICByb3dbal0gPSBhcnJbaV1bal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb3dzW2ldID0gXCJbXCIgKyByb3cuam9pbihcIixcIikgKyBcIl1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJbXCIgKyByb3dzLmpvaW4oXCIsXFxyXFxuXCIpICsgXCJdXCI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhlIGVsZW1lbnRzIHdoaWNoJ3Mgc2NvcmUgaXMgYmlnZ2VyIHRoYW4gdGhlIHRocmVzaG9sZFxuICAgICAqIEByZXR1cm4ge0FycmF5fSB0aGUgcmVkdWNlZCBhcnJheVxuICAgICAqL1xuICAgIHRocmVzaG9sZDogZnVuY3Rpb24oYXJyLCB0aHJlc2hvbGQsIHNjb3JlRnVuYykge1xuICAgICAgICB2YXIgaSwgcXVldWUgPSBbXTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzY29yZUZ1bmMuYXBwbHkoYXJyLCBbYXJyW2ldXSkgPj0gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChhcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9LFxuXG4gICAgbWF4SW5kZXg6IGZ1bmN0aW9uKGFycikge1xuICAgICAgICB2YXIgaSwgbWF4ID0gMDtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPiBhcnJbbWF4XSkge1xuICAgICAgICAgICAgICAgIG1heCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9LFxuXG4gICAgbWF4OiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgdmFyIGksIG1heCA9IDA7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyW2ldID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gYXJyW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfSxcblxuICAgIHN1bTogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgc3VtID0gMDtcblxuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICAgIHN1bSArPSBhcnJbbGVuZ3RoXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH1cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2FycmF5X2hlbHBlci5qcyIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gY2xvbmVcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbmZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgyKVxuICAgIG91dFswXSA9IGFbMF1cbiAgICBvdXRbMV0gPSBhWzFdXG4gICAgcmV0dXJuIG91dFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbC12ZWMyL2Nsb25lLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBsaXN0Q2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUNsZWFyJyksXG4gICAgbGlzdENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlRGVsZXRlJyksXG4gICAgbGlzdENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlR2V0JyksXG4gICAgbGlzdENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlSGFzJyksXG4gICAgbGlzdENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0Q2FjaGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19MaXN0Q2FjaGUuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IGtleSBUaGUga2V5IHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBhc3NvY0luZGV4T2YoYXJyYXksIGtleSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICBpZiAoZXEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc29jSW5kZXhPZjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUdldFRhZy5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNLZXlhYmxlID0gcmVxdWlyZSgnLi9faXNLZXlhYmxlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBpc0tleWFibGUoa2V5KVxuICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgOiBkYXRhLm1hcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRNYXBEYXRhO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fZ2V0TWFwRGF0YS5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUNyZWF0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX25hdGl2ZUNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXE7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2VxLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuL19kZWZpbmVQcm9wZXJ0eScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ25WYWx1ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VBc3NpZ25WYWx1ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19nZXROYXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0FycmF5TGlrZS5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNGdW5jdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2R1bGUpIHtcclxuXHRpZighbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xyXG5cdFx0bW9kdWxlLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKCkge307XHJcblx0XHRtb2R1bGUucGF0aHMgPSBbXTtcclxuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxyXG5cdFx0aWYoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XHJcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xyXG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcclxuXHR9XHJcblx0cmV0dXJuIG1vZHVsZTtcclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgU3ViSW1hZ2UgZnJvbSAnLi9zdWJJbWFnZSc7XG5pbXBvcnQge2hzdjJyZ2J9IGZyb20gJy4uL2NvbW1vbi9jdl91dGlscyc7XG5pbXBvcnQgQXJyYXlIZWxwZXIgZnJvbSAnLi4vY29tbW9uL2FycmF5X2hlbHBlcic7XG5jb25zdCB2ZWMyID0ge1xuICAgIGNsb25lOiByZXF1aXJlKCdnbC12ZWMyL2Nsb25lJyksXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBiYXNpYyBpbWFnZSBjb21iaW5pbmcgdGhlIGRhdGEgYW5kIHNpemUuXG4gKiBJbiBhZGRpdGlvbiwgc29tZSBtZXRob2RzIGZvciBtYW5pcHVsYXRpb24gYXJlIGNvbnRhaW5lZC5cbiAqIEBwYXJhbSBzaXplIHt4LHl9IFRoZSBzaXplIG9mIHRoZSBpbWFnZSBpbiBwaXhlbFxuICogQHBhcmFtIGRhdGEge0FycmF5fSBJZiBnaXZlbiwgYSBmbGF0IGFycmF5IGNvbnRhaW5pbmcgdGhlIHBpeGVsIGRhdGFcbiAqIEBwYXJhbSBBcnJheVR5cGUge1R5cGV9IElmIGdpdmVuLCB0aGUgZGVzaXJlZCBEYXRhVHlwZSBvZiB0aGUgQXJyYXkgKG1heSBiZSB0eXBlZC9ub24tdHlwZWQpXG4gKiBAcGFyYW0gaW5pdGlhbGl6ZSB7Qm9vbGVhbn0gSW5kaWNhdGluZyBpZiB0aGUgYXJyYXkgc2hvdWxkIGJlIGluaXRpYWxpemVkIG9uIGNyZWF0aW9uLlxuICogQHJldHVybnMge0ltYWdlV3JhcHBlcn1cbiAqL1xuZnVuY3Rpb24gSW1hZ2VXcmFwcGVyKHNpemUsIGRhdGEsIEFycmF5VHlwZSwgaW5pdGlhbGl6ZSkge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgICBpZiAoQXJyYXlUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgQXJyYXlUeXBlKHNpemUueCAqIHNpemUueSk7XG4gICAgICAgICAgICBpZiAoQXJyYXlUeXBlID09PSBBcnJheSAmJiBpbml0aWFsaXplKSB7XG4gICAgICAgICAgICAgICAgQXJyYXlIZWxwZXIuaW5pdCh0aGlzLmRhdGEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZS54ICogc2l6ZS55KTtcbiAgICAgICAgICAgIGlmIChVaW50OEFycmF5ID09PSBBcnJheSAmJiBpbml0aWFsaXplKSB7XG4gICAgICAgICAgICAgICAgQXJyYXlIZWxwZXIuaW5pdCh0aGlzLmRhdGEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbn1cblxuLyoqXG4gKiB0ZXN0cyBpZiBhIHBvc2l0aW9uIGlzIHdpdGhpbiB0aGUgaW1hZ2Ugd2l0aCBhIGdpdmVuIG9mZnNldFxuICogQHBhcmFtIGltZ1JlZiB7eCwgeX0gVGhlIGxvY2F0aW9uIHRvIHRlc3RcbiAqIEBwYXJhbSBib3JkZXIgTnVtYmVyIHRoZSBwYWRkaW5nIHZhbHVlIGluIHBpeGVsXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiBsb2NhdGlvbiBpbnNpZGUgdGhlIGltYWdlJ3MgYm9yZGVyLCBmYWxzZSBvdGhlcndpc2VcbiAqIEBzZWUgY3ZkL2ltYWdlLmhcbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5pbkltYWdlV2l0aEJvcmRlciA9IGZ1bmN0aW9uKGltZ1JlZiwgYm9yZGVyKSB7XG4gICAgcmV0dXJuIChpbWdSZWYueCA+PSBib3JkZXIpXG4gICAgICAgICYmIChpbWdSZWYueSA+PSBib3JkZXIpXG4gICAgICAgICYmIChpbWdSZWYueCA8ICh0aGlzLnNpemUueCAtIGJvcmRlcikpXG4gICAgICAgICYmIChpbWdSZWYueSA8ICh0aGlzLnNpemUueSAtIGJvcmRlcikpO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBiaWxpbmVhciBzYW1wbGluZ1xuICogQHBhcmFtIGluSW1nIEltYWdlIHRvIGV4dHJhY3Qgc2FtcGxlIGZyb21cbiAqIEBwYXJhbSB4IHRoZSB4LWNvb3JkaW5hdGVcbiAqIEBwYXJhbSB5IHRoZSB5LWNvb3JkaW5hdGVcbiAqIEByZXR1cm5zIHRoZSBzYW1wbGVkIHZhbHVlXG4gKiBAc2VlIGN2ZC92aXNpb24uaFxuICovXG5JbWFnZVdyYXBwZXIuc2FtcGxlID0gZnVuY3Rpb24oaW5JbWcsIHgsIHkpIHtcbiAgICB2YXIgbHggPSBNYXRoLmZsb29yKHgpO1xuICAgIHZhciBseSA9IE1hdGguZmxvb3IoeSk7XG4gICAgdmFyIHcgPSBpbkltZy5zaXplLng7XG4gICAgdmFyIGJhc2UgPSBseSAqIGluSW1nLnNpemUueCArIGx4O1xuICAgIHZhciBhID0gaW5JbWcuZGF0YVtiYXNlICsgMF07XG4gICAgdmFyIGIgPSBpbkltZy5kYXRhW2Jhc2UgKyAxXTtcbiAgICB2YXIgYyA9IGluSW1nLmRhdGFbYmFzZSArIHddO1xuICAgIHZhciBkID0gaW5JbWcuZGF0YVtiYXNlICsgdyArIDFdO1xuICAgIHZhciBlID0gYSAtIGI7XG4gICAgeCAtPSBseDtcbiAgICB5IC09IGx5O1xuXG4gICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoeCAqICh5ICogKGUgLSBjICsgZCkgLSBlKSArIHkgKiAoYyAtIGEpICsgYSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYSBnaXZlbiBhcnJheS4gU2V0cyBlYWNoIGVsZW1lbnQgdG8gemVyby5cbiAqIEBwYXJhbSBhcnJheSB7QXJyYXl9IFRoZSBhcnJheSB0byBpbml0aWFsaXplXG4gKi9cbkltYWdlV3JhcHBlci5jbGVhckFycmF5ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobC0tKSB7XG4gICAgICAgIGFycmF5W2xdID0gMDtcbiAgICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSB7U3ViSW1hZ2V9IGZyb20gdGhlIGN1cnJlbnQgaW1hZ2UgKHt0aGlzfSkuXG4gKiBAcGFyYW0gZnJvbSB7SW1hZ2VSZWZ9IFRoZSBwb3NpdGlvbiB3aGVyZSB0byBzdGFydCB0aGUge1N1YkltYWdlfSBmcm9tLiAodG9wLWxlZnQgY29ybmVyKVxuICogQHBhcmFtIHNpemUge0ltYWdlUmVmfSBUaGUgc2l6ZSBvZiB0aGUgcmVzdWx0aW5nIGltYWdlXG4gKiBAcmV0dXJucyB7U3ViSW1hZ2V9IEEgc2hhcmVkIHBhcnQgb2YgdGhlIG9yaWdpbmFsIGltYWdlXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuc3ViSW1hZ2UgPSBmdW5jdGlvbihmcm9tLCBzaXplKSB7XG4gICAgcmV0dXJuIG5ldyBTdWJJbWFnZShmcm9tLCBzaXplLCB0aGlzKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiB7SW1hZ2VXcmFwcGVyKSBhbmQgY29waWVzIHRoZSBuZWVkZWQgdW5kZXJseWluZyBpbWFnZS1kYXRhIGFyZWFcbiAqIEBwYXJhbSBpbWFnZVdyYXBwZXIge0ltYWdlV3JhcHBlcn0gVGhlIHRhcmdldCB7SW1hZ2VXcmFwcGVyfSB3aGVyZSB0aGUgZGF0YSBzaG91bGQgYmUgY29waWVkXG4gKiBAcGFyYW0gZnJvbSB7SW1hZ2VSZWZ9IFRoZSBsb2NhdGlvbiB3aGVyZSB0byBjb3B5IGZyb20gKHRvcC1sZWZ0IGxvY2F0aW9uKVxuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLnN1YkltYWdlQXNDb3B5ID0gZnVuY3Rpb24oaW1hZ2VXcmFwcGVyLCBmcm9tKSB7XG4gICAgdmFyIHNpemVZID0gaW1hZ2VXcmFwcGVyLnNpemUueSwgc2l6ZVggPSBpbWFnZVdyYXBwZXIuc2l6ZS54O1xuICAgIHZhciB4LCB5O1xuICAgIGZvciAoIHggPSAwOyB4IDwgc2l6ZVg7IHgrKykge1xuICAgICAgICBmb3IgKCB5ID0gMDsgeSA8IHNpemVZOyB5KyspIHtcbiAgICAgICAgICAgIGltYWdlV3JhcHBlci5kYXRhW3kgKiBzaXplWCArIHhdID0gdGhpcy5kYXRhWyhmcm9tLnkgKyB5KSAqIHRoaXMuc2l6ZS54ICsgZnJvbS54ICsgeF07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLmNvcHlUbyA9IGZ1bmN0aW9uKGltYWdlV3JhcHBlcikge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLmRhdGEubGVuZ3RoLCBzcmNEYXRhID0gdGhpcy5kYXRhLCBkc3REYXRhID0gaW1hZ2VXcmFwcGVyLmRhdGE7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgZHN0RGF0YVtsZW5ndGhdID0gc3JjRGF0YVtsZW5ndGhdO1xuICAgIH1cbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGEgZ2l2ZW4gcGl4ZWwgcG9zaXRpb24gZnJvbSB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB4IHtOdW1iZXJ9IFRoZSB4LXBvc2l0aW9uXG4gKiBAcGFyYW0geSB7TnVtYmVyfSBUaGUgeS1wb3NpdGlvblxuICogQHJldHVybnMge051bWJlcn0gVGhlIGdyYXlzY2FsZSB2YWx1ZSBhdCB0aGUgcGl4ZWwtcG9zaXRpb25cbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVt5ICogdGhpcy5zaXplLnggKyB4XTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGEgZ2l2ZW4gcGl4ZWwgcG9zaXRpb24gZnJvbSB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB4IHtOdW1iZXJ9IFRoZSB4LXBvc2l0aW9uXG4gKiBAcGFyYW0geSB7TnVtYmVyfSBUaGUgeS1wb3NpdGlvblxuICogQHJldHVybnMge051bWJlcn0gVGhlIGdyYXlzY2FsZSB2YWx1ZSBhdCB0aGUgcGl4ZWwtcG9zaXRpb25cbiAqL1xuSW1hZ2VXcmFwcGVyLnByb3RvdHlwZS5nZXRTYWZlID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBpO1xuXG4gICAgaWYgKCF0aGlzLmluZGV4TWFwcGluZykge1xuICAgICAgICB0aGlzLmluZGV4TWFwcGluZyA9IHtcbiAgICAgICAgICAgIHg6IFtdLFxuICAgICAgICAgICAgeTogW11cbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuc2l6ZS54OyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXBwaW5nLnhbaV0gPSBpO1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcHBpbmcueFtpICsgdGhpcy5zaXplLnhdID0gaTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5zaXplLnk7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcHBpbmcueVtpXSA9IGk7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwcGluZy55W2kgKyB0aGlzLnNpemUueV0gPSBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRhdGFbKHRoaXMuaW5kZXhNYXBwaW5nLnlbeSArIHRoaXMuc2l6ZS55XSkgKiB0aGlzLnNpemUueCArIHRoaXMuaW5kZXhNYXBwaW5nLnhbeCArIHRoaXMuc2l6ZS54XV07XG59O1xuXG4vKipcbiAqIFNldHMgYSBnaXZlbiBwaXhlbCBwb3NpdGlvbiBpbiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB4IHtOdW1iZXJ9IFRoZSB4LXBvc2l0aW9uXG4gKiBAcGFyYW0geSB7TnVtYmVyfSBUaGUgeS1wb3NpdGlvblxuICogQHBhcmFtIHZhbHVlIHtOdW1iZXJ9IFRoZSBncmF5c2NhbGUgdmFsdWUgdG8gc2V0XG4gKiBAcmV0dXJucyB7SW1hZ2VXcmFwcGVyfSBUaGUgSW1hZ2UgaXRzZWxmIChmb3IgcG9zc2libGUgY2hhaW5pbmcpXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oeCwgeSwgdmFsdWUpIHtcbiAgICB0aGlzLmRhdGFbeSAqIHRoaXMuc2l6ZS54ICsgeF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgYm9yZGVyIG9mIHRoZSBpbWFnZSAoMSBwaXhlbCkgdG8gemVyb1xuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLnplcm9Cb3JkZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgd2lkdGggPSB0aGlzLnNpemUueCwgaGVpZ2h0ID0gdGhpcy5zaXplLnksIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgZm9yICggaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFbaV0gPSBkYXRhWyhoZWlnaHQgLSAxKSAqIHdpZHRoICsgaV0gPSAwO1xuICAgIH1cbiAgICBmb3IgKCBpID0gMTsgaSA8IGhlaWdodCAtIDE7IGkrKykge1xuICAgICAgICBkYXRhW2kgKiB3aWR0aF0gPSBkYXRhW2kgKiB3aWR0aCArICh3aWR0aCAtIDEpXSA9IDA7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgYmluYXJ5IGltYWdlIGluIHBsYWNlXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuaW52ZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGEsIGxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGRhdGFbbGVuZ3RoXSA9IGRhdGFbbGVuZ3RoXSA/IDAgOiAxO1xuICAgIH1cbn07XG5cbkltYWdlV3JhcHBlci5wcm90b3R5cGUuY29udm9sdmUgPSBmdW5jdGlvbihrZXJuZWwpIHtcbiAgICB2YXIgeCwgeSwga3gsIGt5LCBrU2l6ZSA9IChrZXJuZWwubGVuZ3RoIC8gMikgfCAwLCBhY2N1ID0gMDtcbiAgICBmb3IgKCB5ID0gMDsgeSA8IHRoaXMuc2l6ZS55OyB5KyspIHtcbiAgICAgICAgZm9yICggeCA9IDA7IHggPCB0aGlzLnNpemUueDsgeCsrKSB7XG4gICAgICAgICAgICBhY2N1ID0gMDtcbiAgICAgICAgICAgIGZvciAoIGt5ID0gLWtTaXplOyBreSA8PSBrU2l6ZTsga3krKykge1xuICAgICAgICAgICAgICAgIGZvciAoIGt4ID0gLWtTaXplOyBreCA8PSBrU2l6ZTsga3grKykge1xuICAgICAgICAgICAgICAgICAgICBhY2N1ICs9IGtlcm5lbFtreSArIGtTaXplXVtreCArIGtTaXplXSAqIHRoaXMuZ2V0U2FmZSh4ICsga3gsIHkgKyBreSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhW3kgKiB0aGlzLnNpemUueCArIHhdID0gYWNjdTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkltYWdlV3JhcHBlci5wcm90b3R5cGUubW9tZW50cyA9IGZ1bmN0aW9uKGxhYmVsY291bnQpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgaGVpZ2h0ID0gdGhpcy5zaXplLnksXG4gICAgICAgIHdpZHRoID0gdGhpcy5zaXplLngsXG4gICAgICAgIHZhbCxcbiAgICAgICAgeXNxLFxuICAgICAgICBsYWJlbHN1bSA9IFtdLFxuICAgICAgICBpLFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgbXUxMSxcbiAgICAgICAgbXUwMixcbiAgICAgICAgbXUyMCxcbiAgICAgICAgeF8sXG4gICAgICAgIHlfLFxuICAgICAgICB0bXAsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBQSSA9IE1hdGguUEksXG4gICAgICAgIFBJXzQgPSBQSSAvIDQ7XG5cbiAgICBpZiAobGFiZWxjb3VudCA8PSAwKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZm9yICggaSA9IDA7IGkgPCBsYWJlbGNvdW50OyBpKyspIHtcbiAgICAgICAgbGFiZWxzdW1baV0gPSB7XG4gICAgICAgICAgICBtMDA6IDAsXG4gICAgICAgICAgICBtMDE6IDAsXG4gICAgICAgICAgICBtMTA6IDAsXG4gICAgICAgICAgICBtMTE6IDAsXG4gICAgICAgICAgICBtMDI6IDAsXG4gICAgICAgICAgICBtMjA6IDAsXG4gICAgICAgICAgICB0aGV0YTogMCxcbiAgICAgICAgICAgIHJhZDogMFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZvciAoIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgeXNxID0geSAqIHk7XG4gICAgICAgIGZvciAoIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgdmFsID0gZGF0YVt5ICogd2lkdGggKyB4XTtcbiAgICAgICAgICAgIGlmICh2YWwgPiAwKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBsYWJlbHN1bVt2YWwgLSAxXTtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMDAgKz0gMTtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMDEgKz0geTtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMTAgKz0geDtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMTEgKz0geCAqIHk7XG4gICAgICAgICAgICAgICAgbGFiZWwubTAyICs9IHlzcTtcbiAgICAgICAgICAgICAgICBsYWJlbC5tMjAgKz0geCAqIHg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IGxhYmVsY291bnQ7IGkrKykge1xuICAgICAgICBsYWJlbCA9IGxhYmVsc3VtW2ldO1xuICAgICAgICBpZiAoIWlzTmFOKGxhYmVsLm0wMCkgJiYgbGFiZWwubTAwICE9PSAwKSB7XG4gICAgICAgICAgICB4XyA9IGxhYmVsLm0xMCAvIGxhYmVsLm0wMDtcbiAgICAgICAgICAgIHlfID0gbGFiZWwubTAxIC8gbGFiZWwubTAwO1xuICAgICAgICAgICAgbXUxMSA9IGxhYmVsLm0xMSAvIGxhYmVsLm0wMCAtIHhfICogeV87XG4gICAgICAgICAgICBtdTAyID0gbGFiZWwubTAyIC8gbGFiZWwubTAwIC0geV8gKiB5XztcbiAgICAgICAgICAgIG11MjAgPSBsYWJlbC5tMjAgLyBsYWJlbC5tMDAgLSB4XyAqIHhfO1xuICAgICAgICAgICAgdG1wID0gKG11MDIgLSBtdTIwKSAvICgyICogbXUxMSk7XG4gICAgICAgICAgICB0bXAgPSAwLjUgKiBNYXRoLmF0YW4odG1wKSArIChtdTExID49IDAgPyBQSV80IDogLVBJXzQgKSArIFBJO1xuICAgICAgICAgICAgbGFiZWwudGhldGEgPSAodG1wICogMTgwIC8gUEkgKyA5MCkgJSAxODAgLSA5MDtcbiAgICAgICAgICAgIGlmIChsYWJlbC50aGV0YSA8IDApIHtcbiAgICAgICAgICAgICAgICBsYWJlbC50aGV0YSArPSAxODA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYWJlbC5yYWQgPSB0bXAgPiBQSSA/IHRtcCAtIFBJIDogdG1wO1xuICAgICAgICAgICAgbGFiZWwudmVjID0gdmVjMi5jbG9uZShbTWF0aC5jb3ModG1wKSwgTWF0aC5zaW4odG1wKV0pO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gobGFiZWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRGlzcGxheXMgdGhlIHtJbWFnZVdyYXBwZXJ9IGluIGEgZ2l2ZW4gY2FudmFzXG4gKiBAcGFyYW0gY2FudmFzIHtDYW52YXN9IFRoZSBjYW52YXMgZWxlbWVudCB0byB3cml0ZSB0b1xuICogQHBhcmFtIHNjYWxlIHtOdW1iZXJ9IFNjYWxlIHdoaWNoIGlzIGFwcGxpZWQgdG8gZWFjaCBwaXhlbC12YWx1ZVxuICovXG5JbWFnZVdyYXBwZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbihjYW52YXMsIHNjYWxlKSB7XG4gICAgdmFyIGN0eCxcbiAgICAgICAgZnJhbWUsXG4gICAgICAgIGRhdGEsXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIHBpeGVsLFxuICAgICAgICB4LFxuICAgICAgICB5O1xuXG4gICAgaWYgKCFzY2FsZSkge1xuICAgICAgICBzY2FsZSA9IDEuMDtcbiAgICB9XG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY2FudmFzLndpZHRoID0gdGhpcy5zaXplLng7XG4gICAgY2FudmFzLmhlaWdodCA9IHRoaXMuc2l6ZS55O1xuICAgIGZyYW1lID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIGRhdGEgPSBmcmFtZS5kYXRhO1xuICAgIGN1cnJlbnQgPSAwO1xuICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnNpemUueTsgeSsrKSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnNpemUueDsgeCsrKSB7XG4gICAgICAgICAgICBwaXhlbCA9IHkgKiB0aGlzLnNpemUueCArIHg7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5nZXQoeCwgeSkgKiBzY2FsZTtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgMF0gPSBjdXJyZW50O1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAxXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBkYXRhW3BpeGVsICogNCArIDJdID0gY3VycmVudDtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgM10gPSAyNTU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9mcmFtZS5kYXRhID0gZGF0YTtcbiAgICBjdHgucHV0SW1hZ2VEYXRhKGZyYW1lLCAwLCAwKTtcbn07XG5cbi8qKlxuICogRGlzcGxheXMgdGhlIHtTdWJJbWFnZX0gaW4gYSBnaXZlbiBjYW52YXNcbiAqIEBwYXJhbSBjYW52YXMge0NhbnZhc30gVGhlIGNhbnZhcyBlbGVtZW50IHRvIHdyaXRlIHRvXG4gKiBAcGFyYW0gc2NhbGUge051bWJlcn0gU2NhbGUgd2hpY2ggaXMgYXBwbGllZCB0byBlYWNoIHBpeGVsLXZhbHVlXG4gKi9cbkltYWdlV3JhcHBlci5wcm90b3R5cGUub3ZlcmxheSA9IGZ1bmN0aW9uKGNhbnZhcywgc2NhbGUsIGZyb20pIHtcbiAgICBpZiAoIXNjYWxlIHx8IHNjYWxlIDwgMCB8fCBzY2FsZSA+IDM2MCkge1xuICAgICAgICBzY2FsZSA9IDM2MDtcbiAgICB9XG4gICAgdmFyIGhzdiA9IFswLCAxLCAxXTtcbiAgICB2YXIgcmdiID0gWzAsIDAsIDBdO1xuICAgIHZhciB3aGl0ZVJnYiA9IFsyNTUsIDI1NSwgMjU1XTtcbiAgICB2YXIgYmxhY2tSZ2IgPSBbMCwgMCwgMF07XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgZnJhbWUgPSBjdHguZ2V0SW1hZ2VEYXRhKGZyb20ueCwgZnJvbS55LCB0aGlzLnNpemUueCwgdGhpcy5zaXplLnkpO1xuICAgIHZhciBkYXRhID0gZnJhbWUuZGF0YTtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5kYXRhLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaHN2WzBdID0gdGhpcy5kYXRhW2xlbmd0aF0gKiBzY2FsZTtcbiAgICAgICAgcmVzdWx0ID0gaHN2WzBdIDw9IDAgPyB3aGl0ZVJnYiA6IGhzdlswXSA+PSAzNjAgPyBibGFja1JnYiA6IGhzdjJyZ2IoaHN2LCByZ2IpO1xuICAgICAgICBkYXRhW2xlbmd0aCAqIDQgKyAwXSA9IHJlc3VsdFswXTtcbiAgICAgICAgZGF0YVtsZW5ndGggKiA0ICsgMV0gPSByZXN1bHRbMV07XG4gICAgICAgIGRhdGFbbGVuZ3RoICogNCArIDJdID0gcmVzdWx0WzJdO1xuICAgICAgICBkYXRhW2xlbmd0aCAqIDQgKyAzXSA9IDI1NTtcbiAgICB9XG4gICAgY3R4LnB1dEltYWdlRGF0YShmcmFtZSwgZnJvbS54LCBmcm9tLnkpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VXcmFwcGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbW1vbi9pbWFnZV93cmFwcGVyLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5pbXBvcnQgQXJyYXlIZWxwZXIgZnJvbSAnLi4vY29tbW9uL2FycmF5X2hlbHBlcic7XG5cbmZ1bmN0aW9uIENvZGUzOVJlYWRlcigpIHtcbiAgICBCYXJjb2RlUmVhZGVyLmNhbGwodGhpcyk7XG59XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICAgIEFMUEhBQkVUSF9TVFJJTkc6IHt2YWx1ZTogXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVotLiAqJC8rJVwifSxcbiAgICBBTFBIQUJFVDoge3ZhbHVlOiBbNDgsIDQ5LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3NSwgNzYsIDc3LCA3OCxcbiAgICAgICAgNzksIDgwLCA4MSwgODIsIDgzLCA4NCwgODUsIDg2LCA4NywgODgsIDg5LCA5MCwgNDUsIDQ2LCAzMiwgNDIsIDM2LCA0NywgNDMsIDM3XX0sXG4gICAgQ0hBUkFDVEVSX0VOQ09ESU5HUzoge3ZhbHVlOiBbMHgwMzQsIDB4MTIxLCAweDA2MSwgMHgxNjAsIDB4MDMxLCAweDEzMCwgMHgwNzAsIDB4MDI1LCAweDEyNCwgMHgwNjQsIDB4MTA5LCAweDA0OSxcbiAgICAgICAgMHgxNDgsIDB4MDE5LCAweDExOCwgMHgwNTgsIDB4MDBELCAweDEwQywgMHgwNEMsIDB4MDFDLCAweDEwMywgMHgwNDMsIDB4MTQyLCAweDAxMywgMHgxMTIsIDB4MDUyLCAweDAwNywgMHgxMDYsXG4gICAgICAgIDB4MDQ2LCAweDAxNiwgMHgxODEsIDB4MEMxLCAweDFDMCwgMHgwOTEsIDB4MTkwLCAweDBEMCwgMHgwODUsIDB4MTg0LCAweDBDNCwgMHgwOTQsIDB4MEE4LCAweDBBMiwgMHgwOEEsIDB4MDJBXG4gICAgXX0sXG4gICAgQVNURVJJU0s6IHt2YWx1ZTogMHgwOTR9LFxuICAgIEZPUk1BVDoge3ZhbHVlOiBcImNvZGVfMzlcIiwgd3JpdGVhYmxlOiBmYWxzZX1cbn07XG5cbkNvZGUzOVJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkNvZGUzOVJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2RlMzlSZWFkZXI7XG5cbkNvZGUzOVJlYWRlci5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY291bnRlcnMgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBzdGFydCA9IHNlbGYuX2ZpbmRTdGFydCgpLFxuICAgICAgICBkZWNvZGVkQ2hhcixcbiAgICAgICAgbGFzdFN0YXJ0LFxuICAgICAgICBwYXR0ZXJuLFxuICAgICAgICBuZXh0U3RhcnQ7XG5cbiAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBuZXh0U3RhcnQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3Jvdywgc3RhcnQuZW5kKTtcblxuICAgIGRvIHtcbiAgICAgICAgY291bnRlcnMgPSBzZWxmLl90b0NvdW50ZXJzKG5leHRTdGFydCwgY291bnRlcnMpO1xuICAgICAgICBwYXR0ZXJuID0gc2VsZi5fdG9QYXR0ZXJuKGNvdW50ZXJzKTtcbiAgICAgICAgaWYgKHBhdHRlcm4gPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkQ2hhciA9IHNlbGYuX3BhdHRlcm5Ub0NoYXIocGF0dGVybik7XG4gICAgICAgIGlmIChkZWNvZGVkQ2hhciA8IDApe1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZGVjb2RlZENoYXIpO1xuICAgICAgICBsYXN0U3RhcnQgPSBuZXh0U3RhcnQ7XG4gICAgICAgIG5leHRTdGFydCArPSBBcnJheUhlbHBlci5zdW0oY291bnRlcnMpO1xuICAgICAgICBuZXh0U3RhcnQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdywgbmV4dFN0YXJ0KTtcbiAgICB9IHdoaWxlIChkZWNvZGVkQ2hhciAhPT0gJyonKTtcbiAgICByZXN1bHQucG9wKCk7XG5cbiAgICBpZiAoIXJlc3VsdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UobGFzdFN0YXJ0LCBuZXh0U3RhcnQsIGNvdW50ZXJzKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LnN0YXJ0LFxuICAgICAgICBlbmQ6IG5leHRTdGFydCxcbiAgICAgICAgc3RhcnRJbmZvOiBzdGFydCxcbiAgICAgICAgZGVjb2RlZENvZGVzOiByZXN1bHRcbiAgICB9O1xufTtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlID0gZnVuY3Rpb24obGFzdFN0YXJ0LCBuZXh0U3RhcnQsIGNvdW50ZXJzKSB7XG4gICAgdmFyIHRyYWlsaW5nV2hpdGVzcGFjZUVuZCxcbiAgICAgICAgcGF0dGVyblNpemUgPSBBcnJheUhlbHBlci5zdW0oY291bnRlcnMpO1xuXG4gICAgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kID0gbmV4dFN0YXJ0IC0gbGFzdFN0YXJ0IC0gcGF0dGVyblNpemU7XG4gICAgaWYgKCh0cmFpbGluZ1doaXRlc3BhY2VFbmQgKiAzKSA+PSBwYXR0ZXJuU2l6ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fcGF0dGVyblRvQ2hhciA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLkNIQVJBQ1RFUl9FTkNPRElOR1NbaV0gPT09IHBhdHRlcm4pIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHNlbGYuQUxQSEFCRVRbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG5cbkNvZGUzOVJlYWRlci5wcm90b3R5cGUuX2ZpbmROZXh0V2lkdGggPSBmdW5jdGlvbihjb3VudGVycywgY3VycmVudCkge1xuICAgIHZhciBpLFxuICAgICAgICBtaW5XaWR0aCA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvdW50ZXJzW2ldIDwgbWluV2lkdGggJiYgY291bnRlcnNbaV0gPiBjdXJyZW50KSB7XG4gICAgICAgICAgICBtaW5XaWR0aCA9IGNvdW50ZXJzW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1pbldpZHRoO1xufTtcblxuQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fdG9QYXR0ZXJuID0gZnVuY3Rpb24oY291bnRlcnMpIHtcbiAgICB2YXIgbnVtQ291bnRlcnMgPSBjb3VudGVycy5sZW5ndGgsXG4gICAgICAgIG1heE5hcnJvd1dpZHRoID0gMCxcbiAgICAgICAgbnVtV2lkZUJhcnMgPSBudW1Db3VudGVycyxcbiAgICAgICAgd2lkZUJhcldpZHRoID0gMCxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIGk7XG5cbiAgICB3aGlsZSAobnVtV2lkZUJhcnMgPiAzKSB7XG4gICAgICAgIG1heE5hcnJvd1dpZHRoID0gc2VsZi5fZmluZE5leHRXaWR0aChjb3VudGVycywgbWF4TmFycm93V2lkdGgpO1xuICAgICAgICBudW1XaWRlQmFycyA9IDA7XG4gICAgICAgIHBhdHRlcm4gPSAwO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ291bnRlcnM7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJzW2ldID4gbWF4TmFycm93V2lkdGgpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuIHw9IDEgPDwgKG51bUNvdW50ZXJzIC0gMSAtIGkpO1xuICAgICAgICAgICAgICAgIG51bVdpZGVCYXJzKys7XG4gICAgICAgICAgICAgICAgd2lkZUJhcldpZHRoICs9IGNvdW50ZXJzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bVdpZGVCYXJzID09PSAzKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ291bnRlcnMgJiYgbnVtV2lkZUJhcnMgPiAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlcnNbaV0gPiBtYXhOYXJyb3dXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBudW1XaWRlQmFycy0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGNvdW50ZXJzW2ldICogMikgPj0gd2lkZUJhcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGF0dGVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG5Db2RlMzlSZWFkZXIucHJvdG90eXBlLl9maW5kU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KSxcbiAgICAgICAgcGF0dGVyblN0YXJ0ID0gb2Zmc2V0LFxuICAgICAgICBjb3VudGVyID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBjb3VudGVyUG9zID0gMCxcbiAgICAgICAgaXNXaGl0ZSA9IGZhbHNlLFxuICAgICAgICBpLFxuICAgICAgICBqLFxuICAgICAgICB3aGl0ZVNwYWNlTXVzdFN0YXJ0O1xuXG4gICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJQb3MgPT09IGNvdW50ZXIubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIGZpbmQgc3RhcnQgcGF0dGVyblxuICAgICAgICAgICAgICAgIGlmIChzZWxmLl90b1BhdHRlcm4oY291bnRlcikgPT09IHNlbGYuQVNURVJJU0spIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZU11c3RTdGFydCA9IE1hdGguZmxvb3IoTWF0aC5tYXgoMCwgcGF0dGVyblN0YXJ0IC0gKChpIC0gcGF0dGVyblN0YXJ0KSAvIDQpKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKHdoaXRlU3BhY2VNdXN0U3RhcnQsIHBhdHRlcm5TdGFydCwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHBhdHRlcm5TdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IGlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXR0ZXJuU3RhcnQgKz0gY291bnRlclswXSArIGNvdW50ZXJbMV07XG4gICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCA3OyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcltqXSA9IGNvdW50ZXJbaiArIDJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb3VudGVyWzddID0gMDtcbiAgICAgICAgICAgICAgICBjb3VudGVyWzhdID0gMDtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zLS07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10gPSAxO1xuICAgICAgICAgICAgaXNXaGl0ZSA9ICFpc1doaXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29kZTM5UmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9jb2RlXzM5X3JlYWRlci5qcyIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19NYXAuanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19TeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKSxcbiAgICBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2UgYGFzc2lnblZhbHVlYCBleGNlcHQgdGhhdCBpdCBkb2Vzbid0IGFzc2lnblxuICogYHVuZGVmaW5lZGAgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmICgodmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhZXEob2JqZWN0W2tleV0sIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NpZ25NZXJnZVZhbHVlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYXNzaWduTWVyZ2VWYWx1ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVQcm9wZXJ0eTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19mcmVlR2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fZ2V0UHJvdG90eXBlLmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2lzSW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1Byb3RvdHlwZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgLCB1bmxlc3MgYGtleWAgaXMgXCJfX3Byb3RvX19cIi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHNhZmVHZXQob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIGtleSA9PSAnX19wcm90b19fJ1xuICAgID8gdW5kZWZpbmVkXG4gICAgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYWZlR2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc2FmZUdldC5qc1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaWRlbnRpdHkuanNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNBcmd1bWVudHMuanNcbi8vIG1vZHVsZSBpZCA9IDMwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL2lzQXJyYXkuanNcbi8vIG1vZHVsZSBpZCA9IDMxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpLFxuICAgIHN0dWJGYWxzZSA9IHJlcXVpcmUoJy4vc3R1YkZhbHNlJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0J1ZmZlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNCdWZmZXIuanNcbi8vIG1vZHVsZSBpZCA9IDMyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvaXNMZW5ndGguanNcbi8vIG1vZHVsZSBpZCA9IDMzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc1R5cGVkQXJyYXkuanNcbi8vIG1vZHVsZSBpZCA9IDM0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gva2V5c0luLmpzXG4vLyBtb2R1bGUgaWQgPSAzNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZU1lcmdlID0gcmVxdWlyZSgnLi9fYmFzZU1lcmdlJyksXG4gICAgY3JlYXRlQXNzaWduZXIgPSByZXF1aXJlKCcuL19jcmVhdGVBc3NpZ25lcicpO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBtZXJnZXMgb3duIGFuZFxuICogaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgaW50byB0aGVcbiAqIGRlc3RpbmF0aW9uIG9iamVjdC4gU291cmNlIHByb3BlcnRpZXMgdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgIGFyZVxuICogc2tpcHBlZCBpZiBhIGRlc3RpbmF0aW9uIHZhbHVlIGV4aXN0cy4gQXJyYXkgYW5kIHBsYWluIG9iamVjdCBwcm9wZXJ0aWVzXG4gKiBhcmUgbWVyZ2VkIHJlY3Vyc2l2ZWx5LiBPdGhlciBvYmplY3RzIGFuZCB2YWx1ZSB0eXBlcyBhcmUgb3ZlcnJpZGRlbiBieVxuICogYXNzaWdubWVudC4gU291cmNlIG9iamVjdHMgYXJlIGFwcGxpZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LiBTdWJzZXF1ZW50XG4gKiBzb3VyY2VzIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91cyBzb3VyY2VzLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC41LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlc10gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHtcbiAqICAgJ2EnOiBbeyAnYic6IDIgfSwgeyAnZCc6IDQgfV1cbiAqIH07XG4gKlxuICogdmFyIG90aGVyID0ge1xuICogICAnYSc6IFt7ICdjJzogMyB9LCB7ICdlJzogNSB9XVxuICogfTtcbiAqXG4gKiBfLm1lcmdlKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4geyAnYSc6IFt7ICdiJzogMiwgJ2MnOiAzIH0sIHsgJ2QnOiA0LCAnZSc6IDUgfV0gfVxuICovXG52YXIgbWVyZ2UgPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgpIHtcbiAgYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvbWVyZ2UuanNcbi8vIG1vZHVsZSBpZCA9IDM2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuaW1wb3J0IEJhcmNvZGVEZWNvZGVyIGZyb20gJy4vZGVjb2Rlci9iYXJjb2RlX2RlY29kZXJfMic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXQgKGNvbmZpZykge1xuICByZXR1cm4gQmFyY29kZURlY29kZXIuY3JlYXRlKGNvbmZpZylcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9xdWFnZ2EuanMiLCJjb25zdCB2ZWMyID0ge1xuICAgIGNsb25lOiByZXF1aXJlKCdnbC12ZWMyL2Nsb25lJyksXG4gICAgZG90OiByZXF1aXJlKCdnbC12ZWMyL2RvdCcpXG59XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNsdXN0ZXIgZm9yIGdyb3VwaW5nIHNpbWlsYXIgb3JpZW50YXRpb25zIG9mIGRhdGFwb2ludHNcbiAgICAgKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHBvaW50LCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IFtdLFxuICAgICAgICAgICAgY2VudGVyID0ge1xuICAgICAgICAgICAgICAgIHJhZDogMCxcbiAgICAgICAgICAgICAgICB2ZWM6IHZlYzIuY2xvbmUoWzAsIDBdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvaW50TWFwID0ge307XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIGFkZChwb2ludCk7XG4gICAgICAgICAgICB1cGRhdGVDZW50ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZChwb2ludFRvQWRkKSB7XG4gICAgICAgICAgICBwb2ludE1hcFtwb2ludFRvQWRkLmlkXSA9IHBvaW50VG9BZGQ7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwb2ludFRvQWRkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNlbnRlcigpIHtcbiAgICAgICAgICAgIHZhciBpLCBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gcG9pbnRzW2ldLnJhZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNlbnRlci5yYWQgPSBzdW0gLyBwb2ludHMubGVuZ3RoO1xuICAgICAgICAgICAgY2VudGVyLnZlYyA9IHZlYzIuY2xvbmUoW01hdGguY29zKGNlbnRlci5yYWQpLCBNYXRoLnNpbihjZW50ZXIucmFkKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdCgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGQ6IGZ1bmN0aW9uKHBvaW50VG9BZGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBvaW50TWFwW3BvaW50VG9BZGQuaWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZChwb2ludFRvQWRkKTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2VudGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpdHM6IGZ1bmN0aW9uKG90aGVyUG9pbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBjb3NpbmUgc2ltaWxhcml0eSB0byBjZW50ZXItYW5nbGVcbiAgICAgICAgICAgICAgICB2YXIgc2ltaWxhcml0eSA9IE1hdGguYWJzKHZlYzIuZG90KG90aGVyUG9pbnQucG9pbnQudmVjLCBjZW50ZXIudmVjKSk7XG4gICAgICAgICAgICAgICAgaWYgKHNpbWlsYXJpdHkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRQb2ludHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0Q2VudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgY3JlYXRlUG9pbnQ6IGZ1bmN0aW9uKG5ld1BvaW50LCBpZCwgcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhZDogbmV3UG9pbnRbcHJvcGVydHldLFxuICAgICAgICAgICAgcG9pbnQ6IG5ld1BvaW50LFxuICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vY2x1c3Rlci5qcyIsImltcG9ydCBDbHVzdGVyMiBmcm9tICcuL2NsdXN0ZXInO1xuaW1wb3J0IEFycmF5SGVscGVyIGZyb20gJy4vYXJyYXlfaGVscGVyJztcbmNvbnN0IHZlYzIgPSB7XG4gICAgY2xvbmU6IHJlcXVpcmUoJ2dsLXZlYzIvY2xvbmUnKSxcbn07XG5jb25zdCB2ZWMzID0ge1xuICAgIGNsb25lOiByZXF1aXJlKCdnbC12ZWMzL2Nsb25lJyksXG59O1xuXG4vKipcbiAqIEBwYXJhbSB4IHgtY29vcmRpbmF0ZVxuICogQHBhcmFtIHkgeS1jb29yZGluYXRlXG4gKiBAcmV0dXJuIEltYWdlUmVmZXJlbmNlIHt4LHl9IENvb3JkaW5hdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGltYWdlUmVmKHgsIHkpIHtcbiAgICB2YXIgdGhhdCA9IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgdG9WZWMyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB2ZWMyLmNsb25lKFt0aGlzLngsIHRoaXMueV0pO1xuICAgICAgICB9LFxuICAgICAgICB0b1ZlYzM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZlYzMuY2xvbmUoW3RoaXMueCwgdGhpcy55LCAxXSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMueCA9IHRoaXMueCA+IDAuMCA/IE1hdGguZmxvb3IodGhpcy54ICsgMC41KSA6IE1hdGguZmxvb3IodGhpcy54IC0gMC41KTtcbiAgICAgICAgICAgIHRoaXMueSA9IHRoaXMueSA+IDAuMCA/IE1hdGguZmxvb3IodGhpcy55ICsgMC41KSA6IE1hdGguZmxvb3IodGhpcy55IC0gMC41KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gdGhhdDtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgYW4gaW50ZWdyYWwgaW1hZ2Ugb2YgYSBnaXZlbiBncmF5c2NhbGUgaW1hZ2UuXG4gKiBAcGFyYW0gaW1hZ2VEYXRhQ29udGFpbmVyIHtJbWFnZURhdGFDb250YWluZXJ9IHRoZSBpbWFnZSB0byBiZSBpbnRlZ3JhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlSW50ZWdyYWxJbWFnZTIoaW1hZ2VXcmFwcGVyLCBpbnRlZ3JhbFdyYXBwZXIpIHtcbiAgICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VXcmFwcGVyLmRhdGE7XG4gICAgdmFyIHdpZHRoID0gaW1hZ2VXcmFwcGVyLnNpemUueDtcbiAgICB2YXIgaGVpZ2h0ID0gaW1hZ2VXcmFwcGVyLnNpemUueTtcbiAgICB2YXIgaW50ZWdyYWxJbWFnZURhdGEgPSBpbnRlZ3JhbFdyYXBwZXIuZGF0YTtcbiAgICB2YXIgc3VtID0gMCwgcG9zQSA9IDAsIHBvc0IgPSAwLCBwb3NDID0gMCwgcG9zRCA9IDAsIHgsIHk7XG5cbiAgICAvLyBzdW0gdXAgZmlyc3QgY29sdW1uXG4gICAgcG9zQiA9IHdpZHRoO1xuICAgIHN1bSA9IDA7XG4gICAgZm9yICggeSA9IDE7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBzdW0gKz0gaW1hZ2VEYXRhW3Bvc0FdO1xuICAgICAgICBpbnRlZ3JhbEltYWdlRGF0YVtwb3NCXSArPSBzdW07XG4gICAgICAgIHBvc0EgKz0gd2lkdGg7XG4gICAgICAgIHBvc0IgKz0gd2lkdGg7XG4gICAgfVxuXG4gICAgcG9zQSA9IDA7XG4gICAgcG9zQiA9IDE7XG4gICAgc3VtID0gMDtcbiAgICBmb3IgKCB4ID0gMTsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgc3VtICs9IGltYWdlRGF0YVtwb3NBXTtcbiAgICAgICAgaW50ZWdyYWxJbWFnZURhdGFbcG9zQl0gKz0gc3VtO1xuICAgICAgICBwb3NBKys7XG4gICAgICAgIHBvc0IrKztcbiAgICB9XG5cbiAgICBmb3IgKCB5ID0gMTsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIHBvc0EgPSB5ICogd2lkdGggKyAxO1xuICAgICAgICBwb3NCID0gKHkgLSAxKSAqIHdpZHRoICsgMTtcbiAgICAgICAgcG9zQyA9IHkgKiB3aWR0aDtcbiAgICAgICAgcG9zRCA9ICh5IC0gMSkgKiB3aWR0aDtcbiAgICAgICAgZm9yICggeCA9IDE7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICBpbnRlZ3JhbEltYWdlRGF0YVtwb3NBXSArPVxuICAgICAgICAgICAgICAgIGltYWdlRGF0YVtwb3NBXSArIGludGVncmFsSW1hZ2VEYXRhW3Bvc0JdICsgaW50ZWdyYWxJbWFnZURhdGFbcG9zQ10gLSBpbnRlZ3JhbEltYWdlRGF0YVtwb3NEXTtcbiAgICAgICAgICAgIHBvc0ErKztcbiAgICAgICAgICAgIHBvc0IrKztcbiAgICAgICAgICAgIHBvc0MrKztcbiAgICAgICAgICAgIHBvc0QrKztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlSW50ZWdyYWxJbWFnZShpbWFnZVdyYXBwZXIsIGludGVncmFsV3JhcHBlcikge1xuICAgIHZhciBpbWFnZURhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YTtcbiAgICB2YXIgd2lkdGggPSBpbWFnZVdyYXBwZXIuc2l6ZS54O1xuICAgIHZhciBoZWlnaHQgPSBpbWFnZVdyYXBwZXIuc2l6ZS55O1xuICAgIHZhciBpbnRlZ3JhbEltYWdlRGF0YSA9IGludGVncmFsV3JhcHBlci5kYXRhO1xuICAgIHZhciBzdW0gPSAwO1xuXG4gICAgLy8gc3VtIHVwIGZpcnN0IHJvd1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gaW1hZ2VEYXRhW2ldO1xuICAgICAgICBpbnRlZ3JhbEltYWdlRGF0YVtpXSA9IHN1bTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciB2ID0gMTsgdiA8IGhlaWdodDsgdisrKSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAodmFyIHUgPSAwOyB1IDwgd2lkdGg7IHUrKykge1xuICAgICAgICAgICAgc3VtICs9IGltYWdlRGF0YVt2ICogd2lkdGggKyB1XTtcbiAgICAgICAgICAgIGludGVncmFsSW1hZ2VEYXRhWygodikgKiB3aWR0aCkgKyB1XSA9IHN1bSArIGludGVncmFsSW1hZ2VEYXRhWyh2IC0gMSkgKiB3aWR0aCArIHVdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRocmVzaG9sZEltYWdlKGltYWdlV3JhcHBlciwgdGhyZXNob2xkLCB0YXJnZXRXcmFwcGVyKSB7XG4gICAgaWYgKCF0YXJnZXRXcmFwcGVyKSB7XG4gICAgICAgIHRhcmdldFdyYXBwZXIgPSBpbWFnZVdyYXBwZXI7XG4gICAgfVxuICAgIHZhciBpbWFnZURhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YSwgbGVuZ3RoID0gaW1hZ2VEYXRhLmxlbmd0aCwgdGFyZ2V0RGF0YSA9IHRhcmdldFdyYXBwZXIuZGF0YTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICB0YXJnZXREYXRhW2xlbmd0aF0gPSBpbWFnZURhdGFbbGVuZ3RoXSA8IHRocmVzaG9sZCA/IDEgOiAwO1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlSGlzdG9ncmFtKGltYWdlV3JhcHBlciwgYml0c1BlclBpeGVsKSB7XG4gICAgaWYgKCFiaXRzUGVyUGl4ZWwpIHtcbiAgICAgICAgYml0c1BlclBpeGVsID0gODtcbiAgICB9XG4gICAgdmFyIGltYWdlRGF0YSA9IGltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBsZW5ndGggPSBpbWFnZURhdGEubGVuZ3RoLFxuICAgICAgICBiaXRTaGlmdCA9IDggLSBiaXRzUGVyUGl4ZWwsXG4gICAgICAgIGJ1Y2tldENudCA9IDEgPDwgYml0c1BlclBpeGVsLFxuICAgICAgICBoaXN0ID0gbmV3IEludDMyQXJyYXkoYnVja2V0Q250KTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBoaXN0W2ltYWdlRGF0YVtsZW5ndGhdID4+IGJpdFNoaWZ0XSsrO1xuICAgIH1cbiAgICByZXR1cm4gaGlzdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFycGVuTGluZShsaW5lKSB7XG4gICAgdmFyIGksXG4gICAgICAgIGxlbmd0aCA9IGxpbmUubGVuZ3RoLFxuICAgICAgICBsZWZ0ID0gbGluZVswXSxcbiAgICAgICAgY2VudGVyID0gbGluZVsxXSxcbiAgICAgICAgcmlnaHQ7XG5cbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHJpZ2h0ID0gbGluZVtpICsgMV07XG4gICAgICAgIC8vICAtMSA0IC0xIGtlcm5lbFxuICAgICAgICBsaW5lW2kgLSAxXSA9ICgoKGNlbnRlciAqIDIpIC0gbGVmdCAtIHJpZ2h0KSkgJiAyNTU7XG4gICAgICAgIGxlZnQgPSBjZW50ZXI7XG4gICAgICAgIGNlbnRlciA9IHJpZ2h0O1xuICAgIH1cbiAgICByZXR1cm4gbGluZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVPdHN1VGhyZXNob2xkKGltYWdlV3JhcHBlciwgYml0c1BlclBpeGVsKSB7XG4gICAgaWYgKCFiaXRzUGVyUGl4ZWwpIHtcbiAgICAgICAgYml0c1BlclBpeGVsID0gODtcbiAgICB9XG4gICAgdmFyIGhpc3QsXG4gICAgICAgIHRocmVzaG9sZCxcbiAgICAgICAgYml0U2hpZnQgPSA4IC0gYml0c1BlclBpeGVsO1xuXG4gICAgZnVuY3Rpb24gcHgoaW5pdCwgZW5kKSB7XG4gICAgICAgIHZhciBzdW0gPSAwLCBpO1xuICAgICAgICBmb3IgKCBpID0gaW5pdDsgaSA8PSBlbmQ7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGhpc3RbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBteChpbml0LCBlbmQpIHtcbiAgICAgICAgdmFyIGksIHN1bSA9IDA7XG5cbiAgICAgICAgZm9yICggaSA9IGluaXQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBpICogaGlzdFtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGV0ZXJtaW5lVGhyZXNob2xkKCkge1xuICAgICAgICB2YXIgdmV0ID0gWzBdLCBwMSwgcDIsIHAxMiwgaywgbTEsIG0yLCBtMTIsXG4gICAgICAgICAgICBtYXggPSAoMSA8PCBiaXRzUGVyUGl4ZWwpIC0gMTtcblxuICAgICAgICBoaXN0ID0gY29tcHV0ZUhpc3RvZ3JhbShpbWFnZVdyYXBwZXIsIGJpdHNQZXJQaXhlbCk7XG4gICAgICAgIGZvciAoIGsgPSAxOyBrIDwgbWF4OyBrKyspIHtcbiAgICAgICAgICAgIHAxID0gcHgoMCwgayk7XG4gICAgICAgICAgICBwMiA9IHB4KGsgKyAxLCBtYXgpO1xuICAgICAgICAgICAgcDEyID0gcDEgKiBwMjtcbiAgICAgICAgICAgIGlmIChwMTIgPT09IDApIHtcbiAgICAgICAgICAgICAgICBwMTIgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbTEgPSBteCgwLCBrKSAqIHAyO1xuICAgICAgICAgICAgbTIgPSBteChrICsgMSwgbWF4KSAqIHAxO1xuICAgICAgICAgICAgbTEyID0gbTEgLSBtMjtcbiAgICAgICAgICAgIHZldFtrXSA9IG0xMiAqIG0xMiAvIHAxMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXlIZWxwZXIubWF4SW5kZXgodmV0KTtcbiAgICB9XG5cbiAgICB0aHJlc2hvbGQgPSBkZXRlcm1pbmVUaHJlc2hvbGQoKTtcbiAgICByZXR1cm4gdGhyZXNob2xkIDw8IGJpdFNoaWZ0O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG90c3VUaHJlc2hvbGQoaW1hZ2VXcmFwcGVyLCB0YXJnZXRXcmFwcGVyKSB7XG4gICAgdmFyIHRocmVzaG9sZCA9IGRldGVybWluZU90c3VUaHJlc2hvbGQoaW1hZ2VXcmFwcGVyKTtcblxuICAgIHRocmVzaG9sZEltYWdlKGltYWdlV3JhcHBlciwgdGhyZXNob2xkLCB0YXJnZXRXcmFwcGVyKTtcbiAgICByZXR1cm4gdGhyZXNob2xkO1xufTtcblxuLy8gbG9jYWwgdGhyZXNob2xkaW5nXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUJpbmFyeUltYWdlKGltYWdlV3JhcHBlciwgaW50ZWdyYWxXcmFwcGVyLCB0YXJnZXRXcmFwcGVyKSB7XG4gICAgY29tcHV0ZUludGVncmFsSW1hZ2UoaW1hZ2VXcmFwcGVyLCBpbnRlZ3JhbFdyYXBwZXIpO1xuXG4gICAgaWYgKCF0YXJnZXRXcmFwcGVyKSB7XG4gICAgICAgIHRhcmdldFdyYXBwZXIgPSBpbWFnZVdyYXBwZXI7XG4gICAgfVxuICAgIHZhciBpbWFnZURhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YTtcbiAgICB2YXIgdGFyZ2V0RGF0YSA9IHRhcmdldFdyYXBwZXIuZGF0YTtcbiAgICB2YXIgd2lkdGggPSBpbWFnZVdyYXBwZXIuc2l6ZS54O1xuICAgIHZhciBoZWlnaHQgPSBpbWFnZVdyYXBwZXIuc2l6ZS55O1xuICAgIHZhciBpbnRlZ3JhbEltYWdlRGF0YSA9IGludGVncmFsV3JhcHBlci5kYXRhO1xuICAgIHZhciBzdW0gPSAwLCB2LCB1LCBrZXJuZWwgPSAzLCBBLCBCLCBDLCBELCBhdmcsIHNpemUgPSAoa2VybmVsICogMiArIDEpICogKGtlcm5lbCAqIDIgKyAxKTtcblxuICAgIC8vIGNsZWFyIG91dCB0b3AgJiBib3R0b20tYm9yZGVyXG4gICAgZm9yICggdiA9IDA7IHYgPD0ga2VybmVsOyB2KyspIHtcbiAgICAgICAgZm9yICggdSA9IDA7IHUgPCB3aWR0aDsgdSsrKSB7XG4gICAgICAgICAgICB0YXJnZXREYXRhWygodikgKiB3aWR0aCkgKyB1XSA9IDA7XG4gICAgICAgICAgICB0YXJnZXREYXRhWygoKGhlaWdodCAtIDEpIC0gdikgKiB3aWR0aCkgKyB1XSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjbGVhciBvdXQgbGVmdCAmIHJpZ2h0IGJvcmRlclxuICAgIGZvciAoIHYgPSBrZXJuZWw7IHYgPCBoZWlnaHQgLSBrZXJuZWw7IHYrKykge1xuICAgICAgICBmb3IgKCB1ID0gMDsgdSA8PSBrZXJuZWw7IHUrKykge1xuICAgICAgICAgICAgdGFyZ2V0RGF0YVsoKHYpICogd2lkdGgpICsgdV0gPSAwO1xuICAgICAgICAgICAgdGFyZ2V0RGF0YVsoKHYpICogd2lkdGgpICsgKHdpZHRoIC0gMSAtIHUpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKCB2ID0ga2VybmVsICsgMTsgdiA8IGhlaWdodCAtIGtlcm5lbCAtIDE7IHYrKykge1xuICAgICAgICBmb3IgKCB1ID0ga2VybmVsICsgMTsgdSA8IHdpZHRoIC0ga2VybmVsOyB1KyspIHtcbiAgICAgICAgICAgIEEgPSBpbnRlZ3JhbEltYWdlRGF0YVsodiAtIGtlcm5lbCAtIDEpICogd2lkdGggKyAodSAtIGtlcm5lbCAtIDEpXTtcbiAgICAgICAgICAgIEIgPSBpbnRlZ3JhbEltYWdlRGF0YVsodiAtIGtlcm5lbCAtIDEpICogd2lkdGggKyAodSArIGtlcm5lbCldO1xuICAgICAgICAgICAgQyA9IGludGVncmFsSW1hZ2VEYXRhWyh2ICsga2VybmVsKSAqIHdpZHRoICsgKHUgLSBrZXJuZWwgLSAxKV07XG4gICAgICAgICAgICBEID0gaW50ZWdyYWxJbWFnZURhdGFbKHYgKyBrZXJuZWwpICogd2lkdGggKyAodSArIGtlcm5lbCldO1xuICAgICAgICAgICAgc3VtID0gRCAtIEMgLSBCICsgQTtcbiAgICAgICAgICAgIGF2ZyA9IHN1bSAvIChzaXplKTtcbiAgICAgICAgICAgIHRhcmdldERhdGFbdiAqIHdpZHRoICsgdV0gPSBpbWFnZURhdGFbdiAqIHdpZHRoICsgdV0gPiAoYXZnICsgNSkgPyAwIDogMTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjbHVzdGVyKHBvaW50cywgdGhyZXNob2xkLCBwcm9wZXJ0eSkge1xuICAgIHZhciBpLCBrLCBjbHVzdGVyLCBwb2ludCwgY2x1c3RlcnMgPSBbXTtcblxuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgcHJvcGVydHkgPSBcInJhZFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZFRvQ2x1c3RlcihuZXdQb2ludCkge1xuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yICggayA9IDA7IGsgPCBjbHVzdGVycy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgY2x1c3RlciA9IGNsdXN0ZXJzW2tdO1xuICAgICAgICAgICAgaWYgKGNsdXN0ZXIuZml0cyhuZXdQb2ludCkpIHtcbiAgICAgICAgICAgICAgICBjbHVzdGVyLmFkZChuZXdQb2ludCk7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG5cbiAgICAvLyBpdGVyYXRlIG92ZXIgZWFjaCBjbG91ZFxuICAgIGZvciAoIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBvaW50ID0gQ2x1c3RlcjIuY3JlYXRlUG9pbnQocG9pbnRzW2ldLCBpLCBwcm9wZXJ0eSk7XG4gICAgICAgIGlmICghYWRkVG9DbHVzdGVyKHBvaW50KSkge1xuICAgICAgICAgICAgY2x1c3RlcnMucHVzaChDbHVzdGVyMi5jcmVhdGUocG9pbnQsIHRocmVzaG9sZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbHVzdGVycztcbn07XG5cbmV4cG9ydCBjb25zdCBUcmFjZXIgPSB7XG4gICAgdHJhY2U6IGZ1bmN0aW9uKHBvaW50cywgdmVjKSB7XG4gICAgICAgIHZhciBpdGVyYXRpb24sIG1heEl0ZXJhdGlvbnMgPSAxMCwgdG9wID0gW10sIHJlc3VsdCA9IFtdLCBjZW50ZXJQb3MgPSAwLCBjdXJyZW50UG9zID0gMDtcblxuICAgICAgICBmdW5jdGlvbiB0cmFjZShpZHgsIGZvcndhcmQpIHtcbiAgICAgICAgICAgIHZhciBmcm9tLCB0bywgdG9JZHgsIHByZWRpY3RlZFBvcywgdGhyZXNob2xkWCA9IDEsIHRocmVzaG9sZFkgPSBNYXRoLmFicyh2ZWNbMV0gLyAxMCksIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1hdGNoKHBvcywgcHJlZGljdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gKHByZWRpY3RlZC54IC0gdGhyZXNob2xkWClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHBvcy54IDwgKHByZWRpY3RlZC54ICsgdGhyZXNob2xkWClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHBvcy55ID4gKHByZWRpY3RlZC55IC0gdGhyZXNob2xkWSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHBvcy55IDwgKHByZWRpY3RlZC55ICsgdGhyZXNob2xkWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG5leHQgaW5kZXggaXMgd2l0aGluIHRoZSB2ZWMgc3BlY2lmaWNhdGlvbnNcbiAgICAgICAgICAgIC8vIGlmIG5vdCwgY2hlY2sgYXMgbG9uZyBhcyB0aGUgdGhyZXNob2xkIGlzIG1ldFxuXG4gICAgICAgICAgICBmcm9tID0gcG9pbnRzW2lkeF07XG4gICAgICAgICAgICBpZiAoZm9yd2FyZCkge1xuICAgICAgICAgICAgICAgIHByZWRpY3RlZFBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogZnJvbS54ICsgdmVjWzBdLFxuICAgICAgICAgICAgICAgICAgICB5OiBmcm9tLnkgKyB2ZWNbMV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmVkaWN0ZWRQb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGZyb20ueCAtIHZlY1swXSxcbiAgICAgICAgICAgICAgICAgICAgeTogZnJvbS55IC0gdmVjWzFdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9JZHggPSBmb3J3YXJkID8gaWR4ICsgMSA6IGlkeCAtIDE7XG4gICAgICAgICAgICB0byA9IHBvaW50c1t0b0lkeF07XG4gICAgICAgICAgICB3aGlsZSAodG8gJiYgKCBmb3VuZCA9IG1hdGNoKHRvLCBwcmVkaWN0ZWRQb3MpKSAhPT0gdHJ1ZSAmJiAoTWF0aC5hYnModG8ueSAtIGZyb20ueSkgPCB2ZWNbMV0pKSB7XG4gICAgICAgICAgICAgICAgdG9JZHggPSBmb3J3YXJkID8gdG9JZHggKyAxIDogdG9JZHggLSAxO1xuICAgICAgICAgICAgICAgIHRvID0gcG9pbnRzW3RvSWR4XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kID8gdG9JZHggOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgbWF4SXRlcmF0aW9uczsgaXRlcmF0aW9uKyspIHtcbiAgICAgICAgICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBwb2ludCB0byBzdGFydCB3aXRoXG4gICAgICAgICAgICBjZW50ZXJQb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb2ludHMubGVuZ3RoKTtcblxuICAgICAgICAgICAgLy8gdHJhY2UgZm9yd2FyZFxuICAgICAgICAgICAgdG9wID0gW107XG4gICAgICAgICAgICBjdXJyZW50UG9zID0gY2VudGVyUG9zO1xuICAgICAgICAgICAgdG9wLnB1c2gocG9pbnRzW2N1cnJlbnRQb3NdKTtcbiAgICAgICAgICAgIHdoaWxlICgoIGN1cnJlbnRQb3MgPSB0cmFjZShjdXJyZW50UG9zLCB0cnVlKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0b3AucHVzaChwb2ludHNbY3VycmVudFBvc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNlbnRlclBvcyA+IDApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UG9zID0gY2VudGVyUG9zO1xuICAgICAgICAgICAgICAgIHdoaWxlICgoIGN1cnJlbnRQb3MgPSB0cmFjZShjdXJyZW50UG9zLCBmYWxzZSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5wdXNoKHBvaW50c1tjdXJyZW50UG9zXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG9wLmxlbmd0aCA+IHJlc3VsdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0b3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgRElMQVRFID0gMTtcbmV4cG9ydCBjb25zdCBFUk9ERSA9IDI7XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWxhdGUoaW5JbWFnZVdyYXBwZXIsIG91dEltYWdlV3JhcHBlcikge1xuICAgIHZhciB2LFxuICAgICAgICB1LFxuICAgICAgICBpbkltYWdlRGF0YSA9IGluSW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIG91dEltYWdlRGF0YSA9IG91dEltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBoZWlnaHQgPSBpbkltYWdlV3JhcHBlci5zaXplLnksXG4gICAgICAgIHdpZHRoID0gaW5JbWFnZVdyYXBwZXIuc2l6ZS54LFxuICAgICAgICBzdW0sXG4gICAgICAgIHlTdGFydDEsXG4gICAgICAgIHlTdGFydDIsXG4gICAgICAgIHhTdGFydDEsXG4gICAgICAgIHhTdGFydDI7XG5cbiAgICBmb3IgKCB2ID0gMTsgdiA8IGhlaWdodCAtIDE7IHYrKykge1xuICAgICAgICBmb3IgKCB1ID0gMTsgdSA8IHdpZHRoIC0gMTsgdSsrKSB7XG4gICAgICAgICAgICB5U3RhcnQxID0gdiAtIDE7XG4gICAgICAgICAgICB5U3RhcnQyID0gdiArIDE7XG4gICAgICAgICAgICB4U3RhcnQxID0gdSAtIDE7XG4gICAgICAgICAgICB4U3RhcnQyID0gdSArIDE7XG4gICAgICAgICAgICBzdW0gPSBpbkltYWdlRGF0YVt5U3RhcnQxICogd2lkdGggKyB4U3RhcnQxXSArIGluSW1hZ2VEYXRhW3lTdGFydDEgKiB3aWR0aCArIHhTdGFydDJdICtcbiAgICAgICAgICAgIGluSW1hZ2VEYXRhW3YgKiB3aWR0aCArIHVdICtcbiAgICAgICAgICAgIGluSW1hZ2VEYXRhW3lTdGFydDIgKiB3aWR0aCArIHhTdGFydDFdICsgaW5JbWFnZURhdGFbeVN0YXJ0MiAqIHdpZHRoICsgeFN0YXJ0Ml07XG4gICAgICAgICAgICBvdXRJbWFnZURhdGFbdiAqIHdpZHRoICsgdV0gPSBzdW0gPiAwID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZXJvZGUoaW5JbWFnZVdyYXBwZXIsIG91dEltYWdlV3JhcHBlcikge1xuICAgIHZhciB2LFxuICAgICAgICB1LFxuICAgICAgICBpbkltYWdlRGF0YSA9IGluSW1hZ2VXcmFwcGVyLmRhdGEsXG4gICAgICAgIG91dEltYWdlRGF0YSA9IG91dEltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBoZWlnaHQgPSBpbkltYWdlV3JhcHBlci5zaXplLnksXG4gICAgICAgIHdpZHRoID0gaW5JbWFnZVdyYXBwZXIuc2l6ZS54LFxuICAgICAgICBzdW0sXG4gICAgICAgIHlTdGFydDEsXG4gICAgICAgIHlTdGFydDIsXG4gICAgICAgIHhTdGFydDEsXG4gICAgICAgIHhTdGFydDI7XG5cbiAgICBmb3IgKCB2ID0gMTsgdiA8IGhlaWdodCAtIDE7IHYrKykge1xuICAgICAgICBmb3IgKCB1ID0gMTsgdSA8IHdpZHRoIC0gMTsgdSsrKSB7XG4gICAgICAgICAgICB5U3RhcnQxID0gdiAtIDE7XG4gICAgICAgICAgICB5U3RhcnQyID0gdiArIDE7XG4gICAgICAgICAgICB4U3RhcnQxID0gdSAtIDE7XG4gICAgICAgICAgICB4U3RhcnQyID0gdSArIDE7XG4gICAgICAgICAgICBzdW0gPSBpbkltYWdlRGF0YVt5U3RhcnQxICogd2lkdGggKyB4U3RhcnQxXSArIGluSW1hZ2VEYXRhW3lTdGFydDEgKiB3aWR0aCArIHhTdGFydDJdICtcbiAgICAgICAgICAgIGluSW1hZ2VEYXRhW3YgKiB3aWR0aCArIHVdICtcbiAgICAgICAgICAgIGluSW1hZ2VEYXRhW3lTdGFydDIgKiB3aWR0aCArIHhTdGFydDFdICsgaW5JbWFnZURhdGFbeVN0YXJ0MiAqIHdpZHRoICsgeFN0YXJ0Ml07XG4gICAgICAgICAgICBvdXRJbWFnZURhdGFbdiAqIHdpZHRoICsgdV0gPSBzdW0gPT09IDUgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChhSW1hZ2VXcmFwcGVyLCBiSW1hZ2VXcmFwcGVyLCByZXN1bHRJbWFnZVdyYXBwZXIpIHtcbiAgICBpZiAoIXJlc3VsdEltYWdlV3JhcHBlcikge1xuICAgICAgICByZXN1bHRJbWFnZVdyYXBwZXIgPSBhSW1hZ2VXcmFwcGVyO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gYUltYWdlV3JhcHBlci5kYXRhLmxlbmd0aCxcbiAgICAgICAgYUltYWdlRGF0YSA9IGFJbWFnZVdyYXBwZXIuZGF0YSxcbiAgICAgICAgYkltYWdlRGF0YSA9IGJJbWFnZVdyYXBwZXIuZGF0YSxcbiAgICAgICAgY0ltYWdlRGF0YSA9IHJlc3VsdEltYWdlV3JhcHBlci5kYXRhO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGNJbWFnZURhdGFbbGVuZ3RoXSA9IGFJbWFnZURhdGFbbGVuZ3RoXSAtIGJJbWFnZURhdGFbbGVuZ3RoXTtcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gYml0d2lzZU9yKGFJbWFnZVdyYXBwZXIsIGJJbWFnZVdyYXBwZXIsIHJlc3VsdEltYWdlV3JhcHBlcikge1xuICAgIGlmICghcmVzdWx0SW1hZ2VXcmFwcGVyKSB7XG4gICAgICAgIHJlc3VsdEltYWdlV3JhcHBlciA9IGFJbWFnZVdyYXBwZXI7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBhSW1hZ2VXcmFwcGVyLmRhdGEubGVuZ3RoLFxuICAgICAgICBhSW1hZ2VEYXRhID0gYUltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBiSW1hZ2VEYXRhID0gYkltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICBjSW1hZ2VEYXRhID0gcmVzdWx0SW1hZ2VXcmFwcGVyLmRhdGE7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgY0ltYWdlRGF0YVtsZW5ndGhdID0gYUltYWdlRGF0YVtsZW5ndGhdIHx8IGJJbWFnZURhdGFbbGVuZ3RoXTtcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY291bnROb25aZXJvKGltYWdlV3JhcHBlcikge1xuICAgIHZhciBsZW5ndGggPSBpbWFnZVdyYXBwZXIuZGF0YS5sZW5ndGgsIGRhdGEgPSBpbWFnZVdyYXBwZXIuZGF0YSwgc3VtID0gMDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBzdW0gKz0gZGF0YVtsZW5ndGhdO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvcEdlbmVyaWMobGlzdCwgdG9wLCBzY29yZUZ1bmMpIHtcbiAgICB2YXIgaSwgbWluSWR4ID0gMCwgbWluID0gMCwgcXVldWUgPSBbXSwgc2NvcmUsIGhpdCwgcG9zO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCB0b3A7IGkrKykge1xuICAgICAgICBxdWV1ZVtpXSA9IHtcbiAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgaXRlbTogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBzY29yZSA9IHNjb3JlRnVuYy5hcHBseSh0aGlzLCBbbGlzdFtpXV0pO1xuICAgICAgICBpZiAoc2NvcmUgPiBtaW4pIHtcbiAgICAgICAgICAgIGhpdCA9IHF1ZXVlW21pbklkeF07XG4gICAgICAgICAgICBoaXQuc2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGhpdC5pdGVtID0gbGlzdFtpXTtcbiAgICAgICAgICAgIG1pbiA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgICAgICAgICBmb3IgKCBwb3MgPSAwOyBwb3MgPCB0b3A7IHBvcysrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlW3Bvc10uc2NvcmUgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbWluID0gcXVldWVbcG9zXS5zY29yZTtcbiAgICAgICAgICAgICAgICAgICAgbWluSWR4ID0gcG9zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBxdWV1ZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBncmF5QXJyYXlGcm9tSW1hZ2UoaHRtbEltYWdlLCBvZmZzZXRYLCBjdHgsIGFycmF5KSB7XG4gICAgY3R4LmRyYXdJbWFnZShodG1sSW1hZ2UsIG9mZnNldFgsIDAsIGh0bWxJbWFnZS53aWR0aCwgaHRtbEltYWdlLmhlaWdodCk7XG4gICAgdmFyIGN0eERhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKG9mZnNldFgsIDAsIGh0bWxJbWFnZS53aWR0aCwgaHRtbEltYWdlLmhlaWdodCkuZGF0YTtcbiAgICBjb21wdXRlR3JheShjdHhEYXRhLCBhcnJheSk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ3JheUFycmF5RnJvbUNvbnRleHQoY3R4LCBzaXplLCBvZmZzZXQsIGFycmF5KSB7XG4gICAgdmFyIGN0eERhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKG9mZnNldC54LCBvZmZzZXQueSwgc2l6ZS54LCBzaXplLnkpLmRhdGE7XG4gICAgY29tcHV0ZUdyYXkoY3R4RGF0YSwgYXJyYXkpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdyYXlBbmRIYWxmU2FtcGxlRnJvbUNhbnZhc0RhdGEoY2FudmFzRGF0YSwgc2l6ZSwgb3V0QXJyYXkpIHtcbiAgICB2YXIgdG9wUm93SWR4ID0gMDtcbiAgICB2YXIgYm90dG9tUm93SWR4ID0gc2l6ZS54O1xuICAgIHZhciBlbmRJZHggPSBNYXRoLmZsb29yKGNhbnZhc0RhdGEubGVuZ3RoIC8gNCk7XG4gICAgdmFyIG91dFdpZHRoID0gc2l6ZS54IC8gMjtcbiAgICB2YXIgb3V0SW1nSWR4ID0gMDtcbiAgICB2YXIgaW5XaWR0aCA9IHNpemUueDtcbiAgICB2YXIgaTtcblxuICAgIHdoaWxlIChib3R0b21Sb3dJZHggPCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBvdXRXaWR0aDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRBcnJheVtvdXRJbWdJZHhdID0gKFxuICAgICAgICAgICAgICAgICgwLjI5OSAqIGNhbnZhc0RhdGFbdG9wUm93SWR4ICogNCArIDBdICtcbiAgICAgICAgICAgICAgICAgMC41ODcgKiBjYW52YXNEYXRhW3RvcFJvd0lkeCAqIDQgKyAxXSArXG4gICAgICAgICAgICAgICAgIDAuMTE0ICogY2FudmFzRGF0YVt0b3BSb3dJZHggKiA0ICsgMl0pICtcbiAgICAgICAgICAgICAgICAoMC4yOTkgKiBjYW52YXNEYXRhWyh0b3BSb3dJZHggKyAxKSAqIDQgKyAwXSArXG4gICAgICAgICAgICAgICAgIDAuNTg3ICogY2FudmFzRGF0YVsodG9wUm93SWR4ICsgMSkgKiA0ICsgMV0gK1xuICAgICAgICAgICAgICAgICAwLjExNCAqIGNhbnZhc0RhdGFbKHRvcFJvd0lkeCArIDEpICogNCArIDJdKSArXG4gICAgICAgICAgICAgICAgKDAuMjk5ICogY2FudmFzRGF0YVsoYm90dG9tUm93SWR4KSAqIDQgKyAwXSArXG4gICAgICAgICAgICAgICAgIDAuNTg3ICogY2FudmFzRGF0YVsoYm90dG9tUm93SWR4KSAqIDQgKyAxXSArXG4gICAgICAgICAgICAgICAgIDAuMTE0ICogY2FudmFzRGF0YVsoYm90dG9tUm93SWR4KSAqIDQgKyAyXSkgK1xuICAgICAgICAgICAgICAgICgwLjI5OSAqIGNhbnZhc0RhdGFbKGJvdHRvbVJvd0lkeCArIDEpICogNCArIDBdICtcbiAgICAgICAgICAgICAgICAgMC41ODcgKiBjYW52YXNEYXRhWyhib3R0b21Sb3dJZHggKyAxKSAqIDQgKyAxXSArXG4gICAgICAgICAgICAgICAgIDAuMTE0ICogY2FudmFzRGF0YVsoYm90dG9tUm93SWR4ICsgMSkgKiA0ICsgMl0pKSAvIDQ7XG4gICAgICAgICAgICBvdXRJbWdJZHgrKztcbiAgICAgICAgICAgIHRvcFJvd0lkeCA9IHRvcFJvd0lkeCArIDI7XG4gICAgICAgICAgICBib3R0b21Sb3dJZHggPSBib3R0b21Sb3dJZHggKyAyO1xuICAgICAgICB9XG4gICAgICAgIHRvcFJvd0lkeCA9IHRvcFJvd0lkeCArIGluV2lkdGg7XG4gICAgICAgIGJvdHRvbVJvd0lkeCA9IGJvdHRvbVJvd0lkeCArIGluV2lkdGg7XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVHcmF5KGltYWdlRGF0YSwgb3V0QXJyYXksIGNvbmZpZykge1xuICAgIHZhciBsID0gKGltYWdlRGF0YS5sZW5ndGggLyA0KSB8IDAsXG4gICAgICAgIGksXG4gICAgICAgIHNpbmdsZUNoYW5uZWwgPSBjb25maWcgJiYgY29uZmlnLnNpbmdsZUNoYW5uZWwgPT09IHRydWU7XG5cbiAgICBpZiAoc2luZ2xlQ2hhbm5lbCkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRBcnJheVtpXSA9IGltYWdlRGF0YVtpICogNCArIDBdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgb3V0QXJyYXlbaV0gPVxuICAgICAgICAgICAgICAgIDAuMjk5ICogaW1hZ2VEYXRhW2kgKiA0ICsgMF0gKyAwLjU4NyAqIGltYWdlRGF0YVtpICogNCArIDFdICsgMC4xMTQgKiBpbWFnZURhdGFbaSAqIDQgKyAyXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSW1hZ2VBcnJheShzcmMsIGNhbGxiYWNrLCBjYW52YXMpIHtcbiAgICBpZiAoIWNhbnZhcykge1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB9XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcywgMCwgMCk7XG4gICAgICAgIHZhciBhcnJheSA9IG5ldyBVaW50OEFycmF5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcywgMCwgMCk7XG4gICAgICAgIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZGF0YTtcbiAgICAgICAgY29tcHV0ZUdyYXkoZGF0YSwgYXJyYXkpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGFycmF5LCB7XG4gICAgICAgICAgICB4OiB0aGlzLndpZHRoLFxuICAgICAgICAgICAgeTogdGhpcy5oZWlnaHRcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfTtcbiAgICBpbWcuc3JjID0gc3JjO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gaW5JbWcge0ltYWdlV3JhcHBlcn0gaW5wdXQgaW1hZ2UgdG8gYmUgc2FtcGxlZFxuICogQHBhcmFtIG91dEltZyB7SW1hZ2VXcmFwcGVyfSB0byBiZSBzdG9yZWQgaW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbGZTYW1wbGUoaW5JbWdXcmFwcGVyLCBvdXRJbWdXcmFwcGVyKSB7XG4gICAgdmFyIGluSW1nID0gaW5JbWdXcmFwcGVyLmRhdGE7XG4gICAgdmFyIGluV2lkdGggPSBpbkltZ1dyYXBwZXIuc2l6ZS54O1xuICAgIHZhciBvdXRJbWcgPSBvdXRJbWdXcmFwcGVyLmRhdGE7XG4gICAgdmFyIHRvcFJvd0lkeCA9IDA7XG4gICAgdmFyIGJvdHRvbVJvd0lkeCA9IGluV2lkdGg7XG4gICAgdmFyIGVuZElkeCA9IGluSW1nLmxlbmd0aDtcbiAgICB2YXIgb3V0V2lkdGggPSBpbldpZHRoIC8gMjtcbiAgICB2YXIgb3V0SW1nSWR4ID0gMDtcbiAgICB3aGlsZSAoYm90dG9tUm93SWR4IDwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3V0V2lkdGg7IGkrKykge1xuICAgICAgICAgICAgb3V0SW1nW291dEltZ0lkeF0gPSBNYXRoLmZsb29yKFxuICAgICAgICAgICAgICAgIChpbkltZ1t0b3BSb3dJZHhdICsgaW5JbWdbdG9wUm93SWR4ICsgMV0gKyBpbkltZ1tib3R0b21Sb3dJZHhdICsgaW5JbWdbYm90dG9tUm93SWR4ICsgMV0pIC8gNCk7XG4gICAgICAgICAgICBvdXRJbWdJZHgrKztcbiAgICAgICAgICAgIHRvcFJvd0lkeCA9IHRvcFJvd0lkeCArIDI7XG4gICAgICAgICAgICBib3R0b21Sb3dJZHggPSBib3R0b21Sb3dJZHggKyAyO1xuICAgICAgICB9XG4gICAgICAgIHRvcFJvd0lkeCA9IHRvcFJvd0lkeCArIGluV2lkdGg7XG4gICAgICAgIGJvdHRvbVJvd0lkeCA9IGJvdHRvbVJvd0lkeCArIGluV2lkdGg7XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhzdjJyZ2IoaHN2LCByZ2IpIHtcbiAgICB2YXIgaCA9IGhzdlswXSxcbiAgICAgICAgcyA9IGhzdlsxXSxcbiAgICAgICAgdiA9IGhzdlsyXSxcbiAgICAgICAgYyA9IHYgKiBzLFxuICAgICAgICB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKGggLyA2MCkgJSAyIC0gMSkpLFxuICAgICAgICBtID0gdiAtIGMsXG4gICAgICAgIHIgPSAwLFxuICAgICAgICBnID0gMCxcbiAgICAgICAgYiA9IDA7XG5cbiAgICByZ2IgPSByZ2IgfHwgWzAsIDAsIDBdO1xuXG4gICAgaWYgKGggPCA2MCkge1xuICAgICAgICByID0gYztcbiAgICAgICAgZyA9IHg7XG4gICAgfSBlbHNlIGlmIChoIDwgMTIwKSB7XG4gICAgICAgIHIgPSB4O1xuICAgICAgICBnID0gYztcbiAgICB9IGVsc2UgaWYgKGggPCAxODApIHtcbiAgICAgICAgZyA9IGM7XG4gICAgICAgIGIgPSB4O1xuICAgIH0gZWxzZSBpZiAoaCA8IDI0MCkge1xuICAgICAgICBnID0geDtcbiAgICAgICAgYiA9IGM7XG4gICAgfSBlbHNlIGlmIChoIDwgMzAwKSB7XG4gICAgICAgIHIgPSB4O1xuICAgICAgICBiID0gYztcbiAgICB9IGVsc2UgaWYgKGggPCAzNjApIHtcbiAgICAgICAgciA9IGM7XG4gICAgICAgIGIgPSB4O1xuICAgIH1cbiAgICByZ2JbMF0gPSAoKHIgKyBtKSAqIDI1NSkgfCAwO1xuICAgIHJnYlsxXSA9ICgoZyArIG0pICogMjU1KSB8IDA7XG4gICAgcmdiWzJdID0gKChiICsgbSkgKiAyNTUpIHwgMDtcbiAgICByZXR1cm4gcmdiO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9jb21wdXRlRGl2aXNvcnMobikge1xuICAgIHZhciBsYXJnZURpdmlzb3JzID0gW10sXG4gICAgICAgIGRpdmlzb3JzID0gW10sXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAxOyBpIDwgTWF0aC5zcXJ0KG4pICsgMTsgaSsrKSB7XG4gICAgICAgIGlmIChuICUgaSA9PT0gMCkge1xuICAgICAgICAgICAgZGl2aXNvcnMucHVzaChpKTtcbiAgICAgICAgICAgIGlmIChpICE9PSBuIC8gaSkge1xuICAgICAgICAgICAgICAgIGxhcmdlRGl2aXNvcnMudW5zaGlmdChNYXRoLmZsb29yKG4gLyBpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpdmlzb3JzLmNvbmNhdChsYXJnZURpdmlzb3JzKTtcbn07XG5cbmZ1bmN0aW9uIF9jb21wdXRlSW50ZXJzZWN0aW9uKGFycjEsIGFycjIpIHtcbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGogPSAwLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIHdoaWxlIChpIDwgYXJyMS5sZW5ndGggJiYgaiA8IGFycjIubGVuZ3RoKSB7XG4gICAgICAgIGlmIChhcnIxW2ldID09PSBhcnIyW2pdKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChhcnIxW2ldKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfSBlbHNlIGlmIChhcnIxW2ldID4gYXJyMltqXSkge1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUGF0Y2hTaXplKHBhdGNoU2l6ZSwgaW1nU2l6ZSkge1xuICAgIHZhciBkaXZpc29yc1ggPSBfY29tcHV0ZURpdmlzb3JzKGltZ1NpemUueCksXG4gICAgICAgIGRpdmlzb3JzWSA9IF9jb21wdXRlRGl2aXNvcnMoaW1nU2l6ZS55KSxcbiAgICAgICAgd2lkZVNpZGUgPSBNYXRoLm1heChpbWdTaXplLngsIGltZ1NpemUueSksXG4gICAgICAgIGNvbW1vbiA9IF9jb21wdXRlSW50ZXJzZWN0aW9uKGRpdmlzb3JzWCwgZGl2aXNvcnNZKSxcbiAgICAgICAgbnJPZlBhdGNoZXNMaXN0ID0gWzgsIDEwLCAxNSwgMjAsIDMyLCA2MCwgODBdLFxuICAgICAgICBuck9mUGF0Y2hlc01hcCA9IHtcbiAgICAgICAgICAgIFwieC1zbWFsbFwiOiA1LFxuICAgICAgICAgICAgXCJzbWFsbFwiOiA0LFxuICAgICAgICAgICAgXCJtZWRpdW1cIjogMyxcbiAgICAgICAgICAgIFwibGFyZ2VcIjogMixcbiAgICAgICAgICAgIFwieC1sYXJnZVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIG5yT2ZQYXRjaGVzSWR4ID0gbnJPZlBhdGNoZXNNYXBbcGF0Y2hTaXplXSB8fCBuck9mUGF0Y2hlc01hcC5tZWRpdW0sXG4gICAgICAgIG5yT2ZQYXRjaGVzID0gbnJPZlBhdGNoZXNMaXN0W25yT2ZQYXRjaGVzSWR4XSxcbiAgICAgICAgZGVzaXJlZFBhdGNoU2l6ZSA9IE1hdGguZmxvb3Iod2lkZVNpZGUgLyBuck9mUGF0Y2hlcyksXG4gICAgICAgIG9wdGltYWxQYXRjaFNpemU7XG5cbiAgICBmdW5jdGlvbiBmaW5kUGF0Y2hTaXplRm9yRGl2aXNvcnMoZGl2aXNvcnMpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgZm91bmQgPSBkaXZpc29yc1tNYXRoLmZsb29yKGRpdmlzb3JzLmxlbmd0aCAvIDIpXTtcblxuICAgICAgICB3aGlsZSAoaSA8IChkaXZpc29ycy5sZW5ndGggLSAxKSAmJiBkaXZpc29yc1tpXSA8IGRlc2lyZWRQYXRjaFNpemUpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkaXZpc29yc1tpXSAtIGRlc2lyZWRQYXRjaFNpemUpID4gTWF0aC5hYnMoZGl2aXNvcnNbaSAtIDFdIC0gZGVzaXJlZFBhdGNoU2l6ZSkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGRpdmlzb3JzW2kgLSAxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSBkaXZpc29yc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzaXJlZFBhdGNoU2l6ZSAvIGZvdW5kIDwgbnJPZlBhdGNoZXNMaXN0W25yT2ZQYXRjaGVzSWR4ICsgMV0gLyBuck9mUGF0Y2hlc0xpc3RbbnJPZlBhdGNoZXNJZHhdICYmXG4gICAgICAgICAgICBkZXNpcmVkUGF0Y2hTaXplIC8gZm91bmQgPiBuck9mUGF0Y2hlc0xpc3RbbnJPZlBhdGNoZXNJZHggLSAxXSAvIG5yT2ZQYXRjaGVzTGlzdFtuck9mUGF0Y2hlc0lkeF0gKSB7XG4gICAgICAgICAgICByZXR1cm4ge3g6IGZvdW5kLCB5OiBmb3VuZH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgb3B0aW1hbFBhdGNoU2l6ZSA9IGZpbmRQYXRjaFNpemVGb3JEaXZpc29ycyhjb21tb24pO1xuICAgIGlmICghb3B0aW1hbFBhdGNoU2l6ZSkge1xuICAgICAgICBvcHRpbWFsUGF0Y2hTaXplID0gZmluZFBhdGNoU2l6ZUZvckRpdmlzb3JzKF9jb21wdXRlRGl2aXNvcnMod2lkZVNpZGUpKTtcbiAgICAgICAgaWYgKCFvcHRpbWFsUGF0Y2hTaXplKSB7XG4gICAgICAgICAgICBvcHRpbWFsUGF0Y2hTaXplID0gZmluZFBhdGNoU2l6ZUZvckRpdmlzb3JzKChfY29tcHV0ZURpdmlzb3JzKGRlc2lyZWRQYXRjaFNpemUgKiBuck9mUGF0Y2hlcykpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0aW1hbFBhdGNoU2l6ZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBfcGFyc2VDU1NEaW1lbnNpb25WYWx1ZXModmFsdWUpIHtcbiAgICB2YXIgZGltZW5zaW9uID0ge1xuICAgICAgICB2YWx1ZTogcGFyc2VGbG9hdCh2YWx1ZSksXG4gICAgICAgIHVuaXQ6IHZhbHVlLmluZGV4T2YoXCIlXCIpID09PSB2YWx1ZS5sZW5ndGggLSAxID8gXCIlXCIgOiBcIiVcIlxuICAgIH07XG5cbiAgICByZXR1cm4gZGltZW5zaW9uO1xufTtcblxuZXhwb3J0IGNvbnN0IF9kaW1lbnNpb25zQ29udmVydGVycyA9IHtcbiAgICB0b3A6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgY29udGV4dCkge1xuICAgICAgICBpZiAoZGltZW5zaW9uLnVuaXQgPT09IFwiJVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihjb250ZXh0LmhlaWdodCAqIChkaW1lbnNpb24udmFsdWUgLyAxMDApKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgY29udGV4dCkge1xuICAgICAgICBpZiAoZGltZW5zaW9uLnVuaXQgPT09IFwiJVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihjb250ZXh0LndpZHRoIC0gKGNvbnRleHQud2lkdGggKiAoZGltZW5zaW9uLnZhbHVlIC8gMTAwKSkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBib3R0b206IGZ1bmN0aW9uKGRpbWVuc2lvbiwgY29udGV4dCkge1xuICAgICAgICBpZiAoZGltZW5zaW9uLnVuaXQgPT09IFwiJVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihjb250ZXh0LmhlaWdodCAtIChjb250ZXh0LmhlaWdodCAqIChkaW1lbnNpb24udmFsdWUgLyAxMDApKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IGZ1bmN0aW9uKGRpbWVuc2lvbiwgY29udGV4dCkge1xuICAgICAgICBpZiAoZGltZW5zaW9uLnVuaXQgPT09IFwiJVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihjb250ZXh0LndpZHRoICogKGRpbWVuc2lvbi52YWx1ZSAvIDEwMCkpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVJbWFnZUFyZWEoaW5wdXRXaWR0aCwgaW5wdXRIZWlnaHQsIGFyZWEpIHtcbiAgICB2YXIgY29udGV4dCA9IHt3aWR0aDogaW5wdXRXaWR0aCwgaGVpZ2h0OiBpbnB1dEhlaWdodH07XG5cbiAgICB2YXIgcGFyc2VkQXJlYSA9IE9iamVjdC5rZXlzKGFyZWEpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcmVhW2tleV0sXG4gICAgICAgICAgICBwYXJzZWQgPSBfcGFyc2VDU1NEaW1lbnNpb25WYWx1ZXModmFsdWUpLFxuICAgICAgICAgICAgY2FsY3VsYXRlZCA9IF9kaW1lbnNpb25zQ29udmVydGVyc1trZXldKHBhcnNlZCwgY29udGV4dCk7XG5cbiAgICAgICAgcmVzdWx0W2tleV0gPSBjYWxjdWxhdGVkO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHN4OiBwYXJzZWRBcmVhLmxlZnQsXG4gICAgICAgIHN5OiBwYXJzZWRBcmVhLnRvcCxcbiAgICAgICAgc3c6IHBhcnNlZEFyZWEucmlnaHQgLSBwYXJzZWRBcmVhLmxlZnQsXG4gICAgICAgIHNoOiBwYXJzZWRBcmVhLmJvdHRvbSAtIHBhcnNlZEFyZWEudG9wXG4gICAgfTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2N2X3V0aWxzLmpzIiwiLyoqXG4gKiBDb25zdHJ1Y3QgcmVwcmVzZW50aW5nIGEgcGFydCBvZiBhbm90aGVyIHtJbWFnZVdyYXBwZXJ9LiBTaGFyZXMgZGF0YVxuICogYmV0d2VlbiB0aGUgcGFyZW50IGFuZCB0aGUgY2hpbGQuXG4gKiBAcGFyYW0gZnJvbSB7SW1hZ2VSZWZ9IFRoZSBwb3NpdGlvbiB3aGVyZSB0byBzdGFydCB0aGUge1N1YkltYWdlfSBmcm9tLiAodG9wLWxlZnQgY29ybmVyKVxuICogQHBhcmFtIHNpemUge0ltYWdlUmVmfSBUaGUgc2l6ZSBvZiB0aGUgcmVzdWx0aW5nIGltYWdlXG4gKiBAcGFyYW0gSSB7SW1hZ2VXcmFwcGVyfSBUaGUge0ltYWdlV3JhcHBlcn0gdG8gc2hhcmUgZnJvbVxuICogQHJldHVybnMge1N1YkltYWdlfSBBIHNoYXJlZCBwYXJ0IG9mIHRoZSBvcmlnaW5hbCBpbWFnZVxuICovXG5mdW5jdGlvbiBTdWJJbWFnZShmcm9tLCBzaXplLCBJKSB7XG4gICAgaWYgKCFJKSB7XG4gICAgICAgIEkgPSB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICB9O1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBJLmRhdGE7XG4gICAgdGhpcy5vcmlnaW5hbFNpemUgPSBJLnNpemU7XG4gICAgdGhpcy5JID0gSTtcblxuICAgIHRoaXMuZnJvbSA9IGZyb207XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbn1cblxuLyoqXG4gKiBEaXNwbGF5cyB0aGUge1N1YkltYWdlfSBpbiBhIGdpdmVuIGNhbnZhc1xuICogQHBhcmFtIGNhbnZhcyB7Q2FudmFzfSBUaGUgY2FudmFzIGVsZW1lbnQgdG8gd3JpdGUgdG9cbiAqIEBwYXJhbSBzY2FsZSB7TnVtYmVyfSBTY2FsZSB3aGljaCBpcyBhcHBsaWVkIHRvIGVhY2ggcGl4ZWwtdmFsdWVcbiAqL1xuU3ViSW1hZ2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbihjYW52YXMsIHNjYWxlKSB7XG4gICAgdmFyIGN0eCxcbiAgICAgICAgZnJhbWUsXG4gICAgICAgIGRhdGEsXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIHksXG4gICAgICAgIHgsXG4gICAgICAgIHBpeGVsO1xuXG4gICAgaWYgKCFzY2FsZSkge1xuICAgICAgICBzY2FsZSA9IDEuMDtcbiAgICB9XG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY2FudmFzLndpZHRoID0gdGhpcy5zaXplLng7XG4gICAgY2FudmFzLmhlaWdodCA9IHRoaXMuc2l6ZS55O1xuICAgIGZyYW1lID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIGRhdGEgPSBmcmFtZS5kYXRhO1xuICAgIGN1cnJlbnQgPSAwO1xuICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnNpemUueTsgeSsrKSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnNpemUueDsgeCsrKSB7XG4gICAgICAgICAgICBwaXhlbCA9IHkgKiB0aGlzLnNpemUueCArIHg7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5nZXQoeCwgeSkgKiBzY2FsZTtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgMF0gPSBjdXJyZW50O1xuICAgICAgICAgICAgZGF0YVtwaXhlbCAqIDQgKyAxXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBkYXRhW3BpeGVsICogNCArIDJdID0gY3VycmVudDtcbiAgICAgICAgICAgIGRhdGFbcGl4ZWwgKiA0ICsgM10gPSAyNTU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnJhbWUuZGF0YSA9IGRhdGE7XG4gICAgY3R4LnB1dEltYWdlRGF0YShmcmFtZSwgMCwgMCk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyBhIGdpdmVuIHBpeGVsIHBvc2l0aW9uIGZyb20gdGhlIHtTdWJJbWFnZX1cbiAqIEBwYXJhbSB4IHtOdW1iZXJ9IFRoZSB4LXBvc2l0aW9uXG4gKiBAcGFyYW0geSB7TnVtYmVyfSBUaGUgeS1wb3NpdGlvblxuICogQHJldHVybnMge051bWJlcn0gVGhlIGdyYXlzY2FsZSB2YWx1ZSBhdCB0aGUgcGl4ZWwtcG9zaXRpb25cbiAqL1xuU3ViSW1hZ2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhWyh0aGlzLmZyb20ueSArIHkpICogdGhpcy5vcmlnaW5hbFNpemUueCArIHRoaXMuZnJvbS54ICsgeF07XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHVuZGVybHlpbmcgZGF0YSBmcm9tIGEgZ2l2ZW4ge0ltYWdlV3JhcHBlcn1cbiAqIEBwYXJhbSBpbWFnZSB7SW1hZ2VXcmFwcGVyfSBUaGUgdXBkYXRlZCBpbWFnZVxuICovXG5TdWJJbWFnZS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgdGhpcy5vcmlnaW5hbFNpemUgPSBpbWFnZS5zaXplO1xuICAgIHRoaXMuZGF0YSA9IGltYWdlLmRhdGE7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBzaGFyZWQgYXJlYVxuICogQHBhcmFtIGZyb20ge3gseX0gVGhlIG5ldyBsb2NhdGlvblxuICogQHJldHVybnMge1N1YkltYWdlfSByZXR1cm5zIHt0aGlzfSBmb3IgcG9zc2libGUgY2hhaW5pbmdcbiAqL1xuU3ViSW1hZ2UucHJvdG90eXBlLnVwZGF0ZUZyb20gPSBmdW5jdGlvbihmcm9tKSB7XG4gICAgdGhpcy5mcm9tID0gZnJvbTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IChTdWJJbWFnZSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL3N1YkltYWdlLmpzIiwiaW1wb3J0IEJyZXNlbmhhbSBmcm9tICcuL2JyZXNlbmhhbSc7XG5pbXBvcnQgSW1hZ2VXcmFwcGVyIGZyb20gJy4uL2NvbW1vbi9pbWFnZV93cmFwcGVyJztcbmltcG9ydCBDb2RlMTI4UmVhZGVyIGZyb20gJy4uL3JlYWRlci9jb2RlXzEyOF9yZWFkZXInO1xuaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuLi9yZWFkZXIvZWFuX3JlYWRlcic7XG5pbXBvcnQgQ29kZTM5UmVhZGVyIGZyb20gJy4uL3JlYWRlci9jb2RlXzM5X3JlYWRlcic7XG5pbXBvcnQgQ29kZTM5VklOUmVhZGVyIGZyb20gJy4uL3JlYWRlci9jb2RlXzM5X3Zpbl9yZWFkZXInO1xuaW1wb3J0IENvZGFiYXJSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2NvZGFiYXJfcmVhZGVyJztcbmltcG9ydCBVUENSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL3VwY19yZWFkZXInO1xuaW1wb3J0IEVBTjhSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2Vhbl84X3JlYWRlcic7XG5pbXBvcnQgRUFOMlJlYWRlciBmcm9tICcuLi9yZWFkZXIvZWFuXzJfcmVhZGVyJztcbmltcG9ydCBFQU41UmVhZGVyIGZyb20gJy4uL3JlYWRlci9lYW5fNV9yZWFkZXInO1xuaW1wb3J0IFVQQ0VSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL3VwY19lX3JlYWRlcic7XG5pbXBvcnQgSTJvZjVSZWFkZXIgZnJvbSAnLi4vcmVhZGVyL2kyb2Y1X3JlYWRlcic7XG5pbXBvcnQgVHdvT2ZGaXZlUmVhZGVyIGZyb20gJy4uL3JlYWRlci8yb2Y1X3JlYWRlcic7XG5pbXBvcnQgQ29kZTkzUmVhZGVyIGZyb20gJy4uL3JlYWRlci9jb2RlXzkzX3JlYWRlcic7XG5jb25zdCB2ZWMyY2xvbmUgPSByZXF1aXJlKCdnbC12ZWMyL2Nsb25lJylcblxuY29uc3QgUkVBREVSUyA9IHtcbiAgICBjb2RlXzEyOF9yZWFkZXI6IENvZGUxMjhSZWFkZXIsXG4gICAgZWFuX3JlYWRlcjogRUFOUmVhZGVyLFxuICAgIGVhbl81X3JlYWRlcjogRUFONVJlYWRlcixcbiAgICBlYW5fMl9yZWFkZXI6IEVBTjJSZWFkZXIsXG4gICAgZWFuXzhfcmVhZGVyOiBFQU44UmVhZGVyLFxuICAgIGNvZGVfMzlfcmVhZGVyOiBDb2RlMzlSZWFkZXIsXG4gICAgY29kZV8zOV92aW5fcmVhZGVyOiBDb2RlMzlWSU5SZWFkZXIsXG4gICAgY29kYWJhcl9yZWFkZXI6IENvZGFiYXJSZWFkZXIsXG4gICAgdXBjX3JlYWRlcjogVVBDUmVhZGVyLFxuICAgIHVwY19lX3JlYWRlcjogVVBDRVJlYWRlcixcbiAgICBpMm9mNV9yZWFkZXI6IEkyb2Y1UmVhZGVyLFxuICAgICcyb2Y1X3JlYWRlcic6IFR3b09mRml2ZVJlYWRlcixcbiAgICBjb2RlXzkzX3JlYWRlcjogQ29kZTkzUmVhZGVyXG59O1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICBsZXQgaW5wdXRJbWFnZVdyYXBwZXJcbiAgICAgIGxldCBfYmFyY29kZVJlYWRlcnMgPSBbXTtcblxuICAgICAgICBpbml0UmVhZGVycygpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRSZWFkZXJzKCkge1xuICAgICAgICAgICAgY29uZmlnLnJlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihyZWFkZXJDb25maWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0ge30sXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsZW1lbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlYWRlckNvbmZpZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyID0gcmVhZGVyQ29uZmlnLmZvcm1hdDtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IHJlYWRlckNvbmZpZy5jb25maWc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVhZGVyQ29uZmlnID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICByZWFkZXIgPSByZWFkZXJDb25maWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChFTlYuZGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJCZWZvcmUgcmVnaXN0ZXJpbmcgcmVhZGVyOiBcIiwgcmVhZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uc3VwcGxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3VwcGxlbWVudHMgPSBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3VwcGxlbWVudHMubWFwKChzdXBwbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSRUFERVJTW3N1cHBsZW1lbnRdKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX2JhcmNvZGVSZWFkZXJzLnB1c2gobmV3IFJFQURFUlNbcmVhZGVyXShjb25maWd1cmF0aW9uLCBzdXBwbGVtZW50cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZXh0ZW5kIHRoZSBsaW5lIG9uIGJvdGggZW5kc1xuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBsaW5lXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhbmdsZVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0RXh0ZW5kZWRMaW5lKGxpbmUsIGFuZ2xlLCBleHQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGV4dGVuZExpbmUoYW1vdW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeTogYW1vdW50ICogTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgICAgICAgICAgICB4OiBhbW91bnQgKiBNYXRoLmNvcyhhbmdsZSlcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbGluZVswXS55IC09IGV4dGVuc2lvbi55O1xuICAgICAgICAgICAgICAgIGxpbmVbMF0ueCAtPSBleHRlbnNpb24ueDtcbiAgICAgICAgICAgICAgICBsaW5lWzFdLnkgKz0gZXh0ZW5zaW9uLnk7XG4gICAgICAgICAgICAgICAgbGluZVsxXS54ICs9IGV4dGVuc2lvbi54O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBpbnNpZGUgaW1hZ2VcbiAgICAgICAgICAgIGV4dGVuZExpbmUoZXh0KTtcbiAgICAgICAgICAgIHdoaWxlIChleHQgPiAxICYmICghaW5wdXRJbWFnZVdyYXBwZXIuaW5JbWFnZVdpdGhCb3JkZXIobGluZVswXSwgMClcbiAgICAgICAgICAgICAgICAgICAgfHwgIWlucHV0SW1hZ2VXcmFwcGVyLmluSW1hZ2VXaXRoQm9yZGVyKGxpbmVbMV0sIDApKSkge1xuICAgICAgICAgICAgICAgIGV4dCAtPSBNYXRoLmNlaWwoZXh0IC8gMik7XG4gICAgICAgICAgICAgICAgZXh0ZW5kTGluZSgtZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0TGluZShib3gpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIHg6IChib3hbMV1bMF0gLSBib3hbMF1bMF0pIC8gMiArIGJveFswXVswXSxcbiAgICAgICAgICAgICAgICB5OiAoYm94WzFdWzFdIC0gYm94WzBdWzFdKSAvIDIgKyBib3hbMF1bMV1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB4OiAoYm94WzNdWzBdIC0gYm94WzJdWzBdKSAvIDIgKyBib3hbMl1bMF0sXG4gICAgICAgICAgICAgICAgeTogKGJveFszXVsxXSAtIGJveFsyXVsxXSkgLyAyICsgYm94WzJdWzFdXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRyeURlY29kZShsaW5lKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIGJhcmNvZGVMaW5lID0gQnJlc2VuaGFtLmdldEJhcmNvZGVMaW5lKGlucHV0SW1hZ2VXcmFwcGVyLCBsaW5lWzBdLCBsaW5lWzFdKTtcblxuICAgICAgICAgICAgQnJlc2VuaGFtLnRvQmluYXJ5TGluZShiYXJjb2RlTGluZSk7XG5cbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgX2JhcmNvZGVSZWFkZXJzLmxlbmd0aCAmJiByZXN1bHQgPT09IG51bGw7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IF9iYXJjb2RlUmVhZGVyc1tpXS5kZWNvZGVQYXR0ZXJuKGJhcmNvZGVMaW5lLmxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvZGVSZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICBiYXJjb2RlTGluZTogYmFyY29kZUxpbmVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBtZXRob2Qgc2xpY2VzIHRoZSBnaXZlbiBhcmVhIGFwYXJ0IGFuZCB0cmllcyB0byBkZXRlY3QgYSBiYXJjb2RlLXBhdHRlcm5cbiAgICAgICAgICogZm9yIGVhY2ggc2xpY2UuIEl0IHJldHVybnMgdGhlIGRlY29kZWQgYmFyY29kZSwgb3IgbnVsbCBpZiBub3RoaW5nIHdhcyBmb3VuZFxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBib3hcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gbGluZVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gbGluZUFuZ2xlXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiB0cnlEZWNvZGVCcnV0ZUZvcmNlKGJveCwgbGluZSwgbGluZUFuZ2xlKSB7XG4gICAgICAgICAgICB2YXIgc2lkZUxlbmd0aCA9IE1hdGguc3FydChNYXRoLnBvdyhib3hbMV1bMF0gLSBib3hbMF1bMF0sIDIpICsgTWF0aC5wb3coKGJveFsxXVsxXSAtIGJveFswXVsxXSksIDIpKSxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIHNsaWNlcyA9IDE2LFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlyLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbixcbiAgICAgICAgICAgICAgICB4ZGlyID0gTWF0aC5zaW4obGluZUFuZ2xlKSxcbiAgICAgICAgICAgICAgICB5ZGlyID0gTWF0aC5jb3MobGluZUFuZ2xlKTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDE7IGkgPCBzbGljZXMgJiYgcmVzdWx0ID09PSBudWxsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIGxpbmUgcGVycGVuZGljdWxhciB0byBhbmdsZVxuICAgICAgICAgICAgICAgIGRpciA9IHNpZGVMZW5ndGggLyBzbGljZXMgKiBpICogKGkgJSAyID09PSAwID8gLTEgOiAxKTtcbiAgICAgICAgICAgICAgICBleHRlbnNpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHk6IGRpciAqIHhkaXIsXG4gICAgICAgICAgICAgICAgICAgIHg6IGRpciAqIHlkaXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGxpbmVbMF0ueSArPSBleHRlbnNpb24ueDtcbiAgICAgICAgICAgICAgICBsaW5lWzBdLnggLT0gZXh0ZW5zaW9uLnk7XG4gICAgICAgICAgICAgICAgbGluZVsxXS55ICs9IGV4dGVuc2lvbi54O1xuICAgICAgICAgICAgICAgIGxpbmVbMV0ueCAtPSBleHRlbnNpb24ueTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRyeURlY29kZShsaW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRMaW5lTGVuZ3RoKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoXG4gICAgICAgICAgICAgICAgTWF0aC5wb3coTWF0aC5hYnMobGluZVsxXS55IC0gbGluZVswXS55KSwgMikgK1xuICAgICAgICAgICAgICAgIE1hdGgucG93KE1hdGguYWJzKGxpbmVbMV0ueCAtIGxpbmVbMF0ueCksIDIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaXRoIHRoZSBoZWxwIG9mIHRoZSBjb25maWd1cmVkIHJlYWRlcnMgKENvZGUxMjggb3IgRUFOKSB0aGlzIGZ1bmN0aW9uIHRyaWVzIHRvIGRldGVjdCBhXG4gICAgICAgICAqIHZhbGlkIGJhcmNvZGUgcGF0dGVybiB3aXRoaW4gdGhlIGdpdmVuIGFyZWEuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBib3ggVGhlIGFyZWEgdG8gc2VhcmNoIGluXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSByZXN1bHQge2NvZGVSZXN1bHQsIGxpbmUsIGFuZ2xlLCBwYXR0ZXJuLCB0aHJlc2hvbGR9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBkZWNvZGVGcm9tQm91bmRpbmdCb3goYm94KSB7XG4gICAgICAgICAgICB2YXIgbGluZSxcbiAgICAgICAgICAgICAgICBsaW5lQW5nbGUsXG4gICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgIGxpbmVMZW5ndGg7XG5cbiAgICAgICAgICAgIGxpbmUgPSBnZXRMaW5lKGJveCk7XG4gICAgICAgICAgICBsaW5lTGVuZ3RoID0gZ2V0TGluZUxlbmd0aChsaW5lKTtcbiAgICAgICAgICAgIGxpbmVBbmdsZSA9IE1hdGguYXRhbjIobGluZVsxXS55IC0gbGluZVswXS55LCBsaW5lWzFdLnggLSBsaW5lWzBdLngpO1xuICAgICAgICAgICAgbGluZSA9IGdldEV4dGVuZGVkTGluZShsaW5lLCBsaW5lQW5nbGUsIE1hdGguZmxvb3IobGluZUxlbmd0aCAqIDAuMSkpO1xuICAgICAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgPSB0cnlEZWNvZGUobGluZSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ5RGVjb2RlQnJ1dGVGb3JjZShib3gsIGxpbmUsIGxpbmVBbmdsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29kZVJlc3VsdDogcmVzdWx0LmNvZGVSZXN1bHQsXG4gICAgICAgICAgICAgICAgbGluZTogbGluZSxcbiAgICAgICAgICAgICAgICBhbmdsZTogbGluZUFuZ2xlLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IHJlc3VsdC5iYXJjb2RlTGluZS5saW5lLFxuICAgICAgICAgICAgICAgIHRocmVzaG9sZDogcmVzdWx0LmJhcmNvZGVMaW5lLnRocmVzaG9sZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBkZWNvZGUgKGltYWdlRGF0YSkge1xuICAgICAgICAgIC8vIFdhcm5pbmchIEJlY2F1c2UgaSdtIGhhY2tpbmcgdXAgc29tZW9uZSBlbHNlJ3MgY29kZSwgaSdtIGp1c3Qgc2V0dGluZ1xuICAgICAgICAgIC8vIGEgdmFyaWFibGUgdGhhdCBpcyBjbG9zZWQgb3ZlciwgdGhhdCB0aGUgZGVjb2RlKiBmdW5jaXRvbnMgd2lsbCB1c2VcbiAgICAgICAgICAvLyBUSElTIEZVTkNUSU9OIElTIE5PVCBDT05DVVJSRU5UIFNBRkUhIEl0IG11c3Qgb25seSBldmVyIGJlIGNhbGxlZFxuICAgICAgICAgIC8vIG9uY2UgYXQgYSB0aW1lLCBhbmQgYW55IGNvbmN1cnJlbnQgY2FsbHMgd2lsbCBjb3JydXB0IHRoZSBpbWFnZURhdGFcbiAgICAgICAgICAvLyBhbmQgZG8gaG9ycmlibGUgdGhpbmdzIVxuICAgICAgICAgIGNvbnN0IHNpbmdsZUNvbG9ySW1hZ2VEYXRhID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGltYWdlRGF0YS5oZWlnaHQgKiBpbWFnZURhdGEud2lkdGgpXG4gICAgICAgICAgY29tcHV0ZUdyYXkoaW1hZ2VEYXRhLmRhdGEsIHNpbmdsZUNvbG9ySW1hZ2VEYXRhLCBmYWxzZSlcblxuICAgICAgICAgIGlucHV0SW1hZ2VXcmFwcGVyID0gbmV3IEltYWdlV3JhcHBlcih7XG4gICAgICAgICAgICB5OiBpbWFnZURhdGEuaGVpZ2h0LFxuICAgICAgICAgICAgeDogaW1hZ2VEYXRhLndpZHRoXG4gICAgICAgICAgfSwgc2luZ2xlQ29sb3JJbWFnZURhdGEsIFVpbnQ4Q2xhbXBlZEFycmF5LCBmYWxzZSlcblxuICAgICAgICAgIGNvbnNvbGUubG9nKGlucHV0SW1hZ2VXcmFwcGVyKVxuICAgICAgICAgIHJldHVybiBkZWNvZGVGcm9tQm91bmRpbmdCb3goW1xuICAgICAgICAgICAgdmVjMmNsb25lKFswLCAwXSksXG4gICAgICAgICAgICB2ZWMyY2xvbmUoWzAsIGlucHV0SW1hZ2VXcmFwcGVyLnNpemUueV0pLFxuICAgICAgICAgICAgdmVjMmNsb25lKFtpbnB1dEltYWdlV3JhcHBlci5zaXplLngsIGlucHV0SW1hZ2VXcmFwcGVyLnNpemUueV0pLFxuICAgICAgICAgICAgdmVjMmNsb25lKFtpbnB1dEltYWdlV3JhcHBlci5zaXplLngsIDBdKSxcbiAgICAgICAgICBdKVxuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gY29tcHV0ZUdyYXkoaW1hZ2VEYXRhLCBvdXRBcnJheSwgc2luZ2xlQ2hhbm5lbCkge1xuICAgIHZhciBsID0gKGltYWdlRGF0YS5sZW5ndGggLyA0KSB8IDAsIGk7XG5cbiAgICBpZiAoc2luZ2xlQ2hhbm5lbCkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBvdXRBcnJheVtpXSA9IGltYWdlRGF0YVtpICogNCArIDBdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgb3V0QXJyYXlbaV0gPVxuICAgICAgICAgICAgICAgIDAuMjk5ICogaW1hZ2VEYXRhW2kgKiA0ICsgMF0gKyAwLjU4NyAqIGltYWdlRGF0YVtpICogNCArIDFdICsgMC4xMTQgKiBpbWFnZURhdGFbaSAqIDQgKyAyXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGVjb2Rlci9iYXJjb2RlX2RlY29kZXJfMi5qcyIsImltcG9ydCBJbWFnZVdyYXBwZXIgZnJvbSAnLi4vY29tbW9uL2ltYWdlX3dyYXBwZXInO1xuXG52YXIgQnJlc2VuaGFtID0ge307XG5cbnZhciBTbG9wZSA9IHtcbiAgICBESVI6IHtcbiAgICAgICAgVVA6IDEsXG4gICAgICAgIERPV046IC0xXG4gICAgfVxufTtcbi8qKlxuICogU2NhbnMgYSBsaW5lIG9mIHRoZSBnaXZlbiBpbWFnZSBmcm9tIHBvaW50IHAxIHRvIHAyIGFuZCByZXR1cm5zIGEgcmVzdWx0IG9iamVjdCBjb250YWluaW5nXG4gKiBncmF5LXNjYWxlIHZhbHVlcyAoMC0yNTUpIG9mIHRoZSB1bmRlcmx5aW5nIHBpeGVscyBpbiBhZGRpdGlvbiB0byB0aGUgbWluXG4gKiBhbmQgbWF4IHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpbWFnZVdyYXBwZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwMSBUaGUgc3RhcnQgcG9pbnQge3gseX1cbiAqIEBwYXJhbSB7T2JqZWN0fSBwMiBUaGUgZW5kIHBvaW50IHt4LHl9XG4gKiBAcmV0dXJucyB7bGluZSwgbWluLCBtYXh9XG4gKi9cbkJyZXNlbmhhbS5nZXRCYXJjb2RlTGluZSA9IGZ1bmN0aW9uKGltYWdlV3JhcHBlciwgcDEsIHAyKSB7XG4gICAgdmFyIHgwID0gcDEueCB8IDAsXG4gICAgICAgIHkwID0gcDEueSB8IDAsXG4gICAgICAgIHgxID0gcDIueCB8IDAsXG4gICAgICAgIHkxID0gcDIueSB8IDAsXG4gICAgICAgIHN0ZWVwID0gTWF0aC5hYnMoeTEgLSB5MCkgPiBNYXRoLmFicyh4MSAtIHgwKSxcbiAgICAgICAgZGVsdGF4LFxuICAgICAgICBkZWx0YXksXG4gICAgICAgIGVycm9yLFxuICAgICAgICB5c3RlcCxcbiAgICAgICAgeSxcbiAgICAgICAgdG1wLFxuICAgICAgICB4LFxuICAgICAgICBsaW5lID0gW10sXG4gICAgICAgIGltYWdlRGF0YSA9IGltYWdlV3JhcHBlci5kYXRhLFxuICAgICAgICB3aWR0aCA9IGltYWdlV3JhcHBlci5zaXplLngsXG4gICAgICAgIHN1bSA9IDAsXG4gICAgICAgIHZhbCxcbiAgICAgICAgbWluID0gMjU1LFxuICAgICAgICBtYXggPSAwO1xuXG4gICAgZnVuY3Rpb24gcmVhZChhLCBiKSB7XG4gICAgICAgIHZhbCA9IGltYWdlRGF0YVtiICogd2lkdGggKyBhXTtcbiAgICAgICAgc3VtICs9IHZhbDtcbiAgICAgICAgbWluID0gdmFsIDwgbWluID8gdmFsIDogbWluO1xuICAgICAgICBtYXggPSB2YWwgPiBtYXggPyB2YWwgOiBtYXg7XG4gICAgICAgIGxpbmUucHVzaCh2YWwpO1xuICAgIH1cblxuICAgIGlmIChzdGVlcCkge1xuICAgICAgICB0bXAgPSB4MDtcbiAgICAgICAgeDAgPSB5MDtcbiAgICAgICAgeTAgPSB0bXA7XG5cbiAgICAgICAgdG1wID0geDE7XG4gICAgICAgIHgxID0geTE7XG4gICAgICAgIHkxID0gdG1wO1xuICAgIH1cbiAgICBpZiAoeDAgPiB4MSkge1xuICAgICAgICB0bXAgPSB4MDtcbiAgICAgICAgeDAgPSB4MTtcbiAgICAgICAgeDEgPSB0bXA7XG5cbiAgICAgICAgdG1wID0geTA7XG4gICAgICAgIHkwID0geTE7XG4gICAgICAgIHkxID0gdG1wO1xuICAgIH1cbiAgICBkZWx0YXggPSB4MSAtIHgwO1xuICAgIGRlbHRheSA9IE1hdGguYWJzKHkxIC0geTApO1xuICAgIGVycm9yID0gKGRlbHRheCAvIDIpIHwgMDtcbiAgICB5ID0geTA7XG4gICAgeXN0ZXAgPSB5MCA8IHkxID8gMSA6IC0xO1xuICAgIGZvciAoIHggPSB4MDsgeCA8IHgxOyB4KyspIHtcbiAgICAgICAgaWYgKHN0ZWVwKXtcbiAgICAgICAgICAgIHJlYWQoeSwgeCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWFkKHgsIHkpO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yID0gZXJyb3IgLSBkZWx0YXk7XG4gICAgICAgIGlmIChlcnJvciA8IDApIHtcbiAgICAgICAgICAgIHkgPSB5ICsgeXN0ZXA7XG4gICAgICAgICAgICBlcnJvciA9IGVycm9yICsgZGVsdGF4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluZTogbGluZSxcbiAgICAgICAgbWluOiBtaW4sXG4gICAgICAgIG1heDogbWF4XG4gICAgfTtcbn07XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHJlc3VsdCBmcm9tIGdldEJhcmNvZGVMaW5lIGludG8gYSBiaW5hcnkgcmVwcmVzZW50YXRpb25cbiAqIGFsc28gY29uc2lkZXJpbmcgdGhlIGZyZXF1ZW5jeSBhbmQgc2xvcGUgb2YgdGhlIHNpZ25hbCBmb3IgbW9yZSByb2J1c3QgcmVzdWx0c1xuICogQHBhcmFtIHtPYmplY3R9IHJlc3VsdCB7bGluZSwgbWluLCBtYXh9XG4gKi9cbkJyZXNlbmhhbS50b0JpbmFyeUxpbmUgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgbWluID0gcmVzdWx0Lm1pbixcbiAgICAgICAgbWF4ID0gcmVzdWx0Lm1heCxcbiAgICAgICAgbGluZSA9IHJlc3VsdC5saW5lLFxuICAgICAgICBzbG9wZSxcbiAgICAgICAgc2xvcGUyLFxuICAgICAgICBjZW50ZXIgPSBtaW4gKyAobWF4IC0gbWluKSAvIDIsXG4gICAgICAgIGV4dHJlbWEgPSBbXSxcbiAgICAgICAgY3VycmVudERpcixcbiAgICAgICAgZGlyLFxuICAgICAgICB0aHJlc2hvbGQgPSAobWF4IC0gbWluKSAvIDEyLFxuICAgICAgICByVGhyZXNob2xkID0gLXRocmVzaG9sZCxcbiAgICAgICAgaSxcbiAgICAgICAgajtcblxuICAgIC8vIDEuIGZpbmQgZXh0cmVtYVxuICAgIGN1cnJlbnREaXIgPSBsaW5lWzBdID4gY2VudGVyID8gU2xvcGUuRElSLlVQIDogU2xvcGUuRElSLkRPV047XG4gICAgZXh0cmVtYS5wdXNoKHtcbiAgICAgICAgcG9zOiAwLFxuICAgICAgICB2YWw6IGxpbmVbMF1cbiAgICB9KTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IGxpbmUubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgIHNsb3BlID0gKGxpbmVbaSArIDFdIC0gbGluZVtpXSk7XG4gICAgICAgIHNsb3BlMiA9IChsaW5lW2kgKyAyXSAtIGxpbmVbaSArIDFdKTtcbiAgICAgICAgaWYgKChzbG9wZSArIHNsb3BlMikgPCByVGhyZXNob2xkICYmIGxpbmVbaSArIDFdIDwgKGNlbnRlciAqIDEuNSkpIHtcbiAgICAgICAgICAgIGRpciA9IFNsb3BlLkRJUi5ET1dOO1xuICAgICAgICB9IGVsc2UgaWYgKChzbG9wZSArIHNsb3BlMikgPiB0aHJlc2hvbGQgJiYgbGluZVtpICsgMV0gPiAoY2VudGVyICogMC41KSkge1xuICAgICAgICAgICAgZGlyID0gU2xvcGUuRElSLlVQO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlyID0gY3VycmVudERpcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjdXJyZW50RGlyICE9PSBkaXIpIHtcbiAgICAgICAgICAgIGV4dHJlbWEucHVzaCh7XG4gICAgICAgICAgICAgICAgcG9zOiBpLFxuICAgICAgICAgICAgICAgIHZhbDogbGluZVtpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjdXJyZW50RGlyID0gZGlyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJlbWEucHVzaCh7XG4gICAgICAgIHBvczogbGluZS5sZW5ndGgsXG4gICAgICAgIHZhbDogbGluZVtsaW5lLmxlbmd0aCAtIDFdXG4gICAgfSk7XG5cbiAgICBmb3IgKCBqID0gZXh0cmVtYVswXS5wb3M7IGogPCBleHRyZW1hWzFdLnBvczsgaisrKSB7XG4gICAgICAgIGxpbmVbal0gPSBsaW5lW2pdID4gY2VudGVyID8gMCA6IDE7XG4gICAgfVxuXG4gICAgLy8gaXRlcmF0ZSBvdmVyIGV4dHJlbWEgYW5kIGNvbnZlcnQgdG8gYmluYXJ5IGJhc2VkIG9uIGF2ZyBiZXR3ZWVuIG1pbm1heFxuICAgIGZvciAoIGkgPSAxOyBpIDwgZXh0cmVtYS5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgaWYgKGV4dHJlbWFbaSArIDFdLnZhbCA+IGV4dHJlbWFbaV0udmFsKSB7XG4gICAgICAgICAgICB0aHJlc2hvbGQgPSAoZXh0cmVtYVtpXS52YWwgKyAoKGV4dHJlbWFbaSArIDFdLnZhbCAtIGV4dHJlbWFbaV0udmFsKSAvIDMpICogMikgfCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyZXNob2xkID0gKGV4dHJlbWFbaSArIDFdLnZhbCArICgoZXh0cmVtYVtpXS52YWwgLSBleHRyZW1hW2kgKyAxXS52YWwpIC8gMykpIHwgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoIGogPSBleHRyZW1hW2ldLnBvczsgaiA8IGV4dHJlbWFbaSArIDFdLnBvczsgaisrKSB7XG4gICAgICAgICAgICBsaW5lW2pdID0gbGluZVtqXSA+IHRocmVzaG9sZCA/IDAgOiAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluZTogbGluZSxcbiAgICAgICAgdGhyZXNob2xkOiB0aHJlc2hvbGRcbiAgICB9O1xufTtcblxuLyoqXG4gKiBVc2VkIGZvciBkZXZlbG9wbWVudCBvbmx5XG4gKi9cbkJyZXNlbmhhbS5kZWJ1ZyA9IHtcbiAgICBwcmludEZyZXF1ZW5jeTogZnVuY3Rpb24obGluZSwgY2FudmFzKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gbGluZS5sZW5ndGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSAyNTY7XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsdWVcIjtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGksIDI1NSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKGksIDI1NSAtIGxpbmVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIH0sXG5cbiAgICBwcmludFBhdHRlcm46IGZ1bmN0aW9uKGxpbmUsIGNhbnZhcykge1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKSwgaTtcblxuICAgICAgICBjYW52YXMud2lkdGggPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgY3R4LmZpbGxDb2xvciA9IFwiYmxhY2tcIjtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGluZVtpXSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChpLCAwLCAxLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQnJlc2VuaGFtO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2RlY29kZXIvYnJlc2VuaGFtLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5cbmZ1bmN0aW9uIFR3b09mRml2ZVJlYWRlcihvcHRzKSB7XG4gICAgQmFyY29kZVJlYWRlci5jYWxsKHRoaXMsIG9wdHMpO1xuICAgIHRoaXMuYmFyU3BhY2VSYXRpbyA9IFsxLCAxXTtcbn1cblxudmFyIE4gPSAxLFxuICAgIFcgPSAzLFxuICAgIHByb3BlcnRpZXMgPSB7XG4gICAgICAgIFNUQVJUX1BBVFRFUk46IHt2YWx1ZTogW1csIE4sIFcsIE4sIE4sIE5dfSxcbiAgICAgICAgU1RPUF9QQVRURVJOOiB7dmFsdWU6IFtXLCBOLCBOLCBOLCBXXX0sXG4gICAgICAgIENPREVfUEFUVEVSTjoge3ZhbHVlOiBbXG4gICAgICAgICAgICBbTiwgTiwgVywgVywgTl0sXG4gICAgICAgICAgICBbVywgTiwgTiwgTiwgV10sXG4gICAgICAgICAgICBbTiwgVywgTiwgTiwgV10sXG4gICAgICAgICAgICBbVywgVywgTiwgTiwgTl0sXG4gICAgICAgICAgICBbTiwgTiwgVywgTiwgV10sXG4gICAgICAgICAgICBbVywgTiwgVywgTiwgTl0sXG4gICAgICAgICAgICBbTiwgVywgVywgTiwgTl0sXG4gICAgICAgICAgICBbTiwgTiwgTiwgVywgV10sXG4gICAgICAgICAgICBbVywgTiwgTiwgVywgTl0sXG4gICAgICAgICAgICBbTiwgVywgTiwgVywgTl1cbiAgICAgICAgXX0sXG4gICAgICAgIFNJTkdMRV9DT0RFX0VSUk9SOiB7dmFsdWU6IDAuNzgsIHdyaXRhYmxlOiB0cnVlfSxcbiAgICAgICAgQVZHX0NPREVfRVJST1I6IHt2YWx1ZTogMC4zMCwgd3JpdGFibGU6IHRydWV9LFxuICAgICAgICBGT1JNQVQ6IHt2YWx1ZTogXCIyb2Y1XCJ9XG4gICAgfTtcblxuY29uc3Qgc3RhcnRQYXR0ZXJuTGVuZ3RoID0gcHJvcGVydGllcy5TVEFSVF9QQVRURVJOLnZhbHVlLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUd29PZkZpdmVSZWFkZXI7XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX2ZpbmRQYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgb2Zmc2V0LCBpc1doaXRlLCB0cnlIYXJkZXIpIHtcbiAgICB2YXIgY291bnRlciA9IFtdLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgaSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMFxuICAgICAgICB9LFxuICAgICAgICBlcnJvcixcbiAgICAgICAgaixcbiAgICAgICAgc3VtLFxuICAgICAgICBlcHNpbG9uID0gc2VsZi5BVkdfQ09ERV9FUlJPUjtcblxuICAgIGlzV2hpdGUgPSBpc1doaXRlIHx8IGZhbHNlO1xuICAgIHRyeUhhcmRlciA9IHRyeUhhcmRlciB8fCBmYWxzZTtcblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KTtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY291bnRlcltpXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJQb3MgPT09IGNvdW50ZXIubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBjb3VudGVyW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guc3RhcnQgPSBpIC0gc3VtO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZW5kID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRyeUhhcmRlcikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY291bnRlci5sZW5ndGggLSAyOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbal0gPSBjb3VudGVyW2ogKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMl0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyUG9zLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX2ZpbmRTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbGVhZGluZ1doaXRlc3BhY2VTdGFydCxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBzdGFydEluZm8sXG4gICAgICAgIG5hcnJvd0JhcldpZHRoID0gMTtcblxuICAgIHdoaWxlICghc3RhcnRJbmZvKSB7XG4gICAgICAgIHN0YXJ0SW5mbyA9IHNlbGYuX2ZpbmRQYXR0ZXJuKHNlbGYuU1RBUlRfUEFUVEVSTiwgb2Zmc2V0LCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGlmICghc3RhcnRJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBuYXJyb3dCYXJXaWR0aCA9IE1hdGguZmxvb3IoKHN0YXJ0SW5mby5lbmQgLSBzdGFydEluZm8uc3RhcnQpIC8gc3RhcnRQYXR0ZXJuTGVuZ3RoKTtcbiAgICAgICAgbGVhZGluZ1doaXRlc3BhY2VTdGFydCA9IHN0YXJ0SW5mby5zdGFydCAtIG5hcnJvd0JhcldpZHRoICogNTtcbiAgICAgICAgaWYgKGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2UobGVhZGluZ1doaXRlc3BhY2VTdGFydCwgc3RhcnRJbmZvLnN0YXJ0LCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFydEluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ID0gc3RhcnRJbmZvLmVuZDtcbiAgICAgICAgc3RhcnRJbmZvID0gbnVsbDtcbiAgICB9XG59O1xuXG5Ud29PZkZpdmVSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UgPSBmdW5jdGlvbihlbmRJbmZvKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQ7XG5cbiAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQgPSBlbmRJbmZvLmVuZCArICgoZW5kSW5mby5lbmQgLSBlbmRJbmZvLnN0YXJ0KSAvIDIpO1xuICAgIGlmICh0cmFpbGluZ1doaXRlc3BhY2VFbmQgPCBzZWxmLl9yb3cubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGVuZEluZm8uZW5kLCB0cmFpbGluZ1doaXRlc3BhY2VFbmQsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5kSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX2ZpbmRFbmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGVuZEluZm8sXG4gICAgICAgIHRtcCxcbiAgICAgICAgb2Zmc2V0O1xuXG4gICAgc2VsZi5fcm93LnJldmVyc2UoKTtcbiAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3Jvdyk7XG4gICAgZW5kSW5mbyA9IHNlbGYuX2ZpbmRQYXR0ZXJuKHNlbGYuU1RPUF9QQVRURVJOLCBvZmZzZXQsIGZhbHNlLCB0cnVlKTtcbiAgICBzZWxmLl9yb3cucmV2ZXJzZSgpO1xuXG4gICAgaWYgKGVuZEluZm8gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmV2ZXJzZSBudW1iZXJzXG4gICAgdG1wID0gZW5kSW5mby5zdGFydDtcbiAgICBlbmRJbmZvLnN0YXJ0ID0gc2VsZi5fcm93Lmxlbmd0aCAtIGVuZEluZm8uZW5kO1xuICAgIGVuZEluZm8uZW5kID0gc2VsZi5fcm93Lmxlbmd0aCAtIHRtcDtcblxuICAgIHJldHVybiBlbmRJbmZvICE9PSBudWxsID8gc2VsZi5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlKGVuZEluZm8pIDogbnVsbDtcbn07XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX2RlY29kZUNvZGUgPSBmdW5jdGlvbihjb3VudGVyKSB7XG4gICAgdmFyIGosXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBzdW0gPSAwLFxuICAgICAgICBub3JtYWxpemVkLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgZXBzaWxvbiA9IHNlbGYuQVZHX0NPREVfRVJST1IsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMFxuICAgICAgICB9O1xuXG4gICAgZm9yICggaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHN1bSArPSBjb3VudGVyW2pdO1xuICAgIH1cbiAgICBmb3IgKGNvZGUgPSAwOyBjb2RlIDwgc2VsZi5DT0RFX1BBVFRFUk4ubGVuZ3RoOyBjb2RlKyspIHtcbiAgICAgICAgZXJyb3IgPSBzZWxmLl9tYXRjaFBhdHRlcm4oY291bnRlciwgc2VsZi5DT0RFX1BBVFRFUk5bY29kZV0pO1xuICAgICAgICBpZiAoZXJyb3IgPCBiZXN0TWF0Y2guZXJyb3IpIHtcbiAgICAgICAgICAgIGJlc3RNYXRjaC5jb2RlID0gY29kZTtcbiAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiZXN0TWF0Y2guZXJyb3IgPCBlcHNpbG9uKSB7XG4gICAgICAgIHJldHVybiBiZXN0TWF0Y2g7XG4gICAgfVxufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKGNvdW50ZXJzLCByZXN1bHQsIGRlY29kZWRDb2Rlcykge1xuICAgIHZhciBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgcG9zID0gMCxcbiAgICAgICAgY291bnRlckxlbmd0aCA9IGNvdW50ZXJzLmxlbmd0aCxcbiAgICAgICAgY291bnRlciA9IFswLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgY29kZTtcblxuICAgIHdoaWxlIChwb3MgPCBjb3VudGVyTGVuZ3RoKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50ZXJbaV0gPSBjb3VudGVyc1twb3NdICogdGhpcy5iYXJTcGFjZVJhdGlvWzBdO1xuICAgICAgICAgICAgcG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY291bnRlcik7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlICsgXCJcIik7XG4gICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gY29kZTtcbn07XG5cblR3b09mRml2ZVJlYWRlci5wcm90b3R5cGUuX3ZlcmlmeUNvdW50ZXJMZW5ndGggPSBmdW5jdGlvbihjb3VudGVycykge1xuICAgIHJldHVybiAoY291bnRlcnMubGVuZ3RoICUgMTAgPT09IDApO1xufTtcblxuVHdvT2ZGaXZlUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXJ0SW5mbyxcbiAgICAgICAgZW5kSW5mbyxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXSxcbiAgICAgICAgY291bnRlcnM7XG5cbiAgICBzdGFydEluZm8gPSBzZWxmLl9maW5kU3RhcnQoKTtcbiAgICBpZiAoIXN0YXJ0SW5mbykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGVjb2RlZENvZGVzLnB1c2goc3RhcnRJbmZvKTtcblxuICAgIGVuZEluZm8gPSBzZWxmLl9maW5kRW5kKCk7XG4gICAgaWYgKCFlbmRJbmZvKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvdW50ZXJzID0gc2VsZi5fZmlsbENvdW50ZXJzKHN0YXJ0SW5mby5lbmQsIGVuZEluZm8uc3RhcnQsIGZhbHNlKTtcbiAgICBpZiAoIXNlbGYuX3ZlcmlmeUNvdW50ZXJMZW5ndGgoY291bnRlcnMpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb2RlID0gc2VsZi5fZGVjb2RlUGF5bG9hZChjb3VudGVycywgcmVzdWx0LCBkZWNvZGVkQ29kZXMpO1xuICAgIGlmICghY29kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPCA1KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGRlY29kZWRDb2Rlcy5wdXNoKGVuZEluZm8pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBzdGFydDogc3RhcnRJbmZvLnN0YXJ0LFxuICAgICAgICBlbmQ6IGVuZEluZm8uZW5kLFxuICAgICAgICBzdGFydEluZm86IHN0YXJ0SW5mbyxcbiAgICAgICAgZGVjb2RlZENvZGVzOiBkZWNvZGVkQ29kZXNcbiAgICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVHdvT2ZGaXZlUmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci8yb2Y1X3JlYWRlci5qcyIsImltcG9ydCBCYXJjb2RlUmVhZGVyIGZyb20gJy4vYmFyY29kZV9yZWFkZXInO1xuXG5mdW5jdGlvbiBDb2RhYmFyUmVhZGVyKCkge1xuICAgIEJhcmNvZGVSZWFkZXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9jb3VudGVycyA9IFtdO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBBTFBIQUJFVEhfU1RSSU5HOiB7dmFsdWU6IFwiMDEyMzQ1Njc4OS0kOi8uK0FCQ0RcIn0sXG4gICAgQUxQSEFCRVQ6IHt2YWx1ZTogWzQ4LCA0OSwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA0NSwgMzYsIDU4LCA0NywgNDYsIDQzLCA2NSwgNjYsIDY3LCA2OF19LFxuICAgIENIQVJBQ1RFUl9FTkNPRElOR1M6IHt2YWx1ZTogWzB4MDAzLCAweDAwNiwgMHgwMDksIDB4MDYwLCAweDAxMiwgMHgwNDIsIDB4MDIxLCAweDAyNCwgMHgwMzAsIDB4MDQ4LCAweDAwYywgMHgwMTgsXG4gICAgICAgIDB4MDQ1LCAweDA1MSwgMHgwNTQsIDB4MDE1LCAweDAxQSwgMHgwMjksIDB4MDBCLCAweDAwRV19LFxuICAgIFNUQVJUX0VORDoge3ZhbHVlOiBbMHgwMUEsIDB4MDI5LCAweDAwQiwgMHgwMEVdfSxcbiAgICBNSU5fRU5DT0RFRF9DSEFSUzoge3ZhbHVlOiA0fSxcbiAgICBNQVhfQUNDRVBUQUJMRToge3ZhbHVlOiAyLjB9LFxuICAgIFBBRERJTkc6IHt2YWx1ZTogMS41fSxcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJjb2RhYmFyXCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2RhYmFyUmVhZGVyO1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGRlY29kZWRDaGFyLFxuICAgICAgICBwYXR0ZXJuLFxuICAgICAgICBuZXh0U3RhcnQsXG4gICAgICAgIGVuZDtcblxuICAgIHRoaXMuX2NvdW50ZXJzID0gc2VsZi5fZmlsbENvdW50ZXJzKCk7XG4gICAgc3RhcnQgPSBzZWxmLl9maW5kU3RhcnQoKTtcbiAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBuZXh0U3RhcnQgPSBzdGFydC5zdGFydENvdW50ZXI7XG5cbiAgICBkbyB7XG4gICAgICAgIHBhdHRlcm4gPSBzZWxmLl90b1BhdHRlcm4obmV4dFN0YXJ0KTtcbiAgICAgICAgaWYgKHBhdHRlcm4gPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkQ2hhciA9IHNlbGYuX3BhdHRlcm5Ub0NoYXIocGF0dGVybik7XG4gICAgICAgIGlmIChkZWNvZGVkQ2hhciA8IDApe1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZGVjb2RlZENoYXIpO1xuICAgICAgICBuZXh0U3RhcnQgKz0gODtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPiAxICYmIHNlbGYuX2lzU3RhcnRFbmQocGF0dGVybikpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSB3aGlsZSAobmV4dFN0YXJ0IDwgc2VsZi5fY291bnRlcnMubGVuZ3RoKTtcblxuICAgIC8vIHZlcmlmeSBlbmRcbiAgICBpZiAoKHJlc3VsdC5sZW5ndGggLSAyKSA8IHNlbGYuTUlOX0VOQ09ERURfQ0hBUlMgfHwgIXNlbGYuX2lzU3RhcnRFbmQocGF0dGVybikpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gdmVyaWZ5IGVuZCB3aGl0ZSBzcGFjZVxuICAgIGlmICghc2VsZi5fdmVyaWZ5V2hpdGVzcGFjZShzdGFydC5zdGFydENvdW50ZXIsIG5leHRTdGFydCAtIDgpKXtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLl92YWxpZGF0ZVJlc3VsdChyZXN1bHQsIHN0YXJ0LnN0YXJ0Q291bnRlcikpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBuZXh0U3RhcnQgPSBuZXh0U3RhcnQgPiBzZWxmLl9jb3VudGVycy5sZW5ndGggPyBzZWxmLl9jb3VudGVycy5sZW5ndGggOiBuZXh0U3RhcnQ7XG4gICAgZW5kID0gc3RhcnQuc3RhcnQgKyBzZWxmLl9zdW1Db3VudGVycyhzdGFydC5zdGFydENvdW50ZXIsIG5leHRTdGFydCAtIDgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIHN0YXJ0OiBzdGFydC5zdGFydCxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIHN0YXJ0SW5mbzogc3RhcnQsXG4gICAgICAgIGRlY29kZWRDb2RlczogcmVzdWx0XG4gICAgfTtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlXaGl0ZXNwYWNlID0gZnVuY3Rpb24oc3RhcnRDb3VudGVyLCBlbmRDb3VudGVyKSB7XG4gICAgaWYgKChzdGFydENvdW50ZXIgLSAxIDw9IDApXG4gICAgICAgICAgICB8fCB0aGlzLl9jb3VudGVyc1tzdGFydENvdW50ZXIgLSAxXSA+PSAodGhpcy5fY2FsY3VsYXRlUGF0dGVybkxlbmd0aChzdGFydENvdW50ZXIpIC8gMi4wKSkge1xuICAgICAgICBpZiAoKGVuZENvdW50ZXIgKyA4ID49IHRoaXMuX2NvdW50ZXJzLmxlbmd0aClcbiAgICAgICAgICAgICAgICB8fCB0aGlzLl9jb3VudGVyc1tlbmRDb3VudGVyICsgN10gPj0gKHRoaXMuX2NhbGN1bGF0ZVBhdHRlcm5MZW5ndGgoZW5kQ291bnRlcikgLyAyLjApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlUGF0dGVybkxlbmd0aCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgIHZhciBpLFxuICAgICAgICBzdW0gPSAwO1xuXG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgb2Zmc2V0ICsgNzsgaSsrKSB7XG4gICAgICAgIHN1bSArPSB0aGlzLl9jb3VudGVyc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VtO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3RocmVzaG9sZFJlc3VsdFBhdHRlcm4gPSBmdW5jdGlvbihyZXN1bHQsIHN0YXJ0Q291bnRlcil7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBjYXRlZ29yaXphdGlvbiA9IHtcbiAgICAgICAgICAgIHNwYWNlOiB7XG4gICAgICAgICAgICAgICAgbmFycm93OiB7IHNpemU6IDAsIGNvdW50czogMCwgbWluOiAwLCBtYXg6IE51bWJlci5NQVhfVkFMVUV9LFxuICAgICAgICAgICAgICAgIHdpZGU6IHtzaXplOiAwLCBjb3VudHM6IDAsIG1pbjogMCwgbWF4OiBOdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhcjoge1xuICAgICAgICAgICAgICAgIG5hcnJvdzogeyBzaXplOiAwLCBjb3VudHM6IDAsIG1pbjogMCwgbWF4OiBOdW1iZXIuTUFYX1ZBTFVFfSxcbiAgICAgICAgICAgICAgICB3aWRlOiB7IHNpemU6IDAsIGNvdW50czogMCwgbWluOiAwLCBtYXg6IE51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGtpbmQsXG4gICAgICAgIGNhdCxcbiAgICAgICAgaSxcbiAgICAgICAgaixcbiAgICAgICAgcG9zID0gc3RhcnRDb3VudGVyLFxuICAgICAgICBwYXR0ZXJuO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHJlc3VsdC5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHBhdHRlcm4gPSBzZWxmLl9jaGFyVG9QYXR0ZXJuKHJlc3VsdFtpXSk7XG4gICAgICAgIGZvciAoaiA9IDY7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICBraW5kID0gKGogJiAxKSA9PT0gMiA/IGNhdGVnb3JpemF0aW9uLmJhciA6IGNhdGVnb3JpemF0aW9uLnNwYWNlO1xuICAgICAgICAgICAgY2F0ID0gKHBhdHRlcm4gJiAxKSA9PT0gMSA/IGtpbmQud2lkZSA6IGtpbmQubmFycm93O1xuICAgICAgICAgICAgY2F0LnNpemUgKz0gc2VsZi5fY291bnRlcnNbcG9zICsgal07XG4gICAgICAgICAgICBjYXQuY291bnRzKys7XG4gICAgICAgICAgICBwYXR0ZXJuID4+PSAxO1xuICAgICAgICB9XG4gICAgICAgIHBvcyArPSA4O1xuICAgIH1cblxuICAgIFtcInNwYWNlXCIsIFwiYmFyXCJdLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhciBuZXdraW5kID0gY2F0ZWdvcml6YXRpb25ba2V5XTtcbiAgICAgICAgbmV3a2luZC53aWRlLm1pbiA9XG4gICAgICAgICAgICBNYXRoLmZsb29yKChuZXdraW5kLm5hcnJvdy5zaXplIC8gbmV3a2luZC5uYXJyb3cuY291bnRzICsgbmV3a2luZC53aWRlLnNpemUgLyBuZXdraW5kLndpZGUuY291bnRzKSAvIDIpO1xuICAgICAgICBuZXdraW5kLm5hcnJvdy5tYXggPSBNYXRoLmNlaWwobmV3a2luZC53aWRlLm1pbik7XG4gICAgICAgIG5ld2tpbmQud2lkZS5tYXggPSBNYXRoLmNlaWwoKG5ld2tpbmQud2lkZS5zaXplICogc2VsZi5NQVhfQUNDRVBUQUJMRSArIHNlbGYuUEFERElORykgLyBuZXdraW5kLndpZGUuY291bnRzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjYXRlZ29yaXphdGlvbjtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9jaGFyVG9QYXR0ZXJuID0gZnVuY3Rpb24oY2hhcikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY2hhckNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCksXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsZi5BTFBIQUJFVC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5BTFBIQUJFVFtpXSA9PT0gY2hhckNvZGUpe1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuQ0hBUkFDVEVSX0VOQ09ESU5HU1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMHgwO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3ZhbGlkYXRlUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0LCBzdGFydENvdW50ZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRocmVzaG9sZHMgPSBzZWxmLl90aHJlc2hvbGRSZXN1bHRQYXR0ZXJuKHJlc3VsdCwgc3RhcnRDb3VudGVyKSxcbiAgICAgICAgaSxcbiAgICAgICAgaixcbiAgICAgICAga2luZCxcbiAgICAgICAgY2F0LFxuICAgICAgICBzaXplLFxuICAgICAgICBwb3MgPSBzdGFydENvdW50ZXIsXG4gICAgICAgIHBhdHRlcm47XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhdHRlcm4gPSBzZWxmLl9jaGFyVG9QYXR0ZXJuKHJlc3VsdFtpXSk7XG4gICAgICAgIGZvciAoaiA9IDY7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICBraW5kID0gKGogJiAxKSA9PT0gMCA/IHRocmVzaG9sZHMuYmFyIDogdGhyZXNob2xkcy5zcGFjZTtcbiAgICAgICAgICAgIGNhdCA9IChwYXR0ZXJuICYgMSkgPT09IDEgPyBraW5kLndpZGUgOiBraW5kLm5hcnJvdztcbiAgICAgICAgICAgIHNpemUgPSBzZWxmLl9jb3VudGVyc1twb3MgKyBqXTtcbiAgICAgICAgICAgIGlmIChzaXplIDwgY2F0Lm1pbiB8fCBzaXplID4gY2F0Lm1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdHRlcm4gPj49IDE7XG4gICAgICAgIH1cbiAgICAgICAgcG9zICs9IDg7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3BhdHRlcm5Ub0NoYXIgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHNlbGYuQ0hBUkFDVEVSX0VOQ09ESU5HUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTW2ldID09PSBwYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShzZWxmLkFMUEhBQkVUW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fY29tcHV0ZUFsdGVybmF0aW5nVGhyZXNob2xkID0gZnVuY3Rpb24ob2Zmc2V0LCBlbmQpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgbWluID0gTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgbWF4ID0gMCxcbiAgICAgICAgY291bnRlcjtcblxuICAgIGZvciAoaSA9IG9mZnNldDsgaSA8IGVuZDsgaSArPSAyKXtcbiAgICAgICAgY291bnRlciA9IHRoaXMuX2NvdW50ZXJzW2ldO1xuICAgICAgICBpZiAoY291bnRlciA+IG1heCkge1xuICAgICAgICAgICAgbWF4ID0gY291bnRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY291bnRlciA8IG1pbikge1xuICAgICAgICAgICAgbWluID0gY291bnRlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoKG1pbiArIG1heCkgLyAyLjApIHwgMDtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl90b1BhdHRlcm4gPSBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICB2YXIgbnVtQ291bnRlcnMgPSA3LFxuICAgICAgICBlbmQgPSBvZmZzZXQgKyBudW1Db3VudGVycyxcbiAgICAgICAgYmFyVGhyZXNob2xkLFxuICAgICAgICBzcGFjZVRocmVzaG9sZCxcbiAgICAgICAgYml0bWFzayA9IDEgPDwgKG51bUNvdW50ZXJzIC0gMSksXG4gICAgICAgIHBhdHRlcm4gPSAwLFxuICAgICAgICBpLFxuICAgICAgICB0aHJlc2hvbGQ7XG5cbiAgICBpZiAoZW5kID4gdGhpcy5fY291bnRlcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBiYXJUaHJlc2hvbGQgPSB0aGlzLl9jb21wdXRlQWx0ZXJuYXRpbmdUaHJlc2hvbGQob2Zmc2V0LCBlbmQpO1xuICAgIHNwYWNlVGhyZXNob2xkID0gdGhpcy5fY29tcHV0ZUFsdGVybmF0aW5nVGhyZXNob2xkKG9mZnNldCArIDEsIGVuZCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ291bnRlcnM7IGkrKyl7XG4gICAgICAgIHRocmVzaG9sZCA9IChpICYgMSkgPT09IDAgPyBiYXJUaHJlc2hvbGQgOiBzcGFjZVRocmVzaG9sZDtcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZXJzW29mZnNldCArIGldID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBwYXR0ZXJuIHw9IGJpdG1hc2s7XG4gICAgICAgIH1cbiAgICAgICAgYml0bWFzayA+Pj0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0dGVybjtcbn07XG5cbkNvZGFiYXJSZWFkZXIucHJvdG90eXBlLl9pc1N0YXJ0RW5kID0gZnVuY3Rpb24ocGF0dGVybikge1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuU1RBUlRfRU5ELmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLlNUQVJUX0VORFtpXSA9PT0gcGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuQ29kYWJhclJlYWRlci5wcm90b3R5cGUuX3N1bUNvdW50ZXJzID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgIHZhciBpLFxuICAgICAgICBzdW0gPSAwO1xuXG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICBzdW0gKz0gdGhpcy5fY291bnRlcnNbaV07XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG5Db2RhYmFyUmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBpLFxuICAgICAgICBwYXR0ZXJuLFxuICAgICAgICBzdGFydCA9IHNlbGYuX25leHRVbnNldChzZWxmLl9yb3cpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKGkgPSAxOyBpIDwgdGhpcy5fY291bnRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGF0dGVybiA9IHNlbGYuX3RvUGF0dGVybihpKTtcbiAgICAgICAgaWYgKHBhdHRlcm4gIT09IC0xICYmIHNlbGYuX2lzU3RhcnRFbmQocGF0dGVybikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IExvb2sgZm9yIHdoaXRlc3BhY2UgYWhlYWRcbiAgICAgICAgICAgIHN0YXJ0ICs9IHNlbGYuX3N1bUNvdW50ZXJzKDAsIGkpO1xuICAgICAgICAgICAgZW5kID0gc3RhcnQgKyBzZWxmLl9zdW1Db3VudGVycyhpLCBpICsgOCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgICAgICAgICBzdGFydENvdW50ZXI6IGksXG4gICAgICAgICAgICAgICAgZW5kQ291bnRlcjogaSArIDhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2RhYmFyUmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9jb2RhYmFyX3JlYWRlci5qcyIsImltcG9ydCBCYXJjb2RlUmVhZGVyIGZyb20gJy4vYmFyY29kZV9yZWFkZXInO1xuXG5mdW5jdGlvbiBDb2RlMTI4UmVhZGVyKCkge1xuICAgIEJhcmNvZGVSZWFkZXIuY2FsbCh0aGlzKTtcbn1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgQ09ERV9TSElGVDoge3ZhbHVlOiA5OH0sXG4gICAgQ09ERV9DOiB7dmFsdWU6IDk5fSxcbiAgICBDT0RFX0I6IHt2YWx1ZTogMTAwfSxcbiAgICBDT0RFX0E6IHt2YWx1ZTogMTAxfSxcbiAgICBTVEFSVF9DT0RFX0E6IHt2YWx1ZTogMTAzfSxcbiAgICBTVEFSVF9DT0RFX0I6IHt2YWx1ZTogMTA0fSxcbiAgICBTVEFSVF9DT0RFX0M6IHt2YWx1ZTogMTA1fSxcbiAgICBTVE9QX0NPREU6IHt2YWx1ZTogMTA2fSxcbiAgICBDT0RFX1BBVFRFUk46IHt2YWx1ZTogW1xuICAgICAgICBbMiwgMSwgMiwgMiwgMiwgMl0sXG4gICAgICAgIFsyLCAyLCAyLCAxLCAyLCAyXSxcbiAgICAgICAgWzIsIDIsIDIsIDIsIDIsIDFdLFxuICAgICAgICBbMSwgMiwgMSwgMiwgMiwgM10sXG4gICAgICAgIFsxLCAyLCAxLCAzLCAyLCAyXSxcbiAgICAgICAgWzEsIDMsIDEsIDIsIDIsIDJdLFxuICAgICAgICBbMSwgMiwgMiwgMiwgMSwgM10sXG4gICAgICAgIFsxLCAyLCAyLCAzLCAxLCAyXSxcbiAgICAgICAgWzEsIDMsIDIsIDIsIDEsIDJdLFxuICAgICAgICBbMiwgMiwgMSwgMiwgMSwgM10sXG4gICAgICAgIFsyLCAyLCAxLCAzLCAxLCAyXSxcbiAgICAgICAgWzIsIDMsIDEsIDIsIDEsIDJdLFxuICAgICAgICBbMSwgMSwgMiwgMiwgMywgMl0sXG4gICAgICAgIFsxLCAyLCAyLCAxLCAzLCAyXSxcbiAgICAgICAgWzEsIDIsIDIsIDIsIDMsIDFdLFxuICAgICAgICBbMSwgMSwgMywgMiwgMiwgMl0sXG4gICAgICAgIFsxLCAyLCAzLCAxLCAyLCAyXSxcbiAgICAgICAgWzEsIDIsIDMsIDIsIDIsIDFdLFxuICAgICAgICBbMiwgMiwgMywgMiwgMSwgMV0sXG4gICAgICAgIFsyLCAyLCAxLCAxLCAzLCAyXSxcbiAgICAgICAgWzIsIDIsIDEsIDIsIDMsIDFdLFxuICAgICAgICBbMiwgMSwgMywgMiwgMSwgMl0sXG4gICAgICAgIFsyLCAyLCAzLCAxLCAxLCAyXSxcbiAgICAgICAgWzMsIDEsIDIsIDEsIDMsIDFdLFxuICAgICAgICBbMywgMSwgMSwgMiwgMiwgMl0sXG4gICAgICAgIFszLCAyLCAxLCAxLCAyLCAyXSxcbiAgICAgICAgWzMsIDIsIDEsIDIsIDIsIDFdLFxuICAgICAgICBbMywgMSwgMiwgMiwgMSwgMl0sXG4gICAgICAgIFszLCAyLCAyLCAxLCAxLCAyXSxcbiAgICAgICAgWzMsIDIsIDIsIDIsIDEsIDFdLFxuICAgICAgICBbMiwgMSwgMiwgMSwgMiwgM10sXG4gICAgICAgIFsyLCAxLCAyLCAzLCAyLCAxXSxcbiAgICAgICAgWzIsIDMsIDIsIDEsIDIsIDFdLFxuICAgICAgICBbMSwgMSwgMSwgMywgMiwgM10sXG4gICAgICAgIFsxLCAzLCAxLCAxLCAyLCAzXSxcbiAgICAgICAgWzEsIDMsIDEsIDMsIDIsIDFdLFxuICAgICAgICBbMSwgMSwgMiwgMywgMSwgM10sXG4gICAgICAgIFsxLCAzLCAyLCAxLCAxLCAzXSxcbiAgICAgICAgWzEsIDMsIDIsIDMsIDEsIDFdLFxuICAgICAgICBbMiwgMSwgMSwgMywgMSwgM10sXG4gICAgICAgIFsyLCAzLCAxLCAxLCAxLCAzXSxcbiAgICAgICAgWzIsIDMsIDEsIDMsIDEsIDFdLFxuICAgICAgICBbMSwgMSwgMiwgMSwgMywgM10sXG4gICAgICAgIFsxLCAxLCAyLCAzLCAzLCAxXSxcbiAgICAgICAgWzEsIDMsIDIsIDEsIDMsIDFdLFxuICAgICAgICBbMSwgMSwgMywgMSwgMiwgM10sXG4gICAgICAgIFsxLCAxLCAzLCAzLCAyLCAxXSxcbiAgICAgICAgWzEsIDMsIDMsIDEsIDIsIDFdLFxuICAgICAgICBbMywgMSwgMywgMSwgMiwgMV0sXG4gICAgICAgIFsyLCAxLCAxLCAzLCAzLCAxXSxcbiAgICAgICAgWzIsIDMsIDEsIDEsIDMsIDFdLFxuICAgICAgICBbMiwgMSwgMywgMSwgMSwgM10sXG4gICAgICAgIFsyLCAxLCAzLCAzLCAxLCAxXSxcbiAgICAgICAgWzIsIDEsIDMsIDEsIDMsIDFdLFxuICAgICAgICBbMywgMSwgMSwgMSwgMiwgM10sXG4gICAgICAgIFszLCAxLCAxLCAzLCAyLCAxXSxcbiAgICAgICAgWzMsIDMsIDEsIDEsIDIsIDFdLFxuICAgICAgICBbMywgMSwgMiwgMSwgMSwgM10sXG4gICAgICAgIFszLCAxLCAyLCAzLCAxLCAxXSxcbiAgICAgICAgWzMsIDMsIDIsIDEsIDEsIDFdLFxuICAgICAgICBbMywgMSwgNCwgMSwgMSwgMV0sXG4gICAgICAgIFsyLCAyLCAxLCA0LCAxLCAxXSxcbiAgICAgICAgWzQsIDMsIDEsIDEsIDEsIDFdLFxuICAgICAgICBbMSwgMSwgMSwgMiwgMiwgNF0sXG4gICAgICAgIFsxLCAxLCAxLCA0LCAyLCAyXSxcbiAgICAgICAgWzEsIDIsIDEsIDEsIDIsIDRdLFxuICAgICAgICBbMSwgMiwgMSwgNCwgMiwgMV0sXG4gICAgICAgIFsxLCA0LCAxLCAxLCAyLCAyXSxcbiAgICAgICAgWzEsIDQsIDEsIDIsIDIsIDFdLFxuICAgICAgICBbMSwgMSwgMiwgMiwgMSwgNF0sXG4gICAgICAgIFsxLCAxLCAyLCA0LCAxLCAyXSxcbiAgICAgICAgWzEsIDIsIDIsIDEsIDEsIDRdLFxuICAgICAgICBbMSwgMiwgMiwgNCwgMSwgMV0sXG4gICAgICAgIFsxLCA0LCAyLCAxLCAxLCAyXSxcbiAgICAgICAgWzEsIDQsIDIsIDIsIDEsIDFdLFxuICAgICAgICBbMiwgNCwgMSwgMiwgMSwgMV0sXG4gICAgICAgIFsyLCAyLCAxLCAxLCAxLCA0XSxcbiAgICAgICAgWzQsIDEsIDMsIDEsIDEsIDFdLFxuICAgICAgICBbMiwgNCwgMSwgMSwgMSwgMl0sXG4gICAgICAgIFsxLCAzLCA0LCAxLCAxLCAxXSxcbiAgICAgICAgWzEsIDEsIDEsIDIsIDQsIDJdLFxuICAgICAgICBbMSwgMiwgMSwgMSwgNCwgMl0sXG4gICAgICAgIFsxLCAyLCAxLCAyLCA0LCAxXSxcbiAgICAgICAgWzEsIDEsIDQsIDIsIDEsIDJdLFxuICAgICAgICBbMSwgMiwgNCwgMSwgMSwgMl0sXG4gICAgICAgIFsxLCAyLCA0LCAyLCAxLCAxXSxcbiAgICAgICAgWzQsIDEsIDEsIDIsIDEsIDJdLFxuICAgICAgICBbNCwgMiwgMSwgMSwgMSwgMl0sXG4gICAgICAgIFs0LCAyLCAxLCAyLCAxLCAxXSxcbiAgICAgICAgWzIsIDEsIDIsIDEsIDQsIDFdLFxuICAgICAgICBbMiwgMSwgNCwgMSwgMiwgMV0sXG4gICAgICAgIFs0LCAxLCAyLCAxLCAyLCAxXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDQsIDNdLFxuICAgICAgICBbMSwgMSwgMSwgMywgNCwgMV0sXG4gICAgICAgIFsxLCAzLCAxLCAxLCA0LCAxXSxcbiAgICAgICAgWzEsIDEsIDQsIDEsIDEsIDNdLFxuICAgICAgICBbMSwgMSwgNCwgMywgMSwgMV0sXG4gICAgICAgIFs0LCAxLCAxLCAxLCAxLCAzXSxcbiAgICAgICAgWzQsIDEsIDEsIDMsIDEsIDFdLFxuICAgICAgICBbMSwgMSwgMywgMSwgNCwgMV0sXG4gICAgICAgIFsxLCAxLCA0LCAxLCAzLCAxXSxcbiAgICAgICAgWzMsIDEsIDEsIDEsIDQsIDFdLFxuICAgICAgICBbNCwgMSwgMSwgMSwgMywgMV0sXG4gICAgICAgIFsyLCAxLCAxLCA0LCAxLCAyXSxcbiAgICAgICAgWzIsIDEsIDEsIDIsIDEsIDRdLFxuICAgICAgICBbMiwgMSwgMSwgMiwgMywgMl0sXG4gICAgICAgIFsyLCAzLCAzLCAxLCAxLCAxLCAyXVxuICAgIF19LFxuICAgIFNJTkdMRV9DT0RFX0VSUk9SOiB7dmFsdWU6IDAuNjR9LFxuICAgIEFWR19DT0RFX0VSUk9SOiB7dmFsdWU6IDAuMzB9LFxuICAgIEZPUk1BVDoge3ZhbHVlOiBcImNvZGVfMTI4XCIsIHdyaXRlYWJsZTogZmFsc2V9LFxuICAgIE1PRFVMRV9JTkRJQ0VTOiB7dmFsdWU6IHtiYXI6IFswLCAyLCA0XSwgc3BhY2U6IFsxLCAzLCA1XX19XG59O1xuXG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFyY29kZVJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuQ29kZTEyOFJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2RlMTI4UmVhZGVyO1xuXG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlQ29kZSA9IGZ1bmN0aW9uKHN0YXJ0LCBjb3JyZWN0aW9uKSB7XG4gICAgdmFyIGNvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBvZmZzZXQgPSBzdGFydCxcbiAgICAgICAgaXNXaGl0ZSA9ICFzZWxmLl9yb3dbb2Zmc2V0XSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHN0YXJ0LFxuICAgICAgICAgICAgY29ycmVjdGlvbjoge1xuICAgICAgICAgICAgICAgIGJhcjogMSxcbiAgICAgICAgICAgICAgICBzcGFjZTogMVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb2RlLFxuICAgICAgICBlcnJvcjtcblxuICAgIGZvciAoIGkgPSBvZmZzZXQ7IGkgPCBzZWxmLl9yb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3Jvd1tpXSBeIGlzV2hpdGUpIHtcbiAgICAgICAgICAgIGNvdW50ZXJbY291bnRlclBvc10rKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb3VudGVyUG9zID09PSBjb3VudGVyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29ycmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9jb3JyZWN0KGNvdW50ZXIsIGNvcnJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGNvZGUgPSAwOyBjb2RlIDwgc2VsZi5DT0RFX1BBVFRFUk4ubGVuZ3RoOyBjb2RlKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBzZWxmLl9tYXRjaFBhdHRlcm4oY291bnRlciwgc2VsZi5DT0RFX1BBVFRFUk5bY29kZV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPCBiZXN0TWF0Y2guZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb2RlID0gY29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgIGlmIChiZXN0TWF0Y2guY29kZSA9PT0gLTEgfHwgYmVzdE1hdGNoLmVycm9yID4gc2VsZi5BVkdfQ09ERV9FUlJPUikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuQ09ERV9QQVRURVJOW2Jlc3RNYXRjaC5jb2RlXSkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guY29ycmVjdGlvbi5iYXIgPSBjYWxjdWxhdGVDb3JyZWN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5DT0RFX1BBVFRFUk5bYmVzdE1hdGNoLmNvZGVdLCBjb3VudGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5NT0RVTEVfSU5ESUNFUy5iYXIpO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guY29ycmVjdGlvbi5zcGFjZSA9IGNhbGN1bGF0ZUNvcnJlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkNPREVfUEFUVEVSTltiZXN0TWF0Y2guY29kZV0sIGNvdW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk1PRFVMRV9JTkRJQ0VTLnNwYWNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZS5fY29ycmVjdCA9IGZ1bmN0aW9uKGNvdW50ZXIsIGNvcnJlY3Rpb24pIHtcbiAgICB0aGlzLl9jb3JyZWN0QmFycyhjb3VudGVyLCBjb3JyZWN0aW9uLmJhciwgdGhpcy5NT0RVTEVfSU5ESUNFUy5iYXIpO1xuICAgIHRoaXMuX2NvcnJlY3RCYXJzKGNvdW50ZXIsIGNvcnJlY3Rpb24uc3BhY2UsIHRoaXMuTU9EVUxFX0lORElDRVMuc3BhY2UpO1xufTtcblxuQ29kZTEyOFJlYWRlci5wcm90b3R5cGUuX2ZpbmRTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3VudGVyID0gWzAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBpLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBpc1doaXRlID0gZmFsc2UsXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBiZXN0TWF0Y2ggPSB7XG4gICAgICAgICAgICBlcnJvcjogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgIGNvZGU6IC0xLFxuICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICBlbmQ6IDAsXG4gICAgICAgICAgICBjb3JyZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgYmFyOiAxLFxuICAgICAgICAgICAgICAgIHNwYWNlOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvZGUsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBqLFxuICAgICAgICBzdW07XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29kZSA9IHNlbGYuU1RBUlRfQ09ERV9BOyBjb2RlIDw9IHNlbGYuU1RBUlRfQ09ERV9DOyBjb2RlKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBzZWxmLl9tYXRjaFBhdHRlcm4oY291bnRlciwgc2VsZi5DT0RFX1BBVFRFUk5bY29kZV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPCBiZXN0TWF0Y2guZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5jb2RlID0gY29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiZXN0TWF0Y2guZXJyb3IgPCBzZWxmLkFWR19DT0RFX0VSUk9SKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5zdGFydCA9IGkgLSBzdW07XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lbmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guY29ycmVjdGlvbi5iYXIgPSBjYWxjdWxhdGVDb3JyZWN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5DT0RFX1BBVFRFUk5bYmVzdE1hdGNoLmNvZGVdLCBjb3VudGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5NT0RVTEVfSU5ESUNFUy5iYXIpO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guY29ycmVjdGlvbi5zcGFjZSA9IGNhbGN1bGF0ZUNvcnJlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkNPREVfUEFUVEVSTltiZXN0TWF0Y2guY29kZV0sIGNvdW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk1PRFVMRV9JTkRJQ0VTLnNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2pdID0gY291bnRlcltqICsgMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvdW50ZXJbNF0gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJbNV0gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5Db2RlMTI4UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBzdGFydEluZm8gPSBzZWxmLl9maW5kU3RhcnQoKSxcbiAgICAgICAgY29kZSA9IG51bGwsXG4gICAgICAgIGRvbmUgPSBmYWxzZSxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIG11bHRpcGxpZXIgPSAwLFxuICAgICAgICBjaGVja3N1bSA9IDAsXG4gICAgICAgIGNvZGVzZXQsXG4gICAgICAgIHJhd1Jlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXSxcbiAgICAgICAgc2hpZnROZXh0ID0gZmFsc2UsXG4gICAgICAgIHVuc2hpZnQsXG4gICAgICAgIHJlbW92ZUxhc3RDaGFyYWN0ZXIgPSB0cnVlO1xuXG4gICAgaWYgKHN0YXJ0SW5mbyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29kZSA9IHtcbiAgICAgICAgY29kZTogc3RhcnRJbmZvLmNvZGUsXG4gICAgICAgIHN0YXJ0OiBzdGFydEluZm8uc3RhcnQsXG4gICAgICAgIGVuZDogc3RhcnRJbmZvLmVuZCxcbiAgICAgICAgY29ycmVjdGlvbjoge1xuICAgICAgICAgICAgYmFyOiBzdGFydEluZm8uY29ycmVjdGlvbi5iYXIsXG4gICAgICAgICAgICBzcGFjZTogc3RhcnRJbmZvLmNvcnJlY3Rpb24uc3BhY2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgY2hlY2tzdW0gPSBjb2RlLmNvZGU7XG4gICAgc3dpdGNoIChjb2RlLmNvZGUpIHtcbiAgICBjYXNlIHNlbGYuU1RBUlRfQ09ERV9BOlxuICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0E7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2Ugc2VsZi5TVEFSVF9DT0RFX0I6XG4gICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQjtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBzZWxmLlNUQVJUX0NPREVfQzpcbiAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9DO1xuICAgICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB3aGlsZSAoIWRvbmUpIHtcbiAgICAgICAgdW5zaGlmdCA9IHNoaWZ0TmV4dDtcbiAgICAgICAgc2hpZnROZXh0ID0gZmFsc2U7XG4gICAgICAgIGNvZGUgPSBzZWxmLl9kZWNvZGVDb2RlKGNvZGUuZW5kLCBjb2RlLmNvcnJlY3Rpb24pO1xuICAgICAgICBpZiAoY29kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGNvZGUuY29kZSAhPT0gc2VsZi5TVE9QX0NPREUpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVMYXN0Q2hhcmFjdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvZGUuY29kZSAhPT0gc2VsZi5TVE9QX0NPREUpIHtcbiAgICAgICAgICAgICAgICByYXdSZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgICAgICAgICAgICAgIG11bHRpcGxpZXIrKztcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSBtdWx0aXBsaWVyICogY29kZS5jb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY29kZXNldCkge1xuICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQTpcbiAgICAgICAgICAgICAgICBpZiAoY29kZS5jb2RlIDwgNjQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSgzMiArIGNvZGUuY29kZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5jb2RlIDwgOTYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlLmNvZGUgLSA2NCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLmNvZGUgIT09IHNlbGYuU1RPUF9DT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVMYXN0Q2hhcmFjdGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb2RlLmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfU0hJRlQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGlmdE5leHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9CO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0I6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0I7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkNPREVfQzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuU1RPUF9DT0RFOlxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0I6XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUuY29kZSA8IDk2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoMzIgKyBjb2RlLmNvZGUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZS5jb2RlICE9PSBzZWxmLlNUT1BfQ09ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGFzdENoYXJhY3RlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZS5jb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX1NISUZUOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpZnROZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVzZXQgPSBzZWxmLkNPREVfQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9BOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9BO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0M6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0M7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLlNUT1BfQ09ERTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9DOlxuICAgICAgICAgICAgICAgIGlmIChjb2RlLmNvZGUgPCAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlIDwgMTAgPyBcIjBcIiArIGNvZGUuY29kZSA6IGNvZGUuY29kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuY29kZSAhPT0gc2VsZi5TVE9QX0NPREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUxhc3RDaGFyYWN0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUuY29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuQ09ERV9BOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZXNldCA9IHNlbGYuQ09ERV9BO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5DT0RFX0I6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2Rlc2V0ID0gc2VsZi5DT0RFX0I7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLlNUT1BfQ09ERTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodW5zaGlmdCkge1xuICAgICAgICAgICAgY29kZXNldCA9IGNvZGVzZXQgPT09IHNlbGYuQ09ERV9BID8gc2VsZi5DT0RFX0IgOiBzZWxmLkNPREVfQTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvZGUuZW5kID0gc2VsZi5fbmV4dFVuc2V0KHNlbGYuX3JvdywgY29kZS5lbmQpO1xuICAgIGlmICghc2VsZi5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlKGNvZGUpKXtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY2hlY2tzdW0gLT0gbXVsdGlwbGllciAqIHJhd1Jlc3VsdFtyYXdSZXN1bHQubGVuZ3RoIC0gMV07XG4gICAgaWYgKGNoZWNrc3VtICUgMTAzICE9PSByYXdSZXN1bHRbcmF3UmVzdWx0Lmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgbGFzdCBjb2RlIGZyb20gcmVzdWx0IChjaGVja3N1bSlcbiAgICBpZiAocmVtb3ZlTGFzdENoYXJhY3Rlcikge1xuICAgICAgICByZXN1bHQuc3BsaWNlKHJlc3VsdC5sZW5ndGggLSAxLCAxKTtcbiAgICB9XG5cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBzdGFydDogc3RhcnRJbmZvLnN0YXJ0LFxuICAgICAgICBlbmQ6IGNvZGUuZW5kLFxuICAgICAgICBjb2Rlc2V0OiBjb2Rlc2V0LFxuICAgICAgICBzdGFydEluZm86IHN0YXJ0SW5mbyxcbiAgICAgICAgZGVjb2RlZENvZGVzOiBkZWNvZGVkQ29kZXMsXG4gICAgICAgIGVuZEluZm86IGNvZGVcbiAgICB9O1xufTtcblxuXG5CYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fdmVyaWZ5VHJhaWxpbmdXaGl0ZXNwYWNlID0gZnVuY3Rpb24oZW5kSW5mbykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kO1xuXG4gICAgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kID0gZW5kSW5mby5lbmQgKyAoKGVuZEluZm8uZW5kIC0gZW5kSW5mby5zdGFydCkgLyAyKTtcbiAgICBpZiAodHJhaWxpbmdXaGl0ZXNwYWNlRW5kIDwgc2VsZi5fcm93Lmxlbmd0aCkge1xuICAgICAgICBpZiAoc2VsZi5fbWF0Y2hSYW5nZShlbmRJbmZvLmVuZCwgdHJhaWxpbmdXaGl0ZXNwYWNlRW5kLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVuZEluZm87XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5mdW5jdGlvbiBjYWxjdWxhdGVDb3JyZWN0aW9uKGV4cGVjdGVkLCBub3JtYWxpemVkLCBpbmRpY2VzKSB7XG4gICAgdmFyIGxlbmd0aCA9IGluZGljZXMubGVuZ3RoLFxuICAgICAgICBzdW1Ob3JtYWxpemVkID0gMCxcbiAgICAgICAgc3VtRXhwZWN0ZWQgPSAwO1xuXG4gICAgd2hpbGUobGVuZ3RoLS0pIHtcbiAgICAgICAgc3VtRXhwZWN0ZWQgKz0gZXhwZWN0ZWRbaW5kaWNlc1tsZW5ndGhdXTtcbiAgICAgICAgc3VtTm9ybWFsaXplZCArPSBub3JtYWxpemVkW2luZGljZXNbbGVuZ3RoXV07XG4gICAgfVxuICAgIHJldHVybiBzdW1FeHBlY3RlZC9zdW1Ob3JtYWxpemVkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBDb2RlMTI4UmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9jb2RlXzEyOF9yZWFkZXIuanMiLCJpbXBvcnQgQ29kZTM5UmVhZGVyIGZyb20gJy4vY29kZV8zOV9yZWFkZXInO1xuXG5mdW5jdGlvbiBDb2RlMzlWSU5SZWFkZXIoKSB7XG4gICAgQ29kZTM5UmVhZGVyLmNhbGwodGhpcyk7XG59XG5cbnZhciBwYXR0ZXJucyA9IHtcbiAgICBJT1E6IC9bSU9RXS9nLFxuICAgIEFaMDk6IC9bQS1aMC05XXsxN30vXG59O1xuXG5Db2RlMzlWSU5SZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb2RlMzlSZWFkZXIucHJvdG90eXBlKTtcbkNvZGUzOVZJTlJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2RlMzlWSU5SZWFkZXI7XG5cbi8vIENyaWJiZWQgZnJvbTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96eGluZy96eGluZy9ibG9iL21hc3Rlci9jb3JlL3NyYy9tYWluL2phdmEvY29tL2dvb2dsZS96eGluZy9jbGllbnQvcmVzdWx0L1ZJTlJlc3VsdFBhcnNlci5qYXZhXG5Db2RlMzlWSU5SZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gQ29kZTM5UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlLmFwcGx5KHRoaXMpO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjb2RlID0gcmVzdWx0LmNvZGU7XG5cbiAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZShwYXR0ZXJucy5JT1EsICcnKTtcblxuICAgIGlmICghY29kZS5tYXRjaChwYXR0ZXJucy5BWjA5KSkge1xuICAgICAgICBpZiAoRU5WLmRldmVsb3BtZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIEFaMDkgcGF0dGVybiBjb2RlOicsIGNvZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fY2hlY2tDaGVja3N1bShjb2RlKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXN1bHQuY29kZSA9IGNvZGU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkNvZGUzOVZJTlJlYWRlci5wcm90b3R5cGUuX2NoZWNrQ2hlY2tzdW0gPSBmdW5jdGlvbihjb2RlKSB7XG4gICAgLy8gVE9ET1xuICAgIHJldHVybiAhIWNvZGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2RlMzlWSU5SZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2NvZGVfMzlfdmluX3JlYWRlci5qcyIsImltcG9ydCBCYXJjb2RlUmVhZGVyIGZyb20gJy4vYmFyY29kZV9yZWFkZXInO1xuaW1wb3J0IEFycmF5SGVscGVyIGZyb20gJy4uL2NvbW1vbi9hcnJheV9oZWxwZXInO1xuXG5mdW5jdGlvbiBDb2RlOTNSZWFkZXIoKSB7XG4gICAgQmFyY29kZVJlYWRlci5jYWxsKHRoaXMpO1xufVxuXG5jb25zdCBBTFBIQUJFVEhfU1RSSU5HID0gXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVotLiAkLyslYWJjZCpcIjtcblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgQUxQSEFCRVRIX1NUUklORzoge3ZhbHVlOiBBTFBIQUJFVEhfU1RSSU5HfSxcbiAgICBBTFBIQUJFVDoge3ZhbHVlOiBBTFBIQUJFVEhfU1RSSU5HLnNwbGl0KCcnKS5tYXAoY2hhciA9PiBjaGFyLmNoYXJDb2RlQXQoMCkpfSxcbiAgICBDSEFSQUNURVJfRU5DT0RJTkdTOiB7dmFsdWU6IFtcbiAgICAgICAgMHgxMTQsIDB4MTQ4LCAweDE0NCwgMHgxNDIsIDB4MTI4LCAweDEyNCwgMHgxMjIsIDB4MTUwLCAweDExMiwgMHgxMEEsXG4gICAgICAgIDB4MUE4LCAweDFBNCwgMHgxQTIsIDB4MTk0LCAweDE5MiwgMHgxOEEsIDB4MTY4LCAweDE2NCwgMHgxNjIsIDB4MTM0LFxuICAgICAgICAweDExQSwgMHgxNTgsIDB4MTRDLCAweDE0NiwgMHgxMkMsIDB4MTE2LCAweDFCNCwgMHgxQjIsIDB4MUFDLCAweDFBNixcbiAgICAgICAgMHgxOTYsIDB4MTlBLCAweDE2QywgMHgxNjYsIDB4MTM2LCAweDEzQSwgMHgxMkUsIDB4MUQ0LCAweDFEMiwgMHgxQ0EsXG4gICAgICAgIDB4MTZFLCAweDE3NiwgMHgxQUUsIDB4MTI2LCAweDFEQSwgMHgxRDYsIDB4MTMyLCAweDE1RVxuICAgIF19LFxuICAgIEFTVEVSSVNLOiB7dmFsdWU6IDB4MTVFfSxcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJjb2RlXzkzXCIsIHdyaXRlYWJsZTogZmFsc2V9XG59O1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXJjb2RlUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29kZTkzUmVhZGVyO1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvdW50ZXJzID0gWzAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgc3RhcnQgPSBzZWxmLl9maW5kU3RhcnQoKSxcbiAgICAgICAgZGVjb2RlZENoYXIsXG4gICAgICAgIGxhc3RTdGFydCxcbiAgICAgICAgcGF0dGVybixcbiAgICAgICAgbmV4dFN0YXJ0O1xuXG4gICAgaWYgKCFzdGFydCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbmV4dFN0YXJ0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3csIHN0YXJ0LmVuZCk7XG5cbiAgICBkbyB7XG4gICAgICAgIGNvdW50ZXJzID0gc2VsZi5fdG9Db3VudGVycyhuZXh0U3RhcnQsIGNvdW50ZXJzKTtcbiAgICAgICAgcGF0dGVybiA9IHNlbGYuX3RvUGF0dGVybihjb3VudGVycyk7XG4gICAgICAgIGlmIChwYXR0ZXJuIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGVjb2RlZENoYXIgPSBzZWxmLl9wYXR0ZXJuVG9DaGFyKHBhdHRlcm4pO1xuICAgICAgICBpZiAoZGVjb2RlZENoYXIgPCAwKXtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGRlY29kZWRDaGFyKTtcbiAgICAgICAgbGFzdFN0YXJ0ID0gbmV4dFN0YXJ0O1xuICAgICAgICBuZXh0U3RhcnQgKz0gQXJyYXlIZWxwZXIuc3VtKGNvdW50ZXJzKTtcbiAgICAgICAgbmV4dFN0YXJ0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3csIG5leHRTdGFydCk7XG4gICAgfSB3aGlsZSAoZGVjb2RlZENoYXIgIT09ICcqJyk7XG4gICAgcmVzdWx0LnBvcCgpO1xuXG4gICAgaWYgKCFyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghc2VsZi5fdmVyaWZ5RW5kKGxhc3RTdGFydCwgbmV4dFN0YXJ0LCBjb3VudGVycykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLl92ZXJpZnlDaGVja3N1bXMocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxlbmd0aCAtIDIpO1xuICAgIGlmICgocmVzdWx0ID0gc2VsZi5fZGVjb2RlRXh0ZW5kZWQocmVzdWx0KSkgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBzdGFydDogc3RhcnQuc3RhcnQsXG4gICAgICAgIGVuZDogbmV4dFN0YXJ0LFxuICAgICAgICBzdGFydEluZm86IHN0YXJ0LFxuICAgICAgICBkZWNvZGVkQ29kZXM6IHJlc3VsdFxuICAgIH07XG59O1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlFbmQgPSBmdW5jdGlvbihsYXN0U3RhcnQsIG5leHRTdGFydCkge1xuICAgIGlmIChsYXN0U3RhcnQgPT09IG5leHRTdGFydCB8fCAhdGhpcy5fcm93W25leHRTdGFydF0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX3BhdHRlcm5Ub0NoYXIgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHNlbGYuQ0hBUkFDVEVSX0VOQ09ESU5HUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5DSEFSQUNURVJfRU5DT0RJTkdTW2ldID09PSBwYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShzZWxmLkFMUEhBQkVUW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLl90b1BhdHRlcm4gPSBmdW5jdGlvbihjb3VudGVycykge1xuICAgIGNvbnN0IG51bUNvdW50ZXJzID0gY291bnRlcnMubGVuZ3RoO1xuICAgIGxldCBwYXR0ZXJuID0gMDtcbiAgICBsZXQgc3VtID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNvdW50ZXJzOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGNvdW50ZXJzW2ldO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ291bnRlcnM7IGkrKykge1xuICAgICAgICBsZXQgbm9ybWFsaXplZCA9IE1hdGgucm91bmQoY291bnRlcnNbaV0gKiA5IC8gc3VtKTtcbiAgICAgICAgaWYgKG5vcm1hbGl6ZWQgPCAxIHx8IG5vcm1hbGl6ZWQgPiA0KSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChpICYgMSkgPT09IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9ybWFsaXplZDsgaisrKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IChwYXR0ZXJuIDw8IDEpIHwgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdHRlcm4gPDw9IG5vcm1hbGl6ZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGF0dGVybjtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX2ZpbmRTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgb2Zmc2V0ID0gc2VsZi5fbmV4dFNldChzZWxmLl9yb3cpLFxuICAgICAgICBwYXR0ZXJuU3RhcnQgPSBvZmZzZXQsXG4gICAgICAgIGNvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIGNvdW50ZXJQb3MgPSAwLFxuICAgICAgICBpc1doaXRlID0gZmFsc2UsXG4gICAgICAgIGksXG4gICAgICAgIGosXG4gICAgICAgIHdoaXRlU3BhY2VNdXN0U3RhcnQ7XG5cbiAgICBmb3IgKCBpID0gb2Zmc2V0OyBpIDwgc2VsZi5fcm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9yb3dbaV0gXiBpc1doaXRlKSB7XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY291bnRlclBvcyA9PT0gY291bnRlci5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gZmluZCBzdGFydCBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX3RvUGF0dGVybihjb3VudGVyKSA9PT0gc2VsZi5BU1RFUklTSykge1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlTXVzdFN0YXJ0ID0gTWF0aC5mbG9vcihNYXRoLm1heCgwLCBwYXR0ZXJuU3RhcnQgLSAoKGkgLSBwYXR0ZXJuU3RhcnQpIC8gNCkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX21hdGNoUmFuZ2Uod2hpdGVTcGFjZU11c3RTdGFydCwgcGF0dGVyblN0YXJ0LCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogcGF0dGVyblN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogaVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhdHRlcm5TdGFydCArPSBjb3VudGVyWzBdICsgY291bnRlclsxXTtcbiAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2pdID0gY291bnRlcltqICsgMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvdW50ZXJbNF0gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJbNV0gPSAwO1xuICAgICAgICAgICAgICAgIGNvdW50ZXJQb3MtLTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnRlclBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSA9IDE7XG4gICAgICAgICAgICBpc1doaXRlID0gIWlzV2hpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVFeHRlbmRlZCA9IGZ1bmN0aW9uKGNoYXJBcnJheSkge1xuICAgIGNvbnN0IGxlbmd0aCA9IGNoYXJBcnJheS5sZW5ndGg7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGFyID0gY2hhckFycmF5W2ldO1xuICAgICAgICBpZiAoY2hhciA+PSAnYScgJiYgY2hhciA8PSAnZCcpIHtcbiAgICAgICAgICAgIGlmIChpID4gKGxlbmd0aCAtIDIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXh0Q2hhciA9IGNoYXJBcnJheVsrK2ldO1xuICAgICAgICAgICAgY29uc3QgbmV4dENoYXJDb2RlID0gbmV4dENoYXIuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGxldCBkZWNvZGVkQ2hhcjtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgaWYgKG5leHRDaGFyID49ICdBJyAmJiBuZXh0Q2hhciA8PSAnWicpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjb2RlZENoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHRDaGFyQ29kZSAtIDY0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICAgICAgICBpZiAobmV4dENoYXIgPj0gJ0EnICYmIG5leHRDaGFyIDw9ICdFJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlIC0gMzgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dENoYXIgPj0gJ0YnICYmIG5leHRDaGFyIDw9ICdKJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlIC0gMTEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dENoYXIgPj0gJ0snICYmIG5leHRDaGFyIDw9ICdPJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlICsgMTYpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dENoYXIgPj0gJ1AnICYmIG5leHRDaGFyIDw9ICdTJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlICsgNDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dENoYXIgPj0gJ1QnICYmIG5leHRDaGFyIDw9ICdaJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMTI3KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICAgICAgICBpZiAobmV4dENoYXIgPj0gJ0EnICYmIG5leHRDaGFyIDw9ICdPJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlIC0gMzIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dENoYXIgPT09ICdaJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9ICc6JztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICBpZiAobmV4dENoYXIgPj0gJ0EnICYmIG5leHRDaGFyIDw9ICdaJykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlICsgMzIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRlY29kZWRDaGFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoYXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5Db2RlOTNSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlDaGVja3N1bXMgPSBmdW5jdGlvbihjaGFyQXJyYXkpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF0Y2hDaGVja0NoYXIoY2hhckFycmF5LCBjaGFyQXJyYXkubGVuZ3RoIC0gMiwgMjApXG4gICAgICAgICYmIHRoaXMuX21hdGNoQ2hlY2tDaGFyKGNoYXJBcnJheSwgY2hhckFycmF5Lmxlbmd0aCAtIDEsIDE1KTtcbn07XG5cbkNvZGU5M1JlYWRlci5wcm90b3R5cGUuX21hdGNoQ2hlY2tDaGFyID0gZnVuY3Rpb24oY2hhckFycmF5LCBpbmRleCwgbWF4V2VpZ2h0KSB7XG4gICAgY29uc3QgYXJyYXlUb0NoZWNrID0gY2hhckFycmF5LnNsaWNlKDAsIGluZGV4KTtcbiAgICBjb25zdCBsZW5ndGggPSBhcnJheVRvQ2hlY2subGVuZ3RoO1xuICAgIGNvbnN0IHdlaWdodGVkU3VtcyA9IGFycmF5VG9DaGVjay5yZWR1Y2UoKHN1bSwgY2hhciwgaSkgPT4ge1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSAoKChpICogLTEpICsgKGxlbmd0aCAtIDEpKSAlIG1heFdlaWdodCkgKyAxO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuQUxQSEFCRVQuaW5kZXhPZihjaGFyLmNoYXJDb2RlQXQoMCkpO1xuICAgICAgICByZXR1cm4gc3VtICsgKHdlaWdodCAqIHZhbHVlKTtcbiAgICB9LCAwKTtcblxuICAgIGNvbnN0IGNoZWNrQ2hhciA9IHRoaXMuQUxQSEFCRVRbKHdlaWdodGVkU3VtcyAlIDQ3KV07XG4gICAgcmV0dXJuIGNoZWNrQ2hhciA9PT0gY2hhckFycmF5W2luZGV4XS5jaGFyQ29kZUF0KDApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29kZTkzUmVhZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlYWRlci9jb2RlXzkzX3JlYWRlci5qcyIsImltcG9ydCBFQU5SZWFkZXIgZnJvbSAnLi9lYW5fcmVhZGVyJztcblxuZnVuY3Rpb24gRUFOMlJlYWRlcigpIHtcbiAgICBFQU5SZWFkZXIuY2FsbCh0aGlzKTtcbn1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgRk9STUFUOiB7dmFsdWU6IFwiZWFuXzJcIiwgd3JpdGVhYmxlOiBmYWxzZX1cbn07XG5cbkVBTjJSZWFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFQU5SZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkVBTjJSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRUFOMlJlYWRlcjtcblxuRUFOMlJlYWRlci5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24ocm93LCBzdGFydCkge1xuICAgIHRoaXMuX3JvdyA9IHJvdztcbiAgICB2YXIgY291bnRlcnMgPSBbMCwgMCwgMCwgMF0sXG4gICAgICAgIGNvZGVGcmVxdWVuY3kgPSAwLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgb2Zmc2V0ID0gc3RhcnQsXG4gICAgICAgIGVuZCA9IHRoaXMuX3Jvdy5sZW5ndGgsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCAyICYmIG9mZnNldCA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGNvZGUgPSB0aGlzLl9kZWNvZGVDb2RlKG9mZnNldCk7XG4gICAgICAgIGlmICghY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvZGUuY29kZSAlIDEwKTtcbiAgICAgICAgaWYgKGNvZGUuY29kZSA+PSB0aGlzLkNPREVfR19TVEFSVCkge1xuICAgICAgICAgICAgY29kZUZyZXF1ZW5jeSB8PSAxIDw8ICgxIC0gaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgIT0gMSkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5fbmV4dFNldCh0aGlzLl9yb3csIGNvZGUuZW5kKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHRoaXMuX25leHRVbnNldCh0aGlzLl9yb3csIG9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzdWx0Lmxlbmd0aCAhPSAyIHx8IChwYXJzZUludChyZXN1bHQuam9pbihcIlwiKSkgJSA0KSAgIT09IGNvZGVGcmVxdWVuY3kpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IHJlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgICBkZWNvZGVkQ29kZXMsXG4gICAgICAgIGVuZDogY29kZS5lbmRcbiAgICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRUFOMlJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvZWFuXzJfcmVhZGVyLmpzIiwiaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuL2Vhbl9yZWFkZXInO1xuXG5mdW5jdGlvbiBFQU41UmVhZGVyKCkge1xuICAgIEVBTlJlYWRlci5jYWxsKHRoaXMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJlYW5fNVwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuY29uc3QgQ0hFQ0tfRElHSVRfRU5DT0RJTkdTID0gWzI0LCAyMCwgMTgsIDE3LCAxMiwgNiwgMywgMTAsIDksIDVdO1xuXG5FQU41UmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRUFOUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5FQU41UmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVBTjVSZWFkZXI7XG5cbkVBTjVSZWFkZXIucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uKHJvdywgc3RhcnQpIHtcbiAgICB0aGlzLl9yb3cgPSByb3c7XG4gICAgdmFyIGNvdW50ZXJzID0gWzAsIDAsIDAsIDBdLFxuICAgICAgICBjb2RlRnJlcXVlbmN5ID0gMCxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIG9mZnNldCA9IHN0YXJ0LFxuICAgICAgICBlbmQgPSB0aGlzLl9yb3cubGVuZ3RoLFxuICAgICAgICBjb2RlLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgZGVjb2RlZENvZGVzID0gW107XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgNSAmJiBvZmZzZXQgPCBlbmQ7IGkrKykge1xuICAgICAgICBjb2RlID0gdGhpcy5fZGVjb2RlQ29kZShvZmZzZXQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUgJSAxMCk7XG4gICAgICAgIGlmIChjb2RlLmNvZGUgPj0gdGhpcy5DT0RFX0dfU1RBUlQpIHtcbiAgICAgICAgICAgIGNvZGVGcmVxdWVuY3kgfD0gMSA8PCAoNCAtIGkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpICE9IDQpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IHRoaXMuX25leHRTZXQodGhpcy5fcm93LCBjb2RlLmVuZCk7XG4gICAgICAgICAgICBvZmZzZXQgPSB0aGlzLl9uZXh0VW5zZXQodGhpcy5fcm93LCBvZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5sZW5ndGggIT0gNSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoZXh0ZW5zaW9uQ2hlY2tzdW0ocmVzdWx0KSAhPT0gZGV0ZXJtaW5lQ2hlY2tEaWdpdChjb2RlRnJlcXVlbmN5KSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmpvaW4oXCJcIiksXG4gICAgICAgIGRlY29kZWRDb2RlcyxcbiAgICAgICAgZW5kOiBjb2RlLmVuZFxuICAgIH07XG59O1xuXG5mdW5jdGlvbiBkZXRlcm1pbmVDaGVja0RpZ2l0KGNvZGVGcmVxdWVuY3kpIHtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBpZiAoY29kZUZyZXF1ZW5jeSA9PT0gQ0hFQ0tfRElHSVRfRU5DT0RJTkdTW2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuXG5mdW5jdGlvbiBleHRlbnNpb25DaGVja3N1bShyZXN1bHQpIHtcbiAgICB2YXIgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aCxcbiAgICAgICAgc3VtID0gMCxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IGxlbmd0aCAtIDI7IGkgPj0gMDsgaSAtPSAyKSB7XG4gICAgICAgIHN1bSArPSByZXN1bHRbaV07XG4gICAgfVxuICAgIHN1bSAqPSAzO1xuICAgIGZvciAoaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAyKSB7XG4gICAgICAgIHN1bSArPSByZXN1bHRbaV07XG4gICAgfVxuICAgIHN1bSAqPSAzO1xuICAgIHJldHVybiBzdW0gJSAxMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRUFONVJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvZWFuXzVfcmVhZGVyLmpzIiwiaW1wb3J0IEVBTlJlYWRlciBmcm9tICcuL2Vhbl9yZWFkZXInO1xuXG5mdW5jdGlvbiBFQU44UmVhZGVyKG9wdHMsIHN1cHBsZW1lbnRzKSB7XG4gICAgRUFOUmVhZGVyLmNhbGwodGhpcywgb3B0cywgc3VwcGxlbWVudHMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJlYW5fOFwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuRUFOOFJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVBTlJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuRUFOOFJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFQU44UmVhZGVyO1xuXG5FQU44UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKGNvZGUsIHJlc3VsdCwgZGVjb2RlZENvZGVzKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY29kZS5lbmQsIHNlbGYuQ09ERV9HX1NUQVJUKTtcbiAgICAgICAgaWYgKCFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2RlKTtcbiAgICB9XG5cbiAgICBjb2RlID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5NSURETEVfUEFUVEVSTiwgY29kZS5lbmQsIHRydWUsIGZhbHNlKTtcbiAgICBpZiAoY29kZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBjb2RlID0gc2VsZi5fZGVjb2RlQ29kZShjb2RlLmVuZCwgc2VsZi5DT0RFX0dfU1RBUlQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlY29kZWRDb2Rlcy5wdXNoKGNvZGUpO1xuICAgICAgICByZXN1bHQucHVzaChjb2RlLmNvZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjb2RlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRUFOOFJlYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9yZWFkZXIvZWFuXzhfcmVhZGVyLmpzIiwiaW1wb3J0IEJhcmNvZGVSZWFkZXIgZnJvbSAnLi9iYXJjb2RlX3JlYWRlcic7XG5pbXBvcnQge21lcmdlfSBmcm9tICdsb2Rhc2gnO1xuXG5mdW5jdGlvbiBJMm9mNVJlYWRlcihvcHRzKSB7XG4gICAgb3B0cyA9IG1lcmdlKGdldERlZmF1bENvbmZpZygpLCBvcHRzKTtcbiAgICBCYXJjb2RlUmVhZGVyLmNhbGwodGhpcywgb3B0cyk7XG4gICAgdGhpcy5iYXJTcGFjZVJhdGlvID0gWzEsIDFdO1xuICAgIGlmIChvcHRzLm5vcm1hbGl6ZUJhclNwYWNlV2lkdGgpIHtcbiAgICAgICAgdGhpcy5TSU5HTEVfQ09ERV9FUlJPUiA9IDAuMzg7XG4gICAgICAgIHRoaXMuQVZHX0NPREVfRVJST1IgPSAwLjA5O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsQ29uZmlnKCkge1xuICAgIHZhciBjb25maWcgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKEkyb2Y1UmVhZGVyLkNPTkZJR19LRVlTKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBjb25maWdba2V5XSA9IEkyb2Y1UmVhZGVyLkNPTkZJR19LRVlTW2tleV0uZGVmYXVsdDtcbiAgICB9KTtcbiAgICByZXR1cm4gY29uZmlnO1xufVxuXG52YXIgTiA9IDEsXG4gICAgVyA9IDMsXG4gICAgcHJvcGVydGllcyA9IHtcbiAgICAgICAgU1RBUlRfUEFUVEVSTjoge3ZhbHVlOiBbTiwgTiwgTiwgTl19LFxuICAgICAgICBTVE9QX1BBVFRFUk46IHt2YWx1ZTogW04sIE4sIFddfSxcbiAgICAgICAgQ09ERV9QQVRURVJOOiB7dmFsdWU6IFtcbiAgICAgICAgICAgIFtOLCBOLCBXLCBXLCBOXSxcbiAgICAgICAgICAgIFtXLCBOLCBOLCBOLCBXXSxcbiAgICAgICAgICAgIFtOLCBXLCBOLCBOLCBXXSxcbiAgICAgICAgICAgIFtXLCBXLCBOLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBOLCBXLCBOLCBXXSxcbiAgICAgICAgICAgIFtXLCBOLCBXLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBXLCBXLCBOLCBOXSxcbiAgICAgICAgICAgIFtOLCBOLCBOLCBXLCBXXSxcbiAgICAgICAgICAgIFtXLCBOLCBOLCBXLCBOXSxcbiAgICAgICAgICAgIFtOLCBXLCBOLCBXLCBOXVxuICAgICAgICBdfSxcbiAgICAgICAgU0lOR0xFX0NPREVfRVJST1I6IHt2YWx1ZTogMC43OCwgd3JpdGFibGU6IHRydWV9LFxuICAgICAgICBBVkdfQ09ERV9FUlJPUjoge3ZhbHVlOiAwLjI1LCB3cml0YWJsZTogdHJ1ZX0sXG4gICAgICAgIE1BWF9DT1JSRUNUSU9OX0ZBQ1RPUjoge3ZhbHVlOiA1fSxcbiAgICAgICAgRk9STUFUOiB7dmFsdWU6IFwiaTJvZjVcIn1cbiAgICB9O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhcmNvZGVSZWFkZXIucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEkyb2Y1UmVhZGVyO1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX21hdGNoUGF0dGVybiA9IGZ1bmN0aW9uKGNvdW50ZXIsIGNvZGUpIHtcbiAgICBpZiAodGhpcy5jb25maWcubm9ybWFsaXplQmFyU3BhY2VXaWR0aCkge1xuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIGNvdW50ZXJTdW0gPSBbMCwgMF0sXG4gICAgICAgICAgICBjb2RlU3VtID0gWzAsIDBdLFxuICAgICAgICAgICAgY29ycmVjdGlvbiA9IFswLCAwXSxcbiAgICAgICAgICAgIGNvcnJlY3Rpb25SYXRpbyA9IHRoaXMuTUFYX0NPUlJFQ1RJT05fRkFDVE9SLFxuICAgICAgICAgICAgY29ycmVjdGlvblJhdGlvSW52ZXJzZSA9IDEgLyBjb3JyZWN0aW9uUmF0aW87XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50ZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50ZXJTdW1baSAlIDJdICs9IGNvdW50ZXJbaV07XG4gICAgICAgICAgICBjb2RlU3VtW2kgJSAyXSArPSBjb2RlW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNvcnJlY3Rpb25bMF0gPSBjb2RlU3VtWzBdIC8gY291bnRlclN1bVswXTtcbiAgICAgICAgY29ycmVjdGlvblsxXSA9IGNvZGVTdW1bMV0gLyBjb3VudGVyU3VtWzFdO1xuXG4gICAgICAgIGNvcnJlY3Rpb25bMF0gPSBNYXRoLm1heChNYXRoLm1pbihjb3JyZWN0aW9uWzBdLCBjb3JyZWN0aW9uUmF0aW8pLCBjb3JyZWN0aW9uUmF0aW9JbnZlcnNlKTtcbiAgICAgICAgY29ycmVjdGlvblsxXSA9IE1hdGgubWF4KE1hdGgubWluKGNvcnJlY3Rpb25bMV0sIGNvcnJlY3Rpb25SYXRpbyksIGNvcnJlY3Rpb25SYXRpb0ludmVyc2UpO1xuICAgICAgICB0aGlzLmJhclNwYWNlUmF0aW8gPSBjb3JyZWN0aW9uO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY291bnRlcltpXSAqPSB0aGlzLmJhclNwYWNlUmF0aW9baSAlIDJdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBCYXJjb2RlUmVhZGVyLnByb3RvdHlwZS5fbWF0Y2hQYXR0ZXJuLmNhbGwodGhpcywgY291bnRlciwgY29kZSk7XG59O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX2ZpbmRQYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgb2Zmc2V0LCBpc1doaXRlLCB0cnlIYXJkZXIpIHtcbiAgICB2YXIgY291bnRlciA9IFtdLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgaSxcbiAgICAgICAgY291bnRlclBvcyA9IDAsXG4gICAgICAgIGJlc3RNYXRjaCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgY29kZTogLTEsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGVuZDogMFxuICAgICAgICB9LFxuICAgICAgICBlcnJvcixcbiAgICAgICAgaixcbiAgICAgICAgc3VtLFxuICAgICAgICBub3JtYWxpemVkLFxuICAgICAgICBlcHNpbG9uID0gc2VsZi5BVkdfQ09ERV9FUlJPUjtcblxuICAgIGlzV2hpdGUgPSBpc1doaXRlIHx8IGZhbHNlO1xuICAgIHRyeUhhcmRlciA9IHRyeUhhcmRlciB8fCBmYWxzZTtcblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICAgIG9mZnNldCA9IHNlbGYuX25leHRTZXQoc2VsZi5fcm93KTtcbiAgICB9XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY291bnRlcltpXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yICggaSA9IG9mZnNldDsgaSA8IHNlbGYuX3Jvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fcm93W2ldIF4gaXNXaGl0ZSkge1xuICAgICAgICAgICAgY291bnRlcltjb3VudGVyUG9zXSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXJQb3MgPT09IGNvdW50ZXIubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBjb3VudGVyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBjb3VudGVyW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaC5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guc3RhcnQgPSBpIC0gc3VtO1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2guZW5kID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRyeUhhcmRlcikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY291bnRlci5sZW5ndGggLSAyOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbal0gPSBjb3VudGVyW2ogKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMl0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyW2NvdW50ZXIubGVuZ3RoIC0gMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyUG9zLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyUG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyW2NvdW50ZXJQb3NdID0gMTtcbiAgICAgICAgICAgIGlzV2hpdGUgPSAhaXNXaGl0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZmluZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0LFxuICAgICAgICBvZmZzZXQgPSBzZWxmLl9uZXh0U2V0KHNlbGYuX3JvdyksXG4gICAgICAgIHN0YXJ0SW5mbyxcbiAgICAgICAgbmFycm93QmFyV2lkdGggPSAxO1xuXG4gICAgd2hpbGUgKCFzdGFydEluZm8pIHtcbiAgICAgICAgc3RhcnRJbmZvID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5TVEFSVF9QQVRURVJOLCBvZmZzZXQsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgaWYgKCFzdGFydEluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIG5hcnJvd0JhcldpZHRoID0gTWF0aC5mbG9vcigoc3RhcnRJbmZvLmVuZCAtIHN0YXJ0SW5mby5zdGFydCkgLyA0KTtcbiAgICAgICAgbGVhZGluZ1doaXRlc3BhY2VTdGFydCA9IHN0YXJ0SW5mby5zdGFydCAtIG5hcnJvd0JhcldpZHRoICogMTA7XG4gICAgICAgIGlmIChsZWFkaW5nV2hpdGVzcGFjZVN0YXJ0ID49IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGxlYWRpbmdXaGl0ZXNwYWNlU3RhcnQsIHN0YXJ0SW5mby5zdGFydCwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRJbmZvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9mZnNldCA9IHN0YXJ0SW5mby5lbmQ7XG4gICAgICAgIHN0YXJ0SW5mbyA9IG51bGw7XG4gICAgfVxufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UgPSBmdW5jdGlvbihlbmRJbmZvKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQ7XG5cbiAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQgPSBlbmRJbmZvLmVuZCArICgoZW5kSW5mby5lbmQgLSBlbmRJbmZvLnN0YXJ0KSAvIDIpO1xuICAgIGlmICh0cmFpbGluZ1doaXRlc3BhY2VFbmQgPCBzZWxmLl9yb3cubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGVuZEluZm8uZW5kLCB0cmFpbGluZ1doaXRlc3BhY2VFbmQsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5kSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZmluZEVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZW5kSW5mbyxcbiAgICAgICAgdG1wO1xuXG4gICAgc2VsZi5fcm93LnJldmVyc2UoKTtcbiAgICBlbmRJbmZvID0gc2VsZi5fZmluZFBhdHRlcm4oc2VsZi5TVE9QX1BBVFRFUk4pO1xuICAgIHNlbGYuX3Jvdy5yZXZlcnNlKCk7XG5cbiAgICBpZiAoZW5kSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyByZXZlcnNlIG51bWJlcnNcbiAgICB0bXAgPSBlbmRJbmZvLnN0YXJ0O1xuICAgIGVuZEluZm8uc3RhcnQgPSBzZWxmLl9yb3cubGVuZ3RoIC0gZW5kSW5mby5lbmQ7XG4gICAgZW5kSW5mby5lbmQgPSBzZWxmLl9yb3cubGVuZ3RoIC0gdG1wO1xuXG4gICAgcmV0dXJuIGVuZEluZm8gIT09IG51bGwgPyBzZWxmLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UoZW5kSW5mbykgOiBudWxsO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl9kZWNvZGVQYWlyID0gZnVuY3Rpb24oY291bnRlclBhaXIpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgY29kZSxcbiAgICAgICAgY29kZXMgPSBbXSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRlclBhaXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY291bnRlclBhaXJbaV0pO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvZGVzLnB1c2goY29kZSk7XG4gICAgfVxuICAgIHJldHVybiBjb2Rlcztcbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlQ29kZSA9IGZ1bmN0aW9uKGNvdW50ZXIpIHtcbiAgICB2YXIgaixcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIHN1bSA9IDAsXG4gICAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBlcHNpbG9uID0gc2VsZi5BVkdfQ09ERV9FUlJPUixcbiAgICAgICAgY29kZSxcbiAgICAgICAgYmVzdE1hdGNoID0ge1xuICAgICAgICAgICAgZXJyb3I6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZW5kOiAwXG4gICAgICAgIH07XG5cbiAgICBmb3IgKCBqID0gMDsgaiA8IGNvdW50ZXIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgc3VtICs9IGNvdW50ZXJbal07XG4gICAgfVxuICAgIGZvciAoY29kZSA9IDA7IGNvZGUgPCBzZWxmLkNPREVfUEFUVEVSTi5sZW5ndGg7IGNvZGUrKykge1xuICAgICAgICBlcnJvciA9IHNlbGYuX21hdGNoUGF0dGVybihjb3VudGVyLCBzZWxmLkNPREVfUEFUVEVSTltjb2RlXSk7XG4gICAgICAgIGlmIChlcnJvciA8IGJlc3RNYXRjaC5lcnJvcikge1xuICAgICAgICAgICAgYmVzdE1hdGNoLmNvZGUgPSBjb2RlO1xuICAgICAgICAgICAgYmVzdE1hdGNoLmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJlc3RNYXRjaC5lcnJvciA8IGVwc2lsb24pIHtcbiAgICAgICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgICB9XG59O1xuXG5JMm9mNVJlYWRlci5wcm90b3R5cGUuX2RlY29kZVBheWxvYWQgPSBmdW5jdGlvbihjb3VudGVycywgcmVzdWx0LCBkZWNvZGVkQ29kZXMpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIHBvcyA9IDAsXG4gICAgICAgIGNvdW50ZXJMZW5ndGggPSBjb3VudGVycy5sZW5ndGgsXG4gICAgICAgIGNvdW50ZXJQYWlyID0gW1swLCAwLCAwLCAwLCAwXSwgWzAsIDAsIDAsIDAsIDBdXSxcbiAgICAgICAgY29kZXM7XG5cbiAgICB3aGlsZSAocG9zIDwgY291bnRlckxlbmd0aCkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICBjb3VudGVyUGFpclswXVtpXSA9IGNvdW50ZXJzW3Bvc10gKiB0aGlzLmJhclNwYWNlUmF0aW9bMF07XG4gICAgICAgICAgICBjb3VudGVyUGFpclsxXVtpXSA9IGNvdW50ZXJzW3BvcyArIDFdICogdGhpcy5iYXJTcGFjZVJhdGlvWzFdO1xuICAgICAgICAgICAgcG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgY29kZXMgPSBzZWxmLl9kZWNvZGVQYWlyKGNvdW50ZXJQYWlyKTtcbiAgICAgICAgaWYgKCFjb2Rlcykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjb2Rlc1tpXS5jb2RlICsgXCJcIik7XG4gICAgICAgICAgICBkZWNvZGVkQ29kZXMucHVzaChjb2Rlc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvZGVzO1xufTtcblxuSTJvZjVSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlDb3VudGVyTGVuZ3RoID0gZnVuY3Rpb24oY291bnRlcnMpIHtcbiAgICByZXR1cm4gKGNvdW50ZXJzLmxlbmd0aCAlIDEwID09PSAwKTtcbn07XG5cbkkyb2Y1UmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXJ0SW5mbyxcbiAgICAgICAgZW5kSW5mbyxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvZGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBkZWNvZGVkQ29kZXMgPSBbXSxcbiAgICAgICAgY291bnRlcnM7XG5cbiAgICBzdGFydEluZm8gPSBzZWxmLl9maW5kU3RhcnQoKTtcbiAgICBpZiAoIXN0YXJ0SW5mbykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGVjb2RlZENvZGVzLnB1c2goc3RhcnRJbmZvKTtcblxuICAgIGVuZEluZm8gPSBzZWxmLl9maW5kRW5kKCk7XG4gICAgaWYgKCFlbmRJbmZvKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvdW50ZXJzID0gc2VsZi5fZmlsbENvdW50ZXJzKHN0YXJ0SW5mby5lbmQsIGVuZEluZm8uc3RhcnQsIGZhbHNlKTtcbiAgICBpZiAoIXNlbGYuX3ZlcmlmeUNvdW50ZXJMZW5ndGgoY291bnRlcnMpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb2RlID0gc2VsZi5fZGVjb2RlUGF5bG9hZChjb3VudGVycywgcmVzdWx0LCBkZWNvZGVkQ29kZXMpO1xuICAgIGlmICghY29kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggJSAyICE9PSAwIHx8XG4gICAgICAgICAgICByZXN1bHQubGVuZ3RoIDwgNikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBkZWNvZGVkQ29kZXMucHVzaChlbmRJbmZvKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiByZXN1bHQuam9pbihcIlwiKSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0SW5mby5zdGFydCxcbiAgICAgICAgZW5kOiBlbmRJbmZvLmVuZCxcbiAgICAgICAgc3RhcnRJbmZvOiBzdGFydEluZm8sXG4gICAgICAgIGRlY29kZWRDb2RlczogZGVjb2RlZENvZGVzXG4gICAgfTtcbn07XG5cbkkyb2Y1UmVhZGVyLkNPTkZJR19LRVlTID0ge1xuICAgIG5vcm1hbGl6ZUJhclNwYWNlV2lkdGg6IHtcbiAgICAgICAgJ3R5cGUnOiAnYm9vbGVhbicsXG4gICAgICAgICdkZWZhdWx0JzogZmFsc2UsXG4gICAgICAgICdkZXNjcmlwdGlvbic6ICdJZiB0cnVlLCB0aGUgcmVhZGVyIHRyaWVzIHRvIG5vcm1hbGl6ZSB0aGUnICtcbiAgICAgICAgJ3dpZHRoLWRpZmZlcmVuY2UgYmV0d2VlbiBiYXJzIGFuZCBzcGFjZXMnXG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgSTJvZjVSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL2kyb2Y1X3JlYWRlci5qcyIsImltcG9ydCBFQU5SZWFkZXIgZnJvbSAnLi9lYW5fcmVhZGVyJztcblxuZnVuY3Rpb24gVVBDRVJlYWRlcihvcHRzLCBzdXBwbGVtZW50cykge1xuICAgIEVBTlJlYWRlci5jYWxsKHRoaXMsIG9wdHMsIHN1cHBsZW1lbnRzKTtcbn1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gICAgQ09ERV9GUkVRVUVOQ1k6IHt2YWx1ZTogW1xuICAgICAgICBbIDU2LCA1MiwgNTAsIDQ5LCA0NCwgMzgsIDM1LCA0MiwgNDEsIDM3IF0sXG4gICAgICAgIFs3LCAxMSwgMTMsIDE0LCAxOSwgMjUsIDI4LCAyMSwgMjIsIDI2XV19LFxuICAgIFNUT1BfUEFUVEVSTjogeyB2YWx1ZTogWzEgLyA2ICogNywgMSAvIDYgKiA3LCAxIC8gNiAqIDcsIDEgLyA2ICogNywgMSAvIDYgKiA3LCAxIC8gNiAqIDddfSxcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJ1cGNfZVwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuVVBDRVJlYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVBTlJlYWRlci5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuVVBDRVJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBVUENFUmVhZGVyO1xuXG5VUENFUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKGNvZGUsIHJlc3VsdCwgZGVjb2RlZENvZGVzKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBjb2RlRnJlcXVlbmN5ID0gMHgwO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgY29kZSA9IHNlbGYuX2RlY29kZUNvZGUoY29kZS5lbmQpO1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2RlLmNvZGUgPj0gc2VsZi5DT0RFX0dfU1RBUlQpIHtcbiAgICAgICAgICAgIGNvZGUuY29kZSA9IGNvZGUuY29kZSAtIHNlbGYuQ09ERV9HX1NUQVJUO1xuICAgICAgICAgICAgY29kZUZyZXF1ZW5jeSB8PSAxIDw8ICg1IC0gaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goY29kZS5jb2RlKTtcbiAgICAgICAgZGVjb2RlZENvZGVzLnB1c2goY29kZSk7XG4gICAgfVxuICAgIGlmICghc2VsZi5fZGV0ZXJtaW5lUGFyaXR5KGNvZGVGcmVxdWVuY3ksIHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGU7XG59O1xuXG5VUENFUmVhZGVyLnByb3RvdHlwZS5fZGV0ZXJtaW5lUGFyaXR5ID0gZnVuY3Rpb24oY29kZUZyZXF1ZW5jeSwgcmVzdWx0KSB7XG4gICAgdmFyIGksXG4gICAgICAgIG5yU3lzdGVtO1xuXG4gICAgZm9yIChuclN5c3RlbSA9IDA7IG5yU3lzdGVtIDwgdGhpcy5DT0RFX0ZSRVFVRU5DWS5sZW5ndGg7IG5yU3lzdGVtKyspe1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuQ09ERV9GUkVRVUVOQ1lbbnJTeXN0ZW1dLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY29kZUZyZXF1ZW5jeSA9PT0gdGhpcy5DT0RFX0ZSRVFVRU5DWVtuclN5c3RlbV1baV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudW5zaGlmdChuclN5c3RlbSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVVBDRVJlYWRlci5wcm90b3R5cGUuX2NvbnZlcnRUb1VQQ0EgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgdXBjYSA9IFtyZXN1bHRbMF1dLFxuICAgICAgICBsYXN0RGlnaXQgPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDJdO1xuXG4gICAgaWYgKGxhc3REaWdpdCA8PSAyKSB7XG4gICAgICAgIHVwY2EgPSB1cGNhLmNvbmNhdChyZXN1bHQuc2xpY2UoMSwgMykpXG4gICAgICAgICAgICAuY29uY2F0KFtsYXN0RGlnaXQsIDAsIDAsIDAsIDBdKVxuICAgICAgICAgICAgLmNvbmNhdChyZXN1bHQuc2xpY2UoMywgNikpO1xuICAgIH0gZWxzZSBpZiAobGFzdERpZ2l0ID09PSAzKSB7XG4gICAgICAgIHVwY2EgPSB1cGNhLmNvbmNhdChyZXN1bHQuc2xpY2UoMSwgNCkpXG4gICAgICAgICAgICAuY29uY2F0KFswLCAwLCAwLCAwLCAwXSlcbiAgICAgICAgICAgIC5jb25jYXQocmVzdWx0LnNsaWNlKDQsIDYpKTtcbiAgICB9IGVsc2UgaWYgKGxhc3REaWdpdCA9PT0gNCkge1xuICAgICAgICB1cGNhID0gdXBjYS5jb25jYXQocmVzdWx0LnNsaWNlKDEsIDUpKVxuICAgICAgICAgICAgLmNvbmNhdChbMCwgMCwgMCwgMCwgMCwgcmVzdWx0WzVdXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdXBjYSA9IHVwY2EuY29uY2F0KHJlc3VsdC5zbGljZSgxLCA2KSlcbiAgICAgICAgICAgIC5jb25jYXQoWzAsIDAsIDAsIDAsIGxhc3REaWdpdF0pO1xuICAgIH1cblxuICAgIHVwY2EucHVzaChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdKTtcbiAgICByZXR1cm4gdXBjYTtcbn07XG5cblVQQ0VSZWFkZXIucHJvdG90eXBlLl9jaGVja3N1bSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHJldHVybiBFQU5SZWFkZXIucHJvdG90eXBlLl9jaGVja3N1bS5jYWxsKHRoaXMsIHRoaXMuX2NvbnZlcnRUb1VQQ0EocmVzdWx0KSk7XG59O1xuXG5VUENFUmVhZGVyLnByb3RvdHlwZS5fZmluZEVuZCA9IGZ1bmN0aW9uKG9mZnNldCwgaXNXaGl0ZSkge1xuICAgIGlzV2hpdGUgPSB0cnVlO1xuICAgIHJldHVybiBFQU5SZWFkZXIucHJvdG90eXBlLl9maW5kRW5kLmNhbGwodGhpcywgb2Zmc2V0LCBpc1doaXRlKTtcbn07XG5cblVQQ0VSZWFkZXIucHJvdG90eXBlLl92ZXJpZnlUcmFpbGluZ1doaXRlc3BhY2UgPSBmdW5jdGlvbihlbmRJbmZvKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQ7XG5cbiAgICB0cmFpbGluZ1doaXRlc3BhY2VFbmQgPSBlbmRJbmZvLmVuZCArICgoZW5kSW5mby5lbmQgLSBlbmRJbmZvLnN0YXJ0KSAvIDIpO1xuICAgIGlmICh0cmFpbGluZ1doaXRlc3BhY2VFbmQgPCBzZWxmLl9yb3cubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZWxmLl9tYXRjaFJhbmdlKGVuZEluZm8uZW5kLCB0cmFpbGluZ1doaXRlc3BhY2VFbmQsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5kSW5mbztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVQQ0VSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL3VwY19lX3JlYWRlci5qcyIsImltcG9ydCBFQU5SZWFkZXIgZnJvbSAnLi9lYW5fcmVhZGVyJztcblxuZnVuY3Rpb24gVVBDUmVhZGVyKG9wdHMsIHN1cHBsZW1lbnRzKSB7XG4gICAgRUFOUmVhZGVyLmNhbGwodGhpcywgb3B0cywgc3VwcGxlbWVudHMpO1xufVxuXG52YXIgcHJvcGVydGllcyA9IHtcbiAgICBGT1JNQVQ6IHt2YWx1ZTogXCJ1cGNfYVwiLCB3cml0ZWFibGU6IGZhbHNlfVxufTtcblxuVVBDUmVhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRUFOUmVhZGVyLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5VUENSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVVBDUmVhZGVyO1xuXG5VUENSZWFkZXIucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gRUFOUmVhZGVyLnByb3RvdHlwZS5fZGVjb2RlLmNhbGwodGhpcyk7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5jb2RlICYmIHJlc3VsdC5jb2RlLmxlbmd0aCA9PT0gMTMgJiYgcmVzdWx0LmNvZGUuY2hhckF0KDApID09PSBcIjBcIikge1xuICAgICAgICByZXN1bHQuY29kZSA9IHJlc3VsdC5jb2RlLnN1YnN0cmluZygxKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVUENSZWFkZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVhZGVyL3VwY19yZWFkZXIuanMiLCJtb2R1bGUuZXhwb3J0cyA9IGRvdFxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbC12ZWMyL2RvdC5qc1xuLy8gbW9kdWxlIGlkID0gNTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbmZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgzKVxuICAgIG91dFswXSA9IGFbMF1cbiAgICBvdXRbMV0gPSBhWzFdXG4gICAgb3V0WzJdID0gYVsyXVxuICAgIHJldHVybiBvdXRcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZ2wtdmVjMy9jbG9uZS5qc1xuLy8gbW9kdWxlIGlkID0gNTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGhhc2hDbGVhciA9IHJlcXVpcmUoJy4vX2hhc2hDbGVhcicpLFxuICAgIGhhc2hEZWxldGUgPSByZXF1aXJlKCcuL19oYXNoRGVsZXRlJyksXG4gICAgaGFzaEdldCA9IHJlcXVpcmUoJy4vX2hhc2hHZXQnKSxcbiAgICBoYXNoSGFzID0gcmVxdWlyZSgnLi9faGFzaEhhcycpLFxuICAgIGhhc2hTZXQgPSByZXF1aXJlKCcuL19oYXNoU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19IYXNoLmpzXG4vLyBtb2R1bGUgaWQgPSA1NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgbWFwQ2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX21hcENhY2hlQ2xlYXInKSxcbiAgICBtYXBDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX21hcENhY2hlRGVsZXRlJyksXG4gICAgbWFwQ2FjaGVHZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZUdldCcpLFxuICAgIG1hcENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVIYXMnKSxcbiAgICBtYXBDYWNoZVNldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENhY2hlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fTWFwQ2FjaGUuanNcbi8vIG1vZHVsZSBpZCA9IDU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBzdGFja0NsZWFyID0gcmVxdWlyZSgnLi9fc3RhY2tDbGVhcicpLFxuICAgIHN0YWNrRGVsZXRlID0gcmVxdWlyZSgnLi9fc3RhY2tEZWxldGUnKSxcbiAgICBzdGFja0dldCA9IHJlcXVpcmUoJy4vX3N0YWNrR2V0JyksXG4gICAgc3RhY2tIYXMgPSByZXF1aXJlKCcuL19zdGFja0hhcycpLFxuICAgIHN0YWNrU2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RhY2sgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU3RhY2soZW50cmllcykge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlKGVudHJpZXMpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTdGFja2AuXG5TdGFjay5wcm90b3R5cGUuY2xlYXIgPSBzdGFja0NsZWFyO1xuU3RhY2sucHJvdG90eXBlWydkZWxldGUnXSA9IHN0YWNrRGVsZXRlO1xuU3RhY2sucHJvdG90eXBlLmdldCA9IHN0YWNrR2V0O1xuU3RhY2sucHJvdG90eXBlLmhhcyA9IHN0YWNrSGFzO1xuU3RhY2sucHJvdG90eXBlLnNldCA9IHN0YWNrU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fU3RhY2suanNcbi8vIG1vZHVsZSBpZCA9IDU4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19VaW50OEFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA1OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19hcHBseS5qc1xuLy8gbW9kdWxlIGlkID0gNjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VUaW1lcyA9IHJlcXVpcmUoJy4vX2Jhc2VUaW1lcycpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUxpa2VLZXlzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYXJyYXlMaWtlS2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gNjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnblZhbHVlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYXNzaWduVmFsdWUuanNcbi8vIG1vZHVsZSBpZCA9IDYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXNzaWduaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9iamVjdCgpIHt9XG4gIHJldHVybiBmdW5jdGlvbihwcm90bykge1xuICAgIGlmICghaXNPYmplY3QocHJvdG8pKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChvYmplY3RDcmVhdGUpIHtcbiAgICAgIHJldHVybiBvYmplY3RDcmVhdGUocHJvdG8pO1xuICAgIH1cbiAgICBvYmplY3QucHJvdG90eXBlID0gcHJvdG87XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBvYmplY3Q7XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gNjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNyZWF0ZUJhc2VGb3IgPSByZXF1aXJlKCcuL19jcmVhdGVCYXNlRm9yJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzIG92ZXIgYG9iamVjdGBcbiAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRm9yO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUZvci5qc1xuLy8gbW9kdWxlIGlkID0gNjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNBcmd1bWVudHM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlSXNBcmd1bWVudHMuanNcbi8vIG1vZHVsZSBpZCA9IDY1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNNYXNrZWQgPSByZXF1aXJlKCcuL19pc01hc2tlZCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNOYXRpdmU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlSXNOYXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDY2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzSW4gPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzSW4nKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5c0luO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZUtleXNJbi5qc1xuLy8gbW9kdWxlIGlkID0gNjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBhc3NpZ25NZXJnZVZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduTWVyZ2VWYWx1ZScpLFxuICAgIGJhc2VGb3IgPSByZXF1aXJlKCcuL19iYXNlRm9yJyksXG4gICAgYmFzZU1lcmdlRGVlcCA9IHJlcXVpcmUoJy4vX2Jhc2VNZXJnZURlZXAnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpLFxuICAgIHNhZmVHZXQgPSByZXF1aXJlKCcuL19zYWZlR2V0Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWVyZ2VgIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcmNJbmRleCBUaGUgaW5kZXggb2YgYHNvdXJjZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBtZXJnZWQgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2UgdmFsdWVzIGFuZCB0aGVpciBtZXJnZWRcbiAqICBjb3VudGVycGFydHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNZXJnZShvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIGlmIChvYmplY3QgPT09IHNvdXJjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBiYXNlRm9yKHNvdXJjZSwgZnVuY3Rpb24oc3JjVmFsdWUsIGtleSkge1xuICAgIGlmIChpc09iamVjdChzcmNWYWx1ZSkpIHtcbiAgICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgICBiYXNlTWVyZ2VEZWVwKG9iamVjdCwgc291cmNlLCBrZXksIHNyY0luZGV4LCBiYXNlTWVyZ2UsIGN1c3RvbWl6ZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICAgID8gY3VzdG9taXplcihzYWZlR2V0KG9iamVjdCwga2V5KSwgc3JjVmFsdWUsIChrZXkgKyAnJyksIG9iamVjdCwgc291cmNlLCBzdGFjaylcbiAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gc3JjVmFsdWU7XG4gICAgICB9XG4gICAgICBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9LCBrZXlzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNZXJnZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VNZXJnZS5qc1xuLy8gbW9kdWxlIGlkID0gNjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFzc2lnbk1lcmdlVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25NZXJnZVZhbHVlJyksXG4gICAgY2xvbmVCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUJ1ZmZlcicpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpLFxuICAgIGNvcHlBcnJheSA9IHJlcXVpcmUoJy4vX2NvcHlBcnJheScpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0FycmF5TGlrZU9iamVjdCA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2VPYmplY3QnKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4vaXNQbGFpbk9iamVjdCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5JyksXG4gICAgc2FmZUdldCA9IHJlcXVpcmUoJy4vX3NhZmVHZXQnKSxcbiAgICB0b1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnLi90b1BsYWluT2JqZWN0Jyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlTWVyZ2VgIGZvciBhcnJheXMgYW5kIG9iamVjdHMgd2hpY2ggcGVyZm9ybXNcbiAqIGRlZXAgbWVyZ2VzIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMgZW5hYmxpbmcgb2JqZWN0cyB3aXRoIGNpcmN1bGFyXG4gKiByZWZlcmVuY2VzIHRvIGJlIG1lcmdlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gbWVyZ2UuXG4gKiBAcGFyYW0ge251bWJlcn0gc3JjSW5kZXggVGhlIGluZGV4IG9mIGBzb3VyY2VgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWVyZ2VGdW5jIFRoZSBmdW5jdGlvbiB0byBtZXJnZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25lZCB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIHNvdXJjZSB2YWx1ZXMgYW5kIHRoZWlyIG1lcmdlZFxuICogIGNvdW50ZXJwYXJ0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZU1lcmdlRGVlcChvYmplY3QsIHNvdXJjZSwga2V5LCBzcmNJbmRleCwgbWVyZ2VGdW5jLCBjdXN0b21pemVyLCBzdGFjaykge1xuICB2YXIgb2JqVmFsdWUgPSBzYWZlR2V0KG9iamVjdCwga2V5KSxcbiAgICAgIHNyY1ZhbHVlID0gc2FmZUdldChzb3VyY2UsIGtleSksXG4gICAgICBzdGFja2VkID0gc3RhY2suZ2V0KHNyY1ZhbHVlKTtcblxuICBpZiAoc3RhY2tlZCkge1xuICAgIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIHN0YWNrZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgPyBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSwgKGtleSArICcnKSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIHZhciBpc0NvbW1vbiA9IG5ld1ZhbHVlID09PSB1bmRlZmluZWQ7XG5cbiAgaWYgKGlzQ29tbW9uKSB7XG4gICAgdmFyIGlzQXJyID0gaXNBcnJheShzcmNWYWx1ZSksXG4gICAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiBpc0J1ZmZlcihzcmNWYWx1ZSksXG4gICAgICAgIGlzVHlwZWQgPSAhaXNBcnIgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkoc3JjVmFsdWUpO1xuXG4gICAgbmV3VmFsdWUgPSBzcmNWYWx1ZTtcbiAgICBpZiAoaXNBcnIgfHwgaXNCdWZmIHx8IGlzVHlwZWQpIHtcbiAgICAgIGlmIChpc0FycmF5KG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IG9ialZhbHVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNBcnJheUxpa2VPYmplY3Qob2JqVmFsdWUpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gY29weUFycmF5KG9ialZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlzQnVmZikge1xuICAgICAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgICAgICBuZXdWYWx1ZSA9IGNsb25lQnVmZmVyKHNyY1ZhbHVlLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlzVHlwZWQpIHtcbiAgICAgICAgaXNDb21tb24gPSBmYWxzZTtcbiAgICAgICAgbmV3VmFsdWUgPSBjbG9uZVR5cGVkQXJyYXkoc3JjVmFsdWUsIHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG5ld1ZhbHVlID0gW107XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGxhaW5PYmplY3Qoc3JjVmFsdWUpIHx8IGlzQXJndW1lbnRzKHNyY1ZhbHVlKSkge1xuICAgICAgbmV3VmFsdWUgPSBvYmpWYWx1ZTtcbiAgICAgIGlmIChpc0FyZ3VtZW50cyhvYmpWYWx1ZSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSB0b1BsYWluT2JqZWN0KG9ialZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCFpc09iamVjdChvYmpWYWx1ZSkgfHwgKHNyY0luZGV4ICYmIGlzRnVuY3Rpb24ob2JqVmFsdWUpKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IGluaXRDbG9uZU9iamVjdChzcmNWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaXNDb21tb24gPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzQ29tbW9uKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgbWVyZ2Ugb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgc3RhY2suc2V0KHNyY1ZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgbWVyZ2VGdW5jKG5ld1ZhbHVlLCBzcmNWYWx1ZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIsIHN0YWNrKTtcbiAgICBzdGFja1snZGVsZXRlJ10oc3JjVmFsdWUpO1xuICB9XG4gIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWVyZ2VEZWVwO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZU1lcmdlRGVlcC5qc1xuLy8gbW9kdWxlIGlkID0gNzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpLFxuICAgIG92ZXJSZXN0ID0gcmVxdWlyZSgnLi9fb3ZlclJlc3QnKSxcbiAgICBzZXRUb1N0cmluZyA9IHJlcXVpcmUoJy4vX3NldFRvU3RyaW5nJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VSZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fYmFzZVJlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDcxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjb25zdGFudCA9IHJlcXVpcmUoJy4vY29uc3RhbnQnKSxcbiAgICBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTZXRUb1N0cmluZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Jhc2VTZXRUb1N0cmluZy5qc1xuLy8gbW9kdWxlIGlkID0gNzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlVGltZXMuanNcbi8vIG1vZHVsZSBpZCA9IDczXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVW5hcnk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19iYXNlVW5hcnkuanNcbi8vIG1vZHVsZSBpZCA9IDc0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBVaW50OEFycmF5ID0gcmVxdWlyZSgnLi9fVWludDhBcnJheScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgYXJyYXlCdWZmZXJgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBhcnJheUJ1ZmZlciBUaGUgYXJyYXkgYnVmZmVyIHRvIGNsb25lLlxuICogQHJldHVybnMge0FycmF5QnVmZmVyfSBSZXR1cm5zIHRoZSBjbG9uZWQgYXJyYXkgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBjbG9uZUFycmF5QnVmZmVyKGFycmF5QnVmZmVyKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgYXJyYXlCdWZmZXIuY29uc3RydWN0b3IoYXJyYXlCdWZmZXIuYnl0ZUxlbmd0aCk7XG4gIG5ldyBVaW50OEFycmF5KHJlc3VsdCkuc2V0KG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVBcnJheUJ1ZmZlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Nsb25lQXJyYXlCdWZmZXIuanNcbi8vIG1vZHVsZSBpZCA9IDc1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZCxcbiAgICBhbGxvY1Vuc2FmZSA9IEJ1ZmZlciA/IEJ1ZmZlci5hbGxvY1Vuc2FmZSA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgIGBidWZmZXJgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge0J1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVCdWZmZXIoYnVmZmVyLCBpc0RlZXApIHtcbiAgaWYgKGlzRGVlcCkge1xuICAgIHJldHVybiBidWZmZXIuc2xpY2UoKTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGFsbG9jVW5zYWZlID8gYWxsb2NVbnNhZmUobGVuZ3RoKSA6IG5ldyBidWZmZXIuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICBidWZmZXIuY29weShyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQnVmZmVyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY2xvbmVCdWZmZXIuanNcbi8vIG1vZHVsZSBpZCA9IDc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdHlwZWRBcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZEFycmF5IFRoZSB0eXBlZCBhcnJheSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgdHlwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNsb25lVHlwZWRBcnJheSh0eXBlZEFycmF5LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IGNsb25lQXJyYXlCdWZmZXIodHlwZWRBcnJheS5idWZmZXIpIDogdHlwZWRBcnJheS5idWZmZXI7XG4gIHJldHVybiBuZXcgdHlwZWRBcnJheS5jb25zdHJ1Y3RvcihidWZmZXIsIHR5cGVkQXJyYXkuYnl0ZU9mZnNldCwgdHlwZWRBcnJheS5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lVHlwZWRBcnJheTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2Nsb25lVHlwZWRBcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNzdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBgc291cmNlYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBzb3VyY2UgVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXk9W11dIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyB0by5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBjb3B5QXJyYXkoc291cmNlLCBhcnJheSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG5cbiAgYXJyYXkgfHwgKGFycmF5ID0gQXJyYXkobGVuZ3RoKSk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbaW5kZXhdID0gc291cmNlW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weUFycmF5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY29weUFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA3OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5T2JqZWN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY29weU9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZUpzRGF0YTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2NvcmVKc0RhdGEuanNcbi8vIG1vZHVsZSBpZCA9IDgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlUmVzdCA9IHJlcXVpcmUoJy4vX2Jhc2VSZXN0JyksXG4gICAgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuL19pc0l0ZXJhdGVlQ2FsbCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUFzc2lnbmVyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fY3JlYXRlQXNzaWduZXIuanNcbi8vIG1vZHVsZSBpZCA9IDgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VGb3I7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19jcmVhdGVCYXNlRm9yLmpzXG4vLyBtb2R1bGUgaWQgPSA4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19nZXRSYXdUYWcuanNcbi8vIG1vZHVsZSBpZCA9IDgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fZ2V0VmFsdWUuanNcbi8vIG1vZHVsZSBpZCA9IDg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaENsZWFyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faGFzaENsZWFyLmpzXG4vLyBtb2R1bGUgaWQgPSA4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hEZWxldGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19oYXNoRGVsZXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoR2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faGFzaEdldC5qc1xuLy8gbW9kdWxlIGlkID0gODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGhhc2ggdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hIYXMoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEhhcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2hhc2hIYXMuanNcbi8vIG1vZHVsZSBpZCA9IDg4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICB0aGlzLnNpemUgKz0gdGhpcy5oYXMoa2V5KSA/IDAgOiAxO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaFNldDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2hhc2hTZXQuanNcbi8vIG1vZHVsZSBpZCA9IDg5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnLi9fYmFzZUNyZWF0ZScpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmICFpc1Byb3RvdHlwZShvYmplY3QpKVxuICAgID8gYmFzZUNyZWF0ZShnZXRQcm90b3R5cGUob2JqZWN0KSlcbiAgICA6IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZU9iamVjdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gOTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIHZhbHVlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgb2JqZWN0IGFyZ3VtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgICAgOiAodHlwZSA9PSAnc3RyaW5nJyAmJiBpbmRleCBpbiBvYmplY3QpXG4gICAgICApIHtcbiAgICByZXR1cm4gZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0l0ZXJhdGVlQ2FsbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2lzSXRlcmF0ZWVDYWxsLmpzXG4vLyBtb2R1bGUgaWQgPSA5MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9faXNLZXlhYmxlLmpzXG4vLyBtb2R1bGUgaWQgPSA5MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY29yZUpzRGF0YSA9IHJlcXVpcmUoJy4vX2NvcmVKc0RhdGEnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc01hc2tlZDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2lzTWFza2VkLmpzXG4vLyBtb2R1bGUgaWQgPSA5M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19saXN0Q2FjaGVDbGVhci5qc1xuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3BsaWNlID0gYXJyYXlQcm90by5zcGxpY2U7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gIGlmIChpbmRleCA9PSBsYXN0SW5kZXgpIHtcbiAgICBkYXRhLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHNwbGljZS5jYWxsKGRhdGEsIGluZGV4LCAxKTtcbiAgfVxuICAtLXRoaXMuc2l6ZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlRGVsZXRlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbGlzdENhY2hlRGVsZXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA5NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlR2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbGlzdENhY2hlR2V0LmpzXG4vLyBtb2R1bGUgaWQgPSA5NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUhhcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qc1xuLy8gbW9kdWxlIGlkID0gOTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIFNldHMgdGhlIGxpc3QgY2FjaGUgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGxpc3QgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgICsrdGhpcy5zaXplO1xuICAgIGRhdGEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGRhdGFbaW5kZXhdWzFdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlU2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbGlzdENhY2hlU2V0LmpzXG4vLyBtb2R1bGUgaWQgPSA5OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgSGFzaCA9IHJlcXVpcmUoJy4vX0hhc2gnKSxcbiAgICBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5zaXplID0gMDtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlQ2xlYXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzXG4vLyBtb2R1bGUgaWQgPSA5OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpWydkZWxldGUnXShrZXkpO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVEZWxldGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19tYXBDYWNoZURlbGV0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19tYXBDYWNoZUdldC5qc1xuLy8gbW9kdWxlIGlkID0gMTAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlSGFzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbWFwQ2FjaGVIYXMuanNcbi8vIG1vZHVsZSBpZCA9IDEwMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLFxuICAgICAgc2l6ZSA9IGRhdGEuc2l6ZTtcblxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplICs9IGRhdGEuc2l6ZSA9PSBzaXplID8gMCA6IDE7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlU2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbWFwQ2FjaGVTZXQuanNcbi8vIG1vZHVsZSBpZCA9IDEwM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzSW47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19uYXRpdmVLZXlzSW4uanNcbi8vIG1vZHVsZSBpZCA9IDEwNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVVdGlsO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fbm9kZVV0aWwuanNcbi8vIG1vZHVsZSBpZCA9IDEwNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzXG4vLyBtb2R1bGUgaWQgPSAxMDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX292ZXJBcmcuanNcbi8vIG1vZHVsZSBpZCA9IDEwN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXBwbHkgPSByZXF1aXJlKCcuL19hcHBseScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJSZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fb3ZlclJlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDEwOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYmFzZVNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fYmFzZVNldFRvU3RyaW5nJyksXG4gICAgc2hvcnRPdXQgPSByZXF1aXJlKCcuL19zaG9ydE91dCcpO1xuXG4vKipcbiAqIFNldHMgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIG9mIGBmdW5jYCB0byByZXR1cm4gYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgc2V0VG9TdHJpbmcgPSBzaG9ydE91dChiYXNlU2V0VG9TdHJpbmcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvU3RyaW5nO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc2V0VG9TdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDEwOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVOb3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCdsbCBzaG9ydCBvdXQgYW5kIGludm9rZSBgaWRlbnRpdHlgIGluc3RlYWRcbiAqIG9mIGBmdW5jYCB3aGVuIGl0J3MgY2FsbGVkIGBIT1RfQ09VTlRgIG9yIG1vcmUgdGltZXMgaW4gYEhPVF9TUEFOYFxuICogbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNob3J0YWJsZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gc2hvcnRPdXQoZnVuYykge1xuICB2YXIgY291bnQgPSAwLFxuICAgICAgbGFzdENhbGxlZCA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFtcCA9IG5hdGl2ZU5vdygpLFxuICAgICAgICByZW1haW5pbmcgPSBIT1RfU1BBTiAtIChzdGFtcCAtIGxhc3RDYWxsZWQpO1xuXG4gICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBpZiAoKytjb3VudCA+PSBIT1RfQ09VTlQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hvcnRPdXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL19zaG9ydE91dC5qc1xuLy8gbW9kdWxlIGlkID0gMTEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0NsZWFyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc3RhY2tDbGVhci5qc1xuLy8gbW9kdWxlIGlkID0gMTExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICByZXN1bHQgPSBkYXRhWydkZWxldGUnXShrZXkpO1xuXG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0RlbGV0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX3N0YWNrRGVsZXRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrR2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc3RhY2tHZXQuanNcbi8vIG1vZHVsZSBpZCA9IDExM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fc3RhY2tIYXMuanNcbi8vIG1vZHVsZSBpZCA9IDExNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbnZhciBMQVJHRV9BUlJBWV9TSVpFID0gMjAwO1xuXG4vKipcbiAqIFNldHMgdGhlIHN0YWNrIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHN0YWNrIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdGFja1NldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBMaXN0Q2FjaGUpIHtcbiAgICB2YXIgcGFpcnMgPSBkYXRhLl9fZGF0YV9fO1xuICAgIGlmICghTWFwIHx8IChwYWlycy5sZW5ndGggPCBMQVJHRV9BUlJBWV9TSVpFIC0gMSkpIHtcbiAgICAgIHBhaXJzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICAgIHRoaXMuc2l6ZSA9ICsrZGF0YS5zaXplO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IE1hcENhY2hlKHBhaXJzKTtcbiAgfVxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja1NldDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvX3N0YWNrU2V0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9fdG9Tb3VyY2UuanNcbi8vIG1vZHVsZSBpZCA9IDExNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvY29uc3RhbnQuanNcbi8vIG1vZHVsZSBpZCA9IDExN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlT2JqZWN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc0FycmF5TGlrZU9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gMTE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWJGYWxzZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvc3R1YkZhbHNlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4nKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgcGxhaW4gb2JqZWN0IGZsYXR0ZW5pbmcgaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nXG4gKiBrZXllZCBwcm9wZXJ0aWVzIG9mIGB2YWx1ZWAgdG8gb3duIHByb3BlcnRpZXMgb2YgdGhlIHBsYWluIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBwbGFpbiBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIG5ldyBGb28pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKlxuICogXy5hc3NpZ24oeyAnYSc6IDEgfSwgXy50b1BsYWluT2JqZWN0KG5ldyBGb28pKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIsICdjJzogMyB9XG4gKi9cbmZ1bmN0aW9uIHRvUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3QodmFsdWUsIGtleXNJbih2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvUGxhaW5PYmplY3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9kYXNoL3RvUGxhaW5PYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDEyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDEyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9