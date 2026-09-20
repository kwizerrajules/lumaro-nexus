'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HouseProjectsSection from '../components/HouseProjectsSection';
import OrdersSection from '../components/OrdersSection';
import CustomOrderSection from '../components/CustomOrderSection';
import UsersSection from '../components/UsersSection';
import ContactUsSection from '../components/ContactUsSections';
import {jwtDecode} from 'jwt-decode';
import ProfileSection from '../components/ProfileSection';
import SiteSettingsPanel from '../components/SiteSettingsPanel';

import {
  Building2,
  ShoppingBag,
  Sparkles,
  Users,
  MessageSquare,
  Sliders,
  UserCheck,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarFolder {
  id: string;
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_FOLDERS: SidebarFolder[] = [
  {
    id: 'catalog_sales',
    title: 'Catalog & Orders',
    items: [
      { key: 'houseProjects', label: 'House Projects', icon: Building2 },
      { key: 'orders', label: 'Orders', icon: ShoppingBag },
      { key: 'customOrders', label: 'Custom Orders', icon: Sparkles },
    ],
  },
  {
    id: 'community',
    title: 'Community & Inbox',
    items: [
      { key: 'users', label: 'Users', icon: Users },
      { key: 'contact_us', label: 'Contacts', icon: MessageSquare },
    ],
  },
  {
    id: 'management',
    title: 'Administration',
    items: [
      { key: 'settings', label: 'Site Settings', icon: Sliders },
      { key: 'profile', label: 'Profile & Settings', icon: UserCheck },
    ],
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [activeSection, setActiveSection] = useState('houseProjects');

  // Sidebar fold states: entire sidebar folding and individual folder category folding
  const [isSidebarFolded, setIsSidebarFolded] = useState(false);
  const [foldedFolders, setFoldedFolders] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token || !refreshToken) {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decodedPayload: any = jwtDecode(token);
        if (decodedPayload?.names) {
          setAdminName(decodedPayload.names);
        }
      } catch (err) {
        console.warn('Could not decode admin token:', err);
      }
    }
  }, [router]);

  useEffect(() => {
    const savedFold = localStorage.getItem('admin_sidebar_folded');
    if (savedFold === 'true') {
      setIsSidebarFolded(true);
    }
  }, []);

  const toggleSidebarFold = () => {
    setIsSidebarFolded((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_folded', String(next));
      return next;
    });
  };

  const toggleFolder = (folderId: string) => {
    setFoldedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'adminAccessToken=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e.detail?.names) {
        setAdminName(e.detail.names);
      }
    };
    window.addEventListener('adminProfileUpdated', handleProfileUpdated);
    return () => window.removeEventListener('adminProfileUpdated', handleProfileUpdated);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isSidebarFolded ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Header with Fold / Unfold Control */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4">
          {!isSidebarFolded ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">Lumaro Admin</span>
                <span className="text-[11px] text-gray-400 font-medium">Control Panel</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/30">
              <Shield className="w-4 h-4" />
            </div>
          )}

          {/* Desktop Fold / Expand Toggle */}
          <button
            type="button"
            onClick={toggleSidebarFold}
            title={isSidebarFolded ? 'Expand sidebar' : 'Fold sidebar'}
            className="hidden md:flex p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
          >
            {isSidebarFolded ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Folders */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {SIDEBAR_FOLDERS.map((folder, folderIdx) => {
            const isFolderFolded = Boolean(foldedFolders[folder.id]);

            return (
              <div key={folder.id} className="space-y-1">
                {/* Folder Header (Hidden in mini rail mode) */}
                {!isSidebarFolded && (
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors rounded-md hover:bg-gray-50 group"
                  >
                    <span className="flex items-center gap-1.5">
                      {isFolderFolded ? (
                        <Folder className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600" />
                      )}
                      <span>{folder.title}</span>
                    </span>
                    {isFolderFolded ? (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform" />
                    )}
                  </button>
                )}

                {/* Divider between folders in mini rail mode */}
                {isSidebarFolded && folderIdx > 0 && (
                  <div className="my-2 border-t border-gray-200" />
                )}

                {/* Folder Options list (collapsible if folded) */}
                {(!isFolderFolded || isSidebarFolded) && (
                  <div className="space-y-1">
                    {folder.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.key;

                      if (isSidebarFolded) {
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              setActiveSection(item.key);
                              setIsMobileOpen(false);
                            }}
                            title={item.label}
                            className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all relative group ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {/* Hover tooltip for rail mode */}
                            <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                              {item.label}
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            setActiveSection(item.key);
                            setIsMobileOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-500'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer: Admin user info + Logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          {!isSidebarFolded ? (
            <div className="flex items-center justify-between gap-2 p-1.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-gray-800 truncate" title={adminName}>
                    {adminName}
                  </span>
                  <span className="text-[10px] text-gray-400">Administrator</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="w-11 h-11 mx-auto flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition group relative"
            >
              <LogOut className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-red-700 text-white text-xs font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Logout
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-gray-800 text-sm">Lumaro Admin</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">{adminName}</span>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* Welcome Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Welcome, <span className="text-blue-600">{adminName}</span>!
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage projects, catalog orders, and site configurations from here.
              </p>
            </div>

            {/* Quick Fold Button in main area header on desktop */}
            <button
              type="button"
              onClick={toggleSidebarFold}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition self-start"
            >
              {isSidebarFolded ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                  <span>Expand Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-gray-500" />
                  <span>Fold Sidebar</span>
                </>
              )}
            </button>
          </div>

          {/* Section Content */}
          <div className="bg-transparent">
            {activeSection === 'houseProjects' && <HouseProjectsSection />}
            {activeSection === 'orders' && <OrdersSection />}
            {activeSection === 'customOrders' && <CustomOrderSection />}
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'contact_us' && <ContactUsSection />}
            {activeSection === 'settings' && <SiteSettingsPanel />}
            {activeSection === 'profile' && (
              <ProfileSection onProfileUpdate={(newName) => setAdminName(newName)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
