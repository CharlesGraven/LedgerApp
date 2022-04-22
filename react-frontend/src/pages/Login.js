import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserHome from "./UserHome";

const theme = createTheme();

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: ''
    }
  }
  handleSubmit = async (event) => {

    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const options = {
      method: 'POST',
      body: JSON.stringify({
        'username': data.get('username'),
        'password': data.get('password'),
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await fetch('/login', options);
    const token = await response.json();
    // Check API response
    if (!response.ok) {
      console.error('Couldnt login user: ' + data.get('username') + ' : ' + response.statusText);
    } else {
      sessionStorage.setItem("token", token.access_token);
      sessionStorage.setItem("username", data.get('username'));
      this.setState({userName: data.get('username')});
    }
  }
  render() {
    return (
      <div>
        {(sessionStorage.getItem("token") !== undefined && sessionStorage.getItem("token") !== null ?
          <div><UserHome username={this.state.userName} /></div> :
          <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography component="h1" variant="h5">
                  GPA
                </Typography>
                <Box component="form" onSubmit={this.handleSubmit} noValidate sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                  <Grid container justifyContent="center">
                    <Button type="submit" sx={{ mt: 3, mb: 2 }}>
                      Sign In
                    </Button>
                  </Grid>
                </Box>
              </Box>
            </Container>
          </ThemeProvider>
        )}
      </div>
    );
  }
}


export default Login;
