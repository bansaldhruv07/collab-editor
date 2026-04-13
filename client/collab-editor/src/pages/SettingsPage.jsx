import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Input from '../components/Input';
function SettingsPage() {
  const { logout } = useAuth();
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
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
          Settings
        </h1>
        <p style={{ color: '#6B7280', marginTop: '4px' }}>
          Manage your account security and preferences
        </p>
      </div>
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
          Change password
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
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
        background: '#fff',
        border: '1.5px solid #FCA5A5',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#DC2626', marginBottom: '6px' }}>
          Danger zone
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
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
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#991B1B',
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