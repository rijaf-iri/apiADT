$(document).ready(() => {
    $.getJSON('/statusVariables', (json) => {
        $.each(json, function() {
            $('#statusVar').append(
                $("<option>").text(this.text).val(this.value)
            );
        });
        $('#statusVar').val('0_0');
    });

    // 
    var lastTimeVal = ["01h", "03h", "06h", "12h", "24h",
        "02d", "03d", "05d", "01w", "02w", "03w", "01m"
    ];
    var lastTimeTxt = ["1 hour", "3 hours", "6 hours",
        "12 hours", "24 hours", "2 days", "3 days", "5 days",
        "1 week", "2 weeks", "3 weeks", "1 month"
    ];
    for (var i = 0; i < lastTimeVal.length; ++i) {
        $('#lastAvail').append(
            $("<option>").text(lastTimeTxt[i]).val(lastTimeVal[i])
        );
    }

    //
    createLeafletTileLayer('mapAWSStatus');
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets"];
    addMapControlLayers(baseMapList, withImagePNG = false);

    // 
    var data0 = { ltime: "01h", varh: "0_0" }
    updateStatusMap(data0);

    $("#updateStatus").on("click", function() {
        var data = {
            ltime: $("#lastAvail option:selected").val(),
            varh: $("#statusVar option:selected").val()
        };
        updateStatusMap(data);
    });

    $("#dispallaws").change(function() {
        leaflet_Map_AWSStatus(AWS_DATA);
    });

    $("#downLeafletMap").on("click", () => {
        var key_title;
        var key_col;
        if (AWS_DATA.status == 'no-data') {
            var key_draw = false;
            var filename = "aws_status";
        } else {
            var key_draw = true;
            key_title = 'Availability (%)';
            key_col = AWS_DATA.key;
            var sel = $("#statusVar option:selected").text();
            sel = sel.replace(/\@/g, '');
            sel = sel.replace(/ /g, "-");
            var filename = 'aws_status_' + sel + '_' + AWS_DATA.time;
        }
        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

// 
function updateStatusMap(data) {
    $.ajax({
        dataType: "json",
        url: '/dispAWSStatusMap',
        data: data,
        timeout: 30000,
        success: (json) => {
            $('#timeStatus').empty();
            $('#lastUpdate').empty();
            $('#timeStatus').html(json.time);
            $('#lastUpdate').html(json.update);

            AWS_DATA = json;
            leaflet_Map_AWSStatus(json);
        },
        beforeSend: () => {
            if (MAP_BE != undefined) {
                MAP_BE.closePopup();
                MAP_BE.spin(true, spinner_opts);
            }
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                flashMessage("Take too much time to render, refresh your web browser", "error")
            } else {
                displayAjaxError(request, status, error);
            }
        }
    }).always(() => {
        MAP_BE.spin(false);
    });
}

// 
function leaflet_Map_AWSStatus(json) {
    removeLayerMarkers(MAP_BE);
    removeControlSearch();
    MAP_BE.invalidateSize();
    MAP_BE.closePopup();

    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";

    var searchLayer = new L.LayerGroup();

    $.each(json.data, (ix) => {
        var don = json.data[ix];
        if (don.data == undefined) {
            return;
        }

        if ($("#dispallaws").is(':not(:checked)') && don.data === 0) {
            return;
        }

        var disp_val = Math.round(don.data);

        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");
        $('<span>').addClass("pin-label")
            .html(disp_val)
            .appendTo(divIco);
        divIconHtml.append(divIco);

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.name + '<br>' + '<b>NETWORK : </b>' + don.network;

        var colN = ['AWS ID', 'AWS Name', 'AWS Network', 'Start Data', 'End Data', 'Availability'];
        var colP = ['id', 'name', 'network', 'startdate', 'enddate', 'data'];
        var contenu = '';
        for (var i = 0; i < colP.length; i++) {
            tmp = '<b>' + colN[i] + ' : </b>' + don[colP[i]];
            if (i == colP.length - 1) {
                tmp = tmp + '% for past ' + $("#lastAvail option:selected").text();
            } else {
                tmp = tmp + '<br>';
            }
            contenu = contenu + tmp;
        }

        var icon = L.divIcon({
            iconSize: null,
            iconAnchor: new L.Point(15, 30),
            popupAnchor: new L.Point(0, -15),
            className: 'pindivIcon' + ix,
            html: divIconHtml.prop('outerHTML')
        });

        var lalo = new L.LatLng(don.latitude, don.longitude);
        var marker = L.marker(lalo, { icon: icon, title: don.name + ' ' + don.network })
            .bindTooltip(txttip, text2Op)
            .addTo(MAP_BE);
        marker.bindPopup(contenu);

        // 
        searchLayer.addLayer(marker);
        MARKERS_BE.push(marker);

        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[ix]);

        marker.on('click', (e) => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
            var goPin = '.pindivIcon' + ix;
            var thisPin = goPin + ' .pin';
            $(thisPin).css("background-color", 'red');
            lastIconActive = goPin;
        });

        marker.getPopup().on('remove', () => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
        });
    });
    // 
    MAP_BE.on('click', (e) => {
        if (lastIconActive != "") {
            var activePin = lastIconActive + ' .pin';
            $(activePin).css("background-color", '#3071a9');
        }
    });

    addAWSControlSearch(searchLayer, position = 'topright');

    //
    $('#colKeyMapVar').empty();
    var kolKey = json.key;
    if (kolKey == undefined) {
        var txt = $("#statusVar option:selected").html();
        var popup = L.popup()
            .setLatLng([MTO_INIT.mapCenterLAT, MTO_INIT.mapCenterLON])
            .setContent("No available data for " + txt)
            .openOn(MAP_BE);
        return false;
    }

    // 
    kolKey.title = "Availability (%)";

    $('#colKeyMapVar').append(createColorKeyH(kolKey));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '55px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);
}