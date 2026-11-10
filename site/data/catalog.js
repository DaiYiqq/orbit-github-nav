/* Orbit · 人工精选内容（AI 导航 / 社区 / 博客 / 论文 / 专题精选）
 * 与自动抓取的仓库索引互补：这里放「非仓库」的站点、工具、内容与规范入口。
 * 字段：n 名称 · d 描述 · u 链接 · t 标签 · b 角标
 */
window.__GH_NAV_CATALOG__ = {
  aiNav: [
    {
      title: '通用对话助手', icon: 'sparkles', color: '#7C5CFF',
      items: [
        { n: 'ChatGPT', d: 'OpenAI 官方对话助手，支持推理、联网与多模态', u: 'https://chatgpt.com', t: '对话', b: '热门' },
        { n: 'Claude', d: 'Anthropic 助手，长文本与代码能力强', u: 'https://claude.ai', t: '对话' },
        { n: 'Gemini', d: 'Google 多模态助手，深度整合 Workspace', u: 'https://gemini.google.com', t: '对话' },
        { n: 'DeepSeek', d: '国产开源推理模型，代码与数学表现突出', u: 'https://chat.deepseek.com', t: '国产' },
        { n: '豆包', d: '字节跳动 AI 助手，中文场景体验完整', u: 'https://www.doubao.com', t: '国产' },
        { n: '通义千问', d: '阿里云大模型助手，Qwen 生态入口', u: 'https://tongyi.aliyun.com', t: '国产' },
        { n: 'Kimi', d: '长上下文与资料阅读见长的中文助手', u: 'https://www.kimi.com', t: '国产' },
        { n: '智谱清言', d: '清华系 GLM 系列模型助手', u: 'https://chatglm.cn', t: '国产' },
        { n: 'Grok', d: 'xAI 助手，实时接入 X 平台数据', u: 'https://grok.com', t: '对话' },
        { n: 'Microsoft Copilot', d: '微软全家桶 AI 助手', u: 'https://copilot.microsoft.com', t: '对话' },
        { n: 'Poe', d: '一站聚合多家模型的对话平台', u: 'https://poe.com', t: '聚合' },
      ]
    },
    {
      title: 'AI 搜索与研究', icon: 'search', color: '#0A84FF',
      items: [
        { n: 'Perplexity', d: '带引用的对话式搜索引擎', u: 'https://www.perplexity.ai', t: '搜索', b: '热门' },
        { n: 'NotebookLM', d: '把自己的资料变成可问答的知识库', u: 'https://notebooklm.google.com', t: '资料' },
        { n: '秘塔 AI 搜索', d: '中文无广告结构化搜索与大纲生成', u: 'https://metaso.cn', t: '国产' },
        { n: 'Elicit', d: '面向科研文献的自动综述与数据抽取', u: 'https://elicit.com', t: '学术' },
        { n: 'Consensus', d: '从论文中找证据的学术搜索引擎', u: 'https://consensus.app', t: '学术' },
        { n: 'Google Scholar', d: '学术文献检索与引用追踪', u: 'https://scholar.google.com', t: '学术' },
      ]
    },
    {
      title: 'AI 编程与开发', icon: 'code', color: '#34C759',
      items: [
        { n: 'Cursor', d: 'AI 原生代码编辑器', u: 'https://cursor.com', t: '编辑器', b: '热门' },
        { n: 'GitHub Copilot', d: '最广泛使用的 AI 编码助手', u: 'https://github.com/features/copilot', t: '助手' },
        { n: 'Claude Code', d: '终端里的智能编码代理，支持 Skills / MCP', u: 'https://docs.anthropic.com/en/docs/claude-code/overview', t: 'Agent' },
        { n: 'Windsurf', d: '强调上下文感知的 AI IDE', u: 'https://windsurf.com', t: '编辑器' },
        { n: 'Trae', d: '字节推出的 AI 原生 IDE', u: 'https://www.trae.ai', t: '编辑器' },
        { n: 'v0', d: '用自然语言生成前端界面', u: 'https://v0.dev', t: '前端' },
        { n: 'Bolt', d: '浏览器内直接生成并运行全栈应用', u: 'https://bolt.new', t: '全栈' },
        { n: 'Cline', d: 'VS Code 中的开源自主编码代理', u: 'https://cline.bot', t: 'Agent' },
        { n: 'Continue', d: '开源可自定义的 IDE 编码助手', u: 'https://continue.dev', t: '开源' },
        { n: 'Zed', d: 'Rust 编写的高性能协作编辑器', u: 'https://zed.dev', t: '编辑器' },
      ]
    },
    {
      title: '图像 · 视频 · 音频', icon: 'image', color: '#FF6482',
      items: [
        { n: 'Midjourney', d: '风格化图像生成的标杆产品', u: 'https://www.midjourney.com', t: '图像' },
        { n: 'ComfyUI', d: '节点式工作流，开源生图事实标准', u: 'https://github.com/comfyanonymous/ComfyUI', t: '开源' },
        { n: 'Stability AI', d: 'Stable Diffusion 系列模型官网', u: 'https://stability.ai', t: '图像' },
        { n: 'Runway', d: '面向创作者的 AI 视频生成与编辑', u: 'https://runwayml.com', t: '视频' },
        { n: 'Sora', d: 'OpenAI 视频生成模型', u: 'https://openai.com/sora', t: '视频' },
        { n: '可灵 Kling', d: '国产视频生成模型', u: 'https://klingai.com', t: '视频' },
        { n: 'ElevenLabs', d: '高拟真语音合成与配音', u: 'https://elevenlabs.io', t: '音频' },
        { n: 'Suno', d: 'AI 音乐生成', u: 'https://suno.com', t: '音频' },
        { n: 'Adobe Firefly', d: '面向设计工作流的生成式 AI', u: 'https://firefly.adobe.com', t: '设计' },
      ]
    },
    {
      title: '开源模型与平台', icon: 'cube', color: '#5E5CE6',
      items: [
        { n: 'Hugging Face', d: '模型、数据集与 Demo 的最大社区', u: 'https://huggingface.co', t: '社区', b: '必看' },
        { n: 'Ollama', d: '一条命令在本地跑开源大模型', u: 'https://ollama.com', t: '本地' },
        { n: 'LM Studio', d: '带图形界面的本地模型运行环境', u: 'https://lmstudio.ai', t: '本地' },
        { n: 'ModelScope 魔搭', d: '国内模型与数据集社区', u: 'https://modelscope.cn', t: '国产' },
        { n: 'vLLM', d: '高吞吐 LLM 推理与服务引擎', u: 'https://github.com/vllm-project/vllm', t: '推理' },
        { n: 'llama.cpp', d: 'C/C++ 轻量推理引擎，端侧首选', u: 'https://github.com/ggml-org/llama.cpp', t: '推理' },
        { n: 'Open WebUI', d: '自托管的模型聊天前端', u: 'https://github.com/open-webui/open-webui', t: '自托管' },
        { n: 'Dify', d: '可视化 LLM 应用与 Agent 编排平台', u: 'https://github.com/langgenius/dify', t: '编排' },
        { n: 'LangChain', d: 'LLM 应用开发框架与生态', u: 'https://github.com/langchain-ai/langchain', t: '框架' },
        { n: 'n8n', d: '支持 AI 节点的工作流自动化平台', u: 'https://n8n.io', t: '自动化' },
        { n: 'Replicate', d: '一行 API 调用运行开源模型', u: 'https://replicate.com', t: '云推理' },
      ]
    },
    {
      title: '效率与创作', icon: 'bolt', color: '#00C7BE',
      items: [
        { n: 'Notion AI', d: '文档与知识库内的 AI 助手', u: 'https://www.notion.so/product/ai', t: '文档' },
        { n: 'Gamma', d: '一句话生成演示文稿与网页', u: 'https://gamma.app', t: '演示' },
        { n: '沉浸式翻译', d: '双语对照网页与 PDF 翻译', u: 'https://immersivetranslate.com', t: '翻译' },
        { n: 'Descript', d: '像编辑文档一样编辑音视频', u: 'https://www.descript.com', t: '音视频' },
        { n: 'Grammarly', d: '英文写作润色与语法检查', u: 'https://www.grammarly.com', t: '写作' },
        { n: 'Canva', d: '在线设计与 AI 素材生成', u: 'https://www.canva.com', t: '设计' },
      ]
    },
  ],

  community: [
    {
      title: '国际社区', icon: 'globe', color: '#0A84FF',
      items: [
        { n: 'Hugging Face Hub', d: '模型、数据集、Spaces 与讨论区，AI 时代的主广场', u: 'https://huggingface.co', t: '社区', b: '最活跃' },
        { n: 'r/LocalLLaMA', d: '本地大模型玩家的聚集地，新模型首发讨论', u: 'https://www.reddit.com/r/LocalLLaMA', t: 'Reddit' },
        { n: 'r/MachineLearning', d: '机器学习研究与工程讨论', u: 'https://www.reddit.com/r/MachineLearning', t: 'Reddit' },
        { n: 'Hacker News', d: '技术圈高质量新闻与评论', u: 'https://news.ycombinator.com', t: '论坛' },
        { n: 'GitHub Discussions', d: '开源项目官方讨论区入口', u: 'https://github.com/discussions', t: '开源' },
        { n: 'Kaggle', d: '数据科学竞赛、数据集与 Notebook', u: 'https://www.kaggle.com', t: '竞赛' },
        { n: 'Stack Overflow', d: '开发问题问答库', u: 'https://stackoverflow.com', t: '问答' },
        { n: 'LangChain Discord', d: 'LangChain / LangGraph 官方社区入口', u: 'https://github.com/langchain-ai/langchain#-community', t: 'Discord' },
      ]
    },
    {
      title: '中文社区', icon: 'chat', color: '#FF375F',
      items: [
        { n: '魔搭 ModelScope 社区', d: '国内模型开源与体验社区', u: 'https://modelscope.cn', t: '模型' },
        { n: '始智AI wisemodel', d: '开源模型与数据集社区', u: 'https://www.wisemodel.cn', t: '模型' },
        { n: '飞桨 AI Studio', d: '学习、算力与竞赛一体平台', u: 'https://aistudio.baidu.com', t: '学习' },
        { n: 'Datawhale', d: '开源学习组织，中文教程质量很高', u: 'https://github.com/datawhalechina', t: '学习' },
        { n: '机器之心', d: 'AI 行业媒体与深度报道', u: 'https://www.jiqizhixin.com', t: '媒体' },
        { n: '量子位', d: 'AI 资讯与产品动态', u: 'https://www.qbitai.com', t: '媒体' },
        { n: '知乎 · 人工智能', d: '中文深度讨论与经验分享', u: 'https://www.zhihu.com/topic/19551275', t: '问答' },
        { n: 'V2EX', d: '开发者社区，工具与产品首发常客', u: 'https://www.v2ex.com', t: '论坛' },
        { n: '掘金', d: '中文技术文章与实践笔记', u: 'https://juejin.cn', t: '博客' },
        { n: '通往 AGI 之路', d: '中文 AI 知识库与学习路径', u: 'https://www.waytoagi.com', t: '知识库' },
        { n: '科技爱好者周刊', d: '阮一峰每周开源项目与工具精选', u: 'https://github.com/ruanyf/weekly', t: '周刊' },
      ]
    },
    {
      title: '学术与会议', icon: 'graduation', color: '#AF52DE',
      items: [
        { n: 'arXiv', d: '预印本论文首发平台', u: 'https://arxiv.org', t: '论文' },
        { n: 'Papers with Code', d: '论文与代码实现对照', u: 'https://paperswithcode.com', t: '论文' },
        { n: 'OpenReview', d: '会议投稿与公开评审', u: 'https://openreview.net', t: '会议' },
        { n: 'NeurIPS', d: '机器学习顶会官网', u: 'https://neurips.cc', t: '会议' },
        { n: 'ACL Anthology', d: 'NLP 领域论文全集', u: 'https://aclanthology.org', t: '论文' },
        { n: 'Semantic Scholar', d: '语义化论文检索与引用图谱', u: 'https://www.semanticscholar.org', t: '检索' },
        { n: 'alphaXiv', d: '论文逐段讨论与解读', u: 'https://www.alphaxiv.org', t: '解读' },
        { n: 'Connected Papers', d: '可视化论文关联图谱', u: 'https://www.connectedpapers.com', t: '图谱' },
      ]
    },
  ],

  blogs: [
    { n: 'Andrej Karpathy', d: '从神经网络到 LLM 的第一性原理长文', u: 'https://karpathy.github.io', t: '个人博客', lang: 'EN' },
    { n: 'Lilian Weng · Lil Log', d: 'Agent、扩散模型、对齐最系统的技术综述', u: 'https://lilianweng.github.io', t: '个人博客', lang: 'EN' },
    { n: 'Simon Willison', d: '几乎日更的 LLM 工程实践与工具评测', u: 'https://simonwillison.net', t: '个人博客', lang: 'EN' },
    { n: 'Jay Alammar · The Illustrated Series', d: '图解 Transformer、BERT、Stable Diffusion', u: 'https://jalammar.github.io', t: '图解教程', lang: 'EN' },
    { n: 'Chris Olah · colah’s blog', d: '神经网络可解释性经典文章', u: 'https://colah.github.io', t: '个人博客', lang: 'EN' },
    { n: 'Distill', d: '交互式可视化机器学习期刊', u: 'https://distill.pub', t: '期刊', lang: 'EN' },
    { n: 'Chip Huyen', d: 'ML 系统与生产落地', u: 'https://huyenchip.com', t: '个人博客', lang: 'EN' },
    { n: 'Eugene Yan', d: '推荐系统、LLM 应用与工程复盘', u: 'https://eugeneyan.com', t: '个人博客', lang: 'EN' },
    { n: 'Sebastian Raschka', d: '从零构建 LLM、模型微调实战', u: 'https://sebastianraschka.com', t: '个人博客', lang: 'EN' },
    { n: 'Hugging Face Blog', d: '新模型、训练技巧与开源发布', u: 'https://huggingface.co/blog', t: '官方博客', lang: 'EN' },
    { n: 'OpenAI Research', d: '前沿模型与研究发布', u: 'https://openai.com/research', t: '官方博客', lang: 'EN' },
    { n: 'Anthropic Research', d: '对齐、可解释性与 Agent 研究', u: 'https://www.anthropic.com/research', t: '官方博客', lang: 'EN' },
    { n: 'Google DeepMind Blog', d: '基础研究与科学突破', u: 'https://deepmind.google/discover/blog', t: '官方博客', lang: 'EN' },
    { n: 'Google Research Blog', d: '谷歌研究院最新成果', u: 'https://research.google/blog', t: '官方博客', lang: 'EN' },
    { n: 'BAIR Blog', d: '伯克利 AI 研究实验室博客', u: 'https://bair.berkeley.edu/blog', t: '实验室', lang: 'EN' },
    { n: 'fast.ai', d: '自上而下的实用深度学习课程', u: 'https://www.fast.ai', t: '课程', lang: 'EN' },
    { n: '机器之心', d: '中文 AI 深度解读与论文速递', u: 'https://www.jiqizhixin.com', t: '媒体', lang: 'ZH' },
    { n: '量子位', d: '中文 AI 产品与模型动态', u: 'https://www.qbitai.com', t: '媒体', lang: 'ZH' },
  ],

  papers: [
    { n: 'Attention Is All You Need', d: 'Transformer 架构的开山之作，现代大模型的基础', u: 'https://arxiv.org/abs/1706.03762', y: '2017', t: '架构', b: '必读' },
    { n: 'BERT: Pre-training of Deep Bidirectional Transformers', d: '预训练 + 微调范式的确立', u: 'https://arxiv.org/abs/1810.04805', y: '2018', t: '预训练' },
    { n: 'Language Models are Few-Shot Learners (GPT-3)', d: '展现大规模模型的上下文学习能力', u: 'https://arxiv.org/abs/2005.14165', y: '2020', t: 'LLM' },
    { n: 'Scaling Laws for Neural Language Models', d: '模型规模、数据与算力的可预测关系', u: 'https://arxiv.org/abs/2001.08361', y: '2020', t: 'Scaling' },
    { n: 'Retrieval-Augmented Generation (RAG)', d: '把外部知识检索接入生成模型', u: 'https://arxiv.org/abs/2005.11401', y: '2020', t: 'RAG', b: '必读' },
    { n: 'LoRA: Low-Rank Adaptation', d: '低成本微调大模型的标准做法', u: 'https://arxiv.org/abs/2106.09685', y: '2021', t: '微调' },
    { n: 'Learning Transferable Visual Models (CLIP)', d: '图文对比学习，多模态的基石', u: 'https://arxiv.org/abs/2103.00020', y: '2021', t: '多模态' },
    { n: 'Chain-of-Thought Prompting', d: '让模型显式推理，显著提升复杂任务表现', u: 'https://arxiv.org/abs/2201.11903', y: '2022', t: '推理' },
    { n: 'Training Language Models to Follow Instructions (InstructGPT)', d: 'RLHF 对齐的经典流程', u: 'https://arxiv.org/abs/2203.02155', y: '2022', t: '对齐' },
    { n: 'FlashAttention', d: 'IO 感知的精确注意力，训练与推理提速', u: 'https://arxiv.org/abs/2205.14135', y: '2022', t: '系统' },
    { n: 'Training Compute-Optimal LLMs (Chinchilla)', d: '重新定义参数量与训练数据的最优配比', u: 'https://arxiv.org/abs/2203.15556', y: '2022', t: 'Scaling' },
    { n: 'High-Resolution Image Synthesis with Latent Diffusion', d: '潜空间扩散，开源生图的技术底座', u: 'https://arxiv.org/abs/2112.10752', y: '2022', t: '多模态' },
    { n: 'ReAct: Synergizing Reasoning and Acting in LLMs', d: 'Agent 的推理 + 工具调用范式', u: 'https://arxiv.org/abs/2210.03629', y: '2022', t: 'Agent', b: '必读' },
    { n: 'Toolformer', d: '让模型自己学会调用外部 API', u: 'https://arxiv.org/abs/2302.04761', y: '2023', t: 'Agent' },
    { n: 'LLaMA: Open and Efficient Foundation Language Models', d: '开源大模型生态的起点', u: 'https://arxiv.org/abs/2302.13971', y: '2023', t: '开源模型' },
    { n: 'QLoRA', d: '4-bit 量化 + LoRA，单卡微调大模型', u: 'https://arxiv.org/abs/2305.14314', y: '2023', t: '微调' },
    { n: 'Direct Preference Optimization (DPO)', d: '不训练奖励模型的偏好对齐方法', u: 'https://arxiv.org/abs/2305.18290', y: '2023', t: '对齐' },
    { n: 'Mamba: Linear-Time Sequence Modeling', d: '状态空间模型挑战 Transformer', u: 'https://arxiv.org/abs/2312.00752', y: '2023', t: '架构' },
    { n: 'Self-RAG', d: '让模型自己决定何时检索、如何反思', u: 'https://arxiv.org/abs/2310.11511', y: '2023', t: 'RAG' },
    { n: 'DeepSeek-R1: Incentivizing Reasoning via RL', d: '强化学习激发推理能力的开源实践', u: 'https://arxiv.org/abs/2501.12948', y: '2025', t: '推理' },
  ],

  featured: {
    mcp: {
      title: 'MCP 生态', subtitle: 'Model Context Protocol · 让 AI 连接真实世界的开放标准',
      intro: 'MCP 是 Anthropic 在 2024 年开源的模型上下文协议，用统一方式把工具、数据源、工作流接入 AI 应用。下面是官方规范、服务端实现、目录站与客户端。',
      links: [
        { n: 'MCP 官方网站', d: '协议介绍、快速开始与规范入口', u: 'https://modelcontextprotocol.io', t: '官网' },
        { n: 'MCP Specification', d: '最新协议规范原文', u: 'https://modelcontextprotocol.io/specification/latest', t: '规范' },
        { n: 'modelcontextprotocol/servers', d: '官方参考服务端集合（Filesystem / Git / Fetch / Memory 等）', u: 'https://github.com/modelcontextprotocol/servers', t: '开源' },
        { n: 'GitHub MCP Server', d: '官方 GitHub MCP 服务端', u: 'https://github.com/github/github-mcp-server', t: '开源' },
        { n: 'Playwright MCP', d: '微软出品，让 Agent 操作浏览器', u: 'https://github.com/microsoft/playwright-mcp', t: '开源' },
        { n: 'Smithery', d: 'MCP 服务端目录与托管', u: 'https://smithery.ai', t: '目录' },
        { n: 'mcp.so', d: '社区维护的 MCP Server 导航', u: 'https://mcp.so', t: '目录' },
        { n: 'Glama MCP', d: '可按能力检索的 MCP 目录', u: 'https://glama.ai/mcp', t: '目录' },
        { n: 'MCP Servers', d: '另一个轻量 MCP 目录站', u: 'https://mcpservers.org', t: '目录' },
        { n: 'Claude Desktop', d: '最早支持 MCP 的桌面客户端', u: 'https://claude.ai/download', t: '客户端' },
      ]
    },
    skills: {
      title: 'Skills 技能包', subtitle: '把经验写成 SKILL.md，让 Agent 按需加载',
      intro: 'Skills 是给 AI Agent 复用的「能力包」：一个文件夹 + 一份 SKILL.md 说明，加上脚本与参考资料，Agent 在合适的任务里自动调用。下面是官方仓库、规范与社区资源。',
      links: [
        { n: 'anthropics/skills', d: 'Anthropic 官方示例技能库', u: 'https://github.com/anthropics/skills', t: '官方' },
        { n: 'Agent Skills 文档', d: '技能的结构、写法与最佳实践', u: 'https://docs.claude.com/en/docs/agents-and-tools/agent-skills', t: '规范' },
        { n: 'Claude Code', d: '原生支持 Skills 的终端编码代理', u: 'https://github.com/anthropics/claude-code', t: '客户端' },
        { n: 'Claude Code 文档', d: 'Skills / 插件 / Hooks 官方说明', u: 'https://docs.claude.com/en/docs/claude-code/overview', t: '文档' },
        { n: 'WorkBuddy 技能文档', d: '国内 Agent 产品的技能体系与用法', u: 'https://www.workbuddy.cn/docs/workbuddy/Overview', t: '文档' },
        { n: 'Prompt Engineering Guide', d: '提示词与技能设计的系统性资料', u: 'https://www.promptingguide.ai', t: '教程' },
      ]
    },
    agent: {
      title: 'AI Agent', subtitle: '从会聊天，到会做事',
      intro: 'Agent = 模型 + 工具 + 记忆 + 规划。这里收录主流的开源智能体框架、编码代理、浏览器代理以及编排平台。',
      links: [
        { n: 'LangGraph', d: '用图结构编排有状态的 Agent 工作流', u: 'https://github.com/langchain-ai/langgraph', t: '框架' },
        { n: 'CrewAI', d: '多智能体角色协作框架', u: 'https://github.com/crewAIInc/crewAI', t: '框架' },
        { n: 'AutoGen', d: '微软多智能体对话框架', u: 'https://github.com/microsoft/autogen', t: '框架' },
        { n: 'OpenHands', d: '开源的全能软件开发 Agent 平台', u: 'https://github.com/All-Hands-AI/OpenHands', t: '编码' },
        { n: 'browser-use', d: '让 LLM 自主操作浏览器', u: 'https://github.com/browser-use/browser-use', t: '浏览器' },
        { n: 'SWE-agent', d: '自动修复 GitHub Issue 的研究型代理', u: 'https://github.com/SWE-agent/SWE-agent', t: '编码' },
        { n: 'AutoGPT', d: '最早的自主任务 Agent 之一', u: 'https://github.com/Significant-Gravitas/AutoGPT', t: '经典' },
        { n: 'MetaGPT', d: '把 SOP 写进多智能体协作', u: 'https://github.com/geekan/MetaGPT', t: '框架' },
        { n: 'Dify', d: '可视化 Agent / 工作流编排平台', u: 'https://github.com/langgenius/dify', t: '平台' },
        { n: 'n8n', d: '带 AI 节点的通用自动化平台', u: 'https://github.com/n8n-io/n8n', t: '平台' },
      ]
    },
    opensource: {
      title: '开源精选', subtitle: '如何判断一个仓库值不值得用',
      intro: 'Star 数只是起点。我们额外关注：最近提交时间、Issue 响应、许可证是否清晰、文档与示例是否完整、是否有活跃的贡献者。下面的清单帮你建立自己的判断标准。',
      links: [
        { n: 'Open Source Guides', d: 'GitHub 官方开源参与指南', u: 'https://opensource.guide', t: '指南' },
        { n: 'Choose a License', d: '一分钟选对开源许可证', u: 'https://choosealicense.com', t: '许可证' },
        { n: 'First Contributions', d: '手把手完成第一次开源贡献', u: 'https://github.com/firstcontributions/first-contributions', t: '入门' },
        { n: 'GitHub Trending', d: '官方每日 / 每周趋势榜', u: 'https://github.com/trending', t: '榜单' },
        { n: 'GitHub Topics', d: '按主题浏览官方分类', u: 'https://github.com/topics', t: '分类' },
        { n: 'Awesome Lists', d: '各类高质量资源清单的索引', u: 'https://github.com/sindresorhus/awesome', t: '清单' },
        { n: 'CHAOSS', d: '开源项目健康度度量体系', u: 'https://chaoss.community', t: '度量' },
        { n: 'OpenSSF Scorecard', d: '自动化评估仓库安全健康分', u: 'https://securityscorecards.dev', t: '安全' },
      ]
    },
  },

  // 星标分层（前端筛选与榜单共用）
  tiers: [
    { key: '100k', label: '10 万星以上', min: 100000, desc: '改变行业的基础设施', color: '#FF375F' },
    { key: '50k', label: '5 万星以上', min: 50000, desc: '被广泛采用的主流项目', color: '#FF9F0A' },
    { key: '10k', label: '1 万星以上', min: 10000, desc: '成熟稳定的热门选择', color: '#7C5CFF' },
    { key: '5k', label: '5 千星以上', min: 5000, desc: '口碑良好的成长型项目', color: '#0A84FF' },
    { key: '1k', label: '1 千星以上', min: 1000, desc: '值得关注的潜力股', color: '#30B0C7' },
    { key: 'all', label: '全部项目', min: 0, desc: '索引内所有开源仓库', color: '#8E8E93' },
  ],
};
