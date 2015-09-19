var Int = require('../lib/int');
var ShaderLoader = require('../lib/shaderLoader');
const PATH = "./images/";
const SHADERS = "./theSolarSystem/sunShaders/";
var start = Date.now();
//@math var Degree = require('../lib/degreeInRadian');
var Sun = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    lightDistance: 1000000000,
    lightIntensity: 2,
    diameter: 3270,
    axialTilt: 7.25,
    //rotationPerSecond: 1.4604583484464283,
    rotationPerSecond: 0.000000014604583484464283,
    animations: [],
    make: function (options, callback) {
        this.setup(options);
        var self = this;
        this.load(function (shaders) {
            self.shaders = shaders;
            self.manageRealism(self.isRealistic);
            self.init(self.scene);
            self.createMesh();
            //self.addLensFlare();
            self.addLight(self.scene);
            //self.addParticules(scene);
            callback(self.animations);
        });
    },
    setup: function (options) {
        this.scene = options.scene;
        this.isRealistic = options.isRealistic;
    },
    init: function (scene) {
        this.container = new THREE.Object3D();
        this.container.rotateZ(this.axialTilt * Math.PI / 180);
        this.container.position = THREE.Vector3(0, 0, 0);
        scene.add(this.container);
        this.registerAnimation(function (delta, now) {
            Sun.container.rotation.y += Sun.rotationPerSecond / 60;
        });
    },
    load: function (callback) {
        ShaderLoader.load([SHADERS + 'sun'], callback);
    },
    createMesh: function () {
        var geometry = new THREE.SphereGeometry(0.5, 40, 40);
        var texture = THREE.ImageUtils.loadTexture(PATH + 'sun.png');
        var uniforms = {
            sunTexture: {type: "t", value: texture},
            time: {type: "f", value: 0.0}
        };
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.shaders.sun.vertex,
            fragmentShader: this.shaders.sun.fragment
        });
        this.registerAnimation(function (delta) {
            Sun.sunMesh.material.uniforms['time'].value += delta;
        });
        this.sunMesh = new THREE.Mesh(geometry, material);
        this.sunMesh.receiveShadow = true;
        this.sunMesh.castShadow = true;
        this.sunMesh.scale.set(this.diameter, this.diameter, this.diameter);
        this.sunMesh.depthWrite = false;
        this.container.add(this.sunMesh);
    },
    addLensFlare: function () {
        if (this.isRealistic) {
            var lensflaretexture0 = THREE.ImageUtils.loadTexture(PATH + 'lensflare0-white.png');
        } else {
            var lensflaretexture0 = THREE.ImageUtils.loadTexture(PATH + 'lensflare0.png');
        }
        var lensflaretexture1 = THREE.ImageUtils.loadTexture(PATH + 'lensflare1.png');
        var lensflaretexture2 = THREE.ImageUtils.loadTexture(PATH + 'lensflare2.png');
        var lensflaretexture3 = THREE.ImageUtils.loadTexture(PATH + 'lensflare3.png');
        var color = new THREE.Color(0xffffff);
        color.setHSL(0.55, 0.9, 1);
        this.lensflare = new THREE.LensFlare(lensflaretexture0, this.diameter * 2, 0.0, THREE.AdditiveBlending, color);
        this.lensflare.add(lensflaretexture1, this.diameter, 0.0, THREE.AdditiveBlending, color, 0.2);
        this.lensflare.add(lensflaretexture1, this.diameter / 2, 0.0, THREE.AdditiveBlending, color, 0.5);

        this.lensflare.add(lensflaretexture2, this.diameter / 2, 0.0, THREE.AdditiveBlending);

        //this.lensflare.add(lensflaretexture3, 40, -1, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 100, -0.5, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 80, -0.8, THREE.AdditiveBlending);

        this.container.add(this.lensflare);

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
        this.light = new THREE.PointLight(0xffffff, this.lightIntensity, this.lightDistance);
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
            this.diameter /= 50;
            this.rotationPerSecond *= 60000;
            this.lightDistance /= 10;
        }
    }
};

module.exports = Sun;
