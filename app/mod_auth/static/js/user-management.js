$(document).ready(function() {
    var json_data;
    $.getJSON('/readCoordsPars', (json) => {
        json_data = formatJSONCoordsToSelect2(json.data);
        JSON_FLAT = flatJSONCoordsFromSelect2(json_data);
    });

    ///////////////////////

    $('a[href="#selectSTNTab"]').css('display', 'none');
    $('a[href="#dispUserTab"]').css('display', 'none');
    $('a[href="#removeUserTab"]').css('display', 'none');
    $('a[href="#editUserTab"]').css('display', 'none');

    // 
    setUserForm();
    var usr_selectstations = 2;
    userAccessSelect();

    ///////////////////////

    $("#createNewUser").on("click", function() {
        $('a[href="#selectSTNTab"]').hide();
        $('a[href="#removeUserTab"]').hide();
        // $('a[href="#dispUserTab"]').hide();
        $('a[href="#editUserTab"]').hide();

        $('a[href="#createUserTab"]').show();
        $('a[href="#createUserTab"]').click();
        $("#register-userf").remove();

        $.ajax('/createUser_form').done(function(reply) {
            var results = $.parseHTML(reply);
            var html = $(results).find("#register-userf");
            $("#register-cont").html(html).appendTo($("#createUserTab"));

            DATA_USERS.awslist = new Object();
            DATA_USERS.awslist.aws = [];
            var tmp;
            GEOM_ID = tmp;
            GEOM_SELECTED = [];

            setUserForm();
            userAccessSelect();
        });
    });

    ///////////////////////

    $("#register-cont").on("click", "#btn-submit-user", function() {
        var form_ok = validate_form();
        if (!form_ok) {
            return false;
        }

        DATA_USERS.fullname = $('#fullname').val();
        DATA_USERS.institution = $('#institution').val();
        DATA_USERS.email = $('#email').val();
        DATA_USERS.username = $('#username').val();
        DATA_USERS.password = $('#password').val();

        $.ajax({
            type: 'POST',
            url: '/createUser',
            data: JSON.stringify(DATA_USERS),
            contentType: "application/json",
            error: (request, status, error) => {
                displayAjaxError(request, status, error);
            }
        }).done(function(reply) {
            $('a[href="#selectSTNTab"]').hide();
            $('a[href="#removeUserTab"]').hide();
            // $('a[href="#dispUserTab"]').hide();
            $('a[href="#editUserTab"]').hide();

            $('a[href="#createUserTab"]').show();
            $('a[href="#createUserTab"]').click();
            $("#register-userf").remove();

            var results = $.parseHTML(reply);
            var html = $(results).find("#register-userf");
            $("#register-cont").html(html).appendTo($("#createUserTab"));

            if ($('#register-response').hasClass('response-ok')) {
                if (DATA_USERS.init > 0) {
                    flashMessage("Username: " + DATA_USERS.username + " Updated Successfully!", "success");
                    $("#register-userf h2").text("User Updated");
                } else {
                    flashMessage("New User Added Successfully!", "success");
                }
                var divreply = displayUserInfos();
                $('#create-user-reply').append(divreply);
            }
            if ($('#register-response').hasClass('response-fail')) {
                flashMessage("Username: " + DATA_USERS.username + " already exists!", "error");

                setUserForm();
                userAccessSelect();
            }
        });
    });

    ///////////////////////

    $("#displayUsers").on("click", function() {
        $('a[href="#createUserTab"]').hide();
        $('a[href="#selectSTNTab"]').hide();
        $('a[href="#removeUserTab"]').hide();
        $('a[href="#editUserTab"]').hide();

        $('a[href="#dispUserTab"]').show();
        $('a[href="#dispUserTab"]').click();
        $('#userInfos').empty();

        $.ajax({
            url: '/getUsers',
            dataType: "json",
            success: (json) => {
                $('.jsonTable').remove();
                $("#idTable").append(displayUsersTable(json));
            }
        });
    });

    ///////////////////////

    $("#editUser").on("click", function() {
        $('a[href="#selectSTNTab"]').hide();
        $('a[href="#removeUserTab"]').hide();
        // $('a[href="#dispUserTab"]').hide();
        $('a[href="#createUserTab"]').hide();

        $('a[href="#editUserTab"]').show();
        $('a[href="#editUserTab"]').click();
    });

    $("#btn-submit-edit").on("click", function() {
        var username = $('#editUsername').val();
        $.ajax({
            url: '/editUser',
            data: { username: username },
            type: 'POST',
            success: (json) => {
                json = JSON.parse(json);
                if (json.fullname == 'null') {
                    flashMessage("User: " + username + " does not exist", "error");
                } else {
                    $('a[href="#editUserTab"]').hide();
                    $('a[href="#createUserTab"]').show();
                    $('a[href="#createUserTab"]').click();
                    $("#register-userf").remove();

                    $.ajax('/createUser_form').done(function(reply) {
                        var results = $.parseHTML(reply);
                        var html = $(results).find("#register-userf");
                        $("#register-cont").html(html).appendTo($("#createUserTab"));

                        DATA_USERS = json;
                        DATA_USERS.init = 1;
                        setUserForm();
                        userAccessSelect();
                    });
                }
            },
            error: (request, status, error) => {
                displayAjaxError(request, status, error);
            }
        });
    });

    ///////////////////////

    $("#removeUser").on("click", function() {
        $('a[href="#createUserTab"]').hide();
        $('a[href="#selectSTNTab"]').hide();
        // $('a[href="#dispUserTab"]').hide();
        $('a[href="#editUserTab"]').hide();

        $('a[href="#removeUserTab"]').show();
        $('a[href="#removeUserTab"]').click();
    });

    $('#btn-submit-rm').click(function() {
        var username = $('#rmUsername').val();
        $.ajax({
            url: '/removeUser',
            data: { username: username },
            type: 'POST',
            success: (json) => {
                json = JSON.parse(json);
                if (json[0].fullname == 'null') {
                    flashMessage("User: " + username + " does not exist", "error");
                } else {
                    $('#rmUserTable').empty();
                    DATA_USERS = json[0];
                    $('#rmUserTable').append($('<h2>').text('User ' + username + ' removed'));
                    $('#rmUserTable').append(displayUserInfos());

                    flashMessage("User: " + username + " removed successfully from database", "success");
                }
            },
            beforeSend: () => {
                var msg = "Are you sure to delete: " + username + "?";
                return confirm(msg);
            },
            error: (request, status, error) => {
                displayAjaxError(request, status, error);
            }
        });
    });

    ///////////////////////

    function setUserForm() {
        $('#fullname').val(DATA_USERS.fullname);
        $('#institution').val(DATA_USERS.institution);
        $('#email').val(DATA_USERS.email);
        $('#username').val(DATA_USERS.username);

        // 
        var userlvl = [
            ['0', 'Administrator'],
            ['1', 'All Stations'],
            ['2', 'Selected Stations']
        ];
        for (var i = 0; i < userlvl.length; ++i) {
            $('#userlevel').append(
                $("<option>").text(userlvl[i][1]).val(userlvl[i][0])
            );
        }
        $('#userlevel').val(DATA_USERS.userlevel);
        // 
        var useract = [
            ['0', 'Display and Download'],
            ['1', 'Display Only']
        ];
        for (var i = 0; i < useract.length; ++i) {
            $('#useraction').append(
                $("<option>").text(useract[i][1]).val(useract[i][0])
            );
        }
        $('#useraction').val(DATA_USERS.useraction);

        var userstn = [
            ['0', 'All'],
            ['1', 'Geographic'],
            ['2', 'Stations']
        ];
        for (var i = 0; i < userstn.length; ++i) {
            $('#selectstations').append(
                $("<option>").text(userstn[i][1]).val(userstn[i][0])
            );
        }
        $('#selectstations').val(DATA_USERS.selectstations);
        $('#selectstations').children('option[value="0"]').hide();

        if ($("#userlevel option:selected").val() == '0') {
            $("label[for='useraction']").hide();
            $("#useraction").hide();
        }
        if ($("#userlevel option:selected").val() != '2') {
            $("label[for='selectstations']").hide();
            $('#selectstations').hide();
            $("#userSelectStations").hide();
        }
    }

    ///////////////////////

    function userAccessSelect() {
        $('#userlevel').on('change', function() {
            var userlvl = $("#userlevel option:selected").val();
            if (userlvl == '0') {
                DATA_USERS.userlevel = 0;
                DATA_USERS.useraction = 0;
                DATA_USERS.selectstations = 0;

                DATA_USERS.awslist = new Object();
                DATA_USERS.awslist.aws = [];

                $("#useraction").val(DATA_USERS.useraction);
                $("#selectstations").val(DATA_USERS.selectstations);

                $("label[for='useraction']").hide();
                $("#useraction").hide();
                $("label[for='selectstations']").hide();
                $("#selectstations").hide();
                $("#userSelectStations").hide();

                $('a[href="#selectSTNTab"]').hide();
            } else {
                $("label[for='useraction']").show();
                $("#useraction").show();
                if (userlvl == '1') {
                    DATA_USERS.userlevel = 1;
                    DATA_USERS.selectstations = 0;

                    DATA_USERS.awslist = new Object();
                    DATA_USERS.awslist.aws = [];

                    $("#useraction").val(DATA_USERS.useraction);
                    $("#selectstations").val(DATA_USERS.selectstations);

                    $("label[for='selectstations']").hide();
                    $("#selectstations").hide();
                    $("#userSelectStations").hide();

                    $('a[href="#selectSTNTab"]').hide();
                } else {
                    $("label[for='selectstations']").show();
                    $("#selectstations").show();
                    $("#userSelectStations").show();

                    DATA_USERS.userlevel = 2;
                    if (DATA_USERS.selectstations == 0) {
                        DATA_USERS.selectstations = usr_selectstations;
                    }

                    $("#useraction").val(DATA_USERS.useraction);
                    $("#selectstations").val(DATA_USERS.selectstations);

                    $('a[href="#selectSTNTab"]').show();
                }
            }
        });

        $('#useraction').on('change', function() {
            var usr = $("#useraction option:selected").val();
            DATA_USERS.useraction = Number(usr);
        });

        $('#selectstations').on('change', function() {
            var sel = $("#selectstations option:selected").val();
            DATA_USERS.selectstations = Number(sel);
            usr_selectstations = DATA_USERS.selectstations;

            // DATA_USERS.awslist = new Object();
            // DATA_USERS.awslist.aws = [];
        });
        // 

        $("#userSelectStations").on("click", function() {
            $('a[href="#selectSTNTab"]').show();
            $('a[href="#selectSTNTab"]').click();

            var mymap;
            if (MAP_BE != undefined) {
                MAP_BE = mymap;
            }
            $('#selectSTNform').empty();

            var select_type = $("#selectstations option:selected").val();

            if (select_type == "1" || select_type == "2") {
                var divContainer = $('<div>').addClass('user-select-aws-tab');
                var divContAWSMap = $('<div>').attr("id", "mapAWSUser");
                var divContAWSSel = $('<div>').attr("id", "selAWSUser");

                divContAWSMap.css({ 'width': '100%', 'height': '80vh' });
                divContAWSSel.css('width', '100%');

                if (select_type == "1") {
                    divContainer.append(divContAWSMap);
                    divContainer.append(divContAWSSel);
                    selectAWSUserFun = selectAWSUserMap;
                } else {
                    divContainer.append(divContAWSSel);
                    divContainer.append(divContAWSMap);
                    selectAWSUserFun = selectAWSUserList;
                }

                $('#selectSTNform').append(divContainer);

                var mymap = createLeafletTileLayer("mapAWSUser");
                mymap.invalidateSize();

                if (select_type == "1") {
                    divContAWSSel.append(selectAWSUserFun(mymap));
                } else {
                    divContAWSSel.append(selectAWSUserFun(json_data, mymap));
                }
            }
        });
    }
});

///////////////////////

function display_message(parent, text) {
    $('.required-field').remove();
    var msg = $('<ul>').addClass('required-field errors');
    $('<li>').appendTo(msg).html(text);

    msg.insertAfter(parent);
}

function validate_form() {
    var inputs = $("#divCreateUser input");
    for (i = 0; i < inputs.length; i++) {
        if ($.trim(inputs[i].value) == '') {
            var id = '#' + inputs[i].id;
            var text = 'Please fill out this field.';
            display_message(id, text);
            return false;
        } else {
            $('.required-field').remove();
        }
    }

    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test($('#email').val())) {
        display_message('#email',
            "Please enter a valid email address");
        return false;
    }

    var pwd1 = $('#password').val();
    var pwd2 = $('#confirm').val();

    if (pwd1.length < 4) {
        display_message('#password',
            "The password must be at least 4 characters");
        return false;
    }

    if (pwd1 != pwd2) {
        display_message('#confirm',
            "Passwords did not match");
        return false;
    }

    return true;
}

function displayUserInfos() {
    var divReply = $('<div>');
    var labels = ['Username', 'Email Address', 'Full Name', 'Institution'];
    var values = ["username", "email", "fullname", "institution"];

    var table = $('<table>').css({
        'border-collapse': 'separate',
        'border-spacing': '20px 5px'
    });

    for (i = 0; i < labels.length; i++) {
        var row = $('<tr>');
        $('<td>').text(labels[i]).css('font-weight', 'bold').appendTo(row);
        $('<td>').text(DATA_USERS[values[i]]).appendTo(row);
        table.append(row);
    }
    var userlvl = ['Administrator', 'All Stations', 'Selected Stations'];
    var row = $('<tr>');
    $('<td>').text("User Access").css('font-weight', 'bold').appendTo(row);
    $('<td>').text(userlvl[DATA_USERS.userlevel]).appendTo(row);
    table.append(row);

    var useract = ['Display and Download', 'Display Only'];
    var row = $('<tr>');
    $('<td>').text("User Action").css('font-weight', 'bold').appendTo(row);
    $('<td>').text(useract[DATA_USERS.useraction]).appendTo(row);
    table.append(row);

    var userstn = ['All Stations', 'Geographic', 'List of stations'];
    var row = $('<tr>');
    $('<td>').text("Stations Selection").css('font-weight', 'bold').appendTo(row);
    $('<td>').text(userstn[DATA_USERS.selectstations]).appendTo(row);
    table.append(row);

    divReply.append(table);

    if (DATA_USERS.userlevel == 2) {
        if (DATA_USERS.selectstations == 1) {
            $('<hr>').appendTo(divReply);
            $('<p>').html(' <strong> Administrative subdivision </strong>').appendTo(divReply);

            var subdiv = subdivision_names[DATA_USERS.awslist.subdivision].selectName

            var geojson_data = select_administrative_geojson(DATA_USERS.awslist.subdivision);
            var out = [];
            for (i = 0; i < DATA_USERS.awslist.geomselected.length; i++) {
                var ix = geojson_data.features.map(x => x.properties[DATA_USERS.awslist.geomid])
                    .indexOf(DATA_USERS.awslist.geomselected[i]);
                out.push(geojson_data.features[ix].properties[DATA_USERS.awslist.geomdisp]);
            }
            out = out.join("; ");

            var table = $('<table>').css({
                'border-collapse': 'separate',
                'border-spacing': '10px 5px'
            });

            var row = $('<tr>');
            $('<td>').text("Subdivision").css('font-weight', 'bold').appendTo(row);
            $('<td>').text(subdiv).appendTo(row);
            table.append(row);

            var row = $('<tr>');
            $('<td>').text("Selected " + subdiv).css('font-weight', 'bold').appendTo(row);
            $('<td>').text(out).appendTo(row);
            table.append(row);

            divReply.append(table);
        }

        $('<hr>').appendTo(divReply);
        $('<p>').html(' <strong> Selected Stations </strong>').appendTo(divReply);

        var out = [];
        for (i = 0; i < DATA_USERS.awslist.aws.length; i++) {
            id_aws = DATA_USERS.awslist.aws[i].network_code + '_' + DATA_USERS.awslist.aws[i].aws_id;
            ix = JSON_FLAT.map(x => x.id).indexOf(id_aws);
            out.push(JSON_FLAT[ix].r_text);
        }

        var table = $('<table>').css({
            'border-collapse': 'separate',
            'border-spacing': '5px'
        });

        for (i = 0; i < out.length; i++) {
            // (i % 3 == 0)
            if (i % 2 == 0) {
                var row = $('<tr>').appendTo(table);
            }
            $('<td>').text(out[i]).appendTo(row);
        }
        divReply.append(table);
    }

    return divReply;
}

function displayUsersTable(json) {
    var jsObj = ['uid', 'username', 'userlevel', 'email', 'fullname', 'institution'];
    var colHeader = ["N°", "Username", "User Access", "Email", "Full Name", "Institution"];
    var userlvl = ['Administrator', 'All Stations', 'Selected Stations'];

    var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
    var head = $('<tr>');
    for (i = 0; i < colHeader.length; i++) {
        var col = $('<th>').text(colHeader[i]);
        head.append(col);
    }
    table.append(head);

    for (i = 0; i < json.length; i++) {
        var row = $('<tr>');
        for (var j = 0; j < jsObj.length; j++) {
            if (j == 1) {
                html = '<a class="userLink">' + json[i][jsObj[j]] + "</a>";
                col = $('<td>').html(html);
                col.on('click', function() {
                    usern = $(this).find('a.userLink').text();
                    ic = json.map(x => x.username).indexOf(usern);
                    DATA_USERS = json[ic];
                    $('#userInfos').empty();
                    info = $('<h2>').text('User Information: ' + usern);
                    $('#userInfos').append(info);
                    $('#userInfos').append(displayUserInfos());
                });
            } else if (j == 2) {
                txt = userlvl[json[i][jsObj[j]]];
                col = $('<td>').text(txt);
            } else {
                txt = json[i][jsObj[j]];
                col = $('<td>').text(txt);
            }
            row.append(col);
        }
        table.append(row);
    }

    return table;
}