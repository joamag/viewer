# 3D Viewer three.js

Simple 3D model viewer created with [three.js](https://threejs.org).

You can test the solution [here](https://viewer.stage.hive.pt/).

## Goal

Provide a simple solution for [MD2](http://tfc.duke.free.fr/coding/md2-specs-en.html) file visualization using only web tools.

## Problems

Currently there are some issues with activating the morphing animations with Chrome. This problem
is related with the fact that the mesh is created and loaded only after the first frame has already
been rendered, creating problems in the normal shading rendering.
