import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="relative min-h-screen md:flex">
      {/* sidebar */}
      <div>
        <Sidebar></Sidebar>
      </div>


      {/* outlet */}
      <div className="flex-1 md:ml-64">
        <div className="p5">
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
