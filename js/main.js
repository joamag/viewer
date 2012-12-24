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
    // creates the scene object used to store the global
    // information on the scene to be rendered
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75,
            (window.innerWidth / window.innerHeight), 0.1, 1000);

    // creates the webgl renderer object and starts it with
    // the size of the current window and appends the renderer
    // element to the document body
    var renderer = new THREE.WebGLRenderer({
                clearColor : 0x000000,
                clearAlpha : 1.0
            });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

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
    // scene.add(cube);

    // creates the drop sprite value and add it to the current scene
    // object (in order to be able to drop ip)
    var dropSprite = new THREE.Sprite({
                map : THREE.ImageUtils.loadTexture("images/drop_gfx.png"),
                useScreenCoordinates : false
            });
    dropSprite.scale.set(0.5, 0.5, 0);
    scene.add(dropSprite);

    // updates the camera position so that it positions itself
    // at some distance from the scene
    camera.position.z = 1.5;

    var register = function() {
        document.addEventListener("drop", onDocumentDrop, false);
        document.addEventListener("dragover", onDocumentDragOver, false);
        document.addEventListener("dragleave", onDocumentLeave, false);
        /*
         * document.addEventListener("mousemove", onDocumentMouseMove, false);
         * document.addEventListener("mousewheel", onDocumentMouseWheel, false);
         * document.addEventListener("DOMMouseScroll", onDocumentMouseWheel,
         * false);
         */
    };

    var onDocumentDrop = function(event) {
        // presents the default event (avoids unwanted window
        // redirections to the binary file)
        event.preventDefault();

        // retrieves the reference to the first file that is
        // going to be used as the model file to be laoded
        var file = event.dataTransfer.files[0];

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

                        material = new THREE.MeshBasicMaterial({
                                    color : 0xffffff,
                                    map : new THREE.Texture(),
                                    wireframe : true,
                                    morphTargets : true
                                });

                        mesh = new THREE.MorphAnimMesh(geometry, material);
                        mesh.rotation.y = -Math.PI / 2;
                        mesh.scale.set(5, 5, 5);
                        mesh.duration = 1000 * (model.info.frames / 10);

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

    function onDocumentDragOver(event) {
        event.preventDefault();
    }

    function onDocumentLeave(event) {
        event.preventDefault();
    }

    var render = function() {
        // requires the browser to repaint the area refered by the
        // render object (upad operation)
        requestAnimationFrame(render);

        // retrieves the current frame rendering time (to be used
        // as reference for sprite animation)
        var date = new Date();
        var time = date.getTime();

        if (dropSprite) {
            var pulse = Math.sin(time / 200) / 40;
            dropSprite.scale.set(0.5 + pulse, 0.5 + pulse, 0);
        }

        // increments the rotation of the cube by a simple
        // value (example rendering)
        cube.rotation.x += 0.1;
        cube.rotation.y += 0.1;

        // schedules the render of the current scene using
        // the provided camera reference
        renderer.render(scene, camera);
    };

    // calls the render operation so that the render process may
    // start (game start function)
    register();
    render();
});
