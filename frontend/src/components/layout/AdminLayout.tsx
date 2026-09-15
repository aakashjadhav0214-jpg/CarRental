import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="flex-grow p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
