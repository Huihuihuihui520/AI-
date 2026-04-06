import React, { useState, useEffect, useMemo } from 'react';
import { Settings, X, Activity, User, FileText, CheckCircle2, ChevronDown, ChevronUp, Copy, Save, Clock, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generatePrompt } from './PromptTemplate';
import { MEDICAL_REFS } from './MedicalRefs';
import { Info, ExternalLink } from 'lucide-react';

const COMORBIDITY_CONFIG = [
  {
    id: 'cvs',
    category: '循环系统',
    items: [
      {
        id: 'htn',
        label: '高血压',
        fields: [
          { key: 'grade', label: '分级', type: 'select', options: ['1级', '2级', '3级'] },
          { key: 'bp', label: '当前血压', type: 'text', placeholder: '150/95mmHg' },
          { key: 'meds', label: '服药情况', type: 'select', options: ['规律', '不规律'] }
        ]
      },
      {
        id: 'cad',
        label: '冠心病',
        fields: [
          { key: 'miHistory', label: '心梗病史', type: 'select', options: ['无', '<3月', '3-6月', '>6月'] },
          { key: 'history', label: '再灌注史', type: 'select', options: ['无', '支架植入', '搭桥手术'] },
          { key: 'ccs', label: '心绞痛分级', type: 'select', options: ['I级', 'II级', 'III级', 'IV级'] }
        ]
      },
      {
        id: 'valvular',
        label: '瓣膜病',
        fields: [
          { key: 'valve', label: '受累瓣膜', type: 'select', options: ['二尖瓣', '主动脉瓣', '三尖瓣', '肺动脉瓣'] },
          { key: 'type', label: '病变性质', type: 'select', options: ['狭窄', '关闭不全', '联合病变'] },
          { key: 'severity', label: '严重程度', type: 'select', options: ['轻度', '中度', '重度'] }
        ]
      },
      {
        id: 'arr',
        label: '心律失常',
        fields: [
          { key: 'type', label: '类型', type: 'text', placeholder: '如: 房颤, 室早' },
          { key: 'pacer', label: '植入设备', type: 'select', options: ['无', '起搏器', 'ICD', 'CRT'] }
        ]
      },
      {
        id: 'hf',
        label: '心力衰竭',
        fields: [
          { key: 'nyha', label: 'NYHA分级', type: 'select', options: ['I级', 'II级', 'III级', 'IV级'] },
          { key: 'ef', label: 'EF值(%)', type: 'number', placeholder: '55' }
        ]
      }
    ]
  },
  {
    id: 'resp',
    category: '呼吸系统',
    items: [
      {
        id: 'copd',
        label: '慢阻肺(COPD)',
        fields: [
          { key: 'gold', label: 'GOLD分级', type: 'select', options: ['1级', '2级', '3级', '4级'] },
          { key: 'exacerbation', label: '急性发作史', type: 'select', options: ['否', '2周内', '1月内'] },
          { key: 'steroids', label: '长期应用激素', type: 'select', options: ['否', '是'] },
          { key: 'breathHold', label: '屏气时长(s)', type: 'number', placeholder: '30' }
        ]
      },
      {
        id: 'asthma',
        label: '哮喘',
        fields: [
          { key: 'gold', label: '严重程度', type: 'select', options: ['轻度', '中度', '重度'] },
          { key: 'exacerbation', label: '近期发作史', type: 'select', options: ['否', '是'] },
          { key: 'steroids', label: '长期应用激素', type: 'select', options: ['否', '是'] }
        ]
      },
      { id: 'infection', label: '肺部感染' },
      {
        id: 'osas',
        label: '睡眠呼吸暂停(OSAHS)',
        fields: [
          { key: 'ahi', label: 'AHI指数', type: 'number', placeholder: '15' },
          { key: 'cpap', label: '规律使用CPAP', type: 'select', options: ['否', '是'] },
          { key: 'mallampati', label: 'Mallampati分级', type: 'select', options: ['I', 'II', 'III', 'IV'] }
        ]
      }
    ]
  },
  {
    id: 'metabol',
    category: '代谢与内分泌',
    items: [
      {
        id: 'dm',
        label: '糖尿病',
        fields: [
          { key: 'type', label: '类型', type: 'select', options: ['1型', '2型', '妊娠'] },
          { key: 'therapy', label: '治疗方案', type: 'select', options: ['饮食', '口服药', '胰岛素'] },
          { key: 'hba1c', label: 'HbA1c(%)', type: 'number', placeholder: '7.0' }
        ]
      },
      {
        id: 'thyroid',
        label: '甲状腺功能异常',
        fields: [
          { key: 'type', label: '类型', type: 'select', options: ['甲亢', '甲减'] },
          { key: 'status', label: '控制情况', type: 'select', options: ['控制良好', '控制中', '控制不佳'] }
        ]
      },
      { id: 'obesity', label: '肥胖' }
    ]
  },
  {
    id: 'neuro',
    category: '神经与神经肌肉',
    items: [
      {
        id: 'stroke',
        label: '脑卒中史',
        fields: [
          { key: 'time', label: '发生时间', type: 'select', options: ['3月内', '3-6月', '>6月'] },
          { key: 'type', label: '性质', type: 'select', options: ['脑梗死', '脑出血'] },
          { key: 'seq', label: '后遗症情况', type: 'text', placeholder: '如: 偏瘫, 语言障碍' }
        ]
      },
      { id: 'epilepsy', label: '癫痫' },
      {
        id: 'mg',
        label: '重症肌无力',
        fields: [
          { key: 'osserman', label: 'Osserman分级', type: 'select', options: ['I型', 'IIa型', 'IIb型', 'III型', 'IV型'] }
        ]
      },
      {
        id: 'cog',
        label: '认知障碍',
        fields: [
          { key: 'type', label: '类型', type: 'select', options: ['阿尔茨海默', '血管性痴呆', '谵妄史', '其他'] }
        ]
      },
      {
        id: 'icp',
        label: '颅内高压风险',
        fields: [
          { key: 'risk', label: '风险评估', type: 'select', options: ['无', '高风险'] }
        ]
      }
    ]
  },
  {
    id: 'renal',
    category: '肝肾功能',
    items: [
      {
        id: 'liver',
        label: '肝功能不全',
        fields: [
          { key: 'childPugh', label: 'Child-Pugh评分', type: 'select', options: ['A级', 'B级', 'C级'] }
        ]
      },
      {
        id: 'ckd',
        label: '慢性肾病',
        fields: [
          { key: 'stage', label: '分期', type: 'select', options: ['1期', '2期', '3期', '4期', '5期'] },
          { key: 'dialysis', label: '透析方式', type: 'select', options: ['否', '血液透析', '腹膜透析'] },
          { key: 'frequency', label: '频率/时间', type: 'text', placeholder: '如: 3次/周, 4h/次' }
        ]
      }
    ]
  },
  {
    id: 'coag',
    category: '凝血功能',
    items: [
      {
        id: 'coag_detail',
        label: '实验室与药物管理',
        fields: [
          { key: 'plt', label: '血小板(10^9/L)', type: 'number', placeholder: '150' },
          { key: 'pt_aptt', label: 'PT/APTT', type: 'select', options: ['正常', '延长', '缩短'] },
          { key: 'anticoag', label: '长期抗凝药', type: 'select', options: ['无', '阿司匹林', '氯吡格雷', '华法林', 'NOAC'] },
          { key: 'stopDays', label: '停药天数', type: 'number', placeholder: '7' }
        ]
      }
    ]
  }
];

// 为特定字段注入 infoKey 关联医学参考手册
const injectInfoKeys = () => {
  const findItem = (id) => {
    for (const group of COMORBIDITY_CONFIG) {
      const item = group.items.find(i => i.id === id);
      if (item) return item;
    }
    return null;
  };

  // 1. 冠心病 CCS
  const cad = findItem('cad');
  if (cad) cad.fields.find(f => f.key === 'ccs').infoKey = 'ccs';

  // 2. 心衰 NYHA
  const hf = findItem('hf');
  if (hf) hf.fields.find(f => f.key === 'nyha').infoKey = 'nyha';

  // 3. COPD GOLD
  const copd = findItem('copd');
  if (copd) copd.fields.find(f => f.key === 'gold').infoKey = 'gold';

  // 4. Child-Pugh
  const liver = findItem('liver');
  if (liver) liver.fields.find(f => f.key === 'childPugh').infoKey = 'child_pugh';

  // 5. Mallampati (in OSAS)
  const osas = findItem('osas');
  if (osas) osas.fields.find(f => f.key === 'mallampati').infoKey = 'mallampati';

  // 6. 重症肌无力
  const mg = findItem('mg');
  if (mg) mg.fields.find(f => f.key === 'osserman').infoKey = 'mg';

  // 7. 慢性肾病
  const ckd = findItem('ckd');
  if (ckd) ckd.fields.find(f => f.key === 'stage').infoKey = 'ckd';
};
injectInfoKeys();

// 即时参考图标组件
const InfoIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center ml-1 p-0.5 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
  >
    <Info className="w-3 h-3" />
  </button>
);

// 标准化 URL 辅助函数
const normalizeUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  // 1. 强制 HTTPS (处理 http:// 或 无协议开头)
  if (!u.startsWith('http')) u = 'https://' + u;
  u = u.replace(/^http:\/\//i, 'https://');
  
  // 2. 去除末尾所有重复斜杠
  u = u.replace(/\/+$/, '');
  
  // 3. 处理重复路径拼接：如果用户填写的已经包含 /chat/completions，先切除以防二次拼接
  return u + '/chat/completions';
};

// 根据当前环境获取最终请求 URL (用于处理 CORS 代理)
const getApiUrl = (baseUrl) => {
  const normUrl = normalizeUrl(baseUrl);
  
  // 阿里云 DashScope 直连通常会报 CORS，我们在开发(Vite)和生产(Vercel)环境都通过 /api/dashscope 代理
  if (normUrl.includes('dashscope.aliyuncs.com')) {
    return normUrl.replace('https://dashscope.aliyuncs.com', '/api/dashscope');
  }
  
  return normUrl;
};

export default function App() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '男',
    height: '',
    weight: '',
    comorbidities: [], // 保存选中的 ID 列表
    labAbnormalities: '',
    otherNotes: '',
    airway: {
      history: '否',
      features: [],
      mallampati: 'I'
    },
    details: {}, // 详情改为根据 ID 存储
    surgery: {
      name: '',
      risk: '中风险',
      positions: [],
      duration: '',
      specialNeeds: []
    }
  });

  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('ay_api_key') || '',
    baseUrl: normalizeUrl(localStorage.getItem('ay_base_url') || 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
    model: localStorage.getItem('ay_model') || 'qwen-plus' // 默认模型改为千问
  });

  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('ay_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedSections, setExpandedSections] = useState(['围术期麻醉方案']); // Default expanded
  const [activeRefKey, setActiveRefKey] = useState(null); // 控制医学参考手册显示

  // Auto calculate BMI
  const bmi = useMemo(() => {
    if (formData.height && formData.weight) {
      const h = Number(formData.height) / 100;
      const w = Number(formData.weight);
      if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    }
    return '';
  }, [formData.height, formData.weight]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleComorbidity = (itemConfig) => {
    const { id } = itemConfig;
    setFormData(prev => {
      const exists = prev.comorbidities.includes(id);
      if (exists) {
        const newDetails = { ...prev.details };
        delete newDetails[id];
        return {
          ...prev,
          comorbidities: prev.comorbidities.filter(c => c !== id),
          details: newDetails
        };
      } else {
        // Initialize fields if they exist
        const initialDetails = {};
        if (itemConfig.fields) {
          itemConfig.fields.forEach(f => {
            initialDetails[f.key] = f.type === 'select' ? f.options[0] : '';
          });
        }
        return {
          ...prev,
          comorbidities: [...prev.comorbidities, id],
          details: { ...prev.details, [id]: initialDetails }
        };
      }
    });
  };

  const handleDetailChange = (system, field, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [system]: { ...(prev.details[system] || {}), [field]: value }
      }
    }));
  };

  const handleAirwayChange = (field, value) => {
    setFormData(prev => {
      const newState = { ...prev, airway: { ...prev.airway, [field]: value } };
      // Sync Mallampati if OSAS is selected
      if (field === 'mallampati' && newState.details.osas) {
        newState.details.osas = { ...newState.details.osas, mallampati: value };
      }
      return newState;
    });
  };

  const toggleAirwayFeature = (feature) => {
    setFormData(prev => {
      const exists = prev.airway.features.includes(feature);
      if (exists) {
        return { ...prev, airway: { ...prev.airway, features: prev.airway.features.filter(f => f !== feature) } };
      } else {
        return { ...prev, airway: { ...prev.airway, features: [...prev.airway.features, feature] } };
      }
    });
  };

  const handleSurgeryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      surgery: { ...prev.surgery, [field]: value }
    }));
  };

  const toggleSurgeryMulti = (field, item) => {
    setFormData(prev => {
      const exists = prev.surgery[field].includes(item);
      if (exists) {
        return { ...prev, surgery: { ...prev.surgery, [field]: prev.surgery[field].filter(i => i !== item) } };
      } else {
        return { ...prev, surgery: { ...prev.surgery, [field]: [...prev.surgery[field], item] } };
      }
    });
  };

  const saveToHistory = () => {
    if (!result) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      age: formData.age,
      gender: formData.gender,
      asa: asaLevel,
      result: result
    };
    const updated = [newEntry, ...history.slice(0, 19)]; // Keep last 20
    setHistory(updated);
    localStorage.setItem('ay_history', JSON.stringify(updated));
  };

  const deleteHistory = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('ay_history', JSON.stringify(updated));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const handleSettingsSave = () => {
    const fixedUrl = normalizeUrl(settings.baseUrl);
    setSettings(prev => ({ ...prev, baseUrl: fixedUrl }));
    localStorage.setItem('ay_api_key', settings.apiKey);
    localStorage.setItem('ay_base_url', fixedUrl);
    localStorage.setItem('ay_model', settings.model);
    setShowSettings(false);
  };

  const resetSettings = () => {
    if (confirm('确定要重置所有 API 配置吗？')) {
      const defaultBase = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
      const defaultModel = 'qwen-plus';
      setSettings(prev => ({ ...prev, baseUrl: defaultBase, model: defaultModel }));
      localStorage.setItem('ay_base_url', normalizeUrl(defaultBase));
      localStorage.setItem('ay_model', defaultModel);
    }
  };

  const generateReport = async () => {
    if (!settings.apiKey) {
      setErrorMsg("请先在设置中配置 API Key。");
      setShowSettings(true);
      return;
    }
    setErrorMsg('');
    setResult('');
    setLoading(true);

    const promptText = generatePrompt({ ...formData, bmi });

    const requestUrl = getApiUrl(settings.baseUrl);
    console.log("Generating report with URL:", requestUrl);

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: "system", content: "你是一位资深的麻醉科主任医师，专注于术前评估和风险应对。" },
            { role: "user", content: promptText }
          ],
          stream: true,
          temperature: 0.1 // Keep temperature low to avoid hallucinations
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `请求失败: ${response.status}\n内容: ${errorText.substring(0, 200)}\nURL: ${requestUrl}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const dataObj = JSON.parse(dataStr);
              const content = dataObj.choices?.[0]?.delta?.content;
              if (content) {
                setResult(prev => prev + content);
                // Keep the viewport at the bottom as new text streams in
                window.scrollTo(0, document.body.scrollHeight);
              }
            } catch (e) {
              // Gracefully ignore incomplete chunks or parsing errors that can happen in streams
            }
          }
        }
      }

    } catch (err) {
      setErrorMsg("请求异常：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const asaMatch = result.match(/ASA\s*(IV|V|III|II|I)/i);
  const asaLevel = asaMatch ? asaMatch[1].toUpperCase() : '';

  let resultBgClass = 'bg-white border-blue-100';
  if (asaLevel === 'I' || asaLevel === 'II') {
    resultBgClass = 'bg-emerald-50 border-emerald-200';
  } else if (asaLevel === 'III') {
    resultBgClass = 'bg-amber-50 border-amber-200';
  } else if (asaLevel === 'IV' || asaLevel === 'V') {
    resultBgClass = 'bg-rose-50 border-rose-200';
  }

  const markdownComponents = {
    strong: ({ node, ...props }) => {
      const getChildrenText = (children) => {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(getChildrenText).join('');
        if (children && children.props && children.props.children) return getChildrenText(children.props.children);
        return '';
      };
      const text = getChildrenText(props.children);
      if (text.includes('高风险') || text.includes('警告') || text.includes('极低') || text.includes('困难气道') || text.includes('重度')) {
        return <strong className="text-red-700 bg-red-100 px-1.5 py-0.5 rounded-md shadow-sm border border-red-200 mx-0.5" {...props} />;
      }
      return <strong className="text-slate-800 font-bold" {...props} />;
    }
  };

  // UI Refactor Parsing
  const parsedSections = useMemo(() => {
    if (!result) return null;
    const sections = [];
    let criticalWarning = '';
    let emrText = '';
    let asaBasis = '';
    let mortalityRisk = '';

    if (result.includes('[困难气道高风险]')) {
      criticalWarning = '本项目评估提示：患者存在明确的困难气道高风险，需备好困难气道车及高级气道工具。';
    }

    // 提取 ASA 详情字段
    const basisMatch = result.match(/\*\*分级依据\*\*[:：]\s*(.+)/);
    const riskMatch = result.match(/\*\*风险预估\*\*[:：]\s*(.+)/);
    if (basisMatch) asaBasis = basisMatch[1].trim();
    if (riskMatch) mortalityRisk = riskMatch[1].trim();

    // 改进的段落切割：按 ### 标题切割
    const blocks = result.split(/\n?(?=###\s+)/);
    blocks.forEach(block => {
      const titleMatch = block.match(/###\s+(.+)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const content = block.replace(titleMatch[0], '').trim();

        if (title.includes('EMR_Ready_Text')) {
          emrText = content;
        } else if (title.includes('风险总评') || title.includes('置顶警告')) {
          // 这些已在顶部面板或预警卡片处理
        } else {
          // 清洗标题中的数字编号和星号
          const cleanTitle = title.replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/, '$1');
          if (content) sections.push({ id: title, title: cleanTitle, content });
        }
      }
    });

    return { criticalWarning, sections, emrText, asaBasis, mortalityRisk };
  }, [result]);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-md mx-auto w-full font-sans pb-8">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-xl font-bold">临床麻醉助手</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 bg-blue-700/50 rounded-full active:scale-95 transition-transform">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {errorMsg && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm whitespace-pre-wrap break-all">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <main className="space-y-4">
        {/* Proposed Surgery Evaluation Card */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-indigo-500" />
            拟行手术评估
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">手术名称</label>
              <input
                type="text"
                value={formData.surgery.name}
                onChange={e => handleSurgeryChange('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="例如: 腹腔镜下胆囊切除术"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">手术风险等级</label>
                <select
                  value={formData.surgery.risk}
                  onChange={e => handleSurgeryChange('risk', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="低风险">低风险</option>
                  <option value="中风险">中风险</option>
                  <option value="高风险">高风险</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">预计时长 (小时)</label>
                <input
                  type="number"
                  value={formData.surgery.duration}
                  onChange={e => handleSurgeryChange('duration', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  placeholder="2"
                />
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 mb-2 block">手术体位</span>
              <div className="flex flex-wrap gap-2">
                {['仰卧位', '俯卧位', '侧卧位', '截石位', '坐位'].map(pos => {
                  const checked = formData.surgery.positions.includes(pos);
                  return (
                    <button
                      key={pos}
                      onClick={() => toggleSurgeryMulti('positions', pos)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] border transition-all ${checked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 mb-2 block">特殊需求</span>
              <div className="flex flex-wrap gap-2">
                {['需单肺通气', '需控制性降压', '需术中唤醒', '预估大失血风险'].map(req => {
                  const checked = formData.surgery.specialNeeds.includes(req);
                  return (
                    <button
                      key={req}
                      onClick={() => toggleSurgeryMulti('specialNeeds', req)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] border transition-all ${checked ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      {req}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Basic Info Card */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">年龄 (岁)</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => handleInputChange('age', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="例如: 65"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">性别</label>
              <select
                value={formData.gender}
                onChange={e => handleInputChange('gender', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base outline-none focus:border-blue-500"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">身高 (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={e => handleInputChange('height', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base outline-none focus:border-blue-500"
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">体重 (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={e => handleInputChange('weight', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base outline-none focus:border-blue-500"
                placeholder="65"
              />
            </div>
            {bmi && (
              <div className="col-span-2 mt-1 px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm flex justify-between items-center">
                <div className="flex items-center">
                  <span>估算 BMI:</span>
                  <InfoIcon onClick={() => setActiveRefKey('bmi')} />
                </div>
                <span className="font-bold text-lg">{bmi}</span>
              </div>
            )}
          </div>
        </section>

        {/* Airway Assessment Card */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-orange-500" />
            气道评估
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">既往困难气道史</span>
              <div className="flex space-x-2">
                {['否', '是', '不详'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAirwayChange('history', opt)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${formData.airway.history === opt ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 mb-2 block">解剖异常特征 (多选)</span>
              <div className="flex flex-wrap gap-2">
                {['短颈', '小下颌', '张口受限(<3cm)', '颈部活动受限', '暴牙'].map(feat => {
                  const checked = formData.airway.features.includes(feat);
                  return (
                    <button
                      key={feat}
                      onClick={() => toggleAirwayFeature(feat)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] border transition-all ${checked ? 'bg-orange-100 border-orange-300 text-orange-700 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="text-xs text-slate-500">Mallampati 分级</span>
                <InfoIcon onClick={() => setActiveRefKey('mallampati')} />
              </div>
              <div className="flex space-x-1.5">
                {['I', 'II', 'III', 'IV'].map(m => (
                  <button
                    key={m}
                    onClick={() => handleAirwayChange('mallampati', m)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-black transition-all ${formData.airway.mallampati === m ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 合并症动态渲染 (模式驱动) */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" />
            合并症 / 病史
          </h2>
          <div className="space-y-3">
            {COMORBIDITY_CONFIG.map(group => (
              <div key={group.id} className="border border-slate-50 rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  {group.category}
                </div>
                <div className="p-3 space-y-2">
                  {group.items.map(item => {
                    const checked = formData.comorbidities.includes(item.id);
                    return (
                      <div key={item.id} className="space-y-2">
                        <label
                          className={`flex items-center p-2.5 rounded-xl border transition-all cursor-pointer ${checked ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleComorbidity(item)}
                            className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm font-medium">{item.label}</span>
                        </label>

                        {/* 动态二级具体字段表单渲染 */}
                        {checked && item.fields && (
                          <div className="ml-8 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-1">
                            <div className="grid grid-cols-2 gap-3">
                              {item.fields.map(field => (
                                <div key={field.key} className={field.type === 'text' || field.type === 'number' ? 'col-span-2' : ''}>
                                  <div className="flex items-center mb-1">
                                    <label className="block text-[10px] text-blue-600/70 font-bold italic uppercase">{field.label}</label>
                                    {field.infoKey && <InfoIcon onClick={() => setActiveRefKey(field.infoKey)} />}
                                  </div>
                                  {field.type === 'select' ? (
                                    <select
                                      value={formData.details[item.id]?.[field.key] || ''}
                                      onChange={e => handleDetailChange(item.id, field.key, e.target.value)}
                                      className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs text-blue-800 outline-none hover:border-blue-400 focus:border-blue-500 transition-colors"
                                    >
                                      {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      placeholder={field.placeholder || ''}
                                      value={formData.details[item.id]?.[field.key] || ''}
                                      onChange={e => handleDetailChange(item.id, field.key, e.target.value)}
                                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-blue-800 outline-none placeholder:text-blue-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 循环系统全局心功能监测 (除心衰本身外) */}
                        {checked && group.id === 'cvs' && item.id !== 'hf' && (
                          <div className="ml-8 mt-2 p-3 bg-slate-900 text-white rounded-xl space-y-3 shadow-inner">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Heart Status (Global)</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center mb-0.5">
                                  <label className="block text-[10px] opacity-70 text-slate-300">NYHA 分级</label>
                                  <InfoIcon onClick={() => setActiveRefKey('nyha')} />
                                </div>
                                <select
                                  value={formData.details.hf?.nyha || 'I级'}
                                  onChange={e => handleDetailChange('hf', 'nyha', e.target.value)}
                                  className="w-full bg-slate-800 border-none rounded px-2 py-1 text-[10px] outline-none"
                                >
                                  <option value="I级">I 级</option>
                                  <option value="II级">II 级</option>
                                  <option value="III级">III级</option>
                                  <option value="IV级">IV级</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] opacity-70 mb-0.5 text-slate-300">EF 值 (%)</label>
                                <input
                                  type="number"
                                  placeholder="55"
                                  value={formData.details.hf?.ef || ''}
                                  onChange={e => handleDetailChange('hf', 'ef', e.target.value)}
                                  className="w-full bg-slate-800 border-none rounded px-2 py-1 text-[10px] outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 化验单异常结果 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            化验单异常结果 (如有)
          </h2>
          <textarea
            value={formData.labAbnormalities}
            onChange={e => handleInputChange('labAbnormalities', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] transition-all"
            placeholder="例如: Hb 80g/L, 凝血酶原时间延长..."
          />
        </section>

        {/* 其他特殊情况备注 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            其他特殊情况备注
          </h2>
          <textarea
            value={formData.otherNotes}
            onChange={e => handleInputChange('otherNotes', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] transition-all"
            placeholder="如近期感冒咳嗽、服药史、既往麻醉过敏史等..."
          />
        </section>

      </main>

      {/* 底部生成按钮 */}
      <div className="mt-6 mb-8">
        <button
          onClick={generateReport}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${loading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700 active:scale-[0.98]'}`}
        >
          {loading ? '生成中，请稍候...' : '生成评估建议'}
        </button>
      </div>

      {/* 结果显示区 (重构后 UI) */}
      {result && parsedSections && (
        <section id="result-section" className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-5">
          {/* ASA 状态栏 */}
          <div className={`p-4 rounded-2xl shadow-xl border-2 flex flex-col justify-between transition-colors duration-500 ${asaLevel === 'I' || asaLevel === 'II' ? 'bg-blue-600 border-blue-400 text-white' :
              asaLevel === 'III' ? 'bg-amber-500 border-amber-300 text-white' :
                asaLevel === 'IV' || asaLevel === 'V' ? 'bg-rose-600 border-rose-400 text-white' :
                  'bg-slate-700 border-slate-500 text-white'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] opacity-80 font-black uppercase tracking-widest leading-none mb-1">Preoperative Assessment</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-3xl font-black italic tracking-tighter">ASA {asaLevel || '--'}</h3>
                  <span className="text-xs font-bold opacity-90 flex items-center">
                    风险分级
                    <InfoIcon onClick={(e) => { e.stopPropagation(); setActiveRefKey('asa'); }} />
                  </span>
                </div>
              </div>
              <Activity className="w-10 h-10 opacity-30" />
            </div>

            {(parsedSections.asaBasis || parsedSections.mortalityRisk) && (
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2">
                {parsedSections.asaBasis && (
                  <div className="flex items-start space-x-2">
                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">Basis</span>
                    <p className="text-xs leading-snug font-medium text-white/95">{parsedSections.asaBasis}</p>
                  </div>
                )}
                {parsedSections.mortalityRisk && (
                  <div className="flex items-start space-x-2">
                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">Risk</span>
                    <p className="text-[13px] leading-none font-black text-amber-200">{parsedSections.mortalityRisk}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 关键风险卡片 */}
          {parsedSections.criticalWarning && (
            <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-start space-x-3 shadow-sm">
              <div className="bg-rose-600 p-1.5 rounded-lg mt-0.5">
                <Activity className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-rose-800 font-black text-sm mb-1 uppercase tracking-tight">关键风险预警</h4>
                <p className="text-rose-700 text-xs font-bold leading-relaxed">{parsedSections.criticalWarning}</p>
              </div>
            </div>
          )}

          {/* 模块化可折叠建议 */}
          <div className="space-y-3">
            {parsedSections.sections.map((sec) => {
              const rotated = expandedSections.includes(sec.id);
              return (
                <div key={sec.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50/30 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-800">{sec.title}</span>
                    {rotated ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {rotated && (
                    <div className="px-4 pb-4 pt-2 prose prose-blue prose-sm max-w-none text-slate-600 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                      <ReactMarkdown components={markdownComponents}>{sec.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => copyToClipboard(parsedSections.emrText)}
              className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 rounded-xl border border-blue-100 text-xs font-bold active:scale-95 transition-transform"
            >
              <Copy className="w-4 h-4" />
              <span>复制病历摘要</span>
            </button>
            <button
              onClick={saveToHistory}
              className="flex items-center justify-center space-x-2 bg-slate-800 text-slate-100 py-3 rounded-xl shadow-md text-xs font-bold active:scale-95 transition-transform"
            >
              <Save className="w-4 h-4" />
              <span>存入历史记录</span>
            </button>
          </div>
        </section>
      )}

      {/* 历史记录展示 */}
      {!result && history.length > 0 && (
        <section className="mt-10 animate-in fade-in">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              历史评估记录
            </h2>
            <span className="text-[10px] text-slate-400">{history.length} 条</span>
          </div>
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${item.asa === 'I' || item.asa === 'II' ? 'bg-emerald-100 text-emerald-700' :
                      item.asa === 'III' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                    }`}>
                    {item.asa || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{item.gender}性 ({item.age}岁) - ASA {item.asa}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setResult(item.result)}
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHistory(item.id)}
                    className="p-2 text-rose-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 配置抽屉面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 relative animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-slate-800">设置 (BYOK)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">接口地址 (Base URL)</label>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={e => setSettings(s => ({ ...s, baseUrl: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">模型名称 (Model Name)</label>
                <input
                  type="text"
                  value={settings.model}
                  onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleSettingsSave}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold active:bg-blue-700 active:scale-[0.98] transition-all shadow-md"
                >
                  保存设置
                </button>
                <button
                  onClick={resetSettings}
                  className="px-4 bg-slate-100 text-slate-500 py-4 rounded-xl font-medium active:bg-slate-200 transition-all"
                  title="恢复默认值"
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 医学参考手册抽屉 (Glassmorphism Drawer) */}
      {activeRefKey && MEDICAL_REFS[activeRefKey] && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setActiveRefKey(null)}
          />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-t-[32px] max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 ring-1 ring-black/5">
            {/* 拖拽手柄感 */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />

            <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-40px)]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {MEDICAL_REFS[activeRefKey].title}
                </h2>
                <button
                  onClick={() => setActiveRefKey(null)}
                  className="p-2 bg-slate-100 rounded-full text-slate-400 overflow-hidden active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-6 opacity-70">
                {MEDICAL_REFS[activeRefKey].subtitle}
              </p>

              <div className="space-y-4 mb-10">
                {MEDICAL_REFS[activeRefKey].content.map((item, idx) => (
                  <div key={idx} className="bg-white/50 border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[11px] font-black text-slate-400 uppercase mb-1">{item.label}</div>
                    <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pb-6">
                <p className="text-[9px] text-slate-300 font-medium">数据来源：相关临床诊疗指南 (2024)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
