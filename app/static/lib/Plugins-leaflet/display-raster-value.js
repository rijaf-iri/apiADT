L.Control.dispRasterValue = L.Control.extend({
    options: {
        position: 'topleft',
        rasterLayer: undefined,
        emptyString: 'Unavailable',
        valueFormatter: undefined,
        prefix: "",
        suffix: ""
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'leaflet-display-raster-value');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._onMouseMove, this);
        this._container.innerHTML = this.options.emptyString;

        return this._container;
    },

    onRemove: function(map) {
        map.off('mousemove', this._onMouseMove)
    },

    _onMouseMove: function(e) {
        var lalo = new L.LatLng(e.latlng.lat, e.latlng.lng);
        if (this.options.rasterLayer) {
            var value = this.options.rasterLayer.getValueAtLatLng(lalo.lat, lalo.lng);
            var formatVal = this.options.valueFormatter ? this.options.valueFormatter(value) : value;
            var formatted_value = this.options.prefix + formatVal + this.options.suffix;
        } else {
            var formatted_value = this.options.emptyString;
        }
        this._container.innerHTML = formatted_value;
    }
});

L.Map.mergeOptions({
    posRasterValue: false
});

L.Map.addInitHook(function() {
    if (this.options.posRasterValue) {
        this.posRasterValue = new L.Control.dispRasterValue();
        this.addControl(this.posRasterValue);
    }
});

L.control.displayRasterValue = function(options) {
    return new L.Control.dispRasterValue(options);
};