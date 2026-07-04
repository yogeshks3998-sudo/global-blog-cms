import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { Dashboard } from './components/Dashboard';
import { BlogsPage } from './components/BlogsPage';
import { ViewBlog } from './components/ViewBlog';
import { EditBlog } from './components/EditBlog';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { ClientsPage } from './components/ClientsPage';
import { WebsitesPage } from './components/WebsitesPage';
import { DeleteModal } from './components/DeleteModal';
import type { Blog, Screen } from './mockData';
import { mockBlogs } from './mockData';
import {
  api,
  clearSession,
  getSavedUser,
  type AuthUser,
  type Client,
  type CreateClientInput,
  type DashboardData,
  type BlogUpdateInput,
  type UpdateClientInput,
  type Website
} from './services/api';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => getSavedUser());
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
  const [clients, setClients] = useState<Client[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const role = user?.role;

  const refreshDashboard = useCallback(async (activeUser = user) => {
    if (!activeUser) return;

    try {
      const data = await api.getDashboard(activeUser.role);
      setDashboard(data);
      const recent = activeUser.role === 'SUPER_ADMIN' ? data.recentBlogs : data.recentSubmissions;
      if (recent?.length) {
        setBlogs((prev) => {
          const merged = new Map(prev.map((blog) => [blog.id, blog]));
          recent.forEach((blog) => merged.set(blog.id, blog));
          return Array.from(merged.values());
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load dashboard');
    }
  }, [user]);

  const refreshBlogs = useCallback(async (activeUser = user, q = searchQuery) => {
    if (!activeUser) return;
    setLoadingBlogs(true);

    try {
      const data = await api.getBlogs(activeUser.role, q);
      setBlogs(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load blogs');
    } finally {
      setLoadingBlogs(false);
    }
  }, [searchQuery, user]);

  const refreshAdminData = useCallback(async (activeUser = user) => {
    if (activeUser?.role !== 'SUPER_ADMIN') return;

    try {
      const [clientData, websiteData] = await Promise.all([api.getClients(), api.getWebsites()]);
      setClients(clientData);
      setWebsites(websiteData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load admin data');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshDashboard(user);
    refreshBlogs(user);
    refreshAdminData(user);
  }, [refreshAdminData, refreshBlogs, refreshDashboard, user]);

  const navigate = useCallback((s: Screen, blogId?: string) => {
    setScreen(s);
    if (blogId !== undefined) setSelectedBlogId(blogId);
    setSidebarOpen(false);
  }, []);

  const handleLogin = useCallback(async (identity: string, password: string, remember: boolean) => {
    const loggedInUser = await api.login(identity, password, remember);
    setUser(loggedInUser);
    setScreen('dashboard');
    await Promise.all([refreshDashboard(loggedInUser), refreshBlogs(loggedInUser), refreshAdminData(loggedInUser)]);
  }, [refreshAdminData, refreshBlogs, refreshDashboard]);

  const handleRegenerateApiKey = useCallback(async (id: string) => {
    const updated = await api.regenerateWebsiteApiKey(id);
    setWebsites((prev) => prev.map((website) => (website._id === id ? updated : website)));
    toast.success('API key regenerated');
  }, []);

  const handleCreateClient = useCallback(async (data: CreateClientInput) => {
    await api.createClient(data);
    await Promise.all([refreshAdminData(), refreshDashboard()]);
  }, [refreshAdminData, refreshDashboard]);

  const handleUpdateClient = useCallback(async (id: string, data: UpdateClientInput) => {
    const updated = await api.updateClient(id, data);
    setClients((prev) => prev.map((client) => (client._id === id ? updated : client)));
    await Promise.all([refreshAdminData(), refreshDashboard()]);
  }, [refreshAdminData, refreshDashboard]);

  const handleResetClientPassword = useCallback(async (id: string, password: string) => {
    await api.resetClientPassword(id, password);
  }, []);

  const handleDeleteClient = useCallback(async (id: string) => {
    await api.deleteClient(id);
    await Promise.all([refreshAdminData(), refreshDashboard()]);
  }, [refreshAdminData, refreshDashboard]);

  const handleApprove = useCallback(async (id: string) => {
    if (role !== 'CLIENT_ADMIN') {
      toast.error('Only Client Admins can approve blogs');
      return;
    }

    try {
      const updated = await api.approveBlog(id);
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
      await refreshDashboard();
      toast.success('Blog approved and published!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to approve blog');
    }
  }, [refreshDashboard, role]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!role) return;

      try {
        await api.deleteBlog(role, id);
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setDeleteTarget(null);
        await refreshDashboard();
        toast.success('Blog deleted successfully');
        if (screen === 'view-blog' || screen === 'edit-blog') {
          setScreen('blogs');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to delete blog');
      }
    },
    [refreshDashboard, role, screen]
  );

  const handleSave = useCallback(async (updated: BlogUpdateInput) => {
    if (!role) return;

    const saved = await api.updateBlog(role, updated);
    setBlogs((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
    await refreshDashboard();
  }, [refreshDashboard, role]);

  const selectedBlog = blogs.find((b) => b.id === selectedBlogId) ?? null;
  const deleteTargetBlog = blogs.find((b) => b.id === deleteTarget);

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <Sidebar
        currentScreen={screen}
        onNavigate={navigate}
        user={user}
        blogCount={blogs.length}
        onLogout={() => {
          clearSession();
          setUser(null);
          setScreen('dashboard');
          toast.success('Logged out successfully');
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Top navbar */}
        <TopNavbar
          currentScreen={screen}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {screen === 'dashboard' && (
            <Dashboard blogs={blogs} dashboard={dashboard} user={user} onNavigate={navigate} />
          )}

          {screen === 'clients' && (
            <ClientsPage
              clients={clients}
              onCreateClient={handleCreateClient}
              onUpdateClient={handleUpdateClient}
              onResetPassword={handleResetClientPassword}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {screen === 'websites' && (
            <WebsitesPage websites={websites} onRegenerateApiKey={handleRegenerateApiKey} />
          )}

          {screen === 'blogs' && (
            <BlogsPage
              blogs={blogs}
              onNavigate={navigate}
              onApprove={handleApprove}
              onDelete={(id) => setDeleteTarget(id)}
              searchQuery={searchQuery}
              loading={loadingBlogs}
              canApprove={role === 'CLIENT_ADMIN'}
            />
          )}

          {screen === 'view-blog' && selectedBlog && (
            <ViewBlog
              blog={selectedBlog}
              onNavigate={navigate}
              onApprove={handleApprove}
              onDelete={(id) => setDeleteTarget(id)}
              canApprove={role === 'CLIENT_ADMIN'}
            />
          )}

          {screen === 'view-blog' && !selectedBlog && (
            <div className="flex items-center justify-center h-64 text-slate-400" style={{ fontSize: '15px' }}>
              Blog not found.{' '}
              <button
                onClick={() => navigate('blogs')}
                className="ml-1 text-blue-600 hover:text-blue-700 underline"
              >
                Go back
              </button>
            </div>
          )}

          {screen === 'edit-blog' && selectedBlog && (
            <EditBlog
              blog={selectedBlog}
              onNavigate={navigate}
              onSave={handleSave}
              onApprove={handleApprove}
              onDelete={(id) => setDeleteTarget(id)}
              canApprove={role === 'CLIENT_ADMIN'}
            />
          )}

          {screen === 'profile' && (
            <ProfilePage
              user={user}
              onUserChange={setUser}
            />
          )}

          {screen === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          blogTitle={deleteTargetBlog?.title}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
