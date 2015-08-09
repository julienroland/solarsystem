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
