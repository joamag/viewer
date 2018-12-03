<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename = 'css/layout.css') }}" />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <script src="{{ url_for('static', filename = 'libs/three/js/three_r99.js') }}"></script>
        <script src="{{ url_for('static', filename = 'libs/js/binary.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/util.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/stats.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/md2.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/obj.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/DDSLoader.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/MTLLoader.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/MorphAnimMesh.js') }}"></script>
        <script src="{{ url_for('static', filename = 'js/main.js') }}"></script>
        <title>3D Viewer</title>
    </head>
    <body>
        <div id="info" class="info"></div>
        <div id="status" class="status">
            <strong>MD2 to JSON Converter</strong>
            <p>
                A small tool to convert MD2 models<br/>
                (the old Quake 2 format) to the<br/>
                JSON format used by three.js (Rev. 47+)<br/>
            </p>
            <p>
                You should drag and drop a MD2 file<br/>
                somewhere on to this page and it will<br/>
                be converted and a preview of the<br/>
                wireframed mesh should appear.<br/>
            </p>
            <p>
                You can also drag and drop jpg/png<br/>
                textures once the mesh is visible.<br/>
            </p>
            <p>
                Note. You need a modern browser that<br/>
                supports WebGL for this to run the way<br/>
                it is intended.<br/>
                For example. Chrome or Firefox.<br/>
            </p>
            <p class="copyright">(C) Hive Solutions 2008-2018</p>
          </div>
    </body>
</html>
