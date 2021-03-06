import React, {Component} from 'react';
import Login from 'views/Login.jsx'
import HealthPrograms from 'views/HealthPrograms.jsx'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user : {
                name: '',
                email: '',
                image: null,
                subscribeProgram: '',
                unsubscribeProgram: '',
                subscribedPrograms: '',
            },
            authenticated: false,
            serverUserData: null,
            token: '',
            callbacks: {
                onLogoutSuccess: this.handleGoogleLogout,
                onSubscribeProgramChange: this.handleSubcribeProgramChange,
                onSubscribeClick: this.handleSubscribeClick,
                onUnsubscribeProgramChange: this.handleUnsubcribeProgramChange,
                onUnsubscribeClick: this.handleUnsubscribeClick,
                onGetHealthProgramsClick: this.handleGetHealthProgramsClick
            }
        };
    }

    handleGoogleLoginSuccess = (response) => {
        const userProfile = response.getBasicProfile();
        this.setState({
            user : {
                name: userProfile.getName(),
                email: userProfile.getEmail(),
                image: userProfile.getImageUrl()
            }
        });

        const tokenBlob = new Blob(
            [JSON.stringify({ access_token: response.accessToken })],
            { type: 'application/json' }
        );
        const options = {
            method: 'POST',
            body: tokenBlob,
            mode: 'cors',
            cache: 'default'
        };
        fetch('http://localhost:4000/api/v1/auth/google', options).then(reply => {
            const userAuthenticationToken = reply.headers.get('x-auth-token');
            reply.json().then(userData => {
                if (userAuthenticationToken) {
                    this.setState({
                        authenticated: true,
                        _user: userData,
                        token: userAuthenticationToken
                    });
                }
            });
        });
    }

    handleGoogleLoginFailure = (response) => {
        console.log(response);
    }

    handleGoogleLogout = () => {
        this.setState({
            user: { },
            authenticated: false,
            _user: null,
            token: '',
        });
    }

    handleSubcribeProgramChange = (event) => {
        var newUser = this.state.user;
        if (event.target.value) {
            newUser.subscribeProgram = event.target.value;
        } else {
            newUser.subscribeProgram = '';
        }
        this.setState({ user: newUser });
    }

    handleUnsubcribeProgramChange = (event) => {
        var newUser = this.state.user;
        if (event.target.value) {
            newUser.unsubscribeProgram = event.target.value;
        } else {
            newUser.subscribeProgram = '';
        }
        this.setState({ user: newUser });
    }

    handleGetHealthProgramsClick = () => {
        const options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default',
            headers: {
                'x-auth-token': this.state.token
            }
        };
        fetch('http://localhost:4000/api/v1/users/healthPrograms/' + this.state._user.id, options)
        .then(reply => {
            reply.json().then(userData => {
                var str = JSON.stringify(userData, null, 2);
                var newUser = this.state.user;
                newUser.subscribedPrograms = str;
                this.setState({ user : newUser });
            });
        });
    }

    handleSubscribeClick = () => {
        if (this.state.user.subscribeProgram === '') {
            return;
        }

        const program = new Blob(
            [JSON.stringify({ healthProgram: this.state.user.subscribeProgram })],
            { type: 'application/json' }
        );
        const options = {
            method: 'POST',
            body: program,
            mode: 'cors',
            cache: 'default',
            headers: {
                'x-auth-token': this.state.token
            }
        };
        fetch('http://localhost:4000/api/v1/users/healthPrograms/' + this.state._user.id, options)
        .then(reply => {
            var newUser = this.state.user;
            newUser.subscribeProgram = '';
            this.setState({ user : newUser });
        });
    }

    handleUnsubscribeClick = () => {
        if (this.state.user.unsubscribeProgram === '') {
            return;
        }

        const program = new Blob(
            [JSON.stringify({ healthProgram: this.state.user.unsubscribeProgram })],
            { type: 'application/json' }
        );
        const options = {
            method: 'DELETE',
            body: program,
            mode: 'cors',
            cache: 'default',
            headers: {
                'x-auth-token': this.state.token
            }
        };
        fetch('http://localhost:4000/api/v1/users/healthPrograms/' + this.state._user.id, options)
        .then(reply => {
            var newUser = this.state.user;
            newUser.unsubscribeProgram = '';
            this.setState({ user : newUser });
        });
    }

    render() {
       return (
            <div id='App'>
            {this.state.authenticated ? (
                <HealthPrograms user={this.state.user} callbacks={this.state.callbacks} />
            ) : (
                <Login
                    onLoginSuccess={this.handleGoogleLoginSuccess}
                    onLoginFailure={this.handleGoogleLoginFailure}
                />
            )}
            </div>
        );
    }
}

export default App;