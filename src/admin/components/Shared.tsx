import type { ReactNode } from 'react';
import './Shared.css';

/* ── Page Header ── */
export function PageHeader({
  title, subtitle, action
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="ph-root">
      <div>
        <h1 className="ph-title">{title}</h1>
        {subtitle && <p className="ph-sub">{subtitle}</p>}
      </div>
      {action && <div className="ph-action">{action}</div>}
    </div>
  );
}

/* ── Stat Card ── */
export function StatCard({ label, value, icon, color = '#c9a84c' }: {
  label: string; value: number | string; icon: string; color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

/* ── Badge ── */
export function Badge({ label, variant = 'default' }: {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}

/* ── Button ── */
export function Btn({
  children, onClick, variant = 'primary', type = 'button', disabled, small
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${small ? 'btn-sm' : ''}`}
    >
      {children}
    </button>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon, title, body }: {
  icon: string; title: string; body?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
    </div>
  );
}

/* ── Loading ── */
export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}

/* ── Confirm Modal ── */
export function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Form Field wrapper ── */
export function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: ReactNode; hint?: string;
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label} {required && <span className="field-req">*</span>}
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}