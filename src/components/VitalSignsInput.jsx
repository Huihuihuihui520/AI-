import React, { useState } from 'react';
import { Activity } from 'lucide-react';

const VITAL_FIELDS = [
  { key: 'hr', label: 'HR', unit: '次/分', placeholder: '72', type: 'number', warnLow: 50, warnHigh: 120 },
  { key: 'sbp', label: 'SBP', unit: 'mmHg', placeholder: '120', type: 'number', warnLow: 80, warnHigh: 180 },
  { key: 'dbp', label: 'DBP', unit: 'mmHg', placeholder: '80', type: 'number', warnLow: 40, warnHigh: 110 },
  { key: 'spo2', label: 'SpO₂', unit: '%', placeholder: '98', type: 'number', warnLow: 90, warnHigh: 101 },
  { key: 'airwayPressure', label: '气道压', unit: 'cmH₂O', placeholder: '18', type: 'number', warnLow: 0, warnHigh: 35 },
  { key: 'etco2', label: 'ETCO₂', unit: 'mmHg', placeholder: '35', type: 'number', warnLow: 20, warnHigh: 50 },
  { key: 'temp', label: '体温', unit: '°C', placeholder: '36.5', type: 'number', warnLow: 35, warnHigh: 38.5 },
];

const QUICK_ALERTS = [
  { id: 'hr_drop', label: 'HR骤降', color: 'rose' },
  { id: 'bp_gone', label: 'BP消失', color: 'rose' },
  { id: 'spo2_drop', label: 'SpO₂下降', color: 'amber' },
  { id: 'airway_high', label: '气道压升高', color: 'amber' },
  { id: 'arrhythmia', label: '心律失常', color: 'rose' },
  { id: 'allergy', label: '过敏反应', color: 'purple' },
  { id: 'bronchospasm', label: '支气管痉挛', color: 'amber' },
  { id: 'mh_suspect', label: '疑似恶性高热', color: 'rose' },
  { id: 'bleeding', label: '大量出血', color: 'rose' },
  { id: 'etco2_drop', label: 'ETCO₂骤降', color: 'amber' },
];

export default function VitalSignsInput({ vitals, setVitals, checkedAlerts, setCheckedAlerts }) {
  const handleVitalChange = (key, value) => {
    setVitals(prev => ({ ...prev, [key]: value }));
  };

  const toggleAlert = (alertId) => {
    setCheckedAlerts(prev =>
      prev.includes(alertId) ? prev.filter(a => a !== alertId) : [...prev, alertId]
    );
  };

  const getInputBorderClass = (field, value) => {
    if (!value || value === '') return 'border-slate-200';
    const num = parseFloat(value);
    if (isNaN(num)) return 'border-slate-200';
    if (num < field.warnLow || num > field.warnHigh) return 'border-red-400 bg-red-50 ring-1 ring-red-300';
    return 'border-emerald-300 bg-emerald-50';
  };

  return (
    <div className="space-y-4">
      {/* 生命体征数值输入 */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 mb-1 flex items-center">
          <Activity className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
          核心生命体征
        </h3>
        <p className="text-[10px] text-slate-400 mb-2">未填写的指标默认视为正常范围</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {VITAL_FIELDS.map(field => (
            <div key={field.key} className="relative">
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">{field.label}</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={vitals[field.key] || ''}
                  onChange={e => handleVitalChange(field.key, e.target.value)}
                  placeholder={`正常`}
                  className={`w-full rounded-lg px-2 py-1.5 text-sm font-mono outline-none transition-all border ${getInputBorderClass(field, vitals[field.key])}`}
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-300 pointer-events-none">
                  {field.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷警报勾选 */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 mb-2">⚡ 快捷危机事件</h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ALERTS.map(alert => {
            const checked = checkedAlerts.includes(alert.id);
            const colorMap = {
              rose: checked ? 'bg-rose-500 text-white border-rose-500 shadow-rose-200 shadow-md' : 'bg-white text-rose-600 border-rose-200',
              amber: checked ? 'bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md' : 'bg-white text-amber-600 border-amber-200',
              purple: checked ? 'bg-purple-500 text-white border-purple-500 shadow-purple-200 shadow-md' : 'bg-white text-purple-600 border-purple-200',
            };
            return (
              <button
                key={alert.id}
                onClick={() => toggleAlert(alert.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${colorMap[alert.color]}`}
              >
                {alert.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { QUICK_ALERTS };
