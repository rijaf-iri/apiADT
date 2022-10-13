function selectAWSUserList(json, map) {
    var divSelect = $('<div>').addClass('user-select-aws-list-div');

    // remove all markers
    removeLayerMarkers(map);

    // 
    var divLeft = $('<div>').css({
        'text-align': 'right',
        // 'width': '40%',
    });
    var divCenter = $('<div>').css({
        'text-align': 'center',
        // 'width': '5%',
    });
    var divRight = $('<div>').css({
        'text-align': 'left',
        // 'width': '40%',
    });
    var divFinish = $('<div>').css({
        'text-align': 'left',
        // 'width': '15%',
    });

    var select_left = $('<select>').appendTo(divLeft);
    select_left.attr("multiple", "multiple");
    select_left.attr("size", 20);
    select_left.addClass('form-control');
    select_left.css({
        'width': '100%',
        'height': '300px'
    });

    $.each(json, function() {
        var textGrp = $("<optgroup>");
        textGrp.css("margin", "5px 0");
        textGrp.attr("label", this.text + ' AWS Network');
        for (var i = 0; i < this.children.length; ++i) {
            var val = this.children[i].id;
            var text = this.children[i].text;
            textGrp.append($("<option>").val(val).text(text));
        }
        select_left.append(textGrp);
    });

    //
    var select_right = $('<select>').appendTo(divRight);
    select_right.attr("multiple", "multiple");
    select_right.attr("size", 20);
    select_right.addClass('form-control');
    select_right.css({
        'width': '100%',
        'height': '300px'
    });


    var aws_users = [];
    if (DATA_USERS.awslist.aws.length > 0) {
        aws_users = DATA_USERS.awslist.aws.map(x => x.network_code + "_" + x.aws_id);
        var aws_coords = [];
        for (var i = 0; i < aws_users.length; ++i) {
            var ix = JSON_FLAT.map(x => x.id).indexOf(aws_users[i]);
            if (ix === -1) continue;

            // maybe put in optgroup
            var val = JSON_FLAT[ix].id;
            var text = JSON_FLAT[ix].r_text;
            select_right.append($("<option>").val(val).text(text));
            aws_coords.push(JSON_FLAT[ix]);
        }

        $.each(aws_coords, (ix) => {
            var don = aws_coords[ix];
            var contenu = '<b>' + 'AWS: ' + '<font color="blue">' +
                don.text + '</font>' + '</b>' +
                '<br>' + '<b>AWS network:</b> ' + don.net;

            if (don.lon != null) {
                var marker = L.marker([don.lat, don.lon]).bindPopup(contenu).addTo(map);
                MARKERS_BE.push(marker);
            }
        });
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

            for (var i = 0; i < sel_aws_val.length; ++i) {
                if (aws_users.includes(sel_aws_val[i])) {
                    continue;
                } else {
                    var ix = JSON_FLAT.map(x => x.id).indexOf(sel_aws_val[i]);
                    var val = JSON_FLAT[ix].id;
                    var text = JSON_FLAT[ix].r_text;
                    select_right.append($("<option>").val(val).text(text));
                    // 
                    aws_users.push(sel_aws_val[i]);
                    // 
                    var mat = sel_aws_val[i].split("_");
                    var obj = { "network_code": Number(mat[0]), "aws_id": mat[1] };
                    DATA_USERS.awslist.aws.push(obj);
                    // 
                    var contenu = '<b>' + 'AWS: ' + '<font color="blue">' +
                        JSON_FLAT[ix].text + '</font>' + '</b>' +
                        '<br>' + '<b>AWS network:</b> ' + JSON_FLAT[ix].net;

                    if (JSON_FLAT[ix].lon != null) {
                        var marker = L.marker([JSON_FLAT[ix].lat, JSON_FLAT[ix].lon])
                            .bindPopup(contenu).addTo(map);
                        MARKERS_BE.push(marker);
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

            for (var i = 0; i < sel_aws_val.length; ++i)
                select_right.find('[value="' + sel_aws_val[i] + '"]').remove();

            var datTmp = JSON.parse(JSON.stringify(DATA_USERS.awslist.aws));
            var datUsr = datTmp.map(x => x.network_code + '_' + x.aws_id);
            var datrm = sel_aws_val.map(x => datUsr.indexOf(x));
            for (var i = sel_aws_val.length - 1; i >= 0; i--)
                datTmp.splice(datrm[i], 1);
            DATA_USERS.awslist.aws = datTmp;

            var awsrm = sel_aws_val.map(x => aws_users.indexOf(x));
            for (var i = 0; i < sel_aws_val.length; ++i) {
                map.removeLayer(MARKERS_BE[awsrm[i]]);
                MARKERS_BE[awsrm[i]] = null;
            }
            var mrkB = MARKERS_BE.filter(x => x !== null);
            MARKERS_BE = mrkB;

            for (var i = sel_aws_val.length - 1; i >= 0; i--)
                aws_users.splice(awsrm[i], 1);
        }
    }).appendTo(divCenter);

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: ' Finish ',
        click: () => {
            $('a[href="#selectSTNTab"]').hide();
            $('a[href="#createUserTab"]').click();
        }
    }).appendTo(divFinish);

    // 
    divSelect.append(divLeft);
    divSelect.append(divCenter);
    divSelect.append(divRight);
    divSelect.append(divFinish);

    return divSelect;
}