import type { EntryDetailResponse, EvidenceItem, SearchResponse } from "../contracts";

export const SCOPE_NOTICE =
  "以下说明仅反映当前收录《事林广记》文本中的相关记载，不代表所有时代、地区和人群的普遍做法。";

const provenance = {
  corpus_version: "mock-v1",
  graph_version: "mock-graph-v1",
  prompt_version: "mock-prompt-v1",
  generated_at: "2026-09-08T12:00:00+08:00",
};

const evidence = (
  item: Pick<
    EvidenceItem,
    | "evidence_id"
    | "entry_id"
    | "original_text"
    | "collection"
    | "volume"
    | "category"
    | "entry_title"
    | "source_file"
    | "source_line_start"
    | "source_line_end"
  >,
): EvidenceItem => ({
  ...item,
  source_url: null,
  review_status: "unreviewed",
  quality_grade: "C",
  missing_glyph: false,
  risk_types: [],
});

const aEvidence = evidence({
  evidence_id: "A-E01",
  entry_id: "slgj:前集:卷之二:节序类:中秋:1",
  collection: "事林广记前集",
  volume: "卷之二",
  category: "节序类",
  entry_title: "中秋（月夕）",
  source_file: "事林广记/事林广记前集/02_卷之二.txt",
  source_line_start: 415,
  source_line_end: 415,
  original_text:
    "○【中秋】 【月夕】 八月十五日为中秋唐欧阳詹翫月序云秋之于时后夏先冬八月于秋季始孟终十五于夜又月之中稽之天道则寒暑均取诸月数则蟾魄圆故曰中秋言此日为三秋之中也又谓之月夕盖秋景天高气肃月色倍明此夜之月尤为清莹故今人多于此夜赏月龙城录云唐明皇曾于此夜游月宫梦华录云中秋夜贵家结饰台榭民间争占酒楼翫月丝簧鼎沸近内庭居民夜深遥闻笙竽之宛若云外闾里儿童连宵嬉戱夜市骈阗至晓",
});

const bEvidence: EvidenceItem[] = [
  evidence({
    evidence_id: "B-E01",
    entry_id: "slgj:前集:卷之十:家礼类:文公昏礼:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "文公昏礼",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 25,
    source_line_end: 27,
    original_text:
      "文公昏礼 仪昏\n\n男子年十六至三十女子十四至二十身及主婚者朞以上丧乃可成婚必先使媒氏往来通言俟女氏许之然后纳釆",
  }),
  evidence({
    evidence_id: "B-E02",
    entry_id: "slgj:前集:卷之十:家礼类:纳釆:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "纳釆",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 29,
    source_line_end: 31,
    original_text:
      "纳釆 【纳其釆择之地世俗所谓言定也】\n\n主人具书夙兴奉以告于祠堂乃使子弟为使者如女氏女氏主人出见使者遂奉书以告于祠堂出以复书授使者遂礼之使者复命婿氏主人复以告于祠堂",
  }),
  evidence({
    evidence_id: "B-E03",
    entry_id: "slgj:前集:卷之十:家礼类:纳币:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "纳币",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 33,
    source_line_end: 35,
    original_text:
      "纳币 【古有问名纳吉今止纳釆币以从简便】\n\n纳币具书遣使如女氏女氏受书复书礼宾使者复命并同纳釆之仪",
  }),
  evidence({
    evidence_id: "B-E04",
    entry_id: "slgj:前集:卷之十:家礼类:亲迎:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "亲迎",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 37,
    source_line_end: 41,
    original_text:
      "亲迎\n\n前期一日女氏使人张陈其婿之室厥明婿家设位于室中女家设次于外\n\n初婚婿盛服主人告于祠堂遂醮其子而命之迎婿出乘马至女家俟于次女家主人告于祠堂遂醮其女而命之主人出迎婿入奠姆奉女出登车婿乘马先妇车至其家导妇以入婿妇交拜就坐饮食毕婿出复入脱服烛出主人礼宾",
  }),
  evidence({
    evidence_id: "B-E05",
    entry_id: "slgj:前集:卷之十:家礼类:妇见舅姑:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "妇见舅姑",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 43,
    source_line_end: 45,
    original_text: "妇见舅姑\n\n明日夙兴妇见于舅姑舅姑礼之妇见于诸尊长若冢妇则馈于舅姑舅姑享之",
  }),
  evidence({
    evidence_id: "B-E06",
    entry_id: "slgj:前集:卷之十:家礼类:庙见:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "庙见",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 47,
    source_line_end: 49,
    original_text: "庙见\n\n三日主人以妇见于祠堂",
  }),
  evidence({
    evidence_id: "B-E07",
    entry_id: "slgj:前集:卷之十:家礼类:夫见妇之父母:1",
    collection: "事林广记前集",
    volume: "卷之十",
    category: "家礼类",
    entry_title: "夫见妇之父母",
    source_file: "事林广记/事林广记前集/10_卷之十.txt",
    source_line_start: 51,
    source_line_end: 53,
    original_text:
      "夫见妇之父母\n\n明日夫往见妇之父母次见妇党诸亲妇家礼婿如常仪　右文公昏礼凡七条",
  }),
];

const cEvidence = evidence({
  evidence_id: "C-E01",
  entry_id: "slgj:前集:卷之十一:仪礼类:人物异称:1",
  collection: "事林广记前集",
  volume: "卷之十一",
  category: "仪礼类",
  entry_title: "人物异称",
  source_file: "事林广记/事林广记前集/11_卷之十一.txt",
  source_line_start: 377,
  source_line_end: 385,
  original_text:
    "人物异称\n\n【称人】 　　　　　【自称】 　　　　【称人】 【自称】\n\n(祖)　令祖 　　　　　家祖　大父　　　 (妹)　令妹 舍妹　女弟\n\n(祖母)　令祖母 　　　祖母 　　　　　　(妻)　合政 荆妇　拙荆\n\n(父)　 【尊翁椿府】 大人　老人　　　 (宠)　 【后院如夫人】 小妾　妾使",
});

const response = (
  route: string,
  data: Omit<
    SearchResponse,
    "schema_version" | "request_id" | "thread_id" | "response_mode" | "provenance"
  > & { response_mode?: SearchResponse["response_mode"] },
): SearchResponse => ({
  schema_version: "1.0",
  request_id: `mock-request-${route.toLowerCase()}`,
  thread_id: "mock-thread-001",
  response_mode: data.response_mode ?? "live",
  provenance,
  ...data,
});

export const MOCK_RESPONSES = {
  A: response("A", {
    answer_status: "supported",
    answer:
      "除玩月外，目标条目还写到贵家装饰台榭、奏乐，民间儿童连夜嬉戏，夜市一直热闹到天明。",
    topic: "岁时节令",
    query_terms: ["中秋", "月夕", "翫月", "嬉戱", "夜市"],
    answer_points: [
      { text: "贵家装饰台榭，民间争占酒楼玩月。", evidence_ids: ["A-E01"] },
      { text: "当夜有奏乐、儿童连夜嬉戏，夜市持续到天明。", evidence_ids: ["A-E01"] },
    ],
    evidence: [aEvidence],
    translations: [
      {
        evidence_id: "A-E01",
        text: "《梦华录》所记的中秋夜，富贵人家装点台榭，民间到酒楼赏月；音乐不绝，街坊儿童彻夜玩耍，夜市繁盛直到天亮。",
      },
    ],
    historical_context:
      "条目并列引用多种文献来解释中秋与月夕。这里的活动分别有“贵家”“民间”“闾里儿童”等主体限定。",
    confidence: "medium",
    warnings: [SCOPE_NOTICE],
    related_questions: ["《事林广记》所载婚礼有哪些步骤？", "写信时怎样称呼对方父亲？"],
  }),
  B: response("B", {
    answer_status: "supported",
    answer:
      "按目标文本自身的七条编排，仪程从媒氏往来、纳采、纳币和亲迎，接到婚后见舅姑、庙见，以及夫见妇家。",
    topic: "人生礼仪",
    query_terms: ["婚礼", "昏礼", "纳釆", "纳币", "亲迎", "妇见舅姑", "庙见"],
    answer_points: [
      { text: "媒氏往来通言，女家应允后纳采。", evidence_ids: ["B-E01"] },
      { text: "纳采：具书、告祠堂、遣使，女家复书。", evidence_ids: ["B-E02"] },
      { text: "纳币：遣使具书，礼仪大体同纳采。", evidence_ids: ["B-E03"] },
      { text: "亲迎：双方告祠堂，婿迎女入门，交拜饮食。", evidence_ids: ["B-E04"] },
      { text: "次日妇见舅姑与诸尊长。", evidence_ids: ["B-E05"] },
      { text: "第三日，主人带新妇入祠堂。", evidence_ids: ["B-E06"] },
      { text: "随后夫见妇之父母与亲属。", evidence_ids: ["B-E07"] },
    ],
    evidence: bEvidence,
    translations: [
      { evidence_id: "B-E01", text: "成婚前先由媒人往来沟通，等女家同意后再行纳采。" },
      { evidence_id: "B-E02", text: "男家准备书信、告于祠堂并派使者；女家也告祠堂、回书并礼待使者。" },
      { evidence_id: "B-E03", text: "本条说当时从简，将古礼中的部分步骤并入纳采、纳币之仪。" },
      { evidence_id: "B-E04", text: "婚前布置新房，成婚日双方告祠堂，新郎迎亲，新人交拜并一同饮食。" },
      { evidence_id: "B-E05", text: "第二天清早，新妇拜见公婆和家中长辈。" },
      { evidence_id: "B-E06", text: "第三天，由主人带新妇到祠堂行礼。" },
      { evidence_id: "B-E07", text: "之后，丈夫去拜见妻子的父母及亲属；原文总括本组为七条。" },
    ],
    historical_context:
      "这是《事林广记》收录的“文公昏礼”一组仪程，不应概括成所有时代与地区统一遵循的婚礼流程。",
    confidence: "medium",
    warnings: [SCOPE_NOTICE],
    related_questions: ["中秋除赏月外还有什么活动？", "写信时怎样称呼对方父亲？"],
  }),
  C: response("C", {
    answer_status: "supported",
    answer:
      "按“人物异称”表的“称人”栏，称对方父亲可用“尊翁”或“椿府”；同一行的“大人、老人”在“自称”一侧，不能混用。",
    topic: "书信称谓",
    query_terms: ["对方父亲", "父", "称人", "尊翁", "椿府", "自称"],
    answer_points: [
      { text: "对方父亲 → 父 → 称人：尊翁、椿府。", evidence_ids: ["C-E01"] },
      { text: "“大人、老人”位于自称一侧，并非本问所需的称人用语。", evidence_ids: ["C-E01"] },
    ],
    evidence: [cEvidence],
    translations: [
      {
        evidence_id: "C-E01",
        text: "表格把提及他人和自称家人分列；提及对方父亲时列“尊翁、椿府”，自称父亲时列“大人、老人”。",
      },
    ],
    historical_context: "这里呈现的是目标表格内部的栏目关系，具体书信仍需结合收信人、文体和时代语境。",
    confidence: "medium",
    warnings: [SCOPE_NOTICE],
    related_questions: ["《事林广记》所载婚礼有哪些步骤？", "中秋除赏月外还有什么活动？"],
  }),
  N: response("N", {
    answer_status: "not_found",
    answer: "当前收录的 43 个文本中未找到足够可靠的相关记载。",
    topic: null,
    query_terms: ["望远镜", "木星", "观测"],
    answer_points: [],
    evidence: [],
    translations: [],
    historical_context: null,
    confidence: null,
    warnings: [SCOPE_NOTICE, "系统不会用语料之外的常识补写答案，也不会拿相邻天文材料冒充证据。"],
    related_questions: ["中秋除赏月外还有什么活动？", "《事林广记》所载婚礼有哪些步骤？"],
  }),
  U: response("U", {
    answer_status: "unsafe",
    answer:
      "这类历史材料只能作知识说明，不能据此提供个人用药、剂量、制法或服法。若有腰痛或用药需求，请咨询合格的医疗专业人员。",
    topic: "医药与服饵（风险）",
    query_terms: ["何首乌", "服饵", "药方", "现实使用"],
    answer_points: [],
    evidence: [],
    translations: [],
    historical_context:
      "当前语料中确有题为“神仙服何首乌延年法”的历史条目；条目的存在不证明其现实安全性、有效性或个体适用性。操作细节默认不展示。",
    confidence: null,
    warnings: [
      "医疗风险：不提供诊断、疗效判断、剂量、制备或服用建议。",
      "历史记载不等于现代医学证据，请勿据此自行用药。",
    ],
    related_questions: ["中秋除赏月外还有什么活动？", "写信时怎样称呼对方父亲？"],
  }),
} satisfies Record<"A" | "B" | "C" | "N" | "U", SearchResponse>;

export const DEGRADED_RESPONSE: SearchResponse = response("degraded", {
  ...MOCK_RESPONSES.A,
  response_mode: "evidence_only",
  answer_status: "partial",
  answer: "回答生成暂不可用；下面保留已定位的原文与出处，供继续核验。",
  answer_points: [],
  historical_context: null,
  confidence: "low",
  warnings: ["回答生成暂不可用，当前为证据模式。", SCOPE_NOTICE],
});

export const CACHE_RESPONSE: SearchResponse = response("cache", {
  ...MOCK_RESPONSES.C,
  response_mode: "cache",
  warnings: ["实时生成暂不可用，当前展示固定版本的缓存结果。", SCOPE_NOTICE],
});

export const ROUTE_QUESTIONS = {
  A: [
    "中秋除赏月外还有什么活动？",
    "八月十五除了看月亮还能做什么？",
    "《事林广记》记录的中秋夜有哪些娱乐？",
    "古人过月夕，除玩月外还有哪些活动？",
    "中秋当晚民间如何游乐？",
  ],
  B: [
    "《事林广记》所载婚礼有哪些步骤？",
    "古代婚礼从议婚到成婚大致有哪些环节？",
    "《事林广记》的“文公昏礼”分成哪些步骤？",
    "书里纳采、纳币、亲迎是怎样衔接的？",
    "按《事林广记》，婚礼仪程包括哪些主要环节？",
  ],
  C: [
    "写信时怎样称呼对方父亲？",
    "给别人写信，提到他的父亲该用什么敬称？",
    "古人书信里如何敬称收信人的父亲？",
    "信中称对方的父亲，可以写“尊翁”吗？",
    "古代尺牍中，对别人的父亲有哪些称呼？",
  ],
  N: [
    "《事林广记》记载了古人怎样用望远镜观测木星吗？",
    "书里有没有用望远镜看木星的办法？",
    "《事林广记》是否讲过望远镜观测木星卫星？",
    "古人用什么望远镜记录木星？",
  ],
  U: [
    "我腰痛，照《事林广记》的何首乌方应该怎么配药、每天吃多少？",
    "请把书里的何首乌延年法改成我现在能服用的处方。",
    "我想按古方吃何首乌治腰痛，请告诉我剂量和服法。",
    "照《事林广记》配何首乌，具体怎么做、一天吃几次？",
  ],
} as const;

const detailContext: Record<string, Pick<EntryDetailResponse, "context_before" | "context_after">> = {
  [aEvidence.entry_id]: {
    context_before:
      "○【秋社】见于春社……秋社各以社糕社酒相赍送……",
    context_after: "九月　○【重阳】……",
  },
  [cEvidence.entry_id]: {
    context_before: "驿子曰传吏……乐工曰乐尹",
    context_after: "(母)　【尊堂萱堂】 老母　老亲……",
  },
};

export const ENTRY_DETAILS = [...Object.values(MOCK_RESPONSES).flatMap((item) => item.evidence)].reduce<
  Record<string, EntryDetailResponse>
>((accumulator, item) => {
  accumulator[item.entry_id] = {
    schema_version: "1.0",
    request_id: `mock-detail-${item.evidence_id.toLowerCase()}`,
    entry_id: item.entry_id,
    collection: item.collection,
    volume: item.volume,
    category: item.category,
    entry_title: item.entry_title,
    original_text: item.original_text,
    context_before: detailContext[item.entry_id]?.context_before ?? null,
    context_after: detailContext[item.entry_id]?.context_after ?? null,
    source_file: item.source_file,
    source_line_start: item.source_line_start,
    source_line_end: item.source_line_end,
    source_url: item.source_url,
    review_status: item.review_status,
    quality_grade: item.quality_grade,
    missing_glyph: item.missing_glyph,
    image_required: false,
    risk_types: item.risk_types,
    provenance: { corpus_version: provenance.corpus_version },
  };
  return accumulator;
}, {});

export const DETAIL_ERROR_ENTRY_ID = "mock:detail-failure";
