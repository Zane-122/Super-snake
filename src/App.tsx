import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import pixelArtBg from './assets/images/Pixel art - Page 2_.jpeg';
import lockImage from './assets/images/Lock.png';
import Game from './Game';
import Toggle from './components/toggle';
import Login from './components/login';
import Signup from './components/signup';
import BasicButton from './components/Basic-button';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
const BackgroundTile = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('${pixelArtBg}');
  background-repeat: repeat;
  background-size: 400px 400px;
  z-index: -1;
`;

const Container = styled.div<{ backgroundColor: string}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 98%;
  width: 100%;
  text-align: center;
  background-color: ${({ backgroundColor }) => backgroundColor ? backgroundColor : '#f0f0f0'};
  font-family: 'Toasty Milk';
  border-radius: 35px;
  border: 5px solid black;
  margin: 0 10px;
  padding: 0px;
  box-shadow: 0px 15px 0px black;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 95vh;
  width: 96vw;
  margin: 0 auto;
  padding: 20px;
  vertical-align: top;
  gap: 2px;
  background-color: transparent;
  font-family: 'Toasty Milk';
`;
const LoginButton = styled.button`

  @keyframes pulse {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.05);
    }
  }

  animation: pulse 0.5s infinite alternate;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  font-family: 'Toasty Milk';
  color: black;
  margin: 10px;
  transition: all 0.2s ease;
  &:hover {
    color: rgb(143, 39, 255);
    transform: scale(1.05);
  }
`;

function AppContent(): JSX.Element {
  const { currentUser, logout } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [showUI, setShowUI] = useState(true);
  const [sendToLeaderboard, setSendToLeaderboard] = useState(true);
  return (
    <>

      <MainContainer>
        {/* Shop */}
        <Container backgroundColor='rgba(255, 226, 249, 0.51)'>
          <h1 style={{ color: 'black', fontSize: '62px', fontWeight: 'bold', margin: '40px 0px 0px 0px' }}>General</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', padding: '20px 0' }}>
            {!currentUser ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '20px 0' }}>
              {isSignup ? <Signup /> : <Login />}
              <LoginButton onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? 'Login' : 'Sign Up'}
              </LoginButton>
            </div> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '20px 0' }}>
              <h1 style={{ color: 'black', fontSize: '36px', fontWeight: 'bold', margin: '40px 0px 0px 0px' }}>Welcome, {currentUser?.displayName || currentUser?.email}!</h1>
              <BasicButton label='Logout' color='rgb(255, 100, 100)' onClick={() => logout()} size='small'/>
            </div>}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', gap: '20px' }}>
              <Toggle isOn={showUI} onToggle={() => setShowUI(!showUI)} label='Show Game UI'/>
              <Toggle isOn={!!currentUser && sendToLeaderboard} onToggle={() => setSendToLeaderboard(!sendToLeaderboard)} label='Save to leaderboard' color='rgba(255, 217, 0, 0.5)'/>
            </div>
          </div>
      </Container>

        {/* Game */}
        <Container backgroundColor='rgba(159, 189, 255, 0.55)'>
          <Game showUI={showUI} />
        </Container>

        {/* Leaderboard */}
        <Container backgroundColor={currentUser ? 'rgba(255, 218, 117, 0.55)' : 'rgba(255, 255, 255, 0.23)'}>
          <h1 style={{ color: 'black', fontSize: '62px', fontWeight: 'bold', margin: '40px 0px 0px 0px' }}>Leaderboard</h1>
          {!currentUser ?(<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80%'}}>
            <p></p>
            <p></p>
            <p></p>
            <p></p>
            <img 
              src={lockImage}      
              alt="Lock" 
              style={{ 
                width: '200px', 
                height: '200px', 
                display: 'block'
              }} 
            />
            <h5 style={{ color: 'black', fontSize: '20px', fontWeight: '100', padding: '20px', margin: '0px' }}>Log in or sign up to see the leaderboard and save your scores!</h5>
          </div>) : <></>}
          
        </Container>
      </MainContainer>
    </>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 