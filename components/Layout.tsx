
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  onLogin: () => void;
  onUpdateUser: (name: string, avatar: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogin, onUpdateUser }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 ease-in-out text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-slate-100 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20 group overflow-hidden relative">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,3A3,3 0 0,0 9,6A3,3 0 0,0 12,9A3,3 0 0,0 15,6A3,3 0 0,0 12,3M4,17V19H20V17H4M18.3,13.2L16.2,11.1C15.6,10.5 14.8,10.1 14,10.1H10C9.2,10.1 8.4,10.5 7.8,11.1L5.7,13.2C5.1,13.8 4.8,14.6 4.8,15.4V16H19.2V15.4C19.2,14.6 18.9,13.8 18.3,13.2Z" />
              <rect x="3" y="19" width="18" height="1.5" rx="0.5" />
            </svg>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Tamarin <span className="text-blue-600">Dz</span></h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all overflow-hidden border border-transparent dark:border-white/10"
            aria-label="تبديل المظهر"
          >
            <div className={`transition-all duration-500 transform ${darkMode ? 'translate-y-0 opacity-100 rotate-0 scale-110' : 'translate-y-10 opacity-0 rotate-45 scale-50'}`}>
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
            </div>
            <div className={`absolute transition-all duration-500 transform ${!darkMode ? 'translate-y-0 opacity-100 rotate-0 scale-110' : '-translate-y-10 opacity-0 -rotate-45 scale-50'}`}>
              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            </div>
          </button>

          {!user.isLoggedIn ? (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Google دخول
            </button>
          ) : (
            <div 
              onClick={() => { setShowProfileModal(true); setTempName(user.name); }}
              className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-white/5 p-1.5 pl-4 rounded-xl border border-slate-100 dark:border-white/10"
            >
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg border-2 border-blue-500/50 transition-transform group-hover:scale-105" />
              <span className="hidden md:block font-bold text-sm">{user.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 pb-12">
        {children}
      </main>

      <footer className="py-12 border-t border-slate-100 dark:border-white/5 text-center px-4 bg-slate-50/30 dark:bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col items-center">
             <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest mb-1">المنصة التعليمية الأولى في الجزائر</p>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
               جميع الحقوق محفوظة © {new Date().getFullYear()} - Tamarin Dz
             </p>
          </div>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-black px-4 text-sm text-slate-400">صُنع بكل فخر</span>
            </div>
          </div>

          <p className="text-xl font-black text-slate-900 dark:text-white">
            تم إنشاء التطبيق بواسطة <br/>
            <span className="text-2xl text-blue-600 inline-block mt-2 hover:scale-110 transition-transform cursor-default">
               عيماد أيت الهادي
            </span>
          </p>
        </div>
      </footer>

      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10 transform transition-all scale-100">
            <h2 className="text-2xl font-black mb-6 text-center">الملف الشخصي</h2>
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <img src={user.avatar} className="w-28 h-28 rounded-[2rem] border-4 border-blue-500 shadow-xl" alt="Avatar" />
              </div>
              <div className="w-full">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block mr-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold"
                />
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => { onUpdateUser(tempName, user.avatar); setShowProfileModal(false); }}
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                >
                  حفظ التعديلات
                </button>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 bg-slate-100 dark:bg-white/5 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
