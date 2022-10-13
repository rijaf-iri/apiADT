function setAWSWindDataTime(backNbDay) {
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));

    $('#dekad1, #dekad2, #pentad1, #pentad2').hide();

    //
    var daty = TS_DATE;
    // var daty = changeTimeZone(TS_DATE, MTO_INIT.timeZone);
    var pastYear = new Date(+daty);
    pastYear.setDate(pastYear.getDate() - backNbDay);
    var initMin = dateFormat(pastYear, "MM");
    var initHour = dateFormat(pastYear, "HH");
    var initDay = dateFormat(pastYear, "dd");
    var initMon = dateFormat(pastYear, "mm");
    var initYear = dateFormat(pastYear, "yyyy");

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
    $("#minute1").val(initMin);
    var vmin = daty.getMinutes();
    vmin = vmin - vmin % 5;
    $("#minute2").val((vmin < 10 ? "0" : "") + vmin);

    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    $("#hour1").val(initHour);
    var vhour = daty.getHours();
    $("#hour2").val((vhour < 10 ? "0" : "") + vhour);
    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2').append(
            $("<option>").text(dy).val(dy)
        );
    }
    $("#day1").val(initDay);
    var vday = daty.getDate();
    $("#day2").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2').append(
            $("<option>").text(mo).val(mo)
        );
    }
    $("#month1").val(initMon);
    var vmon = daty.getMonth() + 1;
    $("#month2").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = MTO_INIT.firstYear; yr <= thisYear; ++yr) {
        $('#year1, #year2').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year1").val(initYear);
    $("#year2").val(thisYear);
    //

    $("#timestepDispTS").change(function() {
        if ($(this).val() == "hourly") {
            $(".aws-select-time td:last-child").hide();
        } else {
            $(".aws-select-time td:last-child").show();
        }
    });
    $("#timestepDispTS").trigger("change");
}

function setAWSWindHeigt(hgtWSWD) {
    $('#windHeight').empty();
    var data = { time_step: $("#timestepDispTS option:selected").val() };
    $.getJSON('/getWindHeight', data, (json) => {
        if (json.length == 0) {
            return false;
        }

        var hgt_s_d = [];
        $.each(json, function() {
            var pos = (this.wnd_idx == 0 ? "" : "(Anemometer:" + this.wnd_idx + ")");
            var text = this.wnd_hgt + " meter above ground " + pos;
            var val = this.ws_val + "_" + this.wd_val;
            hgt_s_d.push(val);
            $('#windHeight').append(
                $("<option>").text(text).val(val)
            );
        });
        setTimeout(() => {
            if (hgt_s_d.includes(hgtWSWD)) {
                $('#windHeight option[value=' + hgtWSWD + ']').attr('selected', true);
            }
        }, 50);
    });
}


function setAWSWindMetadata(time_step, height) {
    $('#stationDispAWS').empty();
    var data = {
        time_step: time_step,
        height: height
    }

    $.getJSON('/readWindMetadata', data, (json) => {
        if (json.length == 0) {
            return false;
        }
        AWS_JSON = json;

        json_select = formatJSONMetadataToSelect2(json.data);

        setAWSDataSelect2(json_select, MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        AWS_INFO = getAWSInfos(MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
    });
}

function getAWSWindParams() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    //
    var time_step = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(time_step, obj);
    //
    var data = {
        "net_aws": $("#stationDispAWS option:selected").val(),
        "height": $("#windHeight option:selected").val(),
        "time_step": time_step,
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    return data;
}