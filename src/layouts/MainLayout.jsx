import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ModalUser from '../components/ModalUser.jsx';

function MainLayout() {
    return (
        <>
            <Header />
            <ModalUser/>
            <main className='owner__main'>
                <div className="wrapper">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </>
    )
}

export default MainLayout;