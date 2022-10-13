var selAWSTS = [];
var selAWSSP = [];

///////////////

function initializeAWS2DispTS(coords) {
    var arrSelect = coords.map(x => x._row);
    if (selAWSTS.length == 0) {
        var vh0 = MTO_INIT.initNET + '_' + MTO_INIT.initAWS;
        var init0 = arrSelect.indexOf(vh0);
        if (init0 === -1) {
            vh0 = arrSelect[0];
        }

        if (DATA_USERS.uid > 0) {
            if (DATA_USERS.userlevel == 2) {
                var vh_u = DATA_USERS.awslist.aws.map(x => x.network_code + '_' + x.aws_id);
                var arrInt = arrSelect.filter(x => vh_u.includes(x));
                if (arrInt.length > 0) {
                    vh0 = arrInt[0];
                }
                selAWSTS[0] = vh0;
            } else {
                selAWSTS[0] = vh0;
            }
        } else {
            selAWSTS[0] = vh0;
        }
    } else {
        var arrInt = arrSelect.filter(x => selAWSTS.includes(x));
        if (arrInt.length === 0) {
            selAWSTS[0] = arrSelect[0];
        } else {
            selAWSTS = arrInt;
        }
    }
}

///////////////

function setAWSAggrVARSSTN(time_step) {
    var aggr_data = ['pentad', 'dekadal', 'monthly'];
    if (aggr_data.includes(time_step)) {
        time_step = 'daily';
    }

    $.getJSON('/readVARSMetadata', { 'time_step': time_step }, (json) => {
        AWS_JSON = json;
        // 
        setAWSVariableSelect1(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);
        setAWSParamSelect1(MTO_INIT.initVAR + '_' + MTO_INIT.initHGT);

        setTimeout(() => {
            var var_height = $("#awsObsVar option:selected").val();
            var stat = $("#awsParams option:selected").val();
            var vhs = var_height + '_' + stat;

            var coords = json.coords.filter(x => x[vhs]);
            initializeAWS2DispTS(coords);
        }, 100);

        setTimeout(() => {
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

            // Initialize chart
            plot_TS_dataAggrAWS_Sel(data);
        }, 1000);
    });
}

//////////

var AWS_SPVARS;

function setAWSAggrMAPVARS_Sel(time_step) {
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
            plot_Map_dataAggrAWS_Sel(data);
        }, 1000);
    });
}

///////////////

function plot_TS_dataAggrAWS_Sel(data) {
    $.ajax({
        type: 'POST',
        url: '/chartAggrAWSDataSel',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 60000,
        dataType: "json",
        success: (json) => {
            if (json.opts.out != 'ok') {
                $.each(json.opts.status, function() {
                    flashMessage(this.msg, this.type);
                });
                if (json.opts.out == 'no') {
                    return false;
                }
            }
            var time_step = $("#timestepDispTS option:selected").val();
            highcharts_TS_dataAWS_Sel(json, time_step);
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

function plot_Map_dataAggrAWS_Sel(data) {
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
            leaflet_Map_dataAWS(json, pars, stat, selAWSSP);
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

///////////

function selectAWS2DispTS(json, selAWS) {
    var divmodal = $('<div>').addClass('modal-dialog');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    divmodal.css({
        'width': '500px',
        'margin': 'auto',
        'position': 'absolute',
        'left': '50%',
        'top': '50%',
        'transform': 'translate(-50%, -50%)'
    });

    divhead.css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })

    // 
    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal',
        click: () => {
            selAWSTS = select_left.val();
        }
    }).appendTo(divhead);

    $("<h4>").text("AWS Selection").appendTo(divhead);

    //////
    // body
    var divSelect = $('<div>').addClass('div-select2-multiple');
    var select_left = $('<select>').appendTo(divSelect);

    if (DATA_USERS.uid > 0) {
        if (DATA_USERS.userlevel == 2) {
            var textGrp = $("<optgroup>");
            textGrp.attr("label", "User Selected Stations");

            var user_aws_id = DATA_USERS.awslist.aws
                .map(x => x.network_code + '_' + x.aws_id);

            for (var i = 0; i < user_aws_id.length; ++i) {
                for (var j = 0; j < json.length; ++j) {
                    for (var l = 0; l < json[j].children.length; ++l) {
                        if (json[j].children[l].id != user_aws_id[i]) {
                            continue;
                        } else {
                            var val = json[j].children[l].id;
                            var text = json[j].children[l].text;
                            textGrp.append($("<option>").val(val).text(text));
                        }
                    }
                }
            }
            select_left.append(textGrp);

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
        select_left.append(textGrp);
    });

    select_left.select2({
        theme: "bootstrap",
        width: null,
        multiple: true,
        formatNoMatches: function() {
            return "No Station Found.";
        }
    });

    // 
    if (selAWS.length > 0) {
        select_left.val(selAWS).trigger('change');
    }

    select_left.on('select2:unselecting', function(e) {
        $(this).data('close-dropdown', true);

        var selVal = select_left.val();
        var delVal = e.params.args.data.id;
        if (selVal.includes(delVal)) {
            // console.log(e.params.args.originalEvent.currentTarget.nodeName)
            // console.log(e.params.args.originalEvent.currentTarget.localName)
            if (e.params.args.originalEvent.currentTarget.nodeName === 'LI') {
                e.preventDefault();
                $(this).select2("close");
                $(this).data('close-dropdown', false);
            }
        }
    });

    // prevent dropdown to open when delete a selected item
    select_left.on('select2:opening', function(e) {
        if ($(this).data('close-dropdown')) {
            $(this).removeData('close-dropdown');
            e.preventDefault();
        }
    });

    select_left.on('select2:close', function(e) {
        $('.select2-search__field')
            .attr('placeholder', 'Select Station ...');
        $('.select2-search__field').css({ 'width': '100%' });
    });

    //////

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal',
        click: () => {
            selAWSTS = select_left.val();
        }
    }).appendTo(divfoot);

    //////

    divbody.append(divSelect);
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////

function selectAWS2DispSP(json, var_height, stat_code, selAWS) {
    var divmodal = $('<div>').addClass('modal-dialog');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    $(divhead).css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })
    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal',
        click: () => {
            selAWSSP = selAWS;
            leaflet_Map_dataAWS(AWS_DATA, var_height, stat_code, selAWSSP);
        }
    }).appendTo(divhead);

    $("<h4>").text("AWS Selection").appendTo(divhead);

    //////
    // body
    // var divSelect = $('<div>').addClass('div-modal-select');
    var divSelect = $('<div>');
    divSelect.css({
        'width': '100%',
        'display': 'grid',
        'grid-template-columns': '1fr 0.2fr 1fr',
        'align-items': 'center',
        'grid-column-gap': '5px'
    });

    var divLeft = $('<div>').addClass('div-select-optgroup-sp');
    divLeft.css({
        'text-align': 'right',
    });
    var divRight = $('<div>').addClass('div-select-optgroup-sp');
    divRight.css({
        'text-align': 'left',
    });
    var divCenter = $('<div>').css({
        'text-align': 'center',
    });

    var select_left = $('<select>').appendTo(divLeft);
    select_left.attr("multiple", "multiple");
    select_left.attr("size", 20);
    select_left.addClass('left-select');
    select_left.css('width', '250px');

    // 
    var group_labels = [];
    var group_data = [];
    var group_opts = [];

    // 
    if (DATA_USERS.uid > 0) {
        if (DATA_USERS.userlevel == 2) {
            var label = "User Selected Stations";
            group_labels.push(label);
            var grp_dat = [];

            var textGrp = $("<optgroup>");
            textGrp.attr("label", label);

            var user_aws_id = DATA_USERS.awslist.aws
                .map(x => x.network_code + '_' + x.aws_id);

            for (var i = 0; i < user_aws_id.length; ++i) {
                for (var j = 0; j < json.length; ++j) {
                    for (var l = 0; l < json[j].children.length; ++l) {
                        if (json[j].children[l].id != user_aws_id[i]) {
                            continue;
                        } else {
                            var val = json[j].children[l].id;
                            var text = json[j].children[l].text;
                            textGrp.append($("<option>").val(val).text(text));
                            grp_dat.push(val);
                        }
                    }
                }
            }
            select_left.append(textGrp);
            group_data.push(grp_dat);

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
        var label = this.text + ' AWS Network';
        group_labels.push(label);
        var grp_dat = [];

        var textGrp = $("<optgroup>");
        textGrp.attr("label", label);

        for (var i = 0; i < this.children.length; ++i) {
            var val = this.children[i].id;
            var text = this.children[i].text;
            textGrp.append($("<option>").val(val).text(text));
            grp_dat.push(val);
        }
        select_left.append(textGrp);
        group_data.push(grp_dat);
    });

    //
    var select_right = $('<select>').appendTo(divRight);
    select_right.attr("multiple", "multiple");
    select_right.attr("size", 20);
    select_right.css('width', '250px');

    for (var i = 0; i < group_labels.length; ++i) {
        group_opts[i] = $("<optgroup>");
        group_opts[i].attr("label", group_labels[i]);
        select_right.append(group_opts[i]);
    }

    if (selAWS.length > 0) {
        for (var i = 0; i < group_labels.length; ++i) {
            var grp = selAWS.filter(x => group_data[i].includes(x));
            if (grp.length > 0) {
                for (var j = 0; j < grp.length; ++j) {
                    select_left.val(grp[j]);
                    var text = select_left.find(":selected").text();
                    var opt = $("<option>").val(grp[j]).text(text);
                    group_opts[i].append(opt);
                }
            }
            select_left.val([]);
        }
    }

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' >> ',
        click: () => {
            var sel_aws_val = select_left.val();
            if (sel_aws_val.length == 0) {
                return false;
            }
            var sel_aws_txt = $('.left-select option:selected').toArray().map(item => item.text);

            for (var i = 0; i < sel_aws_val.length; ++i) {
                if (selAWS.includes(sel_aws_val[i])) {
                    continue;
                } else {
                    selAWS.push(sel_aws_val[i]);
                    for (var j = 0; j < group_labels.length; ++j) {
                        if (group_data[j].includes(sel_aws_val[i])) {
                            var opt = $("<option>").val(sel_aws_val[i]).text(sel_aws_txt[i]);
                            group_opts[j].append(opt);
                        }
                    }
                }
            }
        }
    }).appendTo(divCenter);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' << ',
        click: () => {
            var sel_aws_val = select_right.val();
            if (sel_aws_val.length == 0) {
                return false;
            }

            for (var i = 0; i < sel_aws_val.length; ++i) {
                select_right.find('[value="' + sel_aws_val[i] + '"]').remove();
                var ix = selAWS.indexOf(sel_aws_val[i]);
                if (ix > -1) {
                    selAWS.splice(ix, 1);
                }
            }
        }
    }).appendTo(divCenter);

    //////

    divSelect.append(divLeft);
    divSelect.append(divCenter);
    divSelect.append(divRight);
    divbody.append(divSelect);

    //////

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal',
        click: () => {
            selAWSSP = selAWS;
            leaflet_Map_dataAWS(AWS_DATA, var_height, stat_code, selAWSSP);
        }
    }).appendTo(divfoot);

    // 
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////

function highcharts_TS_dataAWS_Sel(json, time_step) {
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

    var series = [];
    for (var i = 0; i < json.data.length; ++i) {
        var dat = [];
        for (var j = 0; j < json.date.length; ++j) {
            dat.push([
                json.date[j],
                json.data[i].data[j]
            ]);
        }
        var ser = {
            name: json.data[i].name,
            data: dat,
            type: 'line',
            lineWidth: 1.5,
            color: json.data[i].color
        }
        if (!json.data[i].display) {
            ser['tooltip'] = {
                pointFormatter: function() {
                    return this.series.name;
                }
            };
        }
        series[i] = ser;
    }

    var options = {
        title: {
            text: json.opts.title,
            style: {
                fontSize: '16px'
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
        legend: {
            enabled: true,
            layout: 'horizontal',
            borderColor: 'black',
            borderWidth: 1,
            borderRadius: 5,
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
                type: "line",
                pointRange: null,
                dataGrouping: {
                    groupPixelWidth: 10
                }
            }
        }
    };

    // 
    var tooltip = {
        // split: true,
        formatter: function(x) {
            var y = x.defaultFormatter.call(this, x);
            y[0] = dateFormat(this.x, date_format, json.opts.tz);
            return y;
        }
    };
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
            legend: {
                enabled: true,
                itemStyle: {
                    fontSize: '7px',
                    fontFamily: 'Arial',
                    fontWeight: 'normal',
                    color: 'black'
                }
            },
            title: {
                style: {
                    fontSize: '11px',
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
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