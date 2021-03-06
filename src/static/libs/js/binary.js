var BlobBuilder = self.WebKitBlobBuilder || self.MozBlobBuilder;

var BinaryReader = function(data) {
    this._buffer = data;
    this._pos = 0;
};

BinaryReader.prototype = {
    readInt8: function() {
        return this._decodeInt(8, true);
    },

    readUInt8: function() {
        return this._decodeInt(8, false);
    },

    readInt16: function() {
        return this._decodeInt(16, true);
    },

    readUInt16: function() {
        return this._decodeInt(16, false);
    },

    readInt32: function() {
        return this._decodeInt(32, true);
    },

    readUInt32: function() {
        return this._decodeInt(32, false);
    },

    readFloat: function() {
        return this._decodeFloat(23, 8);
    },

    readDouble: function() {
        return this._decodeFloat(52, 11);
    },

    readChar: function() {
        return this.readString(1);
    },

    readString: function(length) {
        this._checkSize(length * 8);
        var result = this._buffer.substr(this._pos, length);
        this._pos += length;
        return result;
    },

    seek: function(pos) {
        this._pos = pos;
        this._checkSize(0);
    },

    getPosition: function() {
        return this._pos;
    },

    getSize: function() {
        return this._buffer.length;
    },

    _decodeFloat: function(precisionBits, exponentBits) {
        return this._decodeFloat2(precisionBits, exponentBits);
    },

    _decodeFloat2: function(precisionBits, exponentBits) {
        var i;
        var test;
        var length = precisionBits + exponentBits + 1;
        var value = this._decodeInt(length);

        var sign = (value >> 31) & 0x1;
        var allZero = 1;
        var mantissa = 0.0;
        var exponent = 0.0;

        // Mantissa
        for (i = 22; i > -1; i--) {
            test = 1.0 / Math.pow(2, 23 - i);

            if ((value >> i & 0x1) === 1) {
                mantissa += test;
                allZero = 0;
            }
        }

        if (allZero === 0)
            mantissa += 1.0;

        for (i = 30; i > 22; i--) {
            test = Math.pow(2, i - 23);

            if ((value >> i & 0x1) === 1) {
                exponent += test;
            }
        }

        exponent -= 127.0;

        var total = Math.pow(2.0, exponent) * mantissa;
        if (sign === 1) {
            total *= -1.0;
        }

        return total;

    },

    _decodeInt: function(bits, signed) {
        var x = this._readBits(0, bits, bits / 8),
            max = Math.pow(2, bits);
        var result = signed && x >= max / 2 ? x - max : x;

        this._pos += bits / 8;
        return result;
    },

    _shl: function(a, b) {
        for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) === 0x40000000 ? a * 2 : (a - 0x40000000) * 2 +
            0x7fffffff + 1)
        ;
        return a;
    },

    _readByte: function(i, size) {
        return this._buffer.charCodeAt(this._pos + size - i - 1) & 0xff;
    },

    _readBits: function(start, length, size) {
        var offsetLeft = (start + length) % 8;
        var offsetRight = start % 8;
        var curByte = size - (start >> 3) - 1;
        var lastByte = size + (-(start + length) >> 3);
        var diff = curByte - lastByte;

        var sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) -
            1);

        if (diff && offsetLeft) {
            sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;
        }

        while (diff) {
            sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight);
        }

        return sum;
    },

    _checkSize: function(neededBits) {
        if (!(this._pos + Math.ceil(neededBits / 8) < this._buffer.length)) {
            throw new Error("Index out of bounds");
        }
    }
};
