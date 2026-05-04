import React, { useState, useRef } from 'react';
import { Send, FileText, Zap, Wifi, WifiOff, User } from 'lucide-react';
import VitalSignsInput, { QUICK_ALERTS } from '../components/VitalSignsInput';
import CrisisResultPanel from '../components/CrisisResultPanel';
import ISBARGenerator from '../components/ISBARGenerator';
import { checkDoseSafety } from '../components/SafetyGuard';
import ModelBridge from '../services/ModelBridge';
import { buildCrisisSystemPrompt, buildCrisisUserPrompt } from '../services/CrisisPrompt';

export default function CrisisAssistant({ settings, patientInfo }) {
  const [vitals, setVitals] = useState({
    hr: '', sbp: '', dbp: '', spo2: '', airwayPressure: '', etco2: '', temp: ''
  });
  const [checkedAlerts, setCheckedAlerts] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [showISBAR, setShowISBAR] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // 本页面独立的体重/身高（覆盖术前评估传入值）
  const [localWeight, setLocalWeight] = useState(patientInfo?.weight || '');
  const [localHeight, setLocalHeight] = useState(patientInfo?.height || '');
  const bridgeRef = useRef(new ModelBridge());

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 同步术前评估传入的体重
  React.useEffect(() => {
    if (patientInfo?.weight && !localWeight) setLocalWeight(patientInfo.weight);
    if (patientInfo?.height && !localHeight) setLocalHeight(patientInfo.height);
  }, [patientInfo?.weight, patientInfo?.height]);

  const effectiveWeight = localWeight ? parseFloat(localWeight) : null;

  const handleAnalyze = async () => {
    const hasVitals = Object.values(vitals).some(v => v !== '');
    const hasAlerts = checkedAlerts.length > 0;
    const hasText = freeText.trim() !== '';
    if (!hasVitals && !hasAlerts && !hasText) {
      setErrorMsg('请至少输入一项生命体征、勾选一个危机事件或描述情况。');
      return;
    }

    if (!settings.apiKey && isOnline) {
      setErrorMsg('请先在设置中配置 API Key。');
      return;
    }

    if (!effectiveWeight) {
      setErrorMsg('请输入患者体重，以便精确计算药物剂量。');
      return;
    }

    setErrorMsg('');
    setResultText('');
    setSafetyWarnings([]);
    setLoading(true);

    try {
      const alertLabels = checkedAlerts.map(id => {
        const a = QUICK_ALERTS.find(q => q.id === id);
        return a ? a.label : id;
      });

      const systemPrompt = buildCrisisSystemPrompt({
        weight: effectiveWeight,
        height: localHeight || undefined,
        age: patientInfo?.age,
        gender: patientInfo?.gender,
        surgery: patientInfo?.surgery?.name,
        comorbidities: patientInfo?.comorbidities
      });

      const userMessage = buildCrisisUserPrompt({
        vitals,
        checkedAlerts: alertLabels,
        freeText
      });

      let fullText = '';
      await bridgeRef.current.sendMessage(systemPrompt, userMessage, (chunk) => {
        fullText += chunk;
        setResultText(fullText);
      });

      // 安全拦截检查
      const safetyResult = checkDoseSafety(fullText, effectiveWeight);
      if (!safetyResult.safe) {
        setSafetyWarnings(safetyResult.warnings);
      }

    } catch (err) {
      setErrorMsg(err.message || '请求异常，请检查网络和 API 配置。');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setVitals({ hr: '', sbp: '', dbp: '', spo2: '', airwayPressure: '', etco2: '', temp: '' });
    setCheckedAlerts([]);
    setFreeText('');
    setResultText('');
    setSafetyWarnings([]);
    setErrorMsg('');
  };

  return (
    <div className="space-y-3 pb-20">
      {/* 状态指示器 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {ModelBridge.getModelDisplayName()}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-slate-400">
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-red-400" />}
          <span>{isOnline ? '在线' : '离线模式'}</span>
        </div>
      </div>

      {/* 错误提示 */}
      {errorMsg && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {/* 患者体格参数 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center">
          <User className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          患者体格（用于药量计算）
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-0.5">体重 *</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={localWeight}
                onChange={e => setLocalWeight(e.target.value)}
                placeholder="70"
                className={`w-full rounded-lg px-2 py-2 text-sm font-mono outline-none transition-all border ${
                  localWeight ? 'border-emerald-300 bg-emerald-50' : 'border-orange-300 bg-orange-50'
                }`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-0.5">身高</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={localHeight}
                onChange={e => setLocalHeight(e.target.value)}
                placeholder="170"
                className="w-full rounded-lg px-2 py-2 text-sm font-mono outline-none transition-all border border-slate-200"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">cm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 生命体征输入区 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <VitalSignsInput
          vitals={vitals}
          setVitals={setVitals}
          checkedAlerts={checkedAlerts}
          setCheckedAlerts={setCheckedAlerts}
        />
      </section>

      {/* 自由文本输入 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center">
          <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          情况描述
        </h3>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[70px] transition-all resize-none"
          placeholder="描述当前危机情况，如：全麻诱导后插管困难，面罩通气尚可..."
        />
      </section>

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`flex-1 py-4 rounded-xl text-white font-bold text-base shadow-lg flex items-center justify-center space-x-2 transition-all ${
            loading
              ? 'bg-rose-400'
              : 'bg-gradient-to-r from-rose-600 to-red-600 active:from-rose-700 active:to-red-700 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <Zap className="w-5 h-5 animate-pulse" />
              <span>AI 分析中...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>紧急 AI 分析</span>
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-4 rounded-xl bg-slate-100 text-slate-500 font-medium active:bg-slate-200 transition-all text-sm"
        >
          清空
        </button>
      </div>

      {/* 结果展示区 */}
      <CrisisResultPanel
        resultText={resultText}
        safetyWarnings={safetyWarnings}
        loading={loading}
        patientWeight={effectiveWeight}
      />

      {/* ISBAR 按钮 */}
      {resultText && !loading && (
        <button
          onClick={() => setShowISBAR(true)}
          className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>生成术中交接班报告 (ISBAR)</span>
        </button>
      )}

      {/* ISBAR 弹窗 */}
      {showISBAR && (
        <ISBARGenerator
          patientInfo={{ ...patientInfo, weight: localWeight, height: localHeight }}
          crisisData={{ checkedAlerts: checkedAlerts.map(id => QUICK_ALERTS.find(q => q.id === id)?.label || id), vitals, freeText }}
          aiResult={resultText}
          onClose={() => setShowISBAR(false)}
        />
      )}
    </div>
  );
}
