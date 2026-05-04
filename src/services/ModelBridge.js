/**
 * ModelBridge - 多模型调用统一接口
 * 支持 Gemini 3 Flash / Qwen-Max / Qwen-Turbo
 * 流式传输 + 异常处理
 */

// 模型配置映射
const MODEL_CONFIGS = {
  'gemini-3-flash': {
    provider: 'gemini',
    modelId: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash'
  },
  'qwen-max': {
    provider: 'qwen',
    modelId: 'qwen-max',
    displayName: 'Qwen-Max'
  },
  'qwen-turbo': {
    provider: 'qwen',
    modelId: 'qwen-turbo',
    displayName: 'Qwen-Turbo'
  }
};

// 离线降级急救速查卡
const OFFLINE_FALLBACK = {
  '心跳骤停': '1. 立即胸外按压 100-120次/min\n2. FiO₂ 100%\n3. 肾上腺素 1mg IV q3-5min\n4. 除颤(VF/pVT): 双相 200J\n5. 胺碘酮 300mg IV\n6. 查找可逆原因(4H4T)',
  '恶性高热': '1. 立即停止所有挥发性麻醉药和琥珀胆碱\n2. 过度通气 FiO₂ 100%\n3. 丹曲洛林 2.5mg/kg IV(可重复至10mg/kg)\n4. 冰盐水降温\n5. 纠正高钾:胰岛素+葡萄糖\n6. 监测CK、尿色',
  '局麻药中毒': '1. 停止注射局麻药\n2. FiO₂ 100% 辅助通气\n3. 抽搐→咪达唑仑 2-4mg IV\n4. 20%脂肪乳剂: 1.5ml/kg 推注→0.25ml/kg/min泵注\n5. 心跳骤停按ACLS处理(避免利多卡因)\n6. 30min内脂肪乳总量≤12ml/kg',
  '严重过敏反应': '1. 停止所有可疑致敏药物\n2. FiO₂ 100%\n3. 肾上腺素 0.3-0.5mg IM(或10-100μg IV滴定)\n4. 快速补液 NS 20ml/kg\n5. 氢化可的松 200mg IV\n6. 持续监测至少4h(双相反应)',
  '大出血/失血性休克': '1. 加压输液(加温)\n2. 启动大量输血方案(MTP)\n3. 红细胞:血浆:血小板 = 1:1:1\n4. 氨甲环酸 1g IV(10min)\n5. 纤维蛋白原目标 >1.5g/L\n6. 钙剂补充(每4U红细胞补1g氯化钙)'
};

class ModelBridge {
  /**
   * 统一发送消息接口
   * @param {string} systemPrompt - 系统提示词
   * @param {string} userMessage - 用户消息
   * @param {function} onChunk - 流式回调 (text) => void
   * @returns {Promise<string>} 完整回复文本
   */
  async sendMessage(systemPrompt, userMessage, onChunk) {
    // 检查网络连接
    if (!navigator.onLine) {
      const fallbackText = this.#getOfflineFallback(userMessage);
      if (onChunk) onChunk(fallbackText);
      return fallbackText;
    }

    const config = this.#getConfig();
    if (!config.key) {
      throw new Error('❌ 未配置 API Key，请在设置中填写对应模型的密钥。');
    }

    const modelConfig = MODEL_CONFIGS[config.modelType];
    if (!modelConfig) {
      throw new Error(`❌ 未知模型类型: ${config.modelType}`);
    }

    // 设置超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      let result;
      if (modelConfig.provider === 'gemini') {
        result = await this.#callGemini(systemPrompt, userMessage, config.key, modelConfig.modelId, onChunk, controller.signal);
      } else {
        result = await this.#callQwen(systemPrompt, userMessage, config.key, modelConfig.modelId, onChunk, controller.signal);
      }
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        const fallback = this.#getOfflineFallback(userMessage);
        const msg = '⚠️ 请求超时(15秒)，以下为本地急救速查卡：\n\n' + fallback;
        if (onChunk) onChunk(msg);
        return msg;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Gemini REST API (SSE stream)
   */
  async #callGemini(systemPrompt, userMessage, key, modelId, onChunk, signal) {
    const url = `/api/gemini/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(this.#handleError(response.status, errText));
    }

    return this.#readSSEStream(response, onChunk, 'gemini');
  }

  /**
   * Qwen (OpenAI-compatible) via DashScope proxy
   */
  async #callQwen(systemPrompt, userMessage, key, modelId, onChunk, signal) {
    const url = '/api/dashscope/compatible-mode/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      signal,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: true,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(this.#handleError(response.status, errText));
    }

    return this.#readSSEStream(response, onChunk, 'qwen');
  }

  /**
   * 统一 SSE 流读取
   */
  async #readSSEStream(response, onChunk, provider) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') continue;

        try {
          const data = JSON.parse(dataStr);
          let content = '';

          if (provider === 'gemini') {
            content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            content = data.choices?.[0]?.delta?.content || '';
          }

          if (content) {
            fullText += content;
            if (onChunk) onChunk(content);
          }
        } catch (e) {
          // skip incomplete JSON chunks
        }
      }
    }

    return fullText;
  }

  /**
   * 从 localStorage 获取配置
   */
  #getConfig() {
    return {
      modelType: localStorage.getItem('ay_model_type') || 'qwen-max',
      key: localStorage.getItem('ay_api_key') || ''
    };
  }

  /**
   * 错误处理 - 友好中文提示
   */
  #handleError(status, body) {
    switch (status) {
      case 400:
        return `❌ 请求格式错误(400)。请检查模型名称是否正确。\n${body.substring(0, 200)}`;
      case 401:
      case 403:
        return '❌ API Key 无效或已过期，请在设置中检查当前模型的密钥。';
      case 429:
        return '⚠️ 请求过于频繁，模型服务限流中。请等待 30 秒后重试。';
      case 500:
      case 502:
      case 503:
        return '⚠️ 模型服务暂时不可用，请稍后重试或切换到其他模型。';
      default:
        return `❌ 请求失败 (${status})\n${body.substring(0, 200)}`;
    }
  }

  /**
   * 离线降级 - 本地急救速查卡
   */
  #getOfflineFallback(userMessage) {
    const msg = userMessage.toLowerCase();
    const keywords = {
      '心跳骤停': ['心跳骤停', '心脏骤停', '室颤', '无脉', 'vf', 'pvt', 'asystole', 'pea'],
      '恶性高热': ['恶性高热', '高热', '肌僵直', 'mh', '体温急剧'],
      '局麻药中毒': ['局麻药中毒', '利多卡因中毒', '布比卡因中毒', '罗哌卡因中毒', 'last', '局麻药'],
      '严重过敏反应': ['过敏', '过敏性休克', '皮疹', '支气管痉挛', 'anaphylaxis'],
      '大出血/失血性休克': ['大出血', '出血', '失血', '低血容量', '休克']
    };

    for (const [scenario, kws] of Object.entries(keywords)) {
      if (kws.some(kw => msg.includes(kw))) {
        return `📴 **离线模式 - ${scenario}急救速查卡**\n\n${OFFLINE_FALLBACK[scenario]}`;
      }
    }

    // 通用降级
    return `📴 **网络不可用**\n\n当前无法连接 AI 服务。请检查网络连接后重试。\n\n**本地急救速查卡可用关键词：**\n- 心跳骤停\n- 恶性高热\n- 局麻药中毒\n- 严重过敏反应\n- 大出血`;
  }

  /**
   * 获取当前模型显示名
   */
  static getModelDisplayName() {
    const type = localStorage.getItem('ay_model_type') || 'qwen-max';
    return MODEL_CONFIGS[type]?.displayName || type;
  }

  /**
   * 获取所有可用模型列表
   */
  static getAvailableModels() {
    return Object.entries(MODEL_CONFIGS).map(([key, cfg]) => ({
      value: key,
      label: cfg.displayName,
      provider: cfg.provider
    }));
  }
}

export default ModelBridge;
export { MODEL_CONFIGS, OFFLINE_FALLBACK };
