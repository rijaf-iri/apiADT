$(document).ready(() => {

    ///////////////
    // Initialize map
    createLeafletTileLayer('mapGriddedDisp');
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets", "cartodb-dark"];
    addMapControlLayers(baseMapList, withImagePNG = true);
    // To remove
    // BASEMAP_CTRLAYER.remove();

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    addPngRasterControlLayer();
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

    $("#downLeafletMap").on("click", () => {
        if (GRID_PNG_DATA.status != "ok") {
            filename = "gridded_map";
        } else {
            // var unit = json.radar_type == "polar" ? "-Deg_" : "-Meter_";
            // filename = json.label + "_" + json.angle[sweep] + unit + json.radar_time;
            filename = "gridded_map_" + GRID_PNG_DATA.date;
        }

        // saveLeafletPngRasterImgV(GRID_PNG_DATA, filename);
        saveLeafletPngRasterImgH(GRID_PNG_DATA, filename);
    });

});

////// 
var GRID_PNG_DATA = { status: 'init' };

function griddedData_Display_Map() {
    // var data = {
    //     "time": '2022-03'
    // };

    $.ajax({
        url: '/griddedPNGBase64',
        // data: data,
        dataType: "json",
        success: (json) => {
            if (json.status != "ok") {
                flashMessage(json.message, json.flash);
                GRID_PNG_DATA.status = 'no';
                return false;
            }
            GRID_PNG_DATA = json;
            leaflet_Map_griddedData(json);
            setTypePngRasterImage(json);
            setMaskPngRasterImage(json.ckeys);
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

function leaflet_Map_griddedData(json) {
    MAP_BE.closePopup();
    removeLayerMarkers(MAP_BE);
    removeLayerImagePNG(MAP_BE);
    MAP_BE.invalidateSize();

    DATE_MAP.update(json.date);

    leaflet_Map_PngRasterImage(json.data.png, json.data.bounds, fit_bounds = false);

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

    ////////////
    $('.div-ckey').empty();
    $('.div-ckey').append(createColorKeyVE(json.ckeys));
    $('.div-ckey .ckeyvE').css({
        'width': '80px',
        'height': '75vh'
    });
}

//////////////////////////////