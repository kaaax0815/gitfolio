const fs = require("fs");
const emoji = require("github-emoji");
const jsdom = require("jsdom").JSDOM,
  options = {
    resources: "usable"
  };
const { getConfig, outDir, copyStaticFiles } = require("./utils");
const { getRepos, getUser } = require("./api");

function convertToEmoji(text) {
  if (text == null) return;
  text = text.toString();
  var pattern = /(?<=:\s*).*?(?=\s*:)/gs;
  if (text.match(pattern) != null) {
    var str = text.match(pattern);
    str = str.filter(function(arr) {
      return /\S/.test(arr);
    });
    for (i = 0; i < str.length; i++) {
      if (emoji.URLS[str[i]] != undefined) {
        text = text.replace(
          `:${str[i]}:`,
          `<img src="${emoji.URLS[str[i]]}" class="emoji">`
        );
      }
    }
    return text;
  } else {
    return text;
  }
}

module.exports.updateHTML = (username, opts) => {
  const { includeFork, twitter } = opts;
  jsdom
    .fromFile(`${__dirname}/assets/index.html`, options)
    .then(function(dom) {
      let window = dom.window,
        document = window.document;
      (async () => {
        try {
          console.log("Building HTML/CSS...");
          const repos = await getRepos(username, opts);

          for (var i = 0; i < repos.length; i++) {
            let element;
            if (repos[i].archived == false) {
              element = document.getElementById("work_section");
            } else {
              continue;
            }
            element.innerHTML += `
              <a href="${repos[i].html_url}" target="_blank">
                <section>
                    <div class="section_title">${repos[i].name}</div>
                    <div class="about_section">
                    <span style="display:${
                      repos[i].description == undefined
                        ? "none"
                        : "block"
                    };">${convertToEmoji(repos[i].description)}</span>
                    </div>
                    <div class="bottom_section">
                        <span style="display:${
                          repos[i].language == null
                            ? "none"
                            : "inline-block"
                        };"><i class="fas fa-code"></i>&nbsp; ${
                          repos[i].language
                        }</span>
                        <span><i class="fas fa-star"></i>&nbsp; ${
                          repos[i].stargazers_count
                        }</span>
                        <span><i class="fas fa-code-branch"></i>&nbsp; ${
                          repos[i].forks_count
                        }</span>
                    </div>
                </section>
              </a>`;
          }
          const user = await getUser(username);
          document.title = 'Bernd Storath (kaaax0815/kaaaxcreators)';
          var icon = document.createElement("link");
          icon.setAttribute("rel", "icon");
          icon.setAttribute("href", "favicon.png");
          icon.setAttribute("type", "image/png");

          document.getElementsByTagName("head")[0].appendChild(icon);
          document.getElementById(
            "profile_img"
          ).style.background = `url('${user.avatar_url}') center center`;
          document.getElementById(
            "username"
          ).innerHTML = `<span style="display:${
            user.name == null || !user.name ? "none" : "block"
          };">Bernd Storath</span><a href="${user.html_url}">@${user.login}</a>`;
          document.getElementById("userbio").innerHTML = convertToEmoji(
            user.bio
          );
          document.getElementById("userbio").style.display =
            user.bio == null || !user.bio ? "none" : "block";
          document.getElementById("about").innerHTML = `
                <span style="display:block;"><i class="fas fa-envelope"></i> &nbsp; <a target="_blank" href="mailto:request@kaaaxcreators.de">request@kaaaxcreators.de</a></span>
                <span style="display:${
                  user.location == null || !user.location ? "none" : "block"
                };"><i class="fas fa-map-marker-alt"></i> &nbsp;&nbsp; Bayern, Germany</span>
                <span style="display:${
                  user.hireable == false || !user.hireable ? "none" : "block"
                };"><i class="fas fa-user-tie"></i> &nbsp;&nbsp; Available for projects</span>
                <div class="socials">
                <span style="display:block;"><a href="https://www.twitter.com/kaaax0815" target="_blank" class="socials"><i class="fab fa-twitter"></i></a></span>
                <span style="display:block;"><a href="https://www.buymeacoffee.com/kaaaxcreators" target="_blank" class="socials"><i class="fas fa-donate"></i></a></span>
                </div>
                `;
          //add data to config.json
          const data = await getConfig();
          data[0].username = user.login;
          data[0].name = user.name;
          data[0].userimg = user.avatar_url;

          await fs.writeFile(
            `${outDir}/config.json`,
            JSON.stringify(data, null, " "),
            function(err) {
              if (err) throw err;
              console.log("Config file updated.");
            }
          );
          await copyStaticFiles();
          await fs.writeFile(
            `${outDir}/index.html`,
            "<!DOCTYPE html>" + window.document.documentElement.outerHTML,
            function(error) {
              if (error) throw error;
              console.log(`Build Complete, Files can be Found @ ${outDir}\n`);
            }
          );
        } catch (error) {
          console.log(error);
        }
      })();
    })
    .catch(function(error) {
      console.log(error);
    });
};
