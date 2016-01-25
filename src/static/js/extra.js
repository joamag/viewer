var md;

var container;

var camera, scene, renderer;

var has_gl = false;
var mouseX = 0;
var mouseY = 0;

var delta
var time;
var oldTime;

var mesh;
var material;
var mode = 0; // 0 = md2, 1 = jpg/png(texture);
var filename = "md2";
var dropSprite;

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDragOver, false);
document.addEventListener('dragleave', onDocumentLeave, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousewheel', onDocumentMouseWheel, false);
document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 400;
    scene.add(camera);

    dropSprite = new THREE.Sprite({
        map: THREE.ImageUtils.loadTexture("drop_gfx.png"),
        useScreenCoordinates: false
    });
    dropSprite.scale.set(0.5, 0.5, 0);
    scene.add(dropSprite);

    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColorHex(0x666666, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.autoClear = true;
        THREEx.WindowResize(renderer, camera);

        container.appendChild(renderer.domElement);
        has_gl = true;
    } catch (e) {
        // need webgl
    }

}

function onDocumentDrop(event) {

    event.preventDefault();

    var file = event.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {

        if (mode == 1) {
            loadImage(event.target.result);
            return;
        }

        md = MD2_converter(event.target.result, filename);

        var statusString = "<HR><B>Status:</B> " + md.info.status;
        if (md.info.status == "Success") {
            statusString += "<BR><B>Faces:</B> " + md.info.faces;
            statusString += "<BR><B>Vertices:</B> " + md.info.vertices;
            statusString += "<BR><B>Frames:</B> " + md.info.frames;
            statusString +=
                "<BR><BR><form id='save'><B>Save file:</B><BR><input type='text' size='8' align='right' value='" +
                filename +
                "' id='filename'/>.js&nbsp;<input type='submit' onclick='saveFile()' value=' Save '/><BR></form><BR>(Chrome will download it,<BR>&nbsp;Firefox will open it in a new window.<BR>&nbsp;Then choose to 'Save As')<HR>";
        } else {
            statusString = "<HR><B>Status:</B> <font color='#cc0000'>" + md.info.status + "</font><HR>";
        }
        document.getElementById('status').innerHTML = statusString;

        document.getElementById('info').style.display = "block";

        if (md.info.status != "Success") {
            return;
        }

        var loader = new THREE.JSONLoader();

        loader.createModel(JSON.parse(md.string), function(geometry) {

            if (mesh) {
                scene.remove(mesh);
            }
            if (dropSprite) {
                scene.remove(dropSprite);
                delete dropSprite;
            }

            material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: new THREE.Texture(),
                wireframe: true,
                morphTargets: true
            });

            mesh = new THREE.MorphAnimMesh(geometry, material);
            mesh.rotation.y = -Math.PI / 2;
            mesh.scale.set(5, 5, 5);
            mesh.duration = 1000 * (md.info.frames / 10);

            scene.add(mesh);
        });

    };

    var end = file.name.substr(file.name.length - 3).toLowerCase();
    filename = file.name.substr(0, file.name.length - 4);

    if ((end == "jpg" || end == "png") && mesh) {
        mode = 1;
        reader.readAsDataURL(file);
    } else {
        // assume md2...
        mode = 0;
        reader.readAsBinaryString(file);
    }

}

function saveFile() {
    var bb = new BlobBuilder();
    bb.append(md.string);
    var blob = bb.getBlob("text/json");
    saveAs(blob, document.getElementById('filename').value + ".js");
}

function loadImage(src) {
    var image = document.createElement('img');
    material.map.image = image;
    material.wireframe = false;

    image.onload = function() {
        material.map.needsUpdate = true;
    };

    image.src = src;
}

function onDocumentDragOver(event) {
    event.preventDefault();
}

function onDocumentLeave(event) {
    event.preventDefault();
}

function onDocumentMouseMove(event) {
    var windowHalfX = window.innerWidth >> 1;
    var windowHalfY = window.innerHeight >> 1;

    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function onDocumentMouseWheel(event) {
    var wheelData = 0;

    if (event.wheelDelta) { // Chrome
        wheelData = event.wheelDelta / 1000;
    } else if (event.detail) { // FireFox
        wheelData = -event.detail / 10;
    }

    if (mesh) {
        var scale = Math.max(mesh.scale.x + wheelData, 0);
        mesh.scale.set(scale, scale, scale);
    }

    event.preventDefault();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    if (isNaN(delta) || delta > 1000 || delta == 0) {
        delta = 1000 / 60;
    }

    if (mesh) {
        mesh.updateAnimation(delta);
        mesh.rotation.y += mouseX / 10000;
        mesh.position.y = -mouseY / 2;
    }

    if (dropSprite) {
        var pulse = Math.sin(time / 200) / 40;
        dropSprite.scale.set(0.5 + pulse, 0.5 + pulse, 0);
    }

    if (has_gl) {
        renderer.render(scene, camera);
    }
}
