$(document).ready(() => {
    var back_nb_Day = 30;
    setAWSMinDataTime(back_nb_Day);

    // 
    $.getJSON('/readAWSMetadata', { 'time_step': 'minutes' }, function(json) {
        AWS_JSON = json;
        json_select = formatJSONMetadataToSelect2(json.data);

        setAWSDataSelect2(json_select, MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        AWS_INFO = getAWSInfos(MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        setAWSVariableSelect(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        setAWSParamSelect(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        displayMetadata();

        setTimeout(() => {
            var today = new Date(+TS_DATE);
            // var today = changeTimeZone(new Date(+TS_DATE), MTO_INIT.timeZone);

            var daty2 = dateFormat(today, "yyyy-mm-dd-HH-MM");
            today.setDate(today.getDate() - back_nb_Day);
            var daty1 = dateFormat(today, "yyyy-mm-dd-HH-MM");

            var data0 = {
                "net_aws": $("#stationDispAWS option:selected").val(),
                "var_hgt": $("#awsObsVar option:selected").val(),
                "stat": $("#awsParams option:selected").val(),
                "start": daty1,
                "end": daty2,
                "plotrange": 0,
                "user": DATA_USERS
            };

            // Initialize chart
            plot_TS_dataMinAWS(data0);
        }, 1000);
    });

    //
    $("#stationDispAWS").on("change", () => {
        var net_aws = $("#stationDispAWS option:selected").val();
        AWS_INFO = getAWSInfos(net_aws);
        setAWSVariableSelect(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect(var_height);
        displayMetadata();
    });

    $('#arearange').prop('checked', false);
    $('#rangepars').hide();

    $("#stationDispAWS, #awsObsVar").on("change", () => {
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect(var_height);
        setAWSRangeStats(var_height);
    });

    ///// 

    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var vrange = startEndDateTime('minutes', obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;

        var data = {
            "net_aws": $("#stationDispAWS option:selected").val(),
            "var_hgt": $("#awsObsVar option:selected").val(),
            "stat": $("#awsParams option:selected").val(),
            "start": vrange.start,
            "end": vrange.end,
            "plotrange": plotrange,
            "user": DATA_USERS
        };

        plot_TS_dataMinAWS(data);
    });

    ///////////////

    // Initialize map
    createLeafletTileLayer('mapAWSVars');
    var baseMapList = ["openstreetmap", "mapboxsatellitestreets"];
    addMapControlLayers(baseMapList, withImagePNG = false);

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    addDateToMap();

    ///////////////

    var AWS_SPVARS;
    $.getJSON('/readAWSSpatialVars', { 'time_step': 'hourly' }, (json) => {
        if (json.status == 'no') {
            flashMessage(json.msg, "error");
            return false;
        }
        AWS_SPVARS = json.vars;
        setAWSVarMapSelect(json.vars);
        setAWSStatsMapSelect(json.vars, MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        setTimeout(() => {
            var var_hgt = MTO_INIT.initVAR + '_' + MTO_INIT.initHGT;
            var stat = MTO_INIT.initSTAT;
            $("#awsSpVar").val(var_hgt);
            $("#awsSpStat").val(stat);

            // Initialize map
            var time_hour = formatDateMap1Hour();
            var data = {
                "time": time_hour + '-00',
                "user": DATA_USERS
            };
            plot_Map_dataHourAWS(data);
        }, 1000);
    });

    ///// 
    $("#awsSpVar").on("change", () => {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        setAWSStatsMapSelect(AWS_SPVARS, var_hgt);
        setTimeout(() => {
            var stat = $("#awsSpStat option:selected").val();
            leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat);
        }, 100);
    });

    $("#awsSpStat").on("change", () => {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat);
    });

    $('#dispuseraws').change(function() {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat);
    });

    ///////////////

    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var time_hour = formatDateMap1Hour();
        var data = {
            "time": time_hour + '-00',
            "user": DATA_USERS
        };
        plot_Map_dataHourAWS(data);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataHour(1);
        var time_hour = formatDateMap1Hour();
        var data = {
            "time": time_hour + '-00',
            "user": DATA_USERS
        };
        plot_Map_dataHourAWS(data);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataHour(-1);
        var time_hour = formatDateMap1Hour();
        var data = {
            "time": time_hour + '-00',
            "user": DATA_USERS
        };
        plot_Map_dataHourAWS(data);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var key_title;
        var key_col;
        if (AWS_DATA.status != "ok") {
            var key_draw = false;
            var filename = "aws_1hr_data";
        } else {
            var key_draw = true;
            var var_hgt = $("#awsSpVar option:selected").val();
            var stat = $("#awsSpStat option:selected").val();
            var vhs = var_hgt + '_' + stat;
            key_title = AWS_DATA.key[vhs].title;
            key_col = AWS_DATA.key[vhs];
            var daty = formatDateMap1Hour();

            var ix = AWS_DATA.pars.map(x => x.code + '_' + x.height + '_' + x.stat_code).indexOf(vhs);
            var file_name = AWS_DATA.pars[ix].name + '_' + AWS_DATA.pars[ix].height + 'm_' + AWS_DATA.pars[ix].stat_name;
            var filename = file_name + "_" + daty;
            filename = filename.replace(/ /g, "-");
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});