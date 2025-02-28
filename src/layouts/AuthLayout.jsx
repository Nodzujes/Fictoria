import { Outlet } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";

const AuthLayout = () => {
  return (
    <>
      <AuthHeader />
      <main className="loginMain">
        <Outlet />
      </main>
    </>
  );
};

export default AuthLayout;