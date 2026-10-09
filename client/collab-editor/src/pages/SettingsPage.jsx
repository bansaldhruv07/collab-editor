import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import userService from '../services/userService';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Input from '../components/Input';
function SettingsPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };
  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    try {
      setPasswordLoading(true);
      await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      addToast('Password changed successfully', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      addToast('Please enter your password to confirm', 'error');
      return;
    }
    try {
      setDeleteLoading(true);
      await userService.deleteAccount(deletePassword);
      logout();
      navigate('/login');
      addToast('Account deleted successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '750', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
          Manage your account appearance, security, and preferences
        </p>
      </div>

      {/* Appearance Section */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '650', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Appearance
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Customize your workspace interface theme
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { id: 'light', label: 'Light', icon: '☀️', desc: 'Clean paper style' },
            { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on the eyes' },
            { id: 'system', label: 'System', icon: '💻', desc: 'Sync with OS' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              style={{
                padding: '16px 12px',
                borderRadius: '10px',
                border: theme === opt.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: theme === opt.id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{opt.icon}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: theme === opt.id ? 'var(--accent-primary)' : 'var(--text-primary)',
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '650', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Change password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Use a strong password with at least 6 characters
        </p>
        <form onSubmit={handlePasswordSubmit}>
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Your current password"
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="At least 6 characters"
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Repeat new password"
            error={passwordErrors.confirmPassword}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={passwordLoading}>
              Update password
            </Button>
          </div>
        </form>
      </div>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--danger-border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '650', color: 'var(--danger-primary)', marginBottom: '6px' }}>
          Danger zone
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Permanently delete your account and all your documents. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: '10px',
            padding: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--danger-text)',
              marginBottom: '12px',
            }}>
              Are you absolutely sure? Enter your password to confirm deletion.
            </p>
            <Input
              label="Your password"
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteLoading}
                onClick={handleDeleteAccount}
              >
                Yes, delete my account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default SettingsPage;