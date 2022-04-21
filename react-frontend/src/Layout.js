import * as React from 'react';
import { BrowserRouter, Route, Routes,  } from 'react-router-dom'
import Login from './pages/Login'
import UserHome from './pages/UserHome'

// Layout for the GPA website
const Layout = () => {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login/>} />
                    <Route path="/account" element={<UserHome />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default Layout;