'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Upload, X, FileText, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { lawyers } from '@/lib/api';

const DOCS = [
  {
    type: 'bar_certificate',
    label: 'Bar Association Certificate',
    desc: 'Official certificate from the Cameroon Bar Association (Barreau du Cameroun)',
    required: true,
  },
  {
    type: 'national_id',
    label: 'National ID / Passport',
    desc: 'Government-issued identity document',
    required: true,
  },
  {
    type: 'diploma',
    label: 'Law Degree / Diploma',
    desc: 'Law degree or equivalent qualification (optional but recommended)',
    required: false,
  },
];

export default function LawyerDocuments() {
  const router = useRouter();

  const [files, setFiles]       = useState({});  // { [type]: File }
  const [statuses, setStatuses] = useState({});  // { [type]: 'uploading' | 'done' | 'error' }
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  function handleSelect(type, file) {
    if (!file) return;
    setFiles((p) => ({ ...p, [type]: file }));
    setStatuses((p) => { const n = { ...p }; delete n[type]; return n; });
  }

  function remove(type) {
    setFiles((p) => { const n = { ...p }; delete n[type]; return n; });
    setStatuses((p) => { const n = { ...p }; delete n[type]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError('');

    const missing = DOCS.filter((d) => d.required && !files[d.type]);
    if (missing.length) {
      setGlobalError(`Please upload: ${missing.map((d) => d.label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    let hasError = false;

    for (const [type, file] of Object.entries(files)) {
      setStatuses((p) => ({ ...p, [type]: 'uploading' }));
      try {
        await lawyers.uploadDocument(file, type);
        setStatuses((p) => ({ ...p, [type]: 'done' }));
      } catch {
        setStatuses((p) => ({ ...p, [type]: 'error' }));
        hasError = true;
      }
    }

    setSubmitting(false);
    if (!hasError) {
      router.push('/lawyer-dashboard');
    } else {
      setGlobalError('Some files failed to upload. Please retry the highlighted ones.');
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-between pb-12">

      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200/60 py-4 px-6 md:px-16 flex items-center justify-between sticky top-0 z-20">
        <a href="/" className="font-serif text-xl font-bold text-primary tracking-wide flex items-center gap-2">
          <GavelIcon size={22} />
          LexCam
        </a>
        <button
          onClick={() => router.push('/lawyer-dashboard')}
          className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          Skip for now <ArrowRight size={14} />
        </button>
      </header>

      <main className="max-w-4xl w-full px-6 mt-10 flex-1 flex flex-col items-center">

        {/* Stepper */}
        <div className="w-full max-w-2xl mb-12 relative flex items-center justify-between">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary -z-10" />
          {[
            { label: 'Account',   active: false },
            { label: 'Profile',   active: false },
            { label: 'Documents', active: true  },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`rounded-full flex items-center justify-center border-2 shadow-sm font-bold text-xs
                ${step.active
                  ? 'w-9 h-9 bg-primary text-white border-white ring-2 ring-primary'
                  : 'w-8 h-8 bg-primary text-white border-primary'}`}>
                {step.active ? i + 1 : <Check size={15} strokeWidth={3} />}
              </div>
              <span className={`text-[11px] font-bold mt-2 ${step.active ? 'text-primary' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface w-full rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Upload Credentials</h2>
          <p className="text-muted text-sm leading-relaxed mb-8">
            Your documents are reviewed by our admin team before your profile goes live. All files are stored securely.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {DOCS.map((doc) => {
              const file   = files[doc.type];
              const status = statuses[doc.type];

              return (
                <div key={doc.type} className={`border rounded-xl p-5 transition-colors ${
                  status === 'done'  ? 'border-emerald-200 bg-emerald-50/40' :
                  status === 'error' ? 'border-red-200 bg-red-50/40' :
                  file              ? 'border-primary/30 bg-primary/5' :
                                      'border-gray-200 bg-white'
                }`}>

                  {/* Label row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-gray-900">{doc.label}</p>
                        {doc.required ? (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Required</span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">Optional</span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{doc.desc}</p>
                    </div>
                    {status === 'done' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    {status === 'uploading' && <Loader2 size={20} className="animate-spin text-primary flex-shrink-0 mt-1" />}
                    {status === 'error' && (
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
                        <X size={14} />
                      </div>
                    )}
                  </div>

                  {/* Drop zone or file preview */}
                  {!file ? (
                    <label className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      <Upload size={20} className="text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-600">Click to upload</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG — max 10 MB</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleSelect(doc.type, e.target.files?.[0])}
                      />
                    </label>
                  ) : (
                    <div className="mt-4 flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <FileText size={16} className="text-primary flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700 truncate flex-1">{file.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                      {status !== 'uploading' && status !== 'done' && (
                        <button type="button" onClick={() => remove(doc.type)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {status === 'error' && (
                    <p className="mt-2 text-xs font-semibold text-red-500">Upload failed — please try again.</p>
                  )}
                </div>
              );
            })}

            {globalError && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {globalError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white py-3.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  : <>Submit Documents <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
          <ShieldCheck size={14} />
          <span>Documents are encrypted and only visible to verified admins</span>
        </div>

      </main>
    </div>
  );
}
