// Hive Three Extensions
// Copyright (c) 2008-2015 Hive Solutions Lda.
//
// This file is part of Hive Three Extensions.
//
// Hive Three Extensions is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Hive Three Extensions is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Hive Three Extensions. If not, see <http://www.gnu.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2010-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

var THREEx = THREEx || {};

/**
 * Updates renderer and camera when the window is resized.
 *
 * @param {Object}
 *            renderer the renderer to update.
 * @param {Object}
 *            Camera the camera to update.
 */
THREEx.WindowResize = function(renderer, camera) {
    var callback = function() {
        // notifies the renderer of the size change
        renderer.setSize(window.innerWidth, window.innerHeight);

        // updates the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    // binds the resize event and return the stop function that
    // allows the stopping of the window resizing
    window.addEventListener("resize", callback, false);
    return {
        stop : function() {
            window.removeEventListener("resize", callback);
        }
    };
}
