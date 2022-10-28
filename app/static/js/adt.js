var TS_DATE = new Date();
// var TS_DATE = new Date(2020, 10, 30, 23, 50, 0);

/////////////////
// change to 0 in production
// var TRACE_ERROR = 1;
var TRACE_ERROR = 0;

var AWS_DATA = new Object();
AWS_DATA.status = "no-data";
var AWS_JSON = "";
var AWS_INFO = "";

/////////////////

var CHART_BE;
// HighCharts data export
// var EXPORT_DATA = false;
var chartButtonMenuItems = [
    'viewFullscreen', 'printChart', 'separator',
    'downloadPNG', 'downloadJPEG', 'downloadPDF'
];

/////////////////

// container toggle
$(() => {
    $('.input-container-title').on('click', function(event) {
        event.preventDefault();
        var accordion = $(this);
        var accordionContent = accordion.next('.input-container-content');
        accordion.toggleClass("open");
        accordionContent.slideToggle(250);
        // 
        if (accordion.hasClass("open")) {
            $(this).parent()
                .find(".glyphicon-plus")
                .removeClass("glyphicon-plus")
                .addClass("glyphicon-minus");
        } else {
            $(this).parent()
                .find(".glyphicon-minus")
                .removeClass("glyphicon-minus")
                .addClass("glyphicon-plus");
        }
    });
    $('.input-container .input-container-title').first().click();
});

/////////////////

function flashMessage(message, category) {
    var divFlash = $('<div>').addClass('alert alert-dismissible');
    if (category == "error") {
        category = "danger";
    }
    divFlash.addClass('alert-' + category);
    divFlash.attr("role", "alert");
    divFlash.html(message);

    $('<button />', {
        class: 'close',
        type: 'button',
        'data-dismiss': 'alert',
        'aria-label': "Close",
        html: '<span aria-hidden="true">&times;</span>'
    }).appendTo(divFlash);

    $('.div-flash-alert').append(divFlash);
}

function displayAjaxError(request, status, error) {
    if (TRACE_ERROR > 0) {
        var win = window.open();
        $(win.document.body).html(request.responseText);
    }

    flashMessage(status + ": " + error, "error");
}

/////////////////

// format lon
function funlonFrmt(lon) {
    var degre, minute, second;
    xlon = (lon < 0) ? Math.abs(lon) : lon;
    degre = Math.floor(xlon);
    lonm = (xlon - degre) * 60;
    minute = Math.floor(lonm);
    second = (lonm - minute) * 60;
    suffix = (lon < 0) ? 'W' : 'E';
    long = degre + 'º ' + minute + "' " +
        second.toFixed(2) + '" ' + suffix;
    return long;
}

// format lat
function funlatFrmt(lat) {
    var degre, minute, second;
    xlat = (lat < 0) ? Math.abs(lat) : lat;
    degre = Math.floor(xlat);
    latm = (xlat - degre) * 60;
    minute = Math.floor(latm);
    second = (latm - minute) * 60;
    suffix = (lat < 0) ? 'S' : 'N';
    lati = degre + 'º ' + minute + "' " +
        second.toFixed(2) + '" ' + suffix;
    return lati;
}

function seqLengthOut(min, max, len, dec = 9) {
    var step = (max - min) / len;
    var seq = [];
    for (var i = 0; i <= len; ++i) {
        seq[i] = i * step + min;
        seq[i] = roundNumber(seq[i], dec);
    }
    return seq;
}

function seqFromToStep(min, max, step, dec = 9) {
    var len = Math.floor((max - min) / step);
    var seq = [];
    for (var i = 0; i <= len; ++i) {
        seq[i] = i * step + min;
        seq[i] = roundNumber(seq[i], dec);
    }
    return seq;
}

function roundNumber(n, d) {
    var fac = Math.pow(10, d);
    return Math.round(n * fac) / fac;
}

function prettyScale(min, max, n) {
    var range = niceNumber(max - min, false);
    var d = niceNumber(range / (n - 1), true);
    var miny = Math.floor(min / d) * d;
    var maxy = Math.ceil(max / d) * d;
    return seqFromToStep(miny, maxy + 0.5 * d, d);
}

function niceNumber(x, round) {
    var exp = Math.floor(Math.log10(x));
    var f = x / Math.pow(10, exp);
    if (round) {
        if (f < 1.5) {
            nf = 1.0;
        } else if (f < 3.0) {
            nf = 2.0;
        } else if (f < 7.0) {
            nf = 5.0
        } else {
            nf = 10.0
        }
    } else {
        if (f <= 1.0) {
            nf = 1.0;
        } else if (f <= 2.0) {
            nf = 2.0;
        } else if (f <= 5.0) {
            nf = 5.0;
        } else {
            nf = 10.0;
        }
    }
    return nf * Math.pow(10, exp);
}

/////////////////

Number.prototype.mod = function(x) {
    return ((this % x) + x) % x;
}

Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};

Date.prototype.getDekad = function() {
    var day = this.getDate();
    var dek;
    if (day < 11) {
        dek = 1;
    } else if (day > 10 && day < 21) {
        dek = 2;
    } else {
        dek = 3;
    }
    return dek;
};

Date.prototype.setDekad = function(n) {
    var dek = n.mod(3);
    dek = (dek == 0) ? 3 : dek;
    var dek1;
    switch (dek) {
        case 1:
            dek1 = 5;
            break;
        case 2:
            dek1 = 15;
            break;
        case 3:
            dek1 = 25;
    }

    var im = Math.floor((n - 1) / 3);
    this.setMonth(this.getMonth() + im);
    var mon = this.getMonth() + 1;
    var dStr = this.getFullYear() + '-' + mon + '-' + dek1 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

Date.prototype.getPentad = function() {
    var day = this.getDate();
    var pen;
    if (day < 6) {
        pen = 1;
    } else if (day > 5 && day < 11) {
        pen = 2;
    } else if (day > 10 && day < 16) {
        pen = 3;
    } else if (day > 15 && day < 21) {
        pen = 4;
    } else if (day > 20 && day < 26) {
        pen = 5;
    } else {
        pen = 6;
    }
    return pen;
};

Date.prototype.setPentad = function(n) {
    var pen = n.mod(6);
    pen = (pen == 0) ? 6 : pen;
    var pen1;
    switch (pen) {
        case 1:
            pen1 = 3;
            break;
        case 2:
            pen1 = 7;
            break;
        case 3:
            pen1 = 13;
            break;
        case 4:
            pen1 = 17;
            break;
        case 5:
            pen1 = 23;
            break;
        case 6:
            pen1 = 27;
    }

    var im = Math.floor((n - 1) / 6);
    this.setMonth(this.getMonth() + im);
    var mon = this.getMonth() + 1;
    var dStr = this.getFullYear() + '-' + mon + '-' + pen1 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

////////////////////////////

function convertDate2UTC(date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );
}

function changeTimeZone(date, timeZone) {
    var local = undefined;
    // var local = 'en-US';
    if (typeof date === 'string') {
        return new Date(
            new Date(date).toLocaleString(local, {
                timeZone,
            }),
        );
    }
    return new Date(
        date.toLocaleString(local, {
            timeZone,
        }),
    );
}

// changeTimeZone(new Date(), "Africa/Kigali")

////////////////////////////

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

////////////////////////////

function startEndDateTime(timestep, obj) {
    var start_date = "";
    var end_date = "";

    if (timestep == "hourly") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1 + "-" + obj.hour1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2 + "-" + obj.hour2;
    } else if (timestep == "pentad") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.pentad1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.pentad2;
    } else if (timestep == "dekadal") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.dekad1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.dekad2;
    } else if (timestep == "monthly") {
        start_date = obj.year1 + "-" + obj.month1;
        end_date = obj.year2 + "-" + obj.month2;
    } else if (timestep == "daily") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2;
    } else {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1 + "-" + obj.hour1 + "-" + obj.minute1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2 + "-" + obj.hour2 + "-" + obj.minute2;
    }

    var vrange = new Object();
    vrange['start'] = start_date;
    vrange['end'] = end_date;
    return vrange;
}

///////////

function getDateMapMin() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();
    var minute3 = $("#minute3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' ' + hour3 + ':' + minute3 + ':00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMapMin() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();
    var minute3 = $("#minute3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3 + '-' + hour3 + '-' + minute3;
    return daty;
}

///////////

function getDateMap1Hour() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' ' + hour3 + ':00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Hour() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3 + '-' + hour3;
    return daty;
}

///////////

function getDateMap1Day() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Day() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3;
    return daty;
}

///////////

function getDateMap1Month() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + '15' + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Month() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();

    var daty = year3 + '-' + month3 + '-15';
    return daty;
}

///////////

function getDateMap1Pentad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var pentad3 = parseInt($("#pentad3 option:selected").val());

    var pen;
    switch (pentad3) {
        case 1:
            pen = 3;
            break;
        case 2:
            pen = 7;
            break;
        case 3:
            pen = 13;
            break;
        case 4:
            pen = 17;
            break;
        case 5:
            pen = 23;
            break;
        case 6:
            pen = 27;
    }

    var dStr = year3 + '-' + month3 + '-' + pen + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Pentad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var pentad3 = $("#pentad3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + pentad3;
    return daty;
}

///////////

function getDateMap1Dekad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var dekad3 = parseInt($("#dekad3 option:selected").val());

    var dek;
    switch (dekad3) {
        case 1:
            dek = 5;
            break;
        case 2:
            dek = 15;
            break;
        case 3:
            dek = 25;
    }

    var dStr = year3 + '-' + month3 + '-' + dek + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function fromatDateMap1Dekad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var dekad3 = $("#dekad3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + dekad3;
    return daty;
}

///////////

function selectTimesTsMap(n, ctable, label, pname, showlab) {
    var table = $(ctable);
    if (showlab) {
        var row1 = $('<tr>');
        for (var i = 0; i < label.length; i++) {
            var col = $('<td>').append("<strong>" + label[i] + "</strong>");
            row1.append(col);
        }
        table.append(row1);
    }

    var row2 = $('<tr>');
    for (var i = 0; i < label.length; i++) {
        var col = $('<td>');
        var select = $('<select>').attr('id', pname[i] + n).attr('name', pname[i] + n);
        select.append('<option value="" selected disabled hidden></option>')
        col.append(select);
        row2.append(col);
    }
    table.append(row2);

    return (table)
}

///////////

function checkDateTimeRange() {
    var timestep = $("#timestepDispTS option:selected").val();
    var year1 = $("#year1 option:selected").val();
    var year2 = $("#year2 option:selected").val();
    var month1 = $("#month1 option:selected").val();
    var month2 = $("#month2 option:selected").val();
    var dekad1 = $("#dekad1 option:selected").val();
    var dekad2 = $("#dekad2 option:selected").val();
    var pentad1 = $("#pentad1 option:selected").val();
    var pentad2 = $("#pentad2 option:selected").val();
    var day1 = $("#day1 option:selected").val();
    var day2 = $("#day2 option:selected").val();
    var hour1 = $("#hour1 option:selected").val();
    var hour2 = $("#hour2 option:selected").val();
    var minute1 = $("#minute1 option:selected").val();
    var minute2 = $("#minute2 option:selected").val();
    //
    if (year1 == "") {
        flashMessage("ERROR: Please select start year!", "error");
        return false;
    }
    if (month1 == "") {
        flashMessage("ERROR: Please select start month!", "error");
        return false;
    }
    if (timestep == "minute" || timestep == "hourly" || timestep == "daily") {
        if (day1 == "") {
            flashMessage("ERROR: Please select start day!", "error");
            return false;
        }
        if (timestep == "hourly" && hour1 == "") {
            flashMessage("ERROR: Please select start hour!", "error");
            return false;
        }
    }
    if (timestep == "minute" && minute1 == "") {
        flashMessage("ERROR: Please select start minute!", "error");
        return false;
    }
    if (timestep == "pentad" && pentad1 == "") {
        flashMessage("ERROR: Please select start pentad!", "error");
        return false;
    }
    if (timestep == "dekadal" && dekad1 == "") {
        flashMessage("ERROR: Please select start dekad!", "error");
        return false;
    }
    if (year2 == "") {
        flashMessage("ERROR: Please select end year!", "error");
        return false;
    }
    if (month2 == "") {
        flashMessage("ERROR: Please select end month!", "error");
        return false;
    }
    if (timestep == "minute" || timestep == "hourly" || timestep == "daily") {
        if (day2 == "") {
            flashMessage("ERROR: Please select end day!", "error");
            return false;
        }
        if (timestep == "hourly" && hour2 == "") {
            flashMessage("ERROR: Please select end hour!", "error");
            return false;
        }
    }
    if (timestep == "minute" && minute2 == "") {
        flashMessage("ERROR: Please select end minute!", "error");
        return false;
    }
    if (timestep == "pentad" && pentad2 == "") {
        flashMessage("ERROR: Please select end pentad!", "error");
        return false;
    }
    if (timestep == "dekadal" && dekad2 == "") {
        flashMessage("ERROR: Please select end dekad!", "error");
        return false;
    }
    //
    var vtimes = new Object();
    vtimes['year1'] = year1;
    vtimes['year2'] = year2;
    vtimes['month1'] = month1;
    vtimes['month2'] = month2;
    vtimes['dekad1'] = dekad1;
    vtimes['dekad2'] = dekad2;
    vtimes['pentad1'] = pentad1;
    vtimes['pentad2'] = pentad2;
    vtimes['day1'] = day1;
    vtimes['day2'] = day2;
    vtimes['hour1'] = hour1;
    vtimes['hour2'] = hour2;
    vtimes['minute1'] = minute1;
    vtimes['minute2'] = minute2;
    return vtimes;
}

////////////////////////////////

function setDateTimeMapDataMin(n) {
    var dObj = getDateMapMin();
    dObj.setMinutes(dObj.getMinutes() + n);
    //
    var vmin = dObj.getMinutes();
    $("#minute3").val((vmin < 10 ? "0" : "") + vmin);
    var vhour = dObj.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    var vday = dObj.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    var vmon = dObj.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);

    var years = $("#year3 option")
        .map(function() { return $(this).val(); })
        .get();
    years = years.map(x => Number(x));
    years = years.filter(x => x != 0);
    var minyr = Math.min(...years);
    var maxyr = Math.max(...years);

    var thisYear = dObj.getFullYear();
    var valYear;
    if (thisYear < minyr) {
        valYear = maxyr;
    } else if (thisYear > maxyr) {
        valYear = minyr;
    } else {
        valYear = thisYear;
    }
    $("#year3").val(valYear);
}

function setDateTimeMapDataHour(n) {
    var dObj = getDateMap1Hour();
    dObj.setHours(dObj.getHours() + n);
    // 
    var vhour = dObj.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    var vday = dObj.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    var vmon = dObj.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);

    var years = $("#year3 option")
        .map(function() { return $(this).val(); })
        .get();
    years = years.map(x => Number(x));
    years = years.filter(x => x != 0);
    var minyr = Math.min(...years);
    var maxyr = Math.max(...years);

    var thisYear = dObj.getFullYear();
    var valYear;
    if (thisYear < minyr) {
        valYear = maxyr;
    } else if (thisYear > maxyr) {
        valYear = minyr;
    } else {
        valYear = thisYear;
    }
    $("#year3").val(valYear);
}

function setDateTimeMapData(n) {
    var timestep = $("#timestepDispTS option:selected").val();
    var dObj;

    if (timestep == "hourly") {
        dObj = getDateMap1Hour();
        dObj.setHours(dObj.getHours() + n);
        var vhour = dObj.getHours();
        $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
        var vday = dObj.getDate();
        $("#day3").val((vday < 10 ? "0" : "") + vday);
    } else if (timestep == "daily") {
        dObj = getDateMap1Day();
        dObj.setDate(dObj.getDate() + n);
        var vday = dObj.getDate();
        $("#day3").val((vday < 10 ? "0" : "") + vday);
    } else if (timestep == "pentad") {
        dObj = getDateMap1Pentad();
        dObj = dObj.setPentad(dObj.getPentad() + n);
        $("#pentad3").val(dObj.getPentad());
        // change def of setPentad to use it directly
    } else if (timestep == "dekadal") {
        dObj = getDateMap1Dekad();
        dObj = dObj.setDekad(dObj.getDekad() + n);
        $("#dekad3").val(dObj.getDekad());
        // change def of setDekad to use it directly
    } else {
        dObj = getDateMap1Month();
        dObj.setMonth(dObj.getMonth() + n);
    }

    var vmon = dObj.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);

    var years = $("#year3 option")
        .map(function() { return $(this).val(); })
        .get();
    years = years.map(x => Number(x));
    years = years.filter(x => x != 0);
    var minyr = Math.min(...years);
    var maxyr = Math.max(...years);

    var thisYear = dObj.getFullYear();
    var valYear;
    if (thisYear < minyr) {
        valYear = maxyr;
    } else if (thisYear > maxyr) {
        valYear = minyr;
    } else {
        valYear = thisYear;
    }
    $("#year3").val(valYear);
}

function getDateTimeMapData() {
    var timestep = $("#timestepDispTS option:selected").val();
    var daty;

    switch (timestep) {
        case "hourly":
            daty = formatDateMap1Hour();
            break;
        case "daily":
            daty = formatDateMap1Day();
            break;
        case "pentad":
            daty = formatDateMap1Pentad();
            break;
        case "dekadal":
            daty = fromatDateMap1Dekad();
            break;
        case "monthly":
            daty = formatDateMap1Month();
    }

    return daty;
}

////////////////////////////////

function hexToRGB(hexStr) {
    var col = {};
    col.r = parseInt(hexStr.substr(1, 2), 16);
    col.g = parseInt(hexStr.substr(3, 2), 16);
    col.b = parseInt(hexStr.substr(5, 2), 16);
    return col;
}

function hexToRGBA(hexStr, alpha = 1) {
    var col = {};
    col.r = parseInt(hexStr.substr(1, 2), 16);
    col.g = parseInt(hexStr.substr(3, 2), 16);
    col.b = parseInt(hexStr.substr(5, 2), 16);
    col.a = alpha;
    return col;
}

function RGBToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16).slice(1);
}

function raplaceColorAlpha(obj, callback) {
    var data = obj.data;
    for (var i = 0; i < obj.col.length; i++) {
        var rgb = hexToRGB(obj.col[i]);
        var r, g, b, a;
        for (var j = 0; j < data.length; j += 4) {
            r = data[j];
            g = data[j + 1];
            b = data[j + 2];
            //// alpha 
            // a = data[j + 3];
            if ((r == rgb.r) && (g == rgb.g) && (b == rgb.b)) {
                // data[j] = rgb.r;
                // data[j + 1] = rgb.g;
                // data[j + 2] = rgb.b;
                data[j + 3] = 0;
            }
        }
    }

    callback(data);
}

////////////////////////

// function getNestedObject(nestedObj, pathArr) {
//     return pathArr.reduce((obj, key) =>
//         (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
// }

//
function getNestedObject(nestedObj, pathArr) {
    for (var i = 0; i < pathArr.length; i++) {
        nestedObj = nestedObj[pathArr[i]];
    }
    return nestedObj;
}

function updateNestedObject(nestedObj, pathArr, value) {
    var current = nestedObj;
    pathArr.forEach(function(key, index) {
        if (index === pathArr.length - 1) {
            current[key] = value;
        } else {
            // create the key if not exist
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
    });
}

////////////////////////

function getHTMLElementValue(obj) {
    var ret;
    if (obj === undefined) {
        return ret;
    }

    var nodenm = obj[0].nodeName;
    var type = obj[0].type;

    switch (true) {
        case (nodenm === "SELECT" && type === "select-one"):
        case (nodenm === "INPUT" && type === "text"):
        case (nodenm === "INPUT" && type === "number"):
            ret = obj.val();
            break;
        case (nodenm === "INPUT" && type === "checkbox"):
            ret = obj.is(':checked');
    }

    return ret;
}

function getHTMLElementModal(object) {
    function recurse(obj, arr_key) {
        if (obj !== undefined) {
            if (typeof obj === 'object') {
                if (!(obj instanceof jQuery.fn.init)) {
                    var keys = Object.keys(obj);
                    if (keys.length) {
                        keys.forEach(function(k) {
                            recurse(obj[k], arr_key.concat(k));
                        });
                    }
                    return;
                }
            }

            if (obj instanceof jQuery.fn.init) {
                var res = getHTMLElementValue(obj);
                out.push({ "path": arr_key, "val": res })
            }
        }
    }

    var out = [];
    recurse(object, []);
    return out;
}

////////////////////////

function encodeQueryData(data) {
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}

////////////////////////

function formatJSONCoordsToSelect2(json) {
    var net_name = $.unique(json.map(x => x.network));
    var dataSelect2 = [];
    for (var j = 0; j < net_name.length; ++j) {
        var net_data = new Object();
        net_data.text = net_name[j];
        net_data.children = [];
        dataSelect2[j] = net_data;
    }

    for (var i = 0; i < json.length; ++i) {
        var aws_data = new Object();
        aws_data.id = json[i].network_code + '_' + json[i].id;
        aws_data.text = json[i].name + '  - [id: ' + json[i].id + ']';
        aws_data.lon = json[i].longitude;
        aws_data.lat = json[i].latitude;
        aws_data.name = json[i].name;
        var inet = net_name.indexOf(json[i].network);
        dataSelect2[inet].children.push(aws_data);
    }

    return dataSelect2;
}

function flatJSONCoordsFromSelect2(json) {
    var json_flat = [];
    for (var j = 0; j < json.length; ++j) {
        var obj = json[j].children;
        for (var i = 0; i < obj.length; ++i) {
            obj[i].net = json[j].text;
            obj[i].r_text = obj[i].text + " - " + json[j].text;
        }
        json_flat = json_flat.concat(obj);
    }

    return json_flat;
}

function formatJSONMetadataToSelect2(json) {
    var net_name = $.unique(
        Object.keys(json).map((x) => json[x].coords[0].network)
    );
    var dataSelect2 = [];
    for (var j = 0; j < net_name.length; ++j) {
        var net_data = new Object();
        net_data.text = net_name[j];
        net_data.children = [];
        dataSelect2[j] = net_data;
    }
    for (var key in json) {
        var aws_data = new Object();
        aws_data.id = key;
        aws_data.text = json[key].coords[0].name + '  - [id: ' + json[key].coords[0].id + ']';
        aws_data.lon = json[key].coords[0].longitude;
        aws_data.lat = json[key].coords[0].latitude;
        aws_data.name = json[key].coords[0].name;

        var inet = net_name.indexOf(json[key].coords[0].network);
        dataSelect2[inet].children.push(aws_data);
    }

    return dataSelect2;
}

////////////////////////

// create downloadable link
function createDownloadableLink(blob, file_name) {
    var URL = window.URL || window.webkitURL;
    var downloadUrl = URL.createObjectURL(blob);

    var downlink = document.createElement("a");
    downlink.href = downloadUrl;
    downlink.download = file_name;
    document.body.appendChild(downlink);
    downlink.click();
    document.body.removeChild(downlink);
}

function downloadHtmlTableToCSV(table_id, file_name) {
    var data = [];
    $(table_id + ' tr').each(function() {
        data.push($(this));
    });

    var arr = [];
    data.forEach(function(item, index) {
        td = item[0].children;
        for (i = 0; i < td.length; ++i) {
            if (i == td.length - 1) {
                val = td[i].innerText + '\r\n';
            } else {
                val = td[i].innerText;
            }
            arr.push(val);
        }
    });

    var ncol = data[0][0].children.length;
    var csv = [];
    for (var i = 0; i < arr.length; i += ncol) {
        csv.push(arr.slice(i, i + ncol));
    }

    var csv_out = [];
    for (var i = 0; i < csv.length; ++i) {
        for (var j = (i == 0) ? 0 : 1; j < csv[i].length; ++j) {
            if (j == csv[i].length - 1 && i < csv.length - 1) {
                csv_out.push(csv[i][j] + csv[i + 1][0]);
            } else {
                csv_out.push(csv[i][j]);
            }
        }
    }

    var blob = new Blob([csv_out], { type: 'text/plain' });
    createDownloadableLink(blob, file_name);
}

function downloadJsonObjToCSV(json_obj, file_name) {
    var header = Object.keys(json_obj[0]);
    var data = json_obj.map(x => Object.values(x));
    data = [header].concat(data);

    var csv = [];
    for (i = 0; i < data.length; ++i) {
        var x = data[i];
        var y = x[x.length - 1] + '\r\n';
        x[x.length - 1] = y;
        csv.push(x);
    }

    var csv_out = [];
    for (var i = 0; i < csv.length; ++i) {
        for (var j = (i == 0) ? 0 : 1; j < csv[i].length; ++j) {
            if (j == csv[i].length - 1 && i < csv.length - 1) {
                csv_out.push(csv[i][j] + csv[i + 1][0]);
            } else {
                csv_out.push(csv[i][j]);
            }
        }
    }

    var blob = new Blob([csv_out], { type: 'text/plain' });
    createDownloadableLink(blob, file_name);
}