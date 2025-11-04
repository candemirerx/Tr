

import React, { useState, useEffect, useRef } from 'react';
import type { GroundingDocument } from '../types';

export interface SettingsData {
    context: string;
    documents: GroundingDocument[];
    defaultAutoCorrect: boolean;
    defaultPersistentDictation: boolean;
    dictationTimeout: number;
    enhancementLevel: number;
    forceRoleContext: boolean;
    aiModelPreference: 'flash' | 'pro';
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsData) => void;
  initialContext: string;
  initialGroundingDocuments: GroundingDocument[];
  initialDefaultAutoCorrect: boolean;
  initialDefaultPersistentDictation: boolean;
  initialDictationTimeout: number;
  initialEnhancementLevel: number;
  initialForceRoleContext: boolean;
  initialAiModelPreference: 'flash' | 'pro';
}

declare global {
    interface Window {
        pdfjsLib: any;
    }
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
            active 
                ? 'bg-slate-700 text-blue-300' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'
        }`}
    >
        {children}
    </button>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialContext, 
    initialGroundingDocuments,
    initialDefaultAutoCorrect,
    initialDefaultPersistentDictation,
    initialDictationTimeout,
    initialEnhancementLevel,
    initialForceRoleContext,
    initialAiModelPreference
}) => {
  const [context, setContext] = useState(initialContext);
  const [documents, setDocuments] = useState<GroundingDocument[]>(initialGroundingDocuments);
  const [activeTab, setActiveTab] = useState<'context' | 'training' | 'dictation' | 'prompt' | 'yapay-zeka'>('context');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [defaultAutoCorrect, setDefaultAutoCorrect] = useState(initialDefaultAutoCorrect);
  const [defaultPersistentDictation, setDefaultPersistentDictation] = useState(initialDefaultPersistentDictation);
  const [dictationTimeout, setDictationTimeout] = useState(initialDictationTimeout);
  
  const [enhancementLevel, setEnhancementLevel] = useState(initialEnhancementLevel);
  const [forceRoleContext, setForceRoleContext] = useState(initialForceRoleContext);
  const [aiModelPreference, setAiModelPreference] = useState(initialAiModelPreference);


  useEffect(() => {
    if (isOpen) {
      setContext(initialContext);
      setDocuments(initialGroundingDocuments);
      setDefaultAutoCorrect(initialDefaultAutoCorrect);
      setDefaultPersistentDictation(initialDefaultPersistentDictation);
      setDictationTimeout(initialDictationTimeout);
      setEnhancementLevel(initialEnhancementLevel);
      setForceRoleContext(initialForceRoleContext);
      setAiModelPreference(initialAiModelPreference);
    }
  }, [isOpen, initialContext, initialGroundingDocuments, initialDefaultAutoCorrect, initialDefaultPersistentDictation, initialDictationTimeout, initialEnhancementLevel, initialForceRoleContext, initialAiModelPreference]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
        context, 
        documents,
        defaultAutoCorrect,
        defaultPersistentDictation,
        dictationTimeout,
        enhancementLevel,
        forceRoleContext,
        aiModelPreference
    });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (typeof window.pdfjsLib !== 'undefined') {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
    }

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();

      if (file.type === 'application/pdf' && typeof window.pdfjsLib !== 'undefined') {
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            try {
              const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              const textContents = await Promise.all(
                Array.from({ length: pdf.numPages }, (_, i) => i + 1).map(async (pageNum) => {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    return textContent.items.map((item: any) => item.str).join(' ');
                })
              );
              const fullText = textContents.join('\n');
              setDocuments(prev => [...prev, { name: file.name, content: fullText.trim() }]);
            } catch (error) {
              console.error(`Error parsing PDF file ${file.name}:`, error);
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else { 
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            setDocuments(prev => [...prev, { name: file.name, content }]);
          }
        };
        reader.readAsText(file);
      }
    });

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl flex flex-col w-full max-w-2xl m-4 transform transition-all max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-300">Ayarlar</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="border-b border-slate-700 px-4">
            <div className="flex -mb-px">
                <TabButton active={activeTab === 'context'} onClick={() => setActiveTab('context')}>Kişisel Tanıtım</TabButton>
                <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')}>Yapay Zeka Eğitimi</TabButton>
                <TabButton active={activeTab === 'dictation'} onClick={() => setActiveTab('dictation')}>Dikte</TabButton>
                <TabButton active={activeTab === 'prompt'} onClick={() => setActiveTab('prompt')}>Prompt Geliştirme</TabButton>
                <TabButton active={activeTab === 'yapay-zeka'} onClick={() => setActiveTab('yapay-zeka')}>Yapay Zeka</TabButton>
            </div>
        </div>
        
        <div className="p-6 text-slate-300 space-y-4 overflow-y-auto">
            {activeTab === 'context' && (
                <div>
                    <p className="text-sm text-slate-400 mb-2">
                        Kendinizi tanıtın ve size özel yazım kurallarını belirtin. Yapay zeka, bu bilgileri dikkate alarak size daha isabetli geri bildirimler sunacaktır.
                    </p>
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full h-40 p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 text-base font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                        placeholder="Örneğin: Benim adım Can, 24 yaşındayım. Genellikle 'y' harfi yerine 'w' kullanırım. Lütfen bunu bir hata olarak değerlendirme."
                    />
                </div>
            )}

            {activeTab === 'training' && (
                <div>
                     <p className="text-sm text-slate-400 mb-3">
                        Modelin analiz yaparken referans alması için dökümanlar (.txt, .csv, .pdf) yükleyin. Model, bu dökümanlardaki kuralları standart TDK kurallarından daha öncelikli tutacaktır.
                    </p>
                    
                    <input
                        type="file"
                        accept=".txt,.csv,.pdf"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Döküman Yükle
                    </button>

                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm">
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-4 h-4 text-slate-400" />
                                    <span className="font-mono text-slate-300 flex-grow">{doc.name}</span>
                                </div>
                                <button onClick={() => handleDeleteDocument(index)} className="text-slate-500 hover:text-red-400 ml-4">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                         {documents.length === 0 && <p className="text-center text-sm text-slate-500 py-4">Henüz eğitim dökümanı yüklenmedi.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'dictation' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Varsayılan Dikte Ayarları</h3>
                    <div className="space-y-4">
                        <label htmlFor="default-auto-correct-toggle" className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-slate-300">"Otomatik Düzelt" varsayılan olarak aktif olsun</span>
                            <div className="relative">
                                <input type="checkbox" id="default-auto-correct-toggle" className="sr-only peer" checked={defaultAutoCorrect} onChange={(e) => setDefaultAutoCorrect(e.target.checked)} />
                                <div className="block w-9 h-5 rounded-full bg-slate-600 peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                        <label htmlFor="default-persistent-dictation-toggle" className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-slate-300">"Sürekli Dikte" varsayılan olarak aktif olsun</span>
                            <div className="relative">
                                <input type="checkbox" id="default-persistent-dictation-toggle" className="sr-only peer" checked={defaultPersistentDictation} onChange={(e) => setDefaultPersistentDictation(e.target.checked)} />
                                <div className="block w-9 h-5 rounded-full bg-slate-600 peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mt-6 mb-4">Zaman Aşımı Ayarı</h3>
                    <div className="space-y-2">
                        <label htmlFor="dictation-timeout-input" className="block text-sm text-slate-300">Sessizlik Zaman Aşımı (Saniye)</label>
                        <input
                            type="number"
                            id="dictation-timeout-input"
                            value={dictationTimeout}
                            onChange={(e) => setDictationTimeout(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            min="0"
                            className="w-full p-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400">"Sürekli Dikte" kapalıyken, bu kadar saniye sessizlikten sonra mikrofonun kapanmasını sağlar. 0 değeri tarayıcı varsayılanını kullanır.</p>
                    </div>
                </div>
            )}
            {activeTab === 'prompt' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Geliştirme Yoğunluğu</h3>
                    <div className="space-y-2">
                        <label htmlFor="enhancement-level-slider" className="flex justify-between text-sm text-slate-300">
                            <span>Yoğunluk Seviyesi</span>
                            <span className="font-semibold">{enhancementLevel === 0 ? 'Otomatik' : (enhancementLevel > 0 ? `+${enhancementLevel}`: enhancementLevel)}</span>
                        </label>
                        <input
                            type="range"
                            id="enhancement-level-slider"
                            value={enhancementLevel}
                            onChange={(e) => setEnhancementLevel(parseInt(e.target.value, 10))}
                            min="-20"
                            max="30"
                            step="1"
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-xs text-slate-400">
                            Prompt'un yoğunluğunu ayarlar. Negatif değerler daha kısa ve net, pozitif değerler daha detaylı çıktılar üretir. 0 değeri otomatiktir.
                        </p>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-200 mt-6 mb-4">Geliştirme Kuralları</h3>
                    <div className="space-y-4">
                         <label htmlFor="force-role-context-toggle" className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-slate-300">Her zaman "Rol ve Bağlam" ekle</span>
                            <div className="relative">
                                <input type="checkbox" id="force-role-context-toggle" className="sr-only peer" checked={forceRoleContext} onChange={(e) => setForceRoleContext(e.target.checked)} />
                                <div className="block w-9 h-5 rounded-full bg-slate-600 peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                        <p className="text-xs text-slate-400">
                            Bu seçenek aktifken, geliştirilen prompt'a her zaman bir rol ve bağlam yapısı eklenir.
                        </p>
                    </div>
                </div>
            )}
            {activeTab === 'yapay-zeka' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Yapay Zeka Motoru Seçimi</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Uygulamanın genelinde kullanılacak yapay zeka modelini seçin. Hız ve kalite arasında bir denge kurun.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => setAiModelPreference('flash')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${aiModelPreference === 'flash' ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-700/50 border-slate-700 hover:border-slate-600'}`}
                        >
                            <h4 className="font-bold text-base text-white">Flash Modeli</h4>
                            <p className="text-xs text-slate-300 mt-1">En hızlı yanıtlar için optimize edilmiştir. Çeviri, düzeltme gibi çoğu görev için idealdir.</p>
                        </button>
                        <button 
                             onClick={() => setAiModelPreference('pro')}
                             className={`flex-1 p-4 rounded-lg border-2 transition-all ${aiModelPreference === 'pro' ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-700/50 border-slate-700 hover:border-slate-600'}`}
                        >
                            <h4 className="font-bold text-base text-white">Düşünme Motoru</h4>
                            <p className="text-xs text-slate-300 mt-1">En yüksek kalite ve en kapsamlı analizler için. Yanıt süreleri daha uzun olabilir.</p>
                        </button>
                    </div>
                </div>
            )}
        </div>
        <div className="flex justify-end gap-4 p-4 mt-auto border-t border-slate-700">
             <button 
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-300 bg-slate-600 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors"
            >
                İptal
            </button>
            <button 
                onClick={handleSave}
                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
                Kaydet ve Kapat
            </button>
        </div>
      </div>
    </div>
  );
};