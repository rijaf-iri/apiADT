// Initialize leaflet map
// var mymapBE;
// var mytileBE;
// var zoomBE;
// var scaleBE;
// var mouseposBE;
// var mymarkersBE = [];
// var myimagesPNG = [];
// var myimageMASK;
// var myparsMASK;
// var mypolarAxis = [];

var MAP_BE;
var TILE_BE;
var ZOOM_BE;
var SCALE_BE;
var MOUSEPOS_BE;
var MARKERS_BE = [];
var IMAGES_PNG = [];
var RASTER_VALUE;
var IMAGE_MASK; //myimageMASK
var PARS_MASK; //myparsMASK
var POLAR_AXIS = [];

/////////////////

var BASE_MAP;
$.getJSON(Flask.url_for("static", {
    "filename": "json/baseMap.json"
}), (json) => {
    BASE_MAP = json;
});

/////////////////

function removeLayerMarkers(map) {
    if (MARKERS_BE.length > 0) {
        for (i = 0; i < MARKERS_BE.length; i++) {
            map.removeLayer(MARKERS_BE[i]);
        }
        MARKERS_BE = [];
    }
}

function removeLayerImagePNG(map) {
    if (IMAGES_PNG.length > 0) {
        for (i = 0; i < IMAGES_PNG.length; i++) {
            if (IMAGES_PNG[i]) {
                map.removeLayer(IMAGES_PNG[i]);
            }
        }
    }
}

function addLayerImagePNG(map) {
    if (IMAGES_PNG.length > 0) {
        for (i = 0; i < IMAGES_PNG.length; i++) {
            if (IMAGES_PNG[i]) {
                map.addLayer(IMAGES_PNG[i]);
            }
        }
    }
}

function removeLayerPolarAxis(map) {
    if (POLAR_AXIS.length > 0) {
        for (i = 0; i < POLAR_AXIS.length; i++) {
            map.removeLayer(POLAR_AXIS[i]);
        }
        POLAR_AXIS = [];
    }
}

/////////////////

function defineMarkerObject() {
    var icons = {
        blue: {
            icon: blueIcon
        },
        yellow: {
            icon: yellowIcon
        },
        orange: {
            icon: orangeIcon
        },
        gold: {
            icon: goldIcon
        },
        red: {
            icon: redIcon
        },
        green: {
            icon: greenIcon
        },
        grey: {
            icon: greyIcon
        },
        black: {
            icon: blackIcon
        },
        violet: {
            icon: violetIcon
        }
    };

    return icons;
}

////////////////////////

function addLControlPositions() {
    var positions = MAP_BE._controlCorners
    var container = MAP_BE._controlContainer;

    function createCenterPosition(center, side) {
        var className = 'leaflet-' + center + ' ' + 'leaflet-' + side;
        positions[center + side] = L.DomUtil.create('div', className, container);
    }

    createCenterPosition('vcenter', 'left');
    createCenterPosition('vcenter', 'right');
    createCenterPosition('hcenter', 'top');
    createCenterPosition('hcenter', 'bottom');
}

/////////////////

function addLControlZoom(map = MAP_BE, position = 'bottomright') {
    ZOOM_BE = new L.Control.Zoom({
        position: position
    }).addTo(map);
}

function addLControlScale(map = MAP_BE, position = 'bottomleft') {
    SCALE_BE = new L.Control.Scale({
        position: position,
        imperial: false
    }).addTo(map);
}

function addLControlMousePosition(map = MAP_BE, position = 'bottomleft') {
    MOUSEPOS_BE = new L.control.mousePosition({
        position: 'bottomleft',
        lngFormatter: funlonFrmt,
        latFormatter: funlatFrmt
    }).addTo(map);
}

/////////////////

function createLeafletTileLayer(container, aws_tile = true) {
    if (MAP_BE == undefined) {
        // create map
        var map = L.map(container, {
            center: [MTO_INIT.mapCenterLAT, MTO_INIT.mapCenterLON],
            minZoom: 2,
            zoom: MTO_INIT.mapZoom,
            zoomControl: false
        });

        // 
        addLControlZoom(map, 'bottomright');
        addLControlScale(map, 'bottomleft');
        addLControlMousePosition(map, 'bottomleft');

        // 
        var meteo = ' | <a href="' + MTO_INIT.metServiceURL + '">' + MTO_INIT.metServiceName + '</a>';
        if (aws_tile) {
            var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
            var mytile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: attribu + meteo,
                maxZoom: 19,
                subdomains: ["a", "b", "c"]
            });
        } else {
            // var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
            // var mytile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            //     attribution: attribu + meteo,
            //     subdomains: 'abcd',
            //     maxZoom: 19
            // });
            var attribu = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
            attribu = attribu + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
            attribu = attribu + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
            mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: attribu + meteo,
                maxZoom: 23,
                id: 'light-v10',
                accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
            });
        }
        mytile.addTo(map);

        ////
        TILE_BE = mytile;
        MAP_BE = map;
        addLControlPositions();
    } else {
        var map = MAP_BE;
        map.invalidateSize();
        // remove markers
        removeLayerMarkers(map);
        // remove images layers
        removeLayerImagePNG(map);
        // remove other Layers
        removeLayerPolarAxis(map);
    }

    return map;
}

////////////////////////

function getMapboxTileLayer(mapid) {
    var meteo = ' | <a href="' + MTO_INIT.metServiceURL + '">' + MTO_INIT.metServiceName + '</a>';
    var attribu = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
    attribu = attribu + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
    attribu = attribu + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
    var mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: attribu + meteo,
        maxZoom: 23,
        id: mapid,
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
    });

    return mytile;
}

////////////////////////

function leafletTileLayers(basemap) {
    var mytile;
    var meteo = ' | <a href="' + MTO_INIT.metServiceURL + '">' + MTO_INIT.metServiceName + '</a>';
    switch (basemap) {
        case "openstreetmap":
            var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
            mytile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: attribu + meteo,
                maxZoom: 19,
                subdomains: ["a", "b", "c"]
            });
            break;
        case "cartodb-dark":
            var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
            mytile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: attribu + meteo,
                subdomains: 'abcd',
                maxZoom: 19
            });
            break;
        case "mapboxlight":
            mytile = getMapboxTileLayer('light-v10');
            break;
        case "mapboxstreets":
            mytile = getMapboxTileLayer('streets-v11');
            break;
        case "mapboxoutdoors":
            mytile = getMapboxTileLayer('outdoors-v11');
            break;
        case "mapboxsatellite":
            mytile = getMapboxTileLayer('satellite-v9');
            break;
        case "mapboxsatellitestreets":
            mytile = getMapboxTileLayer('satellite-streets-v11');
            break;
        case "esriworldimagery":
            var attribu = '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, <br> IGN, IGP, UPR-EGP, and the GIS User Community';
            mytile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: attribu + meteo,
                maxZoom: 18
            });
            break;
        case "googlemaps":
            mytile = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Maps',
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            });
    }

    return mytile;
}

////////////////////////

function modifyLeafletTileLayer(container, withImagePNG = true) {
    var basemap = $(container + " option:selected").val();
    var mytile = TILE_BE;
    MAP_BE.removeLayer(mytile);
    MAP_BE.attributionControl.removeAttribution();
    //
    if (withImagePNG) {
        removeLayerImagePNG(MAP_BE);
    }
    // 
    mytile = leafletTileLayers(basemap);
    mytile.addTo(MAP_BE);
    window.mytile = mytile;
    TILE_BE = mytile;
    // 
    if (withImagePNG) {
        addLayerImagePNG(MAP_BE);
    }
}

function changeLeafletTileLayer(container, withImagePNG = true) {
    $(container).on("change", () => {
        modifyLeafletTileLayer(container, withImagePNG)
    });
}

////////////////////////

function easyPrintMap() {
    var printer = L.easyPrint({
        tileLayer: TILE_BE,
        exportOnly: true,
        hideControlContainer: false,
        hidden: true
    }).addTo(MAP_BE);

    return printer;
}

////////////////////////

// http://spin.js.org/
// leaflet spin css
var spinner_opts = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#ffffff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: 'spinner', // The CSS class to assign to the spinner
    position: 'absolute', // Element positioning
};

////////////////////////

function customSearchTip(text, val) {
    var pinclass = val.layer._latlng.layer.options.icon.options.className;
    var kol = $("." + pinclass + " .pin-inner").css("background-color");
    var out = $('<a>', {
        href: "#",
        text: text
    });
    var em = $('<em>').css({
        'background': kol,
        'width': '14px',
        'height': '14px',
        'float': 'right'
    });
    out.prepend(em);

    return out.prop('outerHTML');
}

/////////////
var SEARCH_CTRLAYER;

function addAWSControlSearch(searchLayer, position = 'topright') {
    SEARCH_CTRLAYER = new L.Control.Search({
        position: position,
        layer: searchLayer,
        initial: false,
        zoom: 12,
        hideMarkerOnCollapse: true,
        buildTip: customSearchTip
    }).addTo(MAP_BE);
}

function removeControlSearch() {
    if (SEARCH_CTRLAYER) {
        SEARCH_CTRLAYER.remove();
    }
}

////////////////////////

var DATE_MAP;

function addDateToMap(position = 'topleft') {
    if (DATE_MAP != undefined) {
        MAP_BE.removeControl(DATE_MAP);
    }

    DATE_MAP = L.control({ position: position });
    DATE_MAP.onAdd = function() {
        this._div = L.DomUtil.create('div', 'leaflet-display-date');
        this.update();
        return this._div;
    };

    var dateMap = '';
    DATE_MAP.update = function(dateMap) {
        jQuery(this._div).html(dateMap);
    };
    DATE_MAP.addTo(MAP_BE);
}

////////////////////////

function createControlLayer() {
    var country_basemap = L.geoJson(country_geojson, {
        style: {
            color: "#0d0d0d",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.0
        }
    }).addTo(MAP_BE);

    // 
    var baselayers = {
        'OpenStreetMap': TILE_BE
    }
    var overlays = {
        'Add Country Boundaries': country_basemap
    };
    var clayers = L.control.layers(baselayers, overlays).addTo(MAP_BE);

    var out = { basemap: country_basemap, layer: clayers };
    return out;
}

////////////////////////

var BASEMAP_CTRLAYER;

function addMapControlLayers(baseMapList, withImagePNG = true) {
    var ctrLayer = createControlLayer();
    BASEMAP_CTRLAYER = ctrLayer.layer;
    var country_basemap = ctrLayer.basemap;

    // 
    $('.leaflet-top.leaflet-right .leaflet-control-layers').addClass('leaflet-control-layers-original');

    var selector = '.leaflet-control-layers-original';
    var layers_base = '.leaflet-control-layers-base';
    var layers_overlays = '.leaflet-control-layers-overlays';

    // 
    $(selector + ' ' + layers_base).empty();
    $(selector + ' ' + layers_base).append(selectLayerControl(baseMapList));
    // $(selector + ' ' + layers_overlays).find('input[type=checkbox]').click();

    var kol0 = country_basemap.options.style.color;
    var lwd0 = country_basemap.options.style.weight;
    $(selector + ' ' + layers_overlays).append(baseMapLinesOptions(kol0, lwd0));

    $(selector).on('change', "#basemaplayer", function() {
        var basemap = $(selector + ' ' + "#basemaplayer option:selected").val();
        var lwd = $(selector + ' ' + '#basemaplinelwd').val();
        var kol = $(selector + ' ' + '#basemaplinecol').val();

        modifyLeafletTileLayer(selector + ' ' + "#basemaplayer", withImagePNG);

        $(selector + ' ' + layers_base).empty();
        $(selector + ' ' + layers_base).append(selectLayerControl(baseMapList, basemap));

        setTimeout(() => {
            $(selector + ' ' + '.basemapoptions').empty();
            $(selector + ' ' + layers_overlays).append(baseMapLinesOptions(kol, lwd));
        }, 100);
    });

    $(selector).on('change', "#basemaplinelwd", function() {
        var lwd = $(selector + ' ' + '#basemaplinelwd').val();
        country_basemap.setStyle({ weight: lwd });
    })

    $(selector).on('click', "#basemaplinecol", function() {
        $(selector).on('mouseleave', function() {
            BASEMAP_CTRLAYER.expand();
        });

        $(selector + ' ' + '#basemaplinecol').on('input', function() {
            var kol = $(selector + ' ' + '#basemaplinecol').val();
            country_basemap.setStyle({ color: kol });
        });

        $(selector + ' ' + '#basemaplinecol').on('change', function() {
            var kol = $(selector + ' ' + '#basemaplinecol').val();
            country_basemap.setStyle({ color: kol });
        });

        setTimeout(() => {
            $(selector)
                .mouseenter(function() {
                    BASEMAP_CTRLAYER.expand();
                })
                .mouseleave(function() {
                    BASEMAP_CTRLAYER.collapse();
                });
        }, 1000);
    });
}

////////

function selectLayerControl(baseMapList, selected = "openstreetmap") {
    var divSelect = $('<div>')
    $('<label>').addClass("control-label")
        .text('Change base map').appendTo(divSelect);

    var selectL = $('<select>').appendTo(divSelect);
    selectL.attr("id", "basemaplayer");
    selectL.addClass('form-control');

    for (var i = 0; i < baseMapList.length; ++i) {
        var im = BASE_MAP.map(x => x.value).indexOf(baseMapList[i]);
        selectL.append($("<option>")
            .val(BASE_MAP[im].value)
            .text(BASE_MAP[im].name));
    }
    selectL.val(selected);

    return divSelect;
}

function baseMapLinesOptions(color, weight) {
    var divProp = $('<div>').addClass('basemapoptions');
    var table = $('<table>').css({
        'width': '100%'
    });
    var row = $('<tr>').appendTo(table);

    var lwd_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Width: ')
        .appendTo(lwd_lab);

    var td_lwd = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'number',
        id: 'basemaplinelwd',
        min: 0.5,
        max: 8.0,
        step: 0.5,
        value: weight
    }).appendTo(td_lwd);

    // 
    var col_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Color: ')
        .appendTo(col_lab);

    var td_col = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'color',
        id: 'basemaplinecol',
        value: color
    }).appendTo(td_col);

    divProp.append(table);

    return divProp;
}

////////////////////////

function createExtendedControlLayer(position = 'topright') {
    var icon = $('<center>');
    $('<img>', {
        src: '../static/images/icon_leaflet_control.png'
    }).css({
        'margin-top': '4px'
    }).appendTo(icon);

    var layerControlRaster = L.Control.Layers.extend({
        options: {
            position: position,
            // icon: test
        },
        initialize: function(baseLayers, overlays, options) {
            L.setOptions(this, options);
            L.Control.Layers.prototype.initialize.call(this, baseLayers, overlays, options);
        },
        onAdd: function(map) {
            var container = L.Control.Layers.prototype.onAdd.call(this, map);
            container.classList.add('leaflet-control-layers-extended');
            container.childNodes[0].innerHTML = icon.prop('outerHTML');
            return container;
        }
    });

    return new layerControlRaster(null, null).addTo(MAP_BE);
}

////////////////////////

function createOpacityRasterImage() {
    var div = $('<div>');
    var table = $('<table>').css({
        'width': '100%'
    });
    var row = $('<tr>').appendTo(table);

    var td_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Image Opacity')
        .appendTo(td_lab);

    var td_range = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'range',
        id: 'slideOpacity',
        class: 'custom-range',
        min: '0',
        max: '1.0',
        step: '0.1',
        value: '0.8'
    }).appendTo(td_range);

    var td_val = $('<td>').appendTo(row);
    var span_val = $("<span>")
        .attr('id', 'valueOpacity')
        .addClass('text-primary')
        .appendTo(td_val);
    span_val.html('0.8');
    span_val.css('font-weight', 'bold')

    div.append(table);

    return div;
}

//////

function addHtmlHrTag() {
    var hr = $('<hr>').css({
        'margin-top': '5px',
        'margin-bottom': '5px'
    });

    return hr;
}

////////////////////////

var RASTER_CTRLAYER;

function addPngRasterControlLayer(position = 'topright') {
    RASTER_CTRLAYER = createExtendedControlLayer(position);

    var selector = '.leaflet-control-layers-extended';
    var layers_base = '.leaflet-control-layers-base';
    var layers_overlays = '.leaflet-control-layers-overlays';
    var layers_list = '.leaflet-control-layers-list';
    var layers_separator = '.leaflet-control-layers-separator';

    $(selector + ' ' + layers_list).css('width', '250px');
    $(selector + ' ' + layers_base).empty();
    $(selector + ' ' + layers_overlays).empty();

    $(selector + ' ' + layers_base).append(createOpacityRasterImage());
    $(selector + ' ' + layers_base).append(addHtmlHrTag());
    $(selector + ' ' + layers_base).append(createMaskPngRasterImage());

    $(selector + ' ' + layers_separator).show();
    $(selector + ' ' + layers_overlays).append(createTypePngRasterImage());
    $(selector + ' ' + layers_overlays).append(addHtmlHrTag());
    $(selector + ' ' + layers_overlays).append(createZoomBoundsPngRasterImage());

    setOpacityPngRasterImage();
    setTypePngRasterImage();
    applyMaskPngRasterImage();
    resetMaskPngRasterImage();
}

/////////////////////

function applyMaskPngRasterImage() {
    var selector = '.leaflet-control-layers-extended';
    $(selector).on('click', "#rasterImageMask_apply", function() {
        var min = $(selector + ' ' + '#rasterImageMask_thres1').val();
        var max = $(selector + ' ' + '#rasterImageMask_thres2').val();
        var opr = $(selector + ' ' + '#rasterImageMask').val();

        if (GRID_PNG_DATA.status == 'ok') {
            apply_Mask_PngRasterImage(GRID_PNG_DATA, opr, min, max);
        }
    });
}

function resetMaskPngRasterImage() {
    var selector = '.leaflet-control-layers-extended';
    $(selector).on('click', "#rasterImageMask_reset", function() {
        MAP_BE.removeLayer(IMAGES_PNG[0]);
        var png_overlay = plot_Map_PngRasterImage(GRID_PNG_DATA.data.png, GRID_PNG_DATA.data.bounds);
        MAP_BE.addLayer(png_overlay);
        IMAGES_PNG[0] = png_overlay;
    });
}

function setOpacityPngRasterImage() {
    var selector = '.leaflet-control-layers-extended';
    $(selector).on('input change', '#slideOpacity', function() {
        $('#valueOpacity').html(this.value);
        if (IMAGES_PNG[0]) {
            IMAGES_PNG[0].setOpacity(this.value);
        }
    });
}

function createZoomBoundsPngRasterImage() {
    var div = $('<div>').css('text-align', 'center');

    $("<button>", {
        type: 'button',
        // class: 'btn btn-default',
        text: 'Zoom Map to raster bounds',
        click: (e) => {
            e.preventDefault();
            if (IMAGES_PNG[0]) {
                MAP_BE.fitBounds(GRID_PNG_DATA.data.bounds);
            }
        }
    }).css('margin', 'auto').appendTo(div);

    return div;
}

////////////////////////

function createMaskPngRasterImage() {
    var div = $('<div>');
    var table = $('<table>');
    var row = $('<tr>').appendTo(table);

    var td_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Mask Values')
        .css('margin-right', '5px')
        .appendTo(td_lab);

    var td_Opr = $('<td>').appendTo(row);
    var select_Opr = $('<select>').appendTo(td_Opr)
        .attr('id', 'rasterImageMask')
        .css({
            'width': '50px',
            'text-align': 'center'
        });

    var mask_val = ['<=', '>=', '>=<'];
    for (var i = 0; i < mask_val.length; ++i) {
        select_Opr.append($("<option>")
            .val(mask_val[i])
            .text(mask_val[i]));
    }
    select_Opr.val('>=<');

    var td_thres1 = $('<td>').appendTo(row);
    $('<select>').appendTo(td_thres1)
        .attr('id', 'rasterImageMask_thres1')
        .css('width', '55px');

    var td_thres2 = $('<td>').appendTo(row);
    $('<select>').appendTo(td_thres2)
        .attr('id', 'rasterImageMask_thres2')
        .css('width', '55px');

    select_Opr.on('change', () => {
        var opr = $("#rasterImageMask option:selected").val();
        if (opr == '>=<') {
            $('#rasterImageMask_thres2').show();
        } else {
            $('#rasterImageMask_thres2').hide();
        }
    });

    var rowc = $('<tr>').appendTo(table);
    var td_apply = $('<td>').attr('colspan', 3)
        .css({
            'text-align': 'right',
            'padding-right': '5px'
        }).appendTo(rowc);
    $("<button>", {
        type: 'button',
        // class: 'btn btn-default',
        id: 'rasterImageMask_apply',
        text: 'Apply Mask'
    }).appendTo(td_apply);

    var td_reset = $('<td>').attr('colspan', 1)
        .css({
            'text-align': 'left',
            'padding-left': '5px'
        }).appendTo(rowc);
    $("<button>", {
        type: 'button',
        // class: 'btn btn-default',
        id: 'rasterImageMask_reset',
        text: 'Reset'
    }).appendTo(td_reset);

    div.append(table);

    return div;
}

function setMaskPngRasterImage(ckeys) {
    var selector = '.leaflet-control-layers-extended';
    var thres1 = $(selector + ' ' + '#rasterImageMask_thres1');
    var thres2 = $(selector + ' ' + '#rasterImageMask_thres2');

    thres1.empty();
    thres2.empty();

    var nl = ckeys.labels.length;

    for (var i = 0; i < nl; i++) {
        thres1.append(
            $("<option>").text(ckeys.labels[i]).val(ckeys.labels[i])
        );
    }

    for (var i = 1; i < nl; i++) {
        thres2.append(
            $("<option>").text(ckeys.labels[i]).val(ckeys.labels[i])
        );
    }
    thres2.val(ckeys.labels[nl - 1]);
}

//////

function createTypePngRasterImage() {
    var div = $("<div>");
    var table = $('<table>').css({
        'width': '100%'
    });
    var row = $('<tr>').appendTo(table);

    var td_lab = $('<td>')
        .css('text-align', 'right')
        .appendTo(row);
    $('<label>').addClass("control-label")
        .text('Image Type')
        .appendTo(td_lab);

    var td_sel = $('<td>')
        .css({
            'text-align': 'left',
            'padding-left': '5px'
        }).appendTo(row);
    var select = $('<select>').appendTo(td_sel)
        .attr('id', 'rasterImageType');

    var img_txt = ['Pixel', 'Smooth'];
    var img_val = ['pixels', 'smooth'];
    for (var i = 0; i < img_val.length; ++i) {
        select.append($("<option>")
            .val(img_val[i])
            .text(img_txt[i]));
    }

    div.append(table);

    return div;
}

function setTypePngRasterImage() {
    var selector = '.leaflet-control-layers-extended';
    $(selector).on('change', "#rasterImageType", function() {
        MAP_BE.removeLayer(IMAGES_PNG[0]);
        if (GRID_PNG_DATA.status === 'init') {
            return false;
        }
        if (GRID_PNG_DATA.status != "ok") {
            flashMessage(GRID_PNG_DATA.message, GRID_PNG_DATA.flash);
            return false;
        }
        leaflet_Map_PngRasterImage(GRID_PNG_DATA.data.png, GRID_PNG_DATA.data.bounds, fit_bounds = false);
    });
}

/////////////////////

function apply_Mask_PngRasterImage(json, opr, min, max) {
    if (opr == '>=<') {
        if (Number(min) >= Number(max)) {
            var msg = "Mask lower bound is greater than or equal the upper bound";
            flashMessage(msg, 'error');
            return false;
        }
    }

    PARS_MASK = { ckeys: json.ckeys, min: min, max: max, opr: opr };
    IMAGE_MASK = new Image();

    jQuery(IMAGE_MASK).on('load', () => {
        mask_PngRasterImage(json);
    }).on('error', () => {
        flashMessage("Unable to apply mask", 'error');
    }).attr("src", json.data.png);
}

function mask_PngRasterImage(json) {
    var nl = PARS_MASK.ckeys.colors.length;
    var pars = {
        nl: nl,
        opr: PARS_MASK.opr,
        min: Number(PARS_MASK.min),
        max: Number(PARS_MASK.max),
        lab: PARS_MASK.ckeys.labels.map(Number),
    }
    var width = nl;
    var height = 1;

    var can_ckey = document.createElement("canvas");
    can_ckey.width = width;
    can_ckey.height = height;
    var ctx_ckey = can_ckey.getContext("2d");

    var img = new Image();

    jQuery(img).on('load', () => {
        ctx_ckey.drawImage(img, 0, 0)
        var img_dat = ctx_ckey.getImageData(0, 0, width, height);
        can_ckey.remove();

        var kol_ckey = convert_PngColorScaleToRGBA(img_dat);
        var kol_rgba = filter_PngRasterImage(kol_ckey, pars);

        if (kol_rgba.length > 0) {
            var datapng = canvas_PngRasterImage(kol_rgba);

            MAP_BE.removeLayer(IMAGES_PNG[0]);
            var png_overlay = plot_Map_PngRasterImage(datapng, json.data.bounds);
            MAP_BE.addLayer(png_overlay);
            IMAGES_PNG[0] = png_overlay;
        }
    }).attr("src", PARS_MASK.ckeys.png);
}

function canvas_PngRasterImage(kol_rgba) {
    var canvas = document.createElement("canvas");
    canvas.width = IMAGE_MASK.width;
    canvas.height = IMAGE_MASK.height;

    var context = canvas.getContext("2d");
    context.drawImage(IMAGE_MASK, 0, 0);
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    fillmask_PngRasterImage({
        data: imageData.data,
        kolor: kol_rgba
    }, (data) => {
        imageData.data = data;
        context.putImageData(imageData, 0, 0);
    });

    var out = canvas.toDataURL();

    canvas.remove();

    return out;
}

function filter_PngRasterImage(kol_ckey, pars) {
    var kol_rgba = new Array();

    if (pars.opr == "<=") {
        for (var i = 0; i < pars.nl - 1; i++) {
            if (pars.lab[i] <= pars.min) {
                kol_rgba.push(kol_ckey.rgba[i]);
            }
        }
    } else if (pars.opr == ">=") {
        for (var i = 1; i < pars.nl; i++) {
            if (pars.lab[i - 1] >= pars.min) {
                kol_rgba.push(kol_ckey.rgba[i]);
            }
        }
    } else {
        for (var i = 0; i < pars.nl; i++) {
            if (pars.lab[i] <= pars.min) {
                kol_rgba.push(kol_ckey.rgba[i]);
            }
        }
        for (var i = 1; i < pars.nl; i++) {
            if (pars.lab[i - 1] >= pars.max) {
                kol_rgba.push(kol_ckey.rgba[i]);
            }
        }
    }

    return kol_rgba;
}

function fillmask_PngRasterImage(obj, callback) {
    var data = obj.data;
    for (var i = 0; i < obj.kolor.length; i++) {
        var rgb = obj.kolor[i];
        var r, g, b, a;
        for (var j = 0; j < data.length; j += 4) {
            r = data[j];
            g = data[j + 1];
            b = data[j + 2];
            // a = data[j + 3];
            if ((r === rgb[0]) &&
                (g === rgb[1]) &&
                (b === rgb[2])) {
                // data[j] = rgb[0];
                // data[j + 1] = rgb[1];
                // data[j + 2] = rgb[2];
                data[j + 3] = 0;
            }
        }
    }

    callback(data);
}

function convert_PngColorScaleToRGBA(img) {
    var hex = [];
    var rgba = [];

    for (var j = 0; j < img.data.length; j += 4) {
        r = img.data[j];
        g = img.data[j + 1];
        b = img.data[j + 2];
        a = img.data[j + 3];
        hex.push(RGBToHex(r, g, b));
        rgba.push([r, g, b, a]);
    }

    return { hex: hex, rgba: rgba };
}

/////////////////////

function leaflet_Map_PngRasterImage(json_png, json_bounds, fit_bounds = false) {
    var png_overlay = plot_Map_PngRasterImage(json_png, json_bounds);
    MAP_BE.addLayer(png_overlay);
    if (fit_bounds) {
        MAP_BE.fitBounds(json_bounds);
    }
    IMAGES_PNG[0] = png_overlay;
}

function plot_Map_PngRasterImage(json_png, json_bounds) {
    var selector = '.leaflet-control-layers-extended';
    var opacity = $(selector + ' ' + '#slideOpacity').val();
    var imagetype = $(selector + ' ' + '#rasterImageType option:selected').val();
    if (imagetype == "pixels") {
        var png_overlay = addRasterImage(json_png, json_bounds, opacity);
    } else {
        var png_overlay = L.imageOverlay(json_png, json_bounds, { opacity: opacity });
    }

    return png_overlay;
}

////////////////////////

function addGeoTiffRasterControlLayer(GEOTIFF_DATA, colorScale, position = 'topright') {
    RASTER_CTRLAYER = createExtendedControlLayer(position);

    var selector = '.leaflet-control-layers-extended';
    var layers_base = '.leaflet-control-layers-base';
    var layers_overlays = '.leaflet-control-layers-overlays';
    var layers_list = '.leaflet-control-layers-list';
    var layers_separator = '.leaflet-control-layers-separator';

    $(selector + ' ' + layers_list).css('width', '250px');
    $(selector + ' ' + layers_base).empty();
    $(selector + ' ' + layers_overlays).empty();

    // 
    $(selector + ' ' + layers_base).append(createSelectColorScale(colorScale));
    $(selector + ' ' + layers_base).append(addHtmlHrTag());
    $(selector + ' ' + layers_base).append(createRangeColorScale(GEOTIFF_DATA.range));
    $(selector + ' ' + layers_base).append(createPrettyColorScale(GEOTIFF_DATA.prettyscale));
    $(selector + ' ' + layers_base).append(addHtmlHrTag());
    $(selector + ' ' + layers_base).append(createOpacityRasterImage());

    $(selector + ' ' + layers_separator).show();

    $(selector + ' ' + layers_overlays).append(createBlankingRasterImage());
    $(selector + ' ' + layers_overlays).append(addHtmlHrTag());
    $(selector + ' ' + layers_overlays).append(createZoomBoundsRasterImage());

    // 
    $(selector).on('change', '#select2ColorScaleRaster', function() {
        var color_name = $(selector + ' ' + "#select2ColorScaleRaster option:selected").val();
        var color_src = $(selector + ' ' + "#select2ColorScaleRaster option:selected").attr('data-img_src');

        if (IMAGES_PNG[0]) {
            IMAGES_PNG[0].options.renderer.setColorScale(color_name);
            $("#rasterColorScaleImageH").attr('src', color_src);
        }

        GEOTIFF_DATA.colorscale.color = color_name;
        GEOTIFF_DATA.colorscale.src = color_src;
    });

    // 
    $(selector).on('change', "#colorscaleRangeMin", function() {
        var range = GEOTIFF_DATA.range;
        var min = $(selector + ' ' + '#colorscaleRangeMin').val();
        range.min = Number(min);
        range.type = 'min';
        updateRangeColorScale(range);
    });

    $(selector).on('change', "#colorscaleRangeMax", function() {
        var range = GEOTIFF_DATA.range;
        var max = $(selector + ' ' + '#colorscaleRangeMax').val();
        range.max = Number(max);
        updateRangeColorScale(range);
    });

    $(selector).on('change', "#colorscaleRangeInt", function() {
        var range = GEOTIFF_DATA.range;
        var int = $(selector + ' ' + '#colorscaleRangeInt').val();
        range.int = Number(int);
        updateRangeColorScale(range);
    });

    $(selector).on('change', "#colorscalePretty", function() {
        var pretty = $(selector + ' ' + '#colorscalePretty').is(':checked');
        GEOTIFF_DATA.prettyscale = pretty;
        var range = GEOTIFF_DATA.range;
        updateRangeColorScale(range);
    });

    // 
    $(selector).on('input change', '#slideOpacity', function() {
        $('#valueOpacity').html(this.value);
        if (IMAGES_PNG[0]) {
            IMAGES_PNG[0].setOpacity(this.value);
        }
    });

    // 
    $(selector).on('change', "#blankMapCountry", function() {
        var blank = $(selector + ' ' + '#blankMapCountry').is(':checked');
        if (IMAGES_PNG[0]) {
            if (blank) {
                IMAGES_PNG[0].setClip(GEOTIFF_DATA.blankMask);
            } else {
                IMAGES_PNG[0].setClip(undefined);
            }
        }
    });
}

////////////////////////


function createSelectColorScale(colorScale) {
    var div = $('<div>');
    $('<label>').addClass("control-label")
        .text('Select Color Scale').appendTo(div);

    var select = $('<select>')
        .addClass('form-control')
        .attr('id', 'select2ColorScaleRaster')
        .appendTo(div);

    $.each(colorScale, function() {
        var option = $("<option>")
            .val(this.color)
            .text(this.color)
            .attr('data-img_src', this.src);
        select.append(option);
    });

    select.select2({
        templateSelection: templateSelectColorScale,
        templateResult: templateSelectColorScale,
        theme: "bootstrap",
        width: null
    });

    return div;
}

function templateSelectColorScale(obj) {
    var data = $(obj.element).data();
    var text = $(obj.element).text();
    if (data && data['img_src']) {
        return imgOptionsColorScale(text, data['img_src']);
    }
}

function imgOptionsColorScale(text, src) {
    var div = $('<div>');
    $('<img>', { src: src })
        .css({
            'width': '60%',
            'height': '10px',
            'margin-right': '5px',
            'vertical-align': 'middle'
        }).appendTo(div);

    $('<span>').text(text)
        .css('vertical-align', 'middle')
        .appendTo(div);

    return div;
}

function formatSelectColorScaleData() {
    var kol_name = ['rainbow', 'viridis', 'inferno', 'turbo', 'jet',
        'hsv', 'hot', 'cool', 'spring', 'summer', 'winter', 'autumn',
        'bone', 'copper', 'greys', 'greens', 'bluered', 'rdbu', 'picnic',
        'portland', 'blackbody', 'earth', 'electric', 'magma', 'plasma'
    ]

    var kol_out = [];
    for (var i = 0; i < kol_name.length; i++) {
        var pl = L.LeafletGeotiff.plotty({ colorScale: kol_name[i] });
        kol_out.push({ color: kol_name[i], src: pl.colorScaleData });
    }

    return kol_out;
}

//////

function createRangeColorScale(range) {
    var div = $('<div>');

    $('<label>').addClass("control-label")
        .text('Define Color Scale Breaks')
        .appendTo(div);

    var table = $('<table>').css({
        'width': '100%'
    });
    var row = $('<tr>').appendTo(table);

    var min_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Min:')
        .appendTo(min_lab);

    var td_min = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'number',
        id: 'colorscaleRangeMin',
        min: -1000,
        max: 10000,
        value: range.min
    }).appendTo(td_min);

    var max_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Max:')
        .appendTo(max_lab);

    var td_max = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'number',
        id: 'colorscaleRangeMax',
        min: -1000,
        max: 10000,
        value: range.max
    }).appendTo(td_max);

    var int_lab = $('<td>').appendTo(row);
    $('<label>').addClass("control-label")
        .text('Int:')
        .appendTo(int_lab);

    var td_int = $('<td>').appendTo(row);
    $('<input>').attr({
        type: 'number',
        id: 'colorscaleRangeInt',
        min: 1,
        max: 20,
        step: 1,
        value: range.int
    }).appendTo(td_int);

    div.append(table);

    return div;
}

function updateRangeColorScale(range) {
    var selector = '.leaflet-control-layers-extended'
    var selector_min = $(selector + ' ' + '#colorscaleRangeMin');
    var selector_max = $(selector + ' ' + '#colorscaleRangeMax');
    var selector_int = $(selector + ' ' + '#colorscaleRangeInt');

    if (IMAGES_PNG[0]) {
        var ckey_range = formatGEOTIFFColorKey(range.min, range.max,
            range.int, GEOTIFF_DATA.prettyscale);

        IMAGES_PNG[0].options.renderer.setDisplayRange(ckey_range.min, ckey_range.max);

        if (GEOTIFF_DATA.prettyscale) {
            selector_min.val(ckey_range.min);
            selector_max.val(ckey_range.max);
            selector_int.val(ckey_range.int);
        }

        // 
        var ckeys = {
            src: GEOTIFF_DATA.colorscale.src,
            labels: ckey_range.ckey_label,
            title: GEOTIFF_DATA.ckey_title
        }

        setRasterColorKeyH(GEOTIFF_DATA.ckey_container, ckeys);
    }
}

function createPrettyColorScale(pretty) {
    var div = $('<div>').css('padding', '5px');

    var checkbox = $('<label>')
        .html('&ensp;Use Pretty Color Scale Breaks')
        .prepend(
            $('<input>').attr({
                type: 'checkbox',
                id: 'colorscalePretty'
            }).prop('checked', pretty)
        );

    div.append(checkbox);

    return div;
}

//////

function createZoomBoundsRasterImage() {
    var div = $('<div>').css('text-align', 'center');

    $("<button>", {
        type: 'button',
        // class: 'btn btn-default',
        text: 'Zoom Map to raster bounds',
        click: (e) => {
            e.preventDefault();
            if (IMAGES_PNG[0]) {
                var bounds = IMAGES_PNG[0].getBounds();
                MAP_BE.fitBounds(bounds);
            }
        }
    }).css('margin', 'auto').appendTo(div);

    return div;
}

function createBlankingRasterImage() {
    var div = $('<div>').css('padding', '5px');

    var checkbox = $('<label>')
        .html('&ensp;Mask Pixels Outside Country')
        .prepend(
            $('<input>').attr({
                type: 'checkbox',
                id: 'blankMapCountry'
            })
        );

    div.append(checkbox);

    return div;
}

//////////////////////////////

function dispGeoTiffError(e) {
    flashMessage(e.message, "error");
    return false;
}

function spinnerStart() {
    MAP_BE.spin(true, spinner_opts);
}

function spinnerStop() {
    MAP_BE.spin(false);
}

//////////////////////////////

function formatRasterValue(value) {
    if (value | value == 0) {
        return roundNumber(value, 2);
    } else {
        return 'NA';
    }
}

function clickGetRasterValue() {
    var popup;
    MAP_BE.on("click", function(e) {
        var lalo = new L.LatLng(e.latlng.lat, e.latlng.lng);
        var x_in = lalo.lng >= IMAGES_PNG[0].x_min & lalo.lng <= IMAGES_PNG[0].x_max;
        var y_in = lalo.lat >= IMAGES_PNG[0].y_min & lalo.lat <= IMAGES_PNG[0].y_max;
        if (x_in && y_in) {
            if (!popup) {
                popup = L.popup().setLatLng(lalo).openOn(MAP_BE);
            } else {
                popup.setLatLng(lalo);
            }
            var value = IMAGES_PNG[0].getValueAtLatLng(lalo.lat, lalo.lng);
            value = formatRasterValue(value);

            if (RASTER_VALUE.options.prefix) {
                var prefix = '<b>' + RASTER_VALUE.options.prefix + '</b>';
                var suffix = RASTER_VALUE.options.suffix;
                var content = prefix + value + suffix;
            } else {
                var content = '<b>Value : </b>' + value;
            }
            content = '<b>Latitude : </b>' + roundNumber(lalo.lat, 6) + '<br>' +
                '<b>Longitude : </b>' + roundNumber(lalo.lng, 6) + '<br>' + content;

            popup.setContent(content).openOn(MAP_BE);
        }
    });
}

//////////////////////////////