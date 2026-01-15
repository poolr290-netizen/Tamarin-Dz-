
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { AcademicYear, Major, UserProfile, ChatMessage } from './types';
import { YEAR_LABELS } from './constants';
import { solveExercise } from './geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    // Fixing type assignment from localStorage
    if (saved) {
      try {
        return JSON.parse(saved) as UserProfile;
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }
    return { name: 'تلميذ جديد', avatar: 'https://picsum.photos/200', isLoggedIn: false };
  });

  const [currentYear, setCurrentYear] = useState<AcademicYear | null>(null);
  const [currentMajor, setCurrentMajor] = useState<Major | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(user));
  }, [user]);

  const handleLogin = () => {
    setUser({
      name: 'عبد الرحمن دزاير',
      avatar: 'https://picsum.photos/200?random=1',
      isLoggedIn: true
    });
  };

  const updateProfile = (name: string, avatar: string) => {
    setUser({ ...user, name, avatar });
  };

  const getMajorsForYear = (year: AcademicYear) => {
    if (year === AcademicYear.Y1) return [Major.SCIENTIFIC, Major.LIT_PHIL];
    return Object.values(Major).filter(m => m !== Major.SCIENTIFIC && m !== Major.LIT_PHIL).concat([Major.SCIENTIFIC, Major.LIT_PHIL]);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && selectedImages.length === 0) || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: inputText,
      image: selectedImages.length > 0 ? selectedImages[0] : undefined,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImages([]);
    setLoading(true);

    const solution = await solveExercise(
      userMessage.text,
      currentYear || 'غير محدد',
      currentMajor || 'غير محدد',
      userMessage.image
    );

    const aiMessage: ChatMessage = {
      role: 'model',
      text: solution,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, aiMessage]);
    setLoading(false);
  };

  // Fixed React namespace error by using React.ChangeEvent and ensured type safety for FileReader
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSelectedImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        // Correctly assigning the MediaStream to srcObject
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("لا يمكن الوصول إلى الكاميرا");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      // toDataURL returns a string, which is correct for selectedImages
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setSelectedImages(prev => [...prev, imageData]);
    }
  };

  const stopCamera = () => {
    // Cast srcObject to MediaStream to access getTracks() method safely
    if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const renderHome = () => (
    <div className="py-8 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4">اختر مستواك الدراسي</h2>
        <p className="text-lg opacity-70">حل تمارين الثانوي وفق المنهاج الجزائري الرسمي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[AcademicYear.Y1, AcademicYear.Y2, AcademicYear.Y3].map((year) => (
          <button
            key={year}
            onClick={() => setCurrentYear(year)}
            className="group relative h-48 overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900 border-2 border-slate-100 dark:border-white/5 hover:border-blue-500 transition-all p-8 text-right shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative z-10">
              <span className="text-blue-600 dark:text-blue-400 font-black text-2xl mb-2 block">{year}</span>
              <h3 className="text-2xl font-bold">{YEAR_LABELS[year]}</h3>
              <p className="text-sm opacity-60 mt-2 font-semibold">اضغط لاختيار الشعبة</p>
            </div>
            <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" /></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMajorSelection = () => (
    <div className="py-8 animate-in slide-in-from-left duration-300">
      <button onClick={() => setCurrentYear(null)} className="flex items-center gap-2 text-blue-600 mb-6 font-bold hover:underline">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        الرجوع للمستويات
      </button>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 text-blue-600 dark:text-blue-400">{currentYear ? YEAR_LABELS[currentYear] : ''}</h2>
        <p className="opacity-70 text-lg font-semibold">اختر الشعبة الرسمية المقررة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentYear && getMajorsForYear(currentYear).map((major) => (
          <button
            key={major}
            onClick={() => setCurrentMajor(major)}
            className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl font-bold text-center border-2 border-slate-100 dark:border-white/5 hover:border-blue-500 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            {major}
          </button>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10">
        <button onClick={() => setCurrentMajor(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
           <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
        </button>
        <div className="text-center">
          <div className="font-black text-blue-600 dark:text-blue-400">{currentMajor}</div>
          <div className="text-xs font-bold opacity-50 uppercase tracking-widest">{currentYear ? YEAR_LABELS[currentYear] : ''}</div>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-40">
            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/10">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            </div>
            <p className="text-xl font-bold max-w-xs">أرسل التمرين (نص أو صور) وسأقدم لك الحل المختصر والمباشر</p>
          </div>
        )}
        
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-[2rem] p-5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-tl-none'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Exercise" className="max-w-full rounded-2xl mb-4 border border-white/10 shadow-lg" />
              )}
              <div className="whitespace-pre-wrap leading-relaxed font-semibold text-sm md:text-base">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-[2rem] rounded-tl-none p-5 shadow-sm border border-slate-100 dark:border-white/10 animate-pulse flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span className="text-sm font-bold opacity-70">جاري التحليل والحل...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-white/10">
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative inline-block">
                <img src={img} className="h-24 w-24 object-cover rounded-xl border-2 border-blue-500 shadow-md" alt={`Selected ${index}`} />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform ring-2 ring-white dark:ring-black"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-2 rounded-[1.5rem] shadow-inner border border-slate-100 dark:border-white/5">
          <div className="flex gap-1 px-1">
            <label className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all" title="إرفاق صور">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </label>
            <button 
              onClick={startCamera}
              className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500"
              title="تصوير تمرين"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
          <input 
            type="text" 
            placeholder="اكتب التمرين هنا..."
            className="flex-1 bg-transparent p-3 outline-none font-bold placeholder:opacity-50"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            disabled={(!inputText.trim() && selectedImages.length === 0) || loading}
            onClick={handleSendMessage}
            className="p-3.5 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:grayscale hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>

      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
             <video ref={videoRef} autoPlay playsInline className="w-full rounded-3xl shadow-2xl bg-zinc-900 border border-white/10" />
             {selectedImages.length > 0 && (
                <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-full p-2 bg-black/40 rounded-2xl backdrop-blur-sm">
                   {selectedImages.map((img, i) => (
                      <img key={i} src={img} className="h-12 w-12 object-cover rounded-lg border border-white/20" />
                   ))}
                </div>
             )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={stopCamera}
              className="px-8 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/20"
            >
              إتمام والرجوع
            </button>
            <button 
              onClick={capturePhoto}
              className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 active:scale-95 transition-all shadow-xl"
            >
              التقاط صورة
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout user={user} onLogin={handleLogin} onUpdateUser={updateProfile}>
      {!currentYear && renderHome()}
      {currentYear && !currentMajor && renderMajorSelection()}
      {currentYear && currentMajor && renderChat()}
    </Layout>
  );
};

export default App;
