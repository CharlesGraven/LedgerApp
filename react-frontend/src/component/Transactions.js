import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

class Transactions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
  }

  async componentDidMount() {
    await this.getTransactions();
  };

  getTransactions = async () => {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        'account_id': this.props.currentAccount === "" ? null : this.props.currentAccount
      }),
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch("/transactions", options);
    const transactions = await response.json();

    // Check API response
    if (!response.ok) {
      console.error('Couldnt get transactions for account ' + this.props.currentAccount + ' : ' + response.statusText);
    } else {

      this.setState({
        transactions: transactions
      });
    }
  }

  render() {
    return (
      <div style={{ display: 'flex', margin: 120 }}>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 300 }} aria-label="transaction-table">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Transaction Type</TableCell>
                <TableCell align="center">Account Number</TableCell>
                <TableCell align="center">Note</TableCell>
                <TableCell align="center">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">{transaction.id}</TableCell>
                  <TableCell align="center">{(String(new Date(transaction.date)).substring(4,15))}</TableCell>
                  <TableCell align="center">{transaction.transaction_type}</TableCell>
                  <TableCell align="center">{transaction.account_number}</TableCell>
                  <TableCell align="center">{transaction.note}</TableCell>
                  <TableCell align="center">{transaction.transaction_type === "CREDIT" ? '+' : '-'} {transaction.amount}</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

export default Transactions;