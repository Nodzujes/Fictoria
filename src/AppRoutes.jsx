import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import UserPage from './pages/UserPage.jsx';
import SetingsPage from './pages/SetingsPage.jsx';
import UserLikePage from './pages/UserLikePage.jsx';
import UserBlogs from './pages/UserBlogs.jsx';
import Creator from './pages/CreatorPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import RegLayout from './layouts/RegLayout.jsx';
import MetricLayout from './layouts/MetricLayout.jsx';
import ScrollToTop from './ScrollToTop';
import PropTypes from 'prop-types';

function AdminRedirect() {
    const { user, loading } = useUser();
    if (loading) {
        return <div>Загрузка...</div>;
    }
    if (!user || !user.is_admin) {
        return <Navigate to="/" replace />;
    }
    window.location.href = '/admin';
    return null;
}

function AdminMetricRoute({ element }) {
    const { user, loading } = useUser();
    console.log('AdminMetricRoute - loading:', loading, 'user:', user);
    if (loading) {
        return <div>Загрузка...</div>;
    }
    if (!user || !user.is_admin) {
        console.log('Redirecting to / because user is not admin or not logged in');
        return <Navigate to="/" replace />;
    }
    return element;
}

AdminMetricRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

function AppRoutes() {
    return (
        <>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route path="/" index element={<HomePage />} />
                        <Route path="/category/:category" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/setings" element={<SetingsPage />} />
                        <Route path="/likes" element={<UserLikePage />} />
                        <Route path="/userblogs" element={<UserBlogs />} />
                        <Route path="/creator" element={<Creator />} />
                        <Route path="/post/:id" element={<BlogPage />} />
                        <Route path="/admin" element={<AdminRedirect />} />
                    </Route>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>
                    <Route element={<RegLayout />}>
                        <Route path="/reg" element={<RegisterPage />} />
                    </Route>
                    <Route element={<MetricLayout />}>
                        <Route
                            path="/admin-metric"
                            element={<AdminMetricRoute element={<Dashboard />} />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default AppRoutes;