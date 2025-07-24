// OpenAI 通用TOKEN检测
async function checkOpenAIToken(token) {
  try {
    const baseUrl = document.getElementById('baseUrl').value.trim() || 'https://api.openai.com/v1';
    const testModel = document.getElementById('testModel').value.trim() || 'gpt-4o-mini';

    // 确保 baseUrl 以正确格式结尾
    const apiUrl = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        model: testModel,
        messages: [
          {
            role: "user",
            content: "Hello"
          }
        ],
        max_tokens: 1
      })
    });

    if (response.ok) {
      return {
        token: token,
        isValid: true,
        message: "有效"
      };
    } else {
      const errorData = await response.json().catch(() => null);
      let message = "无效";
      
      if (response.status === 429) {
        message = "429 - 请求过于频繁";
      } else if (response.status === 401) {
        message = "401 - 认证失败";
      } else if (response.status === 403) {
        message = "403 - 权限不足";
      } else if (errorData && errorData.error && errorData.error.message) {
        message = errorData.error.message;
      }

      return {
        token: token,
        isValid: false,
        message: message
      };
    }
  } catch (error) {
    return {
      token: token,
      isValid: false,
      message: "网络错误: " + error.message
    };
  }
}

// 硅基流动TOKEN检测
async function checkSilicoFlowToken(token) {
  // 1. 验证token
  const resp1 = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 100,
      stream: false
    })
  });

  if (!resp1.ok) {
    const errData = await resp1.json().catch(() => null);
    return {
      token,
      isValid: false,
      message: errData && errData.message ? errData.message : "验证失败"
    };
  }

  // 2. 查询余额
  const resp2 = await fetch("https://api.siliconflow.cn/v1/user/info", {
    method: "GET",
    headers: { "Authorization": "Bearer " + token }
  });

  if (!resp2.ok) {
    return {
      token,
      isValid: true,
      balance: -1,
      message: "有效但无法获取余额"
    };
  }

  const data2 = await resp2.json();
  const balance = data2.data && data2.data.balance !== undefined ? data2.data.balance : -1;

  return {
    token,
    isValid: true,
    balance: balance,
    message: "有效"
  };
}

// Google Gemini TOKEN检测
async function checkGeminiToken(token) {
  try {
    // 获取 proxy 配置，如果有配置则使用 proxy，否则使用官方地址
    const geminiProxy = document.getElementById('geminiProxy')?.value.trim();
    const baseUrl = geminiProxy || 'https://generativelanguage.googleapis.com';
    
    // 获取模型配置，如果留空则使用默认模型
    const geminiModel = document.getElementById('geminiModel')?.value.trim() || 'gemini-1.5-flash-8b';
    
    // 确保 baseUrl 以正确格式结尾
    const apiUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}v1beta/models/${geminiModel}:generateContent?key=${token}`
      : `${baseUrl}/v1beta/models/${geminiModel}:generateContent?key=${token}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello"
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1
        }
      })
    });

    if (response.ok) {
      return {
        token: token,
        isValid: true,
        message: "有效"
      };
    } else {
      const errorData = await response.json().catch(() => null);
      let message = "无效";
      
      if (response.status === 429) {
        message = "429 - 请求过于频繁";
      } else if (response.status === 400) {
        message = "400 - API KEY无效";
      } else if (response.status === 403) {
        message = "403 - API KEY被禁用或权限不足";
      } else if (errorData && errorData.error && errorData.error.message) {
        message = errorData.error.message;
      }

      return {
        token: token,
        isValid: false,
        message: message
      };
    }
  } catch (error) {
    return {
      token: token,
      isValid: false,
      message: "网络错误: " + error.message
    };
  }
}

// 复制有效KEY
function copyValidTokens() {
  const validTokens = window.__VALID_TOKENS_FOR_COPY__ || [];
  if (!validTokens.length) {
    showCustomModal("没有可复制的有效KEY", "warning");
    return;
  }

  const provider = document.querySelector('input[name="provider"]:checked').value;
  const providerConfig = API_PROVIDERS[provider];
  const includeBalance = document.getElementById("includeBalance").checked;
  const commaSeparated = document.getElementById("commaSeparated").checked;

  const processedTokens = validTokens.map(token => {
    if (includeBalance && providerConfig.hasBalance) {
      const balanceInfo = document.getElementById("validResults").textContent
        .split("\n")
        .find(line => line.startsWith(token));
      return balanceInfo || token;
    }
    return token;
  });

  const separator = commaSeparated ? ", " : "\n";
  const joined = processedTokens.join(separator);

  const textArea = document.createElement("textarea");
  textArea.value = joined;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  const formatText = commaSeparated ? "逗号分隔" : "换行分隔";
  showCustomModal("有效KEY已复制到剪贴板 (" + formatText + ")", "success");
}

// 复制限流KEY
function copyRateLimitTokens() {
  const rateLimitTokens = window.__RATE_LIMIT_TOKENS_FOR_COPY__ || [];
  if (!rateLimitTokens.length) {
    showCustomModal("没有可复制的限流KEY", "warning");
    return;
  }

  const commaSeparated = document.getElementById("rateLimitCommaSeparated").checked;
  const separator = commaSeparated ? ", " : "\n";
  const joined = rateLimitTokens.join(separator);

  const textArea = document.createElement("textarea");
  textArea.value = joined;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  const formatText = commaSeparated ? "逗号分隔" : "换行分隔";
  showCustomModal("限流KEY已复制到剪贴板 (" + formatText + ")", "success");
}
