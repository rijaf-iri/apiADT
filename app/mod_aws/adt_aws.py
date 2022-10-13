from flask import Blueprint, render_template, request, Response, session
from flask import current_app as app
from rpy2.robjects.packages import importr
import rpy2.robjects.vectors as rvect
import rpy2.robjects as robjects
import json
import tempfile
import os

import config
from app.mod_auth.adt_users import login_required

#####################

mod_aws = Blueprint(
    "aws",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/mod_aws",
)

grdevices = importr("grDevices")
rapiadt = importr("rapiADT")

dataUser = dict()
dirAWS = config.AWS_DATA_DIR

initFile = os.path.join(dirAWS, "AWS_DATA",
                "JSON", "meteoADT_init.json")
initConn = open(initFile)
metInfo = json.load(initConn)
initConn.close()

#####################

def downloadCSVData(csv_data, filename):
    cd = "attachment; filename=" + filename
    downcsv = Response(
        csv_data,
        mimetype = "text/csv",
        headers = {"Content-disposition": cd}
    )
    return downcsv

def downBinaryImage(image_binary, filename, mimetype = "image/jpeg"):
    cd = "attachment; filename=" + filename
    downimg = Response(
        image_binary,
        mimetype = mimetype,
        headers = {"Content-Type": mimetype, "Content-Disposition": cd}
    )
    return downimg


@mod_aws.before_request
def before_request():
    global dataUser
    if 'logged_in' not in session:
        dataUser = {"uid": -1}
    else:
        if session['logged_in']:
            dataUser = session['data']
        else:
            dataUser = {"uid": -1}

@mod_aws.route("/dispAWSCoordsPage")
def dispAWSCoords_page():
    return render_template("display-AWS-Coordinates.html",
                        dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/dispAWSCoordsMap")
def dispAWSCoords_map():
    robj = rapiadt.readCoordsMap(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/dispAWSCoordsTable")
def dispAWSCoordsTable():
    awsnet = request.args.get("awsnet")
    robj = rapiadt.tableAWSCoords(awsnet, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/dispAWSStatusPage")
def dispAWSStatus_page():
    return render_template("display-AWS-Status.html",
                dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/statusVariables")
def statusVariables():
    robj = rapiadt.getStatusVariables(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/dispAWSStatusMap")
def dispAWSStatusMap():
    ltime = request.args.get("ltime")
    varh = request.args.get("varh")
    robj = rapiadt.getStatusData(ltime, varh, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

#######

@mod_aws.route("/downAWSStatusNoUserReq")
@login_required
def downAWSStatusNoUserReq():
    robj = rapiadt.downAWSStatusNoUserReq(dirAWS)
    pyobj = json.loads(robj[0])
    filename = pyobj['filename']
    csv_data = pyobj['csv_data']
    return downloadCSVData(csv_data, filename)

@mod_aws.route("/downAWSStatusUserReqGET")
@login_required
def downAWSStatusUserReqGET():
    var_hgt = request.args.get("var_hgt")
    robj = rapiadt.downAWSStatusUserReqGET(var_hgt, dirAWS)
    pyobj = json.loads(robj[0])
    filename = pyobj['filename']
    csv_data = pyobj['csv_data']
    return downloadCSVData(csv_data, filename)

## return JSON
@mod_aws.route("/downAWSStatusUserReqPOST", methods=["POST"])
@login_required
def downAWSStatusUserReqPOST():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSStatusUserReqPOST(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

## return BLOB
# @mod_aws.route("/downAWSStatusUserReqPOST", methods=["POST"])
# @login_required
# def downAWSStatusUserReqPOST():
#     user_req = json.dumps(request.get_json())
#     robj = rapiadt.downAWSStatusUserReqPOST(user_req, dirAWS)
#     pyobj = json.loads(robj[0])
#     filename = pyobj['filename']
#     csv_data = pyobj['csv_data']
#     return downloadCSVData(csv_data, filename)

#######

@mod_aws.route("/readAWSMetadata")
def readAWSMetadata():
    time_step = request.args.get("time_step")
    robj = rapiadt.readAWSMetadata(time_step, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/readAWSSpatialVars")
def readAWSSpatialVars():
    time_step = request.args.get("time_step")
    robj = rapiadt.readVariableListMap(time_step, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/readVARSMetadata")
def readVARSMetadata():
    time_step = request.args.get("time_step")
    robj = rapiadt.readVARSMetadata(time_step, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

#######

@mod_aws.route("/dispAWSMinDataPage")
def dispAWSMinData_page():
    return render_template("display-AWS-MinData.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/chartMinAWSData", methods=["POST"])
def chartMinAWSData():
    user_req = request.get_json()
    robj = rapiadt.chartMinAWSData(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/mapHourAWSData", methods=["POST"])
def mapHourAWSData():
    user_req = request.get_json()
    robj = rapiadt.mapHourAWSData(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    # pyobj = {"status": "no-data"}
    return json.dumps(pyobj)

@mod_aws.route("/downAWSMinDataCSV", methods=["POST"])
@login_required
def downAWSMinDataCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSMinDataCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSMinOneCSV", methods=["POST"])
@login_required
def downAWSMinOneCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSMinOneCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

#######

@mod_aws.route("/dispAWSAggrDataPage")
def dispAWSAggrData_page():
    return render_template("display-AWS-AggrData.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/chartAggrAWSData", methods=["POST"])
def chartAggrAWSData():
    user_req = request.get_json()
    robj = rapiadt.chartAggrAWSData(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/mapAggrAWSData", methods=["POST"])
def mapAggrAWSData():
    user_req = request.get_json()
    robj = rapiadt.mapAggrAWSData(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/tableAggrAWSData", methods=["POST"])
@login_required
def tableAggrAWSData():
    user_req = request.get_json()
    robj = rapiadt.tableAggrAWSData(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSAggrOneCSV", methods=["POST"])
@login_required
def downAWSAggrOneCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSAggrOneCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSAggrDataCSV", methods=["POST"])
@login_required
def downAWSAggrDataCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSAggrDataCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSAggrCDTCSV", methods=["POST"])
@login_required
def downAWSAggrCDTCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSAggrCDTCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    # pyobj = {"filename": "test.csv", "csv_data": "test data"}
    return json.dumps(pyobj)

#######

@mod_aws.route("/dispAWSAggrDataSelPage")
def dispAWSAggrDataSel_page():
    return render_template("display-AWS-AggrDataSel.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/chartAggrAWSDataSel", methods=["POST"])
def chartAggrAWSDataSel():
    user_req = request.get_json()
    robj = rapiadt.chartAggrAWSDataSel(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    # pyobj = {"opts": {"status": "Test data select stations"}}
    return json.dumps(pyobj)

@mod_aws.route("/tableAggrAWSDataSel", methods=["POST"])
@login_required
def tableAggrAWSDataSel():
    user_req = request.get_json()
    robj = rapiadt.tableAggrAWSDataSel(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSAggrDataSelCSV", methods=["POST"])
@login_required
def downAWSAggrDataSelCSV():
    user_req = json.dumps(request.get_json())
    robj = rapiadt.downAWSAggrDataSelCSV(user_req, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)


#######

@mod_aws.route("/dispAWSAccumulRRPage")
def dispAWSAccumulRR_page():
    return render_template("display-AWS-AccumulRain.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/chartRainAccumul", methods=["POST"])
def chartRainAccumul():
    user_req = request.get_json()
    # robj = rapiadt.chartRainAccumul(json.dumps(user_req), dirAWS)
    # pyobj = json.loads(robj[0])
    pyobj = {"opts": {"status": "Test data select stations"}}
    return json.dumps(pyobj)

@mod_aws.route("/mapRainAccumul", methods=["POST"])
def mapRainAccumul():
    user_req = request.get_json()
    # robj = rapiadt.mapRainAccumul(json.dumps(user_req), dirAWS)
    # pyobj = json.loads(robj[0])
    pyobj = {"status": "no", "msg": "Test map"}
    return json.dumps(pyobj)

#######

@mod_aws.route("/getWindHeight")
def getWindHeight():
    time_step = request.args.get("time_step")
    robj = rapiadt.getWindHeight(time_step, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/readWindMetadata")
def readWindMetadata():
    time_step = request.args.get("time_step")
    height = request.args.get("height")
    robj = rapiadt.readWindMetadata(time_step, height, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

#######

@mod_aws.route("/dispWindBarbPage")
def dispWindBarb_page():
    return render_template("display-Wind-Barb.html",
            dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/chartWindBarb", methods=["POST"])
def chartWindBarb():
    user_req = request.get_json()
    robj = rapiadt.chartWindBarb(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    # pyobj = {"opts": {"status": "Test data select stations"}}
    return json.dumps(pyobj)



#######

@mod_aws.route("/dispWindRosePage")
def dispWindRose_page():
    return render_template("display-Wind-Rose.html",
            dataUser = dataUser, metInfo = metInfo)


@mod_aws.route("/chartWindRose", methods=["POST"])
def chartWindRose():
    user_req = request.get_json()
    robj = rapiadt.chartWindRose(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    # pyobj = {"opts": {"status": "Test data select stations"}}
    return json.dumps(pyobj)



#######

@mod_aws.route("/dispWindContoursPage")
def dispWindContours_page():
    return render_template("display-Wind-Contours.html",
            dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/graphWindContours", methods=["POST"])
def graphWindContours():
    user_req = request.get_json()
    robj = rapiadt.graphWindContours(json.dumps(user_req), dirAWS)
    pyobj = json.loads(robj[0])
    # # pyobj = {"opts": {"status": "Test data select stations"}, "img": 'data:image/jpeg;base64,.....'}
    # pyobj = {"opts": {"status": "Test data select stations"}}
    return json.dumps(pyobj)




#######

@mod_aws.route("/iridlPrecipDataPage")
def iridlPrecipData_page():
    rfeFile = os.path.join(dirAWS, "AWS_DATA",
                    "JSON", "iridl_rainfall_products.json")
    initConn = open(rfeFile)
    dataRFE = json.load(initConn)
    initConn.close()
    return render_template("display-IRIDL-PrecipData.html",
           dataUser = dataUser, metInfo = metInfo, dataRFE = dataRFE)

#######

@mod_aws.route("/dispGriddedDataPagePNG")
def dispGriddedDataPNG_page():
    return render_template("display-AWS-griddedPNG.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/griddedPNGBase64")
def griddedPNGBase64():
    robj = rapiadt.griddedPNGBase64(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

#######

@mod_aws.route("/dispGriddedContourPage")
def dispGriddedContour_page():
    return render_template("display-AWS-Contour.html",
             dataUser = dataUser, metInfo = metInfo)

@mod_aws.route("/griddedCountorMap")
def griddedCountorMap():
    robj = rapiadt.griddedCountorMap(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)
