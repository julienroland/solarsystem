var ShaderLoader = require('../lib/shaderLoader');

const SHADERS = "./theSolarSystem/skyShaders/"
const PATH = "./images/"
var Skybox = {
    size: 1000000000,
    animations: [],
    shaders: [],
    make: function (options, callback) {
        this.setup(options);
        var self = this;
        this.load(function (shaders) {
            self.shaders = shaders;
            self.manageRealism(self.isRealistic);
            self.init(self.scene);
            self.createBox(self.scene);
            callback(self.animations);
        });
    },

    setup: function (options) {
        this.scene = options.scene;
        this.isRealistic = options.isRealistic;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.skyboxContainer = new THREE.Object3D();
        scene.add(this.skyboxContainer);
    },
    load: function (callback) {
        ShaderLoader.load([SHADERS + 'sky'], callback);
    },
    createBox: function (scene) {
        var geometry = new THREE.SphereGeometry(this.size, 60, 40);
        var uniforms = {
            texture: {type: 't', value: new THREE.ImageUtils.loadTexture(PATH + 'milkyway-2.jpg')}
        };
        uniforms.texture.minFilter = THREE.NearestFilter;
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.shaders.sky.vertex,
            fragmentShader: this.shaders.sky.fragment,
        });

        this.skyboxMesh = new THREE.Mesh(geometry, material);
        this.skyboxMesh.scale.set(-1, 1, 1);
        this.skyboxMesh.rotation.order = 'XZY';
        this.skyboxMesh.renderDepth = 1000.0;
        scene.add(this.skyboxMesh);
        //var urls = [
        //    PATH + "px.jpg", PATH + "nx.jpg",
        //    PATH + "py.jpg", PATH + "ny.jpg",
        //    PATH + "pz.jpg", PATH + "nz.jpg"];
        //
        //var texture = THREE.ImageUtils.loadTextureCube(urls);
        //var shader = THREE.ShaderLib["cube"];
        //shader.uniforms['tCube'].value = texture;   // textureCube has been init before
        //shader.uniforms['opacity'] = {value: 1.0, type: "f"};
        //var material = new THREE.ShaderMaterial({
        //    fragmentShader: shader.fragmentShader,
        //    vertexShader: shader.vertexShader,
        //    uniforms: shader.uniforms,
        //    side: THREE.BackSide,
        //    depthWrite: false,
        //    depthTest: false
        //});
        //this.skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(this.size, this.size, this.size), material);
        //this.skyboxMesh.castShadow = true;
        //this.skyboxMesh.recieveShadow = true;
        //scene.add(this.skyboxMesh);
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.size /= 10;
        }
    }
};

module.exports = Skybox;

