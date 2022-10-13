function setAWSDataSelect2(json, net_aws) {
    if (DATA_USERS.uid > 0) {
        if (DATA_USERS.userlevel == 2) {
            var textGrp = $("<optgroup>");
            textGrp.attr("label", "User Selected Stations");

            for (var i = 0; i < DATA_USERS.awslist.aws.length; ++i) {
                var aws_id = DATA_USERS.awslist.aws[i].network_code +
                    "_" + DATA_USERS.awslist.aws[i].aws_id;

                for (var j = 0; j < json.length; ++j) {
                    for (var l = 0; l < json[j].children.length; ++l) {
                        if (json[j].children[l].id != aws_id) {
                            continue;
                        } else {
                            var val = json[j].children[l].id;
                            var text = json[j].children[l].text;
                            textGrp.append($("<option>").val(val).text(text));
                        }
                    }
                }
            }
            $('#stationDispAWS').append(textGrp);

            var user_aws_id = DATA_USERS.awslist.aws.map(x => x.network_code + '_' + x.aws_id);
            json = $.grep(json, function(x) {
                var group = $.grep(x.children, function(y) {
                    if (!user_aws_id.includes(y.id)) {
                        return y;
                    }
                });
                x.children = group;
                return x;
            });
        }
    }

    $.each(json, function() {
        var textGrp = $("<optgroup>");
        textGrp.attr("label", this.text + ' AWS Network');
        for (var i = 0; i < this.children.length; ++i) {
            var val = this.children[i].id;
            var text = this.children[i].text;
            textGrp.append($("<option>").val(val).text(text));
        }
        $('#stationDispAWS').append(textGrp);
    });

    if (DATA_USERS.uid > 0 && DATA_USERS.userlevel === 2) {
        $("#stationDispAWS").val($("#stationDispAWS option:first").val());
    } else {
        var all_aws = json.map(x => x.children.map(y => y.id));
        all_aws = [].concat.apply([], all_aws);
        if (all_aws.includes(net_aws)) {
            $('#stationDispAWS option[value=' + net_aws + ']').attr('selected', true);
        } else {
            $("#stationDispAWS").val($("#stationDispAWS option:first").val());
        }
    }

    $('#stationDispAWS').select2({
        theme: "bootstrap",
        width: null,
        formatNoMatches: function() {
            return "No Station Found.";
        }
    });

    setTimeout(() => {
        var net_aws1 = $("#stationDispAWS").val();
        net_aws1 = net_aws1.split("_");
        MTO_INIT.initNET = Number(net_aws1[0]);
        MTO_INIT.initAWS = net_aws1[1];
    }, 100);
}

function getAWSInfos(net_aws) {
    return AWS_JSON.data[net_aws];
}

//
function setAWSVariableSelect(var_height0) {
    $('#awsObsVar').empty();
    var var_select = [];

    for (var i = 0; i < AWS_INFO.params.length; ++i) {
        var var_code = AWS_INFO.params[i].code;
        var var_name = AWS_INFO.params[i].name;
        var var_stat = AWS_INFO.stats.filter(x => x.var_code === var_code);
        var var_height = $.unique(var_stat.map(x => x.height));

        for (var j = 0; j < var_height.length; ++j) {
            var vartxt = var_name + " @ " + var_height[j] + "m";
            var varval = var_code + "_" + var_height[j];
            var_select.push(varval);

            $('#awsObsVar').append(
                $("<option>").text(vartxt).val(varval)
            );
        }
    }

    if (var_select.includes(var_height0)) {
        $('#awsObsVar option[value=' + var_height0 + ']').attr('selected', true);
    }
}

function setAWSParamSelect(var_height) {
    $('#awsParams').empty();
    var vh = var_height.split("_");
    var stats = AWS_INFO.stats.filter(x => x.var_code == vh[0] && x.height == vh[1]);

    for (var i = 0; i < stats.length; ++i) {
        $('#awsParams').append(
            $("<option>").text(stats[i].stat_name).val(stats[i].stat_code)
        );
    }
}

//
function setAWSVariableSelect1(var_height0) {
    $('#awsObsVar').empty();
    var var_select = [];
    for (var i = 0; i < AWS_JSON.params.length; ++i) {
        var vartxt = AWS_JSON.params[i].name + " @ " + AWS_JSON.params[i].height + "m";
        var varval = AWS_JSON.params[i]._row;
        var_select.push(varval);

        $('#awsObsVar').append(
            $("<option>").text(vartxt).val(varval)
        );
    }

    if (var_select.includes(var_height0)) {
        $('#awsObsVar option[value=' + var_height0 + ']').attr('selected', true);
    }
}

function setAWSParamSelect1(var_height) {
    $('#awsParams').empty();
    var param = AWS_JSON.params.filter(x => x._row == var_height);
    var stats = param[0].stats;

    for (var i = 0; i < stats.length; ++i) {
        $('#awsParams').append(
            $("<option>").text(stats[i].stat_name).val(stats[i].stat_code)
        );
    }
}

function setAWSRangeStats(var_height) {
    $('#arearange').prop('checked', false);
    $('#rangepars').hide();

    var var_hgt = var_height.split("_");
    var stat = AWS_INFO.stats.filter(x => x.var_code == var_hgt[0] && x.height == var_hgt[1]);
    var vpars = [];
    for (var i = 0; i < stat.length; ++i) {
        vpars[i] = stat[i].stat_name;
    }

    var isMax = $.inArray('max', vpars);
    var isMin = $.inArray('min', vpars);
    var isAvg = $.inArray('avg', vpars);
    if (isMax !== -1 && isMin !== -1 && isAvg !== -1) {
        $('#rangepars').show();
    }
}

function getListMetadata() {
    var colN = ['AWS ID', 'AWS Name', 'AWS Network', 'Longitude', 'Latitude', 'Elevation'];
    var colP = ['id', 'name', 'network', 'longitude', 'latitude', 'altitude'];
    var tmN = ['Start Observation', 'End Observation'];
    var tmP = ['startdate', 'enddate'];

    var adm = $.grep(AWS_JSON.colinfo.header, function(x) {
        return !colP.includes(x);
    });

    var awsN = colN.concat(adm);
    awsN = awsN.concat(tmN);
    var awsP = colP.concat(adm);
    awsP = awsP.concat(tmP);

    var info = new Array();
    for (var i = 0; i < awsP.length; ++i) {
        info[i] = "<b>" + awsN[i] + " :</b> " + AWS_INFO.coords[0][awsP[i]];
    }

    var nl = info.length;
    var j = 0;

    for (var i = 0; i < AWS_INFO.params.length; ++i) {
        var var_code = AWS_INFO.params[i].code;
        var var_name = AWS_INFO.params[i].name;
        var var_stat = AWS_INFO.stats.filter(x => x.var_code === var_code);
        var var_height = $.unique(var_stat.map(x => x.height));

        // 
        for (var h = 0; h < var_height.length; ++h) {
            var vartxt = var_name + " @ " + var_height[h] + "m";
            var stats = var_stat.filter(x => x.height === var_height[h]);
            var pars = [];
            for (var s = 0; s < stats.length; ++s) {
                pars[s] = stats[s].stat_name;
            }
            pars = pars.join(", ");
            info[j + nl] = '<b>' + vartxt + " :</b> " + pars;
            j = j + 1;
        }
    }

    return { len: nl, info: info };
}

function displayMetadata() {
    var ret = getListMetadata();
    var infos = ret.info;
    var nl = ret.len;
    var list1 = '';
    for (i = 0; i < nl; i++) {
        list1 += "<li>" + infos[i] + "</li>";
    }
    var list2 = '';
    for (i = nl; i < infos.length; i++) {
        list2 += "<li>" + infos[i] + "</li>";
    }

    $("#idTable").empty();
    var table = $('<table>').attr('id', 'jsonTable');
    table.addClass('table table-bordered table-hover table-striped');
    var row = $('<tr>').appendTo(table);
    var col1 = $('<td>').appendTo(row);
    col1.append($("<ul>").append(list1));

    var col2 = $('<td>').appendTo(row);
    col2.append('<b> Variables :</b>');
    col2.append($("<ul>").append(list2));

    $("#idTable").append(table);
}

// 
function setAWSVarMapSelect(json) {
    $.each(json, function() {
        var txt = this[0].name + " @ " + this[0].height + "m";
        var val = this[0].code + "_" + this[0].height;
        $('#awsSpVar').append(
            $("<option>").text(txt).val(val)
        );
    });
}

function setAWSStatsMapSelect(json, var_height) {
    $('#awsSpStat').empty();
    var iv = json.map(x => x[0].code + '_' + x[0].height).indexOf(var_height);
    $.each(json[iv][0].stats, function() {
        $('#awsSpStat').append(
            $("<option>").text(this.long_name).val(this.stat_code)
        );
    });
}

//////////

function setAWSAggrDataTimeStep(time_step) {
    var timestep_txt = ['Hourly', 'Daily', 'Pentadal', 'Dekadal', 'Monthly'];
    var timestep_val = ['hourly', 'daily', 'pentad', 'dekadal', 'monthly'];
    for (var i = 0; i < timestep_txt.length; ++i) {
        $('#timestepDispTS').append(
            $("<option>").text(timestep_txt[i] + " data").val(timestep_val[i])
        );
    }
    setTimeout(() => {
        $('#timestepDispTS').val(time_step);
    }, 100);
}

//////////


function setAWSAggrDataTime(backNbDay) {
    var label = ['Year', 'Mon', 'Dek', 'Pen', 'Day', 'Hour'];
    var pname = ['year', 'month', 'dekad', 'pentad', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2, #minute3').hide();
    // 
    var daty = TS_DATE;
    // var daty = changeTimeZone(TS_DATE, MTO_INIT.timeZone);
    var pastYear = new Date(+daty);
    pastYear.setDate(pastYear.getDate() - backNbDay);
    var initHour = dateFormat(pastYear, "HH");
    var initDay = dateFormat(pastYear, "dd");
    var initMon = dateFormat(pastYear, "mm");
    var initYear = dateFormat(pastYear, "yyyy");
    var initPen = pastYear.getPentad();
    var initDek = pastYear.getDekad();

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
    //
    for (var i = 1; i <= 3; ++i) {
        $('#dekad1, #dekad2, #dekad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#dekad1").val(initDek);
    $("#dekad2, #dekad3").val(daty.getDekad());
    //
    for (var i = 1; i <= 6; ++i) {
        $('#pentad1, #pentad2, #pentad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#pentad1").val(initPen);
    $("#pentad2, #pentad3").val(daty.getPentad());
    //
    $("#timestepDispTS").change(function() {
        setTimeout(() => {
            for (var c = 3; c < 7; c++) {
                $(".aws-select-time td:nth-child(" + c + ")").hide();
            }
            var timestep = $(this).val();
            if (timestep == "hourly") {
                $(".aws-select-time td:nth-child(6)").show();
                $(".aws-select-time td:nth-child(5)").show();
            } else if (timestep == "daily") {
                $(".aws-select-time td:nth-child(5)").show();
            } else if (timestep == "pentad") {
                $(".aws-select-time td:nth-child(4)").show();
            } else if (timestep == "dekadal") {
                $(".aws-select-time td:nth-child(3)").show();
            } else {
                for (var c = 3; c < 7; c++) {
                    $(".aws-select-time td:nth-child(" + c + ")").hide();
                }
            }
        }, 200);
    });
    $("#timestepDispTS").trigger("change");
}

//////////

function highcharts_TS_dataAWS(json, time_step) {
    var date_format;
    switch (time_step) {
        case "minutes":
            date_format = "yyyy-mm-dd HH:MM";
            break;
        case "hourly":
            date_format = "yyyy-mm-dd HH";
            break;
        case "daily":
            date_format = "yyyy-mm-dd";
            break;
        case "pentad":
            date_format = "yyyy-mm-dd";
            break;
        case "dekadal":
            date_format = "yyyy-mm-dd";
            break;
        case "monthly":
            date_format = "yyyy-mm";
    }

    var options = {
        title: {
            text: json.opts.title,
            style: {
                fontSize: '16px'
            }
        },

        subtitle: {
            text: json.opts.subtitle,
            style: {
                fontSize: '14px'
            }
        },

        xAxis: {
            type: 'datetime',
            lineWidth: 2
        },
        yAxis: {
            tickPositions: json.yaxis.at,
            labels: {
                align: 'center',
                x: -12,
                y: 4,
                formatter: function() {
                    if (this.isFirst) {
                        pos = -1;
                    }
                    pos++;
                    return json.yaxis.tick[pos];
                }
            },
            title: {
                text: json.yaxis.ylab
            },
            max: json.yaxis.ymax,
            endOnTick: false,
            opposite: false,
            showLastLabel: true,
            lineColor: '#ccd6eb',
            lineWidth: 2,
            tickLength: 10,
            tickWidth: 1,
            minorTickInterval: json.yaxis.mtick,
            minorGridLineDashStyle: "LongDashDotDot"
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        },
        navigator: {
            series: {
                // type: (json.opts.var === 5 ? "column" : "line"),
                type: (json.opts.var === 5 ? "areaspline" : "line"),
                pointRange: null,
                dataGrouping: {
                    groupPixelWidth: 10
                }
            }
        }
    };

    // 
    var tooltip = {
        split: true,
        pointFormat: '',
        formatter: function(x) {
            var y = x.defaultFormatter.call(this, x);
            y[0] = dateFormat(this.x, date_format, json.opts.tz);
            return y;
        }
    };
    // 
    if (json.opts.arearange) {
        if (json.display_data) {
            var tooltip = {
                crosshairs: true,
                shared: true,
                valueDecimals: 1,
                formatter: function(x) {
                    var y = x.defaultFormatter.call(this, x);
                    y[0] = dateFormat(this.x, date_format, json.opts.tz);
                    return y;
                }
            }
        }

        var series = [{
            name: json.opts.name[1],
            keys: ['x', 'low', 'high', 'y'],
            data: json.data,
            zIndex: 1,
            fillColor: 'lightblue',
            lineWidth: 1.5,
            lineColor: 'blue'
        }, {
            name: json.opts.name[0],
            keys: ['x', 'low', 'high', 'Ave'],
            data: json.data,
            type: 'arearange',
            linkedTo: ':previous',
            lineWidth: 1,
            lineColor: 'red',
            color: 'pink',
            fillOpacity: 0.2,
            zIndex: 0,
            marker: {
                enabled: false
            }
        }];
    } else {
        if (json.display_data) {
            var tooltip = {
                crosshairs: false,
                valueDecimals: 1,
                formatter: function(x) {
                    var y = x.defaultFormatter.call(this, x);
                    y[0] = dateFormat(this.x, date_format, json.opts.tz);
                    return y;
                }
            }
        }

        var series = [{
            name: json.opts.name,
            data: json.data,
            type: (json.opts.var === 5 ? "column" : "line"),
            lineWidth: 1,
            color: "blue",
            dataGrouping: {
                // enabled: false,
                approximation: function(grp_data) {
                    if (json.opts.var === 5) {
                        // maximum
                        // return Math.max(...grp_data);
                        return Math.max.apply(null, grp_data);
                    } else {
                        // average
                        return grp_data.reduce((x, y) => x + y, 0) / grp_data.length;
                    }
                }
            }
        }];

        // // change color when bars are grouped
        // var chart = {
        //     events: {
        //         render: function() {
        //             var grp_data = this.series[0].groupedData;
        //             if (grp_data !== null) {
        //                 grp_data.forEach(function(grp_pts) {
        //                     if (grp_pts.y > json.yaxis.ymax) {
        //                         grp_pts.graphic.css({
        //                             color: 'lightblue'
        //                         });
        //                     }
        //                 });
        //             }
        //         }
        //     }
        // };
        // options.chart = chart;
    }

    options.tooltip = tooltip;

    // 
    var exporting = {
        enabled: true,
        filename: json.opts.filename,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        },
        chartOptions: {
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            title: {
                style: {
                    fontSize: '11px',
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
                }
            },
            subtitle: {
                style: {
                    fontSize: '9px',
                    fontFamily: 'Arial',
                    fontWeight: 'normal',
                }
            },
            xAxis: [{
                labels: {
                    style: {
                        fontSize: '8px',
                        fontFamily: 'Arial',
                        // color: 'black'
                    }
                },
                rotation: 90
            }],
            yAxis: [{
                labels: {
                    style: {
                        fontSize: '8px',
                        fontFamily: 'Arial',
                        // color: 'black'
                    }
                },
                title: {
                    style: {
                        fontSize: '9px',
                        fontFamily: 'Arial',
                        color: 'black'
                    }
                },
                rotation: 90
            }]
        }
    };
    options.exporting = exporting;

    // 
    options.series = series;

    CHART_BE = Highcharts.stockChart('contAWSGraph', options);
}

//////////

function awsSpatialbindPopup(don, date, labelObj) {
    var divContainer = $('<div>');
    var divAWS = $('<div>').addClass("awsTablebindPopupP");
    var popTitre = '<b>Observation Time: </b>' + date + '<br>' +
        '<b> NAME : </b>' + don.name + '&nbsp;' +
        '<b>ID : </b>' + don.id + '&nbsp;' +
        '<b> NETWORK : </b>' + don.network;
    $('<p>').html(popTitre).appendTo(divAWS);
    divContainer.append(divAWS);

    var divTableD = $('<div>').addClass('awsTablebindPopupD');

    var table = $('<table>').addClass('awsTablebindPopup');
    var head = $('<tr>').addClass('awsTablebindPopupTh');
    var head1 = $('<th>').text("Variable");
    head.append(head1);
    var head2 = $('<th>').text("Value");
    head.append(head2);
    var head3 = $('<th>').text("Units");
    head.append(head3);
    table.append(head);

    for (i = 0; i < labelObj.length; i++) {
        var id_var = labelObj[i].code + '_' +
            labelObj[i].height + '_' +
            labelObj[i].stat_code;
        var val = don[id_var];
        if (val === null | val === undefined) { continue; }

        var row = $('<tr>').addClass('awsTablebindPopupTr');
        var txt_var = labelObj[i].name + ' at ' +
            labelObj[i].height + 'm' +
            ' [' + labelObj[i].stat_name + ']';

        var col1 = $('<td>').text(txt_var);
        row.append(col1);

        val = Math.round((val + Number.EPSILON) * 10) / 10;
        var col2 = $('<td>').text(val);
        row.append(col2);
        var col3 = $('<td>').html(labelObj[i].units);
        row.append(col3);
        table.append(row);
    }

    divTableD.append(table);
    divContainer.append(divTableD);

    return divContainer;
}

//////////

function leaflet_Map_dataAWS(json, pars, stat, sel_aws = null) {
    MAP_BE.closePopup();
    removeLayerMarkers(MAP_BE);
    removeControlSearch();
    MAP_BE.invalidateSize();

    DATE_MAP.update(json.date);

    var var_code = pars.split("_")[0];
    var plotType = (var_code == "9" || var_code == "10") ? "arrow" : "label";
    var vhs = pars + '_' + stat;

    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";
    var searchLayer = new L.LayerGroup();

    // 
    var awsList = [];
    if (sel_aws !== null) {
        awsList = sel_aws;
        if (DATA_USERS.uid > 0) {
            if (DATA_USERS.userlevel == 2) {
                var awsUser = DATA_USERS.awslist.aws
                    .map(x => x.network_code + '_' + x.aws_id);
                if ($("#dispuseraws").is(':checked')) {
                    awsList = awsUser.concat(sel_aws)
                        .filter((v, i, a) => a.indexOf(v) === i);
                }
            }
        }
    }

    $.each(json.data, (ix) => {
        var don = json.data[ix];
        if (don[vhs] === undefined) {
            return;
        }
        if (json.color[vhs][ix] === null) {
            return;
        }

        // 
        var aws_id = don.network_code + '_' + don.id;
        if (sel_aws !== null) {
            if (sel_aws.length > 0) {
                if ($("#dispselaws").is(':checked')) {
                    if (!awsList.includes(aws_id)) {
                        return;
                    }
                }
            }
        }

        // 
        if (DATA_USERS.uid > 0) {
            if (DATA_USERS.userlevel == 2) {
                if ($("#dispuseraws").is(':checked')) {
                    if (awsList.length > 0) {
                        if ($("#dispselaws").is(':checked')) {
                            if (!awsList.includes(aws_id)) {
                                return;
                            }
                        } else {
                            if (don.user_aws === 0) {
                                return;
                            }
                        }
                    } else {
                        if (don.user_aws === 0) {
                            return;
                        }
                    }
                }
            }
        }

        // 
        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");

        if (plotType == "label") {
            var dispVal = $('<span>').addClass("pin-label").appendTo(divIco);
            if (don.user_aws > 0) {
                if (don[vhs] !== null) {
                    var disp_val = Math.round(don[vhs]);
                    dispVal.html(disp_val);
                }
            }
        }
        if (plotType == "arrow") {
            $('<div>').addClass("pin-arrow").appendTo(divIco);
        }
        divIconHtml.append(divIco);

        // 
        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.name + '<br>' + '<b>NETWORK : </b>' + don.network;

        var icon = L.divIcon({
            iconSize: null,
            iconAnchor: new L.Point(15, 30),
            popupAnchor: new L.Point(0, -15),
            className: 'pindivIcon' + ix,
            html: divIconHtml.prop('outerHTML')
        });
        var lalo = new L.LatLng(don.latitude, don.longitude);

        var marker = L.marker(lalo, { icon: icon, title: don.name + ' ' + don.network })
            .bindTooltip(txttip, text2Op)
            .addTo(MAP_BE);

        // 
        if (don.user_aws > 0) {
            var tablePopup = awsSpatialbindPopup(don, json.date, json.pars);
            marker.bindPopup(tablePopup.prop('outerHTML'), { maxWidth: 400 });
        }

        // 
        searchLayer.addLayer(marker);
        MARKERS_BE.push(marker);

        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[vhs][ix]);

        if (plotType == "arrow") {
            var thisArrow = '.pindivIcon' + ix + ' .pin-arrow';

            var var_sp = vhs.split('_');
            var_sp[0] = '9';
            var var_dd = var_sp[0] + '_' + var_sp[1] + '_' + var_sp[2];
            if (don[var_dd] === undefined | don[var_dd] === null) {
                $(thisArrow).hide();
            } else {
                $(thisArrow).css('transform', 'rotate(' + don[var_dd] + 'deg)');
            }
            if (don[var_dd] === 0) {
                $(thisArrow).hide();
            }
        }

        marker.on('click', (e) => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
            var goPin = '.pindivIcon' + ix;
            var thisPin = goPin + ' .pin';
            $(thisPin).css("background-color", 'red');
            lastIconActive = goPin;
        });

        if (don.user_aws > 0) {
            marker.getPopup().on('remove', function() {
                if (lastIconActive != "") {
                    var activePin = lastIconActive + ' .pin';
                    $(activePin).css("background-color", '#3071a9');
                }
            });
        }
    });

    // 
    MAP_BE.on('click', (e) => {
        if (lastIconActive != "") {
            var activePin = lastIconActive + ' .pin';
            $(activePin).css("background-color", '#3071a9');
        }
    });

    addAWSControlSearch(searchLayer, position = 'topright');

    //
    $('#colKeyMapVar').empty();
    var kolKey = json.key[vhs];

    if (kolKey == undefined) {
        var txt = $("#awsSpVar option:selected").text();
        flashMessage("No data for " + txt + " to display on map", "warning");
        return false;
    }

    // 
    $('#colKeyMapVar').append(createColorKeyH(kolKey));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '55px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);
}