// _file: admin_dashboard/src/App.tsx_
import React, { useState } from 'react';
import { FiMenu, FiX, FiHome, FiCalendar, FiUsers, FiSettings, FiBarChart, FiPackage, FiBell, FiLogOut } from 'react-icons/fi';
import BookingList from './components/BookingList';
import BookingStats from './components/BookingStats';
import MenuItemList from './components/MenuItemList';
import NotificationSystem from './components/NotificationSystem';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type ActiveView = 'dashboard' | 'bookings' | 'guests' | 'menu' | 'settings' | 'notifications';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
    { id: 'guests', label: 'Guests', icon: FiUsers },
    { id: 'menu', label: 'Menu Items', icon: FiPackage },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'bookings':
        return <BookingList />;
      case 'guests':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <FiUsers className="text-blue-400 text-3xl" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Guest Management</h1>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <p className="text-slate-300">Guest management panel coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <FiBell className="text-blue-400 text-3xl" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Notifications</h1>
              </div>
              <NotificationSystem />
            </div>
          </div>
        );
      case 'menu':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <FiPackage className="text-blue-400 text-3xl" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Menu Management</h1>
              </div>
              <MenuItemList />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <FiSettings className="text-blue-400 text-3xl" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Settings</h1>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <p className="text-slate-300">Settings panel coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <FiBarChart className="text-blue-400 text-3xl" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
              </div>
              
              {/* Booking Statistics */}
              <BookingStats />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('bookings')}
                      className="w-full text-left p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-blue-400" />
                        <span>View All Bookings</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveView('menu')}
                      className="w-full text-left p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiMenu className="text-green-400" />
                        <span>Manage Menu Items</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-slate-400 text-sm">
                      <p>No recent activity</p>
                      <p className="text-xs text-slate-500 mt-1">Activity will appear here when bookings are made</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-800 border-r border-slate-700 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiHome className="text-white text-lg" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-white">Hotel Admin</h2>
                <p className="text-xs text-slate-400">Management Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="text-lg flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FiMenu className="text-lg" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                <FiMenu className="text-lg" />
              </button>
              <h1 className="text-lg font-semibold text-white capitalize">
                {activeView === 'dashboard' ? 'Dashboard Overview' : `${activeView} Management`}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationSystem />
              
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-white text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;