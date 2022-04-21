import * as React from 'react';
import Transactions from '../component/Transactions'
import Typography from '@mui/material/Typography';
import Accounts from '../component/Accounts'
import Button from '@mui/material/Button';
import '../index.css'

class UserHome extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            accountsToggled: true,
            currentAccount: null
        }
    }

    changeTab = (event) => {
        this.setState({
            accountsToggled: (event.target.value === 'true'),
            currentAccount: null
        });
    }

    changeToTransactions = (event) => {
        this.setState({
            currentAccount: event.target.value,
            accountsToggled: false
        });
    }

    render() {
        return (
            <div className="row">
                <div className="sidebar-column" style={{ textAlign: 'center' }}>
                    <Typography variant="h4" style={{ marginTop: 32 }}>Hi, {this.props.username}!</Typography>

                    <div style={{ margin: 24, marginBottom: 12 }}>
                        <Button value="true" onClick={this.changeTab}
                            variant={this.state.accountsToggled ? "contained" : "outlined"}
                            style={{ minWidth: '160px' }}>
                            Account
                        </Button>
                    </div>

                    <div style={{ margin: 24, marginTop: 0 }}>
                        <Button value="false" onClick={this.changeTab}
                            variant={this.state.accountsToggled ? "outlined" : "contained"}
                            style={{ minWidth: '160px' }}>
                            Transactions
                        </Button>
                    </div>

                </div>
                <div className="column">
                    {(this.state.accountsToggled ?
                        <Accounts changeToTransactions={this.changeToTransactions} /> :
                        <Transactions currentAccount={this.state.currentAccount} />
                    )}
                </div>
            </div>
        );
    }
}

export default UserHome;