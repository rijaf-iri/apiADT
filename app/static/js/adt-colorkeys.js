function createColorKeyH(ckey) {
    var nc = ckey.colors.length;
    var nl = ckey.labels.length;
    var ntd = 2 * (nc - 1);

    var table = $('<table>').addClass('ckeyh');

    var row0 = $('<tr>').addClass("ckeyh-title");
    $('<td>').attr('colspan', ntd)
        .text(ckey.title).appendTo(row0);
    table.append(row0);

    var row1 = $('<tr>').addClass("ckeyh-color");
    $('<td>').css('background-color', ckey.colors[0]).appendTo(row1);
    for (j = 1; j < nc - 1; ++j) {
        $('<td>').attr('colspan', 2)
            .css('background-color', ckey.colors[j])
            .appendTo(row1);
    }
    $('<td>').css('background-color', ckey.colors[nc - 1]).appendTo(row1);
    table.append(row1);

    var row2 = $('<tr>').addClass("ckeyh-tick");
    row2.append($('<td>'));
    for (j = 1; j < nc - 1; ++j) {
        $('<td>').attr('colspan', 2).appendTo(row2);
    }
    row2.append($('<td>'));
    table.append(row2);

    var row3 = $('<tr>').addClass("ckeyh-label");
    for (j = 0; j < nl; ++j) {
        $('<td>').attr('colspan', 2)
            .text(ckey.labels[j])
            .appendTo(row3);
    }
    table.append(row3);

    var row4 = $('<tr>');
    for (j = 0; j < ntd; ++j) {
        var col = $('<td>').html("&nbsp;");
        col.css({
            'text-align': 'center',
            'line-height': '0px',
            'margin': 0,
            'padding': 0
        });
        row4.append(col);
    }
    table.append(row4);

    return table;
}

// 
function rasterColorKeyH(ckey) {
    var nl = ckey.labels.length;
    var ntd = 2 * nl;

    var table = $('<table>').addClass('rckeyh');

    var row0 = $('<tr>').addClass("rckeyh-title");
    $('<td>').attr('colspan', ntd)
        .text(ckey.title).appendTo(row0);
    table.append(row0);

    var row1 = $('<tr>').addClass("rckeyh-color");
    $('<td>').html("&nbsp;").appendTo(row1);
    var td_img = $('<td>').attr('colspan', ntd - 2);
    td_img.css({
        'margin': 0,
        'padding': 0
    }).appendTo(row1);
    td_img.prepend($('<img>', {
        id: 'rasterColorScaleImageH',
        src: ckey.src
    }));
    $('<td>').html("&nbsp;").appendTo(row1);
    table.append(row1);

    var row2 = $('<tr>').addClass("rckeyh-tick");
    row2.append($('<td>'));
    for (var j = 1; j < nl; ++j) {
        $('<td>').attr('colspan', 2).appendTo(row2);
    }
    row2.append($('<td>'));
    table.append(row2);

    var row3 = $('<tr>').addClass("rckeyh-label");
    for (var j = 0; j < nl; ++j) {
        $('<td>').attr('colspan', 2)
            .text(ckey.labels[j])
            .appendTo(row3);
    }
    table.append(row3);

    var row4 = $('<tr>');
    for (j = 0; j < ntd; ++j) {
        var col = $('<td>').html("&nbsp;");
        col.css({
            'text-align': 'center',
            'line-height': '0px',
            'margin': 0,
            'padding': 0
        });
        row4.append(col);
    }
    table.append(row4);

    return table;
}

// 
function createColorKeyVE(ckey, reverse = true) {
    var ckey = JSON.parse(JSON.stringify(ckey));
    if (reverse) {
        ckey.labels = ckey.labels.reverse();
        ckey.colors = ckey.colors.reverse();
    }
    var nc = ckey.colors.length;
    var nl = ckey.labels.length;
    var ntr = 2 * (nc - 1);

    var kol = [];
    for (j = 0; j < nc; ++j) {
        if (j === 0 || j === nc - 1) {
            kol.push(ckey.colors[j]);
        } else {
            kol.push(ckey.colors[j]);
            kol.push(ckey.colors[j]);
        }
    }

    var table = $('<table>').addClass('ckeyvE');

    for (j = 1; j <= ntr; ++j) {
        var row = $('<tr>');

        var td_col = $('<td>').addClass('ckeyvE-color')
            .css('background-color', kol[j - 1]).appendTo(row);

        var td_tck = $('<td>').addClass('ckeyvE-tick')
            .html("&nbsp;").appendTo(row);

        if (j === 1) {
            td_col.css('border-top', '1px solid black');
        }
        if (j === ntr) {
            td_col.css('border-bottom', '1px solid black');
        }

        if (j % 2 != 0) {
            $('<td>').addClass('ckeyvE-label')
                .attr('rowspan', 2)
                .text(ckey.labels[Math.floor(j / 2)])
                .appendTo(row);

            td_tck.css('border-bottom', '1px solid black');
        }

        if (j === 1) {
            $('<td>').addClass('ckeyvE-title')
                .attr('rowspan', ntr)
                .text(ckey.title).appendTo(row);
        }

        table.append(row);
    }

    return table;
}


// 
function createColorKeyV(ckey) {
    // ckey.labels = ckey.labels.reverse();
    // ckey.colors = ckey.colors.reverse();
    var colh = 96 / ckey.labels.length;
    //
    var table = $('<table>').addClass('ckeyv');
    var row = $('<tr>');
    var col = $('<td>').addClass('ckeyv-color cl-top').attr('rowspan', 2)
        .css('background-color', ckey.colors[0]);
    row.append(col);
    col = $('<td>').addClass('ckeyv-tick').attr('rowspan', 2);
    row.append(col);
    col = $('<td>').addClass('ckeyv-label').attr('rowspan', 1)
        .css('height', '2%');
    row.append(col);
    table.append(row);
    //
    for (j = 0; j < ckey.labels.length; j++) {
        row = $('<tr>');
        col = $('<td>').addClass('ckeyv-label').attr('rowspan', 2)
            .attr('align', 'center').css('height', colh + '%')
            .text(ckey.labels[j]);
        row.append(col);
        table.append(row);
        //
        var class_cl = 'ckeyv-color';
        var class_tk = 'ckeyv-tick';
        if (j == ckey.labels.length - 1) {
            class_cl = class_cl + ' cl-bottom';
            class_tk = class_tk + ' tk-bottom';
        }
        //
        row = $('<tr>');
        col = $('<td>').addClass(class_cl).attr('rowspan', 2)
            .css('background-color', ckey.colors[j + 1]);
        row.append(col);
        col = $('<td>').addClass(class_tk).attr('rowspan', 2);
        row.append(col);
        table.append(row);
    }
    //
    row = $('<tr>');
    col = $('<td>').addClass('ckeyv-label').attr('rowspan', 1)
        .css('height', '2%');
    row.append(col);
    table.append(row);
    //
    return table;
}

/////////////////

function setRasterColorKeyH(container, ckeys) {
    $(container).empty();
    $(container).append(rasterColorKeyH(ckeys));
    $(container + ' .rckeyh').css({
        'width': '300px',
        'height': '60px'
    });
    $(container + ' .rckeyh-label').css('font-size', 10);
}

/////////////////

function formatGEOTIFFColorKey(min, max, int, pretty) {
    if (pretty) {
        var ckey_label = prettyScale(min, max, int);
        var vint = ckey_label.length;
    } else {
        var ckey_label = seqLengthOut(min, max, int, 2);
        var vint = ckey_label.length - 1;
    }

    var vmin = Math.min(...ckey_label);
    var vmax = Math.max(...ckey_label);

    GEOTIFF_DATA.range.min = vmin;
    GEOTIFF_DATA.range.max = vmax;
    GEOTIFF_DATA.range.int = vint;

    var out = {};
    out.min = vmin;
    out.max = vmax;
    out.int = vint;
    out.ckey_label = ckey_label;

    return out;
}