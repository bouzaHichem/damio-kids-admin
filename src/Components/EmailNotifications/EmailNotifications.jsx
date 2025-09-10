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

  // Preset subjects and simple HTML bodies for templates (fallback when server templates are unavailable)
  const templatePresets = {
    welcome: {
      subject: 'Welcome to Damio Kids, {{customerName}}! 🎉',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Welcome to Damio Kids, {{customerName}}!</h2>
          <p>We are thrilled to have you. Explore our latest collections and enjoy exclusive offers.</p>
          <p>Happy shopping! 💛</p>
        </div>`
    },
    order_confirmation: {
      subject: 'Order #{{orderId}} confirmed ✅',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Thanks for your purchase, {{customerName}}!</h2>
          <p>Your order <strong>#{{orderId}}</strong> has been confirmed.</p>
          <p>Total: <strong>{{total}}</strong> | Placed on: {{orderDate}}</p>
        </div>`
    },
    order_status: {
      subject: 'Your order #{{orderId}} status is now {{status}}',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Order Update</h2>
          <p>Your order <strong>#{{orderId}}</strong> status changed to <strong>{{status}}</strong>.</p>
        </div>`
    },
    low_stock: {
      subject: 'Low stock alert: {{productName}}',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Low Stock Alert</h2>
          <p>The product <strong>{{productName}}</strong> is running low ({{quantity}} left).</p>
        </div>`
    },
    password_reset: {
      subject: 'Reset your Damio Kids password',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <p><a href="{{resetLink}}">Reset Password</a></p>
        </div>`
    },
    newsletter: {
      subject: 'Damio Kids — Latest News & Offers',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2>Newsletter</h2>
          <p>{{content}}</p>
        </div>`
    },
    custom: {
      subject: '{{subject}}',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">{{html}}</div>`
    }
  };

  // Modal state for preview/edit
  const [preview, setPreview] = useState({ open: false, html: '', subject: '' });
  const [editor, setEditor] = useState({ open: false, type: '', subject: '', html: '', saving: false });

  const openPreview = async (type) => {
    // Try server preview; if not available, use preset
    try {
      const { data } = await adminApiClient.get(`/api/admin/email/templates/${type}/preview`).catch(() => ({ data: null }));
      const subject = data?.data?.subject || templatePresets[type]?.subject || 'Preview';
      const html = data?.data?.html || templatePresets[type]?.html || '<p>No preview available</p>';
      setPreview({ open: true, html, subject });
    } catch (e) {
      setPreview({ open: true, html: templatePresets[type]?.html || '<p>No preview available</p>', subject: templatePresets[type]?.subject || 'Preview' });
    }
  };

  const openEditor = async (type) => {
    // Load existing server template; fallback to preset
    try {
      const { data } = await adminApiClient.get(`/api/admin/email/templates/${type}`).catch(() => ({ data: null }));
      const subject = data?.data?.subject || templatePresets[type]?.subject || '';
      const html = data?.data?.html || templatePresets[type]?.html || '';
      setEditor({ open: true, type, subject, html, saving: false });
    } catch (e) {
      const preset = templatePresets[type] || { subject: '', html: '' };
      setEditor({ open: true, type, subject: preset.subject, html: preset.html, saving: false });
    }
  };

  const saveTemplate = async () => {
    if (!editor.type) return;
    setEditor((s) => ({ ...s, saving: true }));
    try {
      const payload = { subject: editor.subject, html: editor.html };
      const { data } = await adminApiClient.put(`/api/admin/email/templates/${editor.type}`, payload);
      if (data?.success) {
        alert('Template saved successfully');
        setEditor((s) => ({ ...s, open: false, saving: false }));
      } else {
        alert(data?.error || 'Server did not accept template update. Make sure backend supports templates API.');
        setEditor((s) => ({ ...s, saving: false }));
      }
    } catch (error) {
      console.error('Save template error:', error);
      alert('Saving failed. Backend may not support template editing yet.');
      setEditor((s) => ({ ...s, saving: false }));
    }
  };

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
                      onClick={() => openPreview(template.value)}
                    >
                      👁️ Preview
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => openEditor(template.value)}
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

      {/* Preview Modal */}
      {preview.open && (
        <div className="modal-overlay" onClick={() => setPreview({ open: false, html: '', subject: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preview: {preview.subject}</h3>
              <button className="modal-close" onClick={() => setPreview({ open: false, html: '', subject: '' })}>✖</button>
            </div>
            <div className="modal-body" style={{background:'#fff',border:'1px solid #eee',padding:10,borderRadius:6,maxHeight:'60vh',overflow:'auto'}}>
              <iframe title="email-preview" style={{width:'100%',height:'60vh',border:'none',background:'#fff'}} srcDoc={`<!doctype html><html><head><meta charset='utf-8'></head><body>${preview.html}</body></html>`} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editor.open && (
        <div className="modal-overlay" onClick={() => setEditor({ open:false, type:'', subject:'', html:'', saving:false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Template: {emailTypes.find(t=>t.value===editor.type)?.label || editor.type}</h3>
              <button className="modal-close" onClick={() => setEditor({ open:false, type:'', subject:'', html:'', saving:false })}>✖</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={editor.subject} onChange={(e)=>setEditor(s=>({...s, subject:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>HTML</label>
                <textarea rows="10" value={editor.html} onChange={(e)=>setEditor(s=>({...s, html:e.target.value}))}></textarea>
              </div>
              <p style={{fontSize:12,color:'#666'}}>
                Available placeholders may include: {'{{customerName}}'}, {'{{orderId}}'}, {'{{status}}'}, {'{{total}}'}. These are replaced by the backend when sending.
              </p>
            </div>
            <div className="modal-footer" style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn-clear" onClick={()=>openPreview(editor.type)}>Preview</button>
              <button className="btn-send-test" disabled={editor.saving} onClick={saveTemplate}>{editor.saving ? 'Saving...' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotifications;
