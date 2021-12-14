const core = require("@actions/core");
const YAML = require("yaml");
const path = require("path");
const fs = require("fs");
const exec = require("@actions/exec");

const basePath = "/tmp/actions";

async function runHelmCommand(args) {
  console.log(`helm ${args.join(" ")}`);

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

function createValuesFile(releaseName, releaseNamespace, values) {
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  const fileName = `${releaseNamespace}-${releaseName}.yaml`;

  const fullPath = path.join(basePath, fileName);

  fs.writeFile(
    fullPath,
    YAML.stringify(values, { indent: 2, indentSeq: false }),
    (err) => {
      // In case of a error throw err.
      if (err) {
        throw err;
      }
    }
  );

  return fullPath;
}

function buildArgs(
  releaseName,
  releaseNamespace,
  chart,
  valuesTmp,
  valuesTmpPath,
  valuesFilePath,
  wait,
  createNamespace,
  debug,
  dryRun
) {
  args = [
    "upgrade",
    "--install",
    releaseName,
    "--namespace",
    releaseNamespace,
    chart,
  ];

  if (valuesTmp) args.push("--values", valuesTmpPath);
  if (valuesFilePath) args.push("--values", valuesFilePath);
  if (wait) args.push("--wait");
  if (createNamespace) args.push("--create-namespace");
  if (debug) args.push("--debug");
  if (dryRun) args.push("--dry-run");

  return args;
}

async function helmRepoAdd(name, url) {
  console.log(`helm repo add ${name} ${url}`);
  const args = ["repo", "add", name, url];

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

async function run() {
  try {
    const localChart = /true/i.test(core.getInput("local-chart"));
    const chartRepoURL = core.getInput("chart-repository-url");
    const chartRepoName = core.getInput("chart-repository-name");

    if (!localChart) await helmRepoAdd(chartRepoName, chartRepoURL);

    const chart = core.getInput("chart");
    const releaseName = core.getInput("release-name");
    const releaseNamespace = core.getInput("release-namespace");
    const createNamespace = /true/i.test(core.getInput("create-namespace"));
    const valuesFilePath = core.getInput("values-file-path");
    const wait = /true/i.test(core.getInput("wait"));
    const debug = /true/i.test(core.getInput("debug"));
    const dryRun = /true/i.test(core.getInput("dry-run"));
    const releaseSetValues = core.getInput("release-set-values");

    const valuesTmp = YAML.parse(releaseSetValues);

    const valuesTmpPath = valuesTmp
      ? createValuesFile(releaseName, releaseNamespace, valuesTmp)
      : "";

    const args = buildArgs(
      releaseName,
      releaseNamespace,
      chart,
      valuesTmp,
      valuesTmpPath,
      valuesFilePath,
      wait,
      createNamespace,
      debug,
      dryRun
    );

    runHelmCommand(args);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
