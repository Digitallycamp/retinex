import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Save, 
  RefreshCw,
  Moon,
  Sun,
  ChevronRight,
  Check,
  AlertCircle,
  Smartphone,
  Mail,
  Lock,
  LogOut,
  Trash2
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+63 912 345 6789',
    role: 'Administrator',
    department: 'Inventory Management'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    newProductAlerts: false,
    weeklyReports: true,
    systemUpdates: true,
    marketingEmails: false
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    compactView: false,
    animations: true,
    fontSize: 'medium'
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginNotifications: true
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    currency: 'PHP',
    language: 'English',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY'
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'system', label: 'System', icon: <Globe size={18} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-yellow-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {profileSettings.fullName.charAt(0)}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 bg-yellow-600 hover:bg-yellow-700 text-white p-1.5 rounded-full shadow-lg transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{profileSettings.fullName}</h3>
          <p className="text-sm text-gray-500">{profileSettings.role}</p>
          <p className="text-xs text-gray-400 mt-1">Member since Jan 2024</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profileSettings.fullName}
            onChange={(e) => setProfileSettings({...profileSettings, fullName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={profileSettings.email}
            onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileSettings.phone}
            onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={profileSettings.department}
            onChange={(e) => setProfileSettings({...profileSettings, department: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option>Inventory Management</option>
            <option>Sales</option>
            <option>Administration</option>
            <option>Warehouse</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-5">
      {Object.entries(notificationSettings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-800">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5">
              Receive notifications about {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
            </p>
          </div>
          <button
            onClick={() => setNotificationSettings({...notificationSettings, [key]: !value})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-yellow-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}
            className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
              appearanceSettings.theme === 'light' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Sun size={20} className={appearanceSettings.theme === 'light' ? 'text-yellow-600' : 'text-gray-500'} />
            <span className="font-medium">Light</span>
            {appearanceSettings.theme === 'light' && <Check size={16} className="text-yellow-600 ml-auto" />}
          </button>
          <button
            onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}
            className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
              appearanceSettings.theme === 'dark' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Moon size={20} className={appearanceSettings.theme === 'dark' ? 'text-yellow-600' : 'text-gray-500'} />
            <span className="font-medium">Dark</span>
            {appearanceSettings.theme === 'dark' && <Check size={16} className="text-yellow-600 ml-auto" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Font Size
        </label>
        <div className="flex gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setAppearanceSettings({...appearanceSettings, fontSize: size})}
              className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                appearanceSettings.fontSize === size
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-200">
        <div>
          <h4 className="font-medium text-gray-800">Compact View</h4>
          <p className="text-sm text-gray-500">Reduce spacing between elements</p>
        </div>
        <button
          onClick={() => setAppearanceSettings({...appearanceSettings, compactView: !appearanceSettings.compactView})}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            appearanceSettings.compactView ? 'bg-yellow-600' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            appearanceSettings.compactView ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-200">
        <div>
          <h4 className="font-medium text-gray-800">Animations</h4>
          <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
        </div>
        <button
          onClick={() => setAppearanceSettings({...appearanceSettings, animations: !appearanceSettings.animations})}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            appearanceSettings.animations ? 'bg-yellow-600' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            appearanceSettings.animations ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Security Tips</p>
            <p>Use a strong password and enable two-factor authentication for better security.</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <input
          type="password"
          placeholder="Enter current password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        {Object.entries(securitySettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-800">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500">
                {key === 'twoFactorAuth' && 'Add an extra layer of security to your account'}
                {key === 'sessionTimeout' && 'Automatically log out after inactivity'}
                {key === 'loginNotifications' && 'Get notified of new logins to your account'}
              </p>
            </div>
            {key === 'sessionTimeout' ? (
              <select
                value={value}
                onChange={(e) => setSecuritySettings({...securitySettings, [key]: e.target.value})}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            ) : (
              <button
                onClick={() => setSecuritySettings({...securitySettings, [key]: !value})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={systemSettings.currency}
            onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="PHP">Philippine Peso (₱)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={systemSettings.language}
            onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="English">English</option>
            <option value="Filipino">Filipino</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={systemSettings.timezone}
            onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            <option value="America/New_York">America/New York (GMT-5)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={systemSettings.dateFormat}
            onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Data Management</h4>
            <p className="text-sm text-yellow-700">Manage your inventory data and backups</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 transition-all">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Export Data</p>
              <p className="text-sm text-gray-500">Export all inventory data to CSV</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 transition-all">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Backup Database</p>
              <p className="text-sm text-gray-500">Create a backup of your data</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-red-300 transition-all">
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Clear All Data</p>
              <p className="text-sm text-gray-500">Permanently delete all inventory data</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      case 'system': return renderSystemSettings();
      case 'data': return renderDataManagement();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Settings
          </h1>
          <p className="text-gray-600">Manage your account preferences and system settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 sticky top-8">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-semibold text-gray-800">Preferences</h3>
                <p className="text-xs text-gray-500 mt-1">Customize your experience</p>
              </div>
              <div className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                      activeTab === tab.id
                        ? 'bg-yellow-50 text-yellow-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span className="flex-1 text-left">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight size={16} />}
                  </button>
                ))}
              </div>

              {/* Danger Zone */}
              <div className="p-4 border-t border-gray-200 mt-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <LogOut size={16} className="text-red-600" />
                    <span className="text-xs font-semibold text-red-700">Danger Zone</span>
                  </div>
                  <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-1">
                    Log out from all devices
                  </button>
                  <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-1">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800">
                  {tabs.find(t => t.id === activeTab)?.label} Settings
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update your {activeTab} preferences and settings
                </p>
              </div>

              <div className="p-6">
                {renderContent()}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {successMessage && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check size={16} />
                      <span className="text-sm">{successMessage}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Reset to default logic here
                      setProfileSettings({
                        fullName: 'John Doe',
                        email: 'john.doe@example.com',
                        phone: '+63 912 345 6789',
                        role: 'Administrator',
                        department: 'Inventory Management'
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Changes may take a few moments to apply across all devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Camera icon component
const Camera = ({ size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default Settings;