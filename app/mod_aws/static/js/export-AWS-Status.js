$("#downActiveMap").on("click", () => {
    var ltime = $("#lastAvail option:selected").val();
    var varname = $("#statusVar option:selected").text();
    varname = varname.replace(/\@/g, '');
    // varname = varname.replace(/\s\s+/g, "-");
    varname = varname.replace(/ +/g, "-");

    var file_name = varname + '_Last_' + ltime +
        '_Time_' + AWS_DATA.time + '.csv';
    downloadJsonObjToCSV(AWS_DATA.data, file_name);
});

////////////////////
// // test with no user request
// // use <a> tag 
// 
// $("#downHourlyGET").on("click", () => {
//     var url = "/downAWSStatusNoUserReq";
//     $("#downHourlyGET").attr("href", url).attr('target', '_blank');
// });

////////////////////
// test with user request
// use <a> tag, and GET
// can't handle nested JSON data, or containing array

$("#downHourlyGET").on("click", () => {
    var data = {
        var_hgt: $("#statusVar option:selected").val()
    };
    var url = '/downAWSStatusUserReqGET' + '?' + encodeQueryData(data);
    $("#downHourlyGET").attr("href", url).attr('target', '_blank');
});

////////////////////
// with user request
//use <button>, POST and ajax
// good for nested JSON data

$("#downHourlyPOST").on("click", () => {
    var data = {
        "var_hgt": $("#statusVar option:selected").val(),
        "user": DATA_USERS
    };

    //////////////
    // text and csv data

    $.ajax({
        type: 'POST',
        url: '/downAWSStatusUserReqPOST',
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

    //////////////
    // binary data

    // $.ajax({
    //     type: 'POST',
    //     url: '/downAWSStatusUserReqPOST',
    //     data: JSON.stringify(data),
    //     contentType: "application/json",
    //     timeout: 20000,
    //     xhrFields: {
    //         responseType: 'blob'
    //     },
    //     success: (blob, status, xhr) => {
    //         // default filename to use if not found
    //         // var filename = "download.csv"
    //         var varname = $("#statusVar option:selected").text();
    //         varname = varname.replace(/\@/g, '');
    //         varname = varname.replace(/ +/g, "-");
    //         var filename = varname + '_' + AWS_DATA.time + '.csv';

    //         // check for a filename, if exists, and use it
    //         var dispos = xhr.getResponseHeader('Content-Disposition');
    //         if (dispos && dispos.indexOf('attachment') !== -1) {
    //             var pregex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    //             var matches = pregex.exec(dispos);
    //             if (matches != null && matches[1]) {
    //                 filename = matches[1].replace(/['"]/g, '');
    //             }
    //         }

    //         createDownloadableLink(blob, filename);
    //     },
    //     error: (request, status, error) => {
    //         if (status === "timeout") {
    //             var msg = "Take too much time to render";
    //             flashMessage(msg, "error");
    //         } else {
    //             displayAjaxError(request, status, error);
    //         }
    //     }
    // });

    ///// 
});