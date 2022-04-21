import random
import string
import json

def randomString(stringLength = 20):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))

def create_new_key():
    return randomString()

def create_random_account_number():
    return ''.join(random.choice(string.digits) for i in range(12))

class User:
    id = ''
    username = ''
    password = ''

    # parameterized constructor for User
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    def to_json(self):
        return json.dumps(self.__dict__)

class Account:
    id = ''
    account_id = ''
    account_number = ''
    current_balance = 0
    user_id = ''

    # parameterized constructor for Account
    def __init__(self, id, account_id, account_number, current_balance, user_id):
        self.id = id
        self.account_id = account_id
        self.account_number = account_number
        self.current_balance = current_balance
        self.user_id = user_id

    def to_json(self):
        return json.dumps(self, default = lambda o: o.__dict__, 
            sort_keys=True, indent=4)

    def post_transaction(transaction):
        if transaction.transaction_type == 'CREDIT':
            current_balance = current_balance + transaction.amount
        elif transaction.transaction_type == 'DEBIT':
            current_balance = current_balance - transaction.amount

class Transaction:
    id = ''
    date = ''
    account_id = ''
    account_number = ''
    note = ''
    transaction_type = ''
    note = ''
    amount = ''
    user_id = ''

    # parameterized constructor for Transaction
    def __init__(self, id, account_id, date, transaction_type,
            amount, user_id, account_number, note):
        self.id = id
        self.account_id = account_id
        self.date = date
        self.transaction_type = transaction_type
        self.amount = amount
        self.user_id = user_id
        self.account_number = account_number
        self.note = note

    def to_json(self):
        return json.dumps(self.__dict__, indent=4, sort_keys=True, default=str)