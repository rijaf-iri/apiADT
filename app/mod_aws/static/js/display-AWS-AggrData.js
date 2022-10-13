$(document).ready(() => {
    var time_step0 = 'daily';
    var back_nb_Day = 365;

    setAWSAggrDataTimeStep(time_step0);
    setAWSAggrDataTime(back_nb_Day);
    setAWSAggrSTNVARS(time_step0);
    setAWSAggrMAPVARS(time_step0);

    var lastTstep = 1;
    $("#timestepDispTS").change(function() {
        var time_step = $("#timestepDispTS option:selected").val();
        var aggr_data = ['daily', 'pentad', 'dekadal', 'monthly'];
        if (aggr_data.includes(time_step)) {
            var currentTstep = 1;
        } else {
            var currentTstep = 0;
        }
        if (lastTstep != currentTstep) {
            setAWSAggrSTNVARS(time_step);
            setAWSAggrMAPVARS(time_step);
            lastTstep = currentTstep;
        }
    });

    $("#stationDispAWS").on("change", () => {
        var net_aws = $("#stationDispAWS option:selected").val();
        var var_hgt0 = MTO_INIT.initVAR + '_' + MTO_INIT.initHGT;
        AWS_INFO = getAWSInfos(net_aws);
        setAWSVariableSelect(var_hgt0);
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect(var_height);
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
        var time_step = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(time_step, obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;

        var data = {
            "time_step": time_step,
            "net_aws": $("#stationDispAWS option:selected").val(),
            "var_hgt": $("#awsObsVar option:selected").val(),
            "stat": $("#awsParams option:selected").val(),
            "start": vrange.start,
            "end": vrange.end,
            "plotrange": plotrange,
            "user": DATA_USERS
        };

        plot_TS_dataAggrAWS(data);
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
        var time_step = $("#timestepDispTS option:selected").val();
        var daty = getDateTimeMapData();
        var data = {
            "time_step": time_step,
            "date": daty,
            "user": DATA_USERS
        };
        plot_Map_dataAggrAWS(data);
    });
    //
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
        plot_Map_dataAggrAWS(data);
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
        plot_Map_dataAggrAWS(data);
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