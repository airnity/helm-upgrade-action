const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");
const path = require("path");

const basePath = "/tmp/actions";

async function helmRepoRemove(name) {
  console.log(`helm repo remove ${name}`);
  const args = ["repo", "remove", name];

  let helmOutput = "";
  let helmError = "";

  const options = {};
  options.listeners = {
    stdout: (data) => {
      helmOutput += data.toString();
    },
    stderr: (data) => {
      helmError += data.toString();
    },
  };
  options.silent = true;
  options.failOnStdErr = true;

  try {
    await exec.exec("helm", args, options);
    console.log(helmOutput);
  } catch (error) {
    core.setFailed(helmError);
  }
}

try {
  const localChart = /true/i.test(core.getInput("local-chart"));
  const chartRepoName = core.getInput("chart-repository-name");

  if (!localChart) helmRepoRemove(chartRepoName);

  const releaseName = core.getInput("release-name");
  const releaseNamespace = core.getInput("release-namespace");

  const fileName = `${releaseNamespace}-${releaseName}.yaml`;
  const fullPath = path.join(basePath, fileName);

  const releaseSetValues = core.getInput("release-set-values");
  if (releaseSetValues) {
    fs.unlinkSync(fullPath);
    //file removed
    console.log(`File ${fullPath} deleted`);
  }
} catch (err) {
  console.error(err);
}
