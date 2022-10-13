////infoControl lasa DISP_ADMIN_NAME
var DISP_ADMIN_NAME;
//// spatialGeomSelected lasa GEOM_SELECTED
var GEOM_SELECTED = [];

//// layersEXTRACT lasa MAP_ADMIN_LAYERS
var MAP_ADMIN_LAYERS = [];
//// ID column geojson data
var GEOM_ID;

var AWS_COORDS = [];

//////////////////////////

var stylelayer = {
    default: {
        color: "#bf9fbf",
        weight: 0.5,
        opacity: 0.1,
        fillOpacity: 0.0,
        //fillColor: "#2262cc"
    },
    highlight: {
        color: '#bf9fbf',
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.5,
        fillColor: '#2262cc'
    },
    selected: {
        color: '#bf9fbf',
        weight: 3,
        opacity: 0.6,
        fillOpacity: 0.6,
        fillColor: '#f55347'
    }
};

//////////////////////////

function selectAWSUserMap(map) {
    var divSelect = $('<div>').addClass('user-select-aws-map-div');

    var divSelGeom = $('<div>').css('text-align', 'right');
    var divFinish = $('<div>').css('text-align', 'right');
    var divDispGeom = $('<div>').css('text-align', 'right');
    var divArrow = $('<div>').css('text-align', 'center');
    var divSelSubD = $('<div>').css('text-align', 'center');
    var divSelAWS = $('<div>').css('text-align', 'center');

    // 
    var select_geom = $('<select>').appendTo(divSelGeom);
    select_geom.addClass('form-control');
    select_geom.css('width', '100%');

    var select_geomV = $('<select>').appendTo(divDispGeom);
    select_geomV.attr("multiple", "multiple");
    select_geomV.attr("size", 20);
    select_geomV.addClass('form-control');
    select_geomV.css({
        'width': '100%',
        'height': '300px'
    });

    var select_subD = $('<select>').appendTo(divSelSubD);
    select_subD.attr("multiple", "multiple");
    select_subD.attr("size", 20);
    select_subD.addClass('selected-admin-polygon form-control');
    select_subD.css({
        'width': '100%',
        'height': '300px'
    });

    var select_aws = $('<select>').appendTo(divSelAWS);
    select_aws.attr("multiple", "multiple");
    select_aws.attr("size", 20);
    select_aws.addClass('selected-admin-aws form-control');
    select_aws.css({
        'width': '100%',
        'height': '300px'
    });

    //////// 

    function set_admin_layer_and_select(selected_geom) {
        GEOM_ID = subdivision_names[selected_geom];
        geojson_data = select_administrative_geojson(selected_geom);

        // display layer for new selected
        display_administrative_map(map, geojson_data);

        // set options for select_geomV
        $.each(geojson_data.features, function() {
            if (this.properties && this.properties[GEOM_ID.displayAdmin]) {
                var text = this.properties[GEOM_ID.displayAdmin];
                var val = this.properties[GEOM_ID.idAdmin];
                select_geomV.append($("<option>").text(text).val(val));
            }
        });

        // set options for select_subD
        if (DATA_USERS.awslist.geomselected.length > 0) {
            var all_admin_id = geojson_data.features.map((x) => {
                if (x.properties && x.properties[GEOM_ID.displayAdmin]) {
                    return x.properties[GEOM_ID.idAdmin];
                } else {
                    return null;
                }
            });

            for (i = 0; i < DATA_USERS.awslist.geomselected.length; i++) {
                var val = DATA_USERS.awslist.geomselected[i];
                var ix = all_admin_id.map(x => x).indexOf(val);
                var text = geojson_data.features[ix].properties[GEOM_ID.displayAdmin];
                select_subD.append($("<option>").text(text).val(val));
            }
        }

        // set options for select_aws
        if (DATA_USERS.awslist.aws.length > 0) {
            for (i = 0; i < DATA_USERS.awslist.aws.length; i++) {
                var val = DATA_USERS.awslist.aws[i].network_code + '_' + DATA_USERS.awslist.aws[i].aws_id;
                var text = JSON_FLAT[JSON_FLAT.map(x => x.id).indexOf(val)].r_text;
                select_aws.append($("<option>").text(text).val(val));
            }
        }

        // update admin features
        if (GEOM_SELECTED.length > 0) {
            for (i = 0; i < GEOM_SELECTED.length; i++) {
                MAP_ADMIN_LAYERS[0].eachLayer(function(layer) {
                    if (layer.feature.properties[GEOM_ID.idAdmin] == GEOM_SELECTED[i]) {
                        layer.setStyle(stylelayer.selected);
                    }
                });
            }
        }

        // set stations & markers
        select_aws_inside_admin(map);
    }

    ////////////////////// 

    var geojson_data;

    AWS_COORDS = JSON_FLAT.map((x) => {
        return { "lat": x.lat, "lng": x.lon };
    });

    if (DATA_USERS.awslist.geomselected === undefined) {
        DATA_USERS.awslist.geomselected = [];
    }

    if (DATA_USERS.awslist.geomselected.length > 0) {
        var geomTmp = JSON.parse(JSON.stringify(DATA_USERS.awslist.geomselected));
        GEOM_SELECTED = geomTmp;
    }

    ////////////////////// 

    var subD_val = Object.keys(subdivision_names);
    for (i = 0; i < subD_val.length; i++) {
        var text = subdivision_names[subD_val[i]].selectName;
        select_geom.append($("<option>").val(subD_val[i]).text(text));
    }

    if (DATA_USERS.awslist.subdivision === undefined) {
        DATA_USERS.awslist.subdivision = select_geom.val();
    } else {
        select_geom.val(DATA_USERS.awslist.subdivision);
    }

    // Initialize geojson data, and display admin layer, set options select_geomV
    set_admin_layer_and_select(select_geom.val());

    DATA_USERS.awslist.subdivision = select_geom.val();
    DATA_USERS.awslist.geomid = GEOM_ID.idAdmin;
    DATA_USERS.awslist.geomdisp = GEOM_ID.displayAdmin;

    // 
    select_geom.on('change', function() {
        // clean everything in select
        select_geomV.empty();
        select_subD.empty();
        select_aws.empty();

        DATA_USERS.awslist.geomselected = [];
        GEOM_SELECTED = [];
        // remove all layers
        removeLayerMarkers(map);

        if (MAP_ADMIN_LAYERS.length > 0) {
            for (i = 0; i < MAP_ADMIN_LAYERS.length; i++) {
                map.removeLayer(MAP_ADMIN_LAYERS[i]);
            }
            MAP_ADMIN_LAYERS = [];
        }
        map.invalidateSize();

        // 
        set_admin_layer_and_select(select_geom.val());

        DATA_USERS.awslist.subdivision = select_geom.val();
        DATA_USERS.awslist.geomid = GEOM_ID.idAdmin;
        DATA_USERS.awslist.geomdisp = GEOM_ID.displayAdmin;
    });

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' >> ',
        click: () => {
            var sel_admin_val = select_geomV.val();
            if (sel_admin_val.length == 0) {
                return false;
            }

            for (var i = 0; i < sel_admin_val.length; ++i) {
                if (GEOM_SELECTED.includes(sel_admin_val[i])) {
                    continue;
                } else {
                    var ix = geojson_data.features.map((x) => {
                        if (x.properties && x.properties[GEOM_ID.displayAdmin]) {
                            return x.properties[GEOM_ID.idAdmin];
                        } else {
                            return null;
                        }
                    }).indexOf(sel_admin_val[i]);

                    var text = geojson_data.features[ix].properties[GEOM_ID.displayAdmin];
                    var val = geojson_data.features[ix].properties[GEOM_ID.idAdmin];
                    select_subD.append($("<option>").text(text).val(val));

                    // 
                    GEOM_SELECTED.push(sel_admin_val[i]);
                    DATA_USERS.awslist.geomselected.push(sel_admin_val[i]);

                    // update admin features
                    MAP_ADMIN_LAYERS[0].eachLayer(function(layer) {
                        if (layer.feature.properties[GEOM_ID.idAdmin] == sel_admin_val[i]) {
                            layer.setStyle(stylelayer.selected);
                        }
                    });
                }
            }

            // set stations & markers
            select_aws_inside_admin(map);
        }
    }).appendTo(divArrow);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' << ',
        click: () => {
            var sel_admin_val = select_subD.val();
            if (sel_admin_val.length == 0) {
                return false;
            }

            for (var i = 0; i < sel_admin_val.length; ++i) {
                select_subD.find('[value="' + sel_admin_val[i] + '"]').remove();

                // update admin features
                MAP_ADMIN_LAYERS[0].eachLayer(function(layer) {
                    if (layer.feature.properties[GEOM_ID.idAdmin] == sel_admin_val[i]) {
                        layer.setStyle(stylelayer.default);
                    }
                });
            }

            var irm = sel_admin_val.map(x => GEOM_SELECTED.indexOf(x));
            for (var i = sel_admin_val.length - 1; i >= 0; i--) {
                GEOM_SELECTED.splice(irm[i], 1);
                DATA_USERS.awslist.geomselected.splice(irm[i], 1);
            }

            // set stations & markers
            select_aws_inside_admin(map);
        }
    }).appendTo(divArrow);

    //
    divFinish.css({
        'display': 'grid',
        'grid-template-columns': '1fr 1fr',
        'grid-column-gap': '1rem'
    });
    var divFinB1 = $('<div>')
    var divFinB2 = $('<div>')

    // $("<button>", {
    //     type: 'button',
    //     'class': 'btn btn-primary btn-block',
    //     text: 'Show Stations',
    //     click: () => {
    //         select_aws_inside_admin(map);
    //     }
    // }).appendTo(divFinB1);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Finish',
        click: () => {
            $('a[href="#selectSTNTab"]').hide();
            $('a[href="#createUserTab"]').click();
        }
    }).appendTo(divFinB2);

    divFinish.append(divFinB1);
    divFinish.append(divFinB2);

    // 
    divSelect.append(divSelGeom);
    divSelect.append($('<div>').css({
        'grid-row': '1',
        'grid-column': '2/4'
    }));
    divSelect.append(divFinish);
    divSelect.append(divDispGeom);
    divSelect.append(divArrow);
    divSelect.append(divSelSubD);
    divSelect.append(divSelAWS);

    return divSelect;
}

//////////////////////////

function select_aws_inside_admin(map) {
    removeLayerMarkers(map);
    $(".selected-admin-aws").empty();

    // reset old aws list
    DATA_USERS.awslist.aws = [];

    // 
    if (GEOM_SELECTED.length > 0) {
        var admin_layers = MAP_ADMIN_LAYERS[0]._layers;
        var layers_keys = Object.keys(admin_layers);

        var aws_selected = GEOM_SELECTED.map((s) => {
            var ix = layers_keys.map(x => admin_layers[x].feature.properties[GEOM_ID.idAdmin]).indexOf(s);
            var aws_in_poly = AWS_COORDS.map(x => admin_layers[layers_keys[ix]].contains(x));

            var out = [];
            for (var i = 0; i < aws_in_poly.length; ++i) {
                if (aws_in_poly[i]) {
                    out.push(JSON_FLAT[i]);
                }
            }

            return out;
        });
        aws_selected = aws_selected.flat();

        // set options for select_aws and display markers
        if (aws_selected.length > 0) {
            $.each(aws_selected, function() {
                $('.selected-admin-aws').append($("<option>").text(this.r_text).val(this.id));

                var contenu = '<b>' + 'AWS: ' + '<font color="blue">' +
                    this.text + '</font>' + '</b>' +
                    '<br>' + '<b>AWS network:</b> ' + this.net;

                if (this.lon != null) {
                    var marker = L.marker([this.lat, this.lon])
                        .bindPopup(contenu).addTo(map);
                    MARKERS_BE.push(marker);
                }
            });

            for (var i = 0; i < aws_selected.length; ++i) {
                var mat = aws_selected[i].id.split("_");
                var obj = { "network_code": Number(mat[0]), "aws_id": mat[1] };
                DATA_USERS.awslist.aws.push(obj);
            }
        }
    }
}

////////////////////////

function select_administrative_geojson(selected_admin) {
    var geojson;
    switch (selected_admin) {
        case "sub-division1":
            geojson = subdivision1_geojson;
            break;
        case "sub-division2":
            geojson = subdivision2_geojson;
    }

    return geojson;
}

////////////////////////

function get_administrative_id(properties) {
    if (properties && properties[GEOM_ID.displayAdmin]) {
        id = properties[GEOM_ID.idAdmin];
        nom = properties[GEOM_ID.displayAdmin];
    } else {
        id = null;
        nom = null;
    }

    var props = { "id": id, "name": nom };
    return props;
}

function select_administrative_object(e) {
    var layer = e.target;
    var props = get_administrative_id(layer.feature.properties);

    if (props.id != null) {
        if (checkExistsLayers(layer.feature)) {
            layer.setStyle(stylelayer.default);
            var index = GEOM_SELECTED.indexOf(props.id);
            if (index > -1) {
                GEOM_SELECTED.splice(index, 1);
                DATA_USERS.awslist.geomselected.splice(index, 1);

                $('.selected-admin-polygon').find('[value="' + props.id + '"]').remove();
            }
        } else {
            layer.setStyle(stylelayer.selected);
            GEOM_SELECTED.push(props.id);
            DATA_USERS.awslist.geomselected.push(props.id);

            $('.selected-admin-polygon').append(
                $("<option>").text(props.name).val(props.id)
            );
        }

        // set stations & markers
        select_aws_inside_admin(MAP_BE);
    }
}

////////////////////////

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.highlight);
    DISP_ADMIN_NAME.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    if (checkExistsLayers(layer.feature)) {
        layer.setStyle(stylelayer.selected);
    } else {
        layer.setStyle(stylelayer.default);
    }
    DISP_ADMIN_NAME.update();
}

function checkExistsLayers(feature) {
    var result = false;
    var props = get_administrative_id(feature.properties);

    if (props.id == null) {
        return result;
    }
    //
    for (var i = 0; i < GEOM_SELECTED.length; i++) {
        if (GEOM_SELECTED[i] == props.id) {
            result = true;
            break;
        }
    };
    return result;
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: select_administrative_object
    });
}

////////////////////////

function display_administrative_map(map, geojson_data) {
    map.off('click');

    // display name of the polygon
    if (DISP_ADMIN_NAME != undefined) {
        map.removeControl(DISP_ADMIN_NAME);
    }
    DISP_ADMIN_NAME = L.control({ position: 'topleft' });

    DISP_ADMIN_NAME.onAdd = function() {
        this._div = L.DomUtil.create('div', 'leaflet-display-admin-name');
        this.update();
        return this._div;
    };

    DISP_ADMIN_NAME.update = function(properties) {
        var disp = get_administrative_id(properties);
        jQuery(this._div).html(disp.name);
    };

    DISP_ADMIN_NAME.addTo(map);

    // display administrative polygons
    var layersPolygons = L.geoJson(geojson_data, {
        style: stylelayer.default,
        onEachFeature: onEachFeature
    }).addTo(map);

    MAP_ADMIN_LAYERS[0] = layersPolygons;
}