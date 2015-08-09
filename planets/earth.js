var Planets = require('../lib/threex.planets');
var Atmospheres = require('../lib/threex.atmospherematerial');
//@math var Degree = require('../lib/degreeInRadian');
var Earth = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    animations: [],
    make: function (scene, isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }
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
        this.containerEarth.rotateZ(-23.4 * Math.PI / 180);
        this.containerEarth.position.z = 0;
        this.containerEarth.scale.set(300, 300, 300);
        scene.add(this.containerEarth);
    },
    createMesh: function () {
        this.earthMesh = Planets.Planets.createEarth();
        this.earthMesh.rotation.y = 0;
        this.earthMesh.receiveShadow = true;
        this.earthMesh.castShadow = true;
        this.containerEarth.add(this.earthMesh);
        this.registerAnimation(function (delta, now) {
            Earth.earthMesh.rotation.y += Earth.isRealistic ? Earth.getRotationPerSecond() / 60 : Earth.getRotationPerSecond() * 600 / 60;
        })
    },
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(0.5, 32, 32)
        var material = Atmospheres.createAtmosphereMaterial()
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 0.8
        material.uniforms.power.value = 2.0
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.01);
        this.containerEarth.add(this.atmosphere1);

        var geometry = new THREE.SphereGeometry(0.5, 32, 32)
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
            Earth.earthCloud.rotation.y += Earth.isRealistic ? Earth.getRotationPerSecond() + 0.000001 / 60 : Earth.getRotationPerSecond() + 0.000001 * 600 / 60;
        });
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    },
    getRotationPerSecond: function () {
        //@math return (Degree.convert(360) / this.timeToFullSelfRotation);
        return 0.000007393570389010043;
    }
};


module.exports = Earth;
