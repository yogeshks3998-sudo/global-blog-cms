import { useState } from 'react';
import { Edit3, Globe, KeyRound, Plus, Trash2, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import type { AccountStatus, Client, CreateClientInput, UpdateClientInput } from '../services/api';

interface ClientsPageProps {
  clients: Client[];
  onCreateClient: (data: CreateClientInput) => Promise<void>;
  onUpdateClient: (id: string, data: UpdateClientInput) => Promise<void>;
  onResetPassword: (id: string, password: string) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

const emptyCreateForm: CreateClientInput = {
  name: '',
  email: '',
  username: '',
  password: '',
  websiteName: '',
  websiteUrl: '',
  logo: '',
  status: 'ACTIVE',
  websiteStatus: 'ACTIVE'
};

function ClientModal({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontSize: '16px', fontWeight: 600 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder={placeholder}
        style={{ fontSize: '14px' }}
      />
    </div>
  );
}

export function ClientsPage({
  clients,
  onCreateClient,
  onUpdateClient,
  onResetPassword,
  onDeleteClient
}: ClientsPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [passwordClient, setPasswordClient] = useState<Client | null>(null);
  const [createForm, setCreateForm] = useState<CreateClientInput>(emptyCreateForm);
  const [editForm, setEditForm] = useState<UpdateClientInput | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const updateCreate = <K extends keyof CreateClientInput>(field: K, value: CreateClientInput[K]) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEdit = <K extends keyof UpdateClientInput>(field: K, value: UpdateClientInput[K]) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      email: client.email,
      username: client.username,
      status: client.status
    });
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onCreateClient(createForm);
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success('Client admin created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create client');
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingClient || !editForm) return;
    setSaving(true);
    try {
      await onUpdateClient(editingClient._id, editForm);
      setEditingClient(null);
      setEditForm(null);
      toast.success('Client admin updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update client');
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordClient) return;
    setSaving(true);
    try {
      await onResetPassword(passwordClient._id, newPassword);
      setPasswordClient(null);
      setNewPassword('');
      toast.success('Client password reset');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reset password');
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (client: Client) => {
    if (!window.confirm(`Delete/disable ${client.name}?`)) return;
    try {
      await onDeleteClient(client._id);
      toast.success('Client admin disabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete client');
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
            Clients
          </h2>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: '14px' }}>
            Add and manage client admins with their username, mail ID, password, and assigned website.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <Plus size={15} />
          Add Client Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Client', 'Username', 'Website', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3.5 text-slate-500 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400" style={{ fontSize: '14px' }}>
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <UserRound size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-slate-800" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {client.name}
                          </p>
                          <p className="text-slate-400" style={{ fontSize: '12px' }}>
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500" style={{ fontSize: '13px' }}>
                      {client.username}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600" style={{ fontSize: '13px' }}>
                        <Globe size={14} className="text-slate-400" />
                        {client.websiteId?.websiteName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border ${client.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setPasswordClient(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          title="Reset password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => deleteClient(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <ClientModal title="Add Client Admin" onClose={() => setCreateOpen(false)}>
          <form onSubmit={submitCreate} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField label="Full Name" value={createForm.name} onChange={(value) => updateCreate('name', value)} required />
              <TextField label="Mail ID" type="email" value={createForm.email} onChange={(value) => updateCreate('email', value)} required />
              <TextField label="Username" value={createForm.username} onChange={(value) => updateCreate('username', value)} required />
              <TextField label="Password" type="password" value={createForm.password} onChange={(value) => updateCreate('password', value)} required />
              <TextField label="Website Name" value={createForm.websiteName} onChange={(value) => updateCreate('websiteName', value)} required />
              <TextField label="Website URL" type="url" value={createForm.websiteUrl} onChange={(value) => updateCreate('websiteUrl', value)} required placeholder="https://example.com" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                {saving ? 'Creating...' : 'Create Client Admin'}
              </button>
            </div>
          </form>
        </ClientModal>
      )}

      {editingClient && editForm && (
        <ClientModal title="Edit Client Admin" onClose={() => setEditingClient(null)}>
          <form onSubmit={submitEdit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField label="Full Name" value={editForm.name} onChange={(value) => updateEdit('name', value)} required />
              <TextField label="Mail ID" type="email" value={editForm.email} onChange={(value) => updateEdit('email', value)} required />
              <TextField label="Username" value={editForm.username} onChange={(value) => updateEdit('username', value)} required />
              <div>
                <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(event) => updateEdit('status', event.target.value as AccountStatus)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{ fontSize: '14px' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ClientModal>
      )}

      {passwordClient && (
        <ClientModal title={`Reset Password - ${passwordClient.name}`} onClose={() => setPasswordClient(null)}>
          <form onSubmit={submitPassword} className="p-6 space-y-5">
            <TextField label="New Password" type="password" value={newPassword} onChange={setNewPassword} required />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPasswordClient(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-60 transition-colors" style={{ fontSize: '13px', fontWeight: 500 }}>
                {saving ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </ClientModal>
      )}
    </div>
  );
}
