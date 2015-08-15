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
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/sunmap.jpg');
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    });
    var mesh = new THREE.Mesh(geometry, material);
    new THREE.ShaderMaterial(
        {
            map: sunCoronaTexture,
            uniforms: uniforms,
            blending: THREE.AdditiveBlending,
            fragmentShader: shaderList.corona.fragment,
            vertexShader: shaderList.corona.vertex,
            color: 0xffffff,
            transparent: true,
            //	settings that prevent z fighting
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: 100,
            depthTest: true,
            depthWrite: true,
        }
    );
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
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
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
        onRenderContainer(delta, camera);
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
const PATH = "./images/"
//@math var Degree = require('../lib/degreeInRadian');
var Sun = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    lightDistance: 10000,
    diameter: 3270,
    lenseflareDepth: 327,
    axialTilt: 7.25,
    //rotationPerSecond: 1.4604583484464283,
    rotationPerSecond: 0.000000014604583484464283,
    animations: [],
    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        //this.createMesh();
        this.addLensFlare();
        this.addLight(scene);
        //this.addParticules(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerSun = new THREE.Object3D();
        scene.add(this.containerSun);
        this.registerAnimation(function (delta, now) {
            Sun.containerSun.rotation.y += Sun.rotationPerSecond / 60;
        });
    },
    createMesh: function () {
        var geometry = new THREE.SphereGeometry(0.5, 20, 20);
        var texture = THREE.ImageUtils.loadTexture(PATH + 'sunmap.jpg');
        var material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: THREE.ImageUtils.loadTexture(PATH + 'sun_surface.png'),
            bumpScale: 1
        });
        this.sunMesh = new THREE.Mesh(geometry, material);
        this.sunMesh.rotateZ(this.axialTilt * Math.PI / 180);
        this.sunMesh.position.z = 0;
        this.sunMesh.receiveShadow = true;
        this.sunMesh.castShadow = true;
        this.sunMesh.scale.set(this.diameter / 7 - this.lenseflareDepth, this.diameter / 7 - this.lenseflareDepth, this.diameter / 7 - this.lenseflareDepth);
        this.sunMesh.depthWrite = false;
        this.containerSun.add(this.sunMesh);
    },
    addLensFlare: function () {
        var lensflarecorona = THREE.ImageUtils.loadTexture(PATH + 'corona.png');
        var lensflaretexture0 = THREE.ImageUtils.loadTexture(PATH + 'lensflare0-white.png');
        var lensflaretexture1 = THREE.ImageUtils.loadTexture(PATH + 'lensflare1.png');
        var lensflaretexture2 = THREE.ImageUtils.loadTexture(PATH + 'lensflare2.png');
        var lensflaretexture3 = THREE.ImageUtils.loadTexture(PATH + 'lensflare3.png');
        var color = new THREE.Color(0xffffff);
        color.offsetHSL(0.08, 0.5, 0.5);
        this.lensflare = new THREE.LensFlare(lensflarecorona, this.diameter * 2, 0.0, THREE.AdditiveBlending, color);
        this.lensflare.add(lensflaretexture0, this.diameter, 0.0, THREE.AdditiveAlphaBlending, color, 0.6);

        this.lensflare.add(lensflaretexture1, this.diameter, 0.0, THREE.AdditiveBlending, color, 0.2);
        this.lensflare.add(lensflaretexture1, this.diameter / 2, 0.0, THREE.AdditiveBlending, color, 0.5);

        this.lensflare.add(lensflaretexture2, this.diameter / 2, 0.0, THREE.AdditiveBlending);

        //this.lensflare.add(lensflaretexture3, 40, -1, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 100, -0.5, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 80, -0.8, THREE.AdditiveBlending);

        this.containerSun.add(this.lensflare);

        this.registerAnimation(function (delta, camera) {
            Sun.lensflare.customUpdateCallback = function (obj) {
                var f, fl = obj.lensFlares.length;
                var flare;
                var vecX = -obj.positionScreen.x * 2;
                var vecY = -obj.positionScreen.y * 2;

                var camPosition = camera.position;
                var camRotation = camera.rotation;
                var camDistance = camPosition.length();
                for (f = 0; f < fl; f++) {

                    flare = obj.lensFlares[f];

                    flare.x = obj.positionScreen.x + vecX * flare.distance;
                    flare.y = obj.positionScreen.y + vecY * flare.distance;

                    flare.rotation = 0;

                    flare.scale = 1 / camDistance * 400;
                }
            };
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
            this.lenseflareDepth /= 10;
            this.rotationPerSecond *= 60000;
        }
    }
};

module.exports = Sun;

},{"../lib/int":1,"../lib/threex.planets":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJsaWIvdGhyZWV4LnBsYW5ldHMuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJbnQgPSB7XG4gICAgZ2V0UmFuZG9tOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludDtcbiIsInZhciBUSFJFRXggPSBUSFJFRXggfHwge31cblxuLyoqXG4gKiBmcm9tIGh0dHA6Ly9zdGVta29za2kuYmxvZ3Nwb3QuZnIvMjAxMy8wNy9zaGFkZXJzLWluLXRocmVlanMtZ2xvdy1hbmQtaGFsby5odG1sXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAqL1xuVEhSRUV4LmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmVydGV4U2hhZGVyID0gW1xuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZWZXJ0ZXhOb3JtYWxcdD0gbm9ybWFsaXplKG5vcm1hbE1hdHJpeCAqIG5vcm1hbCk7JyxcblxuICAgICAgICAnXHR2VmVydGV4V29ybGRQb3NpdGlvblx0PSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7JyxcblxuICAgICAgICAnXHQvLyBzZXQgZ2xfUG9zaXRpb24nLFxuICAgICAgICAnXHRnbF9Qb3NpdGlvblx0PSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTsnLFxuICAgICAgICAnfScsXG5cbiAgICBdLmpvaW4oJ1xcbicpXG4gICAgdmFyIGZyYWdtZW50U2hhZGVyID0gW1xuICAgICAgICAndW5pZm9ybSB2ZWMzXHRnbG93Q29sb3I7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdGNvZWZpY2llbnQ7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdHBvd2VyOycsXG5cbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2ZWMzIHdvcmxkQ2FtZXJhVG9WZXJ0ZXg9IHZWZXJ0ZXhXb3JsZFBvc2l0aW9uIC0gY2FtZXJhUG9zaXRpb247JyxcbiAgICAgICAgJ1x0dmVjMyB2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gKHZpZXdNYXRyaXggKiB2ZWM0KHdvcmxkQ2FtZXJhVG9WZXJ0ZXgsIDAuMCkpLnh5ejsnLFxuICAgICAgICAnXHR2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gbm9ybWFsaXplKHZpZXdDYW1lcmFUb1ZlcnRleCk7JyxcbiAgICAgICAgJ1x0ZmxvYXQgaW50ZW5zaXR5XHRcdD0gcG93KGNvZWZpY2llbnQgKyBkb3QodlZlcnRleE5vcm1hbCwgdmlld0NhbWVyYVRvVmVydGV4KSwgcG93ZXIpOycsXG4gICAgICAgICdcdGdsX0ZyYWdDb2xvclx0XHQ9IHZlYzQoZ2xvd0NvbG9yLCBpbnRlbnNpdHkpOycsXG4gICAgICAgICd9JyxcbiAgICBdLmpvaW4oJ1xcbicpXG5cbiAgICAvLyBjcmVhdGUgY3VzdG9tIG1hdGVyaWFsIGZyb20gdGhlIHNoYWRlciBjb2RlIGFib3ZlXG4gICAgLy8gICB0aGF0IGlzIHdpdGhpbiBzcGVjaWFsbHkgbGFiZWxlZCBzY3JpcHQgdGFnc1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICBjb2VmaWNpZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEuMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvd2VyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnbG93Q29sb3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCdwaW5rJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxuICAgICAgICBmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgIC8vYmxlbmRpbmdcdDogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHJldHVybiBtYXRlcmlhbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFeDtcbiIsInZhciBUSFJFRXggPSBUSFJFRXggfHwge31cblxuVEhSRUV4LlBsYW5ldHMgPSB7fVxuXG5USFJFRXguUGxhbmV0cy5iYXNlVVJMID0gJy4vbGliLydcblxuLy8gZnJvbSBodHRwOi8vcGxhbmV0cGl4ZWxlbXBvcml1bS5jb20vXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVN1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3N1bm1hcC5qcGcnKTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KTtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKFxuICAgICAgICB7XG4gICAgICAgICAgICBtYXA6IHN1bkNvcm9uYVRleHR1cmUsXG4gICAgICAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBzaGFkZXJMaXN0LmNvcm9uYS5mcmFnbWVudCxcbiAgICAgICAgICAgIHZlcnRleFNoYWRlcjogc2hhZGVyTGlzdC5jb3JvbmEudmVydGV4LFxuICAgICAgICAgICAgY29sb3I6IDB4ZmZmZmZmLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAvL1x0c2V0dGluZ3MgdGhhdCBwcmV2ZW50IHogZmlnaHRpbmdcbiAgICAgICAgICAgIHBvbHlnb25PZmZzZXQ6IHRydWUsXG4gICAgICAgICAgICBwb2x5Z29uT2Zmc2V0RmFjdG9yOiAtMSxcbiAgICAgICAgICAgIHBvbHlnb25PZmZzZXRVbml0czogMTAwLFxuICAgICAgICAgICAgZGVwdGhUZXN0OiB0cnVlLFxuICAgICAgICAgICAgZGVwdGhXcml0ZTogdHJ1ZSxcbiAgICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIG1lc2hcbn1cblxuVEhSRUV4LlBsYW5ldHMuY3JlYXRlTWVyY3VyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21lcmN1cnltYXAuanBnJyksXG4gICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWVyY3VyeWJ1bXAuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVWZW51cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3ZlbnVzbWFwLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3ZlbnVzYnVtcC5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZUVhcnRoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZWFydGhkaWZmdXNlLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoYnVtcDFrLmpwZycpLFxuICAgICAgICBidW1wU2NhbGU6IDEsXG4gICAgICAgIHNwZWN1bGFyTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL2VhcnRoc3BlYzFrLmpwZycpLFxuICAgICAgICBzcGVjdWxhcjogbmV3IFRIUkVFLkNvbG9yKCdncmV5JylcbiAgICB9KVxuICAgIG1hdGVyaWFsLm1hcC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgbWF0ZXJpYWwuYnVtcE1hcC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgbWF0ZXJpYWwuc3BlY3VsYXJNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZUVhcnRoQ2xvdWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNTEsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZWFydGhjbG91ZHMucG5nJyksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVNb29uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbW9vbm1hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21vb25idW1wMWsuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wMDIsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVNYXJzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvbWFyc21hcDFrLmpwZycpLFxuICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL21hcnNidW1wMWsuanBnJyksXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZUp1cGl0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9qdXBpdGVybWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDIsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVNhdHVybiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpXG4gICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3NhdHVybm1hcC5qcGcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcE1hcDogdGV4dHVyZSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVTYXR1cm5SaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGNyZWF0ZSBkZXN0aW5hdGlvbiBjYW52YXNcbiAgICB2YXIgY2FudmFzUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXNSZXN1bHQud2lkdGggPSA5MTVcbiAgICBjYW52YXNSZXN1bHQuaGVpZ2h0ID0gNjRcbiAgICB2YXIgY29udGV4dFJlc3VsdCA9IGNhbnZhc1Jlc3VsdC5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXBcbiAgICB2YXIgaW1hZ2VNYXAgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZU1hcC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gY3JlYXRlIGRhdGFNYXAgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwXG4gICAgICAgIHZhciBjYW52YXNNYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICBjYW52YXNNYXAud2lkdGggPSBpbWFnZU1hcC53aWR0aFxuICAgICAgICBjYW52YXNNYXAuaGVpZ2h0ID0gaW1hZ2VNYXAuaGVpZ2h0XG4gICAgICAgIHZhciBjb250ZXh0TWFwID0gY2FudmFzTWFwLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgY29udGV4dE1hcC5kcmF3SW1hZ2UoaW1hZ2VNYXAsIDAsIDApXG4gICAgICAgIHZhciBkYXRhTWFwID0gY29udGV4dE1hcC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzTWFwLndpZHRoLCBjYW52YXNNYXAuaGVpZ2h0KVxuXG4gICAgICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgIHZhciBpbWFnZVRyYW5zID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltYWdlVHJhbnMuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY3JlYXRlIGRhdGFUcmFucyBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICAgICAgdmFyIGNhbnZhc1RyYW5zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLndpZHRoID0gaW1hZ2VUcmFucy53aWR0aFxuICAgICAgICAgICAgY2FudmFzVHJhbnMuaGVpZ2h0ID0gaW1hZ2VUcmFucy5oZWlnaHRcbiAgICAgICAgICAgIHZhciBjb250ZXh0VHJhbnMgPSBjYW52YXNUcmFucy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgICAgICBjb250ZXh0VHJhbnMuZHJhd0ltYWdlKGltYWdlVHJhbnMsIDAsIDApXG4gICAgICAgICAgICB2YXIgZGF0YVRyYW5zID0gY29udGV4dFRyYW5zLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNUcmFucy53aWR0aCwgY2FudmFzVHJhbnMuaGVpZ2h0KVxuICAgICAgICAgICAgLy8gbWVyZ2UgZGF0YU1hcCArIGRhdGFUcmFucyBpbnRvIGRhdGFSZXN1bHRcbiAgICAgICAgICAgIHZhciBkYXRhUmVzdWx0ID0gY29udGV4dE1hcC5jcmVhdGVJbWFnZURhdGEoY2FudmFzUmVzdWx0LndpZHRoLCBjYW52YXNSZXN1bHQuaGVpZ2h0KVxuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDAsIG9mZnNldCA9IDA7IHkgPCBpbWFnZU1hcC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgaW1hZ2VNYXAud2lkdGg7IHgrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDBdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDBdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAxXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAxXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMl0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMl1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDNdID0gMjU1IC0gZGF0YVRyYW5zLmRhdGFbb2Zmc2V0ICsgMF0gLyA0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIHRleHR1cmUgd2l0aCByZXN1bHRcbiAgICAgICAgICAgIGNvbnRleHRSZXN1bHQucHV0SW1hZ2VEYXRhKGRhdGFSZXN1bHQsIDAsIDApXG4gICAgICAgICAgICBtYXRlcmlhbC5tYXAubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICBpbWFnZVRyYW5zLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3NhdHVybnJpbmdwYXR0ZXJuLmdpZic7XG4gICAgfSwgZmFsc2UpO1xuICAgIGltYWdlTWFwLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3NhdHVybnJpbmdjb2xvci5qcGcnO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFeC5QbGFuZXRzLl9SaW5nR2VvbWV0cnkoMC41NSwgMC43NSwgNjQpO1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzUmVzdWx0KSxcbiAgICAgICAgLy8gbWFwXHRcdDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMKydpbWFnZXMvYXNoX3V2Z3JpZDAxLmpwZycpLFxuICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgIH0pXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgbWVzaC5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMC41LCAtNCwgMSkpXG4gICAgcmV0dXJuIG1lc2hcbn1cblxuXG5USFJFRXguUGxhbmV0cy5jcmVhdGVVcmFudXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy91cmFudXNtYXAuanBnJylcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBNYXA6IHRleHR1cmUsXG4gICAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVVyYW51c1JpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY3JlYXRlIGRlc3RpbmF0aW9uIGNhbnZhc1xuICAgIHZhciBjYW52YXNSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIGNhbnZhc1Jlc3VsdC53aWR0aCA9IDEwMjRcbiAgICBjYW52YXNSZXN1bHQuaGVpZ2h0ID0gNzJcbiAgICB2YXIgY29udGV4dFJlc3VsdCA9IGNhbnZhc1Jlc3VsdC5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvLyBsb2FkIGVhcnRoY2xvdWRtYXBcbiAgICB2YXIgaW1hZ2VNYXAgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZU1hcC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gY3JlYXRlIGRhdGFNYXAgSW1hZ2VEYXRhIGZvciBlYXJ0aGNsb3VkbWFwXG4gICAgICAgIHZhciBjYW52YXNNYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgICAgICBjYW52YXNNYXAud2lkdGggPSBpbWFnZU1hcC53aWR0aFxuICAgICAgICBjYW52YXNNYXAuaGVpZ2h0ID0gaW1hZ2VNYXAuaGVpZ2h0XG4gICAgICAgIHZhciBjb250ZXh0TWFwID0gY2FudmFzTWFwLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgY29udGV4dE1hcC5kcmF3SW1hZ2UoaW1hZ2VNYXAsIDAsIDApXG4gICAgICAgIHZhciBkYXRhTWFwID0gY29udGV4dE1hcC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzTWFwLndpZHRoLCBjYW52YXNNYXAuaGVpZ2h0KVxuXG4gICAgICAgIC8vIGxvYWQgZWFydGhjbG91ZG1hcHRyYW5zXG4gICAgICAgIHZhciBpbWFnZVRyYW5zID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltYWdlVHJhbnMuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY3JlYXRlIGRhdGFUcmFucyBJbWFnZURhdGEgZm9yIGVhcnRoY2xvdWRtYXB0cmFuc1xuICAgICAgICAgICAgdmFyIGNhbnZhc1RyYW5zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgICAgICAgIGNhbnZhc1RyYW5zLndpZHRoID0gaW1hZ2VUcmFucy53aWR0aFxuICAgICAgICAgICAgY2FudmFzVHJhbnMuaGVpZ2h0ID0gaW1hZ2VUcmFucy5oZWlnaHRcbiAgICAgICAgICAgIHZhciBjb250ZXh0VHJhbnMgPSBjYW52YXNUcmFucy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgICAgICBjb250ZXh0VHJhbnMuZHJhd0ltYWdlKGltYWdlVHJhbnMsIDAsIDApXG4gICAgICAgICAgICB2YXIgZGF0YVRyYW5zID0gY29udGV4dFRyYW5zLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNUcmFucy53aWR0aCwgY2FudmFzVHJhbnMuaGVpZ2h0KVxuICAgICAgICAgICAgLy8gbWVyZ2UgZGF0YU1hcCArIGRhdGFUcmFucyBpbnRvIGRhdGFSZXN1bHRcbiAgICAgICAgICAgIHZhciBkYXRhUmVzdWx0ID0gY29udGV4dE1hcC5jcmVhdGVJbWFnZURhdGEoY2FudmFzUmVzdWx0LndpZHRoLCBjYW52YXNSZXN1bHQuaGVpZ2h0KVxuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDAsIG9mZnNldCA9IDA7IHkgPCBpbWFnZU1hcC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgaW1hZ2VNYXAud2lkdGg7IHgrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDBdID0gZGF0YU1hcC5kYXRhW29mZnNldCArIDBdXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXN1bHQuZGF0YVtvZmZzZXQgKyAxXSA9IGRhdGFNYXAuZGF0YVtvZmZzZXQgKyAxXVxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzdWx0LmRhdGFbb2Zmc2V0ICsgMl0gPSBkYXRhTWFwLmRhdGFbb2Zmc2V0ICsgMl1cbiAgICAgICAgICAgICAgICAgICAgZGF0YVJlc3VsdC5kYXRhW29mZnNldCArIDNdID0gMjU1IC0gZGF0YVRyYW5zLmRhdGFbb2Zmc2V0ICsgMF0gLyAyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIHRleHR1cmUgd2l0aCByZXN1bHRcbiAgICAgICAgICAgIGNvbnRleHRSZXN1bHQucHV0SW1hZ2VEYXRhKGRhdGFSZXN1bHQsIDAsIDApXG4gICAgICAgICAgICBtYXRlcmlhbC5tYXAubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICBpbWFnZVRyYW5zLnNyYyA9IFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwgKyAnaW1hZ2VzL3VyYW51c3Jpbmd0cmFucy5naWYnO1xuICAgIH0sIGZhbHNlKTtcbiAgICBpbWFnZU1hcC5zcmMgPSBUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy91cmFudXNyaW5nY29sb3VyLmpwZyc7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUV4LlBsYW5ldHMuX1JpbmdHZW9tZXRyeSgwLjU1LCAwLjc1LCA2NCk7XG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXNSZXN1bHQpLFxuICAgICAgICAvLyBtYXBcdFx0OiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFRIUkVFeC5QbGFuZXRzLmJhc2VVUkwrJ2ltYWdlcy9hc2hfdXZncmlkMDEuanBnJyksXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICBtZXNoLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLjUsIC00LCAxKSlcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZU5lcHR1bmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9uZXB0dW5lbWFwLmpwZycpXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wTWFwOiB0ZXh0dXJlLFxuICAgICAgICBidW1wU2NhbGU6IDAuMDUsXG4gICAgfSlcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVBsdXRvID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvcGx1dG9tYXAxay5qcGcnKSxcbiAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShUSFJFRXguUGxhbmV0cy5iYXNlVVJMICsgJ2ltYWdlcy9wbHV0b2J1bXAxay5qcGcnKSxcbiAgICAgICAgYnVtcFNjYWxlOiAwLjAwNSxcbiAgICB9KVxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgIHJldHVybiBtZXNoXG59XG5cblRIUkVFeC5QbGFuZXRzLmNyZWF0ZVN0YXJmaWVsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoVEhSRUV4LlBsYW5ldHMuYmFzZVVSTCArICdpbWFnZXMvZ2FsYXh5X3N0YXJmaWVsZC5wbmcnKVxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGVcbiAgICB9KVxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgxMDAsIDMyLCAzMilcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgICByZXR1cm4gbWVzaFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXHRcdGNvbW1lbnRcdFx0XHRcdFx0XHRcdFx0Ly9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBjaGFuZ2UgdGhlIG9yaWdpbmFsIGZyb20gdGhyZWUuanMgYmVjYXVzZSBpIG5lZWRlZCBkaWZmZXJlbnQgVVZcbiAqXG4gKiBAYXV0aG9yIEthbGViIE11cnBoeVxuICogQGF1dGhvciBqZXJvbWUgZXRpZW5uZVxuICovXG5USFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5ID0gZnVuY3Rpb24gKGlubmVyUmFkaXVzLCBvdXRlclJhZGl1cywgdGhldGFTZWdtZW50cykge1xuXG4gICAgVEhSRUUuR2VvbWV0cnkuY2FsbCh0aGlzKVxuXG4gICAgaW5uZXJSYWRpdXMgPSBpbm5lclJhZGl1cyB8fCAwXG4gICAgb3V0ZXJSYWRpdXMgPSBvdXRlclJhZGl1cyB8fCA1MFxuICAgIHRoZXRhU2VnbWVudHMgPSB0aGV0YVNlZ21lbnRzIHx8IDhcblxuICAgIHZhciBub3JtYWwgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAxKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGV0YVNlZ21lbnRzOyBpKyspIHtcbiAgICAgICAgdmFyIGFuZ2xlTG8gPSAoaSAvIHRoZXRhU2VnbWVudHMpICogTWF0aC5QSSAqIDJcbiAgICAgICAgdmFyIGFuZ2xlSGkgPSAoKGkgKyAxKSAvIHRoZXRhU2VnbWVudHMpICogTWF0aC5QSSAqIDJcblxuICAgICAgICB2YXIgdmVydGV4MSA9IG5ldyBUSFJFRS5WZWN0b3IzKGlubmVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGVMbyksIGlubmVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGVMbyksIDApO1xuICAgICAgICB2YXIgdmVydGV4MiA9IG5ldyBUSFJFRS5WZWN0b3IzKG91dGVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGVMbyksIG91dGVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGVMbyksIDApO1xuICAgICAgICB2YXIgdmVydGV4MyA9IG5ldyBUSFJFRS5WZWN0b3IzKGlubmVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGVIaSksIGlubmVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGVIaSksIDApO1xuICAgICAgICB2YXIgdmVydGV4NCA9IG5ldyBUSFJFRS5WZWN0b3IzKG91dGVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGVIaSksIG91dGVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGVIaSksIDApO1xuXG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgxKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHZlcnRleDIpO1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2godmVydGV4Myk7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXg0KTtcblxuXG4gICAgICAgIHZhciB2ZXJ0ZXhJZHggPSBpICogNDtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGZpcnN0IHRyaWFuZ2xlXG4gICAgICAgIHZhciBmYWNlID0gbmV3IFRIUkVFLkZhY2UzKHZlcnRleElkeCArIDAsIHZlcnRleElkeCArIDEsIHZlcnRleElkeCArIDIsIG5vcm1hbCk7XG4gICAgICAgIHZhciB1dnMgPSBbXVxuXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDApXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigxLCAwKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMCwgMSlcbiAgICAgICAgdXZzLnB1c2godXYpXG5cbiAgICAgICAgdGhpcy5mYWNlcy5wdXNoKGZhY2UpO1xuICAgICAgICB0aGlzLmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaCh1dnMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgc2Vjb25kIHRyaWFuZ2xlXG4gICAgICAgIHZhciBmYWNlID0gbmV3IFRIUkVFLkZhY2UzKHZlcnRleElkeCArIDIsIHZlcnRleElkeCArIDEsIHZlcnRleElkeCArIDMsIG5vcm1hbCk7XG4gICAgICAgIHZhciB1dnMgPSBbXVxuXG4gICAgICAgIHZhciB1diA9IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDEpXG4gICAgICAgIHV2cy5wdXNoKHV2KVxuICAgICAgICB2YXIgdXYgPSBuZXcgVEhSRUUuVmVjdG9yMigxLCAwKVxuICAgICAgICB1dnMucHVzaCh1dilcbiAgICAgICAgdmFyIHV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMSlcbiAgICAgICAgdXZzLnB1c2godXYpXG5cbiAgICAgICAgdGhpcy5mYWNlcy5wdXNoKGZhY2UpO1xuICAgICAgICB0aGlzLmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaCh1dnMpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcHV0ZUNlbnRyb2lkcygpO1xuICAgIHRoaXMuY29tcHV0ZUZhY2VOb3JtYWxzKCk7XG5cbiAgICB0aGlzLmJvdW5kaW5nU3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZShuZXcgVEhSRUUuVmVjdG9yMygpLCBvdXRlclJhZGl1cyk7XG5cbn07XG5USFJFRXguUGxhbmV0cy5fUmluZ0dlb21ldHJ5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuR2VvbWV0cnkucHJvdG90eXBlKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFeDtcbiIsIi8vRGVwZW5kZW5jaWVzXG52YXIgRWFydGggPSByZXF1aXJlKCcuL3RoZVNvbGFyU3lzdGVtL2VhcnRoJyk7XG52YXIgU3VuID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9zdW4nKTtcbi8vQ29uZmlnXG52YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjZW5lJyk7XG52YXIgc2NlbmU7XG52YXIgY2FtZXJhO1xudmFyIGZpZWxkT2ZWaWV3O1xudmFyIGFzcGVjdFJhdGlvO1xudmFyIHJlbmRlcmVyO1xudmFyIG5lYXJQbGFuZTtcbnZhciBmYXJQbGFuZTtcbnZhciBjb250cm9scztcbnZhciBndWk7XG52YXIgY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcbi8vTGlnaHRzXG52YXIgbGlnaHQ7XG52YXIgc2hhZG93TGlnaHQ7XG5cbi8vQ29uc3RhbnRzXG5jb25zdCBFTlYgPSAnZGV2JztcbnZhciBIRUlHSFQ7XG52YXIgV0lEVEg7XG5cbi8vR2xvYmFsXG52YXIgb25SZW5kZXJDb250YWluZXIgPSBbXTtcblxuZnVuY3Rpb24gYXBwZW5kU2NlbmUoKSB7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xufVxuZnVuY3Rpb24gYWRkTGlnaHRzKCkge1xuICAgIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZilcbiAgICBzY2VuZS5hZGQobGlnaHQpO1xufVxuZnVuY3Rpb24gaXNEZXYoKSB7XG4gICAgcmV0dXJuIEVOViA9PSAnZGV2Jztcbn1cbmZ1bmN0aW9uIGFkZENhbWVyYSgpIHtcbiAgICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgIGZpZWxkT2ZWaWV3LFxuICAgICAgICBhc3BlY3RSYXRpbyxcbiAgICAgICAgbmVhclBsYW5lLFxuICAgICAgICBmYXJQbGFuZSk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnogPSAtNDAwO1xuICAgIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMjAwLCAwKSk7XG59XG5mdW5jdGlvbiBhZGRDb250cm9scygpIHtcbiAgICBjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyhjYW1lcmEpO1xuICAgIGNvbnRyb2xzLnRhcmdldC5zZXQoMCwgMCwgMCk7XG4gICAgY29udHJvbHMucm90YXRlU3BlZWQgPSAxLjA7XG4gICAgY29udHJvbHMuem9vbVNwZWVkID0gMS4yO1xuICAgIGNvbnRyb2xzLnBhblNwZWVkID0gMC44O1xuXG4gICAgY29udHJvbHMubm9ab29tID0gZmFsc2U7XG4gICAgY29udHJvbHMubm9QYW4gPSBmYWxzZTtcblxuICAgIGNvbnRyb2xzLnN0YXRpY01vdmluZyA9IHRydWU7XG4gICAgY29udHJvbHMuZHluYW1pY0RhbXBpbmdGYWN0b3IgPSAwLjM7XG5cbiAgICBjb250cm9scy5rZXlzID0gWzY1LCA4MywgNjhdO1xuICAgIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlbmRlcihjbG9jay5nZXREZWx0YSgpKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNvbmZpZ3VyZVNjZW5lKCkge1xuICAgIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBhc3BlY3RSYXRpbyA9IFdJRFRIIC8gSEVJR0hUO1xuICAgIGZpZWxkT2ZWaWV3ID0gNjA7XG4gICAgbmVhclBsYW5lID0gLjE7XG4gICAgZmFyUGxhbmUgPSAxMDAwMDtcbiAgICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbHBoYTogdHJ1ZSwgYW50aWFsaWFzOiB0cnVlfSk7XG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCk7XG4gICAgcmVuZGVyZXIuc2V0U2l6ZShXSURUSCwgSEVJR0hUKTtcbiAgICByZW5kZXJlci5zaGFkb3dNYXBFbmFibGVkID0gdHJ1ZTtcbiAgICByZW5kZXJlci5nYW1tYUlucHV0ID0gdHJ1ZTtcbiAgICByZW5kZXJlci5nYW1tYU91dHB1dCA9IHRydWU7XG4gICAgYWRkQ2FtZXJhKCk7XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgICAgYWRkQ29udHJvbHMoKTtcbiAgICB9XG4gICAgYWRkTGlnaHRzKCk7XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIHJlbmRlcihjbG9jay5nZXREZWx0YSgpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbn1cbmZ1bmN0aW9uIHJlbmRlcihkZWx0YSkge1xuICAgIG9uUmVuZGVyQ29udGFpbmVyLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyQ29udGFpbmVyKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyKGRlbHRhLCBjYW1lcmEpO1xuICAgIH0pO1xuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cbmZ1bmN0aW9uIGd1aSgpIHtcbiAgICBndWkgPSBuZXcgZGF0LkdVSSgpO1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHRlc3Q6IDEwMDBcbiAgICB9O1xuICAgIGd1aS5hZGQocGFyYW1zLCAndGVzdCcpO1xufVxuZnVuY3Rpb24gYWRkUGxhbmV0cygpIHtcbiAgICB2YXIgZWFydGggPSBFYXJ0aC5tYWtlKHNjZW5lKTtcbiAgICB2YXIgZWFydGhBbmltYXRpb25zID0gZWFydGguZ2V0QW5pbWF0aW9ucygpO1xuICAgIGVhcnRoQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN1biA9IFN1bi5tYWtlKHNjZW5lKTtcbiAgICB2YXIgc3VuQW5pbWF0aW9ucyA9IHN1bi5nZXRBbmltYXRpb25zKCk7XG4gICAgc3VuQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25maWd1cmVTY2VuZSgpO1xuICAgIGFkZFBsYW5ldHMoKTtcbiAgICBhcHBlbmRTY2VuZSgpO1xuICAgIGlmIChpc0RldigpKSB7XG4gICAgICAgIGd1aSgpO1xuICAgIH1cbiAgICBhbmltYXRlKCk7XG59XG5pbml0KCk7XG4iLCJ2YXIgUGxhbmV0cyA9IHJlcXVpcmUoJy4uL2xpYi90aHJlZXgucGxhbmV0cycpO1xudmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbi8vQG1hdGggdmFyIERlZ3JlZSA9IHJlcXVpcmUoJy4uL2xpYi9kZWdyZWVJblJhZGlhbicpO1xudmFyIEVhcnRoID0ge1xuICAgIC8vQG1hdGggNjAgKiA2MCAqIDIzLjU2MDMgKDIzaDU2IDAzJylcbiAgICB0aW1lVG9GdWxsU2VsZlJvdGF0aW9uOiA4NDgxNy40NzI0LFxuICAgIGlzUmVhbGlzdGljOiBmYWxzZSxcbiAgICBkaWFtZXRlcjogMyxcbiAgICBhdG1vc3BoZXJlUmFkaXVzOiB1bmRlZmluZWQsXG4gICAgYXRtb3NwaGVyZVNpemU6IHVuZGVmaW5lZCxcbiAgICBheGlhbFRpbHQ6IDIzLjQsXG4gICAgLy9AbWF0aCByZXR1cm4gKERlZ3JlZS5jb252ZXJ0KDM2MCkgLyB0aGlzLnRpbWVUb0Z1bGxTZWxmUm90YXRpb24pO1xuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwNzM5MzU3MDM4OTAxMDA0MyxcbiAgICBvcmJpdFJhZGl1czogMzU2NDMsXG4gICAgYW5pbWF0aW9uczogW10sXG5cbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF0bW9zcGhlcmUoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVDbG91ZHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgLy9TdW4gZGlhbWV0ZXIgKiAxMDkgPSByYWRpdXMgb2YgZWFydGgncyBvcmJpdCAoMTQ5LDU5Nyw4NzAga20pICgzNTY0MylcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5wb3NpdGlvbi54ID0gdGhpcy5vcmJpdFJhZGl1cztcbiAgICAgICAgLy9FYXJ0aCBpcyBtb3JlIG9yIGxlc3MgMTA5IHRpbWVzIHNtYWxsZXIgdGhhbiBzdW5cbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lckVhcnRoKTtcblxuICAgICAgICB0aGlzLmF0bW9zcGhlcmVSYWRpdXMgPSB0aGlzLmRpYW1ldGVyICsgKHRoaXMuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlU2l6ZSA9IHRoaXMuZGlhbWV0ZXIgLyA2MDtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2ggPSBQbGFuZXRzLlBsYW5ldHMuY3JlYXRlRWFydGgoKTtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucm90YXRpb24ueSA9IDA7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aE1lc2gpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aE1lc2gucm90YXRpb24ueSArPSBFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAvIDYwO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgY3JlYXRlQXRtb3NwaGVyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5hdG1vc3BoZXJlU2l6ZSwgdGhpcy5hdG1vc3BoZXJlUmFkaXVzLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMC44XG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLnBvd2VyLnZhbHVlID0gMi4wXG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTEgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMDEpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmF0bW9zcGhlcmUxKTtcblxuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5hdG1vc3BoZXJlU2l6ZSwgdGhpcy5hdG1vc3BoZXJlUmFkaXVzLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuQmFja1NpZGVcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldCgweDAwYjNmZilcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29lZmljaWVudC52YWx1ZSA9IDAuNVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDQuMFxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUyID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMi5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjE1KTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5hdG1vc3BoZXJlMik7XG4gICAgfSxcblxuICAgIGNyZWF0ZUNsb3VkczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQgPSBQbGFuZXRzLlBsYW5ldHMuY3JlYXRlRWFydGhDbG91ZCgpO1xuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aENsb3VkKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgRWFydGguZWFydGhDbG91ZC5yb3RhdGlvbi55ICs9IChFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAqIDEuMikgLyA2MDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgKj0gMTA7XG4gICAgICAgICAgICB0aGlzLm9yYml0UmFkaXVzIC89IDEwMDtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb25QZXJTZWNvbmQgKj0gNjAwO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlckFuaW1hdGlvbjogZnVuY3Rpb24gKGNhbGxhYmxlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGNhbGxhYmxlKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuIiwidmFyIFBsYW5ldHMgPSByZXF1aXJlKCcuLi9saWIvdGhyZWV4LnBsYW5ldHMnKTtcbnZhciBJbnQgPSByZXF1aXJlKCcuLi9saWIvaW50Jyk7XG5jb25zdCBQQVRIID0gXCIuL2ltYWdlcy9cIlxuLy9AbWF0aCB2YXIgRGVncmVlID0gcmVxdWlyZSgnLi4vbGliL2RlZ3JlZUluUmFkaWFuJyk7XG52YXIgU3VuID0ge1xuICAgIHRpbWVUb0Z1bGxTZWxmUm90YXRpb246IDg0OTgxNy40NzI0LFxuICAgIGlzUmVhbGlzdGljOiBmYWxzZSxcbiAgICBsaWdodERpc3RhbmNlOiAxMDAwMCxcbiAgICBkaWFtZXRlcjogMzI3MCxcbiAgICBsZW5zZWZsYXJlRGVwdGg6IDMyNyxcbiAgICBheGlhbFRpbHQ6IDcuMjUsXG4gICAgLy9yb3RhdGlvblBlclNlY29uZDogMS40NjA0NTgzNDg0NDY0MjgzLFxuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwMDAxNDYwNDU4MzQ4NDQ2NDI4MyxcbiAgICBhbmltYXRpb25zOiBbXSxcbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIC8vdGhpcy5jcmVhdGVNZXNoKCk7XG4gICAgICAgIHRoaXMuYWRkTGVuc0ZsYXJlKCk7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoc2NlbmUpO1xuICAgICAgICAvL3RoaXMuYWRkUGFydGljdWxlcyhzY2VuZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4gPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMuY29udGFpbmVyU3VuKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgU3VuLmNvbnRhaW5lclN1bi5yb3RhdGlvbi55ICs9IFN1bi5yb3RhdGlvblBlclNlY29uZCAvIDYwO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMjAsIDIwKTtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnc3VubWFwLmpwZycpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ3N1bl9zdXJmYWNlLnBuZycpLFxuICAgICAgICAgICAgYnVtcFNjYWxlOiAxXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN1bk1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLnN1bk1lc2gucm90YXRlWih0aGlzLmF4aWFsVGlsdCAqIE1hdGguUEkgLyAxODApO1xuICAgICAgICB0aGlzLnN1bk1lc2gucG9zaXRpb24ueiA9IDA7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLnN1bk1lc2guc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIgLyA3IC0gdGhpcy5sZW5zZWZsYXJlRGVwdGgsIHRoaXMuZGlhbWV0ZXIgLyA3IC0gdGhpcy5sZW5zZWZsYXJlRGVwdGgsIHRoaXMuZGlhbWV0ZXIgLyA3IC0gdGhpcy5sZW5zZWZsYXJlRGVwdGgpO1xuICAgICAgICB0aGlzLnN1bk1lc2guZGVwdGhXcml0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5hZGQodGhpcy5zdW5NZXNoKTtcbiAgICB9LFxuICAgIGFkZExlbnNGbGFyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVuc2ZsYXJlY29yb25hID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2Nvcm9uYS5wbmcnKTtcbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUwID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTAtd2hpdGUucG5nJyk7XG4gICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUxLnBuZycpO1xuICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTIgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMi5wbmcnKTtcbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUzID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTMucG5nJyk7XG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZik7XG4gICAgICAgIGNvbG9yLm9mZnNldEhTTCgwLjA4LCAwLjUsIDAuNSk7XG4gICAgICAgIHRoaXMubGVuc2ZsYXJlID0gbmV3IFRIUkVFLkxlbnNGbGFyZShsZW5zZmxhcmVjb3JvbmEsIHRoaXMuZGlhbWV0ZXIgKiAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yKTtcbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUwLCB0aGlzLmRpYW1ldGVyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQWxwaGFCbGVuZGluZywgY29sb3IsIDAuNik7XG5cbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUxLCB0aGlzLmRpYW1ldGVyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjIpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTEsIHRoaXMuZGlhbWV0ZXIgLyAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjUpO1xuXG4gICAgICAgIHRoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMiwgdGhpcy5kaWFtZXRlciAvIDIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG5cbiAgICAgICAgLy90aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTMsIDQwLCAtMSwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG4gICAgICAgIC8vdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUzLCAxMDAsIC0wLjUsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuICAgICAgICAvL3RoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMywgODAsIC0wLjgsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLmFkZCh0aGlzLmxlbnNmbGFyZSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIGNhbWVyYSkge1xuICAgICAgICAgICAgU3VuLmxlbnNmbGFyZS5jdXN0b21VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICB2YXIgZiwgZmwgPSBvYmoubGVuc0ZsYXJlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGZsYXJlO1xuICAgICAgICAgICAgICAgIHZhciB2ZWNYID0gLW9iai5wb3NpdGlvblNjcmVlbi54ICogMjtcbiAgICAgICAgICAgICAgICB2YXIgdmVjWSA9IC1vYmoucG9zaXRpb25TY3JlZW4ueSAqIDI7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FtUG9zaXRpb24gPSBjYW1lcmEucG9zaXRpb247XG4gICAgICAgICAgICAgICAgdmFyIGNhbVJvdGF0aW9uID0gY2FtZXJhLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBjYW1EaXN0YW5jZSA9IGNhbVBvc2l0aW9uLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGZvciAoZiA9IDA7IGYgPCBmbDsgZisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUgPSBvYmoubGVuc0ZsYXJlc1tmXTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS54ID0gb2JqLnBvc2l0aW9uU2NyZWVuLnggKyB2ZWNYICogZmxhcmUuZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnkgPSBvYmoucG9zaXRpb25TY3JlZW4ueSArIHZlY1kgKiBmbGFyZS5kaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS5yb3RhdGlvbiA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUuc2NhbGUgPSAxIC8gY2FtRGlzdGFuY2UgKiA0MDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRMaWdodDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgdGhpcy5saWdodERpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMubGlnaHQuc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5saWdodCk7XG4gICAgfSxcbiAgICBhZGRQYXJ0aWN1bGVzOiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwID0gbmV3IFNQRS5Hcm91cCh7XG4gICAgICAgICAgICB0ZXh0dXJlOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuL2ltYWdlcy9wYXJ0aWNsZTEuanBlZycpLFxuICAgICAgICAgICAgbWF4QWdlOiA1LFxuICAgICAgICAgICAgaGFzUGVyc3BlY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcGFydGljbGVFbWl0dGVyID0gbmV3IFNQRS5FbWl0dGVyKHtcbiAgICAgICAgICAgIHR5cGU6ICdzcGhlcmUnLFxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMuZGlhbWV0ZXIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWQ6IDIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWRDbGFtcDogMixcbiAgICAgICAgICAgIHJhZGl1c1NjYWxlOiBuZXcgVEhSRUUuVmVjdG9yMygwLjUxLCAwLjUxLCAwLjUxKSxcblxuICAgICAgICAgICAgc3BlZWQ6IDEsXG4gICAgICAgICAgICBzcGVlZFNwcmVhZDogMixcbiAgICAgICAgICAgIC8vY29sb3JTdGFydDogbmV3IFRIUkVFLkNvbG9yKCdyZWQnKSxcbiAgICAgICAgICAgIC8vY29sb3JFbmQ6IG5ldyBUSFJFRS5Db2xvcigncmVkJyksXG5cblxuICAgICAgICAgICAgc2l6ZVN0YXJ0OiAyMDAsXG4gICAgICAgICAgICBzaXplTWlkZGxlOiAxMDAsXG4gICAgICAgICAgICBzaXplRW5kOiA1MCxcbiAgICAgICAgICAgIG9wYWNpdHlTdGFydDogMSxcbiAgICAgICAgICAgIG9wYWNpdHlNaWRkbGU6IDAuOCxcbiAgICAgICAgICAgIG9wYWNpdHlFbmQ6IDAsXG4gICAgICAgICAgICAvL3BhcnRpY2xlc1BlclNlY29uZDogMTAsXG4gICAgICAgICAgICBpc1N0YXRpYzogMCxcbiAgICAgICAgICAgIHBhcnRpY2xlQ291bnQ6IDIwMFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwLmFkZEVtaXR0ZXIocGFydGljbGVFbWl0dGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMucGFydGljbGVHcm91cC5tZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICAgICAgICAgIFN1bi5wYXJ0aWNsZUdyb3VwLnRpY2soZGVsdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyIC89IDEwO1xuICAgICAgICAgICAgdGhpcy5sZW5zZWZsYXJlRGVwdGggLz0gMTA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDAwO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdW47XG4iXX0=
