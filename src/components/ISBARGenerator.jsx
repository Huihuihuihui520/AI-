import React, { useState } from 'react';
import { Copy, CheckCircle2, FileText } from 'lucide-react';

/**
 * ISBAR 自动化交接班报告生成器
 * I - Identity (身份)
 * S - Situation (情境)
 * B - Background (背景)
 * A - Assessment (评估)
 * R - Recommendation (建议)
 */
export default function ISBARGenerator({ patientInfo, crisisData, aiResult, onClose }) {
  const [copied, setCopied] = useState(false);

  const report = generateISBAR(patientInfo, crisisData, aiResult);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = report;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-black">ISBAR 交接班报告</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              关闭
            </button>
          </div>
          <p className="text-xs text-white/70 mt-1">术中事件结构化交接报告</p>
        </div>

        {/* Report Body */}
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-xl border border-slate-100">
            {report}
          </pre>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>已复制到剪贴板</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>一键复制报告</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 生成 ISBAR 格式文本
 */
function generateISBAR(patientInfo, crisisData, aiResult) {
  const now = new Date().toLocaleString('zh-CN');
  const { age, gender, weight, surgery } = patientInfo || {};
  const { checkedAlerts, vitals, freeText } = crisisData || {};

  let report = `════════════════════════════════\n`;
  report += `       ISBAR 术中交接班报告\n`;
  report += `       ${now}\n`;
  report += `════════════════════════════════\n\n`;

  // I - Identity
  report += `【I - Identity 身份识别】\n`;
  report += `患者：${gender || '--'}性，${age || '--'}岁`;
  if (weight) report += `，体重${weight}kg`;
  report += `\n`;
  if (surgery) report += `当前手术：${surgery}\n`;
  report += `\n`;

  // S - Situation
  report += `【S - Situation 当前情境】\n`;
  if (checkedAlerts && checkedAlerts.length > 0) {
    report += `触发警报：${checkedAlerts.join('、')}\n`;
  }
  if (vitals) {
    const vitalLabels = { hr: 'HR', sbp: 'SBP', dbp: 'DBP', spo2: 'SpO₂', airwayPressure: '气道压', etco2: 'ETCO₂', temp: '体温' };
    const vitalEntries = Object.entries(vitals).filter(([, v]) => v !== '' && v != null);
    if (vitalEntries.length > 0) {
      report += `当前生命体征：${vitalEntries.map(([k, v]) => `${vitalLabels[k] || k} ${v}`).join(' | ')}\n`;
    }
  }
  if (freeText) report += `补充描述：${freeText}\n`;
  report += `\n`;

  // B - Background
  report += `【B - Background 背景信息】\n`;
  if (patientInfo?.comorbidities && patientInfo.comorbidities.length > 0) {
    report += `合并症：${patientInfo.comorbidities.join('、')}\n`;
  } else {
    report += `合并症：未记录\n`;
  }
  report += `\n`;

  // A - Assessment
  report += `【A - Assessment 评估分析】\n`;
  if (aiResult) {
    // 提取鉴别诊断部分
    const diagMatch = aiResult.match(/(?:鉴别诊断|Assessment|排查)([\s\S]*?)(?=##|###|$)/i);
    if (diagMatch) {
      report += diagMatch[1].trim().substring(0, 500) + '\n';
    } else {
      report += `AI分析已完成，详见终端记录。\n`;
    }
  } else {
    report += `待评估\n`;
  }
  report += `\n`;

  // R - Recommendation
  report += `【R - Recommendation 建议措施】\n`;
  if (aiResult) {
    const actionMatch = aiResult.match(/(?:即时处理|处理建议|Recommendation)([\s\S]*?)(?=##|###|💊|🔍|$)/i);
    if (actionMatch) {
      report += actionMatch[1].trim().substring(0, 500) + '\n';
    } else {
      report += `详见AI输出的处理建议。\n`;
    }
  } else {
    report += `待确定\n`;
  }

  report += `\n════════════════════════════════\n`;
  report += `报告生成时间：${now}\n`;
  report += `════════════════════════════════\n`;

  return report;
}
