import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DataSourceError, type SearchResponse } from "../contracts";
import { MockSearchDataSource } from "./MockSearchDataSource";
import {
  CACHE_RESPONSE,
  DEGRADED_RESPONSE,
  DETAIL_ERROR_ENTRY_ID,
  MOCK_RESPONSES,
  ROUTE_QUESTIONS,
} from "./mockData";

const validateResponse = (response: SearchResponse) => {
  expect(response.schema_version).toBe("1.0");
  expect(["supported", "partial", "not_found", "unsafe"]).toContain(response.answer_status);
  expect(["live", "cache", "evidence_only"]).toContain(response.response_mode);

  const evidenceIds = new Set(response.evidence.map((item) => item.evidence_id));
  expect(evidenceIds.size).toBe(response.evidence.length);
  response.answer_points.forEach((point) => {
    expect(point.evidence_ids.length).toBeGreaterThan(0);
    point.evidence_ids.forEach((id) => expect(evidenceIds.has(id)).toBe(true));
  });
  response.translations.forEach((item) => expect(evidenceIds.has(item.evidence_id)).toBe(true));
  response.evidence.forEach((item) => {
    expect(item.source_line_start).toBeGreaterThanOrEqual(1);
    expect(item.source_line_end).toBeGreaterThanOrEqual(item.source_line_start);
  });

  if (response.answer_status === "supported") {
    expect(response.answer_points.length).toBeGreaterThan(0);
    expect(response.evidence.length).toBeGreaterThan(0);
  }
  if (response.answer_status === "not_found") {
    expect(response.answer_points).toEqual([]);
    expect(response.evidence).toEqual([]);
  }
  if (response.answer_status === "unsafe") expect(response.warnings.length).toBeGreaterThan(0);
  if (response.response_mode === "evidence_only") expect(response.evidence.length).toBeGreaterThan(0);
};

describe("P0 fixed mock contract", () => {
  it("covers A/B/C/N/U and degradation modes with valid references", () => {
    expect(Object.keys(MOCK_RESPONSES)).toEqual(["A", "B", "C", "N", "U"]);
    Object.values(MOCK_RESPONSES).forEach(validateResponse);
    validateResponse(DEGRADED_RESPONSE);
    validateResponse(CACHE_RESPONSE);
    expect(MOCK_RESPONSES.A.answer_status).toBe("supported");
    expect(MOCK_RESPONSES.B.evidence).toHaveLength(7);
    expect(MOCK_RESPONSES.C.query_terms).toContain("尊翁");
    expect(MOCK_RESPONSES.N.answer_status).toBe("not_found");
    expect(MOCK_RESPONSES.U.answer_status).toBe("unsafe");
  });

  it("uses exact, source-located TXT excerpts for every displayed quotation", () => {
    const shownEvidence = [
      ...MOCK_RESPONSES.A.evidence,
      ...MOCK_RESPONSES.B.evidence,
      ...MOCK_RESPONSES.C.evidence,
    ];
    shownEvidence.forEach((item) => {
      const lines = readFileSync(resolve("..", item.source_file), "utf8").split(/\r?\n/);
      const locatedText = lines.slice(item.source_line_start - 1, item.source_line_end).join("\n");
      expect(item.original_text, item.evidence_id).toBe(locatedText);
    });
  });

  it("matches every frozen primary question and paraphrase deterministically", async () => {
    const source = new MockSearchDataSource(0);
    for (const [route, questions] of Object.entries(ROUTE_QUESTIONS)) {
      for (const question of questions) {
        const result = await source.search({ question });
        expect(result.answer_status, `${route}: ${question}`).toBe(
          MOCK_RESPONSES[route as keyof typeof MOCK_RESPONSES].answer_status,
        );
        expect(result.request_id, `${route}: ${question}`).toBe(
          MOCK_RESPONSES[route as keyof typeof MOCK_RESPONSES].request_id,
        );
      }
    }
  });

  it("falls back to not_found and exposes controlled error scenarios", async () => {
    const source = new MockSearchDataSource(0);
    await expect(source.search({ question: "一条完全未知的问题" })).resolves.toMatchObject({
      answer_status: "not_found",
    });
    await expect(source.search({ question: "模拟网络错误" })).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      retryable: true,
    });
    await expect(source.search({ question: "模拟服务错误" })).rejects.toMatchObject({
      code: "MODEL_UNAVAILABLE",
      retryable: true,
    });
    await expect(source.getEntry(DETAIL_ERROR_ENTRY_ID)).rejects.toBeInstanceOf(DataSourceError);
  });

  it("returns defensive copies so UI state cannot mutate fixtures", async () => {
    const source = new MockSearchDataSource(0);
    const result = await source.search({ question: ROUTE_QUESTIONS.A[0] });
    result.answer = "changed";
    const nextResult = await source.search({ question: ROUTE_QUESTIONS.A[0] });
    expect(nextResult.answer).toBe(MOCK_RESPONSES.A.answer);
  });
});
