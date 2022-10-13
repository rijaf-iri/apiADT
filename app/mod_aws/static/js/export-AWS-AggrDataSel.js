$("#downAWSAggrSel").on("click", () => {
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

    $.ajax({
        type: 'POST',
        url: '/downAWSAggrDataSelCSV',
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
        "net_aws": selAWSTS,
        "var_hgt": $("#awsObsVar option:selected").val(),
        "stat": $("#awsParams option:selected").val(),
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    display_Table_dataAggrAWS_Sel(data);
});

//////////

function display_Table_dataAggrAWS_Sel(data) {
    $.ajax({
        type: 'POST',
        url: '/tableAggrAWSDataSel',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            $('.jsonTable').remove();
            if (json.out != 'ok') {
                $.each(json.status, function() {
                    flashMessage(this.msg, this.type);
                });
                if (json.out == 'no') {
                    return false;
                }
            }

            table_SelStn_dataAWS(json);
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

function table_SelStn_dataAWS(json) {
    var colHeader = Object.keys(json.data[0]);
    var colNb = colHeader.length;
    var rowNb = json.data.length;

    var table = $('<table>')
        .addClass('jsonTable')
        .attr('id', 'jsonTable');

    var rowh = $('<tr>');
    for (var i = 0; i < colNb; i++) {
        var disp = (i === 0) ? "NAME" : colHeader[i];
        var col = $('<th>').text(disp);
        rowh.append(col);
    }
    table.append(rowh);

    for (var i = 0; i < rowNb; i++) {
        var row = $('<tr>');
        for (var j = 0; j < colNb; j++) {
            if (i < 2) {
                var lh = $('<th>');
            } else {
                var lh = $('<td>');
            }
            var col = lh.text(json.data[i][colHeader[j]]);
            row.append(col);
        }
        table.append(row);
    }

    $('#idTable').append(table);
}