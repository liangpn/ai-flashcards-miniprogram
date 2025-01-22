// 全局配置常量
export const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 获取 API Key
export function getApiKey(): string {
  const apiKey = wx.getStorageSync('deepseek_api_key');
  if (!apiKey) {
    throw new Error('请先配置 API 密钥');
  }
  return apiKey;
} 

export const getTopicSystemPrompt = (keyword: string) => {
  const systemPrompt = `作为一个知识专家，请基于关键词"${keyword}"，生成8-12个相关的学习主题。
  这些主题应该：
  1. 与原关键词密切相关
  2. 涵盖不同的知识维度
  3. 具有学习价值
  4. 主题的难度要有区分，从基础到进阶
  5. 每个主题用简短的短语表达（不超过15个字）
  
  请直接返回主题列表，每行一个主题，不要有编号或其他额外文字。`
  return systemPrompt;
}

export const getCustomCardSystemPrompt = (difficulty: string) => {
  const systemPrompt = `你是一个专业的教育助手，擅长创建高质量的学习卡片。
  难度要求：${difficulty}
  请注意以下要求：
  1. 无论输入内容是什么语言，始终用中文创建问答卡片
  2. 如果输入内容是英文或其他语言，在回答中可以保留原文，但解释必须用中文
  3. 确保问题简短清晰，答案准确完整
  4. 严格按照JSON格式返回，不要包含任何其他文字`;
  return systemPrompt;
}

// 获取用户提示词 
// type: 1 自定义内容页面的提示词 2 探索主题页面的提示词
export function getCustomCardUserPrompt(type: number, cardCount: number, content: string) {

  const customPrompt = `请将以下内容分解成${cardCount}张闪卡：
  
  内容：${content}
  
  请使用 Markdown 格式，并严格按照以下JSON格式返回，不需要使用\`\`\`json\`\`\`包裹JSON内容，直接返回JSON内容，确保是有效的JSON：
  [
    {
      "question": "Markdown 格式的问题",
      "answer": "Markdown 格式的答案",
      "topic": "该question所属的具体知识点/主题"
    }
  ]
  
  关于topic的严格要求：
  1. topic必须是该question所涉及的具体知识点或主题
  2. topic必须是用户输入内容中明确讲解或涉及的知识范围
  3. topic可以是内容中直接提到的具体知识点，也可以是内容明确讲解的更大知识范围
  4. 每个question的topic都要准确反映该问题的归属
  5. topic长度不超过15个字
  
  以下举例仅用于帮助理解上述规则，不要直接使用这些例子中的主题，应该根据实际输入内容来确定合适的topic：
  - 如果用户输入的内容是在讲解"TCP的三次握手和四次挥手的具体过程"
  - 对于讲解握手过程的问题，topic可以是"TCP三次握手"（具体知识点）或"TCP协议"（所属知识范围）
  - 对于讲解挥手过程的问题，topic可以是"TCP四次挥手"（具体知识点）或"TCP协议"（所属知识范围）
  - 但不能使用"计算机网络"这样过于宽泛或内容未明确讲解的主题`;



  const explorePrompt = `请基于主题"${content}"，生成${cardCount}张闪卡：

  使用 Markdown 格式，并严格按照以下JSON格式返回，不需要使用\`\`\`json\`\`\`包裹JSON内容，直接返回JSON内容，确保是有效的JSON：
  [
    {
      "question": "Markdown 格式的问题",
      "answer": "Markdown 格式的答案"
    }
  ]`;

  return type === 1 ? customPrompt : explorePrompt;
}
