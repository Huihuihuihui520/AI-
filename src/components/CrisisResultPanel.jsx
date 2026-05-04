import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * 卡片式结果展示区 - 手机端优化 v2
 * 药物方案改为逐条卡片显示
 */
export default function CrisisResultPanel({ resultText, safetyWarnings, loading, patientWeight }) {
  if (!resultText && !loading) return null;

  const sections = parseResult(resultText);

  return (
    <div className="space-y-3">
      {/* 安全警告 */}
      {safetyWarnings && safetyWarnings.length > 0 && (
        <div className="bg-red-600 text-white p-3 rounded-xl shadow-lg animate-pulse-slow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-base">🚨</span>
            <h4 className="font-black text-xs uppercase tracking-wide">药量安全警告</h4>
          </div>
          {safetyWarnings.map((w, i) => (
            <div key={i} className="bg-red-700/50 rounded-lg p-2 text-xs leading-relaxed mb-1.5 last:mb-0">
              <span className="font-black">{w.drug}</span>
              ：AI建议 <span className="font-bold text-yellow-300">{w.extractedDose}{w.unit}</span>
              ，极量 <span className="font-bold">{w.maxDose}{w.unit}</span>
              <div className="text-red-200 text-[10px] mt-0.5">{w.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* 加载中 */}
      {loading && !resultText && (
        <div className="flex items-center justify-center py-8 bg-white rounded-xl border border-slate-100">
          <div className="flex space-x-1.5">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ml-3 text-sm text-slate-500 font-medium">AI 正在分析...</span>
        </div>
      )}

      {resultText && (
        <>
          {/* 卡片1：即时处理 */}
          {sections.action && (
            <div className="rounded-xl overflow-hidden shadow-md border-2 border-rose-200">
              <div className="bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <h3 className="text-white text-xs font-black uppercase tracking-wider">🔴 即时处理</h3>
              </div>
              <div className="bg-rose-50 p-4">
                <div className="text-sm text-slate-800 leading-relaxed">
                  <ReactMarkdown components={actionComponents}>{sections.action}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 卡片2：药物方案 - 逐条卡片 */}
          {sections.drug && (
            <div className="rounded-xl overflow-hidden shadow-md border border-blue-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5">
                <h3 className="text-white text-xs font-black uppercase tracking-wider">
                  💊 药物方案
                  {patientWeight && <span className="ml-2 font-normal text-blue-200 normal-case">({patientWeight}kg)</span>}
                </h3>
              </div>
              <div className="bg-white p-3 space-y-2">
                <DrugCards drugText={sections.drug} />
              </div>
            </div>
          )}

          {/* 卡片3：鉴别诊断 */}
          {sections.diag && (
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2.5">
                <h3 className="text-white text-xs font-black uppercase tracking-wider">🔍 鉴别诊断</h3>
              </div>
              <div className="bg-white p-4">
                <div className="text-xs text-slate-700 leading-relaxed">
                  <ReactMarkdown components={defaultComponents}>{sections.diag}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 兜底 */}
          {!sections.action && !sections.drug && !sections.diag && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-sm text-slate-700 leading-relaxed">
                <ReactMarkdown components={defaultComponents}>{resultText}</ReactMarkdown>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * 药物逐条卡片组件 — 解析 Markdown 表格为独立卡片
 */
function DrugCards({ drugText }) {
  const drugs = parseDrugTable(drugText);

  if (drugs.length === 0) {
    // 无法解析为表格时 fallback 为普通 markdown
    return (
      <div className="text-xs text-slate-700 leading-relaxed">
        <ReactMarkdown components={defaultComponents}>{drugText}</ReactMarkdown>
      </div>
    );
  }

  return (
    <>
      {drugs.map((drug, i) => (
        <div key={i} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start justify-between mb-1.5">
            <h4 className="text-sm font-black text-blue-900">{drug.name || `药物${i + 1}`}</h4>
            {drug.route && (
              <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0 ml-2">
                {drug.route}
              </span>
            )}
          </div>
          {drug.dose && (
            <div className="text-base font-black text-blue-700 mb-1">{drug.dose}</div>
          )}
          {drug.note && (
            <div className="text-[11px] text-slate-500 leading-relaxed">{drug.note}</div>
          )}
        </div>
      ))}
    </>
  );
}

/**
 * 解析 Markdown 表格文本为药物数组
 */
function parseDrugTable(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));

  if (lines.length < 3) return []; // 至少需要表头 + 分隔 + 1行数据

  // 提取表头
  const headerCells = lines[0].split('|').map(c => c.trim()).filter(Boolean);

  // 跳过分隔行 (---|---)
  const dataLines = lines.slice(2);
  const drugs = [];

  for (const line of dataLines) {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    // 动态匹配列（容错：表头可能是 药物/药名/药物名 等）
    const drug = {};
    headerCells.forEach((h, idx) => {
      const val = cells[idx] || '';
      if (/药物|药名/.test(h)) drug.name = val.replace(/\*\*/g, '');
      else if (/剂量/.test(h)) drug.dose = val.replace(/\*\*/g, '');
      else if (/途径|给药|方式/.test(h)) drug.route = val;
      else if (/备注|起效|注意/.test(h)) drug.note = val;
    });

    // 如果表头没匹配上，按位置兜底
    if (!drug.name && cells[0]) drug.name = cells[0].replace(/\*\*/g, '');
    if (!drug.dose && cells[1]) drug.dose = cells[1].replace(/\*\*/g, '');
    if (!drug.route && cells[2]) drug.route = cells[2];
    if (!drug.note && cells[3]) drug.note = cells[3];

    if (drug.name) drugs.push(drug);
  }

  return drugs;
}

/**
 * 即时处理区的 Markdown 组件
 */
const actionComponents = {
  strong: ({ children }) => {
    const text = typeof children === 'string' ? children : '';
    const isUrgent = /立即|停止|100%|紧急|不可/.test(text);
    return isUrgent
      ? <strong className="text-red-700 bg-red-100 px-1 rounded font-black">{children}</strong>
      : <strong className="text-slate-900 font-bold">{children}</strong>;
  },
  ol: ({ children }) => <ol className="space-y-2.5 pl-0 list-none">{children}</ol>,
  ul: ({ children }) => <ul className="space-y-2 pl-0 list-none">{children}</ul>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm leading-relaxed bg-white rounded-lg p-2.5 border border-rose-100">
      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
};

/**
 * 通用 Markdown 组件
 */
const defaultComponents = {
  strong: ({ children }) => <strong className="text-slate-900 font-bold">{children}</strong>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ol: ({ children }) => <ol className="space-y-1.5 pl-0 list-none">{children}</ol>,
  ul: ({ children }) => <ul className="space-y-1.5 pl-0 list-none">{children}</ul>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-xs leading-relaxed">
      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left text-[10px] font-bold uppercase">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-2 py-1.5 text-xs">{children}</td>
  ),
};

/**
 * 解析 AI 输出为三个区块
 */
function parseResult(text) {
  if (!text) return { action: '', drug: '', diag: '' };

  const actionRe = /##\s*🔴\s*即时处理[建议]*/;
  const drugRe = /##\s*💊\s*药物[方案建议]*/;
  const diagRe = /##\s*🔍\s*鉴别诊断[与排查]*/;

  const actionIdx = text.search(actionRe);
  const drugIdx = text.search(drugRe);
  const diagIdx = text.search(diagRe);

  const indices = [
    { key: 'action', idx: actionIdx },
    { key: 'drug', idx: drugIdx },
    { key: 'diag', idx: diagIdx }
  ].filter(x => x.idx !== -1).sort((a, b) => a.idx - b.idx);

  const result = { action: '', drug: '', diag: '' };

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : text.length;
    let content = text.substring(start, end).trim();
    content = content.replace(/^##[^\n]*\n/, '').trim();
    result[indices[i].key] = content;
  }

  return result;
}
