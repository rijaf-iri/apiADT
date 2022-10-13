function setAWSAccumulRainTime(backNbDay) {
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2', '#minute3').hide();
    $('#pentad1, #pentad2', '#pentad3').hide();
    $('#dekad1, #dekad2', '#dekad3').hide();

    //
    var daty = TS_DATE;
    // var daty = changeTimeZone(TS_DATE, MTO_INIT.timeZone);
    var pastYear = new Date(+daty);
    pastYear.setDate(pastYear.getDate() - backNbDay);
    var initHour = dateFormat(pastYear, "HH");
    var initDay = dateFormat(pastYear, "dd");
    var initMon = dateFormat(pastYear, "mm");
    var initYear = dateFormat(pastYear, "yyyy");

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
    //
    $("#hour1").val(initHour);
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
    $("#day1").val(initDay);
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
    $("#month1").val(initMon);
    var vmon = daty.getMonth() + 1;
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = MTO_INIT.firstYear; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year1").val(initYear);
    $("#year2, #year3").val(thisYear);
    //
    $("#timestepDispTS").change(function() {
        if ($(this).val() == "hourly") {
            $(".aws-select-time td:last-child").show();
            $("#accumulTime").attr("max", "72");
        } else {
            $(".aws-select-time td:last-child").hide();
            $("#accumulTime").attr("max", "45");
        }
    });
    $("#timestepDispTS").trigger("change");
}

function setAWSAccumulRainSTN(time_step, backNbDay) {
    $.getJSON('/readAWSMetadata', { 'time_step': time_step }, function(json) {
        var obj_key = Object.keys(json.data);
        var precip = obj_key.map(key => json.data[key].params.map(x => x.code).includes(5));
        var data = {};
        for (var j = 0; j < obj_key.length; j++) {
            if (precip[j]) {
                data[obj_key[j]] = json.data[obj_key[j]];
            }
        }
        json.data = data;

        AWS_JSON = json;
        json_select = formatJSONMetadataToSelect2(json.data);

        setAWSDataSelect2(json_select, MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        AWS_INFO = getAWSInfos(MTO_INIT.initNET + '_' + MTO_INIT.initAWS);

        setTimeout(() => {
            var time_step = $("#timestepDispTS option:selected").val();

            // Initialize chart
            var obj = checkDateTimeRange();
            if (!obj) {
                return false;
            }
            var vrange = startEndDateTime(time_step, obj);
            var data = {
                "net_aws": $("#stationDispAWS option:selected").val(),
                "accumul": $("#accumulTime").val(),
                "time_step": time_step,
                "start": vrange.start,
                "end": vrange.end,
                "user": DATA_USERS
            };
            plot_TS_RainAccumulAWS(data);

            // Initialize map
            var daty = getDateTimeMapData();
            var data = {
                "time_step": time_step,
                "date": daty,
                "user": DATA_USERS
            };

            plot_Map_RainAccumulAWS(data);
        }, 1000);
    });
}