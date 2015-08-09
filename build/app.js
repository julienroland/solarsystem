(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Int = {
    getRandom: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = Int;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
        specular: new THREE.Color('grey')
    })
    material.map.minFilter = THREE.LinearFilter;
    material.bumpMap.minFilter = THREE.LinearFilter;
    material.specularMap.minFilter = THREE.LinearFilter;
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

},{}],4:[function(require,module,exports){
//Dependencies
var Earth = require('./theSolarSystem/earth');
var Sun = require('./theSolarSystem/sun');
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
    camera.position.z = -400;
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
    nearPlane = .1;
    farPlane = 10000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    addLights();
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
function gui() {
    gui = new dat.GUI();
    var params = {
        test: 1000
    };
    gui.add(params, 'test');
}
function addPlanets() {
    var earth = Earth.make(scene);
    var earthAnimations = earth.getAnimations();
    earthAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
    });

    var sun = Sun.make(scene);
    var sunAnimations = sun.getAnimations();
    sunAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
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

},{"./theSolarSystem/earth":5,"./theSolarSystem/sun":6}],5:[function(require,module,exports){
var Planets = require('../lib/threex.planets');
var Atmospheres = require('../lib/threex.atmospherematerial');
//@math var Degree = require('../lib/degreeInRadian');
var Earth = {
    //@math 60 * 60 * 23.5603 (23h56 03')
    timeToFullSelfRotation: 84817.4724,
    isRealistic: false,
    diameter: 3,
    atmosphereRadius: undefined,
    atmosphereSize: undefined,
    axialTilt: 23.4,
    //@math return (Degree.convert(360) / this.timeToFullSelfRotation);
    rotationPerSecond: 0.000007393570389010043,
    orbitRadius: 35643,
    animations: [],

    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        this.createMesh();
        this.createAtmosphere();
        this.createClouds();
        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerEarth = new THREE.Object3D();
        this.containerEarth.rotateZ(this.axialTilt * Math.PI / 180);
        //Sun diameter * 109 = radius of earth's orbit (149,597,870 km) (35643)
        this.containerEarth.position.x = this.orbitRadius;
        //Earth is more or less 109 times smaller than sun
        this.containerEarth.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.containerEarth);

        this.atmosphereRadius = this.diameter + (this.diameter / 2);
        this.atmosphereSize = this.diameter / 60;
    },
    createMesh: function () {
        this.earthMesh = Planets.Planets.createEarth();
        this.earthMesh.rotation.y = 0;
        this.earthMesh.receiveShadow = true;
        this.earthMesh.castShadow = true;
        this.containerEarth.add(this.earthMesh);
        this.registerAnimation(function (delta, now) {
            Earth.earthMesh.rotation.y += Earth.rotationPerSecond / 60;
        })
    },
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(this.atmosphereSize, this.atmosphereRadius, this.atmosphereRadius);
        var material = Atmospheres.createAtmosphereMaterial()
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 0.8
        material.uniforms.power.value = 2.0
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.01);
        this.containerEarth.add(this.atmosphere1);

        var geometry = new THREE.SphereGeometry(this.atmosphereSize, this.atmosphereRadius, this.atmosphereRadius);
        var material = Atmospheres.createAtmosphereMaterial()
        material.side = THREE.BackSide
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 0.5
        material.uniforms.power.value = 4.0
        this.atmosphere2 = new THREE.Mesh(geometry, material);
        this.atmosphere2.scale.multiplyScalar(1.15);
        this.containerEarth.add(this.atmosphere2);
    },

    createClouds: function () {
        this.earthCloud = Planets.Planets.createEarthCloud();
        this.earthCloud.receiveShadow = true;
        this.earthCloud.castShadow = true;
        this.containerEarth.add(this.earthCloud);
        this.registerAnimation(function (delta, now) {
            Earth.earthCloud.rotation.y += (Earth.rotationPerSecond * 1.2) / 60;
        });
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.diameter *= 10;
            this.orbitRadius /= 100;
            this.rotationPerSecond *= 600;
        }
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    }
};

module.exports = Earth;

},{"../lib/threex.atmospherematerial":2,"../lib/threex.planets":3}],6:[function(require,module,exports){
var Planets = require('../lib/threex.planets');
var Int = require('../lib/int');
//@math var Degree = require('../lib/degreeInRadian');
var Sun = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    lightDistance: 10000,
    diameter: 3270,
    axialTilt: 7.25,
    //rotationPerSecond: 1.4604583484464283,
    rotationPerSecond: 0.000000014604583484464283,
    animations: [],
    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        this.createMesh();
        this.addLight(scene);
        this.addParticules(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerSun = new THREE.Object3D();
        this.containerSun.rotateZ(this.axialTilt * Math.PI / 180);
        this.containerSun.position.z = 0;
        this.containerSun.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.containerSun);
    },
    createMesh: function () {
        this.sunMesh = Planets.Planets.createSun();
        this.sunMesh.rotation.y = 0;
        this.sunMesh.receiveShadow = true;
        this.sunMesh.castShadow = true;
        this.containerSun.add(this.sunMesh);
        this.registerAnimation(function (delta, now) {
            Sun.sunMesh.rotation.y += Sun.rotationPerSecond / 60;
        });
    },
    addLight: function (scene) {
        this.light = new THREE.PointLight(0xffffff, 1, this.lightDistance);
        this.light.position.set(0, 0, 0);
        this.light.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.light);
    },
    addParticules: function (scene) {
        var particleCount = 5000;
        var particles = new THREE.Geometry();
        var PI2 = Math.PI * 2;
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: Math.random() * 0x808008 + 0x808080,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.closePath();
                context.fill();
            }
        });

        var particuleMaxDiameter = this.diameter + (this.diameter / 100);
        for (var p = 0; p < particleCount; p++) {

            var pX = Int.getRandom(-this.diameter / 2, this.diameter);
            var pY = Int.getRandom(-this.diameter / 2, this.diameter);
            var pZ = Int.getRandom(-this.diameter / 2, this.diameter);
            particle = new THREE.Vector3(pX, pY, pZ);

            particles.vertices.push(particle);
        }

        var particleSystem = new THREE.ParticleSystem(
            particles,
            pMaterial);

        scene.add(particleSystem);
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.diameter /= 10;
            this.rotationPerSecond *= 60000;
        }
    }
};

module.exports = Sun;

},{"../lib/int":1,"../lib/threex.planets":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJsaWIvdGhyZWV4LnBsYW5ldHMuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEludCA9IHtcbiAgICBnZXRSYW5kb206IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW50O1xuIiwidmFyIFRIUkVFeCA9IFRIUkVFeCB8fCB7fVxuXG4vKipcbiAqIGZyb20gaHR0cDovL3N0ZW1rb3NraS5ibG9nc3BvdC5mci8yMDEzLzA3L3NoYWRlcnMtaW4tdGhyZWVqcy1nbG93LWFuZC1oYWxvLmh0bWxcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICovXG5USFJFRXguY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBbXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dlZlcnRleE5vcm1hbFx0PSBub3JtYWxpemUobm9ybWFsTWF0cml4ICogbm9ybWFsKTsnLFxuXG4gICAgICAgICdcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uXHQ9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnLFxuXG4gICAgICAgICdcdC8vIHNldCBnbF9Qb3NpdGlvbicsXG4gICAgICAgICdcdGdsX1Bvc2l0aW9uXHQ9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApOycsXG4gICAgICAgICd9JyxcblxuICAgIF0uam9pbignXFxuJylcbiAgICB2YXIgZnJhZ21lbnRTaGFkZXIgPSBbXG4gICAgICAgICd1bmlmb3JtIHZlYzNcdGdsb3dDb2xvcjsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0Y29lZmljaWVudDsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0cG93ZXI7JyxcblxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZlYzMgd29ybGRDYW1lcmFUb1ZlcnRleD0gdlZlcnRleFdvcmxkUG9zaXRpb24gLSBjYW1lcmFQb3NpdGlvbjsnLFxuICAgICAgICAnXHR2ZWMzIHZpZXdDYW1lcmFUb1ZlcnRleFx0PSAodmlld01hdHJpeCAqIHZlYzQod29ybGRDYW1lcmFUb1ZlcnRleCwgMC4wKSkueHl6OycsXG4gICAgICAgICdcdHZpZXdDYW1lcmFUb1ZlcnRleFx0PSBub3JtYWxpemUodmlld0NhbWVyYVRvVmVydGV4KTsnLFxuICAgICAgICAnXHRmbG9hdCBpbnRlbnNpdHlcdFx0PSBwb3coY29lZmljaWVudCArIGRvdCh2VmVydGV4Tm9ybWFsLCB2aWV3Q2FtZXJhVG9WZXJ0ZXgpLCBwb3dlcik7JyxcbiAgICAgICAgJ1x0Z2xfRnJhZ0NvbG9yXHRcdD0gdmVjNChnbG93Q29sb3IsIGludGVuc2l0eSk7JyxcbiAgICAgICAgJ30nLFxuICAgIF0uam9pbignXFxuJylcblxuICAgIC8vIGNyZWF0ZSBjdXN0b20gbWF0ZXJpYWwgZnJvbSB0aGUgc2hhZGVyIGNvZGUgYWJvdmVcbiAgICAvLyAgIHRoYXQgaXMgd2l0aGluIHNwZWNpYWxseSBsYWJlbGVkIHNjcmlwdCB0YWdzXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgIGNvZWZpY2llbnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMS4wXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG93ZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdsb3dDb2xvcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJ3BpbmsnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsXG4gICAgICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcbiAgICAgICAgLy9ibGVuZGluZ1x0OiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGVyaWFsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUV4O1xuIiwidmFyIFRIUkVFeCA9IFRIUkVFeCB8fCB7fVxuXG5USFJFRXguUGxhbmV0cyA9IHt9XG5cblRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgPSAnLi9saWIvJ1xuXG4vLyBmcm9tIGh0dHA6Ly9wbGFuZXRwaXhlbGVtcG9yaXVtLmNvbS9cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU3VuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc3VubWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVNZXJjdXJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWVyY3VyeW1hcC5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tZXJjdXJ5YnVtcC5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVZlbnVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdmVudXNtYXAuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdmVudXNidW1wLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlRWFydGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aG1hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgICAgIHNwZWN1bGFyTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoc3BlYzFrLmpwZycpLFxuICAgICAgICBzcGVjdWxhcjogbmV3IFRIUkVFLkNvbG9yKCdncmV5JylcbiAgICB9KVxuICAgIG1hdGVyaWFsLm1hcC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgbWF0ZXJpYWwuYnVtcE1hcC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgbWF0ZXJpYWwuc3BlY3VsYXJNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZUVhcnRoQ2xvdWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY3JlYXRlIGRlc3RpbmF0aW9uIGNhbnZhc1xuICAgIHZhciBjYW52YXNSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIGNhbnZhc1Jlc3VsdC53aWR0aCA9IDEwMjRcbiAgICBjYW52YXNSZXN1bHQuaGVpZ2h0ID0gNTEyXG4gICAgdmFyIGNvbnRleHRSZXN1bHQgPSBjYW52YXNSZXN1bHQuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwXG4gICAgdmFyIGltYWdlTWFwID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2VNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRhTWFwIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcFxuICAgICAgICB2YXIgY2FudmFzTWFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgY2FudmFzTWFwLndpZHRoID0gaW1hZ2VNYXAud2lkdGhcbiAgICAgICAgY2FudmFzTWFwLmhlaWdodCA9IGltYWdlTWFwLmhlaWdodFxuICAgICAgICB2YXIgY29udGV4dE1hcCA9IGNhbnZhc01hcC5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIGNvbnRleHRNYXAuZHJhd0ltYWdlKGltYWdlTWFwLCAwLCAwKVxuICAgICAgICB2YXIgZGF0YU1hcCA9IGNvbnRleHRNYXAuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcblxuICAgICAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICB2YXIgaW1hZ2VUcmFucyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZVRyYW5zLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkYXRhVHJhbnMgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgICAgIHZhciBjYW52YXNUcmFucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgICAgICBjYW52YXNUcmFucy53aWR0aCA9IGltYWdlVHJhbnMud2lkdGhcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLmhlaWdodCA9IGltYWdlVHJhbnMuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgY29udGV4dFRyYW5zID0gY2FudmFzVHJhbnMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICAgICAgY29udGV4dFRyYW5zLmRyYXdJbWFnZShpbWFnZVRyYW5zLCAwLCAwKVxuICAgICAgICAgICAgdmFyIGRhdGFUcmFucyA9IGNvbnRleHRUcmFucy5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzVHJhbnMud2lkdGgsIGNhbnZhc1RyYW5zLmhlaWdodClcbiAgICAgICAgICAgIC8vIG1lcmdlIGRhdGFNYXAgKyBkYXRhVHJhbnMgaW50byBkYXRhUmVzdWx0XG4gICAgICAgICAgICB2YXIgZGF0YVJlc3VsdCA9IGNvbnRleHRNYXAuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCBvZmZzZXQgPSAwOyB5IDwgaW1hZ2VNYXAuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlTWFwLndpZHRoOyB4KyssIG9mZnNldCArPSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAwXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMV0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMV1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDJdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDJdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAzXSA9IDI1NSAtIGRhdGFUcmFucy5kYXRhW29mZnNldCArIDBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIHRleHR1cmUgd2l0aCByZXN1bHRcbiAgICAgICAgICAgIGNvbnRleHRSZXN1bHQucHV0SW1hZ2VEYXRhKGRhdGFSZXN1bHQsIDAsIDApXG4gICAgICAgICAgICBtYXRlcmlhbC5tYXAubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICBpbWFnZVRyYW5zLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoY2xvdWRtYXB0cmFucy5qcGcnO1xuICAgIH0sIGZhbHNlKTtcbiAgICBpbWFnZU1hcC5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aGNsb3VkbWFwLmpwZyc7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41MSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzUmVzdWx0KSxcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTW9vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21vb25tYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tb29uYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDAyLFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21hcnNtYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tYXJzYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVKdXBpdGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvanVwaXRlcm1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAyLFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTYXR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5tYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU2F0dXJuUmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjcmVhdGUgZGVzdGluYXRpb24gY2FudmFzXG4gICAgdmFyIGNhbnZhc1Jlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzUmVzdWx0LndpZHRoID0gOTE1XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDY0XG4gICAgdmFyIGNvbnRleHRSZXN1bHQgPSBjYW52YXNSZXN1bHQuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwXG4gICAgdmFyIGltYWdlTWFwID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2VNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRhTWFwIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcFxuICAgICAgICB2YXIgY2FudmFzTWFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgY2FudmFzTWFwLndpZHRoID0gaW1hZ2VNYXAud2lkdGhcbiAgICAgICAgY2FudmFzTWFwLmhlaWdodCA9IGltYWdlTWFwLmhlaWdodFxuICAgICAgICB2YXIgY29udGV4dE1hcCA9IGNhbnZhc01hcC5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIGNvbnRleHRNYXAuZHJhd0ltYWdlKGltYWdlTWFwLCAwLCAwKVxuICAgICAgICB2YXIgZGF0YU1hcCA9IGNvbnRleHRNYXAuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcblxuICAgICAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICB2YXIgaW1hZ2VUcmFucyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZVRyYW5zLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkYXRhVHJhbnMgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgICAgIHZhciBjYW52YXNUcmFucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgICAgICBjYW52YXNUcmFucy53aWR0aCA9IGltYWdlVHJhbnMud2lkdGhcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLmhlaWdodCA9IGltYWdlVHJhbnMuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgY29udGV4dFRyYW5zID0gY2FudmFzVHJhbnMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICAgICAgY29udGV4dFRyYW5zLmRyYXdJbWFnZShpbWFnZVRyYW5zLCAwLCAwKVxuICAgICAgICAgICAgdmFyIGRhdGFUcmFucyA9IGNvbnRleHRUcmFucy5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzVHJhbnMud2lkdGgsIGNhbnZhc1RyYW5zLmhlaWdodClcbiAgICAgICAgICAgIC8vIG1lcmdlIGRhdGFNYXAgKyBkYXRhVHJhbnMgaW50byBkYXRhUmVzdWx0XG4gICAgICAgICAgICB2YXIgZGF0YVJlc3VsdCA9IGNvbnRleHRNYXAuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc1Jlc3VsdC53aWR0aCwgY2FudmFzUmVzdWx0LmhlaWdodClcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCBvZmZzZXQgPSAwOyB5IDwgaW1hZ2VNYXAuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlTWFwLndpZHRoOyB4KyssIG9mZnNldCArPSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAwXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMV0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMV1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDJdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDJdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAzXSA9IDI1NSAtIGRhdGFUcmFucy5kYXRhW29mZnNldCArIDBdIC8gNFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5yaW5ncGF0dGVybi5naWYnO1xuICAgIH0sIGZhbHNlKTtcbiAgICBpbWFnZU1hcC5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5yaW5nY29sb3IuanBnJztcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5KDAuNTUsIDAuNzUsIDY0KTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIC8vIG1hcFx0XHQ6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCsnaW1hZ2VzL2FzaF91dmdyaWQwMS5qcGcnKSxcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIG1lc2gubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAuNSwgLTQsIDEpKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlVXJhbnVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzbWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVVcmFudXNSaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGNyZWF0ZSBkZXN0aW5hdGlvbiBjYW52YXNcbiAgICB2YXIgY2FudmFzUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXNSZXN1bHQud2lkdGggPSAxMDI0XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDcyXG4gICAgdmFyIGNvbnRleHRSZXN1bHQgPSBjYW52YXNSZXN1bHQuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwXG4gICAgdmFyIGltYWdlTWFwID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2VNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRhTWFwIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcFxuICAgICAgICB2YXIgY2FudmFzTWFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgY2FudmFzTWFwLndpZHRoID0gaW1hZ2VNYXAud2lkdGhcbiAgICAgICAgY2FudmFzTWFwLmhlaWdodCA9IGltYWdlTWFwLmhlaWdodFxuICAgICAgICB2YXIgY29udGV4dE1hcCA9IGNhbnZhc01hcC5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIGNvbnRleHRNYXAuZHJhd0ltYWdlKGltYWdlTWFwLCAwLCAwKVxuICAgICAgICB2YXIgZGF0YU1hcCA9IGNvbnRleHRNYXAuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcblxuICAgICAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICB2YXIgaW1hZ2VUcmFucyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZVRyYW5zLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkYXRhVHJhbnMgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgICAgIHZhciBjYW52YXNUcmFucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgICAgICBjYW52YXNUcmFucy53aWR0aCA9IGltYWdlVHJhbnMud2lkdGhcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLmhlaWdodCA9IGltYWdlVHJhbnMuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgY29udGV4dFRyYW5zID0gY2FudmFzVHJhbnMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICAgICAgY29udGV4dFRyYW5zLmRyYXdJbWFnZShpbWFnZVRyYW5zLCAwLCAwKVxuICAgICAgICAgICAgdmFyIGRhdGFUcmFucyA9IGNvbnRleHRUcmFucy5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzVHJhbnMud2lkdGgsIGNhbnZhc1RyYW5zLmhlaWdodClcbiAgICAgICAgICAgIC8vIG1lcmdlIGRhdGFNYXAgKyBkYXRhVHJhbnMgaW50byBkYXRhUmVzdWx0XG4gICAgICAgICAgICB2YXIgZGF0YVJlc3VsdCA9IGNvbnRleHRNYXAuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc1Jlc3VsdC53aWR0aCwgY2FudmFzUmVzdWx0LmhlaWdodClcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCBvZmZzZXQgPSAwOyB5IDwgaW1hZ2VNYXAuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlTWFwLndpZHRoOyB4KyssIG9mZnNldCArPSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAwXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMV0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMV1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDJdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDJdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAzXSA9IDI1NSAtIGRhdGFUcmFucy5kYXRhW29mZnNldCArIDBdIC8gMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy91cmFudXNyaW5ndHJhbnMuZ2lmJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzcmluZ2NvbG91ci5qcGcnO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkoMC41NSwgMC43NSwgNjQpO1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzUmVzdWx0KSxcbiAgICAgICAgLy8gbWFwXHRcdDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMKydpbWFnZXMvYXNoX3V2Z3JpZDAxLmpwZycpLFxuICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgbWVzaC5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMC41LCAtNCwgMSkpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVOZXB0dW5lID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbmVwdHVuZW1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVQbHV0byA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3BsdXRvbWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvcGx1dG9idW1wMWsuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTdGFyZmllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2dhbGF4eV9zdGFyZmllbGQucG5nJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXG4gICAgfSlcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTAwLCAzMiwgMzIpXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1x0XHRjb21tZW50XHRcdFx0XHRcdFx0XHRcdC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogY2hhbmdlIHRoZSBvcmlnaW5hbCBmcm9tIHRocmVlLmpzIGJlY2F1c2UgaSBuZWVkZWQgZGlmZmVyZW50IFVWXG4gKlxuICogQGF1dGhvciBLYWxlYiBNdXJwaHlcbiAqIEBhdXRob3IgamVyb21lIGV0aWVubmVcbiAqL1xuVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeSA9IGZ1bmN0aW9uIChpbm5lclJhZGl1cywgb3V0ZXJSYWRpdXMsIHRoZXRhU2VnbWVudHMpIHtcblxuICAgIFRIUkVFLkdlb21ldHJ5LmNhbGwodGhpcylcblxuICAgIGlubmVyUmFkaXVzID0gaW5uZXJSYWRpdXMgfHwgMFxuICAgIG91dGVyUmFkaXVzID0gb3V0ZXJSYWRpdXMgfHwgNTBcbiAgICB0aGV0YVNlZ21lbnRzID0gdGhldGFTZWdtZW50cyB8fCA4XG5cbiAgICB2YXIgbm9ybWFsID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMSlcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhldGFTZWdtZW50czsgaSsrKSB7XG4gICAgICAgIHZhciBhbmdsZUxvID0gKGkgLyB0aGV0YVNlZ21lbnRzKSAqIE1hdGguUEkgKiAyXG4gICAgICAgIHZhciBhbmdsZUhpID0gKChpICsgMSkgLyB0aGV0YVNlZ21lbnRzKSAqIE1hdGguUEkgKiAyXG5cbiAgICAgICAgdmFyIHZlcnRleDEgPSBuZXcgVEhSRUUuVmVjdG9yMyhpbm5lclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlTG8pLCBpbm5lclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlTG8pLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDIgPSBuZXcgVEhSRUUuVmVjdG9yMyhvdXRlclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlTG8pLCBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlTG8pLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDMgPSBuZXcgVEhSRUUuVmVjdG9yMyhpbm5lclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSGkpLCBpbm5lclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSGkpLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDQgPSBuZXcgVEhSRUUuVmVjdG9yMyhvdXRlclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSGkpLCBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSGkpLCAwKTtcblxuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4MSk7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgyKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDMpO1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4NCk7XG5cblxuICAgICAgICB2YXIgdmVydGV4SWR4ID0gaSAqIDQ7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBmaXJzdCB0cmlhbmdsZVxuICAgICAgICB2YXIgZmFjZSA9IG5ldyBUSFJFRS5GYWNlMyh2ZXJ0ZXhJZHggKyAwLCB2ZXJ0ZXhJZHggKyAxLCB2ZXJ0ZXhJZHggKyAyLCBub3JtYWwpO1xuICAgICAgICB2YXIgdXZzID0gW11cblxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDEpXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuXG4gICAgICAgIHRoaXMuZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgdGhpcy5mYWNlVmVydGV4VXZzWzBdLnB1c2godXZzKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHNlY29uZCB0cmlhbmdsZVxuICAgICAgICB2YXIgZmFjZSA9IG5ldyBUSFJFRS5GYWNlMyh2ZXJ0ZXhJZHggKyAyLCB2ZXJ0ZXhJZHggKyAxLCB2ZXJ0ZXhJZHggKyAzLCBub3JtYWwpO1xuICAgICAgICB2YXIgdXZzID0gW11cblxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDEpXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuXG4gICAgICAgIHRoaXMuZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgdGhpcy5mYWNlVmVydGV4VXZzWzBdLnB1c2godXZzKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXB1dGVDZW50cm9pZHMoKTtcbiAgICB0aGlzLmNvbXB1dGVGYWNlTm9ybWFscygpO1xuXG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmUobmV3IFRIUkVFLlZlY3RvcjMoKSwgb3V0ZXJSYWRpdXMpO1xuXG59O1xuVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFRIUkVFLkdlb21ldHJ5LnByb3RvdHlwZSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRXg7XG4iLCIvL0RlcGVuZGVuY2llc1xudmFyIEVhcnRoID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9lYXJ0aCcpO1xudmFyIFN1biA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vc3VuJyk7XG4vL0NvbmZpZ1xudmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY2VuZScpO1xudmFyIHNjZW5lO1xudmFyIGNhbWVyYTtcbnZhciBmaWVsZE9mVmlldztcbnZhciBhc3BlY3RSYXRpbztcbnZhciByZW5kZXJlcjtcbnZhciBuZWFyUGxhbmU7XG52YXIgZmFyUGxhbmU7XG52YXIgY29udHJvbHM7XG52YXIgZ3VpO1xuLy9MaWdodHNcbnZhciBsaWdodDtcbnZhciBzaGFkb3dMaWdodDtcblxuLy9Db25zdGFudHNcbmNvbnN0IEVOViA9ICdkZXYnO1xudmFyIEhFSUdIVDtcbnZhciBXSURUSDtcblxuLy9HbG9iYWxcbnZhciBvblJlbmRlckNvbnRhaW5lciA9IFtdO1xudmFyIGxhc3RUaW1lTXNlYyA9IG51bGxcblxuZnVuY3Rpb24gYXBwZW5kU2NlbmUoKSB7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xufVxuZnVuY3Rpb24gYWRkTGlnaHRzKCkge1xuICAgIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZilcbiAgICBzY2VuZS5hZGQobGlnaHQpO1xufVxuZnVuY3Rpb24gaXNEZXYoKSB7XG4gICAgcmV0dXJuIEVOViA9PSAnZGV2Jztcbn1cbmZ1bmN0aW9uIGFkZENhbWVyYSgpIHtcbiAgICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgIGZpZWxkT2ZWaWV3LFxuICAgICAgICBhc3BlY3RSYXRpbyxcbiAgICAgICAgbmVhclBsYW5lLFxuICAgICAgICBmYXJQbGFuZSk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnogPSAtNDAwO1xuICAgIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMjAwLCAwKSk7XG59XG5mdW5jdGlvbiBhZGRDb250cm9scygpIHtcbiAgICBjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyhjYW1lcmEpO1xuICAgIGNvbnRyb2xzLnRhcmdldC5zZXQoMCwgMCwgMCk7XG4gICAgY29udHJvbHMucm90YXRlU3BlZWQgPSAxLjA7XG4gICAgY29udHJvbHMuem9vbVNwZWVkID0gMS4yO1xuICAgIGNvbnRyb2xzLnBhblNwZWVkID0gMC44O1xuXG4gICAgY29udHJvbHMubm9ab29tID0gZmFsc2U7XG4gICAgY29udHJvbHMubm9QYW4gPSBmYWxzZTtcblxuICAgIGNvbnRyb2xzLnN0YXRpY01vdmluZyA9IHRydWU7XG4gICAgY29udHJvbHMuZHluYW1pY0RhbXBpbmdGYWN0b3IgPSAwLjM7XG5cbiAgICBjb250cm9scy5rZXlzID0gWzY1LCA4MywgNjhdO1xuICAgIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHJlbmRlcik7XG59XG5mdW5jdGlvbiBjb25maWd1cmVTY2VuZSgpIHtcbiAgICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgIHNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2coMHgwNTA1MDUsIDIwMDAsIDQwMDApO1xuXG4gICAgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgYXNwZWN0UmF0aW8gPSBXSURUSCAvIEhFSUdIVDtcbiAgICBmaWVsZE9mVmlldyA9IDYwO1xuICAgIG5lYXJQbGFuZSA9IC4xO1xuICAgIGZhclBsYW5lID0gMTAwMDA7XG4gICAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWUsIGFudGlhbGlhczogdHJ1ZX0pO1xuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEpO1xuICAgIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG4gICAgcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlO1xuICAgIGFkZENhbWVyYSgpO1xuICAgIGlmIChpc0RldigpKSB7XG4gICAgICAgIGFkZENvbnRyb2xzKCk7XG4gICAgfVxuICAgIGFkZExpZ2h0cygpO1xufVxuZnVuY3Rpb24gYW5pbWF0ZShudW1iZXIpIHtcbiAgICByZW5kZXIoKTtcbiAgICBpZiAodHlwZW9mIG51bWJlciA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBudW1iZXIgPSAwO1xuICAgIH1cbiAgICBsYXN0VGltZU1zZWMgPSBsYXN0VGltZU1zZWMgfHwgbnVtYmVyIC0gMTAwMCAvIDYwXG4gICAgdmFyIGRlbHRhTXNlYyA9IE1hdGgubWluKDIwMCwgbnVtYmVyIC0gbGFzdFRpbWVNc2VjKVxuICAgIGxhc3RUaW1lTXNlYyA9IG51bWJlclxuICAgIC8vIGNhbGwgZWFjaCB1cGRhdGUgZnVuY3Rpb25cbiAgICBvblJlbmRlckNvbnRhaW5lci5mb3JFYWNoKGZ1bmN0aW9uIChvblJlbmRlckNvbnRhaW5lcikge1xuICAgICAgICBvblJlbmRlckNvbnRhaW5lcihkZWx0YU1zZWMgLyAxMDAwLCBudW1iZXIgLyAxMDAwKVxuICAgIH0pXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xufVxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cbmZ1bmN0aW9uIGd1aSgpIHtcbiAgICBndWkgPSBuZXcgZGF0LkdVSSgpO1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHRlc3Q6IDEwMDBcbiAgICB9O1xuICAgIGd1aS5hZGQocGFyYW1zLCAndGVzdCcpO1xufVxuZnVuY3Rpb24gYWRkUGxhbmV0cygpIHtcbiAgICB2YXIgZWFydGggPSBFYXJ0aC5tYWtlKHNjZW5lKTtcbiAgICB2YXIgZWFydGhBbmltYXRpb25zID0gZWFydGguZ2V0QW5pbWF0aW9ucygpO1xuICAgIGVhcnRoQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN1biA9IFN1bi5tYWtlKHNjZW5lKTtcbiAgICB2YXIgc3VuQW5pbWF0aW9ucyA9IHN1bi5nZXRBbmltYXRpb25zKCk7XG4gICAgc3VuQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25maWd1cmVTY2VuZSgpO1xuICAgIGFkZFBsYW5ldHMoKTtcbiAgICBhcHBlbmRTY2VuZSgpO1xuICAgIGlmIChpc0RldigpKSB7XG4gICAgICAgIGd1aSgpO1xuICAgIH1cbiAgICBhbmltYXRlKCk7XG59XG5pbml0KCk7XG4iLCJ2YXIgUGxhbmV0cyA9IHJlcXVpcmUoJy4uL2xpYi90aHJlZXgucGxhbmV0cycpO1xudmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbi8vQG1hdGggdmFyIERlZ3JlZSA9IHJlcXVpcmUoJy4uL2xpYi9kZWdyZWVJblJhZGlhbicpO1xudmFyIEVhcnRoID0ge1xuICAgIC8vQG1hdGggNjAgKiA2MCAqIDIzLjU2MDMgKDIzaDU2IDAzJylcbiAgICB0aW1lVG9GdWxsU2VsZlJvdGF0aW9uOiA4NDgxNy40NzI0LFxuICAgIGlzUmVhbGlzdGljOiBmYWxzZSxcbiAgICBkaWFtZXRlcjogMyxcbiAgICBhdG1vc3BoZXJlUmFkaXVzOiB1bmRlZmluZWQsXG4gICAgYXRtb3NwaGVyZVNpemU6IHVuZGVmaW5lZCxcbiAgICBheGlhbFRpbHQ6IDIzLjQsXG4gICAgLy9AbWF0aCByZXR1cm4gKERlZ3JlZS5jb252ZXJ0KDM2MCkgLyB0aGlzLnRpbWVUb0Z1bGxTZWxmUm90YXRpb24pO1xuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwNzM5MzU3MDM4OTAxMDA0MyxcbiAgICBvcmJpdFJhZGl1czogMzU2NDMsXG4gICAgYW5pbWF0aW9uczogW10sXG5cbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF0bW9zcGhlcmUoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVDbG91ZHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgLy9TdW4gZGlhbWV0ZXIgKiAxMDkgPSByYWRpdXMgb2YgZWFydGgncyBvcmJpdCAoMTQ5LDU5Nyw4NzAga20pICgzNTY0MylcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5wb3NpdGlvbi54ID0gdGhpcy5vcmJpdFJhZGl1cztcbiAgICAgICAgLy9FYXJ0aCBpcyBtb3JlIG9yIGxlc3MgMTA5IHRpbWVzIHNtYWxsZXIgdGhhbiBzdW5cbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lckVhcnRoKTtcblxuICAgICAgICB0aGlzLmF0bW9zcGhlcmVSYWRpdXMgPSB0aGlzLmRpYW1ldGVyICsgKHRoaXMuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlU2l6ZSA9IHRoaXMuZGlhbWV0ZXIgLyA2MDtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2ggPSBQbGFuZXRzLlBsYW5ldHMuY3JlYXRlRWFydGgoKTtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucm90YXRpb24ueSA9IDA7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aE1lc2gpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aE1lc2gucm90YXRpb24ueSArPSBFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAvIDYwO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgY3JlYXRlQXRtb3NwaGVyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5hdG1vc3BoZXJlU2l6ZSwgdGhpcy5hdG1vc3BoZXJlUmFkaXVzLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMC44XG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLnBvd2VyLnZhbHVlID0gMi4wXG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTEgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMDEpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmF0bW9zcGhlcmUxKTtcblxuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5hdG1vc3BoZXJlU2l6ZSwgdGhpcy5hdG1vc3BoZXJlUmFkaXVzLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuQmFja1NpZGVcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldCgweDAwYjNmZilcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29lZmljaWVudC52YWx1ZSA9IDAuNVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDQuMFxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUyID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMi5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjE1KTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5hdG1vc3BoZXJlMik7XG4gICAgfSxcblxuICAgIGNyZWF0ZUNsb3VkczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQgPSBQbGFuZXRzLlBsYW5ldHMuY3JlYXRlRWFydGhDbG91ZCgpO1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aENsb3VkKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgRWFydGguZWFydGhDbG91ZC5yb3RhdGlvbi55ICs9IChFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAqIDEuMikgLyA2MDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgKj0gMTA7XG4gICAgICAgICAgICB0aGlzLm9yYml0UmFkaXVzIC89IDEwMDtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb25QZXJTZWNvbmQgKj0gNjAwO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlckFuaW1hdGlvbjogZnVuY3Rpb24gKGNhbGxhYmxlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGNhbGxhYmxlKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuIiwidmFyIFBsYW5ldHMgPSByZXF1aXJlKCcuLi9saWIvdGhyZWV4LnBsYW5ldHMnKTtcbnZhciBJbnQgPSByZXF1aXJlKCcuLi9saWIvaW50Jyk7XG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBTdW4gPSB7XG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ5ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGxpZ2h0RGlzdGFuY2U6IDEwMDAwLFxuICAgIGRpYW1ldGVyOiAzMjcwLFxuICAgIGF4aWFsVGlsdDogNy4yNSxcbiAgICAvL3JvdGF0aW9uUGVyU2Vjb25kOiAxLjQ2MDQ1ODM0ODQ0NjQyODMsXG4gICAgcm90YXRpb25QZXJTZWNvbmQ6IDAuMDAwMDAwMDE0NjA0NTgzNDg0NDY0MjgzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuICAgIG1ha2U6IGZ1bmN0aW9uIChzY2VuZSwgaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VSZWFsaXNtKGlzUmVhbGlzdGljKTtcbiAgICAgICAgdGhpcy5pbml0KHNjZW5lKTtcbiAgICAgICAgdGhpcy5jcmVhdGVNZXNoKCk7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoc2NlbmUpO1xuICAgICAgICB0aGlzLmFkZFBhcnRpY3VsZXMoc2NlbmUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4ucG9zaXRpb24ueiA9IDA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLnNjYWxlLnNldCh0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMuY29udGFpbmVyU3VuKTtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdW5NZXNoID0gUGxhbmV0cy5QbGFuZXRzLmNyZWF0ZVN1bigpO1xuICAgICAgICB0aGlzLnN1bk1lc2gucm90YXRpb24ueSA9IDA7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5hZGQodGhpcy5zdW5NZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgU3VuLnN1bk1lc2gucm90YXRpb24ueSArPSBTdW4ucm90YXRpb25QZXJTZWNvbmQgLyA2MDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRMaWdodDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgdGhpcy5saWdodERpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMubGlnaHQuc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5saWdodCk7XG4gICAgfSxcbiAgICBhZGRQYXJ0aWN1bGVzOiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlQ291bnQgPSA1MDAwO1xuICAgICAgICB2YXIgcGFydGljbGVzID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gICAgICAgIHZhciBQSTIgPSBNYXRoLlBJICogMjtcbiAgICAgICAgdmFyIHBNYXRlcmlhbCA9IG5ldyBUSFJFRS5QYXJ0aWNsZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgY29sb3I6IE1hdGgucmFuZG9tKCkgKiAweDgwODAwOCArIDB4ODA4MDgwLFxuICAgICAgICAgICAgcHJvZ3JhbTogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIDEsIDAsIFBJMiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHBhcnRpY3VsZU1heERpYW1ldGVyID0gdGhpcy5kaWFtZXRlciArICh0aGlzLmRpYW1ldGVyIC8gMTAwKTtcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBwYXJ0aWNsZUNvdW50OyBwKyspIHtcblxuICAgICAgICAgICAgdmFyIHBYID0gSW50LmdldFJhbmRvbSgtdGhpcy5kaWFtZXRlciAvIDIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICAgICAgdmFyIHBZID0gSW50LmdldFJhbmRvbSgtdGhpcy5kaWFtZXRlciAvIDIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICAgICAgdmFyIHBaID0gSW50LmdldFJhbmRvbSgtdGhpcy5kaWFtZXRlciAvIDIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICAgICAgcGFydGljbGUgPSBuZXcgVEhSRUUuVmVjdG9yMyhwWCwgcFksIHBaKTtcblxuICAgICAgICAgICAgcGFydGljbGVzLnZlcnRpY2VzLnB1c2gocGFydGljbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhcnRpY2xlU3lzdGVtID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKFxuICAgICAgICAgICAgcGFydGljbGVzLFxuICAgICAgICAgICAgcE1hdGVyaWFsKTtcblxuICAgICAgICBzY2VuZS5hZGQocGFydGljbGVTeXN0ZW0pO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgLz0gMTA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDAwO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdW47XG4iXX0=
