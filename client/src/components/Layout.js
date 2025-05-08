import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = ({ user, onLogout }) => (
  <>
    <Navbar user={user} onLogout={onLogout} />
    <Outlet />
  </>
);

export default Layout;
