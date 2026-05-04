/**
 * 临床药物极量数据库
 * 数据来源：Miller's Anesthesia, ASA/CSA 指南
 */

export const DRUG_LIMITS = {
  // === 全身麻醉药 ===
  '丙泊酚': { maxDosePerKg: 2.5, unit: 'mg', route: '诱导推注', note: '老年/心功能差减半; 维持4-12mg/kg/h', category: '全麻药' },
  '依托咪酯': { maxDosePerKg: 0.3, unit: 'mg', route: '诱导推注', note: '血流动力学稳定; 肾上腺抑制', category: '全麻药' },
  '氯胺酮': { maxDosePerKg: 2.0, unit: 'mg', route: '静脉推注', note: '升颅压眼压; 肌注4-8mg/kg', category: '全麻药' },
  '咪达唑仑': { maxDosePerKg: 0.1, maxAbsolute: 5, unit: 'mg', route: '静推', note: '拮抗剂:氟马西尼', category: '镇静药' },
  '右美托咪定': { maxDosePerKg: 1.0, unit: 'μg', route: '负荷(10min)', note: '维持0.2-0.7μg/kg/h; 心动过缓', category: '镇静药' },

  // === 阿片类 ===
  '芬太尼': { maxDosePerKg: 5, unit: 'μg', route: '诱导推注', note: '维持1-2μg/kg/h; 胸壁僵直(>5μg/kg快推)', category: '阿片类' },
  '舒芬太尼': { maxDosePerKg: 0.5, unit: 'μg', route: '诱导推注', note: '效价芬太尼10倍; 维持0.15-0.3μg/kg/h', category: '阿片类' },
  '瑞芬太尼': { maxDosePerKg: 1.0, unit: 'μg', route: '诱导推注', note: '超短效; 维持0.05-0.4μg/kg/min', category: '阿片类' },
  '吗啡': { maxDosePerKg: 0.15, maxAbsolute: 10, unit: 'mg', route: '静推', note: '组胺释放致低血压', category: '阿片类' },
  '地佐辛': { maxDosePerKg: 0.1, maxAbsolute: 10, unit: 'mg', route: '静推', note: '呼吸抑制封顶效应', category: '阿片类' },

  // === 肌松药 ===
  '琥珀胆碱': { maxDosePerKg: 1.5, unit: 'mg', route: '静推', note: '恶性高热禁忌; 高钾风险', category: '肌松药' },
  '罗库溴铵': { maxDosePerKg: 0.9, unit: 'mg', route: '插管剂量', note: '拮抗:舒更葡糖钠', category: '肌松药' },
  '顺阿曲库铵': { maxDosePerKg: 0.2, unit: 'mg', route: '插管剂量', note: 'Hofmann降解不依赖肝肾', category: '肌松药' },
  '维库溴铵': { maxDosePerKg: 0.1, unit: 'mg', route: '插管剂量', note: '拮抗:新斯的明+阿托品', category: '肌松药' },
  '阿曲库铵': { maxDosePerKg: 0.5, unit: 'mg', route: '插管剂量', note: '组胺释放', category: '肌松药' },

  // === 肌松拮抗 ===
  '新斯的明': { maxDosePerKg: 0.07, maxAbsolute: 5, unit: 'mg', route: '静推', note: '必须联合阿托品', category: '肌松拮抗' },
  '舒更葡糖钠': { maxDosePerKg: 16, unit: 'mg', route: '紧急逆转', note: '常规2-4mg/kg; 紧急16mg/kg', category: '肌松拮抗' },

  // === 局麻药 ===
  '利多卡因': { maxDosePerKg: 4.5, maxAbsolute: 300, unit: 'mg', route: '浸润/阻滞', note: '含肾上腺素7mg/kg(≤500mg); 中毒→抽搐→心律失常', category: '局麻药' },
  '布比卡因': { maxDosePerKg: 2.5, maxAbsolute: 175, unit: 'mg', route: '浸润/阻滞', note: '心脏毒性最强; 治疗:脂肪乳剂', category: '局麻药' },
  '罗哌卡因': { maxDosePerKg: 3.0, maxAbsolute: 225, unit: 'mg', route: '浸润/阻滞', note: '心毒性低于布比卡因', category: '局麻药' },
  '左布比卡因': { maxDosePerKg: 2.5, maxAbsolute: 150, unit: 'mg', route: '浸润/阻滞', note: '布比卡因S异构体', category: '局麻药' },

  // === 血管活性药(升压) ===
  '去甲肾上腺素': { maxDoseRate: 0.5, unit: 'μg/kg/min', route: '泵注', note: '起始0.01-0.05; 外渗致坏死', category: '升压药' },
  '肾上腺素': { maxAbsolute: 1, unit: 'mg', route: '心跳骤停推注', note: '过敏:0.3-0.5mg IM; 泵注0.01-0.2μg/kg/min', category: '抢救药' },
  '多巴胺': { maxDoseRate: 20, unit: 'μg/kg/min', route: '泵注', note: '低(2-5)肾;中(5-10)β1;高(10-20)α1', category: '升压药' },
  '多巴酚丁胺': { maxDoseRate: 20, unit: 'μg/kg/min', route: '泵注', note: 'β1为主正性肌力', category: '正性肌力' },
  '麻黄碱': { maxAbsolute: 25, unit: 'mg', route: '静推', note: '单次5-10mg; 快速减效', category: '升压药' },
  '去氧肾上腺素': { maxAbsolute: 200, unit: 'μg', route: '静推', note: '单次50-200μg; 纯α1', category: '升压药' },
  '间羟胺': { maxAbsolute: 10, unit: 'mg', route: '静推', note: '单次0.5-2mg', category: '升压药' },

  // === 降压/抗心律失常 ===
  '艾司洛尔': { maxDosePerKg: 1.0, unit: 'mg', route: '负荷推注', note: '超短效β阻滞; 维持50-300μg/kg/min', category: '抗心律失常' },
  '拉贝洛尔': { maxAbsolute: 300, unit: 'mg', route: '累计最大', note: '单次5-20mg缓推', category: '降压药' },
  '乌拉地尔': { maxAbsolute: 50, unit: 'mg', route: '单次静推', note: 'α1阻滞+5-HT1A', category: '降压药' },
  '硝酸甘油': { maxDoseRate: 200, unit: 'μg/min', route: '泵注', note: '起始5-20μg/min', category: '降压药' },
  '硝普钠': { maxDoseRate: 10, unit: 'μg/kg/min', route: '泵注', note: '避光; 氰化物中毒风险', category: '降压药' },
  '胺碘酮': { maxDosePerKg: 5, maxAbsolute: 300, unit: 'mg', route: '负荷推注', note: '室颤300mg; 24h≤2.2g', category: '抗心律失常' },

  // === 抢救药 ===
  '阿托品': { maxAbsolute: 3, unit: 'mg', route: '静推(总量)', note: '0.5mg q3-5min; <0.5mg可反常心动过缓', category: '抢救药' },
  '纳洛酮': { maxDosePerKg: 0.01, maxAbsolute: 2, unit: 'mg', route: '静推', note: '阿片拮抗; 0.04mg起始滴定', category: '拮抗药' },
  '氟马西尼': { maxDosePerKg: 0.01, maxAbsolute: 1, unit: 'mg', route: '静推', note: 'BZD拮抗; 0.2mg起始', category: '拮抗药' },
  '丹曲洛林': { maxDosePerKg: 2.5, unit: 'mg', route: '静推(初始)', note: '恶性高热特效; 可重复至10mg/kg', category: '抢救药' },
  '脂肪乳剂20%': { maxDosePerKg: 12, unit: 'ml', route: '推注+泵注', note: '局麻药中毒:推注1.5ml/kg→泵注0.25ml/kg/min', category: '抢救药' },
  '氢化可的松': { maxAbsolute: 200, unit: 'mg', route: '静推', note: '过敏/肾上腺危象100-200mg', category: '激素' },
  '甲泼尼龙': { maxDosePerKg: 2, maxAbsolute: 1000, unit: 'mg', route: '静推', note: '冲击治疗最大1g/日', category: '激素' },
  '地塞米松': { maxDosePerKg: 0.15, maxAbsolute: 20, unit: 'mg', route: '静推', note: 'PONV预防4-8mg', category: '激素' },
  '氨甲环酸': { maxDosePerKg: 100, maxAbsolute: 8000, unit: 'mg', route: '最大剂量', note: '常规10-15mg/kg缓推', category: '止血药' },
  '呋塞米': { maxDosePerKg: 1.5, maxAbsolute: 200, unit: 'mg', route: '静推', note: '常规10-20mg; 注意低钾', category: '利尿药' },
  '昂丹司琼': { maxDosePerKg: 0.1, maxAbsolute: 16, unit: 'mg', route: '静推', note: '常规4-8mg; QT延长', category: '止吐药' },
};

export function getDrugMaxDose(drugName, weightKg) {
  const drug = DRUG_LIMITS[drugName];
  if (!drug) return null;
  let maxDose = null;
  if (drug.maxDosePerKg && weightKg) {
    maxDose = drug.maxDosePerKg * weightKg;
    if (drug.maxAbsolute) maxDose = Math.min(maxDose, drug.maxAbsolute);
  } else if (drug.maxAbsolute) {
    maxDose = drug.maxAbsolute;
  }
  return { maxDose, unit: drug.unit, note: drug.note, category: drug.category, route: drug.route };
}

export function getAllDrugNames() {
  return Object.keys(DRUG_LIMITS);
}
