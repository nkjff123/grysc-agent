import {
  DataSourceError,
  type EntryDetailResponse,
  type SearchDataSource,
  type SearchRequest,
  type SearchResponse,
} from "../contracts";
import {
  CACHE_RESPONSE,
  DEGRADED_RESPONSE,
  DETAIL_ERROR_ENTRY_ID,
  ENTRY_DETAILS,
  MOCK_RESPONSES,
  ROUTE_QUESTIONS,
} from "./mockData";

const sleep = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const normalize = (value: string) => value.trim().replaceAll(/\s+/g, "").toLocaleLowerCase("zh-CN");

const questionToRoute = new Map<string, keyof typeof MOCK_RESPONSES>(
  Object.entries(ROUTE_QUESTIONS).flatMap(([route, questions]) =>
    questions.map((question) => [normalize(question), route as keyof typeof MOCK_RESPONSES]),
  ),
);

const clone = <T>(value: T): T => structuredClone(value);

export class MockSearchDataSource implements SearchDataSource {
  constructor(private readonly delay = 520) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    await sleep(this.delay);
    const question = request.question.trim();
    if (!question || question.length > 500) {
      throw new DataSourceError("INVALID_QUERY", "请输入 1～500 字的问题。", {
        requestId: "mock-invalid-query",
      });
    }
    if (question === "模拟网络错误") {
      throw new DataSourceError("NETWORK_ERROR", "网络连接失败，请检查连接后重试。", {
        retryable: true,
      });
    }
    if (question === "模拟服务错误") {
      throw new DataSourceError("MODEL_UNAVAILABLE", "生成服务暂不可用。", {
        requestId: "mock-service-error",
        retryable: true,
      });
    }
    if (question === "模拟证据模式") return clone(DEGRADED_RESPONSE);
    if (question === "模拟缓存模式") return clone(CACHE_RESPONSE);

    const normalized = normalize(question);
    let route = questionToRoute.get(normalized);
    if (!route) {
      if (/中秋|月夕|赏月|八月十五/.test(question)) route = "A";
      else if (/婚|纳采|纳釆|纳币|亲迎|舅姑|庙见/.test(question)) route = "B";
      else if (/父亲|尊翁|椿府|称谓|敬称/.test(question)) route = "C";
      else if (/何首乌|配药|古方|剂量|服法|处方/.test(question)) route = "U";
      else route = "N";
    }

    return clone(MOCK_RESPONSES[route]);
  }

  async getEntry(entryId: string): Promise<EntryDetailResponse> {
    await sleep(Math.min(this.delay, 360));
    if (entryId === DETAIL_ERROR_ENTRY_ID) {
      throw new DataSourceError("ENTRY_NOT_FOUND", "此条目的详情暂时无法加载。", {
        requestId: "mock-detail-error",
        retryable: true,
      });
    }
    const result = ENTRY_DETAILS[entryId];
    if (!result) {
      throw new DataSourceError("ENTRY_NOT_FOUND", "没有找到这个条目。", {
        requestId: "mock-entry-not-found",
      });
    }
    return clone(result);
  }
}
