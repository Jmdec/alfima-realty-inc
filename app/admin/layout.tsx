"use client";

import {
  AdminSidebar,
  AdminMobileTopbar,
} from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Push notification subscribe now happens on-demand via the bell button
  // in AdminChatPage (enablePushNotifications), not automatically on every
  // admin page load. This avoids duplicate subscribe attempts and an
  // unsolicited permission prompt the moment an admin opens any /admin page.

  return (
    <>
      <style>{`
        body { background: #f8fafc !important; }
        main { padding-top: 0 !important; min-height: unset !important; }
      `}</style>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminMobileTopbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
