import { test } from "node:test";
import assert from "node:assert/strict";
import { iconPaths, pipelineSteps, supportIcon } from "../../src/lib/icons.ts";

test("every support has an icon with geometry", () => {
  for (const s of ["platform", "dx"] as const) assert.ok(iconPaths[supportIcon[s]].length > 0);
});

test("pipeline steps are shared", () => {
  assert.deepEqual([...pipelineSteps], ["build", "test", "deploy"]);
});
