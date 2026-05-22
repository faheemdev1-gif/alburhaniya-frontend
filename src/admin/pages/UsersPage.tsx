import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminUsers } from '../services/adminApi';
import { PageHeader, Badge, Btn, Spinner, EmptyState, ConfirmModal, Field } from '../components/Shared';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUsers.list();
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminUsers.delete(deleteId);
      setUsers(prev => prev.filter(u => u._id !== deleteId));
    } finally { setDeleteId(null); }
  };

  return (
    <div className="list-page">
      <PageHeader
        title="Users"
        subtitle={`${users.length} user${users.length !== 1 ? 's' : ''}`}
        action={
          <Btn onClick={() => { setEditUser(null); setShowForm(true); }}>+ Add User</Btn>
        }
      />

      {loading ? <Spinner /> : users.length === 0 ? (
        <EmptyState icon="◉" title="No users found" body="Add your first admin or editor user." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#2d5a8e,#4a85c8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0
                      }}>
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <span className="table-primary">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-muted">{u.email}</td>
                  <td>
                    <Badge
                      label={u.role}
                      variant={u.role === 'admin' ? 'warning' : 'info'}
                    />
                  </td>
                  <td className="table-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Btn small variant="secondary" onClick={() => { setEditUser(u); setShowForm(true); }}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => setDeleteId(u._id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this user? They will lose all access immediately."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {showForm && (
        <UserFormModal
          user={editUser}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

/* ── User Form Modal ── */
function UserFormModal({ user, onClose, onSuccess }: {
  user: any | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = Boolean(user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>(user?.role || 'editor');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: any = { name, email, role };
      if (password) payload.password = password;
      if (isEdit) {
        await adminUsers.update(user._id, payload);
      } else {
        if (!password) { setError('Password is required for new users'); setSaving(false); return; }
        await adminUsers.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div className="upload-modal-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f0ede6', margin: 0 }}>
            {isEdit ? 'Edit User' : 'Add User'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="form-error">{error}</div>}

          <Field label="Full Name" required>
            <input className="admin-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith" />
          </Field>
          <Field label="Email" required>
            <input className="admin-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@example.com" />
          </Field>
          <Field label={isEdit ? 'New Password' : 'Password'} required={!isEdit} hint={isEdit ? 'Leave blank to keep current password' : undefined}>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={!isEdit}
              placeholder="Min 8 characters"
              minLength={8}
            />
          </Field>
          <Field label="Role" required>
            <select className="admin-select" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="editor">Editor — can create & edit content</option>
              <option value="admin">Admin — full access including users</option>
            </select>
          </Field>

          <div className="form-footer" style={{ marginTop: '0.5rem' }}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}