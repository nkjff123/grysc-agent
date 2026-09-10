import {
  DataSourceError,
  type ApiErrorResponse,
  type EntryDetailResponse,
  type SearchDataSource,
  type SearchRequest,
  type SearchResponse,
} from "../contracts";

const parseResponse = async <T>(response: Response): Promise<T> => {
  let data: T | ApiErrorResponse;
  try {
    data = (await response.json()) as T | ApiErrorResponse;
  } catch {
    throw new DataSourceError("NETWORK_ERROR", "服务返回了无法读取的内容，请稍后重试。", {
      retryable: true,
    });
  }

  if (!response.ok) {
    const error = (data as ApiErrorResponse).error;
    throw new DataSourceError(error?.code ?? "INTERNAL_ERROR", error?.message ?? "请求失败。", {
      requestId: (data as ApiErrorResponse).request_id,
      retryable: error?.retryable,
    });
  }
  return data as T;
};

export class HttpSearchDataSource implements SearchDataSource {
  constructor(private readonly baseUrl = "/api/v1") {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      return parseResponse<SearchResponse>(response);
    } catch (error) {
      if (error instanceof DataSourceError) throw error;
      throw new DataSourceError("NETWORK_ERROR", "网络连接失败，请稍后重试。", { retryable: true });
    }
  }

  async getEntry(entryId: string): Promise<EntryDetailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/entries/${encodeURIComponent(entryId)}`);
      return parseResponse<EntryDetailResponse>(response);
    } catch (error) {
      if (error instanceof DataSourceError) throw error;
      throw new DataSourceError("NETWORK_ERROR", "详情加载失败，请稍后重试。", { retryable: true });
    }
  }
}
