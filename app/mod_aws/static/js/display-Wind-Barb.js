$(document).ready(() => {
    var back_nb_Day = 90;

    setAWSWindDataTime(back_nb_Day);
    setAWSWindHeigt(MTO_INIT.initWindHGT);
    setAWSWindMetadata('hourly', MTO_INIT.initWindHGT);

    $("#timestepDispTS").on("change", () => {
        setAWSWindHeigt(MTO_INIT.initWindHGT);
        setTimeout(() => {
            var time_step = $("#timestepDispTS option:selected").val();
            var height = $("#windHeight option:selected").val();
            setAWSWindMetadata(time_step, height);
        }, 100);
    });

    $("#windHeight").on("change", () => {
        var time_step = $("#timestepDispTS option:selected").val();
        var height = $("#windHeight option:selected").val();
        setAWSWindMetadata(time_step, height);
    });

    ///// Initialize chart
    setTimeout(() => {
        var data0 = getAWSWindParams();
        plot_WindBarb_MinHourly(data0);
    }, 200);


    $("#plotWindDataBut").on("click", () => {
        var data = getAWSWindParams();
        plot_WindBarb_MinHourly(data);
    });

});

/////////// 

function plot_WindBarb_MinHourly(data) {
    $.ajax({
        type: 'POST',
        url: "/chartWindBarb",
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            $("#contAWSGraph").empty();

            if (json.opts.status != 'plot') {
                flashMessage(json.opts.status, "error");
                return false;
            }

            // highcharts_WindBarb_MinHourly(json);
        },
        beforeSend: () => {
            $("#plotWindDataBut .glyphicon-refresh").show();
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
        $("#plotWindDataBut .glyphicon-refresh").hide();
    });
}