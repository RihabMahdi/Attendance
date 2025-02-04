import { useContext } from 'react';
import { LayoutProvider, LayoutContext } from './context/LayoutContext';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import { Outlet } from 'react-router';

const DashboardContent = () => {
  const { isMobile, isSidebarOpen } = useContext(LayoutContext);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`
            fixed
            top-20
            right-2
            bottom-2
            ${isMobile ? 'left-2' : isSidebarOpen ? 'left-[17rem]' : 'left-24'}
            overflow-y-auto
            p-8
            bg-base-100
            shadow-md
            rounded-box
            transition-all duration-300 ease-in-out
          `}
      >
        {/* Main Outlet */}
        <Outlet />
      </main>
    </>
  );
};

const DashboardLayout = () => {
  return (
    <LayoutProvider>
      <DashboardContent />
    </LayoutProvider>
  );
};

export default DashboardLayout;
