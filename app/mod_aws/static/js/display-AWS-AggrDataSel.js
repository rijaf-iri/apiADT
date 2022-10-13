$(document).ready(() => {
    var time_step0 = 'daily';
    var back_nb_Day = 365;

    setAWSAggrDataTimeStep(time_step0);
    setAWSAggrDataTime(back_nb_Day);
    setAWSAggrVARSSTN(time_step0);
    setAWSAggrMAPVARS_Sel(time_step0);

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
            setAWSAggrVARSSTN(time_step);
            setAWSAggrMAPVARS_Sel(time_step);
            lastTstep = currentTstep;
        }
    });

    $("#awsObsVar").on("change", () => {
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(var_height);
    });

    $("#selectAWSPlotTS").on("click", () => {
        $('#selectAWSModalTS').empty();
        var var_height = $("#awsObsVar option:selected").val();
        var stat = $("#awsParams option:selected").val();
        var vhs = var_height + '_' + stat;

        var coords = AWS_JSON.coords.filter(x => x[vhs]);
        var json_select = formatJSONCoordsToSelect2(coords);

        setTimeout(() => {
            initializeAWS2DispTS(coords);
            var divmodal = selectAWS2DispTS(json_select, selAWSTS);
            $('#selectAWSModalTS').append(divmodal);
            $('#selectAWSModalTS').modal('show');
            $('.select2-search__field')
                .attr('placeholder', 'Select Station ...');
            $('.select2-search__field').css('width', '100%');
        }, 100);
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

        var data = {
            "time_step": time_step,
            "net_aws": selAWSTS,
            "var_hgt": $("#awsObsVar option:selected").val(),
            "stat": $("#awsParams option:selected").val(),
            "start": vrange.start,
            "end": vrange.end,
            "user": DATA_USERS
        };

        plot_TS_dataAggrAWS_Sel(data);
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

    $("#selectAWSPlotSP").on("click", () => {
        $('#selectAWSModalSP').empty();
        var var_height = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        var vhs = var_height + '_' + stat;

        var kolor = AWS_DATA.color[vhs];
        if (kolor === undefined) {
            flash_message_sp_aws_sel(vhs);
            return false;
        }
        var idx = [];
        for (var i = 0; i < kolor.length; ++i) {
            if (kolor[i] !== null) {
                idx.push(i);
            }
        }
        if (idx.length === 0) {
            flash_message_sp_aws_sel(vhs);
            return false;
        }

        var coords = idx.map(i => AWS_DATA.data[i]);
        var json_select = formatJSONCoordsToSelect2(coords);

        setTimeout(() => {
            var divmodal = selectAWS2DispSP(json_select, var_height, stat, selAWSSP);
            $('#selectAWSModalSP').append(divmodal);
            $('#selectAWSModalSP').modal('show');
        }, 100);
    });

    ///////////////

    $("#awsSpVar").on("change", () => {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        // selAWSSP = [];
        setAWSStatsMapSelect(AWS_SPVARS, var_hgt);
        setTimeout(() => {
            var stat = $("#awsSpStat option:selected").val();
            leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat, selAWSSP);
        }, 100);
    });

    $("#awsSpStat").on("change", () => {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        // selAWSSP = [];
        leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat, selAWSSP);
    });

    $('#dispuseraws').change(function() {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat, selAWSSP);
    });

    $('#dispselaws').change(function() {
        $('a[href="#dispawssp"]').click();
        // 
        var var_hgt = $("#awsSpVar option:selected").val();
        var stat = $("#awsSpStat option:selected").val();
        leaflet_Map_dataAWS(AWS_DATA, var_hgt, stat, selAWSSP);
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
        plot_Map_dataAggrAWS_Sel(data);
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
        plot_Map_dataAggrAWS_Sel(data);
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
        plot_Map_dataAggrAWS_Sel(data);
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

function flash_message_sp_aws_sel(vhs) {
    var ix = AWS_DATA.pars
        .map(x => x.code + '_' + x.height + '_' + x.stat_code)
        .indexOf(vhs);
    var vr = AWS_DATA.pars[ix];
    var msg = 'No data for ' + vr.long_name + ' ' +
        vr.name + ' at ' + vr.height + 'm';
    flashMessage(msg, "warning");
}