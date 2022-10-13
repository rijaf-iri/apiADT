$(document).ready(() => {
    var time_step0 = 'daily';
    setIRIDLPrecipTempResolution(time_step0);
    setIRIDLPrecipTimeSelect();
    setIRIDLPrecipSource();

    // Initialize map
    createLeafletTileLayer('mapRFEDisp');
    $('a[href="#maprfedata"]').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    // 
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets", "cartodb-dark"];
    addMapControlLayers(baseMapList, withImagePNG = true);

    // 
    var colorScale = formatSelectColorScaleData();
    GEOTIFF_DATA.status = 'init';
    GEOTIFF_DATA.range = { min: 0, max: 100, int: 5 };
    GEOTIFF_DATA.colorscale = colorScale[0];
    GEOTIFF_DATA.prettyscale = false;
    GEOTIFF_DATA.opacity = 0.8;
    GEOTIFF_DATA.ckey_container = '#colKeyMapVar';
    GEOTIFF_DATA.blankMask = formatGeojsonUseToBlank(country_geojson);

    addGeoTiffRasterControlLayer(GEOTIFF_DATA, colorScale);

    // 
    addDateToMap();
    $('.leaflet-display-date').css({
        'background-color': 'black',
        // 'top': '7px'
    });

    ///////////////

    $("#AWSMapDis").on("click", () => {
        var time_step = $("#timestepDispTS option:selected").val();
        var rfe_src = $("#rfeProducts option:selected").val();
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "source": rfe_src
        };
        iridlPrecip_Display_Map(data);
    });
    //
    $("#AWSMapNext").on("click", () => {
        var time_step = $("#timestepDispTS option:selected").val();
        var rfe_src = $("#rfeProducts option:selected").val();
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "source": rfe_src
        };
        iridlPrecip_Display_Map(data);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        var time_step = $("#timestepDispTS option:selected").val();
        var rfe_src = $("#rfeProducts option:selected").val();
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "source": rfe_src
        };
        iridlPrecip_Display_Map(data);
    });


});

/////////////

var OUT;
var GEOTIFF_DATA = {};

function iridlPrecip_Display_Map(data) {
    var info_src = iridlCreateURL(data);
    if (!info_src) {
        GEOTIFF_DATA.status = 'no';
        return false;
    }

    OUT = info_src;
    GEOTIFF_DATA.status = 'init';
    GEOTIFF_DATA.range.min = info_src.min;
    GEOTIFF_DATA.range.max = info_src.max;
    GEOTIFF_DATA.ckey_title = info_src.ckey_title;

    leaflet_Map_iridlPrecip(info_src);
}

/////////////

function leaflet_Map_iridlPrecip(json) {
    MAP_BE.closePopup();
    removeLayerImagePNG(MAP_BE);
    if (RASTER_VALUE) {
        RASTER_VALUE.remove();
    }
    MAP_BE.invalidateSize();

    // 
    var ckey_range = formatGEOTIFFColorKey(json.min, json.max,
        GEOTIFF_DATA.range.int, GEOTIFF_DATA.prettyscale);

    // 
    plotty_render = L.LeafletGeotiff.plotty({
        displayMin: ckey_range.min,
        displayMax: ckey_range.max,
        colorScale: GEOTIFF_DATA.colorscale.color,
        clampLow: false,
        clampHigh: false,
    });

    IMAGES_PNG[0] = L.leafletGeotiff(json.url, {
        opacity: GEOTIFF_DATA.opacity,
        renderer: plotty_render,
        onError: dispGeoTiffError,
        spinnerStart: spinnerStart,
        spinnerStop: spinnerStop
    }).addTo(MAP_BE);

    GEOTIFF_DATA.status = 'ok';

    // blank
    blank = $('.leaflet-control-layers-extended #blankMapCountry').is(':checked');
    if (blank) {
        IMAGES_PNG[0].setClip(GEOTIFF_DATA.blankMask);
    }

    // L.control display value; mouseover
    RASTER_VALUE = new L.control.displayRasterValue({
        position: 'hcentertop',
        rasterLayer: IMAGES_PNG[0],
        valueFormatter: formatRasterValue,
        prefix: 'Precipitation: ',
        suffix: ' ' + json.units
    }).addTo(MAP_BE);

    //  popup display value; click
    clickGetRasterValue();

    // 
    DATE_MAP.update(json.date);

    // 
    $('.div-title').empty();
    $('.div-title').html(json.map_title);

    // 
    var ckeys = {
        src: GEOTIFF_DATA.colorscale.src,
        labels: ckey_range.ckey_label,
        title: json.ckey_title
    }
    setRasterColorKeyH('#colKeyMapVar', ckeys);
}


// {"type":"MultiPolygon", "coordinates":[
//   [
//     [[x0,y0], [x1,y1], ... [x0,y0]], /*outer1*/
//     [[x0,y0], [x1,y1], ... [x0,y0]], /*inner1, ~ hole, optional*/
//     [[x0,y0], [x1,y1], ... [x0,y0]], inner2, ~ hole, optional
//   ],[
//     [[x0,y0], [x1,y1], ... [x0,y0]], /*outer2*/
//   ],...,[
//     [[x0,y0], [x1,y1], ... [x0,y0]], /*outer3*/
//   ],[
//     [[x0,y0], [x1,y1], ... [x0,y0]], /*outer4*/
//   ]
// ]}


function formatGeojsonUseToBlank(geojson) {
    var coords = geojson.features[0].geometry.coordinates;

    var transpose_coords = [];
    // for (var i = 0; i < coords.length; i++) {
    var i = 0;

    ///// get outer polygons
    var outer = coords[i][0];

    ////// transpose outer
    for (var j = 0; j < outer.length; j++) {
        var tmp = outer[j][0];
        outer[j][0] = outer[j][1];
        outer[j][1] = tmp;
    }
    transpose_coords = outer;
    // transpose_coords.push(outer);
    // }

    return transpose_coords;
}