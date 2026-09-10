import type { SearchDataSource } from "../contracts";
import { HttpSearchDataSource } from "./HttpSearchDataSource";
import { MockSearchDataSource } from "./MockSearchDataSource";

export const dataSourceMode = import.meta.env.VITE_DATA_SOURCE === "api" ? "api" : "mock";

export const searchDataSource: SearchDataSource =
  dataSourceMode === "api" ? new HttpSearchDataSource() : new MockSearchDataSource();

export { MockSearchDataSource } from "./MockSearchDataSource";
export { HttpSearchDataSource } from "./HttpSearchDataSource";
