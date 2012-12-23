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

    // binds the resize event
    window.addEventListener("resize", callback, false);

    // return .stop() the function to stop watching window resize
    return {
        stop : function() {
            window.removeEventListener("resize", callback);
        }
    };
}
