$(document).ready(() => {

    ///////////////
    // Initialize map
    createLeafletTileLayer('mapGriddedDisp');
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets", "cartodb-dark"];
    addMapControlLayers(baseMapList, withImagePNG = false);
    // To remove
    // BASEMAP_CTRLAYER.remove();

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    // addPngRasterControlLayer();
    // To remove
    // RASTER_CTRLAYER.remove();

    // addDateToMap('hcentertop');
    addDateToMap();
    $('.leaflet-display-date').css({
        'background-color': 'black',
        // 'top': '7px'
    });
    // To remove
    // DATE_MAP.remove();

    ///////////////
    $("#displayGrdData").on("click", () => {
        griddedData_Display_Map();
    });

    ///////////////

    // $("#downLeafletMap").on("click", () => {
    //     if (GRID_PNG_DATA.status != "ok") {
    //         filename = "gridded_map";
    //     } else {
    //         // var unit = json.radar_type == "polar" ? "-Deg_" : "-Meter_";
    //         // filename = json.label + "_" + json.angle[sweep] + unit + json.radar_time;
    //         filename = "gridded_map_" + GRID_PNG_DATA.date;
    //     }

    //     // saveLeafletPngRasterImgV(GRID_PNG_DATA, filename);
    //     saveLeafletPngRasterImgH(GRID_PNG_DATA, filename);
    // });

});

//////////////////

var GRID_DATA_CONTR = { status: 'init' };
var DISP_DATA_CONTR;

function griddedData_Display_Map() {
    // var data = {
    //     "time": '2022-03'
    // };

    $.ajax({
        url: '/griddedCountorMap',
        // data: data,
        dataType: "json",
        success: (json) => {
            if (json.status != "ok") {
                flashMessage(json.message, json.flash);
                GRID_DATA_CONTR.status = 'no';
                return false;
            }
            json.data = JSON.parse(json.data);
            GRID_DATA_CONTR = json;
            leaflet_Map_Contour(json);
        },
        beforeSend: () => {
            if (MAP_BE != undefined) {
                MAP_BE.closePopup();
                MAP_BE.spin(true, spinner_opts);
            }
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                var msg = "Take too much time to render, " +
                    "refresh your web browser";
                flashMessage(msg, "error");
            } else {
                displayAjaxError(request, status, error);
            }
        }
    }).always(() => {
        MAP_BE.spin(false);
    });
}

////////////

function leaflet_Map_Contour(json) {
    MAP_BE.closePopup();
    removeLayerMarkers(MAP_BE);
    removeLayerImagePNG(MAP_BE);
    MAP_BE.invalidateSize();

    DATE_MAP.update(json.date);

    display_ContourMap(json.data);

    ////////////
    $('.div-title').empty();
    $('.div-title').html(json.title);

    ////////////
    $('#colKeyMapVar').empty();
    $('#colKeyMapVar').append(createColorKeyH(json.ckeys));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '55px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);
}

/////////////////////////////////////

function display_ContourMap(geojson) {
    MAP_BE.off('click');

    // display values of the polygon
    if (DISP_DATA_CONTR != undefined) {
        MAP_BE.removeControl(DISP_DATA_CONTR);
    }

    DISP_DATA_CONTR = L.control({ position: 'hcentertop' });

    DISP_DATA_CONTR.onAdd = function() {
        this._div = L.DomUtil.create('div', 'leaflet-display-raster-value');
        this.update();
        return this._div;
    };

    DISP_DATA_CONTR.update = function(properties) {
        if (properties) {
            disp_val = "Values: " + properties["values"];
        } else {
            disp_val = null;
        }
        jQuery(this._div).html(disp_val);
    };

    DISP_DATA_CONTR.addTo(MAP_BE);

    IMAGES_PNG[0] = L.geoJson(geojson, {
        style: styleContour,
        onEachFeature: onEachFeatureContour
    }).addTo(MAP_BE);
}


function styleContour(feature) {
    return {
        fillColor: feature.properties.color,
        ///// filling contour
        fillOpacity: 0.8,
        ///// line properties
        // weight: 2,
        // opacity: 1,
        color: 'transparent',
        // dashArray: '3',
    };
}

function onEachFeatureContour(feature, layer) {
    layer.on({
        mouseover: highlightFeatureContour,
        mouseout: resetHighlightContour,
        click: zoomToFeatureContour
    });
}

function resetHighlightContour(e) {
    IMAGES_PNG[0].resetStyle(e.target);
    DISP_DATA_CONTR.update();
}

function zoomToFeatureContour(e) {
    MAP_BE.fitBounds(e.target.getBounds());
}

function highlightFeatureContour(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#69676b',
        // dashArray: '',
        fillOpacity: 0.8
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    DISP_DATA_CONTR.update(layer.feature.properties);
}