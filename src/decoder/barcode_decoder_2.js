import Bresenham from './bresenham';
import ImageWrapper from '../common/image_wrapper';
import Code128Reader from '../reader/code_128_reader';
import EANReader from '../reader/ean_reader';
import Code39Reader from '../reader/code_39_reader';
import Code39VINReader from '../reader/code_39_vin_reader';
import CodabarReader from '../reader/codabar_reader';
import UPCReader from '../reader/upc_reader';
import EAN8Reader from '../reader/ean_8_reader';
import EAN2Reader from '../reader/ean_2_reader';
import EAN5Reader from '../reader/ean_5_reader';
import UPCEReader from '../reader/upc_e_reader';
import I2of5Reader from '../reader/i2of5_reader';
import TwoOfFiveReader from '../reader/2of5_reader';
import Code93Reader from '../reader/code_93_reader';
const vec2clone = require('gl-vec2/clone')

const READERS = {
    code_128_reader: Code128Reader,
    ean_reader: EANReader,
    ean_5_reader: EAN5Reader,
    ean_2_reader: EAN2Reader,
    ean_8_reader: EAN8Reader,
    code_39_reader: Code39Reader,
    code_39_vin_reader: Code39VINReader,
    codabar_reader: CodabarReader,
    upc_reader: UPCReader,
    upc_e_reader: UPCEReader,
    i2of5_reader: I2of5Reader,
    '2of5_reader': TwoOfFiveReader,
    code_93_reader: Code93Reader
};
export default {
    create: function(config) {
      let inputImageWrapper
      let _barcodeReaders = [];

        initReaders();

        function initReaders() {
            config.readers.forEach(function(readerConfig) {
                var reader,
                    configuration = {},
                    supplements = [];

                if (typeof readerConfig === 'object') {
                    reader = readerConfig.format;
                    configuration = readerConfig.config;
                } else if (typeof readerConfig === 'string') {
                    reader = readerConfig;
                }
                if (ENV.development) {
                    console.log("Before registering reader: ", reader);
                }
                if (configuration.supplements) {
                    supplements = configuration
                        .supplements.map((supplement) => {
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
            while (ext > 1 && (!inputImageWrapper.inImageWithBorder(line[0], 0)
                    || !inputImageWrapper.inImageWithBorder(line[1], 0))) {
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
                barcodeLine = Bresenham.getBarcodeLine(inputImageWrapper, line[0], line[1]);

            Bresenham.toBinaryLine(barcodeLine);

            for ( i = 0; i < _barcodeReaders.length && result === null; i++) {
                result = _barcodeReaders[i].decodePattern(barcodeLine.line);
            }
            if (result === null){
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
            var sideLength = Math.sqrt(Math.pow(box[1][0] - box[0][0], 2) + Math.pow((box[1][1] - box[0][1]), 2)),
                i,
                slices = 16,
                result = null,
                dir,
                extension,
                xdir = Math.sin(lineAngle),
                ydir = Math.cos(lineAngle);

            for ( i = 1; i < slices && result === null; i++) {
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
            return Math.sqrt(
                Math.pow(Math.abs(line[1].y - line[0].y), 2) +
                Math.pow(Math.abs(line[1].x - line[0].x), 2));
        }

        /**
         * With the help of the configured readers (Code128 or EAN) this function tries to detect a
         * valid barcode pattern within the given area.
         * @param {Object} box The area to search in
         * @returns {Object} the result {codeResult, line, angle, pattern, threshold}
         */
        function decodeFromBoundingBox(box) {
            var line,
                lineAngle,
                result,
                lineLength;

            line = getLine(box);
            lineLength = getLineLength(line);
            lineAngle = Math.atan2(line[1].y - line[0].y, line[1].x - line[0].x);
            line = getExtendedLine(line, lineAngle, Math.floor(lineLength * 0.1));
            if (line === null){
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

        return function decode (imageData) {
          // Warning! Because i'm hacking up someone else's code, i'm just setting
          // a variable that is closed over, that the decode* funcitons will use
          // THIS FUNCTION IS NOT CONCURRENT SAFE! It must only ever be called
          // once at a time, and any concurrent calls will corrupt the imageData
          // and do horrible things!
          const singleColorImageData = new Uint8ClampedArray(imageData.height * imageData.width)
          computeGray(imageData.data, singleColorImageData, false)

          inputImageWrapper = new ImageWrapper({
            y: imageData.height,
            x: imageData.width
          }, singleColorImageData, Uint8ClampedArray, false)

          console.log(inputImageWrapper)
          return decodeFromBoundingBox([
            vec2clone([0, 0]),
            vec2clone([0, inputImageWrapper.size.y]),
            vec2clone([inputImageWrapper.size.x, inputImageWrapper.size.y]),
            vec2clone([inputImageWrapper.size.x, 0]),
          ])
        }
    }
};

function computeGray(imageData, outArray, singleChannel) {
    var l = (imageData.length / 4) | 0, i;

    if (singleChannel) {
        for (i = 0; i < l; i++) {
            outArray[i] = imageData[i * 4 + 0];
        }
    } else {
        for (i = 0; i < l; i++) {
            outArray[i] =
                0.299 * imageData[i * 4 + 0] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2];
        }
    }
};
