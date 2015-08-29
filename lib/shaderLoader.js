var $ = require('jquery');

var ShaderLoader = {
    shaders: {},
    loadedFiles: 0,
    vertexExtension: '.vsh',
    fragmentExtension: '.fsh',
    callback: undefined,
    load: function (list, callback) {
        this.callback = callback;
        this.loadedFiles = 0;
        this.expectedFiles = list.length * 2;

        for (var i = 0; i < list.length; i++) {
            var vertexShaderFile = list[i] + this.vertexExtension;
            var fragmentShaderFile = list[i] + this.fragmentExtension;

            //	find the filename, use it as the identifier
            var splitted = list[i].split('/');
            var shaderName = splitted[splitted.length - 1];

            $(document).load(vertexShaderFile, this.makeCallback(shaderName, 'vertex'));
            $(document).load(fragmentShaderFile, this.makeCallback(shaderName, 'fragment'));
        }
    },
    makeCallback: function (name, type) {
        var self = this;
        return function (data) {
            if (self.shaders[name] === undefined) {
                self.shaders[name] = {};
            }

            self.shaders[name][type] = data;
            self.loadedFiles++;
            if (self.loadedFiles == self.expectedFiles) {
                self.callback(self.shaders);
            }

        };
    }

}
module.exports = ShaderLoader;
