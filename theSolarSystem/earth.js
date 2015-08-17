var Atmospheres = require('../lib/threex.atmospherematerial');
var ShaderLoader = require('../lib/shaderLoader');
var Physics = require('../lib/physics');
const PATH = "./images/"
const SHADERS = "./theSolarSystem/earthShaders/"
//@math var Degree = require('../lib/degreeInRadian');
//rim lighting
var Earth = {
    //@math 60 * 60 * 23.5603 (23h56 03')
    timeToFullSelfRotation: 84817.4724,
    isRealistic: false,
    diameter: 3,
    nbpoly: 32,
    atmosphereRadius: undefined,
    atmosphereSize: undefined,
    axialTilt: 0.40840704497,
    //@math return (Degree.convert(360) / this.timeToFullSelfRotation);
    rotationPerSecond: 0.000007393570389010043,
    orbitRadius: 35643,
    properties: {
        //kg (5.98 * 10e24)
        mass: 5980000000000000000000000,
        //meters (6.279 * 10e6)
        radius: 6378000,
        //seconds
        rotationTime: 84817.4724,
        //km/h
        rotationSpeed: 1180,
        //degree
        axialTilt:23.4
    },
    shaders: [],
    animations: [],
    make: function (options, callback) {
        this.setup(options);
        var self = this;
        this.load(function (shaders) {
            self.shaders = shaders;
            self.manageRealism(self.isRealistic);
            self.init(self.scene);
            self.createMesh();
            self.createAtmosphere();
            self.createClouds();
            callback(self.animations);
        });
    },
    setup: function (options) {
        this.scene = options.scene;
        this.isRealistic = options.isRealistic;
    },
    init: function (scene) {
        this.containerEarth = new THREE.Object3D();
        this.containerEarth.rotateZ(this.axialTilt * Math.PI / 180);
        //Sun diameter * 109 = radius of earth's orbit (149,597,870 km) (35643)
        this.containerEarth.position.x = this.orbitRadius;
        scene.add(this.containerEarth);
        this.atmosphereRadius = this.diameter;
    },
    load: function (callback) {
        //callback();
        ShaderLoader.load([SHADERS + 'dayNight'], callback);
    },
    createMesh: function () {
        //Earth is more or less 109 times smaller than sun
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
        var texture = THREE.ImageUtils.loadTexture(PATH + 'earthdiffuse.jpg');
        var nightTexture = THREE.ImageUtils.loadTexture(PATH + "earthnight.jpg");
        //var material = new THREE.MeshPhongMaterial({
        //    map: texture,
        //    bumpMap: THREE.ImageUtils.loadTexture(PATH + 'earthbump1k.jpg'),
        //    bumpScale: 1,
        //    specularMap: THREE.ImageUtils.loadTexture(PATH + 'earthspec1k.jpg'),
        //    specular: new THREE.Color('grey')
        //});
        //console.log(texture);
        var uniforms = {
            sunDirection: {type: "v3", value: new THREE.Vector3(1, 0, 0)},
            dayTexture: {type: "t", value: texture},
            nightTexture: {type: "t", value: nightTexture}
        };

        uniforms.dayTexture.value.wrapS = uniforms.dayTexture.value.wrapT = THREE.Repeat;
        uniforms.nightTexture.value.wrapS = uniforms.nightTexture.value.wrapT = THREE.Repeat;
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.shaders.dayNight.vertex,
            fragmentShader: this.shaders.dayNight.fragment
        });
        material.shininess = 20;
        //material.map.minFilter = THREE.LinearFilter;
        //material.bumpMap.minFilter = THREE.LinearFilter;
        //material.specularMap.minFilter = THREE.LinearFilter;
        this.earthMesh = new THREE.Mesh(geometry, material)

        this.earthMesh.rotation.y = 0;
        this.earthMesh.receiveShadow = true;
        this.earthMesh.castShadow = true;
        this.containerEarth.add(this.earthMesh);
        this.registerAnimation(function (delta, now) {
            Earth.earthMesh.rotation.y += Earth.rotationPerSecond / 60;
        })
    },
    createClouds: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
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
            imageTrans.src = PATH + 'earthcloudmaptrans.jpg';
        }, false);
        imageMap.src = PATH + 'earthcloudmap.jpg';

        var material = new THREE.MeshPhongMaterial({
            map: new THREE.Texture(canvasResult),
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.8
        });
        this.earthCloud = new THREE.Mesh(geometry, material)
        this.earthCloud.receiveShadow = true;
        this.earthCloud.castShadow = true;
        this.earthCloud.scale.multiplyScalar(1.01);
        this.containerEarth.add(this.earthCloud);
        this.registerAnimation(function (delta, now) {
            Earth.earthCloud.rotation.y += (Earth.rotationPerSecond * 1.2) / 60;
        });
    },
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly);
        var material = Atmospheres.createAtmosphereMaterial()
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 1
        material.uniforms.power.value = 6.5
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.04);
        this.containerEarth.add(this.atmosphere1);
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
