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
    scene.add(cube);

    // updates the camera position so that it positions itself
    // at some distance from the scene
    camera.position.z = 5;

    var render = function() {
        requestAnimationFrame(render);

        cube.rotation.x += 0.1;
        cube.rotation.y += 0.1;
        renderer.render(scene, camera);
    }

    // calls the render operation so that the render process may
    // start (game start function)
    render();
});
