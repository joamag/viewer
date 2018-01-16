// Hive Three Extensions
// Copyright (c) 2008-2018 Hive Solutions Lda.
//
// This file is part of Hive Three Extensions.
//
// Hive Three Extensions is free software: you can redistribute it and/or modify
// it under the terms of the Apache License as published by the Apache
// Foundation, either version 2.0 of the License, or (at your option) any
// later version.
//
// Hive Three Extensions is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// Apache License for more details.
//
// You should have received a copy of the Apache License along with
// Hive Three Extensions. If not, see <http://www.apache.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2018 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0

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
 *            filename The name of the md2 file to be coonverted.
 * @param {Integer}
 *            precision The amount of precision to be used in decimal calculus.
 * @return {String} The string representation of the json model file resulting
 *         from the conversion of the md2 model.
 */
THREEx.loadMd2 = function(file, filename, precision) {
    // default the decimal precision value to the default
    // one in case no parameter is provided
    precision = precision || 1;

    // crates the various structures to be used in the
    // creation of the model file
    var header = {};
    var frames = [];
    var uvs = [];
    var faces = [];
    var string = "";
    var info = {};
    var returnObject = {
        string: string,
        info: info
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
    for (var index = 0; index < header.num_st; index++) {
        var s = reader.readInt16() / header.skinwidth;
        var t = reader.readInt16() / header.skinheight;

        uvs.push(s);
        uvs.push(t);
    }

    // seeks the reader to the triangles offset position
    // and starts the reading of them
    reader.seek(header.offset_tris);
    for (var index = 0; index < header.num_tris; index++) {
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
    for (var index = 0; index < header.num_frames; index++) {
        var frame = {};
        frame.vertices = [];
        frame.name = "frame-" + String(index);
        frame.scale = {};
        frame.translate = {};

        frame.scale.x = reader.readFloat();
        frame.scale.y = reader.readFloat();
        frame.scale.z = reader.readFloat();

        frame.translate.x = reader.readFloat();
        frame.translate.y = reader.readFloat();
        frame.translate.z = reader.readFloat();

        frame.name = reader.readString(16).replace(/[^a-z0-9]/gi, "");

        for (var _index = 0; _index < header.num_vertices; _index++) {
            var tempX = reader.readUInt8();
            var tempY = reader.readUInt8();
            var tempZ = reader.readUInt8();
            var normal = reader.readUInt8();

            var xx = frame.scale.x * tempX + frame.translate.x;
            var yy = frame.scale.z * tempZ + frame.translate.z;
            var zz = frame.scale.y * tempY + frame.translate.y;

            frame.vertices.push(parseFloat(xx.toFixed(precision) * -1));
            frame.vertices.push(parseFloat(yy.toFixed(precision)));
            frame.vertices.push(parseFloat(zz.toFixed(precision)));
        }

        frames.push(frame);
    }

    // creates the morph targets by iterating by each
    // of the frames and creating the proper structure
    // with a name and a list of vertices
    var morphTargets = [];
    for (var index = 0; index < frames.length; index++) {
        var frame = frames[index];
        var morphTarget = {
            name: frame.name,
            vertices: frame.vertices
        };
        morphTargets.push(morphTarget);
    }

    // creates the model structure with the complete set
    // of data that is mandatory for the json model then
    // serializes it into a json string model
    var model = {
        metadata: {
            formatVersion: 3,
            filename: filename,
            description: "Model converted from " + filename + ".md2 using md2 to json converter."
        },
        scale: 1.0,
        materials: [{
            DbgColor: 15658734,
            DbgIndex: 0,
            DbgName: "md2_material"
        }],
        vertices: frames[0].vertices,
        morphTargets: morphTargets,
        morphColors: [],
        normals: [],
        colors: [],
        uvs: [uvs],
        faces: faces
    };

    // stores the original model in the return object that
    // is going to be returned to the caller method this way
    // it's possible to retrieve the original information
    returnObject.model = model;

    // converts the model structure into a json based string
    // so that it may be stored into a secondary storage as
    // a linear buffer of bytes (as expected)
    var modelS = JSON.stringify(model);

    // updates the information object to be returned
    // to the caller function with diagnostic information
    info.status = "Success";
    info.faces = header.num_tris;
    info.vertices = header.num_vertices;
    info.frames = header.num_frames;

    // sets the model string in the return object and
    // then returns the object to the caller method
    returnObject.string = modelS;
    return returnObject;
}
