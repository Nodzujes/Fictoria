import { Outlet } from "react-router-dom";
import MetricHeader from "../components/MetricHeader.jsx";

const MetricLayout = () => {
    return (
        <>
            <MetricHeader />
            <main className='owner__main'>
                <div className="wrapper">
                    <Outlet />
                </div>
            </main>
        </>
    );
};

export default MetricLayout;