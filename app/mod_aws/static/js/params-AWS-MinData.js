function setAWSMinDataTime(backNbDay) {
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];

    var label3 = ['Year', 'Mon', 'Day', 'Hour'];
    var pname3 = ['year', 'month', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label3, pname3, true));
    //
    $('#dekad1, #dekad2, #dekad3, #pentad1, #pentad2, #pentad3').hide();
    $('#minute3').hide();

    $("#timestepDispTS").val("minute");
    $("#timestepDispTS").hide();

    // 
    var daty = TS_DATE;
    // var daty = changeTimeZone(TS_DATE, MTO_INIT.timeZone);
    var lastDaty = new Date(+daty);
    lastDaty.setDate(lastDaty.getDate() - backNbDay);

    //
    for (var i = 0; i < 60; i += 5) {
        var mn = i;
        if (i < 10) {
            mn = "0" + i;
        }
        $('#minute1, #minute2').append(
            $("<option>").text(mn).val(mn)
        );
    }
    var vmin = daty.getMinutes();
    vmin = vmin - vmin % 5;
    $("#minute1").val("00");
    $("#minute2").val((vmin < 10 ? "0" : "") + vmin);

    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2, #hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    var vhour0 = lastDaty.getHours();
    $("#hour1").val((vhour0 < 10 ? "0" : "") + vhour0);
    var vhour = daty.getHours();
    $("#hour2, #hour3").val((vhour < 10 ? "0" : "") + vhour);
    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2, #day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday0 = lastDaty.getDate();
    $("#day1").val((vday0 < 10 ? "0" : "") + vday0);
    var vday = daty.getDate();
    $("#day2, #day3").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2, #month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon0 = lastDaty.getMonth() + 1;
    $("#month1").val((vmon0 < 10 ? "0" : "") + vmon0);
    var vmon = daty.getMonth() + 1;
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = MTO_INIT.firstYear; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    var thisYear0 = lastDaty.getFullYear();
    $("#year1").val(thisYear0);
    $("#year2, #year3").val(thisYear);
}

//////////

function plot_TS_dataMinAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/chartMinAWSData',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 60000,
        dataType: "json",
        success: (json) => {
            if (json.opts.status != 'plot') {
                flashMessage(json.opts.status, "error");
                return false;
            }
            highcharts_TS_dataAWS(json, "minutes");
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

//////////

function plot_Map_dataHourAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/mapHourAWSData',
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
            var pars = $("#awsSpVar option:selected").val();
            var stat = $("#awsSpStat option:selected").val();
            leaflet_Map_dataAWS(json, pars, stat);
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

//////////