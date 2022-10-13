function disp_Table_Coords(awsnet) {
    $.ajax({
        dataType: "json",
        data: { awsnet: awsnet },
        url: '/dispAWSCoordsTable',
        timeout: 30000,
        success: (json) => {
            $('.jsonTable').remove();

            //
            var colHeader = Object.keys(json[0]);
            var colNb = colHeader.length;
            var rowNb = json.length;
            //
            var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
            var rowh = $('<tr>');
            rowh.append($('<th>').text(' N° '));
            for (var i = 0; i < colNb; i++) {
                var col = $('<th>').text(colHeader[i]);
                rowh.append(col);
            }
            table.append(rowh);
            for (var i = 0; i < rowNb; i++) {
                var row = $('<tr>');
                row.append($('<td>').text(i + 1));
                for (var j = 0; j < colNb; j++) {
                    var col = $('<td>').text(json[i][colHeader[j]]);
                    row.append(col);
                }
                table.append(row);
            }
            //
            $('#crdTable').append(table);
            $('.jsonTable td:nth-child(1)').css('font-weight', 'normal');
            $('.jsonTable td:nth-child(2)').css('font-weight', 'bold');
        },
        beforeSend: () => {
            $("#awsCrdTable .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                flashMessage("Take too much time to render, refresh your web browser", "error")
            } else {
                displayAjaxError(request, status, error);
            }
        }
    }).always(() => {
        $("#awsCrdTable .glyphicon-refresh").hide();
    });
}

$("#awsCrdTable").on("click", () => {
    $('a[href="#awstable"]').click();
    //
    var awsnet = $("#awsnet option:selected").val();
    disp_Table_Coords(awsnet);
});

// download
$("#downMissCoords").on("click", () => {
    downloadHtmlTableToCSV("#missTable", "AWS_Missing_Coordinates.csv");
});

$("#downNetworkTable").on("click", () => {
    var awsnet = $("#awsnet option:selected").val();
    file_name = AWSCOORDS_JSON.netinfo[awsnet].name + '_Coordinates_table.csv'
    downloadHtmlTableToCSV("#jsonTable", file_name);
});