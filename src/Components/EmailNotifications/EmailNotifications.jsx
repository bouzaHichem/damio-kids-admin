import React, { useState, useEffect } from 'react';
import './EmailNotifications.css';
import { adminApiClient } from '../../services/adminAuthService';

// Normalize various API payload shapes to an array
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.queue)) return payload.queue;
  return [];
};

const EmailNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [testEmail, setTestEmail] = useState({
    to: '',
    type: 'welcome',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [emailStats, setEmailStats] = useState({
    sent: 0,
    pending: 0,
    failed: 0,
    today: 0
  });

  const emailTypes = [
    { value: 'welcome', label: 'Welcome Email', template: 'New Customer Welcome' },
    { value: 'order_confirmation', label: 'Order Confirmation', template: 'Order Receipt' },
    { value: 'order_status', label: 'Order Status Update', template: 'Status Change' },
    { value: 'low_stock', label: 'Low Stock Alert', template: 'Inventory Alert' },
    { value: 'password_reset', label: 'Password Reset', template: 'Reset Link' },
    { value: 'newsletter', label: 'Newsletter', template: 'Marketing Email' },
    { value: 'custom', label: 'Custom Email', template: 'Custom Message' }
  ];

  useEffect(() => {
    fetchEmailData();
  }, []);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      // Fetch email queue/history
      const { data: notificationsData } = await adminApiClient.get('/api/admin/email/notifications');
      if (notificationsData?.success !== false) {
        // Accept various shapes; default to []
        const list = toArray(notificationsData?.data ?? notificationsData);
        setNotifications(list);
      } else {
        setNotifications([]);
      }

      // Fetch email statistics
      const { data: statsData } = await adminApiClient.get('/api/admin/email/stats');
      if (statsData?.success !== false) {
        const stats = (statsData?.data && typeof statsData.data === 'object') ? statsData.data : (typeof statsData === 'object' ? statsData : {});
        setEmailStats({
          sent: Number(stats.sent) || 0,
          pending: Number(stats.pending) || 0,
          failed: Number(stats.failed) || 0,
          today: Number(stats.today) || 0,
          total: Number(stats.total) || 0
        });
      }

    } catch (error) {
      console.error('Error fetching email data:', error);
      // Keep UI stable on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.to || !testEmail.type) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
const { data } = await adminApiClient.post('/api/admin/email/send-test', testEmail);
      if (data.success) {
        alert('Test email sent successfully!');
        setTestEmail({ to: '', type: 'welcome', subject: '', message: '' });
        fetchEmailData(); // Refresh data
      } else {
        alert('Error sending email: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email');
    } finally {
      setSending(false);
    }
  };

  const resendNotification = async (notificationId) => {
    try {
const { data } = await adminApiClient.post(`/api/admin/email/resend/${notificationId}`);
      if (data.success) {
        alert('Email resent successfully!');
        fetchEmailData();
      } else {
        alert('Error resending email: ' + data.error);
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Error resending email');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'sent': { class: 'success', text: '✅ Sent', color: '#28a745' },
      'pending': { class: 'warning', text: '⏳ Pending', color: '#ffc107' },
      'failed': { class: 'danger', text: '❌ Failed', color: '#dc3545' },
      'queued': { class: 'info', text: '📋 Queued', color: '#17a2b8' }
    };

    const statusInfo = statusMap[status] || statusMap['pending'];
    return (
      <span 
        className={`status-badge ${statusInfo.class}`}
        style={{ backgroundColor: statusInfo.color }}
      >
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="email-loading">
        <div className="loading-spinner"></div>
        <p>Loading email notifications...</p>
      </div>
    );
  }

  return (
    <div className="email-container">
      <div className="email-header">
        <h1>📧 Email Notifications</h1>
        <div className="email-stats-summary">
          <div className="stat-item">
            <span className="stat-number">{emailStats.sent || 0}</span>
            <span className="stat-label">Sent Today</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{emailStats.pending || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{emailStats.failed || 0}</span>
            <span className="stat-label">Failed</span>
          </div>
        </div>
      </div>

      {/* Email Stats Cards */}
      <div className="email-stats-grid">
        <div className="stat-card sent">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h3>Emails Sent</h3>
            <p className="stat-value">{emailStats.sent || 0}</p>
            <span className="stat-period">Today</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Queue</h3>
            <p className="stat-value">{emailStats.pending || 0}</p>
            <span className="stat-period">In queue</span>
          </div>
        </div>

        <div className="stat-card failed">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Failed Deliveries</h3>
            <p className="stat-value">{emailStats.failed || 0}</p>
            <span className="stat-period">Needs attention</span>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total This Month</h3>
            <p className="stat-value">{emailStats.total || 0}</p>
            <span className="stat-period">All emails</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="email-tabs">
        <button 
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Email Queue & History
        </button>
        <button 
          className={`tab ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          📤 Send Test Email
        </button>
        <button 
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📄 Email Templates
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="email-content">
        {activeTab === 'queue' && (
          <div className="email-queue-container">
            <div className="queue-header">
              <h2>📋 Email Queue & History</h2>
              <button 
                className="btn-refresh"
                onClick={fetchEmailData}
              >
                🔄 Refresh
              </button>
            </div>

            <div className="email-list">
              {(!Array.isArray(notifications) || notifications.length === 0) ? (
                <div className="no-emails">
                  <p>📭 No email notifications found</p>
                  <p>Email notifications will appear here once sent</p>
                </div>
              ) : (
                <div className="email-table-wrapper">
                  <table className="email-table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Sent Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(notifications) ? notifications : []).map((notification) => (
                        <tr key={notification._id}>
                          <td>
                            <div className="recipient-info">
                              <span className="email">{notification.to}</span>
                              {notification.customerName && (
                                <span className="name">{notification.customerName}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="email-type">
                              {emailTypes.find(t => t.value === notification.type)?.label || notification.type}
                            </span>
                          </td>
                          <td className="subject-cell">
                            <span className="subject">{notification.subject}</span>
                          </td>
                          <td>{getStatusBadge(notification.status)}</td>
                          <td>{formatDate(notification.sentAt || notification.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              {notification.status === 'failed' && (
                                <button 
                                  className="btn-resend"
                                  onClick={() => resendNotification(notification._id)}
                                >
                                  🔄 Resend
                                </button>
                              )}
                              <button 
                                className="btn-view"
                                onClick={() => {/* TODO: View email content */}}
                              >
                                👁️ View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="send-email-container">
            <h2>📤 Send Test Email</h2>
            
            <div className="test-email-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Email *</label>
                  <input
                    type="email"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                    placeholder="Enter recipient email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Type *</label>
                  <select
                    value={testEmail.type}
                    onChange={(e) => setTestEmail({...testEmail, type: e.target.value})}
                    required
                  >
                    {emailTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Subject (Optional)</label>
                <input
                  type="text"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                  placeholder="Custom subject (leave empty for template default)"
                />
              </div>

              <div className="form-group">
                <label>Custom Message (Optional)</label>
                <textarea
                  value={testEmail.message}
                  onChange={(e) => setTestEmail({...testEmail, message: e.target.value})}
                  placeholder="Additional custom message to include"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-send-test"
                  onClick={sendTestEmail}
                  disabled={sending || !testEmail.to || !testEmail.type}
                >
                  {sending ? '📤 Sending...' : '📤 Send Test Email'}
                </button>
                
                <button 
                  className="btn-clear"
                  onClick={() => setTestEmail({ to: '', type: 'welcome', subject: '', message: '' })}
                >
                  🗑️ Clear Form
                </button>
              </div>
            </div>

            <div className="email-preview">
              <h3>📄 Template Preview</h3>
              <div className="template-info">
                <p><strong>Template:</strong> {emailTypes.find(t => t.value === testEmail.type)?.template}</p>
                <p><strong>Description:</strong> {emailTypes.find(t => t.value === testEmail.type)?.label}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-container">
            <h2>📄 Email Templates</h2>
            
            <div className="templates-grid">
              {emailTypes.map(template => (
                <div key={template.value} className="template-card">
                  <div className="template-header">
                    <h3>{template.label}</h3>
                    <span className="template-type">{template.template}</span>
                  </div>
                  
                  <div className="template-description">
                    <p>Template for {template.label.toLowerCase()} notifications</p>
                  </div>
                  
                  <div className="template-actions">
                    <button 
                      className="btn-preview"
                      onClick={() => {/* TODO: Preview template */}}
                    >
                      👁️ Preview
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => {/* TODO: Edit template */}}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailNotifications;
