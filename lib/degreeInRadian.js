var Converter = {
    radian: 0.0174532925,
    convert: function (degree) {
        return degree * this.radian;
    }
};
module.exports = Converter;

