import React, { useEffect, useRef, useState } from 'react';

interface CanvasEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}

// Declarations for CDN libraries
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
        htmlDocx: any;
        saveAs: any;
    }
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode, title: string, active?: boolean }> = ({ onClick, children, title, active = false }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className={`p-2 rounded-md transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        title={title}
    >
        {children}
    </button>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
    </svg>
);

const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);


export const CanvasEditorModal: React.FC<CanvasEditorModalProps> = ({ isOpen, onClose, initialText }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [bgColor, setBgColor] = useState('#1e293b'); // slate-800
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && editorRef.current) {
            // Replace newlines with <br> tags for proper line breaks in HTML
            editorRef.current.innerHTML = initialText.replace(/\n/g, '<br>');
        }
    }, [isOpen, initialText]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const applyStyle = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };
    
    const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBgColor(e.target.value);
    };

    const handleExport = async (format: 'png' | 'pdf' | 'docx') => {
        if (!editorRef.current) return;
        const element = editorRef.current;
        
        // Temporarily remove focus ring for cleaner capture
        const hadFocusRing = element.classList.contains('focus:ring-2');
        if (hadFocusRing) {
            element.classList.remove('focus:ring-2', 'focus:ring-blue-500');
        }
    
        try {
            if (format === 'png') {
                const canvas = await window.html2canvas(element, { useCORS: true, backgroundColor: bgColor });
                const link = document.createElement('a');
                link.download = 'yazim-doktoru-canvas.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const canvas = await window.html2canvas(element, { useCORS: true, backgroundColor: bgColor });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'l' : 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save('yazim-doktoru-canvas.pdf');
            } else if (format === 'docx') {
                const styles = window.getComputedStyle(element);
                const content = `
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body>
                        <div style="font-family:${styles.fontFamily};font-size:${styles.fontSize};color:${styles.color};background-color:${styles.backgroundColor};padding:${styles.padding};line-height:${styles.lineHeight};white-space:${styles.whiteSpace};">
                            ${element.innerHTML}
                        </div>
                    </body>
                    </html>`;
                const fileContent = window.htmlDocx.asBlob(content);
                window.saveAs(fileContent, 'yazim-doktoru-canvas.docx');
            }
        } catch (error) {
            console.error('Dışa aktarma sırasında hata oluştu:', error);
        } finally {
            if (hadFocusRing) {
                element.classList.add('focus:ring-2', 'focus:ring-blue-500');
            }
            setIsExportMenuOpen(false);
        }
    };


    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-slate-900 rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-blue-300">Kanvas Editörü</h2>
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="Kapat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
                <ToolbarButton onClick={() => applyStyle('bold')} title="Kalın"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg></ToolbarButton>
                <ToolbarButton onClick={() => applyStyle('italic')} title="İtalik"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg></ToolbarButton>
                <ToolbarButton onClick={() => applyStyle('underline')} title="Altı Çizili"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg></ToolbarButton>
                <div className="w-px h-6 bg-slate-600"></div>
                <ToolbarButton onClick={() => applyStyle('justifyLeft')} title="Sola Hizala"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg></ToolbarButton>
                <ToolbarButton onClick={() => applyStyle('justifyCenter')} title="Ortala"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg></ToolbarButton>
                <ToolbarButton onClick={() => applyStyle('justifyRight')} title="Sağa Hizala"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg></ToolbarButton>
                <div className="w-px h-6 bg-slate-600"></div>
                <label title="Metin Rengi" className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer"><input type="color" className="w-5 h-5 bg-transparent border-none cursor-pointer" onChange={e => applyStyle('foreColor', e.target.value)} defaultValue="#ffffff" /></label>
                <label title="Arkaplan Rengi" className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer"><input type="color" className="w-5 h-5 bg-transparent border-none cursor-pointer" onChange={handleBgColorChange} defaultValue="#1e293b" /></label>
                
                <div className="flex-grow"></div>

                <div className="relative" ref={exportButtonRef}>
                    <ToolbarButton onClick={() => setIsExportMenuOpen(prev => !prev)} title="Dışa Aktar">
                        <DownloadIcon />
                    </ToolbarButton>
                    {isExportMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-700 rounded-md shadow-lg z-10 border border-slate-600">
                            <ul className="p-1">
                                <li>
                                    <button onClick={() => handleExport('png')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-md transition-colors">
                                        <ImageIcon />
                                        <span>Fotoğraf (.png)</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-md transition-colors">
                                        <FileTextIcon />
                                        <span>PDF Belgesi (.pdf)</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => handleExport('docx')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-md transition-colors">
                                        <FileTextIcon />
                                        <span>Word Belgesi (.docx)</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Editor Area */}
            <div className="p-4 flex-grow overflow-y-auto">
                <div
                    ref={editorRef}
                    contentEditable={true}
                    spellCheck={false}
                    style={{ backgroundColor: bgColor }}
                    className="w-full h-full p-6 bg-slate-800 text-slate-200 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
            </div>
          </div>
        </div>
    );
};