import { Search, MapPin, Briefcase, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LawyerDirectory() {
  const lawyers = [
    {
      name: 'Maitre Paul Biya',
      location: 'Yaoundé',
      specialties: ['Corporate', 'Tax Law'],
      bio: 'Specializing in corporate restructuring and international tax compliance for businesses operating across Central...',
      status: 'Verified',
    },
    {
      name: 'Maitre Anne Etoga',
      location: 'Douala',
      specialties: ['Family Law', 'Civil Rights'],
      bio: 'Dedicated to protecting family rights, handling complex divorces, and advocating for civil liberties in the coastal region.',
      status: 'Verified',
    },
    {
      name: 'Maitre Jean Ndi',
      location: 'Bamenda',
      specialties: ['Labour Law', 'Contracts'],
      bio: "Expert in employment disputes, contract negotiation, and worker's compensation claims with over 10 years of experience.",
      status: 'Pending',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header activePage="lawyers" />

      <div className="py-16 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Header Block with View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-2">
                Find a Lawyer
              </h2>
              <p className="text-muted text-sm md:text-base">
                Connect with verified legal professionals across Cameroon.
              </p>
            </div>

            <div className="bg-gray-200/60 p-1 rounded-lg flex items-center self-start text-sm font-medium border border-gray-300/30">
              <button className="bg-surface text-gray-900 px-4 py-1.5 rounded-md shadow-sm">
                Grid
              </button>
              <button className="text-muted hover:text-gray-900 px-4 py-1.5 transition-colors">
                Map
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-surface rounded-2xl md:rounded-full shadow-sm border border-gray-200/80 p-3 mb-12">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">

              <div className="flex items-center gap-3 pl-3 flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-3 lg:pb-0">
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or keyword..."
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base"
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 cursor-pointer text-gray-700 hover:text-gray-900 min-w-[160px]">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <MapPin size={18} className="text-gray-400" />
                  <span>All Cities</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 lg:py-0 cursor-pointer text-gray-700 hover:text-gray-900 min-w-[180px]">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Briefcase size={18} className="text-gray-400" />
                  <span>All Domains</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              <button className="bg-primary hover:bg-primary-light transition-colors text-white font-medium rounded-xl lg:rounded-full px-8 py-3.5 text-sm md:text-base shadow-sm">
                Search
              </button>

            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lawyers.map((lawyer, index) => (
              <div
                key={index}
                className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 border border-gray-100 shadow-inner" />
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary leading-snug">
                        {lawyer.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted font-medium mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{lawyer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {lawyer.specialties.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted text-sm leading-relaxed mb-8">
                    {lawyer.bio}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50 mt-auto">
                  {lawyer.status === 'Verified' ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 size={16} className="fill-emerald-800 text-white" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                      <Clock size={16} />
                      <span>Pending</span>
                    </div>
                  )}

                  <button
                    disabled={lawyer.status !== 'Verified'}
                    className={`px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                      lawyer.status === 'Verified'
                        ? 'border-primary text-primary hover:bg-primary/5 cursor-pointer'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
