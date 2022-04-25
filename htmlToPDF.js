const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster')
const path = require('path');

const urlIDs = [{ 'subject': 4, id: '11489568' }];

let browser, page;

(async () => {

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2, // You can set this to any number you like
    puppeteerOptions: {
      headless: true,
      devtools: false,
      args: [],
    }
  })

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' })
    await page.waitFor(300);
    await page.emulateMediaType('screen');
    const pageTitle = await page.title();
    await page.pdf({
      path: `pdf/subject-${urlIDs[i].subject}-${pageTitle}.pdf`
      , format: 'A4'
      , printBackground: true
      , landscape: true
      , margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
  })

  for (i = 0; i < urlIDs.length; i++) {
    // console.log(`https://learningzone.eurocontrol.int/ilp/customs/Reports/AdminFunctions/Execute/Goto/${urlIDs[i]}`)
    await cluster.queue(`https://learningzone.eurocontrol.int/ilp/customs/Reports/AdminFunctions/Execute/Goto/${urlIDs[i].id}`)
  }

  await cluster.idle()
  await cluster.close()




  // browser = await puppeteer.launch({
  //   args: ['--no-sandbox', '--disable-setuid-sandbox']
  //   , headless: true // printo to pdf only works in headless mode currently
  // });
  // page = await browser.newPage();

  // 4.1 11489568

  // this section can loop for processing of multiple files if needed.
  // var pagePath = 'https://learningzone.eurocontrol.int/ilp/customs/Reports/AdminFunctions/Execute/Goto/11489568';
  // var thispage = await page.goto(pagePath, { waitUntil: 'networkidle2' });
  // await page.waitFor(300);
  // await page.emulateMediaType('screen');
  // await page.pdf({
  //   path: 'pdf/4.1-introduction.pdf'
  //   , format: 'A4'
  //   , printBackground: true
  //   , landscape: true
  //   , margin: { top: "0", right: "0", bottom: "0", left: "0" }
  // });


  // await browser.close();
})();
