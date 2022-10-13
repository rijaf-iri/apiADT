setTimeout(() => {
    var path = "/static/images/";
    $('link[rel="shortcut icon"]').attr("href", path + MTO_INIT.iconImage);
    $('.meteo-logo').attr("src", path + MTO_INIT.metLogo);
}, 100);