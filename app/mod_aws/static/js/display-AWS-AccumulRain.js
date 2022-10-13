$(document).ready(() => {

    var time_step0 = 'hourly';
    var back_nb_Day = 90;

    setAWSAccumulRainTime(back_nb_Day);
    setAWSAccumulRainSTN(time_step0, back_nb_Day);

    ////////////

    // Initialize map
    createLeafletTileLayer('mapAWSVars');
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets"];
    addMapControlLayers(baseMapList, withImagePNG = false);

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    // addDateToMap();

    ////////////

    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var time_step = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(time_step, obj);
        //
        var data = {
            "net_aws": $("#stationDispAWS option:selected").val(),
            "accumul": $("#accumulTime").val(),
            "time_step": time_step,
            "start": vrange.start,
            "end": vrange.end,
            "user": DATA_USERS
        };

        plot_TS_RainAccumulAWS(data);
    });

    ///////////////

    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var time_step = $("#timestepDispTS option:selected").val();
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "user": DATA_USERS
        };

        plot_Map_RainAccumulAWS(data);
    });

    ///////////////

    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var time_step = $("#timestepDispTS option:selected").val();
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "user": DATA_USERS
        };

        plot_Map_RainAccumulAWS(data);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var time_step = $("#timestepDispTS option:selected").val();
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "user": DATA_USERS
        };

        plot_Map_RainAccumulAWS(data);
    });

    ///////////////

    $("#downLeafletMap").on("click", () => {
        // var json = AWS_DATA;
        // var key_title;
        // var key_col;
        // if (json.status == "no-data") {
        //     var key_draw = false;
        //     var filename = "rain_accumulation";
        // } else {
        //     var key_draw = true;
        //     key_title = 'Rainfall Accumulation (mm)';
        //     key_col = json.key;

        //     var tstep = $("#timestepDispTS option:selected").text();
        //     var accumul = $("#accumulTime").val();
        //     var daty = getDateTimeMapData();
        //     var filename = "rain_accumul_" + accumul + "-" + tstep + "_" + daty;
        // }

        // saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

function plot_TS_RainAccumulAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/chartRainAccumul',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            if (json.opts.status != 'plot') {
                flashMessage(json.opts.status, "error");
                return false;
            }
            // highcharts_TS_RainAccumul(json);
            // // var time_step = $("#timestepDispTS option:selected").val();
            // // highcharts_TS_dataAWS(json, time_step);
        },
        beforeSend: () => {
            $("#plotAWSGraph .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                var msg = "Take too much time to render, " +
                    "select a shorter time range or " +
                    "refresh your web browser";
                flashMessage(msg, "error");
            } else {
                displayAjaxError(request, status, error);
            }
        }
    }).always(() => {
        $("#plotAWSGraph .glyphicon-refresh").hide();
    });

}

function plot_Map_RainAccumulAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/mapRainAccumul',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            AWS_DATA = json;

            if (json.status != 'ok') {
                flashMessage(json.msg, "error");
                return false;
            }
            // leaflet_Map_RainAccumul(json);
            // // var pars = $("#awsSpVar option:selected").val();
            // // var stat = $("#awsSpStat option:selected").val();
            // // leaflet_Map_dataAWS(json, pars, stat);
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