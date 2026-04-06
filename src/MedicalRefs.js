export const MEDICAL_REFS = {
  asa: {
    title: 'ASA 身体状况分级',
    subtitle: 'American Society of Anesthesiologists',
    content: [
      { label: 'ASA I', desc: '正常的健康患者。' },
      { label: 'ASA II', desc: '患有轻微系统性疾病者（如：控制良好的轻度高血压/糖尿病）。' },
      { label: 'ASA III', desc: '患有严重的、但未丧失生活能力的系统性疾病（如：严重的系统性疾病，活动受限）。' },
      { label: 'ASA IV', desc: '患有威胁生命的持续性严重系统性疾病（如：近期心梗/不稳定型心绞痛）。' },
      { label: 'ASA V', desc: '垂死患者，不论手术与否，在24小时内极可能死亡者。' },
      { label: 'ASA VI', desc: '脑死亡患者，其器官被移除用于捐赠。' }
    ]
  },
  nyha: {
    title: 'NYHA 心功能分级',
    subtitle: 'New York Heart Association',
    content: [
      { label: 'I 级', desc: '患有心脏病，但平时一般活动不引起疲乏、心悸、呼吸困难或心绞痛。' },
      { label: 'II 级', desc: '体力活动轻度受限。休息时无自觉症状，但平时一般活动可引起上述症状。' },
      { label: 'III 级', desc: '体力活动明显受限。休息时无症状，但小于平时一般活动即可引起上述症状。' },
      { label: 'IV 级', desc: '不能从事任何体力活动。休息时亦有心衰症状，体力活动后加重。' }
    ]
  },
  child_pugh: {
    title: 'Child-Pugh 肝功能评分',
    subtitle: 'Liver cirrhosis prognosis (Score based)',
    content: [
      { label: '评分指标 (1/2/3分)', desc: '1. 脑病 (无/1-2期/3-4期)\n2. 腹水 (无/轻度/中重度)\n3. 胆红素 (<34 / 34-51 / >51 μmol/L)\n4. 白蛋白 (>35 / 28-35 / <28 g/L)\n5. INR (<1.7 / 1.7-2.3 / >2.3)' },
      { label: 'A级 (5-6分)', desc: '手术风险低，预后良好。' },
      { label: 'B级 (7-9分)', desc: '手术风险中度，需谨慎处理。' },
      { label: 'C级 (10-15分)', desc: '手术风险极高，禁忌大手术。' }
    ]
  },
  mets: {
    title: 'METs 代谢当量',
    subtitle: 'Metabolic Equivalent of Task',
    content: [
      { label: '< 4 METs', desc: '日常生活受限（如：室内行走、穿衣、进餐、慢走）。可行一般手术。' },
      { label: '4-10 METs', desc: '良好（如：爬2层楼、慢跑、游泳、园艺）。代谢耐受佳。' },
      { label: '> 10 METs', desc: '卓越（如：高强度球类、快速骑行、重型体力活）。' }
    ]
  },
  mallampati: {
    title: 'Mallampati 气道分级',
    subtitle: 'Airway visualization scale',
    content: [
      { label: 'I 级', desc: '可见软腭、咽峡弓、扁桃体、腭垂。' },
      { label: 'II 级', desc: '可见软腭、咽峡弓、腭垂。' },
      { label: 'III 级', desc: '可见软腭、腭垂基底部。' },
      { label: 'IV 级', desc: '仅可见硬腭。' }
    ]
  },
  gold: {
    title: 'GOLD 肺功能分级',
    subtitle: 'COPD severity based on FEV1',
    content: [
      { label: 'GOLD 1 (轻度)', desc: 'FEV1 ≥ 80% 预计值。' },
      { label: 'GOLD 2 (中度)', desc: '50% ≤ FEV1 < 80% 预计值。' },
      { label: 'GOLD 3 (重度)', desc: '30% ≤ FEV1 < 50% 预计值。' },
      { label: 'GOLD 4 (极重度)', desc: 'FEV1 < 30% 预计值。' }
    ]
  },
  ccs: {
    title: 'CCS 心绞痛分级',
    subtitle: 'Canadian Cardiovascular Society',
    content: [
      { label: 'I 级', desc: '一般体力活动（如步行、登楼）不引起心绞痛。' },
      { label: 'II 级', desc: '一般体力活动轻度受限（如快步、餐后等）。' },
      { label: 'III 级', desc: '一般体力活动明显受限（如以普通速度步行1-2个街区）。' },
      { label: 'IV 级', desc: '任何体力活动均可引起心绞痛，休息时也可发生。' }
    ]
  },
  rcri: {
    title: 'RCRI 心脏风险指数',
    subtitle: 'Revised Cardiac Risk Index',
    content: [
      { label: '6项标准', desc: '1. 高风险手术\n2. 缺血性心脏病史\n3. 充血性心衰史\n4. 脑血管疾病史\n5. 需要胰岛素治疗的糖尿病\n6. 术前肌酐 > 2.0 mg/dL' },
      { label: '风险预测', desc: '0项: 0.4%; 1项: 0.9%; 2项: 6.6%; ≥3项: 11% 主要心脏并发症发生率。' }
    ]
  },
  mg: {
    title: 'Osserman 重症肌无力分级',
    subtitle: 'Myasthenia Gravis Classification',
    content: [
      { label: 'I 型', desc: '单纯眼肌型，仅累及眼外肌。' },
      { label: 'IIa 型', desc: '轻度全身型，进展缓，无呼吸危象。' },
      { label: 'IIb 型', desc: '中度全身型，骨骼肌和延髓肌受累显，无呼吸危象。' },
      { label: 'III 型', desc: '急性暴发型，骨骼肌和延髓肌受累重，伴有呼吸危象。' },
      { label: 'IV 型', desc: '晚期重症型，从 I/II 型 2 年后发展而来。' }
    ]
  },
  ckd: {
    title: 'CKD 慢性肾病分期',
    subtitle: 'Chronic Kidney Disease Stages',
    content: [
      { label: '1 期', desc: 'GFR ≥ 90 ml/(min·1.73㎡)。肾功能正常，伴蛋白尿等。' },
      { label: '2 期', desc: 'GFR 60~89 ml/(min·1.73㎡)。肾功能轻度下降。' },
      { label: '3 期', desc: 'GFR 30~59 ml/(min·1.73㎡)。肾功能中度下降 (3a: 45-59, 3b: 30-44)。' },
      { label: '4 期', desc: 'GFR 15~29 ml/(min·1.73㎡)。肾功能重度下降。' },
      { label: '5 期', desc: 'GFR < 15 ml/(min·1.73㎡)。肾功能衰竭期/尿毒症期。' }
    ]
  },
  bmi: {
    title: 'BMI 分类标准',
    subtitle: 'Body Mass Index',
    content: [
      { label: '偏瘦', desc: '< 18.5' },
      { label: '正常', desc: '18.5 - 24.9' },
      { label: '超重', desc: '25.0 - 29.9' },
      { label: '肥胖 (I级)', desc: '30.0 - 34.9' },
      { label: '肥胖 (II级)', desc: '35.0 - 39.9' },
      { label: '极重度肥胖', desc: '≥ 40.0' }
    ]
  }
};
