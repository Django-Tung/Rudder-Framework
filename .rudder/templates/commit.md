---
id: REQ-XXX
status: PENDING
phase: commit
created: ""
# 归档字段（Archive 不单独成文件，见 .rudder/workflow/states.md §1.6）
# 初始为未归档；归档时回填为 true / <YYYY-MM-DD> / requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/
archived: false
archived_at: ""
archive_path: ""
---

# 提交记录: [需求名称]

## 状态 (Status)
PENDING

## 前置条件检查 (Preconditions)
- [ ] `plan.md` 状态: APPROVED ✅
- [ ] `implement.md` 状态: COMPLETED ✅
- [ ] `verify.md` 状态: PASS ✅
- [ ] `review.md` 状态: APPROVED ✅
- [ ] 人工审批: 已通过 ✅

> ⚠️ 如果任何前置条件未满足，Agent 必须停止并报告缺失项。

## 垃圾回收 (Garbage Collection)
- [ ] 已清理未使用的 import
- [ ] 已清理调试用 console.log
- [ ] 已清理注释掉的死代码

## 提交信息 (Commit Message)
```text
feat(REQ-XXX): [简短的中文提交信息]
```

## 提交文件 (Committed Files)
| 文件路径 | 变更类型 |
|---------|---------|
| `src/types/xxx.ts` | 新增 |
| `src/services/xxx.ts` | 新增 |
| `src/pages/xxx.tsx` | 新增 |

## 提交哈希 (Commit Hash)
`[待提交后填入]`

## 最终状态 (Final Status)
⏳ PENDING