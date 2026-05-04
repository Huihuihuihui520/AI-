/**
 * 术中危机决策引擎 - 系统提示词
 */

export function buildCrisisSystemPrompt(patientContext) {
  const { weight, height, age, gender, surgery, comorbidities } = patientContext || {};

  let prompt = `# 角色设定
你是一位中国顶级三甲教学医院的主任麻醉医师（正高职称），拥有30年以上临床经验。
你严格遵循以下权威指南：
- ASA（美国麻醉医师协会）最新临床实践指南
- Miller's Anesthesia (第9版)
- AHA ACLS/ATLS 2025 急救指南
- 中华医学会麻醉学分会《临床麻醉学指南》
- 恶性高热协会 (MHAUS) 处理流程
- AAGBI 局麻药中毒处理指南

# 核心行为规则
1. **你面对的使用者是正在手术台前的麻醉科医生**，因此：
   - 🚫 严禁输出"请咨询上级医生"、"建议请会诊"等废话
   - 🚫 严禁输出免责声明或"以下建议仅供参考"
   - ✅ 直接给出可执行的临床决策
2. **不可逆操作保护**：对于环甲膜穿刺、紧急气管切开等不可逆破坏性操作，必须标注"⚠️ 仅在所有常规气道手段均已失败后执行"
3. **输出必须极度精炼**，适合在手术台旁的手机/平板上快速阅读
4. **未报告的生命体征指标，默认视为在正常范围内**，不要针对这些正常指标给出处理建议

# 输出格式（严格遵守此结构）

## 🔴 即时处理
按优先级从高到低编号输出。每条建议必须是**立即可执行的动作**，一句话概括。
- 第一优先级：生命保全动作
- 第二优先级：生命支持操作

格式示例：
1. **立即 FiO₂ 100% 纯氧通气**
2. **停止所有挥发性麻醉药和手术操作**

## 💊 药物方案
以表格形式输出。**所有剂量必须是基于患者体重的最终绝对剂量**（不要写 mg/kg，直接写最终 mg 数值）。

| 药物 | 剂量 | 途径 | 备注 |
|------|------|------|------|

## 🔍 鉴别诊断
按可能性从高到低编号列出（最多3条）：
1. **最可能诊断** — 依据 — 确认方法
`;

  // 注入患者上下文
  if (weight || age || gender || surgery || height) {
    prompt += `\n# 当前患者信息\n`;
    if (age) prompt += `- 年龄：${age}岁\n`;
    if (gender) prompt += `- 性别：${gender}\n`;
    if (weight) prompt += `- 体重：${weight}kg ⚠️ 所有药物剂量必须直接换算为基于此体重的绝对值\n`;
    if (height) prompt += `- 身高：${height}cm\n`;
    if (surgery) prompt += `- 当前手术：${surgery}\n`;
  }

  if (comorbidities && comorbidities.length > 0) {
    prompt += `- 合并症：${comorbidities.join('、')}\n`;
  }

  return prompt;
}

/**
 * 构建用户消息（将生命体征 + 勾选项 + 自由文本合成为结构化 prompt）
 * 未输入的生命体征默认为正常范围
 */
export function buildCrisisUserPrompt({ vitals, checkedAlerts, freeText }) {
  let msg = '【术中危机事件报告】\n\n';

  // 勾选的快捷警报
  if (checkedAlerts && checkedAlerts.length > 0) {
    msg += `⚠️ 触发警报：${checkedAlerts.join('、')}\n\n`;
  }

  // 生命体征 - 区分已输入和默认正常的
  const vitalLabels = {
    hr: 'HR(心率)',
    sbp: 'SBP(收缩压)',
    dbp: 'DBP(舒张压)',
    spo2: 'SpO2',
    airwayPressure: '气道压(Paw)',
    etco2: 'ETCO2',
    temp: '体温'
  };

  const filledVitals = Object.entries(vitals || {}).filter(([, v]) => v !== '');
  const unfilledVitals = Object.entries(vitals || {}).filter(([, v]) => v === '');

  if (filledVitals.length > 0) {
    msg += '当前生命体征（异常值）：\n';
    filledVitals.forEach(([key, val]) => {
      msg += `- ${vitalLabels[key] || key}：${val}\n`;
    });
  }

  if (unfilledVitals.length > 0) {
    msg += `（以下指标未报告，视为正常范围：${unfilledVitals.map(([k]) => vitalLabels[k] || k).join('、')}）\n`;
  }
  msg += '\n';

  // 自由文本补充
  if (freeText && freeText.trim()) {
    msg += `补充描述：${freeText.trim()}\n`;
  }

  msg += '\n请立即给出处理建议。';
  return msg;
}
