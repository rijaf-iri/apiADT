function setIRIDLPrecipTempResolution(time_step) {
    var timestep_txt = ['Daily', 'Dekadal', 'Monthly'];
    var timestep_val = ['daily', 'dekadal', 'monthly'];
    for (var i = 0; i < timestep_txt.length; ++i) {
        $('#timestepDispTS').append(
            $("<option>").text(timestep_txt[i] + " data").val(timestep_val[i])
        );
    }
    setTimeout(() => {
        $('#timestepDispTS').val(time_step);
    }, 100);
}

function setIRIDLPrecipTimeSelect() {
    var label = ['Year', 'Mon', 'Dek', 'Day'];
    var pname = ['year', 'month', 'dekad', 'day'];
    // 
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //
    $('#pentad1, #pentad2, #pentad3').hide();
    $('#hour1, #hour2, #hour3').hide();
    $('#minute1, #minute2, #minute3').hide();

    // 
    var daty = new Date();
    daty.setMonth(daty.getMonth() - 1);
    var lastDay = getDaysInMonth(daty.getFullYear(), daty.getMonth() + 1);
    daty.setDate(lastDay);

    // 
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 1981; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
    //
    //
    for (var i = 1; i <= 3; ++i) {
        $('#dekad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#dekad3").val(daty.getDekad());

    $("#timestepDispTS").change(function() {
        setTimeout(() => {
            var timestep = $(this).val();
            if (timestep == "daily") {
                $(".aws-select-time td:nth-child(3)").hide();
                $(".aws-select-time td:nth-child(4)").show();
            } else if (timestep == "dekadal") {
                $(".aws-select-time td:nth-child(3)").show();
                $(".aws-select-time td:nth-child(4)").hide();
            } else {
                $(".aws-select-time td:nth-child(3)").hide();
                $(".aws-select-time td:nth-child(4)").hide();
            }
        }, 100);
    });
    $("#timestepDispTS").trigger("change");
}

function setIRIDLPrecipSource() {
    var rfe = DATA_RFE.product.map(x => [x.id, x.name]);
    for (var i = 0; i < rfe.length; ++i) {
        $('#rfeProducts').append(
            $("<option>").text(rfe[i][1]).val(rfe[i][0])
        );
    }
}

function iridlCreateURL(data) {
    var is = DATA_RFE.product.map(x => x.id).indexOf(data.source);
    var info_src = DATA_RFE.product[is];
    var info_tmp = info_src[data.time_step];
    if (info_tmp == undefined) {
        var msg = "No " + data.time_step + " data for " + info_src.name;
        flashMessage(msg, "error");
        return false;
    }

    var info_url = [];
    var base_url = [DATA_RFE.url, info_tmp.source];
    info_url = info_url.concat(base_url);
    var lon = [info_src.lon, DATA_RFE.min_lon, DATA_RFE.max_lon, 'RANGE'];
    info_url = info_url.concat(lon);
    var lat = [info_src.lat, DATA_RFE.min_lat, DATA_RFE.max_lat, 'RANGE'];
    info_url = info_url.concat(lat);

    var mois = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    var daty = data.date.split('-');
    var mon = mois[Number(daty[1]) - 1];
    var mmyy = [mon, daty[0]];
    if (data.time_step === 'daily') {
        var adate = [daty[2]].concat(mmyy);
    } else if (data.time_step === 'dekadal') {
        if (daty[2] == '1') {
            var dek = '1-10';
        } else if (daty[2] == '2') {
            var dek = '11-20';
        } else {
            var dek = '21-' + getDaysInMonth(daty[0], daty[1]);
        }
        var adate = [dek].concat(mmyy);
    } else {
        var adate = mmyy;
    }
    var fdate = "(" + adate.join('%20') + ")";
    var daty = [info_src.time, fdate, 'VALUE'];
    info_url = info_url.concat(daty);

    var sp = ["%5B" + info_src.lon, info_src.lat + "%5D"];
    info_url = info_url.concat(sp);

    info_url.push("data.tiff");

    // 
    var out = {};
    out.url = info_url.join('/');
    out.map_title = info_src.name + ' ' +
        data.time_step + ' precipitation data';
    var tmp = data.time_step.charAt(0).toUpperCase() + data.time_step.slice(1);
    out.ckey_title = tmp + " Precipitation (" + info_tmp.units + ")";
    out.min = info_tmp.min;
    out.max = info_tmp.max;
    out.units = info_tmp.units;
    out.date = adate.join(' ');

    return out;
}