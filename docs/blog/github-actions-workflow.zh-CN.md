---
title: 使用 GitHub Actions 为 antd 提效
date: 2023-04-10
author: Wxh16144
---

大家好，我是 [Wxh16144](https://github.com/Wxh16144)，通过学习 Ant Design 的组件库，并参与社区开源贡献，我发现了一些提高开发效率和代码质量的工具。借此机会，我希望与大家分享我的经验，帮助更好地了解 Ant Design，并将这些技巧应用到自己的项目中。

## 前言

Ant Design 以开源的形式托管在 GitHub，方便更好的与全球开发者进行交流和合作，也方便开发者提交 issue 和 PR。同时借助 [GitHub Actions](https://github.com/features/actions) 和 CI/CD 能力，使得我们更好的管理代码仓库和自动化测试、部署等工作流程，本文将着重介绍 Actions 提供的能力。

### 什么是 GitHub Actions

GitHub Actions 是一个自动化软件开发工作流程的平台，从想法构建到生成，开发者只需在`.github/workflows` 目录中添加 `yml` 格式文件，定义 Workflow（工作流程） 去实现 CI（持续集成）通过 [了解 GitHub Actions](https://docs.github.com/zh/actions/learn-github-actions/understanding-github-actions)，我们可以掌握 Workflow 中一些概念。

- **Event(触发事件)**：触发运行事件，例如，有人创建了 issue、PR 或者推送了代码到某个分支。
- **Job(作业)**：一个 Workflow 包含一个或多个 **Job**，默认情况下并行运行，我们可以设置让其按顺序执行，每个 **Job** 可以包含多个 **Step**。
- **Step(步骤)**：定义每一个部分的工作内容，每一个 **Step** 都是一个单独的进程运行。该部分下每个项目都是一个单独操作或者 shell 脚本。

引用官方文档的 Workflow 图，我们可以直观的看懂 **Event**、**Job**和 **Step** 之间的关系：

![overview-actions-simple](https://docs.github.com/assets/cb-25535/mw-1000/images/help/actions/overview-actions-simple.webp)

## 如何使用

通过上述了解，Ant Design 的所有 Workflow 都放置在 [`.github/workflows`](https://github.com/ant-design/ant-design/tree/master/.github/workflows) 目录中，下面我将从参与 OSS 角度介绍 Ant Design 使用 GitHub Actions 都做了哪些事情。

### Issue

Issue 作为 GitHub 平台上的一个功能，它像一个信息汇总中心一样，收集社区反馈的问题。允许我们添加标签、里程碑、指派人员等信息，以便更好地组织任务和项目。为此 antd 针对 issue 的 CI 有以下几个方面：

**相关文件:**

- [issue-check-inactive.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-check-inactive.yml)
- [issue-close-require.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-close-require.yml)
- [issue-labeled.yml](https://github.com/ant-design/ant-design/blob/716e56b3aefe4bba622f18190c8a7f2fcdb76c38/.github/workflows/issue-labeled.yml)
- [issue-open-check.yml](https://github.com/ant-design/ant-design/blob/c468b3487c51eac668aee34587c55c58091140ca/.github/workflows/issue-open-check.yml)
- [issue-remove-inactive.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-remove-inactive.yml)

#### 1. 保证 Issue 提问质量

阅读 [#L31-L42](https://github.com/ant-design/ant-design/blob/da83561f9cb57b0eb03d18543d96393689f799be/.github/workflows/issue-open-check.yml#L31-L42) 可以得到逻辑，当有人创建了一个 issue 时，antd 会判断创建的 issue 报文中是否存在 `ant-design-issue-helper` 关键词 (需要通过 [issue 助手](http://new-issue.ant.design) 来创建 issue 才会出现这个标识) 来决定社区反馈的问题是否有效。否则这个 issue 会被关闭并打上 [Invalid](https://user-images.githubusercontent.com/32004925/231656363-3b8c33da-b240-4a42-8754-24981cfb06c4.png) 标签，然后以评论的形式提醒创建者需要如何进行提问。就像这样：

![invalid-issue-preview](https://user-images.githubusercontent.com/32004925/231660945-509cf97c-43eb-4a1c-acd2-81eeedfe4a73.png)

有时候即使使用了 issue 助手来创建 issue，但官方团队也可能无法从提供的内容中得到有效的信息，`Collaborator` 就会手动对 issue 添加 [help wanted](https://github.com/ant-design/ant-design/issues?q=label%3A%22help+wanted%22+)、[🤔 Need Reproduce](https://github.com/ant-design/ant-design/issues?q=label%3A%22%F0%9F%A4%94+Need+Reproduce%22+) 或 [needs-more-info](https://github.com/ant-design/ant-design/issues?q=label%3A%22%F0%9F%A4%94+Need+Reproduce%22+) 等标签进一步把控 issue 质量，在 [issue-labeled.yml](https://github.com/ant-design/ant-design/blob/da83561f9cb57b0eb03d18543d96393689f799be/.github/workflows/issue-labeled.yml) 文件中，记录了不同的标签触发对应的评论回复。

![help-wanted-auto-comment-preview](https://user-images.githubusercontent.com/32004925/231673404-60b248cd-823f-4d31-8fff-d95b02b35fee.png) ![need-reproduce-auto-comment-preview](https://user-images.githubusercontent.com/32004925/231673201-c7376eeb-010b-46d0-a7d0-4c115d58f58c.png)

#### 2. 常见问题答疑

在 [issue-open-check.yml#L43-L94](https://github.com/ant-design/ant-design/blob/da83561f9cb57b0eb03d18543d96393689f799be/.github/workflows/issue-open-check.yml#L43-L94) 中我们判断 issue 的 title 中是否包含有 `官网`、`网站`、`挂了`、`IE` 等关键词，进行一个标准回复并自动关闭 issue。

![issue-auto-comment-preview](https://user-images.githubusercontent.com/32004925/231660324-b763d7ac-95d8-431a-a31d-69b2eff72dfd.png)

#### 定期清理 issue

- [issue-close-require.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-close-require.yml) 是一个定时执行的 CI，它将在每天 00:00 定时执行任务。针对前面提到的 `🤔 Need Reproduce` 和 `needs-more-info 标签`进行判断，超过 3 天没有移除标签则会自动评论并且关闭 issue。
- [issue-check-inactive.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-check-inactive.yml) 也是一个定时执行 CI，它将每隔 15 天执行一次任务，将 30 天没有任何活动的 issue 添加 `Inactive` 标签，但是不会进行关闭操作。而 [issue-remove-inactive.yml](https://github.com/ant-design/ant-design/blob/01a475af6d8ff4943fe4c91d04582120bf9b3a84/.github/workflows/issue-remove-inactive.yml) CI 则是当 issue 被修改，或者有新的评论时，则会删除 `Inactive` 和 `needs-more-info` 标签。

### Pull Request

当贡献者提交一个 PR 时，antd 会利用 CI 对 PR 进行一个预检，以保证 RP 质量。

**相关文件:**

- [pr-open-check.yml](https://github.com/ant-design/ant-design/blob/3d627eb475e32daf3a47731140685124d568a495/.github/workflows/pr-open-check.yml)
- [preview-build.yml](https://github.com/ant-design/ant-design/blob/aedda24ad315b85530496b0e921ae9ea1b86f6ad/.github/workflows/preview-build.yml)
- [preview-depoly.yml](https://github.com/ant-design/ant-design/blob/c6a7dbc09e709a8905aaa6c073593a1fed6bea14/.github/workflows/preview-deploy.yml)
- [preview-start.yml](https://github.com/ant-design/ant-design/blob/c6a7dbc09e709a8905aaa6c073593a1fed6bea14/.github/workflows/preview-start.yml)
- [size-limit.yml](https://github.com/ant-design/ant-design/blob/5dfce5443744271f778313c23eb8ec3a5af481f8/.github/workflows/size-limit.yml)
- [test.yml](https://github.com/ant-design/ant-design/blob/5dfce5443744271f778313c23eb8ec3a5af481f8/.github/workflows/test.yml)
- [verify-files-modify.yml](https://github.com/ant-design/ant-design/blob/3266635fa0e5dbaab40dbbc4548f1252fc10fd48/.github/workflows/verify-files-modify.yml)

#### PR 预检

**当创建了一个与修复问题、新特性相关的 PR 时：**

- [pr-open-check.yml] 文件会判断描述中是否填写了更新日志，如果没有则会在 PR 中进行评论提醒。如果 PR 描述中提及的 issue 是只允许核心团队进行确认时，则会自动关闭 PR 并评论。就像这样：

![pr-non-changelog-comment-preview](https://user-images.githubusercontent.com/32004925/231672871-32689c30-1e0a-40fc-9237-9b9b4312f15c.png)

- [verify-files-modify.yml] 文件会判断特定目录（如：`./github/` 和 `scripts/`）或文件（如：`CHANGELOG.md`）谢绝社区修改，将自动关闭 PR 并且指定给指定成员。

#### 代码规范检查

antd 总是需要检查开发者提交的代码是否通过 lint 检查，具体逻辑在 [test.yml#L52-L75](https://github.com/ant-design/ant-design/blob/dedbdfddafc0134219e391473c109c14766f413d/.github/workflows/test.yml#L52-L75) 文件中。

#### PR 部署预览

当创建 PR 时：

1. 首先触发[preview-start.yml](https://github.com/ant-design/ant-design/blob/c6a7dbc09e709a8905aaa6c073593a1fed6bea14/.github/workflows/preview-start.yml) CI 对 PR 进行一个占位评论，告知开发者真正进行预览构建。也就是大家经常看到的 Preview Preparing... ，同时 [preview-build.yml#L52-L77](https://github.com/ant-design/ant-design/blob/b7d1d7cdbd888a1d73b3a3bf87bf4977e9b9bf91/.github/workflows/preview-build.yml#L52-L77) CI 文件会对 site 进行构建操作。

![preview-preparing..](https://user-images.githubusercontent.com/32004925/231686636-eef933e6-2678-4e49-9552-babc50687644.png)

2. 最后 [preview-deploy.yml](https://github.com/ant-design/ant-design/blob/c6a7dbc09e709a8905aaa6c073593a1fed6bea14/.github/workflows/preview-deploy.yml) 则会等待 preview-build.yml 运行完成后进行对应的操作。如果构建成功则会将占位评论修改为构建成功的图标，反之则为失败的图片。

#### AI 代码审查

包括最近比较流行的 chatGPT，antd 也将它添加到 action 中，用 AI 先对代码进行审查，具体 CI 文件参考 [chatgpt-cr.yml](https://github.com/ant-design/ant-design/blob/f7fd474cf8792ea01d03461d407c0edc11828a1c/.github/workflows/chatgpt-cr.yml)

### 单元测试

**相关文件:**

- [test.yml]

作为质量保证重要一不，当任何提交推送时都将触发该流水线 包括发起一个 PR 操作。

### 部署

### 其他

#### 同步到码云

[sync-gitee.yml](https://github.com/ant-design/ant-design/blob/b09153c4fcffe00aac8aaaae8417d5588c444342/.github/workflows/sync-gitee.yml) CI 文件则表示每次 master 分支以及 gh-pages 分支有提交时都将同步提交到 [Gitee](https://gitee.com/ant-design/ant-design) 仓库。

#### 接入 IM 通知

每当创建了 Issue 、Discussion 或 Release 时， CI 都会将消息第一时间通知到开发者群和社区群中。

- [release-helper.yml](https://github.com/ant-design/ant-design/blob/dedbdfddaf/.github/workflows/release-helper.yml) CI 文件表示每当创建 Release 时，则将更新日志发布到钉钉社区群中。
- [issue-open-check.yml#L96-L105](https://github.com/ant-design/ant-design/blob/master/.github/workflows/issue-open-check.yml#L96-L105)、[disscustion-open-check.yml#L16-L25](https://github.com/ant-design/ant-design/blob/dedbdfddafc0134219e391473c109c14766f413d/.github/workflows/disscustion-open-check.yml#L16-L25) CI 文件表示每当创建了 Issue 、Discussion 通知到钉钉社区群中。

## 引入自己项目

如何在自己的项目中借鉴、 Ant Design 的 GitHub Actions

## 总结

本次文章到这里就结束了，希望可以帮助大家更进一步了解 Ant Design，如果有疑问欢迎前往 [Discussion](https://github.com/ant-design/ant-design/discussions) 讨论交流。
