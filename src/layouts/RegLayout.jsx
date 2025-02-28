import { Outlet } from "react-router-dom";
import RegHeader from "../components/RegHeader.jsx";

const RegLayout = () => {
  return (
    <>
      <RegHeader />
      <main className="loginMain">
        <Outlet />
      </main>
    </>
  );
};

export default RegLayout;