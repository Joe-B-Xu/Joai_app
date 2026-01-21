import { KnowledgePoint, DailyStats, Sentence, ScenarioTemplate, ListeningCategory, ListeningExercise, ShadowingItem, PatternDrill, RoleplayScenario } from './types';

export const MOCK_STATS: DailyStats = {
  reviewed: 12,
  newLearned: 5,
  streak: 14,
  totalDue: 12,
};

// Database converted to a Dictionary (Key-Value Store)
export const DICTIONARY: Record<number, KnowledgePoint> = {
  // --- N5 Data ---
  5001: {
    id: 5001, type: 'vocab', level: 'N5', tag_freq: 'High', is_eju: false, scenario: 'life',
    surface_jp: '猫', reading: 'ねこ', pos: '名詞', meaning_zh: '猫',
    meaning_jp: '食肉目ネコ科の哺乳類。',
    examples: [{ jp: '<b>猫</b>が好きです。', zh: '我喜欢猫。' }]
  },
  5002: {
    id: 5002, type: 'vocab', level: 'N5', tag_freq: 'High', is_eju: false, scenario: 'life',
    surface_jp: '食べる', reading: 'たべる', pos: '動2', meaning_zh: '吃',
    meaning_jp: '食物をかんで飲み込む。',
    examples: [{ jp: 'ご飯を<b>食べる</b>。', zh: '吃饭。' }]
  },
  
  // --- N2/N3 Academic Vocab (EJU Focus) ---
  5570: {
    id: 5570, type: 'vocab', level: 'N2', tag_freq: 'Mid', is_eju: true, scenario: 'academic',
    surface_jp: '短縮', reading: 'たんしゅく', pos: '名・自他動3', meaning_zh: '缩短，缩减',
    meaning_jp: '時間や距離などを短く縮めること。',
    meaning_zh_detail: '反义：延长。多用于时间、距离等抽象概念。',
    examples: [{ jp: '時間を<b>短縮</b>する。', zh: '缩短时间。' }]
  },
  1023: {
    id: 1023, type: 'vocab', level: 'N3', tag_freq: 'High', is_eju: true, scenario: 'academic',
    surface_jp: '提出', reading: 'ていしゅつ', pos: '名・他動3', meaning_zh: '提交',
    meaning_jp: '書類や資料などを差し出すこと。',
    meaning_zh_detail: '向官方、上级或学校提交文件、报告等。',
    examples: [{ jp: 'レポートを先生に提出した。', zh: '把报告交给了老师。' }]
  },
  1030: {
    id: 1030, type: 'vocab', level: 'N3', tag_freq: 'High', is_eju: true, scenario: 'academic',
    surface_jp: '制限', reading: 'せいげん', pos: '名・他動3', meaning_zh: '限制',
    meaning_jp: '限界を定めること。',
    examples: [{ jp: '時間を制限する。', zh: '限制时间。' }]
  },
  
  // --- Grammar ---
  315: {
    id: 315, type: 'grammar', level: 'N2', is_eju: true, scenario: 'academic',
    form_jp: '～に従って', pattern_jp: '動辞書形/名＋に従って',
    meaning_zh: '按照……；根据……',
    meaning_jp: '～とおりに',
    notes_zh: '表示服从某规则、指示。',
    examples: [{ jp: 'ルール<b>に従って</b>行動する。', zh: '按照规则行动。' }]
  },
  405: {
    id: 405, type: 'grammar', level: 'N2', is_eju: true, scenario: 'life',
    form_jp: '～に対して', pattern_jp: '名詞＋に対して',
    meaning_zh: '对于…；针对…',
    meaning_jp: '～に向かって',
    notes_zh: '表示动作的对象。',
    examples: [{ jp: '先生<b>に対して</b>敬語を使う。', zh: '对老师使用敬语。' }]
  },
  413: {
    id: 413, type: 'grammar', level: 'N2', is_eju: false, scenario: 'life',
    form_jp: '～に違いない', pattern_jp: '普通形＋に違いない',
    meaning_zh: '一定…',
    meaning_jp: 'きっと～だと思う',
    notes_zh: '表示确信度很高的推测。',
    examples: [{ jp: '彼は来る<b>に違いない</b>。', zh: '他一定会来。' }]
  },
  // Extra vocab for listening demo
  7001: {
    id: 7001, type: 'vocab', level: 'N2', tag_freq: 'High', is_eju: true, scenario: 'academic',
    surface_jp: '光合成', reading: 'こうごうせい', pos: '名', meaning_zh: '光合作用',
    examples: [{ jp: '植物は光合成を行う。', zh: '植物进行光合作用。' }]
  },
  7002: {
    id: 7002, type: 'vocab', level: 'N2', tag_freq: 'Mid', is_eju: true, scenario: 'academic',
    surface_jp: '仕組み', reading: 'しくみ', pos: '名', meaning_zh: '机制，结构',
    examples: [{ jp: '体の仕組みを学ぶ。', zh: '学习身体的机制。' }]
  },
  // Extra vocab for Speaking
  8001: {
    id: 8001, type: 'vocab', level: 'N4', tag_freq: 'High', is_eju: false, scenario: 'life',
    surface_jp: '頭が痛い', reading: 'あたまがいたい', pos: 'フレーズ', meaning_zh: '头痛',
    examples: []
  }
};

// --- NEW: Sentence Database (The Core Learning Unit) ---
export const SENTENCES: Sentence[] = [
  {
    id: 9001,
    original: "教授の指示に従って、レポートを提出しなければなりません。",
    translation: "必须按照教授的指示提交报告。",
    scenario: 'academic',
    targetIds: [315, 1023], // Contains "に従って" (315) and "提出" (1023)
    segments: [
      { text: "教授の指示" },
      { text: "に従って", linkedItemId: 315, type: 'grammar' },
      { text: "、" },
      { text: "レポートを" },
      { text: "提出", linkedItemId: 1023, type: 'vocab' },
      { text: "しなければなりません。" }
    ]
  },
  {
    id: 9002,
    original: "時間の短縮のために、昼休みを制限することに対して反対の声が上がった。",
    translation: "为了缩短时间而限制午休，对此出现了反对的声音。",
    scenario: 'academic',
    targetIds: [5570, 1030, 405], // 短縮(5570), 制限(1030), に対して(405)
    segments: [
      { text: "時間の" },
      { text: "短縮", linkedItemId: 5570, type: 'vocab' },
      { text: "のために、昼休みを" },
      { text: "制限", linkedItemId: 1030, type: 'vocab' },
      { text: "すること" },
      { text: "に対して", linkedItemId: 405, type: 'grammar' },
      { text: "反対の声が上がった。" }
    ]
  },
  {
    id: 9003,
    original: "あの猫は毎日ここに来るから、近所の人が餌をあげているに違いない。",
    translation: "那只猫每天都来这里，肯定是附近的居民在喂它。",
    scenario: 'life',
    targetIds: [5001, 413], // 猫(5001), に違いない(413)
    segments: [
      { text: "あの" },
      { text: "猫", linkedItemId: 5001, type: 'vocab' },
      { text: "は毎日ここに来るから、近所の人が餌をあげている" },
      { text: "に違いない", linkedItemId: 413, type: 'grammar' },
      { text: "。" }
    ]
  }
];

// --- NEW: Life Scenario Templates ---
export const LIFE_SCENARIOS: ScenarioTemplate[] = [
  {
    id: 'rent',
    title: '租房咨询',
    iconId: 'home',
    goal: '向房产中介传达预算、地点偏好，并询问费用明细。',
    color: 'bg-orange-500',
    keywords: [
      { id: 6001, jp: '家賃', kana: 'やちん', zh: '房租', type: 'vocab', tags: ['reading', 'listening', 'speaking'] },
      { id: 6002, jp: '敷金・礼金', kana: 'しききん・れいきん', zh: '押金和礼金', type: 'vocab', tags: ['reading', 'listening'] },
      { id: 6003, jp: '徒歩～分', kana: 'とほ～ふん', zh: '步行...分钟', type: 'vocab', tags: ['reading'] },
      { id: 6004, jp: '～てほしい', kana: '～てほしい', zh: '希望...', type: 'grammar', tags: ['speaking'] }
    ],
    followUp: ['初期費用はいくらですか？', '保証人は必要ですか？', '内見はできますか？']
  },
  {
    id: 'hospital',
    title: '医院就诊',
    iconId: 'hospital',
    goal: '描述症状（发烧、疼痛），听懂医生的服药指示。',
    color: 'bg-red-500',
    keywords: [
      { id: 6101, jp: '症状', kana: 'しょうじょう', zh: '症状', type: 'vocab', tags: ['speaking', 'listening'] },
      { id: 6102, jp: '熱がある', kana: 'ねつがある', zh: '发烧', type: 'vocab', tags: ['speaking', 'listening'] },
      { id: 6103, jp: '食後', kana: 'しょくご', zh: '饭后', type: 'vocab', tags: ['listening', 'reading'] },
      { id: 6104, jp: '～ないでください', kana: '～ないでください', zh: '请不要...', type: 'grammar', tags: ['listening'] }
    ],
    followUp: ['薬はいつ飲みますか？', '保険証を持っていますか？']
  },
  {
    id: 'work',
    title: '打工面试',
    iconId: 'work',
    goal: '自我介绍，确认排班时间和时薪，询问交通费。',
    color: 'bg-blue-500',
    keywords: [
      { id: 6201, jp: 'シフト', kana: 'しふと', zh: '排班', type: 'vocab', tags: ['speaking', 'listening'] },
      { id: 6202, jp: '時給', kana: 'じきゅう', zh: '时薪', type: 'vocab', tags: ['reading', 'listening'] },
      { id: 6203, jp: '交通費', kana: 'こうつうひ', zh: '交通费', type: 'vocab', tags: ['reading', 'listening'] },
      { id: 6204, jp: '～ことができます', kana: '～ことができます', zh: '能够...', type: 'grammar', tags: ['speaking'] }
    ],
    followUp: ['週に何回入れますか？', 'いつから働けますか？']
  },
  {
    id: 'mail',
    title: '教授邮件',
    iconId: 'mail',
    goal: '礼貌地向教授请假或询问报告截止日期。',
    color: 'bg-indigo-500',
    keywords: [
      { id: 6301, jp: '休講', kana: 'きゅうこう', zh: '停课', type: 'vocab', tags: ['reading'] },
      { id: 6302, jp: '締め切り', kana: 'しめきり', zh: '截止日期', type: 'vocab', tags: ['reading', 'listening'] },
      { id: 6303, jp: '件名', kana: 'けんめい', zh: '邮件标题', type: 'vocab', tags: ['reading'] },
      { id: 6304, jp: '～させていただきます', kana: '～させていただきます', zh: '请允许我...', type: 'grammar', tags: ['reading'] }
    ],
    followUp: ['返信は必要ですか？', '添付ファイルを確認してください。']
  }
];

// --- NEW: Listening Categories ---
export const LISTENING_CATEGORIES: ListeningCategory[] = [
  { id: 'task', name: '課題理解 (Task)', type: 'question_type', count: 15, accuracy: 85, color: 'bg-indigo-500' },
  { id: 'point', name: 'ポイント理解 (Point)', type: 'question_type', count: 8, accuracy: 60, color: 'bg-blue-500' },
  { id: 'summary', name: '概要理解 (Summary)', type: 'question_type', count: 5, accuracy: 70, color: 'bg-sky-500' },
  { id: 'bio', name: '生物・医学 (Bio/Med)', type: 'topic', count: 12, accuracy: 55, color: 'bg-emerald-500' },
  { id: 'eco', name: '経済・社会 (Eco/Soc)', type: 'topic', count: 20, accuracy: 90, color: 'bg-amber-500' },
];

// --- NEW: Listening Exercises ---
export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: 1001,
    title: "植物の光合成の仕組み",
    categoryIds: ['point', 'bio'],
    level: 'N2',
    audioText: "今日は植物の光合成について話をします。光合成とは、植物が光のエネルギーを使って、水と二酸化炭素から栄養を作り出す仕組みのことです。この過程で酸素が出されますが、これが私たち動物にとって非常に重要です。最近の研究では、この仕組みを人工的に再現しようという試みも進んでいます。",
    summaryQuestion: {
      question: "この話の主なテーマは何ですか？",
      options: [
        "植物の種類について",
        "光合成の基本的な仕組みと重要性",
        "動物の呼吸の方法",
        "最新の農業技術"
      ],
      correctIndex: 1,
      explanation: "話者は最初に「今日は植物の光合成について話をします」と述べており、その後仕組みと重要性を説明しているため。"
    },
    script: [
      { id: 1, text: "今日は植物の光合成について話をします。", translation: "今天来讲讲植物的光合作用。", keywords: [7001] },
      { id: 2, text: "光合成とは、植物が光のエネルギーを使って、水と二酸化炭素から栄養を作り出す仕組みのことです。", translation: "所谓光合作用，是指植物利用光能，从水和二氧化碳中制造营养的机制。", keywords: [7002] },
      { id: 3, text: "この過程で酸素が出されますが、これが私たち動物にとって非常に重要です。", translation: "在这个过程中会释放出氧气，这对我们动物来说非常重要。", keywords: [] },
      { id: 4, text: "最近の研究では、この仕組みを人工的に再現しようという試みも進んでいます。", translation: "最近的研究中，也在进行人工再现这一机制的尝试。", keywords: [] }
    ]
  }
];

// --- NEW: Speaking Practice Data ---
export const SPEAKING_SHADOWING_DATA: ShadowingItem[] = [
  {
    id: 1,
    text: "近所の人が餌をあげているに違いない。",
    translation: "肯定是附近的邻居在喂它。",
    focusPoints: ["'に違いない' 的断句", "'あげて' 的语调上扬"]
  },
  {
    id: 2,
    text: "教授の指示に従ってレポートを提出した。",
    translation: "按照教授的指示提交了报告。",
    focusPoints: ["'に従って' 后的停顿", "'提出' 的长音节奏"]
  }
];

export const SPEAKING_DRILLS: PatternDrill[] = [
  {
    id: 1,
    grammarPoint: "～に違いない",
    skeleton: "X は Y に違いない。",
    variations: [
       { cue: "彼 / 犯人", expected: "彼は犯人に違いない。" },
       { cue: "あの店 / 美味しい", expected: "あの店は美味しいに違いない。" },
       { cue: "明日 / 雨", expected: "明日は雨に違いない。" }
    ]
  },
  {
    id: 2,
    grammarPoint: "～に従って",
    skeleton: "X に従って Y する。",
    variations: [
       { cue: "ルール / 行動", expected: "ルールに従って行動する。" },
       { cue: "指示 / 動く", expected: "指示に従って動く。" }
    ]
  }
];

export const SPEAKING_ROLEPLAYS: RoleplayScenario[] = [
  {
    id: 1,
    title: "病院 (Hospital)",
    context: "你在医院挂号。你需要说明你头痛且发烧。",
    aiFirstMessage: "今日はどうされましたか？",
    mission: { vocabIds: [8001], grammarIds: [6104] }, // Mock IDs
    expectedIntent: "Explain symptoms (headache, fever)"
  }
];

export const getAllItems = (): KnowledgePoint[] => Object.values(DICTIONARY);

// Helper to get items by type
export const getItemsByType = (type: 'vocab' | 'grammar'): KnowledgePoint[] => {
  return getAllItems().filter(item => item.type === type);
};

// Helper: Get Sentences filtered by scenario
export const getSentencesByScenario = (scenario: 'life' | 'academic' | 'all'): Sentence[] => {
  if (scenario === 'all') return SENTENCES;
  return SENTENCES.filter(s => s.scenario === scenario);
};
