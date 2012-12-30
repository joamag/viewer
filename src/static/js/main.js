// Hive Pong Game
// Copyright (C) 2008-2012 Hive Solutions Lda.
//
// This file is part of Hive Pong Game.
//
// Hive Pong Game is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Hive Pong Game is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Hive Pong Game. If not, see <http://www.gnu.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2010-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

jQuery(document).ready(function() {
    var status = jQuery(".status");
    var info = jQuery(".info");
    info.click(function() {
                var isVisible = status.is(":visible");
                if (isVisible) {
                    status.fadeOut(200);
                } else {
                    status.fadeIn(200);
                }
            });

    // retrieves the current revision for the three
    // library and convert it into an integer value for
    // comparision, this allows the conditional execution
    var REVISION = parseInt(THREE.REVISION);

    var delta
    var time;
    var oldTime;

    var mesh;
    var material;
    var mode = 0; // 0 = md2, 1 = jpg/png(texture);
    var filename = "md2";
    var dropSprite;

    var mouseX;
    var mouseY;

    // creates the scene object used to store the global
    // information on the scene to be rendered
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60,
            (window.innerWidth / window.innerHeight), 0.1, 1000);
    scene.add(camera);

    // creates the webgl renderer object and starts it with
    // the size of the current window and appends the renderer
    // element to the document body
    var renderer = new THREE.WebGLRenderer({
                clearColor : 0x666666,
                clearAlpha : 1.0
            });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // creates a new statistics element to display frame rate
    // information and adds it to the bottom of the screen
    var stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.bottom = "0px";
    document.body.appendChild(stats.domElement);

    // registers the renderer for the resize of the window
    // so that the ratios are maintained and the camera position
    THREEx.WindowResize(renderer, camera);

    // creates a new geometry for the cube object and a new material
    // then creates the mesh with and adds them to the scene
    var geometry = new THREE.CubeGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
                color : 0x00ff00
            });
    var cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);

    // creates the drop sprite value and add it to the current scene
    // object (in order to be able to drop it)
    var dropMaterial = REVISION >= 54 ? new THREE.SpriteMaterial({
                map : THREE.ImageUtils.loadTexture("static/images/drop_gfx.png"),
                useScreenCoordinates : false
            })
            : {
                map : THREE.ImageUtils.loadTexture("static/images/drop_gfx.png"),
                useScreenCoordinates : false
            };
    var dropSprite = new THREE.Sprite(dropMaterial);
    dropSprite.scale.set(1.0, 1.0, 0.0);
    scene.add(dropSprite);

    // updates the camera position so that it positions itself
    // at some distance from the scene
    camera.position.z = REVISION >= 53 ? 1.5 : 400.0;

    var register = function() {
        var _document = jQuery(document);

        _document.bind("drop", onDocumentDrop);
        _document.bind("dragover", onDocumentDragOver);
        _document.bind("dragleave", onDocumentLeave);
        _document.bind("mousedown", onDocumentMouseDown);
        _document.bind("mousemove", onDocumentMouseMove);
        _document.bind("mousewheel", onDocumentMouseWheel);
        _document.bind("DOMMouseScroll", onDocumentMouseWheel);
    };

    var onDocumentDrop = function(event) {
        // sets the event as the original event, retrieved
        // from the event structure
        var _event = event.originalEvent;

        // presents the default event (avoids unwanted window
        // redirections to the binary file)
        event.preventDefault();

        // retrieves the reference to the first file that is
        // going to be used as the model file to be laoded
        var file = _event.dataTransfer.files[0];

        // creates a new file reader object and register the
        // handler for the load event on it
        var reader = new FileReader();
        reader.onload = function(event) {
            if (mode == 1) {
                loadImage(event.target.result);
                return;
            }

            // loads the md2 model file from the provided string that
            // should contain the contents of its source file
            var model = THREEx.loadMd2(event.target.result, filename);

            var statusString = "<HR><B>Status:</B> " + model.info.status;
            if (model.info.status == "Success") {
                statusString += "<BR><B>Faces:</B> " + model.info.faces;
                statusString += "<BR><B>Vertices:</B> " + model.info.vertices;
                statusString += "<BR><B>Frames:</B> " + model.info.frames;
                statusString += "<BR><BR><form id='save'><B>Save file:</B><BR><input type='text' size='8' align='right' value='"
                        + filename
                        + "' id='filename'/>.js&nbsp;<input type='submit' onclick='saveFile()' value=' Save '/><BR></form><BR>(Chrome will download it,<BR>&nbsp;Firefox will open it in a new window.<BR>&nbsp;Then choose to 'Save As')<HR>";
            } else {
                statusString = "<HR><B>Status:</B> <font color='#cc0000'>"
                        + model.info.status + "</font><HR>";
            }
            document.getElementById("status").innerHTML = statusString;
            document.getElementById("info").style.display = "block";

            if (model.info.status != "Success") {
                return;
            }

            // creates a new json (model) loader and uses it to
            // start the loading of the model that was created
            var loader = new THREE.JSONLoader();
            loader.createModel(JSON.parse(model.string), function(geometry) {
                        // in case there's a mesh loaded must remove it from
                        // the scene not to be displayed anymore
                        mesh && scene.remove(mesh);

                        // in case the drop sprite is set must remove it from
                        // the scene and delete the object
                        if (dropSprite) {
                            scene.remove(dropSprite);
                            delete dropSprite;
                        }

                        // updates the camera position so that it positions itself
                        // at some distance from the scene
                        camera.position.z = 80;

                        material = new THREE.MeshBasicMaterial({
                                    color : 0xffffff,
                                    map : new THREE.Texture(),
                                    wireframe : true,
                                    morphTargets : true
                                });

                        mesh = new THREE.MorphAnimMesh(geometry, material);
                        mesh.rotation.y = -Math.PI / 2;
                        mesh.scale.set(1.0, 1.0, 1.0);
                        mesh.duration = 1000 * (model.info.frames / 10);

                        // @TODO: tenho de computar melhor o centro geo metrico do modelo
                        // tambem com base no min que la esta
                        mesh.geometry.computeBoundingBox();
                        mesh.position.y -= mesh.geometry.boundingBox.max.y
                                / 2.0;

                        // adds the "just" created mesh to current scene so that
                        // it appears in the complete composition
                        scene.add(mesh);
                    });
        };

        // retrieves both the extension and the name of the
        // the file that has been uploaded
        var extension = file.name.substr(file.name.length - 3).toLowerCase();
        var filename = file.name.substr(0, file.name.length - 4);

        if ((extension == "jpg" || extension == "png") && mesh) {
            mode = 1;
            reader.readAsDataURL(file);
        } else {
            mode = 0;
            reader.readAsBinaryString(file);
        }
    }

    var onDocumentDragOver = function(event) {
        event.preventDefault();
    };

    var onDocumentLeave = function(event) {
        event.preventDefault();
    };

    var onDocumentMouseDown = function(event) {
        mouseX = null;
        mouseY = null;

        event.preventDefault();
    };

    var onDocumentMouseMove = function(event) {
        if (event.which != 1) {
            return;
        }

        var isDefined = mouseX != null && mouseY != null;
        if (isDefined && mesh) {
            var deltaX = (event.pageX - mouseX) / 10;
            var deltaY = (event.pageY - mouseY) / 10;

            camera.position.x -= deltaX;
            camera.position.y += deltaY;
        }

        mouseX = event.pageX;
        mouseY = event.pageY;

        event.preventDefault();
    };

    var onDocumentMouseWheel = function(event) {
        // sets the event as the original event, retrieved
        // from the event structure
        var _event = event.originalEvent;

        var wheelData = 0;

        if (_event.wheelDelta) {
            wheelData = _event.wheelDelta / 100;
        } else if (_event.detail) {
            wheelData = -_event.detail;
        }

        if (mesh) {
            camera.position.z -= wheelData;
        }

        event.preventDefault();
    };

    var loadImage = function(src) {
        var image = document.createElement('img');
        material.map.image = image;
        material.wireframe = false;
        material.map.flipY = false;

        image.onload = function() {
            material.map.needsUpdate = true;
        };

        image.src = src;
    };

    var render = function() {
        // requires the browser to repaint the area refered by the
        // render object (upad operation)
        requestAnimationFrame(render);

        // retrieves the current frame rendering time (to be used
        // as reference for sprite animation) and calculates the
        // delta time from the old time and the sets the current
        // time as the "new" old time value
        var date = new Date();
        var time = date.getTime();
        delta = time - oldTime;
        oldTime = time;

        // in case the drop sprite is defined must run the pulse
        // animation so that it grows and shrinks
        if (dropSprite) {
            var pulse = Math.sin(time / 200) / 40;
            dropSprite.scale.set(0.5 + pulse, 0.5 + pulse, 0);
        }

        // in case the mesh is defined must update its animation
        // and rotate it arround the y axis
        if (mesh) {
            mesh.updateAnimation(delta);
            mesh.rotation.y += 0.01;
        }

        // increments the rotation of the cube by a simple
        // value (example rendering)
        cube.rotation.x += 0.1;
        cube.rotation.y += 0.1;

        // schedules the render of the current scene using
        // the provided camera reference
        renderer.render(scene, camera);

        // runs the update operation on the statistics object
        // so that new values should appear
        stats.update();
    };

    // calls the render operation so that the render process may
    // start (game start function)
    register();
    render();
});
