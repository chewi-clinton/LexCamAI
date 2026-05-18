'use client';
import {
  Plus, Filter, ArrowUpDown, Eye, Pencil,
  Briefcase, Layers, Home, FileSignature,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function DocumentTemplatesAdmin() {
  const { lang } = useLanguage();
  const T = t[lang].admin;
  const templates = [
    {
      name: 'Non-Disclosure Agreement (Standard)',
      category: 'Corporate / Confidentiality',
      slug: 'nda-standard',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      price: '15,000',
      lastUpdated: 'Oct 24, 2023',
      icon: Layers,
      enabled: true,
    },
    {
      name: 'Employment Contract (CDI)',
      category: 'Labor Law',
      slug: 'employment-contract-cdi',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      price: '25,000',
      lastUpdated: 'Oct 20, 2023',
      icon: Briefcase,
      enabled: true,
    },
    {
      name: 'Commercial Lease Agreement',
      category: 'Real Estate',
      slug: 'commercial-lease',
      status: 'Disabled',
      statusColor: 'bg-gray-100 text-gray-500 border-gray-200',
      price: '45,000',
      lastUpdated: 'Sep 15, 2023',
      icon: Home,
      enabled: false,
    },
    {
      name: 'Consulting Services Agreement',
      category: 'Corporate',
      slug: 'consulting-agreement',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      price: '20,000',
      lastUpdated: 'Oct 25, 2023',
      icon: FileSignature,
      enabled: true,
    },
  ];

  return (
    <div className="p-8 space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.templatesTitle}</h2>
          <p className="text-muted text-sm mt-1">{T.templatesDesc}</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus size={16} /> {T.uploadTemplate}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Filter size={14} className="text-gray-400" /> {T.filter}
            </button>
            <button className="border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={14} className="text-gray-400" /> {T.sort}
            </button>
          </div>
          <span className="text-xs font-semibold text-gray-400">{T.showing} 4 of 24 templates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                <th className="py-4 px-6 w-[40%]">{T.templateName}</th>
                <th className="py-4 px-6">{T.internalSlug}</th>
                <th className="py-4 px-4">{T.status}</th>
                <th className="py-4 px-6">{T.price}</th>
                <th className="py-4 px-6">{T.lastUpdated}</th>
                <th className="py-4 px-6 text-right">{T.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {templates.map((tpl, idx) => {
                const IconComponent = tpl.icon;
                return (
                  <tr key={idx} className="hover:bg-gray-50/40 transition-colors">

                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-bold text-gray-900 leading-snug">{tpl.name}</p>
                          <p className="text-[10px] text-gray-400 font-normal mt-0.5">{tpl.category}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6 font-mono text-gray-500 max-w-[160px] truncate">
                      {tpl.slug}
                    </td>

                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tpl.statusColor}`}>
                        {tpl.status}
                      </span>
                    </td>

                    <td className="py-5 px-6 font-bold text-gray-900 text-sm">{tpl.price}</td>

                    <td className="py-5 px-6 text-gray-400 font-normal">{tpl.lastUpdated}</td>

                    <td className="py-5 px-6 text-right">
                      <div className="inline-flex items-center gap-4 text-gray-400 justify-end w-full">
                        <button className="hover:text-gray-600 transition-colors p-0.5"><Eye size={16} /></button>
                        <button className="hover:text-gray-600 transition-colors p-0.5"><Pencil size={16} /></button>
                        <div className="h-4 w-px bg-gray-200" />
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input type="checkbox" defaultChecked={tpl.enabled} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
