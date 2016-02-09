// Hive Pong Game
// Copyright (c) 2008-2016 Hive Solutions Lda.
//
// This file is part of Hive Pong Game.
//
// Hive Pong Game is free software: you can redistribute it and/or modify
// it under the terms of the Apache License as published by the Apache
// Foundation, either version 2.0 of the License, or (at your option) any
// later version.
//
// Hive Pong Game is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// Apache License for more details.
//
// You should have received a copy of the Apache License along with
// Hive Pong Game. If not, see <http://www.apache.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2016 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0

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

    // creates the main structure that represents the state
    // of the current scene in an abstract fashion
    var state = {
        delta: 0.0,
        time: 0.0,
        oldTime: 0.0,
        scene: null,
        camera: null,
        renderer: null,
        geometry: null,
        material: null,
        mesh: null,
        mode: 0,
        filename: "md2",
        dropSprite: null,
        stats: null,
        mouseX: 0,
        mouseY: 0
    };

    var build = function() {
        // creates the scene object used to store the global
        // information on the scene to be rendered
        state.scene = new THREE.Scene();
        state.camera = new THREE.PerspectiveCamera(60, (window.innerWidth / window.innerHeight), 0.1, 1000);
        state.scene.add(state.camera);

        // creates the webgl renderer object and starts it with
        // the size of the current window and appends the renderer
        // element to the document body
        state.renderer = new THREE.WebGLRenderer();
        state.renderer.setClearColor(0x222222, 1.0);
        state.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(state.renderer.domElement);

        // creates a new statistics element to display frame rate
        // information and adds it to the bottom of the screen
        state.stats = new THREEx.Stats();
        state.stats.domElement.style.position = "absolute";
        state.stats.domElement.style.bottom = "0px";
        document.body.appendChild(state.stats.domElement);

        // registers the renderer for the resize of the window
        // so that the ratios are maintained and the camera position
        THREEx.WindowResize(state.renderer, state.camera);

        // creates the drop sprite value and add it to the current scene
        // object (in order to be able to drop it)
        var dropMaterial = REVISION >= 54 ? new THREE.SpriteMaterial({
            map: THREE.ImageUtils.loadTexture("static/images/drop_gfx.png"),
            useScreenCoordinates: false
        }) : {
            map: THREE.ImageUtils.loadTexture("static/images/drop_gfx.png"),
            useScreenCoordinates: false
        };
        state.dropSprite = new THREE.Sprite(dropMaterial);
        state.dropSprite.scale.set(1.0, 1.0, 0.0);
        state.scene.add(state.dropSprite);

        // updates the camera position so that it positions itself
        // at some distance from the scene
        state.camera.position.z = REVISION >= 53 ? 1.5 : 400.0;

        // registers the various event handlers associated with the
        // current scene state
        register();
    };

    var register = function() {
        // retrieves the reference to the top level
        // document element for the event registration
        var _document = jQuery(document);

        // registers for the handling of the various events
        // occurring over the document element
        _document.bind("drop", onDocumentDrop);
        _document.bind("dragover", onDocumentDragOver);
        _document.bind("dragleave", onDocumentLeave);
        _document.bind("mousedown", onDocumentMouseDown);
        _document.bind("mousemove", onDocumentMouseMove);
        _document.bind("mousewheel", onDocumentMouseWheel);
        _document.bind("DOMMouseScroll", onDocumentMouseWheel);
    };

    var loadImage = function(src) {
        var image = document.createElement("img");

        state.material.map = new THREE.Texture(image);
        state.material.map.flipY = false;
        state.material.wireframe = false;

        image.onload = function() {
            state.material.needsUpdate = true;
            state.geometry.buffersNeedUpdate = true;
            state.geometry.uvsNeedUpdate = true;
            state.material.map.needsUpdate = true;
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
        state.delta = time - state.oldTime;
        state.oldTime = time;

        // in case the drop sprite is defined must run the pulse
        // animation so that it grows and shrinks
        if (state.dropSprite) {
            var pulse = Math.sin(time / 200) / 40;
            state.dropSprite.scale.set(0.5 + pulse, 0.5 + pulse, 0);
        }

        // in case the mesh is defined must update its animation
        // and rotate it arround the y axis
        if (state.mesh) {
            state.mesh.updateAnimation(state.delta);
            state.mesh.rotation.y += 0.01;
        }

        // schedules the render of the current scene using
        // the provided camera reference
        state.renderer.render(state.scene, state.camera);

        // runs the update operation on the statistics object
        // so that new values should appear
        state.stats.update();
    };

    var onDocumentDrop = function(event) {
        // retrieves the current user agent value and tries to
        // verify if the current browser is chrome based
        var userAgent = navigator.userAgent.toLowerCase();
        var isChrome = userAgent.indexOf("chrome") != -1;

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
            // in case the current loading mode is one then this is the
            // loading of a texture image and so the proper logic must
            // be run, returning the control flow immediately after
            if (state.mode == 1) {
                loadImage(event.target.result);
                return;
            }

            // loads the md2 model file from the provided string that
            // should contain the contents of its source file, this should
            // create a json based representation of the model
            var model = THREEx.loadMd2(event.target.result, filename);

            // creates the html code that is going to provide information
            // to the user about either the model information or the status
            // of the loading of the model (in case there was a problem)
            var statusString = "<b>Status: </b>" + model.info.status + "<hr/>";
            if (model.info.status == "Success") {
                statusString += "<b>Name:</b> " + model.model.metadata.filename;
                statusString += "<br><b>Faces:</b> " + model.info.faces;
                statusString += "<br><b>Vertices:</b> " + model.info.vertices;
                statusString += "<br><b>Frames:</b> " + model.info.frames;
            } else {
                statusString = "<b>Status:</b> <font color=\"#cc0000\">" + model.info.status +
                    "</font><hr/>";
            }
            document.getElementById("status").innerHTML = statusString;
            document.getElementById("status").style.display = "block";
            document.getElementById("info").style.display = "block";

            // in case the result of the loading of the model is not success
            // returns immedietly as there's been a loading problem
            if (model.info.status != "Success") {
                return;
            }

            // creates a new json (model) loader and uses it to
            // start the loading of the model that was created
            var loader = new THREE.JSONLoader();
            var modelL = JSON.parse(model.string);
            var geometry = loader.parse(modelL);

            // in case there's a mesh loaded must remove it from
            // the scene not to be displayed anymore
            state.mesh && state.scene.remove(state.mesh);

            // in case the drop sprite is set must remove it from
            // the scene and delete the object
            if (state.dropSprite) {
                state.scene.remove(state.dropSprite);
                delete state.dropSprite;
            }

            // updates the geomtry reference in the state object with
            // the currently loaded geometry note that the map must be
            // resolve one more level
            state.geometry = geometry.geometry;

            // updates the camera position so that it positions itself
            // at some distance from the scene
            state.camera.position.z = 80;

            // creates a new material for the texture to be mapped in
            // the mesh, this will be loaded with the image later
            state.material = new THREE.MeshBasicMaterial({
                wireframe: true,
                morphTargets: !isChrome
            });

            // runs the computation of the various geometry values
            // so that it gets properly computed and ready to be used
            // in the mesh that is going to be created
            state.geometry.computeVertexNormals();
            state.geometry.computeFaceNormals();
            state.geometry.computeMorphNormals();

            // creates a new mesh with the computed mesh and then
            // defines both the scale and the duration of it
            state.mesh = new THREE.MorphAnimMesh(state.geometry, state.material);
            state.mesh.scale.set(1.0, 1.0, 1.0);
            state.mesh.duration = 1000 * (model.info.frames / 10);

            // calculates the bounding box for the geomtery
            // and then uses it's value to position the mesh
            // in the center of the screen
            state.mesh.geometry.computeBoundingBox();
            state.mesh.position.z = 0;
            state.mesh.position.y -= state.geometry.boundingBox.max.y / 2.0;

            // adds the "just" created mesh to current scene so that
            // it appears in the complete composition
            state.scene.add(state.mesh);
        };

        // retrieves both the extension and the name of the
        // the file that has been uploaded
        var extension = file.name.substr(file.name.length - 3).toLowerCase();
        var filename = file.name.substr(0, file.name.length - 4);

        if ((extension == "jpg" || extension == "png") && state.mesh) {
            state.mode = 1;
            reader.readAsDataURL(file);
        } else {
            state.mode = 0;
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

        var isDefined = typeof mouseX !== "undefined" && typeof mouseY !== "undefined";
        isDefined = isDefined && mouseX != null && mouseY != null;
        if (isDefined && state.mesh) {
            var deltaX = (event.pageX - mouseX) / 10;
            var deltaY = (event.pageY - mouseY) / 10;

            state.camera.position.x -= deltaX;
            state.camera.position.y += deltaY;
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

        if (state.mesh) {
            state.camera.position.z -= wheelData;
        }

        event.preventDefault();
    };

    // builds the complete scene, contructing all the elements
    // contained in it
    build();

    // calls the render operation so that the render process may
    // start (game start function)
    render();
});
