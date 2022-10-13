// EXPORT_DATA = true;
//
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
            $("#downAWSMinAll").hide();
            $("#downAWSMinOne").hide();
        } else {
            $("#downAWSMinAll").show();
            $("#downAWSMinOne").show();
        }
    }
});

// 
$("#downAWSMinAll").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var vrange = startEndDateTime('minute', obj);
    var data = {
        "net_aws": $("#stationDispAWS option:selected").val(),
        "start": vrange.start,
        "end": vrange.end,
        "user": DATA_USERS
    };

    $.ajax({
        type: 'POST',
        url: '/downAWSMinDataCSV',
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
$("#downAWSMinOne").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var vrange = startEndDateTime('minute', obj);
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

    $.ajax({
        type: 'POST',
        url: '/downAWSMinOneCSV',
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