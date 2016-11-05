# Pong three.js

Simple pong game created with three.js.

## Problems

Currently there are some issues with activating the morphing animations with Chrome. This problem
is related with the fact that the mesh is created and loaded only after the first frame has already
been rendered, creating problems in the normal shading rendering.
