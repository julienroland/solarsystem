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

},{}],3:[function(require,module,exports){
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

},{"./theSolarSystem/earth":4,"./theSolarSystem/sun":5}],4:[function(require,module,exports){
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

},{"../lib/threex.atmospherematerial":1,"../lib/threex.planets":2}],5:[function(require,module,exports){
var Planets = require('../lib/threex.planets');
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
    addLight: function (scene) {
        this.light = new THREE.PointLight(0xffffff, 1, this.lightDistance);
        this.light.position.set(0, 0, 0);
        this.light.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.light);
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

},{"../lib/threex.planets":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvdGhyZWV4LmF0bW9zcGhlcmVtYXRlcmlhbC5qcyIsImxpYi90aHJlZXgucGxhbmV0cy5qcyIsInNjcmlwdC5qcyIsInRoZVNvbGFyU3lzdGVtL2VhcnRoLmpzIiwidGhlU29sYXJTeXN0ZW0vc3VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUSFJFRXggPSBUSFJFRXggfHwge31cblxuLyoqXG4gKiBmcm9tIGh0dHA6Ly9zdGVta29za2kuYmxvZ3Nwb3QuZnIvMjAxMy8wNy9zaGFkZXJzLWluLXRocmVlanMtZ2xvdy1hbmQtaGFsby5odG1sXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAqL1xuVEhSRUV4LmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmVydGV4U2hhZGVyID0gW1xuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZWZXJ0ZXhOb3JtYWxcdD0gbm9ybWFsaXplKG5vcm1hbE1hdHJpeCAqIG5vcm1hbCk7JyxcblxuICAgICAgICAnXHR2VmVydGV4V29ybGRQb3NpdGlvblx0PSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7JyxcblxuICAgICAgICAnXHQvLyBzZXQgZ2xfUG9zaXRpb24nLFxuICAgICAgICAnXHRnbF9Qb3NpdGlvblx0PSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTsnLFxuICAgICAgICAnfScsXG5cbiAgICBdLmpvaW4oJ1xcbicpXG4gICAgdmFyIGZyYWdtZW50U2hhZGVyID0gW1xuICAgICAgICAndW5pZm9ybSB2ZWMzXHRnbG93Q29sb3I7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdGNvZWZpY2llbnQ7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdHBvd2VyOycsXG5cbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2ZWMzIHdvcmxkQ2FtZXJhVG9WZXJ0ZXg9IHZWZXJ0ZXhXb3JsZFBvc2l0aW9uIC0gY2FtZXJhUG9zaXRpb247JyxcbiAgICAgICAgJ1x0dmVjMyB2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gKHZpZXdNYXRyaXggKiB2ZWM0KHdvcmxkQ2FtZXJhVG9WZXJ0ZXgsIDAuMCkpLnh5ejsnLFxuICAgICAgICAnXHR2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gbm9ybWFsaXplKHZpZXdDYW1lcmFUb1ZlcnRleCk7JyxcbiAgICAgICAgJ1x0ZmxvYXQgaW50ZW5zaXR5XHRcdD0gcG93KGNvZWZpY2llbnQgKyBkb3QodlZlcnRleE5vcm1hbCwgdmlld0NhbWVyYVRvVmVydGV4KSwgcG93ZXIpOycsXG4gICAgICAgICdcdGdsX0ZyYWdDb2xvclx0XHQ9IHZlYzQoZ2xvd0NvbG9yLCBpbnRlbnNpdHkpOycsXG4gICAgICAgICd9JyxcbiAgICBdLmpvaW4oJ1xcbicpXG5cbiAgICAvLyBjcmVhdGUgY3VzdG9tIG1hdGVyaWFsIGZyb20gdGhlIHNoYWRlciBjb2RlIGFib3ZlXG4gICAgLy8gICB0aGF0IGlzIHdpdGhpbiBzcGVjaWFsbHkgbGFiZWxlZCBzY3JpcHQgdGFnc1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICBjb2VmaWNpZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEuMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvd2VyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnbG93Q29sb3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCdwaW5rJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxuICAgICAgICBmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgIC8vYmxlbmRpbmdcdDogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHJldHVybiBtYXRlcmlhbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFeDtcbiIsInZhciBUSFJFRXggPSBUSFJFRXggfHwge31cblxuVEhSRUV4LlBsYW5ldHMgPSB7fVxuXG5USFJFRXguUGxhbmV0cy5iYXNlVVJMID0gJy4vbGliLydcblxuLy8gZnJvbSBodHRwOi8vcGxhbmV0cGl4ZWxlbXBvcml1bS5jb20vXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVN1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3N1bm1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTWVyY3VyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21lcmN1cnltYXAuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWVyY3VyeWJ1bXAuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVWZW51cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3ZlbnVzbWFwLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3ZlbnVzYnVtcC5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZUVhcnRoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZWFydGhtYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aGJ1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgICAgICBzcGVjdWxhck1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aHNwZWMxay5qcGcnKSxcbiAgICAgICAgc3BlY3VsYXI6IG5ldyBUSFJFRS5Db2xvcignZ3JleScpXG4gICAgfSlcbiAgICBtYXRlcmlhbC5tYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIG1hdGVyaWFsLmJ1bXBNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIG1hdGVyaWFsLnNwZWN1bGFyTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVFYXJ0aENsb3VkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGNyZWF0ZSBkZXN0aW5hdGlvbiBjYW52YXNcbiAgICB2YXIgY2FudmFzUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXNSZXN1bHQud2lkdGggPSAxMDI0XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDUxMlxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aGNsb3VkbWFwdHJhbnMuanBnJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZWFydGhjbG91ZG1hcC5qcGcnO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNTEsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU1vb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tb29ubWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbW9vbmJ1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwMixcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU1hcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tYXJzbWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWFyc2J1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlSnVwaXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2p1cGl0ZXJtYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMixcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU2F0dXJuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJubWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVNhdHVyblJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY3JlYXRlIGRlc3RpbmF0aW9uIGNhbnZhc1xuICAgIHZhciBjYW52YXNSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIGNhbnZhc1Jlc3VsdC53aWR0aCA9IDkxNVxuICAgIGNhbnZhc1Jlc3VsdC5oZWlnaHQgPSA2NFxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNSZXN1bHQud2lkdGgsIGNhbnZhc1Jlc3VsdC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXSAvIDRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGV4dHVyZSB3aXRoIHJlc3VsdFxuICAgICAgICAgICAgY29udGV4dFJlc3VsdC5wdXRJbWFnZURhdGEoZGF0YVJlc3VsdCwgMCwgMClcbiAgICAgICAgICAgIG1hdGVyaWFsLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgICAgIGltYWdlVHJhbnMuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJucmluZ3BhdHRlcm4uZ2lmJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvc2F0dXJucmluZ2NvbG9yLmpwZyc7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeSgwLjU1LCAwLjc1LCA2NCk7XG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXNSZXN1bHQpLFxuICAgICAgICAvLyBtYXBcdFx0OiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwrJ2ltYWdlcy9hc2hfdXZncmlkMDEuanBnJyksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICBtZXNoLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLjUsIC00LCAxKSlcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVVyYW51cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3VyYW51c21hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlVXJhbnVzUmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjcmVhdGUgZGVzdGluYXRpb24gY2FudmFzXG4gICAgdmFyIGNhbnZhc1Jlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzUmVzdWx0LndpZHRoID0gMTAyNFxuICAgIGNhbnZhc1Jlc3VsdC5oZWlnaHQgPSA3MlxuICAgIHZhciBjb250ZXh0UmVzdWx0ID0gY2FudmFzUmVzdWx0LmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcFxuICAgIHZhciBpbWFnZU1hcCA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBjcmVhdGUgZGF0YU1hcCBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXBcbiAgICAgICAgdmFyIGNhbnZhc01hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgIGNhbnZhc01hcC53aWR0aCA9IGltYWdlTWFwLndpZHRoXG4gICAgICAgIGNhbnZhc01hcC5oZWlnaHQgPSBpbWFnZU1hcC5oZWlnaHRcbiAgICAgICAgdmFyIGNvbnRleHRNYXAgPSBjYW52YXNNYXAuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBjb250ZXh0TWFwLmRyYXdJbWFnZShpbWFnZU1hcCwgMCwgMClcbiAgICAgICAgdmFyIGRhdGFNYXAgPSBjb250ZXh0TWFwLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNNYXAud2lkdGgsIGNhbnZhc01hcC5oZWlnaHQpXG5cbiAgICAgICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgdmFyIGltYWdlVHJhbnMgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2VUcmFucy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgZGF0YVRyYW5zIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgICAgICB2YXIgY2FudmFzVHJhbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICAgICAgY2FudmFzVHJhbnMud2lkdGggPSBpbWFnZVRyYW5zLndpZHRoXG4gICAgICAgICAgICBjYW52YXNUcmFucy5oZWlnaHQgPSBpbWFnZVRyYW5zLmhlaWdodFxuICAgICAgICAgICAgdmFyIGNvbnRleHRUcmFucyA9IGNhbnZhc1RyYW5zLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgICAgIGNvbnRleHRUcmFucy5kcmF3SW1hZ2UoaW1hZ2VUcmFucywgMCwgMClcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnMgPSBjb250ZXh0VHJhbnMuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc1RyYW5zLndpZHRoLCBjYW52YXNUcmFucy5oZWlnaHQpXG4gICAgICAgICAgICAvLyBtZXJnZSBkYXRhTWFwICsgZGF0YVRyYW5zIGludG8gZGF0YVJlc3VsdFxuICAgICAgICAgICAgdmFyIGRhdGFSZXN1bHQgPSBjb250ZXh0TWFwLmNyZWF0ZUltYWdlRGF0YShjYW52YXNSZXN1bHQud2lkdGgsIGNhbnZhc1Jlc3VsdC5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMCwgb2Zmc2V0ID0gMDsgeSA8IGltYWdlTWFwLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZU1hcC53aWR0aDsgeCsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMF0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMF1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDFdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDFdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAyXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAyXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgM10gPSAyNTUgLSBkYXRhVHJhbnMuZGF0YVtvZmZzZXQgKyAwXSAvIDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGV4dHVyZSB3aXRoIHJlc3VsdFxuICAgICAgICAgICAgY29udGV4dFJlc3VsdC5wdXRJbWFnZURhdGEoZGF0YVJlc3VsdCwgMCwgMClcbiAgICAgICAgICAgIG1hdGVyaWFsLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgICAgIGltYWdlVHJhbnMuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzcmluZ3RyYW5zLmdpZic7XG4gICAgfSwgZmFsc2UpO1xuICAgIGltYWdlTWFwLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3VyYW51c3Jpbmdjb2xvdXIuanBnJztcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5KDAuNTUsIDAuNzUsIDY0KTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIC8vIG1hcFx0XHQ6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCsnaW1hZ2VzL2FzaF91dmdyaWQwMS5qcGcnKSxcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIG1lc2gubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAuNSwgLTQsIDEpKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTmVwdHVuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL25lcHR1bmVtYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlUGx1dG8gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9wbHV0b21hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3BsdXRvYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU3RhcmZpZWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9nYWxheHlfc3RhcmZpZWxkLnBuZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxuICAgIH0pXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMCwgMzIsIDMyKVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cdFx0Y29tbWVudFx0XHRcdFx0XHRcdFx0XHQvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIGNoYW5nZSB0aGUgb3JpZ2luYWwgZnJvbSB0aHJlZS5qcyBiZWNhdXNlIGkgbmVlZGVkIGRpZmZlcmVudCBVVlxuICpcbiAqIEBhdXRob3IgS2FsZWIgTXVycGh5XG4gKiBAYXV0aG9yIGplcm9tZSBldGllbm5lXG4gKi9cblRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkgPSBmdW5jdGlvbiAoaW5uZXJSYWRpdXMsIG91dGVyUmFkaXVzLCB0aGV0YVNlZ21lbnRzKSB7XG5cbiAgICBUSFJFRS5HZW9tZXRyeS5jYWxsKHRoaXMpXG5cbiAgICBpbm5lclJhZGl1cyA9IGlubmVyUmFkaXVzIHx8IDBcbiAgICBvdXRlclJhZGl1cyA9IG91dGVyUmFkaXVzIHx8IDUwXG4gICAgdGhldGFTZWdtZW50cyA9IHRoZXRhU2VnbWVudHMgfHwgOFxuXG4gICAgdmFyIG5vcm1hbCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDEpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoZXRhU2VnbWVudHM7IGkrKykge1xuICAgICAgICB2YXIgYW5nbGVMbyA9IChpIC8gdGhldGFTZWdtZW50cykgKiBNYXRoLlBJICogMlxuICAgICAgICB2YXIgYW5nbGVIaSA9ICgoaSArIDEpIC8gdGhldGFTZWdtZW50cykgKiBNYXRoLlBJICogMlxuXG4gICAgICAgIHZhciB2ZXJ0ZXgxID0gbmV3IFRIUkVFLlZlY3RvcjMoaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUxvKSwgaW5uZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUxvKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXgyID0gbmV3IFRIUkVFLlZlY3RvcjMob3V0ZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUxvKSwgb3V0ZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUxvKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXgzID0gbmV3IFRIUkVFLlZlY3RvcjMoaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUhpKSwgaW5uZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUhpKSwgMCk7XG4gICAgICAgIHZhciB2ZXJ0ZXg0ID0gbmV3IFRIUkVFLlZlY3RvcjMob3V0ZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUhpKSwgb3V0ZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZUhpKSwgMCk7XG5cbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDEpO1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4Mik7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgzKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDQpO1xuXG5cbiAgICAgICAgdmFyIHZlcnRleElkeCA9IGkgKiA0O1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZmlyc3QgdHJpYW5nbGVcbiAgICAgICAgdmFyIGZhY2UgPSBuZXcgVEhSRUUuRmFjZTModmVydGV4SWR4ICsgMCwgdmVydGV4SWR4ICsgMSwgdmVydGV4SWR4ICsgMiwgbm9ybWFsKTtcbiAgICAgICAgdmFyIHV2cyA9IFtdXG5cbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMCwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDApXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcblxuICAgICAgICB0aGlzLmZhY2VzLnB1c2goZmFjZSk7XG4gICAgICAgIHRoaXMuZmFjZVZlcnRleFV2c1swXS5wdXNoKHV2cyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBzZWNvbmQgdHJpYW5nbGVcbiAgICAgICAgdmFyIGZhY2UgPSBuZXcgVEhSRUUuRmFjZTModmVydGV4SWR4ICsgMiwgdmVydGV4SWR4ICsgMSwgdmVydGV4SWR4ICsgMywgbm9ybWFsKTtcbiAgICAgICAgdmFyIHV2cyA9IFtdXG5cbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMCwgMSlcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDApXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigxLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcblxuICAgICAgICB0aGlzLmZhY2VzLnB1c2goZmFjZSk7XG4gICAgICAgIHRoaXMuZmFjZVZlcnRleFV2c1swXS5wdXNoKHV2cyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb21wdXRlQ2VudHJvaWRzKCk7XG4gICAgdGhpcy5jb21wdXRlRmFjZU5vcm1hbHMoKTtcblxuICAgIHRoaXMuYm91bmRpbmdTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlKG5ldyBUSFJFRS5WZWN0b3IzKCksIG91dGVyUmFkaXVzKTtcblxufTtcblRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5HZW9tZXRyeS5wcm90b3R5cGUpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUV4O1xuIiwiLy9EZXBlbmRlbmNpZXNcbnZhciBFYXJ0aCA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vZWFydGgnKTtcbnZhciBTdW4gPSByZXF1aXJlKCcuL3RoZVNvbGFyU3lzdGVtL3N1bicpO1xuLy9Db25maWdcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKTtcbnZhciBzY2VuZTtcbnZhciBjYW1lcmE7XG52YXIgZmllbGRPZlZpZXc7XG52YXIgYXNwZWN0UmF0aW87XG52YXIgcmVuZGVyZXI7XG52YXIgbmVhclBsYW5lO1xudmFyIGZhclBsYW5lO1xudmFyIGNvbnRyb2xzO1xudmFyIGd1aTtcbi8vTGlnaHRzXG52YXIgbGlnaHQ7XG52YXIgc2hhZG93TGlnaHQ7XG5cbi8vQ29uc3RhbnRzXG5jb25zdCBFTlYgPSAnZGV2JztcbnZhciBIRUlHSFQ7XG52YXIgV0lEVEg7XG5cbi8vR2xvYmFsXG52YXIgb25SZW5kZXJDb250YWluZXIgPSBbXTtcbnZhciBsYXN0VGltZU1zZWMgPSBudWxsXG5cbmZ1bmN0aW9uIGFwcGVuZFNjZW5lKCkge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGFkZExpZ2h0cygpIHtcbiAgICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpXG4gICAgc2NlbmUuYWRkKGxpZ2h0KTtcbn1cbmZ1bmN0aW9uIGlzRGV2KCkge1xuICAgIHJldHVybiBFTlYgPT0gJ2Rldic7XG59XG5mdW5jdGlvbiBhZGRDYW1lcmEoKSB7XG4gICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgICAgICBmaWVsZE9mVmlldyxcbiAgICAgICAgYXNwZWN0UmF0aW8sXG4gICAgICAgIG5lYXJQbGFuZSxcbiAgICAgICAgZmFyUGxhbmUpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gLTQwMDtcbiAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDIwMCwgMCkpO1xufVxuZnVuY3Rpb24gYWRkQ29udHJvbHMoKSB7XG4gICAgY29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoY2FtZXJhKTtcbiAgICBjb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICAgIGNvbnRyb2xzLnJvdGF0ZVNwZWVkID0gMS4wO1xuICAgIGNvbnRyb2xzLnpvb21TcGVlZCA9IDEuMjtcbiAgICBjb250cm9scy5wYW5TcGVlZCA9IDAuODtcblxuICAgIGNvbnRyb2xzLm5vWm9vbSA9IGZhbHNlO1xuICAgIGNvbnRyb2xzLm5vUGFuID0gZmFsc2U7XG5cbiAgICBjb250cm9scy5zdGF0aWNNb3ZpbmcgPSB0cnVlO1xuICAgIGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4zO1xuXG4gICAgY29udHJvbHMua2V5cyA9IFs2NSwgODMsIDY4XTtcbiAgICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZW5kZXIpO1xufVxuZnVuY3Rpb24gY29uZmlndXJlU2NlbmUoKSB7XG4gICAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICBzY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKDB4MDUwNTA1LCAyMDAwLCA0MDAwKTtcblxuICAgIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBXSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGFzcGVjdFJhdGlvID0gV0lEVEggLyBIRUlHSFQ7XG4gICAgZmllbGRPZlZpZXcgPSA2MDtcbiAgICBuZWFyUGxhbmUgPSAuMTtcbiAgICBmYXJQbGFuZSA9IDEwMDAwO1xuICAgIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FscGhhOiB0cnVlLCBhbnRpYWxpYXM6IHRydWV9KTtcbiAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwLCAxKTtcbiAgICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuICAgIHJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdHJ1ZTtcbiAgICBhZGRDYW1lcmEoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBhZGRDb250cm9scygpO1xuICAgIH1cbiAgICBhZGRMaWdodHMoKTtcbn1cbmZ1bmN0aW9uIGFuaW1hdGUobnVtYmVyKSB7XG4gICAgcmVuZGVyKCk7XG4gICAgaWYgKHR5cGVvZiBudW1iZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbnVtYmVyID0gMDtcbiAgICB9XG4gICAgbGFzdFRpbWVNc2VjID0gbGFzdFRpbWVNc2VjIHx8IG51bWJlciAtIDEwMDAgLyA2MFxuICAgIHZhciBkZWx0YU1zZWMgPSBNYXRoLm1pbigyMDAsIG51bWJlciAtIGxhc3RUaW1lTXNlYylcbiAgICBsYXN0VGltZU1zZWMgPSBudW1iZXJcbiAgICAvLyBjYWxsIGVhY2ggdXBkYXRlIGZ1bmN0aW9uXG4gICAgb25SZW5kZXJDb250YWluZXIuZm9yRWFjaChmdW5jdGlvbiAob25SZW5kZXJDb250YWluZXIpIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIoZGVsdGFNc2VjIC8gMTAwMCwgbnVtYmVyIC8gMTAwMClcbiAgICB9KVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbn1cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5mdW5jdGlvbiBndWkoKSB7XG4gICAgZ3VpID0gbmV3IGRhdC5HVUkoKTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICB0ZXN0OiAxMDAwXG4gICAgfTtcbiAgICBndWkuYWRkKHBhcmFtcywgJ3Rlc3QnKTtcbn1cbmZ1bmN0aW9uIGFkZFBsYW5ldHMoKSB7XG4gICAgdmFyIGVhcnRoID0gRWFydGgubWFrZShzY2VuZSk7XG4gICAgdmFyIGVhcnRoQW5pbWF0aW9ucyA9IGVhcnRoLmdldEFuaW1hdGlvbnMoKTtcbiAgICBlYXJ0aEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBzdW4gPSBTdW4ubWFrZShzY2VuZSk7XG4gICAgdmFyIHN1bkFuaW1hdGlvbnMgPSBzdW4uZ2V0QW5pbWF0aW9ucygpO1xuICAgIHN1bkFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uZmlndXJlU2NlbmUoKTtcbiAgICBhZGRQbGFuZXRzKCk7XG4gICAgYXBwZW5kU2NlbmUoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBndWkoKTtcbiAgICB9XG4gICAgYW5pbWF0ZSgpO1xufVxuaW5pdCgpO1xuIiwidmFyIFBsYW5ldHMgPSByZXF1aXJlKCcuLi9saWIvdGhyZWV4LnBsYW5ldHMnKTtcbnZhciBBdG1vc3BoZXJlcyA9IHJlcXVpcmUoJy4uL2xpYi90aHJlZXguYXRtb3NwaGVyZW1hdGVyaWFsJyk7XG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBFYXJ0aCA9IHtcbiAgICAvL0BtYXRoIDYwICogNjAgKiAyMy41NjAzICgyM2g1NiAwMycpXG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ4MTcuNDcyNCxcbiAgICBpc1JlYWxpc3RpYzogZmFsc2UsXG4gICAgZGlhbWV0ZXI6IDMsXG4gICAgYXRtb3NwaGVyZVJhZGl1czogdW5kZWZpbmVkLFxuICAgIGF0bW9zcGhlcmVTaXplOiB1bmRlZmluZWQsXG4gICAgYXhpYWxUaWx0OiAyMy40LFxuICAgIC8vQG1hdGggcmV0dXJuIChEZWdyZWUuY29udmVydCgzNjApIC8gdGhpcy50aW1lVG9GdWxsU2VsZlJvdGF0aW9uKTtcbiAgICByb3RhdGlvblBlclNlY29uZDogMC4wMDAwMDczOTM1NzAzODkwMTAwNDMsXG4gICAgb3JiaXRSYWRpdXM6IDM1NjQzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuXG4gICAgbWFrZTogZnVuY3Rpb24gKHNjZW5lLCBpc1JlYWxpc3RpYykge1xuICAgICAgICB0aGlzLm1hbmFnZVJlYWxpc20oaXNSZWFsaXN0aWMpO1xuICAgICAgICB0aGlzLmluaXQoc2NlbmUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdG1vc3BoZXJlKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQ2xvdWRzKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGggPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIC8vU3VuIGRpYW1ldGVyICogMTA5ID0gcmFkaXVzIG9mIGVhcnRoJ3Mgb3JiaXQgKDE0OSw1OTcsODcwIGttKSAoMzU2NDMpXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGgucG9zaXRpb24ueCA9IHRoaXMub3JiaXRSYWRpdXM7XG4gICAgICAgIC8vRWFydGggaXMgbW9yZSBvciBsZXNzIDEwOSB0aW1lcyBzbWFsbGVyIHRoYW4gc3VuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5jb250YWluZXJFYXJ0aCk7XG5cbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlUmFkaXVzID0gdGhpcy5kaWFtZXRlciArICh0aGlzLmRpYW1ldGVyIC8gMik7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZVNpemUgPSB0aGlzLmRpYW1ldGVyIC8gNjA7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoID0gUGxhbmV0cy5QbGFuZXRzLmNyZWF0ZUVhcnRoKCk7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLnJvdGF0aW9uLnkgPSAwO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2guY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuZWFydGhNZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgRWFydGguZWFydGhNZXNoLnJvdGF0aW9uLnkgKz0gRWFydGgucm90YXRpb25QZXJTZWNvbmQgLyA2MDtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNyZWF0ZUF0bW9zcGhlcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuYXRtb3NwaGVyZVNpemUsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cywgdGhpcy5hdG1vc3BoZXJlUmFkaXVzKTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gQXRtb3NwaGVyZXMuY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsKClcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldCgweDAwYjNmZilcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29lZmljaWVudC52YWx1ZSA9IDAuOFxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDIuMFxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMS5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjAxKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5hdG1vc3BoZXJlMSk7XG5cbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuYXRtb3NwaGVyZVNpemUsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cywgdGhpcy5hdG1vc3BoZXJlUmFkaXVzKTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gQXRtb3NwaGVyZXMuY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsKClcbiAgICAgICAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmdsb3dDb2xvci52YWx1ZS5zZXQoMHgwMGIzZmYpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmNvZWZpY2llbnQudmFsdWUgPSAwLjVcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMucG93ZXIudmFsdWUgPSA0LjBcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTIuc2NhbGUubXVsdGlwbHlTY2FsYXIoMS4xNSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuYXRtb3NwaGVyZTIpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVDbG91ZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkID0gUGxhbmV0cy5QbGFuZXRzLmNyZWF0ZUVhcnRoQ2xvdWQoKTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuZWFydGhDbG91ZCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIEVhcnRoLmVhcnRoQ2xvdWQucm90YXRpb24ueSArPSAoRWFydGgucm90YXRpb25QZXJTZWNvbmQgKiAxLjIpIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyICo9IDEwO1xuICAgICAgICAgICAgdGhpcy5vcmJpdFJhZGl1cyAvPSAxMDA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFYXJ0aDtcbiIsInZhciBQbGFuZXRzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5wbGFuZXRzJyk7XG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBTdW4gPSB7XG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ5ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGxpZ2h0RGlzdGFuY2U6IDEwMDAwLFxuICAgIGRpYW1ldGVyOiAzMjcwLFxuICAgIGF4aWFsVGlsdDogNy4yNSxcbiAgICAvL3JvdGF0aW9uUGVyU2Vjb25kOiAxLjQ2MDQ1ODM0ODQ0NjQyODMsXG4gICAgcm90YXRpb25QZXJTZWNvbmQ6IDAuMDAwMDAwMDE0NjA0NTgzNDg0NDY0MjgzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuICAgIG1ha2U6IGZ1bmN0aW9uIChzY2VuZSwgaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VSZWFsaXNtKGlzUmVhbGlzdGljKTtcbiAgICAgICAgdGhpcy5pbml0KHNjZW5lKTtcbiAgICAgICAgdGhpcy5jcmVhdGVNZXNoKCk7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoc2NlbmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGdldEFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucztcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1biA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLnBvc2l0aW9uLnogPSAwO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lclN1bik7XG4gICAgfSxcbiAgICBhZGRMaWdodDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgdGhpcy5saWdodERpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMubGlnaHQuc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5saWdodCk7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3VuTWVzaCA9IFBsYW5ldHMuUGxhbmV0cy5jcmVhdGVTdW4oKTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnJvdGF0aW9uLnkgPSAwO1xuICAgICAgICB0aGlzLnN1bk1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4uYWRkKHRoaXMuc3VuTWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIFN1bi5zdW5NZXNoLnJvdGF0aW9uLnkgKz0gU3VuLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgLz0gMTA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDAwO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdW47XG4iXX0=
