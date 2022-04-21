from flask import Flask, send_from_directory
from flask import jsonify
from flask import request

from flask_cors import CORS, cross_origin
import datetime

import json
import os

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

import firebase_admin

from models import Account, Transaction
import models

from firebase_admin import credentials, firestore

app = Flask(__name__, static_folder='react-frontend/build', static_url_path='')

app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET')

jwt = JWTManager(app)

cred = credentials.Certificate("D:\\Documents\\LedgerApp\\flask-app\\gitignore\\cred.json")

firebase_app = firebase_admin.initialize_app(cred)
db = firestore.client()
CORS(app)

accounts = db.collection("account")
users = db.collection("users")
transaction_collection = db.collection("transaction")

# Used to route the server to the react-frontend
@app.route('/')
@cross_origin()
def index():
    print('in route origin')
    return send_from_directory(app.static_folder, 'index.html')

# Extra step when using react router
@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

# Login Route
@app.route("/login", methods=['GET', 'POST'])
def login():

    # Get the passed in username and password
    username = request.json.get("username")
    password = request.json.get("password")

    #query the user collection to find the matching pair
    current_user = []

    # try to query the database, catch any database related errors
    try:
        current_user = users.where("username", "==", username).where("password", "==", password).get()
    except NameError:
        return jsonify(NameError), 500

    # If no user is found, or if more than 1 user has the same username/password, return an error
    if len(current_user) != 1:
        return jsonify('Didnt find a user with those credentials'), 404
    else:
        print(username)
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 201

# Get Accounts Route
@app.route("/accounts", methods=['GET'])
@jwt_required()
def get_accounts():

    # Get the user associated with the jwt key
    user_id = get_jwt_identity()
    
    # Query the user collection to find the matching pair
    user_accounts = []

    # Try to query the database, catch any database related errors
    try:
        user_accounts = accounts.where("user_id", "==", user_id).get()
    except NameError:
        return jsonify(NameError), 500

    account_json = []
    for account in user_accounts :
        account_json.append(account.to_dict())
    
    return jsonify(account_json), 201

# Create an account route
@app.route("/create_account", methods=['POST'])
@jwt_required()
def create_account():
    # get the user associated with the jwt key
    user_id = get_jwt_identity()

    # generate a random string for the id
    id = models.create_new_key()

    # initialize a new account for the user with balance 0
    new_account = Account(id,
        models.create_new_key(),
        models.create_random_account_number(), 0, user_id)

    account_json = new_account.to_json()

    # try to post to the database, catch any database related errors
    try:
        accounts.document(id).set(json.loads(account_json))
        # print(response)
    except NameError:
        return jsonify(NameError), 500

    return jsonify(json.loads(account_json))

# Get Transaction Route
@app.route("/transactions", methods=['POST'])
@jwt_required()
def get_transactions():
    
    # hold all of the transactions for this api call here
    account_transactions = []

    account_id = request.json.get("account_id")

    try:
        # if the query isn't for a specific account, get all the users transactions
        if account_id is None:
            user_id = get_jwt_identity()
            print(user_id)
            account_transactions = transaction_collection.where("user_id", "==", user_id).get()
        else:
            account_transactions = transaction_collection.where("account_id", "==", account_id).get()
    except NameError:
        return jsonify(NameError), 500

    transaction_json = []

    # loop through all the transactions and return the json
    for transaction in account_transactions :
        transaction_json.append(transaction.to_dict())

    return jsonify(transaction_json), 201

# Post Transaction Route
@app.route("/post_transaction", methods=['POST'])
@jwt_required()
def post_transaction(): 

    # get the user associated with the jwt key
    user_id = get_jwt_identity()

    # get the passed in Type and Amount of the Transaction
    transaction_type = request.json.get("type")
    amount = request.json.get("amount")
    amount = int(amount)
    account_id = request.json.get("id")
    account_number = request.json.get("accountNumber")
    note = request.json.get("note")

    try:
        # first find the account and update the account balance
        account_ref = accounts.where("id", "==", account_id)
        account = account_ref.get()[0].to_dict()
        current_balance = account['current_balance']

        if transaction_type == "CREDIT":
            current_balance = current_balance + amount
        elif transaction_type == "DEBIT":
            current_balance = current_balance - amount

        account['current_balance'] = current_balance

        db.collection("account").document(account_id).update(account)

        # after updating the account balance, post the transaction
        new_transaction_id = models.create_new_key()
        new_transaction = Transaction(new_transaction_id,
            account_id, datetime.datetime.now(), 
            transaction_type, amount, user_id,
            account_number, note)

        transaction_json = new_transaction.to_json()

        transaction_collection.document(new_transaction_id).set(json.loads(transaction_json))

    except NameError:
        return jsonify(NameError), 500

    return jsonify(account), 201

if __name__ == "__main__":
    app.run(debug=True)
