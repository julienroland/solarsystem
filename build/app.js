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
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthdiffuse.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthbump1k.jpg'),
        bumpScale: 1,
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
    var geometry = new THREE.SphereGeometry(0.51, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthclouds.png'),
        side: THREE.DoubleSide,
        transparent: true,
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
var clock = new THREE.Clock();
//Lights
var light;
var shadowLight;

//Constants
const ENV = 'dev';
var HEIGHT;
var WIDTH;

//Global
var onRenderContainer = [];

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
    controls.addEventListener('change', function(){
        render(clock.getDelta());
    });
}
function configureScene() {
    scene = new THREE.Scene();

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = .1;
    farPlane = 10000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(0x000000);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    addLights();
}

function animate() {
    requestAnimationFrame(animate);
    render(clock.getDelta());
    controls.update();
}
function render(delta) {
    onRenderContainer.forEach(function (onRenderContainer) {
        onRenderContainer(delta);
    });
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
        this.particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('./images/particle1.jpeg'),
            maxAge: 5,
            hasPerspective: true,
            blending: THREE.AdditiveBlending,
            colorize: true
        });
        var particleEmitter = new SPE.Emitter({
            type: 'sphere',
            position: new THREE.Vector3(0, 0, 0),

            radius: this.diameter,
            radiusSpread: 2,
            radiusSpreadClamp: 2,
            radiusScale: new THREE.Vector3(0.51, 0.51, 0.51),

            speed: 1,
            speedSpread: 2,
            //colorStart: new THREE.Color('red'),
            //colorEnd: new THREE.Color('red'),


            sizeStart: 200,
            sizeMiddle: 100,
            sizeEnd: 50,
            opacityStart: 1,
            opacityMiddle: 0.8,
            opacityEnd: 0,
            //particlesPerSecond: 10,
            isStatic: 0,
            particleCount: 200
        });
        this.particleGroup.addEmitter(particleEmitter);
        scene.add(this.particleGroup.mesh);
        this.registerAnimation(function (delta) {
            Sun.particleGroup.tick(delta);
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

},{"../lib/int":1,"../lib/threex.planets":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJsaWIvdGhyZWV4LnBsYW5ldHMuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSW50ID0ge1xuICAgIGdldFJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnQ7XG4iLCJ2YXIgVEhSRUV4ID0gVEhSRUV4IHx8IHt9XG5cbi8qKlxuICogZnJvbSBodHRwOi8vc3RlbWtvc2tpLmJsb2dzcG90LmZyLzIwMTMvMDcvc2hhZGVycy1pbi10aHJlZWpzLWdsb3ctYW5kLWhhbG8uaHRtbFxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gKi9cblRIUkVFeC5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZlcnRleFNoYWRlciA9IFtcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2VmVydGV4Tm9ybWFsXHQ9IG5vcm1hbGl6ZShub3JtYWxNYXRyaXggKiBub3JtYWwpOycsXG5cbiAgICAgICAgJ1x0dlZlcnRleFdvcmxkUG9zaXRpb25cdD0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycsXG5cbiAgICAgICAgJ1x0Ly8gc2V0IGdsX1Bvc2l0aW9uJyxcbiAgICAgICAgJ1x0Z2xfUG9zaXRpb25cdD0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgXS5qb2luKCdcXG4nKVxuICAgIHZhciBmcmFnbWVudFNoYWRlciA9IFtcbiAgICAgICAgJ3VuaWZvcm0gdmVjM1x0Z2xvd0NvbG9yOycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRjb2VmaWNpZW50OycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRwb3dlcjsnLFxuXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dmVjMyB3b3JsZENhbWVyYVRvVmVydGV4PSB2VmVydGV4V29ybGRQb3NpdGlvbiAtIGNhbWVyYVBvc2l0aW9uOycsXG4gICAgICAgICdcdHZlYzMgdmlld0NhbWVyYVRvVmVydGV4XHQ9ICh2aWV3TWF0cml4ICogdmVjNCh3b3JsZENhbWVyYVRvVmVydGV4LCAwLjApKS54eXo7JyxcbiAgICAgICAgJ1x0dmlld0NhbWVyYVRvVmVydGV4XHQ9IG5vcm1hbGl6ZSh2aWV3Q2FtZXJhVG9WZXJ0ZXgpOycsXG4gICAgICAgICdcdGZsb2F0IGludGVuc2l0eVx0XHQ9IHBvdyhjb2VmaWNpZW50ICsgZG90KHZWZXJ0ZXhOb3JtYWwsIHZpZXdDYW1lcmFUb1ZlcnRleCksIHBvd2VyKTsnLFxuICAgICAgICAnXHRnbF9GcmFnQ29sb3JcdFx0PSB2ZWM0KGdsb3dDb2xvciwgaW50ZW5zaXR5KTsnLFxuICAgICAgICAnfScsXG4gICAgXS5qb2luKCdcXG4nKVxuXG4gICAgLy8gY3JlYXRlIGN1c3RvbSBtYXRlcmlhbCBmcm9tIHRoZSBzaGFkZXIgY29kZSBhYm92ZVxuICAgIC8vICAgdGhhdCBpcyB3aXRoaW4gc3BlY2lhbGx5IGxhYmVsZWQgc2NyaXB0IHRhZ3NcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgY29lZmljaWVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAxLjBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3dlcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2xvd0NvbG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJjXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigncGluaycpXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleFNoYWRlcixcbiAgICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50U2hhZGVyLFxuICAgICAgICAvL2JsZW5kaW5nXHQ6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICB9KTtcbiAgICByZXR1cm4gbWF0ZXJpYWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRXg7XG4iLCJ2YXIgVEhSRUV4ID0gVEhSRUV4IHx8IHt9XG5cblRIUkVFeC5QbGFuZXRzID0ge31cblxuVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCA9ICcuL2xpYi8nXG5cbi8vIGZyb20gaHR0cDovL3BsYW5ldHBpeGVsZW1wb3JpdW0uY29tL1xuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTdW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zdW5tYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU1lcmN1cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tZXJjdXJ5bWFwLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21lcmN1cnlidW1wLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlVmVudXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy92ZW51c21hcC5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy92ZW51c2J1bXAuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVFYXJ0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoZGlmZnVzZS5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aGJ1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAxLFxuICAgICAgICBzcGVjdWxhck1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9lYXJ0aHNwZWMxay5qcGcnKSxcbiAgICAgICAgc3BlY3VsYXI6IG5ldyBUSFJFRS5Db2xvcignZ3JleScpXG4gICAgfSlcbiAgICBtYXRlcmlhbC5tYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIG1hdGVyaWFsLmJ1bXBNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIG1hdGVyaWFsLnNwZWN1bGFyTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVFYXJ0aENsb3VkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUxLCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoY2xvdWRzLnBuZycpLFxuICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTW9vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21vb25tYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tb29uYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDAyLFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21hcnNtYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9tYXJzYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVKdXBpdGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvanVwaXRlcm1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAyLFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTYXR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5tYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlU2F0dXJuUmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjcmVhdGUgZGVzdGluYXRpb24gY2FudmFzXG4gICAgdmFyIGNhbnZhc1Jlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzUmVzdWx0LndpZHRoID0gOTE1XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDY0XG4gICAgdmFyIGNvbnRleHRSZXN1bHQgPSBjYW52YXNSZXN1bHQuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwXG4gICAgdmFyIGltYWdlTWFwID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2VNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRhTWFwIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcFxuICAgICAgICB2YXIgY2FudmFzTWFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgY2FudmFzTWFwLndpZHRoID0gaW1hZ2VNYXAud2lkdGhcbiAgICAgICAgY2FudmFzTWFwLmhlaWdodCA9IGltYWdlTWFwLmhlaWdodFxuICAgICAgICB2YXIgY29udGV4dE1hcCA9IGNhbnZhc01hcC5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIGNvbnRleHRNYXAuZHJhd0ltYWdlKGltYWdlTWFwLCAwLCAwKVxuICAgICAgICB2YXIgZGF0YU1hcCA9IGNvbnRleHRNYXAuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcblxuICAgICAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICB2YXIgaW1hZ2VUcmFucyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZVRyYW5zLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkYXRhVHJhbnMgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgICAgIHZhciBjYW52YXNUcmFucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgICAgICBjYW52YXNUcmFucy53aWR0aCA9IGltYWdlVHJhbnMud2lkdGhcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLmhlaWdodCA9IGltYWdlVHJhbnMuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgY29udGV4dFRyYW5zID0gY2FudmFzVHJhbnMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICAgICAgY29udGV4dFRyYW5zLmRyYXdJbWFnZShpbWFnZVRyYW5zLCAwLCAwKVxuICAgICAgICAgICAgdmFyIGRhdGFUcmFucyA9IGNvbnRleHRUcmFucy5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzVHJhbnMud2lkdGgsIGNhbnZhc1RyYW5zLmhlaWdodClcbiAgICAgICAgICAgIC8vIG1lcmdlIGRhdGFNYXAgKyBkYXRhVHJhbnMgaW50byBkYXRhUmVzdWx0XG4gICAgICAgICAgICB2YXIgZGF0YVJlc3VsdCA9IGNvbnRleHRNYXAuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc1Jlc3VsdC53aWR0aCwgY2FudmFzUmVzdWx0LmhlaWdodClcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCBvZmZzZXQgPSAwOyB5IDwgaW1hZ2VNYXAuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlTWFwLndpZHRoOyB4KyssIG9mZnNldCArPSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAwXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMV0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMV1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDJdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDJdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAzXSA9IDI1NSAtIGRhdGFUcmFucy5kYXRhW29mZnNldCArIDBdIC8gNFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5yaW5ncGF0dGVybi5naWYnO1xuICAgIH0sIGZhbHNlKTtcbiAgICBpbWFnZU1hcC5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9zYXR1cm5yaW5nY29sb3IuanBnJztcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5KDAuNTUsIDAuNzUsIDY0KTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhc1Jlc3VsdCksXG4gICAgICAgIC8vIG1hcFx0XHQ6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCsnaW1hZ2VzL2FzaF91dmdyaWQwMS5qcGcnKSxcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIG1lc2gubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAuNSwgLTQsIDEpKVxuICAgIHJldHVybiBtZXNoXG59XG5cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlVXJhbnVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzbWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVVcmFudXNSaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGNyZWF0ZSBkZXN0aW5hdGlvbiBjYW52YXNcbiAgICB2YXIgY2FudmFzUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXNSZXN1bHQud2lkdGggPSAxMDI0XG4gICAgY2FudmFzUmVzdWx0LmhlaWdodCA9IDcyXG4gICAgdmFyIGNvbnRleHRSZXN1bHQgPSBjYW52YXNSZXN1bHQuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gbG9hZCBlYXJ0aGNsb3VkbWFwXG4gICAgdmFyIGltYWdlTWFwID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2VNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRhTWFwIEltYWdlRGF0YSBmb3IgZWFydGhjbG91ZG1hcFxuICAgICAgICB2YXIgY2FudmFzTWFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgY2FudmFzTWFwLndpZHRoID0gaW1hZ2VNYXAud2lkdGhcbiAgICAgICAgY2FudmFzTWFwLmhlaWdodCA9IGltYWdlTWFwLmhlaWdodFxuICAgICAgICB2YXIgY29udGV4dE1hcCA9IGNhbnZhc01hcC5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIGNvbnRleHRNYXAuZHJhd0ltYWdlKGltYWdlTWFwLCAwLCAwKVxuICAgICAgICB2YXIgZGF0YU1hcCA9IGNvbnRleHRNYXAuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc01hcC53aWR0aCwgY2FudmFzTWFwLmhlaWdodClcblxuICAgICAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICB2YXIgaW1hZ2VUcmFucyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZVRyYW5zLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkYXRhVHJhbnMgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwdHJhbnNcbiAgICAgICAgICAgIHZhciBjYW52YXNUcmFucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgICAgICAgICBjYW52YXNUcmFucy53aWR0aCA9IGltYWdlVHJhbnMud2lkdGhcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLmhlaWdodCA9IGltYWdlVHJhbnMuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgY29udGV4dFRyYW5zID0gY2FudmFzVHJhbnMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICAgICAgY29udGV4dFRyYW5zLmRyYXdJbWFnZShpbWFnZVRyYW5zLCAwLCAwKVxuICAgICAgICAgICAgdmFyIGRhdGFUcmFucyA9IGNvbnRleHRUcmFucy5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzVHJhbnMud2lkdGgsIGNhbnZhc1RyYW5zLmhlaWdodClcbiAgICAgICAgICAgIC8vIG1lcmdlIGRhdGFNYXAgKyBkYXRhVHJhbnMgaW50byBkYXRhUmVzdWx0XG4gICAgICAgICAgICB2YXIgZGF0YVJlc3VsdCA9IGNvbnRleHRNYXAuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc1Jlc3VsdC53aWR0aCwgY2FudmFzUmVzdWx0LmhlaWdodClcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCBvZmZzZXQgPSAwOyB5IDwgaW1hZ2VNYXAuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlTWFwLndpZHRoOyB4KyssIG9mZnNldCArPSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAwXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAwXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMV0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMV1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDJdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDJdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAzXSA9IDI1NSAtIGRhdGFUcmFucy5kYXRhW29mZnNldCArIDBdIC8gMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0ZXh0dXJlIHdpdGggcmVzdWx0XG4gICAgICAgICAgICBjb250ZXh0UmVzdWx0LnB1dEltYWdlRGF0YShkYXRhUmVzdWx0LCAwLCAwKVxuICAgICAgICAgICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgaW1hZ2VUcmFucy5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy91cmFudXNyaW5ndHJhbnMuZ2lmJztcbiAgICB9LCBmYWxzZSk7XG4gICAgaW1hZ2VNYXAuc3JjID0gVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvdXJhbnVzcmluZ2NvbG91ci5qcGcnO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkoMC41NSwgMC43NSwgNjQpO1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzUmVzdWx0KSxcbiAgICAgICAgLy8gbWFwXHRcdDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMKydpbWFnZXMvYXNoX3V2Z3JpZDAxLmpwZycpLFxuICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgbWVzaC5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMC41LCAtNCwgMSkpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVOZXB0dW5lID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbmVwdHVuZW1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVQbHV0byA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3BsdXRvbWFwMWsuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvcGx1dG9idW1wMWsuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTdGFyZmllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2dhbGF4eV9zdGFyZmllbGQucG5nJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXG4gICAgfSlcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTAwLCAzMiwgMzIpXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1x0XHRjb21tZW50XHRcdFx0XHRcdFx0XHRcdC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogY2hhbmdlIHRoZSBvcmlnaW5hbCBmcm9tIHRocmVlLmpzIGJlY2F1c2UgaSBuZWVkZWQgZGlmZmVyZW50IFVWXG4gKlxuICogQGF1dGhvciBLYWxlYiBNdXJwaHlcbiAqIEBhdXRob3IgamVyb21lIGV0aWVubmVcbiAqL1xuVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeSA9IGZ1bmN0aW9uIChpbm5lclJhZGl1cywgb3V0ZXJSYWRpdXMsIHRoZXRhU2VnbWVudHMpIHtcblxuICAgIFRIUkVFLkdlb21ldHJ5LmNhbGwodGhpcylcblxuICAgIGlubmVyUmFkaXVzID0gaW5uZXJSYWRpdXMgfHwgMFxuICAgIG91dGVyUmFkaXVzID0gb3V0ZXJSYWRpdXMgfHwgNTBcbiAgICB0aGV0YVNlZ21lbnRzID0gdGhldGFTZWdtZW50cyB8fCA4XG5cbiAgICB2YXIgbm9ybWFsID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMSlcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhldGFTZWdtZW50czsgaSsrKSB7XG4gICAgICAgIHZhciBhbmdsZUxvID0gKGkgLyB0aGV0YVNlZ21lbnRzKSAqIE1hdGguUEkgKiAyXG4gICAgICAgIHZhciBhbmdsZUhpID0gKChpICsgMSkgLyB0aGV0YVNlZ21lbnRzKSAqIE1hdGguUEkgKiAyXG5cbiAgICAgICAgdmFyIHZlcnRleDEgPSBuZXcgVEhSRUUuVmVjdG9yMyhpbm5lclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlTG8pLCBpbm5lclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlTG8pLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDIgPSBuZXcgVEhSRUUuVmVjdG9yMyhvdXRlclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlTG8pLCBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlTG8pLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDMgPSBuZXcgVEhSRUUuVmVjdG9yMyhpbm5lclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSGkpLCBpbm5lclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSGkpLCAwKTtcbiAgICAgICAgdmFyIHZlcnRleDQgPSBuZXcgVEhSRUUuVmVjdG9yMyhvdXRlclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSGkpLCBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSGkpLCAwKTtcblxuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4MSk7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgyKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDMpO1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4NCk7XG5cblxuICAgICAgICB2YXIgdmVydGV4SWR4ID0gaSAqIDQ7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBmaXJzdCB0cmlhbmdsZVxuICAgICAgICB2YXIgZmFjZSA9IG5ldyBUSFJFRS5GYWNlMyh2ZXJ0ZXhJZHggKyAwLCB2ZXJ0ZXhJZHggKyAxLCB2ZXJ0ZXhJZHggKyAyLCBub3JtYWwpO1xuICAgICAgICB2YXIgdXZzID0gW11cblxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDEpXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuXG4gICAgICAgIHRoaXMuZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgdGhpcy5mYWNlVmVydGV4VXZzWzBdLnB1c2godXZzKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHNlY29uZCB0cmlhbmdsZVxuICAgICAgICB2YXIgZmFjZSA9IG5ldyBUSFJFRS5GYWNlMyh2ZXJ0ZXhJZHggKyAyLCB2ZXJ0ZXhJZHggKyAxLCB2ZXJ0ZXhJZHggKyAzLCBub3JtYWwpO1xuICAgICAgICB2YXIgdXZzID0gW11cblxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigwLCAxKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMClcbiAgICAgICAgdXZzLnB1c2godXYpXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDEpXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuXG4gICAgICAgIHRoaXMuZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgdGhpcy5mYWNlVmVydGV4VXZzWzBdLnB1c2godXZzKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXB1dGVDZW50cm9pZHMoKTtcbiAgICB0aGlzLmNvbXB1dGVGYWNlTm9ybWFscygpO1xuXG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmUobmV3IFRIUkVFLlZlY3RvcjMoKSwgb3V0ZXJSYWRpdXMpO1xuXG59O1xuVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFRIUkVFLkdlb21ldHJ5LnByb3RvdHlwZSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRXg7XG4iLCIvL0RlcGVuZGVuY2llc1xudmFyIEVhcnRoID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9lYXJ0aCcpO1xudmFyIFN1biA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vc3VuJyk7XG4vL0NvbmZpZ1xudmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY2VuZScpO1xudmFyIHNjZW5lO1xudmFyIGNhbWVyYTtcbnZhciBmaWVsZE9mVmlldztcbnZhciBhc3BlY3RSYXRpbztcbnZhciByZW5kZXJlcjtcbnZhciBuZWFyUGxhbmU7XG52YXIgZmFyUGxhbmU7XG52YXIgY29udHJvbHM7XG52YXIgZ3VpO1xudmFyIGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4vL0xpZ2h0c1xudmFyIGxpZ2h0O1xudmFyIHNoYWRvd0xpZ2h0O1xuXG4vL0NvbnN0YW50c1xuY29uc3QgRU5WID0gJ2Rldic7XG52YXIgSEVJR0hUO1xudmFyIFdJRFRIO1xuXG4vL0dsb2JhbFxudmFyIG9uUmVuZGVyQ29udGFpbmVyID0gW107XG5cbmZ1bmN0aW9uIGFwcGVuZFNjZW5lKCkge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGFkZExpZ2h0cygpIHtcbiAgICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpXG4gICAgc2NlbmUuYWRkKGxpZ2h0KTtcbn1cbmZ1bmN0aW9uIGlzRGV2KCkge1xuICAgIHJldHVybiBFTlYgPT0gJ2Rldic7XG59XG5mdW5jdGlvbiBhZGRDYW1lcmEoKSB7XG4gICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgICAgICBmaWVsZE9mVmlldyxcbiAgICAgICAgYXNwZWN0UmF0aW8sXG4gICAgICAgIG5lYXJQbGFuZSxcbiAgICAgICAgZmFyUGxhbmUpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gLTQwMDtcbiAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDIwMCwgMCkpO1xufVxuZnVuY3Rpb24gYWRkQ29udHJvbHMoKSB7XG4gICAgY29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoY2FtZXJhKTtcbiAgICBjb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICAgIGNvbnRyb2xzLnJvdGF0ZVNwZWVkID0gMS4wO1xuICAgIGNvbnRyb2xzLnpvb21TcGVlZCA9IDEuMjtcbiAgICBjb250cm9scy5wYW5TcGVlZCA9IDAuODtcblxuICAgIGNvbnRyb2xzLm5vWm9vbSA9IGZhbHNlO1xuICAgIGNvbnRyb2xzLm5vUGFuID0gZmFsc2U7XG5cbiAgICBjb250cm9scy5zdGF0aWNNb3ZpbmcgPSB0cnVlO1xuICAgIGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4zO1xuXG4gICAgY29udHJvbHMua2V5cyA9IFs2NSwgODMsIDY4XTtcbiAgICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICByZW5kZXIoY2xvY2suZ2V0RGVsdGEoKSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBjb25maWd1cmVTY2VuZSgpIHtcbiAgICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgYXNwZWN0UmF0aW8gPSBXSURUSCAvIEhFSUdIVDtcbiAgICBmaWVsZE9mVmlldyA9IDYwO1xuICAgIG5lYXJQbGFuZSA9IC4xO1xuICAgIGZhclBsYW5lID0gMTAwMDA7XG4gICAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWUsIGFudGlhbGlhczogdHJ1ZX0pO1xuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDApO1xuICAgIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG4gICAgcmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgYWRkQ2FtZXJhKCk7XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgICAgYWRkQ29udHJvbHMoKTtcbiAgICB9XG4gICAgYWRkTGlnaHRzKCk7XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIHJlbmRlcihjbG9jay5nZXREZWx0YSgpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbn1cbmZ1bmN0aW9uIHJlbmRlcihkZWx0YSkge1xuICAgIG9uUmVuZGVyQ29udGFpbmVyLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyQ29udGFpbmVyKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyKGRlbHRhKTtcbiAgICB9KTtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5mdW5jdGlvbiBndWkoKSB7XG4gICAgZ3VpID0gbmV3IGRhdC5HVUkoKTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICB0ZXN0OiAxMDAwXG4gICAgfTtcbiAgICBndWkuYWRkKHBhcmFtcywgJ3Rlc3QnKTtcbn1cbmZ1bmN0aW9uIGFkZFBsYW5ldHMoKSB7XG4gICAgdmFyIGVhcnRoID0gRWFydGgubWFrZShzY2VuZSk7XG4gICAgdmFyIGVhcnRoQW5pbWF0aW9ucyA9IGVhcnRoLmdldEFuaW1hdGlvbnMoKTtcbiAgICBlYXJ0aEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBzdW4gPSBTdW4ubWFrZShzY2VuZSk7XG4gICAgdmFyIHN1bkFuaW1hdGlvbnMgPSBzdW4uZ2V0QW5pbWF0aW9ucygpO1xuICAgIHN1bkFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uZmlndXJlU2NlbmUoKTtcbiAgICBhZGRQbGFuZXRzKCk7XG4gICAgYXBwZW5kU2NlbmUoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBndWkoKTtcbiAgICB9XG4gICAgYW5pbWF0ZSgpO1xufVxuaW5pdCgpO1xuIiwidmFyIFBsYW5ldHMgPSByZXF1aXJlKCcuLi9saWIvdGhyZWV4LnBsYW5ldHMnKTtcbnZhciBBdG1vc3BoZXJlcyA9IHJlcXVpcmUoJy4uL2xpYi90aHJlZXguYXRtb3NwaGVyZW1hdGVyaWFsJyk7XG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBFYXJ0aCA9IHtcbiAgICAvL0BtYXRoIDYwICogNjAgKiAyMy41NjAzICgyM2g1NiAwMycpXG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ4MTcuNDcyNCxcbiAgICBpc1JlYWxpc3RpYzogZmFsc2UsXG4gICAgZGlhbWV0ZXI6IDMsXG4gICAgYXRtb3NwaGVyZVJhZGl1czogdW5kZWZpbmVkLFxuICAgIGF0bW9zcGhlcmVTaXplOiB1bmRlZmluZWQsXG4gICAgYXhpYWxUaWx0OiAyMy40LFxuICAgIC8vQG1hdGggcmV0dXJuIChEZWdyZWUuY29udmVydCgzNjApIC8gdGhpcy50aW1lVG9GdWxsU2VsZlJvdGF0aW9uKTtcbiAgICByb3RhdGlvblBlclNlY29uZDogMC4wMDAwMDczOTM1NzAzODkwMTAwNDMsXG4gICAgb3JiaXRSYWRpdXM6IDM1NjQzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuXG4gICAgbWFrZTogZnVuY3Rpb24gKHNjZW5lLCBpc1JlYWxpc3RpYykge1xuICAgICAgICB0aGlzLm1hbmFnZVJlYWxpc20oaXNSZWFsaXN0aWMpO1xuICAgICAgICB0aGlzLmluaXQoc2NlbmUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdG1vc3BoZXJlKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQ2xvdWRzKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGggPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIC8vU3VuIGRpYW1ldGVyICogMTA5ID0gcmFkaXVzIG9mIGVhcnRoJ3Mgb3JiaXQgKDE0OSw1OTcsODcwIGttKSAoMzU2NDMpXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGgucG9zaXRpb24ueCA9IHRoaXMub3JiaXRSYWRpdXM7XG4gICAgICAgIC8vRWFydGggaXMgbW9yZSBvciBsZXNzIDEwOSB0aW1lcyBzbWFsbGVyIHRoYW4gc3VuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5jb250YWluZXJFYXJ0aCk7XG5cbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlUmFkaXVzID0gdGhpcy5kaWFtZXRlciArICh0aGlzLmRpYW1ldGVyIC8gMik7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZVNpemUgPSB0aGlzLmRpYW1ldGVyIC8gNjA7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoID0gUGxhbmV0cy5QbGFuZXRzLmNyZWF0ZUVhcnRoKCk7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLnJvdGF0aW9uLnkgPSAwO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2guY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuZWFydGhNZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgRWFydGguZWFydGhNZXNoLnJvdGF0aW9uLnkgKz0gRWFydGgucm90YXRpb25QZXJTZWNvbmQgLyA2MDtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNyZWF0ZUF0bW9zcGhlcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuYXRtb3NwaGVyZVNpemUsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cywgdGhpcy5hdG1vc3BoZXJlUmFkaXVzKTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gQXRtb3NwaGVyZXMuY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsKClcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldCgweDAwYjNmZilcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29lZmljaWVudC52YWx1ZSA9IDAuOFxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDIuMFxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMS5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjAxKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5hdG1vc3BoZXJlMSk7XG5cbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuYXRtb3NwaGVyZVNpemUsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cywgdGhpcy5hdG1vc3BoZXJlUmFkaXVzKTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gQXRtb3NwaGVyZXMuY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsKClcbiAgICAgICAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmdsb3dDb2xvci52YWx1ZS5zZXQoMHgwMGIzZmYpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmNvZWZpY2llbnQudmFsdWUgPSAwLjVcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMucG93ZXIudmFsdWUgPSA0LjBcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTIuc2NhbGUubXVsdGlwbHlTY2FsYXIoMS4xNSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuYXRtb3NwaGVyZTIpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVDbG91ZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkID0gUGxhbmV0cy5QbGFuZXRzLmNyZWF0ZUVhcnRoQ2xvdWQoKTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuZWFydGhDbG91ZCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIEVhcnRoLmVhcnRoQ2xvdWQucm90YXRpb24ueSArPSAoRWFydGgucm90YXRpb25QZXJTZWNvbmQgKiAxLjIpIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyICo9IDEwO1xuICAgICAgICAgICAgdGhpcy5vcmJpdFJhZGl1cyAvPSAxMDA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFYXJ0aDtcbiIsInZhciBQbGFuZXRzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5wbGFuZXRzJyk7XG52YXIgSW50ID0gcmVxdWlyZSgnLi4vbGliL2ludCcpO1xuLy9AbWF0aCB2YXIgRGVncmVlID0gcmVxdWlyZSgnLi4vbGliL2RlZ3JlZUluUmFkaWFuJyk7XG52YXIgU3VuID0ge1xuICAgIHRpbWVUb0Z1bGxTZWxmUm90YXRpb246IDg0OTgxNy40NzI0LFxuICAgIGlzUmVhbGlzdGljOiBmYWxzZSxcbiAgICBsaWdodERpc3RhbmNlOiAxMDAwMCxcbiAgICBkaWFtZXRlcjogMzI3MCxcbiAgICBheGlhbFRpbHQ6IDcuMjUsXG4gICAgLy9yb3RhdGlvblBlclNlY29uZDogMS40NjA0NTgzNDg0NDY0MjgzLFxuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwMDAxNDYwNDU4MzQ4NDQ2NDI4MyxcbiAgICBhbmltYXRpb25zOiBbXSxcbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmFkZExpZ2h0KHNjZW5lKTtcbiAgICAgICAgdGhpcy5hZGRQYXJ0aWN1bGVzKHNjZW5lKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGdldEFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucztcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1biA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLnBvc2l0aW9uLnogPSAwO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lclN1bik7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3VuTWVzaCA9IFBsYW5ldHMuUGxhbmV0cy5jcmVhdGVTdW4oKTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnJvdGF0aW9uLnkgPSAwO1xuICAgICAgICB0aGlzLnN1bk1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4uYWRkKHRoaXMuc3VuTWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIFN1bi5zdW5NZXNoLnJvdGF0aW9uLnkgKz0gU3VuLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgYWRkTGlnaHQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIDEsIHRoaXMubGlnaHREaXN0YW5jZSk7XG4gICAgICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICB0aGlzLmxpZ2h0LnNjYWxlLnNldCh0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMubGlnaHQpO1xuICAgIH0sXG4gICAgYWRkUGFydGljdWxlczogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMucGFydGljbGVHcm91cCA9IG5ldyBTUEUuR3JvdXAoe1xuICAgICAgICAgICAgdGV4dHVyZTogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnLi9pbWFnZXMvcGFydGljbGUxLmpwZWcnKSxcbiAgICAgICAgICAgIG1heEFnZTogNSxcbiAgICAgICAgICAgIGhhc1BlcnNwZWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHBhcnRpY2xlRW1pdHRlciA9IG5ldyBTUEUuRW1pdHRlcih7XG4gICAgICAgICAgICB0eXBlOiAnc3BoZXJlJyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcblxuICAgICAgICAgICAgcmFkaXVzOiB0aGlzLmRpYW1ldGVyLFxuICAgICAgICAgICAgcmFkaXVzU3ByZWFkOiAyLFxuICAgICAgICAgICAgcmFkaXVzU3ByZWFkQ2xhbXA6IDIsXG4gICAgICAgICAgICByYWRpdXNTY2FsZTogbmV3IFRIUkVFLlZlY3RvcjMoMC41MSwgMC41MSwgMC41MSksXG5cbiAgICAgICAgICAgIHNwZWVkOiAxLFxuICAgICAgICAgICAgc3BlZWRTcHJlYWQ6IDIsXG4gICAgICAgICAgICAvL2NvbG9yU3RhcnQ6IG5ldyBUSFJFRS5Db2xvcigncmVkJyksXG4gICAgICAgICAgICAvL2NvbG9yRW5kOiBuZXcgVEhSRUUuQ29sb3IoJ3JlZCcpLFxuXG5cbiAgICAgICAgICAgIHNpemVTdGFydDogMjAwLFxuICAgICAgICAgICAgc2l6ZU1pZGRsZTogMTAwLFxuICAgICAgICAgICAgc2l6ZUVuZDogNTAsXG4gICAgICAgICAgICBvcGFjaXR5U3RhcnQ6IDEsXG4gICAgICAgICAgICBvcGFjaXR5TWlkZGxlOiAwLjgsXG4gICAgICAgICAgICBvcGFjaXR5RW5kOiAwLFxuICAgICAgICAgICAgLy9wYXJ0aWNsZXNQZXJTZWNvbmQ6IDEwLFxuICAgICAgICAgICAgaXNTdGF0aWM6IDAsXG4gICAgICAgICAgICBwYXJ0aWNsZUNvdW50OiAyMDBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFydGljbGVHcm91cC5hZGRFbWl0dGVyKHBhcnRpY2xlRW1pdHRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLnBhcnRpY2xlR3JvdXAubWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgICAgICAgICBTdW4ucGFydGljbGVHcm91cC50aWNrKGRlbHRhKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICByZWdpc3RlckFuaW1hdGlvbjogZnVuY3Rpb24gKGNhbGxhYmxlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGNhbGxhYmxlKTtcbiAgICB9LFxuICAgIG1hbmFnZVJlYWxpc206IGZ1bmN0aW9uIChpc1JlYWxpc3RpYykge1xuICAgICAgICBpZiAodHlwZW9mIGlzUmVhbGlzdGljICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZWFsaXN0aWMgPSBpc1JlYWxpc3RpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlciAvPSAxMDtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb25QZXJTZWNvbmQgKj0gNjAwMDA7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN1bjtcbiJdfQ==
