/**
 * SafetyGuard - 药量安全拦截器 v2
 * 修复：子串匹配误报（去氧肾上腺素≠肾上腺素）、单位混淆（μg≠mg）
 */

import { DRUG_LIMITS, getAllDrugNames } from '../utils/drugLimits';

// 需要精确匹配的药名（避免子串误报）
// key = 短名（可能被误匹配），value = 包含该短名的长名列表
const SUBSTRING_CONFLICTS = {
  '肾上腺素': ['去甲肾上腺素', '去氧肾上腺素'],
  '曲库铵': ['顺阿曲库铵', '阿曲库铵'],
};

/**
 * 单位换算系数 → 统一为药物定义的 unit
 */
function convertToTargetUnit(value, extractedUnit, targetUnit) {
  const eu = extractedUnit.toLowerCase().replace('ug', 'μg').replace('mcg', 'μg');
  const tu = targetUnit.toLowerCase().replace('ug', 'μg').replace('mcg', 'μg');

  if (eu === tu) return value;

  // μg → mg
  if (eu === 'μg' && tu === 'mg') return value / 1000;
  // mg → μg
  if (eu === 'mg' && tu === 'μg') return value * 1000;

  // 无法换算的单位组合不比较
  return null;
}

/**
 * 检查 AI 文本是否真正提及了该药物（排除子串冲突）
 */
function isDrugActuallyMentioned(text, drugName) {
  // 检查是否有更长的药名包含此药名
  const conflicts = SUBSTRING_CONFLICTS[drugName];
  if (!conflicts) return text.includes(drugName);

  // 找到所有出现位置，检查每个位置是否属于更长的药名
  let idx = 0;
  while (true) {
    const pos = text.indexOf(drugName, idx);
    if (pos === -1) return false;

    // 检查这个位置是否是某个更长药名的一部分
    let isPartOfLonger = false;
    for (const longerName of conflicts) {
      // 检查 pos 前面的字符是否构成更长药名
      const startCheck = Math.max(0, pos - (longerName.length - drugName.length));
      const endCheck = Math.min(text.length, pos + longerName.length);
      const surrounding = text.substring(startCheck, endCheck);
      if (surrounding.includes(longerName)) {
        isPartOfLonger = true;
        break;
      }
    }

    if (!isPartOfLonger) return true; // 找到独立出现
    idx = pos + drugName.length;
  }
}

/**
 * 检查 AI 输出文本中的药物剂量安全性
 */
export function checkDoseSafety(aiText, patientWeight) {
  const warnings = [];
  const drugNames = getAllDrugNames();

  // 按药名长度降序排列，优先匹配长名（去氧肾上腺素 > 肾上腺素）
  const sortedNames = [...drugNames].sort((a, b) => b.length - a.length);

  for (const drugName of sortedNames) {
    const drug = DRUG_LIMITS[drugName];
    if (!drug) continue;

    // 跳过泵注类药物（它们的剂量单位是速率，不适合单次剂量比较）
    if (drug.maxDoseRate && !drug.maxDosePerKg && !drug.maxAbsolute) continue;

    // 精确匹配检查
    if (!isDrugActuallyMentioned(aiText, drugName)) continue;

    // 提取紧跟药名后的剂量 — 只在药名附近（50字符内）找
    const escapedName = drugName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 匹配模式：药名后跟剂量数字+单位（限50字符内）
    const regex = new RegExp(
      `${escapedName}[^\\d]{0,20}?(\\d+\\.?\\d*)\\s*(mg|μg|ug|mcg|ml|g)`,
      'gi'
    );

    let match;
    while ((match = regex.exec(aiText)) !== null) {
      const rawDose = parseFloat(match[1]);
      const extractedUnit = match[2];
      if (isNaN(rawDose) || rawDose <= 0) continue;

      // 单位换算为药物定义的单位
      const convertedDose = convertToTargetUnit(rawDose, extractedUnit, drug.unit);
      if (convertedDose === null) continue; // 无法换算则跳过

      // 计算最大剂量
      let maxDose = null;
      if (drug.maxDosePerKg && patientWeight) {
        maxDose = drug.maxDosePerKg * patientWeight;
        if (drug.maxAbsolute) maxDose = Math.min(maxDose, drug.maxAbsolute);
      } else if (drug.maxAbsolute) {
        maxDose = drug.maxAbsolute;
      }

      if (maxDose !== null && convertedDose > maxDose) {
        const existing = warnings.find(w => w.drug === drugName);
        if (!existing || convertedDose > existing.extractedDose) {
          if (existing) warnings.splice(warnings.indexOf(existing), 1);
          warnings.push({
            drug: drugName,
            extractedDose: Math.round(convertedDose * 100) / 100,
            maxDose: Math.round(maxDose * 100) / 100,
            unit: drug.unit,
            note: drug.note,
            category: drug.category,
            severity: convertedDose > maxDose * 1.5 ? 'critical' : 'warning'
          });
        }
      }
    }
  }

  return {
    safe: warnings.length === 0,
    warnings: warnings.sort((a, b) => (b.severity === 'critical' ? 1 : 0) - (a.severity === 'critical' ? 1 : 0))
  };
}

export function formatWarnings(warnings, patientWeight) {
  return warnings.map(w => {
    const weightInfo = patientWeight ? `(体重${patientWeight}kg)` : '';
    const icon = w.severity === 'critical' ? '🚨' : '⚠️';
    return `${icon} ${w.drug}${weightInfo}: AI建议 ${w.extractedDose}${w.unit}，极量上限 ${w.maxDose}${w.unit}\n   ${w.note}`;
  }).join('\n\n');
}
