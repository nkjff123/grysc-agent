import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  BookOpenText,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileSearch,
  Landmark,
  Layers3,
  LoaderCircle,
  Menu,
  MessageSquareQuote,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  DataSourceError,
  type AnswerStatus,
  type EntryDetailResponse,
  type EvidenceItem,
  type ResponseMode,
  type SearchDataSource,
  type SearchResponse,
} from "./contracts";
import { searchDataSource } from "./data";

const exampleQuestions = [
  { route: "A", label: "中秋夜还有什么活动？", question: "中秋除赏月外还有什么活动？" },
  { route: "B", label: "婚礼分成哪些步骤？", question: "《事林广记》所载婚礼有哪些步骤？" },
  { route: "C", label: "怎样称呼对方父亲？", question: "写信时怎样称呼对方父亲？" },
  { route: "N", label: "语料没有答案时", question: "《事林广记》记载了古人怎样用望远镜观测木星吗？" },
  {
    route: "U",
    label: "遇到现实用药请求",
    question: "我腰痛，照《事林广记》的何首乌方应该怎么配药、每天吃多少？",
  },
];

const topicCards = [
  { name: "岁时节令", subtitle: "从元旦到除夕", icon: Sparkles, accent: "gold" },
  { name: "人生礼仪", subtitle: "婚仪与家礼", icon: Landmark, accent: "red" },
  { name: "书信称谓", subtitle: "尺牍中的分寸", icon: MessageSquareQuote, accent: "teal" },
  { name: "饮食生活", subtitle: "食材与日用", icon: BookOpenText, accent: "ochre" },
  { name: "农桑花木", subtitle: "顺时而作", icon: Layers3, accent: "green" },
];

const statusMeta: Record<
  AnswerStatus,
  { label: string; short: string; icon: typeof Check; className: string }
> = {
  supported: { label: "证据足以回答", short: "已支持", icon: Check, className: "supported" },
  partial: { label: "仅回答证据覆盖部分", short: "部分支持", icon: CircleAlert, className: "partial" },
  not_found: { label: "当前语料未找到", short: "未找到", icon: FileSearch, className: "not-found" },
  unsafe: { label: "涉及现实使用风险", short: "安全提醒", icon: AlertTriangle, className: "unsafe" },
};

const modeMeta: Record<ResponseMode, { label: string; description: string }> = {
  live: { label: "标准回答", description: "基于当前收录文本" },
  cache: { label: "缓存结果", description: "实时生成不可用" },
  evidence_only: { label: "证据模式", description: "保留可靠原文与出处" },
};

const riskLabels = {
  medical: "医疗",
  ingestion: "食用",
  fire: "明火",
  toxic: "毒性",
  divination: "占卜",
  violence: "暴力",
  image_required: "依赖图像",
} as const;

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      古
    </span>
  );
}

function Header({ hasResult }: { hasResult: boolean }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="古人也搜索首页">
        <BrandMark />
        <span className="brand-copy">
          <strong>古人也搜索</strong>
          <small>《事林广记》日常知识检索</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="主导航">
        <a href={hasResult ? "#result" : "#topics"}>检索结果</a>
        <a href="#evidence-guide">证据说明</a>
        <a href="#about">关于本项目</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button mobile-menu" aria-label="打开菜单" type="button">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

interface SearchHeroProps {
  question: string;
  setQuestion: (value: string) => void;
  onSubmit: (question: string) => void;
  loading: boolean;
  hasResult: boolean;
  loadingStep: number;
}

function SearchHero({
  question,
  setQuestion,
  onSubmit,
  loading,
  hasResult,
  loadingStep,
}: SearchHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(question);
  };

  return (
    <section className={`hero ${hasResult ? "hero-compact" : ""}`} id="top">
      <div className="hero-ornament hero-ornament-left" aria-hidden="true">日</div>
      <div className="hero-ornament hero-ornament-right" aria-hidden="true">用</div>
      <div className="hero-inner">
        {!hasResult && (
          <div className="eyebrow"><span />从现代问题，走进古人的日常<span /></div>
        )}
        <h1>{hasResult ? "继续问《事林广记》" : <>古人如何过日子？<em>问问古书。</em></>}</h1>
        {!hasResult && (
          <p className="hero-lead">用今天的话提问，循着古代词与门类，找到能核验的原文和不过界的解释。</p>
        )}
        <form className="search-form" onSubmit={submit} role="search">
          <Search className="search-icon" aria-hidden="true" size={22} />
          <label className="sr-only" htmlFor="main-search">向《事林广记》提问</label>
          <input
            ref={inputRef}
            id="main-search"
            type="search"
            value={question}
            maxLength={500}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例如：中秋除赏月外，还有什么活动？"
            autoComplete="off"
          />
          {question && !loading && (
            <button className="clear-search" type="button" aria-label="清空问题" onClick={() => {
              setQuestion("");
              inputRef.current?.focus();
            }}>
              <X size={17} />
            </button>
          )}
          <button className="search-button" type="submit" disabled={loading || !question.trim()}>
            {loading ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}
            <span>{loading ? "检索中" : "查一查"}</span>
          </button>
        </form>
        {loading ? (
          <div className="loading-story" role="status" aria-live="polite">
            <span className={loadingStep >= 0 ? "active" : ""}><Check size={13} />理解问题</span>
            <i />
            <span className={loadingStep >= 1 ? "active" : ""}><Tags size={13} />映射古词</span>
            <i />
            <span className={loadingStep >= 2 ? "active" : ""}><BookMarked size={13} />核对原文</span>
          </div>
        ) : (
          <div className="quick-questions" aria-label="示例问题">
            <span>试着问</span>
            {exampleQuestions.slice(0, hasResult ? 3 : 4).map((item) => (
              <button key={item.route} type="button" onClick={() => {
                setQuestion(item.question);
                onSubmit(item.question);
              }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: AnswerStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span className={`status-pill ${meta.className}`}>
      <Icon size={14} strokeWidth={2.4} />
      {meta.short}
    </span>
  );
}

interface EvidenceCardProps {
  item: EvidenceItem;
  translation?: string;
  onOpenDetail: (entryId: string) => void;
  featured?: boolean;
}

function EvidenceCard({ item, translation, onOpenDetail, featured = false }: EvidenceCardProps) {
  return (
    <article className={`evidence-card ${featured ? "featured" : ""}`} aria-label={`原典证据：${item.entry_title}`}>
      <div className="evidence-topline">
        <div className="evidence-number">
          <small>原典证据</small>
        </div>
      </div>
      <div className="evidence-title-row">
        <div>
          <p>{item.collection} · {item.volume}{item.category ? ` · ${item.category}` : ""}</p>
          <h3>〈{item.entry_title}〉</h3>
        </div>
      </div>
      <blockquote>{item.original_text}</blockquote>
      {translation && (
        <div className="translation">
          <span><MessageSquareQuote size={15} />白话理解</span>
          <p>{translation}</p>
        </div>
      )}
      <div className="evidence-footer">
        <span><FileSearch size={14} />源文件第 {item.source_line_start}{item.source_line_end !== item.source_line_start ? `–${item.source_line_end}` : ""} 行</span>
        <button type="button" onClick={() => onOpenDetail(item.entry_id)}>
          查看条目详情 <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: EntryDetailResponse | null;
  loading: boolean;
  error: DataSourceError | null;
  onRetry: () => void;
}

function DetailDrawer({ open, onOpenChange, detail, loading, error, onRetry }: DetailDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay" />
        <Dialog.Content className="drawer-content" aria-describedby="detail-description">
          <div className="drawer-header">
            <div>
              <span className="section-kicker">条目上下文</span>
              <Dialog.Title>{detail ? `〈${detail.entry_title}〉` : "条目详情"}</Dialog.Title>
            </div>
            <Dialog.Close className="drawer-close" aria-label="关闭详情"><X size={20} /></Dialog.Close>
          </div>
          <div id="detail-description" className="sr-only">查看条目的原文、前后文和来源定位。</div>
          {loading && (
            <div className="drawer-loading" role="status">
              <LoaderCircle className="spin" size={28} />
              <p>正在加载条目上下文…</p>
            </div>
          )}
          {!loading && error && (
            <div className="drawer-error" role="alert">
              <CircleAlert size={30} />
              <h3>详情没有加载成功</h3>
              <p>{error.message}</p>
              {error.retryable && <button type="button" onClick={onRetry}><RefreshCw size={15} />重新加载</button>}
              <p className="local-failure-note">已有搜索结果与证据仍然保留。</p>
            </div>
          )}
          {!loading && detail && (
            <div className="drawer-body">
              <div className="detail-meta-grid">
                <div><span>收录位置</span><strong>{detail.collection} · {detail.volume}</strong></div>
                <div><span>门类</span><strong>{detail.category ?? "未标注"}</strong></div>
              </div>
              {(detail.missing_glyph || detail.image_required || detail.risk_types.length > 0) && (
                <div className="detail-alert">
                  <AlertTriangle size={17} />
                  <span>
                    {detail.missing_glyph && "含缺字；"}
                    {detail.image_required && "理解依赖图像；"}
                    {detail.risk_types.map((risk) => riskLabels[risk]).join("、")}
                  </span>
                </div>
              )}
              {detail.context_before && (
                <section className="context-block muted">
                  <h3>前文</h3><p>{detail.context_before}</p>
                </section>
              )}
              <section className="context-block original">
                <h3><BookOpenText size={16} />命中原文</h3><p>{detail.original_text}</p>
              </section>
              {detail.context_after && (
                <section className="context-block muted">
                  <h3>后文</h3><p>{detail.context_after}</p>
                </section>
              )}
              <section className="source-location">
                <span>本地来源定位</span>
                <code>{detail.source_file}</code>
                <p>第 {detail.source_line_start}{detail.source_line_end !== detail.source_line_start ? `–${detail.source_line_end}` : ""} 行</p>
              </section>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ResultViewProps {
  result: SearchResponse;
  askedQuestion: string;
  onSearch: (question: string) => void;
  onOpenDetail: (entryId: string) => void;
}

function ResultView({ result, askedQuestion, onSearch, onOpenDetail }: ResultViewProps) {
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const status = statusMeta[result.answer_status];
  const StatusIcon = status.icon;
  const translations = useMemo(
    () => new Map(result.translations.map((item) => [item.evidence_id, item.text])),
    [result.translations],
  );
  const firstEvidence = result.evidence[0];
  const remainingEvidence = result.evidence.slice(1);

  useEffect(() => setShowAllEvidence(false), [result.request_id]);

  return (
    <main className="result-shell" id="result">
      <section className={`result-heading ${status.className}`}>
        <div className="result-question-block">
          <p><span>你的问题</span>{askedQuestion}</p>
          <div className="result-state-line">
            <StatusPill status={result.answer_status} />
            <span className="mode-pill"><Clock3 size={13} />{modeMeta[result.response_mode].label}</span>
            {result.topic && <span className="topic-label">{result.topic}</span>}
          </div>
        </div>
        <div className="status-explainer">
          <StatusIcon size={17} />
          <span><strong>{status.label}</strong>{modeMeta[result.response_mode].description}</span>
        </div>
      </section>

      <div className={`primary-result-grid ${firstEvidence ? "has-evidence" : "without-evidence"}`}>
        <article className={`answer-card ${status.className}`}>
          <span className="section-kicker">据当前语料作答</span>
          <h2>{result.answer}</h2>
          {result.query_terms.length > 0 && (
            <div className="mapped-terms">
              <span><Tags size={15} />现代问题映射到</span>
              <div>{result.query_terms.map((term) => <em key={term}>{term}</em>)}</div>
            </div>
          )}
          {result.answer_points.length > 0 && (
            <ol className="answer-points">
              {result.answer_points.map((point, index) => (
                <li key={`${point.text}-${index}`}>
                  <span className="point-number">{String(index + 1).padStart(2, "0")}</span>
                  <p>{point.text}</p>
                </li>
              ))}
            </ol>
          )}
          {result.historical_context && (
            <div className={`context-note ${result.answer_status === "unsafe" ? "risk" : ""}`}>
              {result.answer_status === "unsafe" ? <ShieldCheck size={18} /> : <Landmark size={18} />}
              <div><strong>{result.answer_status === "unsafe" ? "安全边界" : "历史语境"}</strong><p>{result.historical_context}</p></div>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className="warnings" aria-label="提示">
              {result.warnings.map((warning, index) => (
                <p key={warning}><CircleAlert size={14} />{warning}{index === 0 && result.answer_status !== "unsafe" ? <span>范围说明</span> : null}</p>
              ))}
            </div>
          )}
        </article>

        {firstEvidence ? (
          <div className="first-evidence-wrap">
            <div className="evidence-section-title">
              <div><span className="section-kicker">原文可以核验</span><h2>回答依据</h2></div>
              <span>{result.evidence.length} 条证据</span>
            </div>
            <EvidenceCard
              item={firstEvidence}
              translation={translations.get(firstEvidence.evidence_id)}
              onOpenDetail={onOpenDetail}
              featured
            />
          </div>
        ) : (
          <div className={`empty-evidence ${status.className}`}>
            <div className="empty-icon"><StatusIcon size={30} /></div>
            <span className="section-kicker">证据处理原则</span>
            <h2>{result.answer_status === "unsafe" ? "安全优先，不展开操作细节" : "没有证据，就不拼凑答案"}</h2>
            <p>{result.answer_status === "unsafe"
              ? "可以说明历史条目的存在，但不会把古代材料改写成现实处方或实践教程。"
              : "检索相近不等于证据成立。当前页面不会生成空证据卡，也不会用常识越界补答。"}</p>
          </div>
        )}
      </div>

      {remainingEvidence.length > 0 && (
        <section className="more-evidence">
          <button className="more-evidence-trigger" type="button" onClick={() => setShowAllEvidence((value) => !value)} aria-expanded={showAllEvidence}>
            <span><Layers3 size={18} />{showAllEvidence ? "收起其余证据" : `继续查看其余 ${remainingEvidence.length} 条独立证据`}</span>
            <ChevronDown className={showAllEvidence ? "rotated" : ""} size={19} />
          </button>
          {showAllEvidence && (
            <div className="evidence-grid">
              {remainingEvidence.map((item) => (
                <EvidenceCard
                  key={item.evidence_id}
                  item={item}
                  translation={translations.get(item.evidence_id)}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {result.related_questions.length > 0 && (
        <section className="related-questions">
          <div><span className="section-kicker">沿着古书继续看</span><h2>还可以这样问</h2></div>
          <div className="related-list">
            {result.related_questions.map((item) => (
              <button type="button" key={item} onClick={() => onSearch(item)}>{item}<ArrowRight size={16} /></button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ErrorView({ error, onRetry }: { error: DataSourceError; onRetry: () => void }) {
  return (
    <main className="error-shell" role="alert">
      <div className="error-illustration"><CircleAlert size={34} /></div>
      <span className="section-kicker">这次没有连接成功</span>
      <h2>{error.message}</h2>
      <p>你的问题已经保留，可以直接重试。</p>
      <button type="button" onClick={onRetry}><RefreshCw size={16} />再试一次</button>
    </main>
  );
}

function HomeSections({ onSearch }: { onSearch: (question: string) => void }) {
  return (
    <main className="home-content">
      <section className="story-strip" id="evidence-guide">
        <div><span>01</span><strong>说今天的话</strong><p>直接用现代汉语提问</p></div>
        <ArrowRight size={18} />
        <div><span>02</span><strong>找到古代词</strong><p>映射门类与历史用语</p></div>
        <ArrowRight size={18} />
        <div><span>03</span><strong>回到原文</strong><p>每个要点都有出处</p></div>
      </section>

      <section className="topics" id="topics">
        <div className="section-heading">
          <div><span className="section-kicker">从一部日用百科出发</span><h2>古人的生活，有章可循</h2></div>
          <p>《事林广记》汇集节令、礼仪、饮食与农事等日常知识。</p>
        </div>
        <div className="topic-grid">
          {topicCards.map(({ name, subtitle, icon: Icon, accent }, index) => (
            <button
              className={`topic-card ${accent}`}
              type="button"
              key={name}
              onClick={() => index < 3 && onSearch(exampleQuestions[index].question)}
              aria-label={`${name}：${subtitle}`}
            >
              <span className="topic-icon"><Icon size={22} /></span>
              <strong>{name}</strong>
              <small>{subtitle}</small>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="about-card" id="about">
        <div className="about-emblem"><ShieldCheck size={26} /></div>
        <div><span className="section-kicker">可靠比热闹更重要</span><h2>看得见边界，也看得见来处</h2></div>
        <p>原文、白话、历史语境和风险分开呈现；找不到就明确说找不到，危险的现实请求不会被改写成教程。</p>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-brand"><BrandMark /><span><strong>古人也搜索</strong><small>当前收录《事林广记》43 个 UTF-8 文本</small></span></div>
    </footer>
  );
}

export interface AppProps {
  dataSource?: SearchDataSource;
}

export default function App({ dataSource = searchDataSource }: AppProps) {
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<DataSourceError | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailEntryId, setDetailEntryId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EntryDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<DataSourceError | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timers = [
      window.setTimeout(() => setLoadingStep(1), 180),
      window.setTimeout(() => setLoadingStep(2), 360),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [loading]);

  const runSearch = async (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed || loading) return;
    setQuestion(trimmed);
    setAskedQuestion(trimmed);
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    try {
      const nextResult = await dataSource.search({ question: trimmed, scope: "featured" });
      setResult(nextResult);
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof DataSourceError ? caught : new DataSourceError("NETWORK_ERROR", "发生未知错误，请稍后重试。", { retryable: true }));
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (entryId: string) => {
    setDetailEntryId(entryId);
    setDrawerOpen(true);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      setDetail(await dataSource.getEntry(entryId));
    } catch (caught) {
      setDetailError(caught instanceof DataSourceError ? caught : new DataSourceError("NETWORK_ERROR", "详情加载失败。", { retryable: true }));
    } finally {
      setDetailLoading(false);
    }
  };

  const hasResult = Boolean(result || error || loading || askedQuestion);

  return (
    <div className="app">
      <Header hasResult={hasResult} />
      <SearchHero
        question={question}
        setQuestion={setQuestion}
        onSubmit={runSearch}
        loading={loading}
        hasResult={hasResult}
        loadingStep={loadingStep}
      />
      {result && <ResultView result={result} askedQuestion={askedQuestion} onSearch={runSearch} onOpenDetail={loadDetail} />}
      {error && <ErrorView error={error} onRetry={() => runSearch(question)} />}
      {!result && !error && !loading && <HomeSections onSearch={runSearch} />}
      {loading && <div className="loading-placeholder" aria-hidden="true"><span /><span /><span /></div>}
      <Footer />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onRetry={() => detailEntryId && loadDetail(detailEntryId)}
      />
    </div>
  );
}
