import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import UserPage from './pages/UserPage.jsx';
import SetingsPage from './pages/SetingsPage.jsx';
import UserLikePage from './pages/UserLikePage.jsx';
import UserBlogs from './pages/UserBlogs.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import RegLayout from './layouts/RegLayout.jsx';
import ScrollToTop from './ScrollToTop';

function AppRoutes() {
    return (
        <>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route path="/" index element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/setings" element={<SetingsPage />} />
                        <Route path='/likes' element={<UserLikePage />} />
                        <Route path='/userblogs' element={<UserBlogs />} />
                    </Route>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>
                    <Route element={<RegLayout />}>
                        <Route path="/reg" element={<RegisterPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default AppRoutes;