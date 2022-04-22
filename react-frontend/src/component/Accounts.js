import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import '../index.css'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

class Accounts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: [],
            openModal: false,
            currentAccountId: null,
            accountNumber: null,
            note: "Coffee",
            amount: 0,
            type: "CREDIT"
        }
    }

    handleClose = () => {
        this.setState({
            openModal: false
        })
    }

    async componentDidMount() {
        await this.getAccounts();
    };

    /**
     * Get the user accounts by calling the /accounts endpoint.
     * If a bad response is caught, and no accounts can be loaded,
     * sign the user off and back to the login page.
     */
    getAccounts = async () => {

        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        }

        try {
            const response = await fetch("/accounts", options);
            const data = await response.json();

            // Check the API response
            if (!response.ok) {

                const responseError = {
                    type: 'Error',
                    message: data.msg || 'Something went wrong',
                    data: data.data || '',
                    code: data.code || '',
                };

                const error = new Error();
                error.info = responseError;
                console.error(error.info);

                // Session expired or the database couldn't be accessed. Send back to login.
                sessionStorage.removeItem("token");
                window.location.href = '/';
                return;
            }

            // Initialize a list of the users accounts
            let accountList = []

            // Get the account information, parse out the index
            Object.entries(data).map((account) => {
                return (accountList.push(account[1]));
            });

            this.setState({
                accounts: accountList
            });

        } catch (err) {
            console.error(err);
            sessionStorage.removeItem("token")
            window.location.href = '/';
        }

    };

    createAccount = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch("/create_account", options);
        const data = await response.json();

        if (!response.ok) {
            console.error('Couldnt create a transaction: ' + response.statusText);
        }
       
        this.setState({
            accounts: this.state.accounts.concat([data]),
            openModal: false
        });
    };

    postTransaction = async () => {

        const options = {
            method: 'POST',
            body: JSON.stringify({
                "type": this.state.type,
                "amount": this.state.amount,
                "id": this.state.accountId,
                "accountNumber": this.state.accountNumber,
                "note": this.state.note
            }),
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch("/post_transaction", options);
        const data = await response.json();

        console.log(JSON.stringify(data));
        // Check the API response
        if (!response.ok) {
            console.error('Couldnt create a transaction: ' + response.statusText);
        }

        // Update the account list so the user can see the state change and notice the transaction
        const updatedAccountList = this.state.accounts.map((account) => {
            if(account.account_id === data.account_id) {
                return data;
            }
            return account;
        });

        // Reset the modal state regardless
        this.setState({
            currentAccountId: null,
            openModal: false,
            accounts: updatedAccountList
        });
    };

    render() {
        return (
            <div>
                {(sessionStorage.getItem("token") !== undefined && sessionStorage.getItem("token") !== null ?
                    <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', margin: 64 }}>
                            {
                                this.state.accounts.map((account) => {
                                    return (
                                        <span style={{ margin: 24 }} key={account.id}>
                                            <Card variant="outlined" sx={{ minWidth: 400, minHeight: 200, boxShadow: 2, padding: 1 }}>
                                                <CardContent>
                                                    <Typography variant="h5">
                                                        Account Number
                                                    </Typography>
                                                    <Typography style={{ paddingTop: 6 }}>
                                                        {account.account_number}
                                                    </Typography>
                                                    <div className="row">
                                                        <div className="column">
                                                            <Typography variant="h6" type="number" style={{ paddingTop: 24 }}>
                                                                Current Balance:
                                                            </Typography>
                                                        </div>
                                                        <div className="column">
                                                            <Typography variant="h6" style={{ paddingTop: 24, textAlign: 'right' }}>
                                                                $ {account.current_balance}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="row">
                                                    <div className="column">
                                                        <Button variant="outlined" onClick={() => {
                                                            this.setState(
                                                                {
                                                                    openModal: true,
                                                                    accountNumber: account.account_number,
                                                                    accountId: account.id
                                                                });
                                                        }}>Add Transaction</Button>
                                                    </div>
                                                    <div className="column">
                                                        <span>
                                                            <Button value={account.id} onClick={this.props.changeToTransactions} style={{ float: 'right' }}>Transactions</Button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </span>

                                    );
                                })
                            }
                            <Button sx={{ marginTop: 4, minWidth: 100, boxShadow: 2, padding: 1, maxHeight: 200 }} onClick={this.createAccount}>Create Account</Button>
                        </div>
                    </>
                    :
                    <div> Session Expired. Routing back to login </div>
                )}
                <Modal
                    open={this.state.openModal}
                    onClose={this.handleClose}
                >
                    <Box sx={style}>
                        <Typography style={{ textAlign: 'center', marginBottom: 12 }} variant="h6">
                            Add Transaction
                        </Typography>
                        <FormControl className="row" id="transactionModal">
                            <FormLabel>Type</FormLabel>
                            <RadioGroup className="column"
                                style={{ marginTop: 24 }}
                                row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="row-radio-buttons-group"
                                defaultValue="CREDIT"
                                onChange={(event) => {
                                    this.setState(
                                        {
                                            type: event.target.value
                                        })
                                }}
                            >
                                <FormControlLabel value="CREDIT" control={<Radio />} label="Credit" />
                                <FormControlLabel value="DEBIT" control={<Radio />} label="Debit" />
                            </RadioGroup>
                            <div className="column">
                                <TextField
                                    required
                                    id="filled-required"
                                    label="Amount"
                                    defaultValue="0"
                                    variant="filled"
                                    onChange={(event) => {
                                        const re = /^[0-9\b]+$/;
                                        if (re.test(event.target.value)) {
                                            this.setState(
                                                {
                                                    amount: event.target.value
                                                })
                                        } else {
                                            event.target.value = '';
                                        }
                                    }}
                                />
                                <TextField
                                    required
                                    id="filled-required"
                                    label="Note"
                                    defaultValue="Coffee"
                                    variant="filled"
                                    style={{ marginTop: 24 }}
                                    onChange={(event) => {
                                        this.setState(
                                            {
                                                note: event.target.value
                                            })
                                    }}
                                />
                            </div>
                            <Button style={{ margin: 'auto 0', marginTop: 24 }} variant={"contained"} onClick={this.postTransaction}>Submit</Button>
                        </FormControl>
                    </Box>
                </Modal>
            </div>
        );
    }
}

export default Accounts;