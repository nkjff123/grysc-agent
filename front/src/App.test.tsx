import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import { DataSourceError, type SearchDataSource } from "./contracts";
import { MockSearchDataSource } from "./data/MockSearchDataSource";

afterEach(cleanup);

const setup = () => {
  const user = userEvent.setup();
  render(<App dataSource={new MockSearchDataSource(0)} />);
  return user;
};

describe("P0-03 single-page experience", () => {
  it("shows the search, topics and scope story without development markers", () => {
    setup();
    expect(screen.getByRole("heading", { name: /古人如何过日子/ })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "向《事林广记》提问" })).toBeInTheDocument();
    expect(screen.queryByText(/Mock|Prototype|产品原型/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /岁时节令/ })).toBeInTheDocument();
    expect(screen.getByText(/原文、白话、历史语境和风险分开呈现/)).toBeInTheDocument();
  });

  it("renders a supported answer, cited points, visible evidence, translation and entry detail", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "中秋夜还有什么活动？" }));

    expect(await screen.findByText("证据足以回答")).toBeInTheDocument();
    expect(screen.queryByText("A-E01")).not.toBeInTheDocument();
    expect(screen.getByText("白话理解")).toBeInTheDocument();
    expect(screen.getAllByText(/夜市持续到天明/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/不代表所有时代、地区和人群/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /查看条目详情/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "〈中秋（月夕）〉" })).toBeInTheDocument();
    expect(within(dialog).getByText("本地来源定位")).toBeInTheDocument();
    expect(within(dialog).queryByText(/待内容审核|质量\s*C\s*级|mock-v1/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(
      /Mock|Prototype|产品原型|MVP|演示路线|[ABC]-E\d{2}|mock-v\d|请求编号|待内容审核|质量\s*[ABCD]\s*级/i,
    );
  });

  it("keeps seven wedding steps independently cited and expands the remaining evidence", async () => {
    const user = setup();
    const input = screen.getByRole("searchbox", { name: "向《事林广记》提问" });
    await user.type(input, "《事林广记》所载婚礼有哪些步骤？");
    await user.click(screen.getByRole("button", { name: "查一查" }));

    expect(await screen.findByText("继续查看其余 6 条独立证据")).toBeInTheDocument();
    expect(screen.queryByText(/B-E\d{2}/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /继续查看其余 6 条/ }));
    expect(screen.getByRole("article", { name: "原典证据：纳釆" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "原典证据：夫见妇之父母" })).toBeInTheDocument();
    expect(screen.queryByText(/B-E\d{2}/)).not.toBeInTheDocument();
  });

  it("renders not_found without an empty evidence card", async () => {
    const user = setup();
    const input = screen.getByRole("searchbox", { name: "向《事林广记》提问" });
    await user.type(input, "木星望远镜");
    await user.click(screen.getByRole("button", { name: "查一查" }));

    expect(await screen.findByText("当前语料未找到")).toBeInTheDocument();
    expect(screen.getByText("没有证据，就不拼凑答案")).toBeInTheDocument();
    expect(screen.queryByText("原典证据")).not.toBeInTheDocument();
  });

  it("puts the unsafe warning first and does not expose prescription details", async () => {
    const user = setup();
    const input = screen.getByRole("searchbox", { name: "向《事林广记》提问" });
    await user.type(input, "何首乌怎么配药和服用？");
    await user.click(screen.getByRole("button", { name: "查一查" }));

    expect(await screen.findByText("涉及现实使用风险")).toBeInTheDocument();
    expect(screen.getByText("安全优先，不展开操作细节")).toBeInTheDocument();
    expect(screen.getByText(/请咨询合格的医疗专业人员/)).toBeInTheDocument();
    expect(screen.queryByText(/空心一钱/)).not.toBeInTheDocument();
  });

  it("retains the question and offers retry on a search error", async () => {
    const user = setup();
    const input = screen.getByRole("searchbox", { name: "向《事林广记》提问" });
    await user.type(input, "模拟网络错误");
    await user.click(screen.getByRole("button", { name: "查一查" }));

    expect(await screen.findByText("网络连接失败，请检查连接后重试。")).toBeInTheDocument();
    expect(input).toHaveValue("模拟网络错误");
    expect(screen.getByRole("button", { name: "再试一次" })).toBeInTheDocument();
  });

  it("keeps the full search result when entry detail fails independently", async () => {
    const baseSource = new MockSearchDataSource(0);
    const source: SearchDataSource = {
      search: (request) => baseSource.search(request),
      getEntry: async () => {
        throw new DataSourceError("ENTRY_NOT_FOUND", "此条目的详情暂时无法加载。", {
          requestId: "mock-detail-error",
          retryable: true,
        });
      },
    };
    const user = userEvent.setup();
    render(<App dataSource={source} />);
    await user.click(screen.getByRole("button", { name: "中秋夜还有什么活动？" }));
    const answer = await screen.findByRole("heading", { name: /除玩月外/ });
    await user.click(screen.getByRole("button", { name: /查看条目详情/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("详情没有加载成功")).toBeInTheDocument();
    expect(within(dialog).getByText("已有搜索结果与证据仍然保留。")).toBeInTheDocument();
    expect(answer).toBeInTheDocument();
  });

  it("shows loading stages while a search is pending", async () => {
    const user = userEvent.setup();
    render(<App dataSource={new MockSearchDataSource(100)} />);
    await user.click(screen.getByRole("button", { name: "中秋夜还有什么活动？" }));
    expect(screen.getByRole("status")).toHaveTextContent("理解问题");
    await waitFor(() => expect(screen.getByText("证据足以回答")).toBeInTheDocument());
  });
});
