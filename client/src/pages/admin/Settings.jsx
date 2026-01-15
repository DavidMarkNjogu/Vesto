import { useState } from 'react';
import { Save, User, Lock, Bell, Shield, Mail, Globe, Monitor } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-500">Manage your profile and system preferences.</p>
        </div>
        <button className="btn btn-primary text-white gap-2 shadow-lg">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <nav className="flex flex-col p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Profile Details</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl font-bold relative group cursor-pointer overflow-hidden">
                  <span className="group-hover:opacity-0 transition-opacity">JD</span>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                    Change
                  </div>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline gap-2">Upload New Photo</button>
                  <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">First Name</label>
                  <input type="text" defaultValue="John" className="input input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Last Name</label>
                  <input type="text" defaultValue="Doe" className="input input-bordered" />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" defaultValue="admin@vesto.com" className="input input-bordered pl-10" />
                  </div>
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Bio</label>
                  <textarea className="textarea textarea-bordered h-24" defaultValue="Super Administrator managing the Vesto platform operations."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Password Change</h2>
                <div className="space-y-4 max-w-md">
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input type="password" placeholder="••••••••" className="input input-bordered" />
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input type="password" placeholder="••••••••" className="input input-bordered" />
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="input input-bordered" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Shield size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="btn btn-sm btn-primary text-white">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg h-fit"><Monitor size={18}/></div>
                    <div>
                      <p className="font-bold text-gray-800">Desktop Notifications</p>
                      <p className="text-xs text-gray-500">Receive popups when new orders arrive</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-success" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit"><Mail size={18}/></div>
                    <div>
                      <p className="font-bold text-gray-800">Email Alerts</p>
                      <p className="text-xs text-gray-500">Weekly summaries and critical alerts</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg h-fit"><Globe size={18}/></div>
                    <div>
                      <p className="font-bold text-gray-800">System Updates</p>
                      <p className="text-xs text-gray-500">Changelogs and maintenance notices</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-warning" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;