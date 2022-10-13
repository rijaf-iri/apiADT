function setAWSAggrSTNVARS(time_step) {
    var aggr_data = ['pentad', 'dekadal', 'monthly'];
    if (aggr_data.includes(time_step)) {
        time_step = 'daily';
    }

    $.getJSON('/readAWSMetadata', { 'time_step': time_step }, (json) => {
        AWS_JSON = json;
        json_select = formatJSONMetadataToSelect2(json.data);

        setAWSDataSelect2(json_select, MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        AWS_INFO = getAWSInfos(MTO_INIT.initNET + '_' + MTO_INIT.initAWS);
        setAWSVariableSelect(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        setAWSParamSelect(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        setAWSRangeStats(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);

        setTimeout(() => {
            var obj = checkDateTimeRange();
            if (!obj) {
                return false;
            }
            var time_step = $("#timestepDispTS option:selected").val();
            var vrange = startEndDateTime(time_step, obj);
            var daty1 = vrange.start;
            var daty2 = vrange.end;

            var data = {
                "time_step": time_step,
                "net_aws": $("#stationDispAWS option:selected").val(),
                "var_hgt": $("#awsObsVar option:selected").val(),
                "stat": $("#awsParams option:selected").val(),
                "start": daty1,
                "end": daty2,
                "plotrange": 0,
                "user": DATA_USERS
            };

            // Initialize chart
            plot_TS_dataAggrAWS(data);
        }, 1000);
    });
}

///////////////

var AWS_SPVARS;

function setAWSAggrMAPVARS(time_step) {
    var aggr_data = ['pentad', 'dekadal', 'monthly'];
    if (aggr_data.includes(time_step)) {
        time_step = 'daily';
    }

    $.getJSON('/readAWSSpatialVars', { 'time_step': time_step }, (json) => {
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
            var time_step = $("#timestepDispTS option:selected").val();
            var daty = getDateTimeMapData();
            var data = {
                "time_step": time_step,
                "date": daty,
                "user": DATA_USERS
            };
            plot_Map_dataAggrAWS(data);
        }, 1000);
    });
}

///////////////

function plot_TS_dataAggrAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/chartAggrAWSData',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 60000,
        dataType: "json",
        success: (json) => {
            if (json.opts.status != 'plot') {
                flashMessage(json.opts.status, "error");
                return false;
            }
            var time_step = $("#timestepDispTS option:selected").val();
            highcharts_TS_dataAWS(json, time_step);
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

function plot_Map_dataAggrAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/mapAggrAWSData',
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