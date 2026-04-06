export function generatePrompt(data) {
  const { age, gender, height, weight, bmi, comorbidities, labAbnormalities, otherNotes, airway, details, surgery } = data;
  
  let prompt = `你是一位顶级的麻醉科主任医师，需参考最新指南（如《中国麻醉学指南2024版》、ASA 2024指南、ESC/ESA心脏评估指南）对即将进行手术的患者进行深度术前评估。\n\n`;
  
  const hasAirwayRisk = (bmi && Number(bmi) > 30) || 
    comorbidities.includes('osas') || 
    comorbidities.includes('obesity') ||
    (otherNotes && otherNotes.includes('困难气道')) ||
    airway.history === '是' ||
    (airway.features && airway.features.length > 0);
    
  const hasCardiacRisk = comorbidities.some(c => ['cad', 'arr', 'hf', 'valvular'].includes(c));
  const hasHypertension = comorbidities.includes('htn');
  const hasRespiratoryRisk = comorbidities.some(c => ['copd', 'asthma', 'infection', 'osas'].includes(c));

  prompt += `【一、患者基本特征】\n`;
  prompt += `性别：${gender}，年龄：${age}岁，身高：${height || '--'}cm，体重：${weight || '--'}kg，BMI：${bmi || '--'}。\n`;

  prompt += `\n【二、拟行手术评估】\n`;
  prompt += `手术名称：${surgery.name || '未填'}\n`;
  prompt += `手术风险等级：${surgery.risk}\n`;
  prompt += `拟行体位：${surgery.positions.length > 0 ? surgery.positions.join('、') : '未填'}\n`;
  prompt += `预计时长：${surgery.duration || '--'} 小时\n`;
  if (surgery.specialNeeds && surgery.specialNeeds.length > 0) {
    prompt += `特殊手术需求：${surgery.specialNeeds.join('、')}\n`;
  }
  
  // 气道专项细节
  prompt += `\n【三、气道专项评估】\n`;
  prompt += `既往困难气道史：${airway.history}\n`;
  if (airway.features && airway.features.length > 0) {
    prompt += `解剖异常特征：${airway.features.join('、')}\n`;
  }
  prompt += `Mallampati 分级：${airway.mallampati}\n`;
  
  if (hasAirwayRisk) {
    prompt += `**系统预警：该患者存在明确或潜在的困难气道风险，请务必在输出最上方置顶加粗显示 “[困难气道高风险]” 警告。**\n`;
  }

  prompt += `\n【四、主要合并症专科细节】\n`;
  
  // 1. 高血压
  if (hasHypertension) {
    const h = details.htn;
    prompt += `[高血压详情]：分级 ${h.grade}，当前记录血压 ${h.bp || '未提供'}，服药情况：${h.meds}。\n`;
  }

  // 2. 冠心病 (CAD)
  if (comorbidities.includes('cad')) {
    const c = details.cad;
    prompt += `[冠心病详情]：心梗(MI)史 ${c.miHistory}，血运重建史(支架/搭桥) ${c.history}，CCS心绞痛分级 ${c.ccs}。\n`;
  }

  // 3. 瓣膜病
  if (comorbidities.includes('valvular')) {
    const v = details.valvular;
    prompt += `[心脏瓣膜病详情]：受累瓣膜 ${v.valve}，病变性质 ${v.type}，严重程度 ${v.severity}。\n`;
  }

  // 4. 心律失常
  if (comorbidities.includes('arr')) {
    const a = details.arr;
    prompt += `[心律失常详情]：类型 ${a.type || '未详'}，植入设备(起搏器/ICD) ${a.pacer}。\n`;
  }

  // 5. 心功能/心衰 (通用循环系统指标)
  if (hasCardiacRisk) {
    const hf = details.hf || {};
    prompt += `[心功能评估]：NYHA 分级 ${hf.nyha || 'I级'}，EF 值 ${hf.ef || '未提供'}%。\n`;
    prompt += `**重要指令：由于合并循环系统疾病，请务必在报告中计算 RCRI (修订版心脏风险指数) 评分，并评估其代谢当量 (METs)。**\n`;
  }

  // 6. COPD
  if (comorbidities.includes('copd')) {
    const r = details.copd;
    prompt += `[COPD详情]：GOLD分级 ${r.gold}，近期(1月内)急性发作史 ${r.exacerbation}，是否长期吸入激素 ${r.steroids}，屏气试验时长 ${r.breathHold || '未提供'}秒。\n`;
  }

  // 7. 哮喘
  if (comorbidities.includes('asthma')) {
    const r = details.asthma;
    prompt += `[哮喘详情]：严重程度 ${r.gold}，近期发作史 ${r.exacerbation}，是否长期吸入激素 ${r.steroids}。\n`;
  }

  // 8. OSAS
  if (comorbidities.includes('osas')) {
    const o = details.osas;
    prompt += `[OSAS详情]：AHI 指数 ${o.ahi || '未提供'}，是否常规使用 CPAP ${o.cpap}，Mallampati 分级 ${o.mallampati}。\n`;
  }

  // 9. 糖尿病
  if (comorbidities.includes('dm')) {
    const d = details.dm;
    prompt += `[糖尿病详情]：类型 ${d.type}，治疗方案 ${d.therapy}，HbA1c ${d.hba1c || '未详'}%。\n`;
  }

  // 10. 甲状腺
  if (comorbidities.includes('thyroid')) {
    const t = details.thyroid;
    prompt += `[甲状腺详情]：类型 ${t.type}，控制情况 ${t.status}。\n`;
  }

  // 11. 脑卒中
  if (comorbidities.includes('stroke')) {
    const s = details.stroke;
    prompt += `[脑卒中史]：发生时间 ${s.time || '未详'}，性质 ${s.type || '未详'}，后遗症 ${s.seq || '无'}。\n`;
  }

  // 12. 重症肌无力
  if (comorbidities.includes('mg')) {
    const m = details.mg;
    prompt += `[重症肌无力]：Osserman分级 ${m.osserman}。\n`;
  }

  // 13. 认知障碍
  if (comorbidities.includes('cog')) {
    const c = details.cog;
    prompt += `[认知障碍]：类型 ${c.type}。\n`;
  }

  // 14. 颅内高压
  if (comorbidities.includes('icp')) {
    const i = details.icp;
    prompt += `[颅内高压风险]：风险程度 ${i.risk}。\n`;
  }

  // 15. 肝功能
  if (comorbidities.includes('liver')) {
    const l = details.liver;
    prompt += `[肝功能详情]：Child-Pugh评分 ${l.childPugh}。\n`;
  }

  // 16. CKD
  if (comorbidities.includes('ckd')) {
    const r = details.ckd;
    prompt += `[慢性肾病]：分期 ${r.stage}，透析方式 ${r.dialysis}，频率/时间 ${r.frequency || '未详'}。\n`;
  }

  // 17. 凝血功能
  if (comorbidities.includes('coag_detail')) {
    const c = details.coag_detail;
    prompt += `[凝血功能/药物管理]：血小板 ${c.plt || '未提供'} G/L，PT/APTT ${c.pt_aptt}，当前抗凝药 ${c.anticoag}，停药天数 ${c.stopDays || '0'}天。\n`;
    prompt += `**重要指令：由于涉及凝血异常或抗凝管理，请在建议中明确椎管内麻醉的禁忌证或置管/拔管时机。**\n`;
  }

  if (labAbnormalities && labAbnormalities.trim() !== '') {
    prompt += `\n【五、化验指标异常】\n${labAbnormalities}\n`;
  }

  if (otherNotes && otherNotes.trim() !== '') {
    prompt += `\n【六、其他特殊情况】\n${otherNotes}\n`;
  }

  prompt += `\n【核心任务与输出格式要求】\n`;
  prompt += `请根据以上信息提供评估报告，输出需语言精练、直击要点，适应手机端快速阅读，必须严格遵守以下 Markdown 格式结构：\n\n`;
  
  prompt += `### 1. 置顶警告\n`;
  prompt += `若存在困难气道风险，输出 **[困难气道高风险]**，否则留空。\n\n`;
  
  prompt += `### 2. 风险总评\n`;
  prompt += `格式要求：\n**ASA [分级]**\n**分级依据**：[简洁描述依据，如：严重系统性疾病，活动受限]\n**风险预估**：[围术期死亡率或主要并发症发生率数值，如：~1.8%]\n包含 RCRI 或 METs 评估结论。\n\n`;
  
  prompt += `### 3. 高风险因素预警\n`;
  prompt += `对关键风险点使用 **Markdown 加粗** 并包含“高风险”字眼。\n\n`;
  
  prompt += `### 4. 具体合并症建议\n`;
  prompt += `针对病史，给出具体的用药习惯（停药/续药）、术中监测建议。\n\n`;
  
  prompt += `### 5. 围术期麻醉方案\n`;
  prompt += `包含插管工具、监测深度、药物选择及肌松管理等。\n\n`;
  
  prompt += `### 6. EMR_Ready_Text\n`;
  prompt += `标题下方提供一段标准的、可直接复制粘贴到术前访视记录中的病历文案。\n`;

  return prompt;
}


