var THREEx = THREEx || {};

/**
 * Converts the provided md2 file into a json representation that may be used by
 * three.js. This operation is considered a load operation as it loads the model
 * from a source format into the current three.js specification format.
 *
 * @see http://tfc.duke.free.fr/coding/md2-specs-en.html
 *
 * @param {String}
 *            file The complete set of contents of the md2 file to be converted.
 * @param {String}
 *            filename The name of the md2 file to be coonverted
 * @return {String} The string representation of the json model file resulting
 *         from the conversion of the md2 model.
 */
THREEx.loadMd2 = function(file, filename, decimalPrecision) {
    // default the decimal precision value to the default
    // one in case no parameter is provided
    decimalPrecision = decimalPrecision || 1;

    // crates the various structures to be used in the
    // creation of the model file
    var header = {};
    var frames = [];
    var uvs = [];
    var faces = [];
    var string = "";
    var info = {};
    var returnObject = {
        string : string,
        info : info
    };

    // creates the binary file reader from the file
    // to use it to read the contents
    var reader = new BinaryReader(file);

    // uses the reader to retrieve both the identifier
    // string (magic number) and the version of the file spec
    header.ident = reader.readString(4);
    header.version = reader.readInt32();

    // validates that the identifier in the header is the correct
    // one and that the version is the compatible one
    if (header.ident != "IDP2" || header.version != 8) {
        info.status = "Not a valid MD2 file";
        return returnObject;
    }

    // reads the various components of the header, in accordance
    // with the specification
    header.skinwidth = reader.readInt32();
    header.skinheight = reader.readInt32();
    header.framesize = reader.readInt32();
    header.num_skins = reader.readInt32();
    header.num_vertices = reader.readInt32();
    header.num_st = reader.readInt32();
    header.num_tris = reader.readInt32();
    header.num_glcmds = reader.readInt32();
    header.num_frames = reader.readInt32();
    header.offset_skins = reader.readInt32();
    header.offset_st = reader.readInt32();
    header.offset_tris = reader.readInt32();
    header.offset_frames = reader.readInt32();
    header.offset_glcmds = reader.readInt32();
    header.offset_end = reader.readInt32();

    // in case the size of file (in bytes) is diferent
    // from the defined value in the header raise an error
    // as the file is considered corrupted
    if (reader.getSize() != header.offset_end) {
        info.status = "Corrupted MD2 file";
        return returnObject;
    }

    // seeks the reader to the texture offset position
    // and starts the reading of them
    reader.seek(header.offset_st);
    for (var i = 0; i < header.num_st; i++) {
        var s = reader.readInt16() / header.skinwidth;
        var t = reader.readInt16() / header.skinheight;

        uvs.push(s);
        uvs.push(t);
    }

    // seeks the reader to the triangles offset position
    // and starts the reading of them
    reader.seek(header.offset_tris);
    for (var i = 0; i < header.num_tris; i++) {
        var a = reader.readInt16();
        var b = reader.readInt16();
        var c = reader.readInt16();

        var uva_i = reader.readUInt16();
        var uvb_i = reader.readUInt16();
        var uvc_i = reader.readUInt16();

        faces.push(8);

        faces.push(c);
        faces.push(b);
        faces.push(a);

        faces.push(uvc_i);
        faces.push(uvb_i);
        faces.push(uva_i);
    }

    // seeks the reader to the frames offset position
    // and starts the reading of them
    reader.seek(header.offset_frames);
    for (var f = 0; f < header.num_frames; f++) {
        var frame = {};
        frame.vertices = [];
        frame.name = "";
        frame.scale = {};
        frame.translate = {};

        frame.scale.x = reader.readFloat();
        frame.scale.y = reader.readFloat();
        frame.scale.z = reader.readFloat();

        frame.translate.x = reader.readFloat();
        frame.translate.y = reader.readFloat();
        frame.translate.z = reader.readFloat();

        frame.name = reader.readString(16).replace(/[^a-z0-9]/gi, ''); // 4+4+4 4+4+4 (12 + 12) = 24 + 16 = 40

        for (var v = 0; v < header.num_vertices; v++) {
            var tempX = reader.readUInt8();
            var tempY = reader.readUInt8();
            var tempZ = reader.readUInt8();
            var normal = reader.readUInt8();

            var xx = frame.scale.x * tempX + frame.translate.x;
            var yy = frame.scale.z * tempZ + frame.translate.z;
            var zz = frame.scale.y * tempY + frame.translate.y;

            frame.vertices.push(xx.toFixed(decimalPrecision) * -1);
            frame.vertices.push(yy.toFixed(decimalPrecision));
            frame.vertices.push(zz.toFixed(decimalPrecision));
        }

        frames.push(frame);
    }

    // starts the construction of the string
    var str = "";
    // metadata
    str += "{\n\n\"metadata\" : {\n\"formatVersion\" : 3,\n\"description\"    : \"Md 2 model converted from "
            + filename + ".md2 using MD2 to json converter.\"\n},";
    // scale +material
    str += "\n\n\"scale\" : 1.000000,\n\n\"materials\": [    {\n\"DbgColor\" : 15658734,\n\"DbgIndex\" : 0,\n\"DbgName\" : \"md2_material\"\n}],";
    // vertices
    str += "\n\n\"vertices\": [" + frames[0].vertices.toString() + "],";
    // morphtargtes
    str += "\n\n\"morphTargets\": [\n";
    for (var i = 0; i < frames.length; ++i) {
        var frame = frames[i];
        var comma = ",";
        if (i >= frames.length - 1)
            comma = "";
        str += "{ \"name\": \"" + frame.name + "\", \"vertices\": ["
                + frame.vertices.toString() + "] }" + comma + "\n";
    }
    str += "],";
    // morphColors
    str += "\n\n\"morphColors\": [],";
    // normals
    str += "\n\n\"normals\": [],";
    // colors
    str += "\n\n\"colors\": [],";
    // uvs
    str += "\n\n\"uvs\": [[" + uvs.toString() + "]],";
    // faces
    str += "\n\n\"faces\": [" + faces.toString() + "]";
    // end
    str += "\n\n}";

    // info
    info.status = "Success";
    info.faces = header.num_tris;
    info.vertices = header.num_vertices;
    info.frames = header.num_frames;

    returnObject.string = str;
    return returnObject;
}
