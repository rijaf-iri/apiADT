var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

var user_aws_list = [];
if (DATA_USERS.userlevel === 2) {
    user_aws_list = DATA_USERS.awslist.aws.map(x => x.network_code + '_' + x.aws_id);
}

function addDownloadCSVMenu() {
    var downData = ['downloadCSV', 'downloadXLS'];
    var aws = $("#stationDispAWS option:selected").val();
    if (user_aws_list.indexOf(aws) === -1) {
        for (var v = 0; v < downData.length; v++) {
            for (var i = chartButtonMenuItems.length - 1; i >= 0; i--) {
                if (chartButtonMenuItems[i] === downData[v]) {
                    chartButtonMenuItems.splice(i, 1);
                }
            }
        }
    } else {
        for (var v = 0; v < downData.length; v++) {
            if (chartButtonMenuItems.indexOf(downData[v]) === -1) {
                chartButtonMenuItems.push(downData[v]);
            }
        }
    }
}

// 
$('#stationDispAWS').on("change", () => {
    if (DATA_USERS.userlevel === 2 && DATA_USERS.useraction === 0) {
        addDownloadCSVMenu();
        // 
        var aws = $("#stationDispAWS option:selected").val();
        if (user_aws_list.indexOf(aws) === -1) {
            $("#downAWSAggrAll").hide();
            $("#downAWSAggrOne").hide();
        } else {
            $("#downAWSAggrAll").show();
            $("#downAWSAggrOne").show();
        }
    }
});

// 
$("#downAWSAggrOne").on("click", () => {
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

    $.ajax({
        type: 'POST',
        url: '/downAWSAggrOneCSV',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 20000,
        dataType: "json",
        success: (json) => {
            var blob = new Blob([json.csv_data], { type: 'text/plain' });
            createDownloadableLink(blob, json.filename);
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                var msg = "Take too much time to download";
                flashMessage(msg, "error");
            } else {
                displayAjaxError(request, status, error);
            }
        }
    });
});

// 
$("#downAWSAggrAll").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var time_step = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(time_step, obj);
    var data = {
        "time_step": time_step,
        "net_aws": $("#stationDispAWS option:selected").val(),
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    $.ajax({
        type: 'POST',
        url: '/downAWSAggrDataCSV',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 20000,
        dataType: "json",
        success: (json) => {
            var blob = new Blob([json.csv_data], { type: 'text/plain' });
            createDownloadableLink(blob, json.filename);
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                var msg = "Take too much time to download";
                flashMessage(msg, "error");
            } else {
                displayAjaxError(request, status, error);
            }
        }
    });
});

// 
$("#downAWSAggrCDT").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var time_step = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(time_step, obj);

    var data = {
        "time_step": time_step,
        "var_hgt": $("#awsObsVar option:selected").val(),
        "stat": $("#awsParams option:selected").val(),
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    $.ajax({
        type: 'POST',
        url: '/downAWSAggrCDTCSV',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 20000,
        dataType: "json",
        success: (json) => {
            var blob = new Blob([json.csv_data], { type: 'text/plain' });
            createDownloadableLink(blob, json.filename);
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                var msg = "Take too much time to download";
                flashMessage(msg, "error");
            } else {
                displayAjaxError(request, status, error);
            }
        }
    });
});

// 
$("#downAWSSp").on("click", () => {
    var user_data = AWS_DATA.data.filter(x => x.user_aws > 0);
    var vhs = AWS_DATA.pars.map(x => x.code + '_' + x.height + '_' + x.stat_code);
    var val = AWS_DATA.pars.map(x => x.name + ' (' + x.stat_name + ') at ' + x.height + 'm' + ' [units: ' + x.units + ']');

    var varinfo = {};
    for (var i = 0; i < vhs.length; i++) {
        varinfo[vhs[i]] = val[i];
    }
    var varfill = {};
    for (var prop in user_data[0]) {
        if (varinfo.hasOwnProperty(prop)) {
            varfill[prop] = varinfo[prop];
        } else {
            varfill[prop] = '';
        }
    }

    user_data = [varfill].concat(user_data);
    // user_data.push(varfill);

    var file_name = 'Observation_on' + '_' + AWS_DATA.date + '.csv';

    downloadJsonObjToCSV(user_data, file_name);
});

///////////////

$("#dispAWSTable").on("click", () => {
    $('a[href="#disptable"]').click();
    //
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var time_step = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(time_step, obj);

    var data = {
        "time_step": time_step,
        "net_aws": $("#stationDispAWS option:selected").val(),
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    display_Table_dataAggrAWS(data);
});

//////////

function display_Table_dataAggrAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/tableAggrAWSData',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            $('.jsonTable').remove();
            if (json.status != 'ok') {
                flashMessage(json.msg, "error");
                return false;
            }
            table_allVars_dataAWS(json);
        },
        beforeSend: () => {
            $("#dispAWSTable .glyphicon-refresh").show();
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
        $("#dispAWSTable .glyphicon-refresh").hide();
    });
}

function table_allVars_dataAWS(json) {
    var colHeader = Object.keys(json.data[0]);
    var colNb = colHeader.length;
    var rowNb = json.data.length;

    var table = $('<table>')
        .addClass('jsonTable')
        .attr('id', 'jsonTable');

    var rowv = $('<tr>');
    for (var i = 0; i < colNb; i++) {
        var col = $('<th>').text(json.var[i]);
        rowv.append(col);
    }
    table.append(rowv);

    var rowh = $('<tr>');
    for (var i = 0; i < colNb; i++) {
        var col = $('<th>').text(colHeader[i]);
        rowh.append(col);
    }
    table.append(rowh);

    for (var i = 0; i < rowNb; i++) {
        var row = $('<tr>');
        for (var j = 0; j < colNb; j++) {
            var col = $('<td>').text(json.data[i][colHeader[j]]);
            row.append(col);
        }
        table.append(row);
    }

    $('#idTable').append(table);
}