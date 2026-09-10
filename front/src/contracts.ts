export const SCHEMA_VERSION = "1.0" as const;

export type AnswerStatus = "supported" | "partial" | "not_found" | "unsafe";
export type ResponseMode = "live" | "cache" | "evidence_only";
export type Confidence = "high" | "medium" | "low" | null;
export type ReviewStatus = "reviewed" | "auto_organized" | "unreviewed";
export type QualityGrade = "A" | "B" | "C" | "D";
export type RiskType =
  | "medical"
  | "ingestion"
  | "fire"
  | "toxic"
  | "divination"
  | "violence"
  | "image_required";

export interface SearchRequest {
  question: string;
  thread_id?: string;
  scope?: "featured" | "all";
  topic_filter?: string;
}

export interface AnswerPoint {
  text: string;
  evidence_ids: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  entry_id: string;
  original_text: string;
  collection: string;
  volume: string;
  category: string | null;
  entry_title: string;
  source_file: string;
  source_line_start: number;
  source_line_end: number;
  source_url: string | null;
  review_status: ReviewStatus;
  quality_grade: QualityGrade;
  missing_glyph: boolean;
  risk_types: RiskType[];
}

export interface TranslationItem {
  evidence_id: string;
  text: string;
}

export interface Provenance {
  corpus_version: string;
  graph_version: string;
  prompt_version: string;
  generated_at: string;
}

export interface SearchResponse {
  schema_version: typeof SCHEMA_VERSION;
  request_id: string;
  thread_id: string;
  answer_status: AnswerStatus;
  response_mode: ResponseMode;
  answer: string;
  topic: string | null;
  query_terms: string[];
  answer_points: AnswerPoint[];
  evidence: EvidenceItem[];
  translations: TranslationItem[];
  historical_context: string | null;
  confidence: Confidence;
  warnings: string[];
  related_questions: string[];
  provenance: Provenance;
}

export interface EntryDetailResponse {
  schema_version: typeof SCHEMA_VERSION;
  request_id: string;
  entry_id: string;
  collection: string;
  volume: string;
  category: string | null;
  entry_title: string;
  original_text: string;
  context_before: string | null;
  context_after: string | null;
  source_file: string;
  source_line_start: number;
  source_line_end: number;
  source_url: string | null;
  review_status: ReviewStatus;
  quality_grade: QualityGrade;
  missing_glyph: boolean;
  image_required: boolean;
  risk_types: RiskType[];
  provenance: Pick<Provenance, "corpus_version">;
}

export type ApiErrorCode =
  | "INVALID_QUERY"
  | "ENTRY_NOT_FOUND"
  | "CORPUS_VERSION_CHANGED"
  | "RATE_LIMITED"
  | "MODEL_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiErrorResponse {
  schema_version: typeof SCHEMA_VERSION;
  request_id: string;
  error: { code: ApiErrorCode; message: string; retryable: boolean };
}

export interface SearchDataSource {
  search(request: SearchRequest): Promise<SearchResponse>;
  getEntry(entryId: string): Promise<EntryDetailResponse>;
}

export class DataSourceError extends Error {
  readonly code: ApiErrorCode | "NETWORK_ERROR";
  readonly requestId: string | null;
  readonly retryable: boolean;

  constructor(
    code: ApiErrorCode | "NETWORK_ERROR",
    message: string,
    options: { requestId?: string; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = "DataSourceError";
    this.code = code;
    this.requestId = options.requestId ?? null;
    this.retryable = options.retryable ?? false;
  }
}
