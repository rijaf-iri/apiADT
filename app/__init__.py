from flask import Flask, render_template, flash, session
import datetime
from flask_jsglue import JSGlue
# from flask_session import Session

app = Flask(__name__, instance_relative_config = False)
app.config.from_object("config")
jsglue = JSGlue(app)

#########

# adt_sess = Session()

# # Defaults to 31 days
# app.config["PERMANENT_SESSION_LIFETIME"] = datetime.timedelta(days = 31)
# app.config["SESSION_PERMANENT"] = True
# app.config["SESSION_TYPE"] = "filesystem"
# # The maximum number of items the session stores 
# # before it starts deleting some, default 500
# app.config['SESSION_FILE_THRESHOLD'] = 500  
# # create a folder flask_session
# adt_sess.init_app(app)

#########

@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404

@app.route("/")
def homepage():
    import config
    import json
    import os

    initFile = os.path.join(config.AWS_DATA_DIR, "AWS_DATA",
                            "JSON", "meteoADT_init.json")
    initConn = open(initFile)
    metInfo = json.load(initConn)
    initConn.close()

    flash("Welcome to " + metInfo["metServiceLongname"], "info")
    if 'logged_in' not in session:
        dataUser = {'uid': -1}
    else:
        dataUser = session['data']

    return render_template("main.html", error_login = False,
                        dataUser = dataUser, metInfo = metInfo)

@app.context_processor
def utility_processor():
    def date_now(format = "%d.%m.%Y %H:%M:%S"):
        return datetime.datetime.now().strftime(format)

    return dict(date_now = date_now)

@app.route('/get_flashes')
def get_flashes():
    return render_template('flashes.html')

from app.mod_auth.adt_users import mod_auth as auth_module
from app.mod_aws.adt_aws import mod_aws as aws_module

app.register_blueprint(auth_module)
app.register_blueprint(aws_module)
