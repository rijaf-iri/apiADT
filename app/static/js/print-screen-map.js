function removeLControlBottom() {
    MAP_BE.removeControl(ZOOM_BE);
    MAP_BE.removeControl(SCALE_BE);
    MAP_BE.removeControl(MOUSEPOS_BE);
}

function addLControlBottom() {
    addLControlZoom();
    addLControlScale();
    addLControlMousePosition();
}

////////////

function saveLeafletDispQPEMap(xvar, ckeys, unit, filename) {
    MAP_BE.removeControl(ZOOM_BE);

    var colorBar = L.control({
        position: 'bottomright'
    });

    colorBar.onAdd = (map) => {
        var div = L.DomUtil.create('div', 'colorbar');
        $(div).empty();

        $('<p>').html(unit).css({
            'text-align': 'center',
            'margin-top': '1px',
            'margin-bottom': '1px',
            'font-size': '10'
        }).appendTo(div);
        $(div).append(createColorKeyV(ckeys[xvar]));

        return div;
    }

    colorBar.addTo(MAP_BE);
    $('.leaflet-right .colorbar').css({
        'margin-right': '0px',
        'margin-bottom': '0px'
    });
    $('.colorbar').css('background-color', '#f4f4f4');
    $('.colorbar .ckeyv').css({
        'width': '50px',
        'height': '70vh'
    });
    $('.colorbar .ckeyv-label').css('font-size', 12);

    // 
    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        MAP_BE.removeControl(colorBar);
        ZOOM_BE = new L.Control.Zoom({
            position: 'bottomright'
        }).addTo(MAP_BE);
        MAP_BE.removeControl(printer);
    }, 1000);
}

////////////

function saveLeafletDispRadarMap(json, filename) {
    if (json.status != "no-data") {
        MAP_BE.removeControl(ZOOM_BE);

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();

            $('<p>').html(json.unit).css({
                'text-align': 'center',
                'margin-top': '1px',
                'margin-bottom': '1px',
                'font-size': '10'
            }).appendTo(div);
            $(div).append(createColorKeyV(json.ckeys));

            return div;
        }

        colorBar.addTo(MAP_BE);
        $('.leaflet-right .colorbar').css({
            'margin-right': '0px',
            'margin-bottom': '0px'
        });
        $('.colorbar').css('background-color', '#f4f4f4');
        $('.colorbar .ckeyv').css({
            'width': '50px',
            'height': '70vh'
        });
        $('.colorbar .ckeyv-label').css('font-size', 12);
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            MAP_BE.removeControl(colorBar);

            ZOOM_BE = new L.Control.Zoom({
                position: 'bottomright'
            }).addTo(MAP_BE);
        }
        MAP_BE.removeControl(printer);
    }, 1000);
}

////////////

function saveLeafletDispAWS(key_draw, key_col, key_title, filename) {
    if (key_draw) {
        removeLControlBottom();

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();
            $(div).append(createColorKeyH(key_col));

            return div;
        }

        colorBar.addTo(MAP_BE);
        $('.leaflet-right .colorbar').css({
            'margin-right': 0,
            'margin-bottom': 0
        });
        $('.colorbar').css('background-color', '#f4f4f4');
        $('.colorbar .ckeyh').css({
            'width': '290px',
            'height': '55px'
        });
        $('.colorbar .ckeyh-label').css('font-size', 10);
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            MAP_BE.removeControl(colorBar);
            addLControlBottom();
        }
        MAP_BE.removeControl(printer);
    }, 1000);
}

////////////

function saveLeafletPngRasterImgH(json, filename) {
    if (json.status == "ok") {
        removeLControlBottom();
        BASEMAP_CTRLAYER.remove();
        RASTER_CTRLAYER.remove();

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();
            $(div).append(createColorKeyH(json.ckeys));

            return div;
        }

        colorBar.addTo(MAP_BE);

        $('.leaflet-right .colorbar').css({
            'margin-right': 0,
            'margin-bottom': 0
        });
        $('.colorbar').css('background-color', '#f4f4f4');
        $('.colorbar .ckeyh').css({
            'width': '290px',
            'height': '55px'
        });
        $('.colorbar .ckeyh-label').css('font-size', 10);
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            MAP_BE.removeControl(colorBar);
            addLControlBottom();

            var baseMapList = ["openstreetmap", "mapboxsatellitestreets", "cartodb-dark"];
            addMapControlLayers(baseMapList, withImagePNG = true);

            addPngRasterControlLayer(json);
        }
        MAP_BE.removeControl(printer);
    }, 1000);
}

function saveLeafletPngRasterImgV(json, filename) {
    if (json.status == "ok") {
        removeLControlBottom();
        BASEMAP_CTRLAYER.remove();
        RASTER_CTRLAYER.remove();

        var colorBar = L.control({
            position: 'vcenterright'
            // position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();
            $(div).append(createColorKeyVE(json.ckeys));

            return div;
        }

        colorBar.addTo(MAP_BE);

        $('.leaflet-right .colorbar').css({
            // 'margin-bottom': '0px',
            'margin-right': '0px',
            'padding': '5px',
            // 'display': 'table'
        });
        $('.colorbar').css('background-color', '#f4f4f4');

        $('.colorbar .ckeyvE').css({
            'width': '50px',
            // 'width': '80px',
            // 'height': '75vh',
            'height': '40vh'
        });

        $('.colorbar .ckeyvE-label').css('font-size', 10);

        $('.colorbar .ckeyvE-title').empty();
        // $('.colorbar').append(
        //     $('<span>').html(json.ckeys.title).css({
        //         'display': 'table-cell',
        //         'text-align': 'center',
        //         'vertical-align': 'middle',
        //         // 'transform': 'rotate(180deg)',
        //         'font-size': '10',
        //         'background-color': 'red',
        //         'writing-mode': 'vertical-rl',
        //     })
        // );

        // $('.colorbar .ckeyvE-title').css({
        //     // 'width': '10%',
        //     // 'text-align': 'center',
        //     // 'vertical-align': 'middle',
        //     'writing-mode': 'vertical-rl',
        //     'transform': 'rotate(90deg)'
        // });
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            MAP_BE.removeControl(colorBar);
            addLControlBottom();

            var baseMapList = ["openstreetmap", "mapboxsatellitestreets", "cartodb-dark"];
            addMapControlLayers(baseMapList, withImagePNG = true);

            addPngRasterControlLayer(json);
        }
        MAP_BE.removeControl(printer);
    }, 1000);
}