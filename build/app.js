(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var THREEx = THREEx || {}

/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
THREEx.createAtmosphereMaterial = function () {
    var vertexShader = [
        'varying vec3	vVertexWorldPosition;',
        'varying vec3	vVertexNormal;',

        'void main(){',
        '	vVertexNormal	= normalize(normalMatrix * normal);',

        '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

        '	// set gl_Position',
        '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',

    ].join('\n')
    var fragmentShader = [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',

        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',

        'void main(){',
        '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
        '	viewCameraToVertex	= normalize(viewCameraToVertex);',
        '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
        '	gl_FragColor		= vec4(glowColor, intensity);',
        '}',
    ].join('\n')

    // create custom material from the shader code above
    //   that is within specially labeled script tags
    var material = new THREE.ShaderMaterial({
        uniforms: {
            coeficient: {
                type: "f",
                value: 1.0
            },
            power: {
                type: "f",
                value: 2
            },
            glowColor: {
                type: "c",
                value: new THREE.Color('pink')
            },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        //blending	: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
    });
    return material
}

module.exports = THREEx;

},{}],2:[function(require,module,exports){
var THREEx = THREEx || {}

THREEx.Planets = {}

THREEx.Planets.baseURL = './lib/'

// from http://planetpixelemporium.com/

THREEx.Planets.createSun = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/sunmap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createMercury = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/mercurymap.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/mercurybump.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createVenus = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/venusmap.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/venusbump.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createEarth = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthbump1k.jpg'),
        bumpScale: 0.05,
        specularMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthspec1k.jpg'),
        specular: new THREE.Color('grey'),
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createEarthCloud = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 1024
    canvasResult.height = 512
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0]
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/earthcloudmaptrans.jpg';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/earthcloudmap.jpg';

    var geometry = new THREE.SphereGeometry(0.51, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createMoon = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/moonmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/moonbump1k.jpg'),
        bumpScale: 0.002,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createMars = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/marsmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/marsbump1k.jpg'),
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createJupiter = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/jupitermap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.02,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createSaturn = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/saturnmap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createSaturnRing = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 915
    canvasResult.height = 64
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasResult.width, canvasResult.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0] / 4
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/saturnringpattern.gif';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/saturnringcolor.jpg';

    var geometry = new THREEx.Planets._RingGeometry(0.55, 0.75, 64);
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        // map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/ash_uvgrid01.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    mesh.lookAt(new THREE.Vector3(0.5, -4, 1))
    return mesh
}


THREEx.Planets.createUranus = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/uranusmap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createUranusRing = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 1024
    canvasResult.height = 72
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasResult.width, canvasResult.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0] / 2
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/uranusringtrans.gif';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/uranusringcolour.jpg';

    var geometry = new THREEx.Planets._RingGeometry(0.55, 0.75, 64);
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        // map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/ash_uvgrid01.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    mesh.lookAt(new THREE.Vector3(0.5, -4, 1))
    return mesh
}


THREEx.Planets.createNeptune = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/neptunemap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createPluto = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/plutomap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/plutobump1k.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createStarfield = function () {
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/galaxy_starfield.png')
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    })
    var geometry = new THREE.SphereGeometry(100, 32, 32)
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * change the original from three.js because i needed different UV
 *
 * @author Kaleb Murphy
 * @author jerome etienne
 */
THREEx.Planets._RingGeometry = function (innerRadius, outerRadius, thetaSegments) {

    THREE.Geometry.call(this)

    innerRadius = innerRadius || 0
    outerRadius = outerRadius || 50
    thetaSegments = thetaSegments || 8

    var normal = new THREE.Vector3(0, 0, 1)

    for (var i = 0; i < thetaSegments; i++) {
        var angleLo = (i / thetaSegments) * Math.PI * 2
        var angleHi = ((i + 1) / thetaSegments) * Math.PI * 2

        var vertex1 = new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
        var vertex2 = new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
        var vertex3 = new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
        var vertex4 = new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

        this.vertices.push(vertex1);
        this.vertices.push(vertex2);
        this.vertices.push(vertex3);
        this.vertices.push(vertex4);


        var vertexIdx = i * 4;

        // Create the first triangle
        var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
        var uvs = []

        var uv = new THREE.Vector2(0, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(0, 1)
        uvs.push(uv)

        this.faces.push(face);
        this.faceVertexUvs[0].push(uvs);

        // Create the second triangle
        var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
        var uvs = []

        var uv = new THREE.Vector2(0, 1)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 1)
        uvs.push(uv)

        this.faces.push(face);
        this.faceVertexUvs[0].push(uvs);
    }

    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), outerRadius);

};
THREEx.Planets._RingGeometry.prototype = Object.create(THREE.Geometry.prototype);


module.exports = THREEx;

},{}],3:[function(require,module,exports){
//Dependencies
var planets = require('./lib/threex.planets');
var atmosphere = require('./lib/threex.atmospherematerial');
//Config
var container = document.getElementById('scene');
var scene;
var camera;
var fieldOfView;
var aspectRatio;
var renderer;
var nearPlane;
var farPlane;
var controls;
var gui;
//Lights
var light;
var shadowLight;

//Constants
const ENV = 'dev';
var HEIGHT;
var WIDTH;

//Global
var onRenderContainer = [];
var lastTimeMsec = null

function appendScene() {
    container.appendChild(renderer.domElement);
}
function addLights() {
    light = new THREE.AmbientLight(0xffffff)

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;
    shadowLight.shadowCameraNear = 0.01
    shadowLight.shadowCameraFar = 15
    shadowLight.shadowCameraFov = 45

    shadowLight.shadowCameraLeft = -1
    shadowLight.shadowCameraRight = 1
    shadowLight.shadowCameraTop = 1
    shadowLight.shadowCameraBottom = -1

    shadowLight.shadowBias = 0.001
    shadowLight.shadowDarkness = 0.2

    shadowLight.shadowMapWidth = 1024
    shadowLight.shadowMapHeight = 1024
    scene.add(shadowLight);
    scene.add(light);
}
function isDev() {
    return ENV == 'dev';
}
function addCamera() {
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane);
    camera.position.z = 500;
    camera.position.y = 300;
    camera.lookAt(new THREE.Vector3(0, 200, 0));
}
function addControls() {
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [65, 83, 68];
    controls.addEventListener('change', render);
}
function configureScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 2000, 4000);

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 100;
    farPlane = 20000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    //addLights();


}
function animate(number) {
    render();
    if (typeof number == 'undefined') {
        number = 0;
    }
    lastTimeMsec = lastTimeMsec || number - 1000 / 60
    var deltaMsec = Math.min(200, number - lastTimeMsec)
    lastTimeMsec = number
    // call each update function
    onRenderContainer.forEach(function (onRenderContainer) {
        onRenderContainer(deltaMsec / 1000, number / 1000)
    })
    requestAnimationFrame(animate);
    controls.update();
}
function render() {
    renderer.render(scene, camera);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function generateColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    var rgb = hexToRgb(color);
    return new THREE.Color("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
}
function gui() {
    gui = new dat.GUI();
    var params = {
        test: 1000
    };
    gui.add(params, 'test');
}
function addPlanets() {
    var containerEarth = new THREE.Object3D();
    containerEarth.rotateZ(-23.4 * Math.PI / 180);
    containerEarth.position.z = 0;
    containerEarth.scale.set(300, 300, 300);
    scene.add(containerEarth);

    var earthMesh = planets.Planets.createEarth();
    earthMesh.rotation.y = 0;
    earthMesh.receiveShadow = true;
    earthMesh.castShadow = true;
    containerEarth.add(earthMesh);
    onRenderContainer.push(function (delta, now) {
        earthMesh.rotation.y += 1 / 32 * delta;
    });

    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = atmosphere.createAtmosphereMaterial()
    material.uniforms.glowColor.value.set(0x00b3ff)
    material.uniforms.coeficient.value = 0.8
    material.uniforms.power.value = 2.0
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(1.01);
    containerEarth.add(mesh);

    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = atmosphere.createAtmosphereMaterial()
    material.side = THREE.BackSide
    material.uniforms.glowColor.value.set(0x00b3ff)
    material.uniforms.coeficient.value = 0.5
    material.uniforms.power.value = 4.0
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(1.15);
    containerEarth.add(mesh);

    var earthCloud = planets.Planets.createEarthCloud();
    earthCloud.receiveShadow = true;
    earthCloud.castShadow = true;
    containerEarth.add(earthCloud);
    console.log(containerEarth);
    onRenderContainer.push(function (delta, now) {
        earthCloud.rotation.y += 1 / 8 * delta;
    });
}
function init() {
    configureScene();
    addPlanets();
    appendScene();
    if (isDev()) {
        gui();
    }
    animate();
}
init();

},{"./lib/threex.atmospherematerial":1,"./lib/threex.planets":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvdGhyZWV4LmF0bW9zcGhlcmVtYXRlcmlhbC5qcyIsImxpYi90aHJlZXgucGxhbmV0cy5qcyIsInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRIUkVFeCA9IFRIUkVFeCB8fCB7fVxuXG4vKipcbiAqIGZyb20gaHR0cDovL3N0ZW1rb3NraS5ibG9nc3BvdC5mci8yMDEzLzA3L3NoYWRlcnMtaW4tdGhyZWVqcy1nbG93LWFuZC1oYWxvLmh0bWxcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICovXG5USFJFRXguY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBbXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dlZlcnRleE5vcm1hbFx0PSBub3JtYWxpemUobm9ybWFsTWF0cml4ICogbm9ybWFsKTsnLFxuXG4gICAgICAgICdcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uXHQ9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnLFxuXG4gICAgICAgICdcdC8vIHNldCBnbF9Qb3NpdGlvbicsXG4gICAgICAgICdcdGdsX1Bvc2l0aW9uXHQ9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApOycsXG4gICAgICAgICd9JyxcblxuICAgIF0uam9pbignXFxuJylcbiAgICB2YXIgZnJhZ21lbnRTaGFkZXIgPSBbXG4gICAgICAgICd1bmlmb3JtIHZlYzNcdGdsb3dDb2xvcjsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0Y29lZmljaWVudDsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0cG93ZXI7JyxcblxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZlYzMgd29ybGRDYW1lcmFUb1ZlcnRleD0gdlZlcnRleFdvcmxkUG9zaXRpb24gLSBjYW1lcmFQb3NpdGlvbjsnLFxuICAgICAgICAnXHR2ZWMzIHZpZXdDYW1lcmFUb1ZlcnRleFx0PSAodmlld01hdHJpeCAqIHZlYzQod29ybGRDYW1lcmFUb1ZlcnRleCwgMC4wKSkueHl6OycsXG4gICAgICAgICdcdHZpZXdDYW1lcmFUb1ZlcnRleFx0PSBub3JtYWxpemUodmlld0NhbWVyYVRvVmVydGV4KTsnLFxuICAgICAgICAnXHRmbG9hdCBpbnRlbnNpdHlcdFx0PSBwb3coY29lZmljaWVudCArIGRvdCh2VmVydGV4Tm9ybWFsLCB2aWV3Q2FtZXJhVG9WZXJ0ZXgpLCBwb3dlcik7JyxcbiAgICAgICAgJ1x0Z2xfRnJhZ0NvbG9yXHRcdD0gdmVjNChnbG93Q29sb3IsIGludGVuc2l0eSk7JyxcbiAgICAgICAgJ30nLFxuICAgIF0uam9pbignXFxuJylcblxuICAgIC8vIGNyZWF0ZSBjdXN0b20gbWF0ZXJpYWwgZnJvbSB0aGUgc2hhZGVyIGNvZGUgYWJvdmVcbiAgICAvLyAgIHRoYXQgaXMgd2l0aGluIHNwZWNpYWxseSBsYWJlbGVkIHNjcmlwdCB0YWdzXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgIGNvZWZpY2llbnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMS4wXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG93ZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdsb3dDb2xvcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJ3BpbmsnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsXG4gICAgICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcbiAgICAgICAgLy9ibGVuZGluZ1x0OiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGVyaWFsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUV4O1xuIiwidmFyIFRIUkVFeCA9IFRIUkVFeCB8fCB7fVxuXG5USFJFRXguUGxhbmV0cyA9IHt9XG5cblRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgPSAnLi9saWIvJ1xuXG4vLyBmcm9tIGh0dHA6Ly9wbGFuZXRwaXhlbGVtcG9yaXVtLmNvbS9cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU3VuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc3VubWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVNZXJjdXJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWVyY3VyeW1hcC5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tZXJjdXJ5YnVtcC5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVZlbnVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdmVudXNtYXAuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdmVudXNidW1wLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlRWFydGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aG1hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgICAgIHNwZWN1bGFyTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoc3BlYzFrLmpwZycpLFxuICAgICAgICBzcGVjdWxhcjogbmV3IFRIUkVFLkNvbG9yKCdncmV5JyksXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVFYXJ0aENsb3VkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGNyZWF0ZSBkZXN0aW5hdGlvbiBjYW52YXNcbiAgICB2YXIgY2FudmFzUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXNSZXN1bHQud2lkdGggPSAxMDI0XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDUxMlxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aGNsb3VkbWFwdHJhbnMuanBnJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZWFydGhjbG91ZG1hcC5qcGcnO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNTEsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU1vb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tb29ubWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbW9vbmJ1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwMixcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU1hcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tYXJzbWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWFyc2J1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlSnVwaXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2p1cGl0ZXJtYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMixcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU2F0dXJuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJubWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVNhdHVyblJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY3JlYXRlIGRlc3RpbmF0aW9uIGNhbnZhc1xuICAgIHZhciBjYW52YXNSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIGNhbnZhc1Jlc3VsdC53aWR0aCA9IDkxNVxuICAgIGNhbnZhc1Jlc3VsdC5oZWlnaHQgPSA2NFxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNSZXN1bHQud2lkdGgsIGNhbnZhc1Jlc3VsdC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXSAvIDRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGV4dHVyZSB3aXRoIHJlc3VsdFxuICAgICAgICAgICAgY29udGV4dFJlc3VsdC5wdXRJbWFnZURhdGEoZGF0YVJlc3VsdCwgMCwgMClcbiAgICAgICAgICAgIG1hdGVyaWFsLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgICAgIGltYWdlVHJhbnMuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJucmluZ3BhdHRlcm4uZ2lmJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJucmluZ2NvbG9yLmpwZyc7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeSgwLjU1LCAwLjc1LCA2NCk7XG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXNSZXN1bHQpLFxuICAgICAgICAvLyBtYXBcdFx0OiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwrJ2ltYWdlcy9hc2hfdXZncmlkMDEuanBnJyksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICBtZXNoLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLjUsIC00LCAxKSlcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVVyYW51cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3VyYW51c21hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlVXJhbnVzUmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjcmVhdGUgZGVzdGluYXRpb24gY2FudmFzXG4gICAgdmFyIGNhbnZhc1Jlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzUmVzdWx0LndpZHRoID0gMTAyNFxuICAgIGNhbnZhc1Jlc3VsdC5oZWlnaHQgPSA3MlxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNSZXN1bHQud2lkdGgsIGNhbnZhc1Jlc3VsdC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXSAvIDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGV4dHVyZSB3aXRoIHJlc3VsdFxuICAgICAgICAgICAgY29udGV4dFJlc3VsdC5wdXRJbWFnZURhdGEoZGF0YVJlc3VsdCwgMCwgMClcbiAgICAgICAgICAgIG1hdGVyaWFsLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgICAgIGltYWdlVHJhbnMuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzcmluZ3RyYW5zLmdpZic7XG4gICAgfSwgZmFsc2UpO1xuICAgIGltYWdlTWFwLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3VyYW51c3Jpbmdjb2xvdXIuanBnJztcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5KDAuNTUsIDAuNzUsIDY0KTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIC8vIG1hcFx0XHQ6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCsnaW1hZ2VzL2FzaF91dmdyaWQwMS5qcGcnKSxcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIG1lc2gubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAuNSwgLTQsIDEpKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTmVwdHVuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL25lcHR1bmVtYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlUGx1dG8gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9wbHV0b21hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3BsdXRvYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU3RhcmZpZWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9nYWxheHlfc3RhcmZpZWxkLnBuZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxuICAgIH0pXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMCwgMzIsIDMyKVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cdFx0Y29tbWVudFx0XHRcdFx0XHRcdFx0XHQvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIGNoYW5nZSB0aGUgb3JpZ2luYWwgZnJvbSB0aHJlZS5qcyBiZWNhdXNlIGkgbmVlZGVkIGRpZmZlcmVudCBVVlxuICpcbiAqIEBhdXRob3IgS2FsZWIgTXVycGh5XG4gKiBAYXV0aG9yIGplcm9tZSBldGllbm5lXG4gKi9cblRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkgPSBmdW5jdGlvbiAoaW5uZXJSYWRpdXMsIG91dGVyUmFkaXVzLCB0aGV0YVNlZ21lbnRzKSB7XG5cbiAgICBUSFJFRS5HZW9tZXRyeS5jYWxsKHRoaXMpXG5cbiAgICBpbm5lclJhZGl1cyA9IGlubmVyUmFkaXVzIHx8IDBcbiAgICBvdXRlclJhZGl1cyA9IG91dGVyUmFkaXVzIHx8IDUwXG4gICAgdGhldGFTZWdtZW50cyA9IHRoZXRhU2VnbWVudHMgfHwgOFxuXG4gICAgdmFyIG5vcm1hbCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDEpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoZXRhU2VnbWVudHM7IGkrKykge1xuICAgICAgICB2YXIgYW5nbGVMbyA9IChpIC8gdGhldGFTZWdtZW50cykgKiBNYXRoLlBJICogMlxuICAgICAgICB2YXIgYW5nbGVIaSA9ICgoaSArIDEpIC8gdGhldGFTZWdtZW50cykgKiBNYXRoLlBJICogMlxuXG4gICAgICAgIHZhciB2ZXJ0ZXgxID0gbmV3IFRIUkVFLlZlY3RvcjMoaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUxvKSwgaW5uZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUxvKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXgyID0gbmV3IFRIUkVFLlZlY3RvcjMob3V0ZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUxvKSwgb3V0ZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUxvKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXgzID0gbmV3IFRIUkVFLlZlY3RvcjMoaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUhpKSwgaW5uZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUhpKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXg0ID0gbmV3IFRIUkVFLlZlY3RvcjMob3V0ZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUhpKSwgb3V0ZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUhpKSwgMCk7XG5cbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDEpO1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4Mik7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgzKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDQpO1xuXG5cbiAgICAgICAgdmFyIHZlcnRleElkeCA9IGkgKiA0O1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZmlyc3QgdHJpYW5nbGVcbiAgICAgICAgdmFyIGZhY2UgPSBuZXcgVEhSRUUuRmFjZTModmVydGV4SWR4ICsgMCwgdmVydGV4SWR4ICsgMSwgdmVydGV4SWR4ICsgMiwgbm9ybWFsKTtcbiAgICAgICAgdmFyIHV2cyA9IFtdXG5cbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMCwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDApXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcblxuICAgICAgICB0aGlzLmZhY2VzLnB1c2goZmFjZSk7XG4gICAgICAgIHRoaXMuZmFjZVZlcnRleFV2c1swXS5wdXNoKHV2cyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBzZWNvbmQgdHJpYW5nbGVcbiAgICAgICAgdmFyIGZhY2UgPSBuZXcgVEhSRUUuRmFjZTModmVydGV4SWR4ICsgMiwgdmVydGV4SWR4ICsgMSwgdmVydGV4SWR4ICsgMywgbm9ybWFsKTtcbiAgICAgICAgdmFyIHV2cyA9IFtdXG5cbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMCwgMSlcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDApXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigxLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcblxuICAgICAgICB0aGlzLmZhY2VzLnB1c2goZmFjZSk7XG4gICAgICAgIHRoaXMuZmFjZVZlcnRleFV2c1swXS5wdXNoKHV2cyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb21wdXRlQ2VudHJvaWRzKCk7XG4gICAgdGhpcy5jb21wdXRlRmFjZU5vcm1hbHMoKTtcblxuICAgIHRoaXMuYm91bmRpbmdTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlKG5ldyBUSFJFRS5WZWN0b3IzKCksIG91dGVyUmFkaXVzKTtcblxufTtcblRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5HZW9tZXRyeS5wcm90b3R5cGUpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUV4O1xuIiwiLy9EZXBlbmRlbmNpZXNcbnZhciBwbGFuZXRzID0gcmVxdWlyZSgnLi9saWIvdGhyZWV4LnBsYW5ldHMnKTtcbnZhciBhdG1vc3BoZXJlID0gcmVxdWlyZSgnLi9saWIvdGhyZWV4LmF0bW9zcGhlcmVtYXRlcmlhbCcpO1xuLy9Db25maWdcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKTtcbnZhciBzY2VuZTtcbnZhciBjYW1lcmE7XG52YXIgZmllbGRPZlZpZXc7XG52YXIgYXNwZWN0UmF0aW87XG52YXIgcmVuZGVyZXI7XG52YXIgbmVhclBsYW5lO1xudmFyIGZhclBsYW5lO1xudmFyIGNvbnRyb2xzO1xudmFyIGd1aTtcbi8vTGlnaHRzXG52YXIgbGlnaHQ7XG52YXIgc2hhZG93TGlnaHQ7XG5cbi8vQ29uc3RhbnRzXG5jb25zdCBFTlYgPSAnZGV2JztcbnZhciBIRUlHSFQ7XG52YXIgV0lEVEg7XG5cbi8vR2xvYmFsXG52YXIgb25SZW5kZXJDb250YWluZXIgPSBbXTtcbnZhciBsYXN0VGltZU1zZWMgPSBudWxsXG5cbmZ1bmN0aW9uIGFwcGVuZFNjZW5lKCkge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGFkZExpZ2h0cygpIHtcbiAgICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpXG5cbiAgICBzaGFkb3dMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAuOCk7XG4gICAgc2hhZG93TGlnaHQucG9zaXRpb24uc2V0KDIwMCwgMjAwLCAyMDApO1xuICAgIHNoYWRvd0xpZ2h0LmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgIHNoYWRvd0xpZ2h0LnNoYWRvd0RhcmtuZXNzID0gLjI7XG4gICAgc2hhZG93TGlnaHQuc2hhZG93Q2FtZXJhTmVhciA9IDAuMDFcbiAgICBzaGFkb3dMaWdodC5zaGFkb3dDYW1lcmFGYXIgPSAxNVxuICAgIHNoYWRvd0xpZ2h0LnNoYWRvd0NhbWVyYUZvdiA9IDQ1XG5cbiAgICBzaGFkb3dMaWdodC5zaGFkb3dDYW1lcmFMZWZ0ID0gLTFcbiAgICBzaGFkb3dMaWdodC5zaGFkb3dDYW1lcmFSaWdodCA9IDFcbiAgICBzaGFkb3dMaWdodC5zaGFkb3dDYW1lcmFUb3AgPSAxXG4gICAgc2hhZG93TGlnaHQuc2hhZG93Q2FtZXJhQm90dG9tID0gLTFcblxuICAgIHNoYWRvd0xpZ2h0LnNoYWRvd0JpYXMgPSAwLjAwMVxuICAgIHNoYWRvd0xpZ2h0LnNoYWRvd0RhcmtuZXNzID0gMC4yXG5cbiAgICBzaGFkb3dMaWdodC5zaGFkb3dNYXBXaWR0aCA9IDEwMjRcbiAgICBzaGFkb3dMaWdodC5zaGFkb3dNYXBIZWlnaHQgPSAxMDI0XG4gICAgc2NlbmUuYWRkKHNoYWRvd0xpZ2h0KTtcbiAgICBzY2VuZS5hZGQobGlnaHQpO1xufVxuZnVuY3Rpb24gaXNEZXYoKSB7XG4gICAgcmV0dXJuIEVOViA9PSAnZGV2Jztcbn1cbmZ1bmN0aW9uIGFkZENhbWVyYSgpIHtcbiAgICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgIGZpZWxkT2ZWaWV3LFxuICAgICAgICBhc3BlY3RSYXRpbyxcbiAgICAgICAgbmVhclBsYW5lLFxuICAgICAgICBmYXJQbGFuZSk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnogPSA1MDA7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnkgPSAzMDA7XG4gICAgY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAyMDAsIDApKTtcbn1cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKCkge1xuICAgIGNvbnRyb2xzID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKGNhbWVyYSk7XG4gICAgY29udHJvbHMudGFyZ2V0LnNldCgwLCAwLCAwKTtcbiAgICBjb250cm9scy5yb3RhdGVTcGVlZCA9IDEuMDtcbiAgICBjb250cm9scy56b29tU3BlZWQgPSAxLjI7XG4gICAgY29udHJvbHMucGFuU3BlZWQgPSAwLjg7XG5cbiAgICBjb250cm9scy5ub1pvb20gPSBmYWxzZTtcbiAgICBjb250cm9scy5ub1BhbiA9IGZhbHNlO1xuXG4gICAgY29udHJvbHMuc3RhdGljTW92aW5nID0gdHJ1ZTtcbiAgICBjb250cm9scy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMztcblxuICAgIGNvbnRyb2xzLmtleXMgPSBbNjUsIDgzLCA2OF07XG4gICAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVuZGVyKTtcbn1cbmZ1bmN0aW9uIGNvbmZpZ3VyZVNjZW5lKCkge1xuICAgIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgc2NlbmUuZm9nID0gbmV3IFRIUkVFLkZvZygweDA1MDUwNSwgMjAwMCwgNDAwMCk7XG5cbiAgICBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBhc3BlY3RSYXRpbyA9IFdJRFRIIC8gSEVJR0hUO1xuICAgIGZpZWxkT2ZWaWV3ID0gNjA7XG4gICAgbmVhclBsYW5lID0gMTAwO1xuICAgIGZhclBsYW5lID0gMjAwMDA7XG4gICAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWUsIGFudGlhbGlhczogdHJ1ZX0pO1xuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEpO1xuICAgIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG4gICAgcmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgYWRkQ2FtZXJhKCk7XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgICAgYWRkQ29udHJvbHMoKTtcbiAgICB9XG4gICAgLy9hZGRMaWdodHMoKTtcblxuXG59XG5mdW5jdGlvbiBhbmltYXRlKG51bWJlcikge1xuICAgIHJlbmRlcigpO1xuICAgIGlmICh0eXBlb2YgbnVtYmVyID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG51bWJlciA9IDA7XG4gICAgfVxuICAgIGxhc3RUaW1lTXNlYyA9IGxhc3RUaW1lTXNlYyB8fCBudW1iZXIgLSAxMDAwIC8gNjBcbiAgICB2YXIgZGVsdGFNc2VjID0gTWF0aC5taW4oMjAwLCBudW1iZXIgLSBsYXN0VGltZU1zZWMpXG4gICAgbGFzdFRpbWVNc2VjID0gbnVtYmVyXG4gICAgLy8gY2FsbCBlYWNoIHVwZGF0ZSBmdW5jdGlvblxuICAgIG9uUmVuZGVyQ29udGFpbmVyLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyQ29udGFpbmVyKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyKGRlbHRhTXNlYyAvIDEwMDAsIG51bWJlciAvIDEwMDApXG4gICAgfSlcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG59XG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG59XG5mdW5jdGlvbiBoZXhUb1JnYihoZXgpIHtcbiAgICB2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KVxuICAgIH0gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcbiAgICB2YXIgY29sb3IgPSAnIyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xuICAgIH1cbiAgICB2YXIgcmdiID0gaGV4VG9SZ2IoY29sb3IpO1xuICAgIHJldHVybiBuZXcgVEhSRUUuQ29sb3IoXCJyZ2IoXCIgKyByZ2IuciArIFwiLFwiICsgcmdiLmcgKyBcIixcIiArIHJnYi5iICsgXCIpXCIpO1xufVxuZnVuY3Rpb24gZ3VpKCkge1xuICAgIGd1aSA9IG5ldyBkYXQuR1VJKCk7XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgdGVzdDogMTAwMFxuICAgIH07XG4gICAgZ3VpLmFkZChwYXJhbXMsICd0ZXN0Jyk7XG59XG5mdW5jdGlvbiBhZGRQbGFuZXRzKCkge1xuICAgIHZhciBjb250YWluZXJFYXJ0aCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgIGNvbnRhaW5lckVhcnRoLnJvdGF0ZVooLTIzLjQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICBjb250YWluZXJFYXJ0aC5wb3NpdGlvbi56ID0gMDtcbiAgICBjb250YWluZXJFYXJ0aC5zY2FsZS5zZXQoMzAwLCAzMDAsIDMwMCk7XG4gICAgc2NlbmUuYWRkKGNvbnRhaW5lckVhcnRoKTtcblxuICAgIHZhciBlYXJ0aE1lc2ggPSBwbGFuZXRzLlBsYW5ldHMuY3JlYXRlRWFydGgoKTtcbiAgICBlYXJ0aE1lc2gucm90YXRpb24ueSA9IDA7XG4gICAgZWFydGhNZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgIGVhcnRoTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICBjb250YWluZXJFYXJ0aC5hZGQoZWFydGhNZXNoKTtcbiAgICBvblJlbmRlckNvbnRhaW5lci5wdXNoKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgIGVhcnRoTWVzaC5yb3RhdGlvbi55ICs9IDEgLyAzMiAqIGRlbHRhO1xuICAgIH0pO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IGF0bW9zcGhlcmUuY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsKClcbiAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgIG1hdGVyaWFsLnVuaWZvcm1zLmNvZWZpY2llbnQudmFsdWUgPSAwLjhcbiAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDIuMFxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICBtZXNoLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMDEpO1xuICAgIGNvbnRhaW5lckVhcnRoLmFkZChtZXNoKTtcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBhdG1vc3BoZXJlLmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCgpXG4gICAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlXG4gICAgbWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldCgweDAwYjNmZilcbiAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMC41XG4gICAgbWF0ZXJpYWwudW5pZm9ybXMucG93ZXIudmFsdWUgPSA0LjBcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgbWVzaC5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjE1KTtcbiAgICBjb250YWluZXJFYXJ0aC5hZGQobWVzaCk7XG5cbiAgICB2YXIgZWFydGhDbG91ZCA9IHBsYW5ldHMuUGxhbmV0cy5jcmVhdGVFYXJ0aENsb3VkKCk7XG4gICAgZWFydGhDbG91ZC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICBlYXJ0aENsb3VkLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgIGNvbnRhaW5lckVhcnRoLmFkZChlYXJ0aENsb3VkKTtcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXJFYXJ0aCk7XG4gICAgb25SZW5kZXJDb250YWluZXIucHVzaChmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICBlYXJ0aENsb3VkLnJvdGF0aW9uLnkgKz0gMSAvIDggKiBkZWx0YTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uZmlndXJlU2NlbmUoKTtcbiAgICBhZGRQbGFuZXRzKCk7XG4gICAgYXBwZW5kU2NlbmUoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBndWkoKTtcbiAgICB9XG4gICAgYW5pbWF0ZSgpO1xufVxuaW5pdCgpO1xuIl19
