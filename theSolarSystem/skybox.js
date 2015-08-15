const PATH = "./images/"
var Skybox = {
    size: 1000000000,
    animations: [],
    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        this.createBox(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.skyboxContainer = new THREE.Object3D();
        scene.add(this.skyboxContainer);
    },
    createBox: function (scene) {
        var urls = [
            PATH + "px.jpg", PATH + "nx.jpg",
            PATH + "py.jpg", PATH + "ny.jpg",
            PATH + "pz.jpg", PATH + "nz.jpg"];

        var texture = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms['tCube'].value = texture;   // textureCube has been init before
        shader.uniforms['opacity'] = {value: 1.0, type: "f"};
        var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false
        });
        this.skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(this.size, this.size, this.size), material);
        scene.add(this.skyboxMesh);
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

