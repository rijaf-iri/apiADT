$(document).ready(() => {
    createLeafletTileLayer('mapAWSCoords');
    var icons = defineMarkerObject();

    // 
    MAP_BE.on("dblclick", function(e) {
        var markerPos = L.marker(e.latlng, { icon: blackIcon }).addTo(MAP_BE);
        var position = markerPos.getLatLng();
        var html = "<b>Latitude : </b>" + position.lat +
            "<br>" + "<b>Longitude : </b>" + position.lng +
            '<hr><a id="rmbtn" href="#" role="button">Remove marker</a>';
        markerPos.bindPopup(html).openPopup();
        $('.leaflet-popup-content').on('click', '#rmbtn', () => {
            MAP_BE.removeLayer(markerPos);
        });
    });

    var baseMapList = ["openstreetmap", "mapboxsatellitestreets",
        "mapboxsatellite", "mapboxstreets", "mapboxoutdoors",
        "mapboxlight", "googlemaps"
    ];
    addMapControlLayers(baseMapList, withImagePNG = false);

    //////
    AWSCOORDS_JSON = "";
    if (DATA_USERS.uid > 0) {
        $('#idTable').empty();
    }

    $.getJSON('/dispAWSCoordsMap', (json) => {
        AWSCOORDS_JSON = json;

        $.each(Object.keys(json.netinfo), (i, v) => {
            x = json.netinfo[v];
            $('#awsnet').append($("<option>").val(x.code).text(x.long_name));
        });

        $("#aws-network-table").append(awsNetworkMarkerLegend(json.netinfo));

        var colP = json.colinfo.header;

        if (DATA_USERS.uid > 0) {
            var colHeader = Object.keys(json.coords[1]);
            colHeader.splice(colHeader.length - 3, 3);
            var rowNb = 0;

            var table = $('<table>').addClass('table table-bordered table-hover table-striped');
            table.attr('id', 'missTable');
            $('#idTable').append(table);
            var thead = $('<thead>').appendTo(table);
            var row = $('<tr>').appendTo(thead);
            row.append($('<th>').text("N°"));
            for (var i = 0; i < colHeader.length; i++) {
                row.append($('<th>').text(colHeader[i]));
            }
            var tbody = $('<tbody>').appendTo(table);
        }

        $.each(json.coords, function() {
            var contenu = '';
            for (var i = 0; i < colP.length; i++) {
                if (colP[i] == 'id') {
                    tmp = '<b>' + colP[i] + ' : ' + this[colP[i]] + '</b>';
                } else {
                    tmp = '<br>' + colP[i] + ' : ' + this[colP[i]];
                }
                contenu = contenu + tmp;
            }

            if (this.LonX != null) {
                var marker = L.marker([this.LatX, this.LonX], { icon: icons[this.StatusX].icon })
                    .bindPopup(contenu).addTo(MAP_BE);
                MARKERS_BE.push(marker);
            } else {
                if (DATA_USERS.uid > 0) {
                    rowNb = rowNb + 1;
                    var row = $('<tr>').appendTo(tbody);
                    row.last().append($('<td>').text(rowNb));
                    $.each($(this).get(0), function(index, value) {
                        if (['StatusX', 'LonX', 'LatX'].includes(index)) {
                            return;
                        }
                        row.last().append($('<td>').text(value));
                    });
                }
            }
        });
    });

    //////

    var printer = L.easyPrint({
        tileLayer: TILE_BE,
        exportOnly: true,
        hideControlContainer: false,
        hidden: true
    }).addTo(MAP_BE);

    $("#downLeafletMap").on("click", () => {
        printer.printMap('CurrentSize', 'aws_map');
    });

    ////////////
    if (DATA_USERS.uid > 0) {
        // initialize table with aws network code 1
        disp_Table_Coords("1");
    }

    //////

    $("#awsNetDisp").on("click", () => {
        $('a[href="#mapstnloc"]').click();
        // 
        if (AWSCOORDS_JSON == "") {
            return false;
        }
        var awsnet = $("#awsnet option:selected").val();
        var json = AWSCOORDS_JSON.coords.filter(x => x.network_code.indexOf(awsnet) !== -1);
        var colP = AWSCOORDS_JSON.colinfo.header;

        disp_Netwok_Map(json, colP, icons);
    });

    //////

    $("#awsNetDispAll").on("click", () => {
        $('a[href="#mapstnloc"]').click();
        // 
        if (AWSCOORDS_JSON == "") {
            return false;
        }
        var colP = AWSCOORDS_JSON.colinfo.header;

        disp_Netwok_Map(AWSCOORDS_JSON.coords, colP, icons);
    });
});

////////////

function awsNetworkMarkerLegend(json) {
    var net = Object.keys(json);
    net.sort();
    var img_pth = $('#marker-pth').data();

    var table = $('<table>')
    for (var i = 0; i < net.length; ++i) {
        var row = $('<tr>');
        var col = $('<td>').appendTo(row);
        col.append($('<img>', {
            class: 'pinstatus',
            src: img_pth.url + "marker-icon-2x-" + json[net[i]].color + ".png"
        }));
        var col1 = $('<td>').appendTo(row);
        col1.text(json[net[i]].name + ', code: ' + net[i]);
        table.append(row);
    }
    var row = $('<tr>');
    var col = $('<td>').appendTo(row);
    col.append($('<img>', {
        class: 'pinstatus',
        src: img_pth.url + "marker-icon-2x-" + "red" + ".png"
    }));
    var col1 = $('<td>').appendTo(row);
    col1.text("Duplicated");
    table.append(row);

    return table;
}

////////////

function disp_Netwok_Map(json, col, icons) {
    MAP_BE.invalidateSize();
    removeLayerMarkers(MAP_BE);

    $.each(json, function() {
        var contenu = '';
        for (var i = 0; i < col.length; i++) {
            if (col[i] == 'id') {
                tmp = '<b>' + col[i] + ' : ' + this[col[i]] + '</b>';
            } else {
                tmp = '<br>' + col[i] + ' : ' + this[col[i]];
            }
            contenu = contenu + tmp;
        }

        if (this.LonX != null) {
            var marker = L.marker([this.LatX, this.LonX], { icon: icons[this.StatusX].icon })
                .bindPopup(contenu).addTo(MAP_BE);
            MARKERS_BE.push(marker);
        }
    });
}