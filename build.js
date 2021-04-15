/* Filepath utilities */
const path = require("path");
/* Promise library */
const bluebird = require("bluebird");
const hbs = require("handlebars");
const mkdirp = require('mkdirp')
/*  Creates promise-returning async functions
    from callback-passed async functions      */
const fs = bluebird.promisifyAll(require("fs"));
const { updateHTML } = require("./populate");
const { getConfig, outDir } = require("./utils");

const assetDir = path.resolve(`${__dirname}/assets/`);
const config = path.join(outDir, "config.json");

/**
 * Creates the stylesheet used by the site from a template stylesheet.
 *
 * Theme styles are added to the new stylesheet depending on command line
 * arguments.
 */
async function populateCSS() {
  theme = `dark.css`;
  let template = path.resolve(assetDir, "index.css");
  let stylesheet = path.join(outDir, "index.css");

  try {
    await fs.accessAsync(outDir, fs.constants.F_OK);
  } catch (err) {
    mkdirp(outDir);
  }
  /* Copy over the template CSS stylesheet */
  await fs.copyFileAsync(template, stylesheet);

  /* Get an array of every available theme */
  let themes = await fs.readdirAsync(path.join(assetDir, "themes"));

  /* Read in the theme stylesheet */
  let themeSource = await fs.readFileSync(path.join(assetDir, "themes", theme));
  themeSource = themeSource.toString("utf-8");
  let themeTemplate = hbs.compile(themeSource);
  let styles = themeTemplate({
    background: 'https://images.unsplash.com/photo-1557277770-baf0ca74f908?w=1634'
  });
  /* Add the user-specified styles to the new stylesheet */
  await fs.appendFileAsync(stylesheet, styles);

  /* Update the config file with the user's theme choice */
  const data = await getConfig();
  data[0].theme = theme;
  await fs.writeFileAsync(config, JSON.stringify(data, null, " "));
}

async function populateConfig(opts) {
  const data = await getConfig();
  Object.assign(data[0], opts);
  await fs.writeFileAsync(config, JSON.stringify(data, null, " "));
}

async function buildCommand(username, program) {
  await populateCSS(program);
  let types = ["all"];
  const opts = {
    sort: program.sort,
    order: program.order,
    includeFork: true,
    types,
    twitter: program.twitter
  };

  await populateConfig(opts);
  updateHTML(("%s", username), opts);
}

module.exports = {
  buildCommand,
  populateCSS,
  populateConfig
};
