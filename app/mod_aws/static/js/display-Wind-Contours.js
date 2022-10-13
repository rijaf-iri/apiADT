$(document).ready(() => {
    var back_nb_Day = 180;

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
        data0.centre = 'S';
        // // w:70% , h:73%  screen size
        // data0.size = [screen.width * 0.7, screen.height * 0.73];
        // w:70% , h:73% window (viewport) size
        data0.size = [window.innerWidth * 0.7, window.innerHeight * 0.73];
        plot_WindContours_Diurne(data0);
    }, 200);


    $("#plotWindDataBut").on("click", () => {
        var data = getAWSWindParams();
        data.centre = $("#mapcentre option:selected").val();
        data.size = [window.innerWidth * 0.7, window.innerHeight * 0.73];
        plot_WindContours_Diurne(data);
    });


});

/////////// 

function plot_WindContours_Diurne(data) {
    $.ajax({
        type: 'POST',
        url: "/graphWindContours",
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 30000,
        dataType: "json",
        success: (json) => {
            $("#contFreqContour").empty();

            if (json.opts.status != 'plot') {
                flashMessage(json.opts.status, "error");
                return false;
            }

            $("#windcontours").attr("src", json.img);
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