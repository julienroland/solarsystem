var Physics = {
    G: 0.0000000000667,
    getGravity: function (mass, radius) {
        return this.G * mass / (radius * radius);
    }

};

module.exports = Physics;
