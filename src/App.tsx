import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Upload, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Layout, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateFashionFunnel, generateFashionImage, type FunnelSuggestion } from './services/aiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [goal, setGoal] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [styleReference, setStyleReference] = useState<string | null>(null);
  
  const [cardStyle, setCardStyle] = useState('');
  const [cardColor, setCardColor] = useState('');
  const [cardBackground, setCardBackground] = useState('');
  const [textPosition, setTextPosition] = useState<'top' | 'bottom' | 'center'>('bottom');

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<FunnelSuggestion | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const onDropImages = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.slice(0, 4 - uploadedImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  }, [uploadedImages]);

  const onDropStyleRef = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStyleReference(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages, isDragActive: isDragActiveImages } = useDropzone({
    onDrop: onDropImages,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 4
  });

  const { getRootProps: getRootPropsStyle, getInputProps: getInputPropsStyle, isDragActive: isDragActiveStyle } = useDropzone({
    onDrop: onDropStyleRef,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleGenerate = async () => {
    if (!goal || !brandInfo) return;
    setIsGenerating(true);
    try {
      // In a real app, we'd use Gemini to describe the images first. 
      // For this demo, we'll pass the base64 or placeholders.
      const result = await generateFashionFunnel(
        goal, 
        brandInfo, 
        uploadedImages.map((_, i) => `Фото товара ${i + 1}`),
        {
          style: cardStyle,
          color: cardColor,
          background: cardBackground,
          textPosition
        },
        styleReference ? "Референс стиля загружен" : undefined
      );
      setSuggestion(result);
      setActiveStep(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#1a1a1a] selection:bg-[#f27d26]/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold tracking-tight text-lg uppercase">Brand Tok-Show</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Технология</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Кейсы</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Тарифы</a>
        </div>
        <button className="bg-black text-white px-5 py-2 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-black/80 transition-colors">
          Начать
        </button>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-24 text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] mb-8 tracking-tighter">
              Создавайте <br />
              <span className="italic text-[#f27d26]">идеальный</span> <br />
              контент.
            </h1>
            <p className="text-lg text-black/60 max-w-md mb-10 leading-relaxed">
              Интеллектуальная платформа для брендов одежды. Превращайте обычные фото в продающие воронки и стильную инфографику за секунды.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={() => document.getElementById('creator')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Создать воронку <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-black/10 px-8 py-4 rounded-full font-medium hover:bg-black/5 transition-colors">
                Посмотреть примеры
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1000" 
              alt="High Fashion"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="text-xs uppercase tracking-[0.2em] mb-2 opacity-80">Новая коллекция</div>
              <div className="font-serif text-3xl italic">Эстетика минимализма</div>
            </div>
          </motion.div>
        </section>

        {/* Creator Section */}
        <section id="creator" className="mb-32">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Input Panel */}
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40 block">Цель контента</label>
                <textarea 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Например: Прогрев к новой коллекции льняных платьев"
                  className="w-full bg-white border border-black/10 rounded-2xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40 block">О бренде</label>
                <textarea 
                  value={brandInfo}
                  onChange={(e) => setBrandInfo(e.target.value)}
                  placeholder="Стиль, ценности, аудитория..."
                  className="w-full bg-white border border-black/10 rounded-2xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                />
              </div>

              {/* Style Preferences */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-black/5 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Настройки стиля</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Стиль</label>
                    <input 
                      type="text" 
                      value={cardStyle}
                      onChange={(e) => setCardStyle(e.target.value)}
                      placeholder="Минимализм"
                      className="w-full bg-white border border-black/5 rounded-xl p-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Цвет</label>
                    <input 
                      type="text" 
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      placeholder="Бежевый"
                      className="w-full bg-white border border-black/5 rounded-xl p-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Подложка / Фон</label>
                  <input 
                    type="text" 
                    value={cardBackground}
                    onChange={(e) => setCardBackground(e.target.value)}
                    placeholder="Матовое стекло"
                    className="w-full bg-white border border-black/5 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Расположение текста</label>
                  <div className="flex gap-2">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setTextPosition(pos)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          textPosition === pos ? "bg-black text-white" : "bg-white border border-black/5 text-black/40"
                        )}
                      >
                        {pos === 'top' ? 'Сверху' : pos === 'center' ? 'Центр' : 'Снизу'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Пример стиля (Референс)</label>
                  <div 
                    {...getRootPropsStyle()} 
                    className={cn(
                      "border border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center gap-3",
                      isDragActiveStyle ? "border-black bg-black/5" : "border-black/10 hover:border-black/20"
                    )}
                  >
                    <input {...getInputPropsStyle()} />
                    {styleReference ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={styleReference} alt="Style Ref" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-black/20" />
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-black/40">
                      {styleReference ? "Стиль загружен" : "Загрузить референс"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40 block">Фото товаров (до 4 шт.)</label>
                <div 
                  {...getRootPropsImages()} 
                  className={cn(
                    "border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center",
                    isDragActiveImages ? "border-black bg-black/5" : "border-black/10 hover:border-black/20",
                    uploadedImages.length > 0 ? "p-4" : "p-10"
                  )}
                >
                  <input {...getInputPropsImages()} />
                  {uploadedImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={img} alt={`Uploaded ${i}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImages(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < 4 && (
                        <div className="aspect-square rounded-xl border border-dashed border-black/10 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-black/20" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-black/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Загрузите фото</p>
                        <p className="text-xs text-black/40 mt-1">до 4 изображений</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !goal || !brandInfo}
                className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-black/90 transition-colors shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Анализируем...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Сгенерировать идеи
                  </>
                )}
              </button>
            </div>

            {/* Result Panel */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!suggestion && !isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[600px] border border-black/5 rounded-[2.5rem] bg-stone-50 flex flex-col items-center justify-center text-center p-12"
                  >
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                      <Layout className="w-8 h-8 text-black/10" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Ваша воронка появится здесь</h3>
                    <p className="text-black/40 max-w-xs text-sm">Заполните данные слева, чтобы наш AI разработал стратегию контента для вашего бренда.</p>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[600px] border border-black/5 rounded-[2.5rem] bg-white flex flex-col items-center justify-center p-12"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-black/5 rounded-full" />
                      <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-black animate-pulse" />
                    </div>
                    <h3 className="font-serif text-2xl mb-2">Создаем магию...</h3>
                    <p className="text-black/40 text-sm">Подбираем триггеры и визуальные решения</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    {/* Headlines & Triggers */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white border border-black/5 p-8 rounded-3xl shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f27d26] mb-6">Триггерные заголовки</h4>
                        <ul className="space-y-4">
                          {suggestion?.headlines.map((h, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium leading-snug">
                              <span className="text-black/20 font-serif italic">{i + 1}.</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border border-black/5 p-8 rounded-3xl shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f27d26] mb-6">Клиффхэнгеры & CTA</h4>
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Клиффхэнгеры</p>
                            {suggestion?.cliffhangers.map((c, i) => (
                              <p key={i} className="text-sm italic text-black/60 mb-2">«{c}»</p>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Вопрос в конце (CTA)</p>
                            <p className="text-sm font-semibold">{suggestion?.cta}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Funnel Preview */}
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <h4 className="font-serif text-3xl">Контентная воронка</h4>
                        <div className="flex gap-2">
                          {suggestion?.funnelSteps.map((_, i) => (
                            <button 
                              key={i}
                              onClick={() => setActiveStep(i)}
                              className={cn(
                                "w-8 h-1 rounded-full transition-all",
                                activeStep === i ? "bg-black" : "bg-black/10"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Visual Mockup */}
                        <div className="relative aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden shadow-xl group">
                          {uploadedImages.length > 0 ? (
                            <img 
                              src={uploadedImages[activeStep % uploadedImages.length]} 
                              alt="Step Preview" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-200">
                              <ImageIcon className="w-12 h-12 text-black/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          
                          {/* Infographic Overlay Mockup */}
                          <motion.div 
                            key={activeStep}
                            initial={{ opacity: 0, y: textPosition === 'top' ? -20 : textPosition === 'bottom' ? 20 : 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "absolute inset-0 p-8 flex flex-col text-center text-white",
                              textPosition === 'top' ? "justify-start" : textPosition === 'center' ? "justify-center" : "justify-end"
                            )}
                          >
                            <div className={cn(
                              "backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full",
                              cardBackground.toLowerCase().includes('стекло') ? "bg-white/10" : "bg-black/40"
                            )}>
                              <p className="text-[10px] uppercase tracking-[0.3em] mb-4 font-bold opacity-80">
                                {suggestion?.funnelSteps[activeStep].title}
                              </p>
                              <h5 className="font-serif text-2xl leading-tight mb-4">
                                {suggestion?.funnelSteps[activeStep].overlayText}
                              </h5>
                              <div className="w-12 h-[1px] bg-white/40 mx-auto" />
                            </div>
                          </motion.div>
                        </div>

                        {/* Step Details */}
                        <div className="space-y-8 py-4">
                          <AnimatePresence mode="wait">
                            <motion.div 
                              key={activeStep}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-6"
                            >
                              <div className="flex items-center gap-4">
                                <span className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-serif italic text-lg">
                                  {activeStep + 1}
                                </span>
                                <h5 className="text-xl font-medium">{suggestion?.funnelSteps[activeStep].title}</h5>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Что на фото</p>
                                  <p className="text-sm text-black/70 leading-relaxed">{suggestion?.funnelSteps[activeStep].description}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Текст инфографики</p>
                                  <p className="text-sm font-medium bg-stone-100 p-4 rounded-xl border border-black/5">
                                    {suggestion?.funnelSteps[activeStep].overlayText}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4">
                                <button 
                                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                                  disabled={activeStep === 0}
                                  className="flex-1 border border-black/10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                                >
                                  Назад
                                </button>
                                <button 
                                  onClick={() => setActiveStep(prev => Math.min((suggestion?.funnelSteps.length || 1) - 1, prev + 1))}
                                  disabled={activeStep === (suggestion?.funnelSteps.length || 1) - 1}
                                  className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                                >
                                  Далее
                                </button>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <TypeIcon className="w-6 h-6" />,
              title: "Триггерные заголовки",
              desc: "AI анализирует психологию вашей аудитории и предлагает заголовки, на которые невозможно не кликнуть."
            },
            {
              icon: <Layout className="w-6 h-6" />,
              title: "Контентные воронки",
              desc: "Создавайте серию постов, которые ведут клиента от первого взгляда до покупки по проверенным формулам."
            },
            {
              icon: <ImageIcon className="w-6 h-6" />,
              title: "Инфографика",
              desc: "Автоматическая генерация текста для наложения на фото. Стильно, лаконично и по делу."
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-white border border-black/5 rounded-[2rem] hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-8">
                {feature.icon}
              </div>
              <h4 className="font-serif text-2xl mb-4">{feature.title}</h4>
              <p className="text-black/50 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-semibold tracking-tight text-sm uppercase">Brand Tok-Show</span>
            </div>
            <p className="text-xs text-black/40 uppercase tracking-widest">
              © 2024 Все права защищены
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/30 mb-2">Создано</p>
            <p className="font-serif text-2xl italic">Евгенией Даныевой</p>
          </div>

          <div className="flex gap-8 text-xs font-medium uppercase tracking-widest opacity-60">
            <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Telegram</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Behance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
