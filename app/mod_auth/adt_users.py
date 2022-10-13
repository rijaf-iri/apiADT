from flask import Blueprint, render_template, request, flash, session
from flask import current_app as app
from passlib.hash import sha256_crypt
from pymysql.converters import escape_string as thwart
import pymysql

import json
import os
from functools import wraps
import config
from rpy2.robjects.packages import importr

###########

mod_auth = Blueprint(
    'auth', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/mod_auth'
)

rapiadt = importr("rapiADT")
dirAWS = config.AWS_DATA_DIR

initFile = os.path.join(dirAWS, "AWS_DATA",
                "JSON", "meteoADT_init.json")
initConn = open(initFile)
metInfo = json.load(initConn)
initConn.close()

###########

@mod_auth.route("/readCoordsPars")
def readCoordsPars():
    robj = rapiadt.readCoordsPars(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

###########

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash("You need to login first", "warning")
            return render_template("main.html", error_login = True,
                            dataUser = dataUser, metInfo = metInfo)

    return wrap

def convert2json(cursor):
    row_headers = [x[0] for x in cursor.description]
    result = cursor.fetchall()
    json_data = []
    for res in result:
        json_data.append(dict(zip(row_headers, res)))

    return json_data

def connection():
    conn = pymysql.connect(
            host = config.MYSQL_DATABASE_HOST,
            user = config.MYSQL_DATABASE_USER,
            passwd = config.MYSQL_DATABASE_PASSWORD,
            db = config.MYSQL_DATABASE_DB
        )
    cursor = conn.cursor()
    return cursor, conn

def getUserData(username):
    cursor, conn = connection()
    sqlCmd = "SELECT * FROM adt_users WHERE username = (%s)"
    rep = cursor.execute(sqlCmd, thwart(username))

    if int(rep) > 0:
        json_data = convert2json(cursor)
        tmp = json_data[0]['awslist']
        tmp = json.loads(tmp.replace('\\"', '"'))
        json_data[0]['awslist'] = tmp
        json_data[0].pop('password', None)
    else:
        json_data = [{'fullname': 'null'}]

    cursor.close()
    conn.close()
    return json_data

def getUserPassword(username):
    cursor, conn = connection()
    sqlCmd = "SELECT password FROM adt_users WHERE username = (%s)"
    rep = cursor.execute(sqlCmd, thwart(username))

    if int(rep) > 0:
        pwd = convert2json(cursor)
        pwd = pwd[0]['password']
    else:
        pwd = None

    cursor.close()
    conn.close()
    return pwd

###########

@mod_auth.route('/createUser_form')
def createUser_form():
    dataUser = {
        'fullname': '',
        'institution': '',
        'email': '',
        'username': '',
        'password': '',
        'userlevel': 2,
        'useraction': 0,
        'selectstations': 2,
        'awslist':
        {
            'aws': []
        },
        'init': 0,
        'uid': -1
    }

    return render_template("user-management.html", dataUser = dataUser,
                            registred_ok = False, metInfo = metInfo)

@mod_auth.route("/createUser", methods=["POST"])
def createUser():
    dataUser = request.get_json()
    username = dataUser["username"]
    password = dataUser['password']
    email = dataUser["email"]
    fullname = dataUser["fullname"]
    institution = dataUser["institution"]
    userlevel = dataUser["userlevel"]
    useraction = dataUser["useraction"]
    selectstations = dataUser["selectstations"]
    awslist = json.dumps(dataUser["awslist"])
    initUser = dataUser["init"]

    ### password = sha256_crypt.encrypt(str(password))
    password = sha256_crypt.hash(str(password))
    cursor, conn = connection()

    sqlCmd = "SELECT * FROM adt_users WHERE username = (%s)"
    rep = cursor.execute(sqlCmd, thwart(username))

    if int(rep) > 0 and initUser == 0:
        status = False
    else:
        if(initUser == 0):
            sqlCmd = """
                     INSERT INTO adt_users 
                     (username, password, email, fullname, institution, 
                     userlevel, useraction, selectstations, awslist) 
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(sqlCmd,
                          (
                            thwart(username),
                            thwart(password),
                            thwart(email),
                            thwart(fullname),
                            thwart(institution),
                            userlevel,
                            useraction,
                            selectstations, 
                            thwart(awslist)
                          )
                        )
            conn.commit()
            status = True
        else:
            uid = dataUser["uid"]
            sqlCmd = """
                     UPDATE adt_users SET
                     username=%s, password=%s, email=%s, 
                     fullname=%s, institution=%s, userlevel=%s, 
                     useraction=%s, selectstations=%s, awslist=%s 
                     WHERE uid=%s"""
            cursor.execute(sqlCmd,
                          (
                            thwart(username),
                            thwart(password),
                            thwart(email),
                            thwart(fullname),
                            thwart(institution),
                            userlevel,
                            useraction,
                            selectstations, 
                            thwart(awslist),
                            uid
                          )
                        )
            conn.commit()
            status = True

    cursor.close()
    conn.close()
    return render_template("user-management.html", dataUser = dataUser,
                           registred_ok = status, metInfo = metInfo)

###########

@mod_auth.route('/editUser', methods = ['POST'])
def editUser():
    username = request.form['username']
    json_data = getUserData(username)
    return json.dumps(json_data[0])

###########

@mod_auth.route('/getUsers')
def getListOfUsers():
    cursor, conn = connection()
    cursor.execute("SELECT * FROM adt_users")
    json_data = convert2json(cursor)
    cursor.close()
    conn.close()

    for i in range(len(json_data)):
        tmp = json_data[i]['awslist']
        tmp = json.loads(tmp.replace('\\"', '"'))
        json_data[i]['awslist'] = tmp
        pwd_data = json_data[i]
        pwd_data.pop('password', None)

    return json.dumps(json_data)

###########

@mod_auth.route('/removeUser', methods = ['POST'])
def removeUser():
    username = request.form['username']
    json_data = getUserData(username)

    if(json_data[0]['fullname'] != 'null'):
        cursor, conn = connection()
        sqlCmd = "DELETE FROM adt_users WHERE username = (%s)"
        cursor.execute(sqlCmd, thwart(username))
        conn.commit()
        cursor.close()
        conn.close()

    return json.dumps(json_data)

###########

@mod_auth.route('/login', methods = ["POST"])
def loginUser():
    try:
        username = request.form['username']
        password = request.form['password']
        remember = True if request.form.get('remember') else False
        hass_pass = getUserPassword(username)
        msg = "Please check your login details and try again."

        if hass_pass is None:
            flash(msg, "error")
            return render_template("main.html", error_login = True,
                            dataUser = dataUser, metInfo = metInfo)
        else:
            if sha256_crypt.verify(password, hass_pass):
                session['logged_in'] = True
                dataUser = getUserData(username)[0]
                data = {
                    'username': dataUser['username'],
                    'userlevel': dataUser['userlevel'],
                    'useraction': dataUser['useraction'],
                    'selectstations': dataUser['selectstations'],
                    'awslist': dataUser['awslist'],
                    'uid': dataUser['uid']
                }
                session['data'] = data
                flash("You are now logged in.", "success")
                return render_template("main.html", error_login = False,
                                dataUser = data, metInfo = metInfo)
            else:
                flash(msg, "error")
                return render_template("main.html", error_login = True,
                                dataUser = dataUser, metInfo = metInfo)

    except Exception as e:
        flash("Please check your login details and try again.", "error")
        return render_template("main.html", error_login = True,
                        dataUser = dataUser, metInfo = metInfo)

###########

@mod_auth.route("/logout")
def logoutUser():
    session['logged_in'] = False
    session.pop('data', None)
    session.clear()
    dataUser = {"uid": -1}
    flash("You have been logged out.", "success")
    return render_template("main.html", error_login = False,
                    dataUser = dataUser, metInfo = metInfo)

