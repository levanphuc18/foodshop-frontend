'use client';

import React from 'react';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';
import AccountStatCard from '@/components/shop/account/AccountStatCard';

export default function Pageprofile() {
  return (
    <AccountPageShell active="profile">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="My Account"
          title="Personal Profile"
          description="Update your information and manage your preferences."
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-sky-600 to-slate-800" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg bg-slate-100">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_3QqSySSbvUFf4-ocy-Nx2FThNjUbIYvWkxO7LY7zlLEyE_OahsKZkMJEA7gQtoIhpbLlDeRmWKISz_eyVMBdD9IGDFRAXQDVcrJUDpc2EtiiZkEf4iYE3vlUnwlYvTdExe0RcnhPs-KEOUs4XEIMf5SgVhWKUYshUY6DP95zcfo7YyhVHs7I8Ot9eFir9ZNfLyreCmQCqKwfILvr_EBLbdzRJ8vJJGsOgRDpDombLv3GQ2V55qn1o1Lu2VQMGLzoBZotiRkpAtk"
                    alt="Profile"
                  />
                </div>
                <button type="button" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-md hover:bg-sky-700 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                </button>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg">
                <span className="material-symbols-outlined text-[14px]">verified</span> Elite Member
              </span>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="First Name" defaultValue="Alex" />
                <FormField label="Last Name" defaultValue="Thompson" />
              </div>
              <FormField label="Email Address" type="email" defaultValue="alex.thompson@curator.com" />
              <FormField label="Phone Number" type="tel" defaultValue="+1 (555) 234-8890" />

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" className="text-sky-600 text-sm font-bold flex items-center gap-2 hover:text-sky-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  Change Password
                </button>
                <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AccountStatCard icon="shopping_bag" label="Total Orders" value="36" color="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
          <AccountStatCard icon="favorite" label="Saved Items" value="12" color="text-red-500 bg-red-50 dark:bg-red-900/20" />
          <AccountStatCard icon="local_shipping" label="Deliveries" value="34" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
      </div>
    </AccountPageShell>
  );
}

function FormField({ label, defaultValue, type = 'text' }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
      />
    </div>
  );
}
