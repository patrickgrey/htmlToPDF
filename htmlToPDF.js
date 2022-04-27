const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster')

// https://stackoverflow.com/questions/54527982/why-is-puppeteer-reporting-unhandledpromiserejectionwarning-error-navigation

// https://learningzone.eurocontrol.int/ilp/customs/Reports/AdminFunctions/Execute/Goto/11490738

const urlObjects = [
  { 'subject': 4, id: '11489568' },
  { 'subject': 4, id: '11490542' },
  { 'subject': 4, id: '11490727' },
  { 'subject': 4, id: '11490738' }
];

(async () => {

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2, // You can set this to any number you like
    puppeteerOptions: {
      headless: true,
      devtools: false,
      args: ['--enable-features=NetworkService',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--shm-size=3gb'],
    }
  })

  await cluster.task(async ({ page, data: urlObject }) => {
    try {
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (request.resourceType() === 'script')
          request.abort();
        else
          request.continue();
      });
      // await page.setJavaScriptEnabled(false);
      await page.goto(`https://learningzone.eurocontrol.int/ilp/customs/Reports/AdminFunctions/Execute/Goto/${urlObject.id}`, { timeout: 0, waitUntil: 'networkidle2' })
      await page.waitForTimeout(5000);
      await page.emulateMediaType('screen');
      await page.addStyleTag({ content: '.scrolltop-wrap{display:none}body::before{display:none}body{background-image:none}.a2-hero-image{max-height:445px}canvas{display:none}.a2-spline-cover{position:relative;trnasform:none;left:0}' })
      const pageTitle = await page.title() || "noTitle" + new Date().getMilliseconds();

      const webHeight = await page.evaluate(function () {
        const body = document.body;
        const html = document.documentElement;
        return Math.max(body.getBoundingClientRect().height, html.getBoundingClientRect().height)
      }) || 10000;
      await page.pdf({
        path: `pdf/subject-${urlObject.subject}-${pageTitle}.pdf`
        // path: `pdf/subject.pdf`
        // , format: 'A4'
        // , height: 10000
        , height: `${(webHeight * 1.3) + 1}px`
        , width: 1600
        , printBackground: true
        , landscape: false
        , margin: { top: "0", right: "0", bottom: "0", left: "0" }
      });
    }
    catch (error) {
      console.log(error);
    }
  })

  for (i = 0; i < urlObjects.length; i++) {
    await cluster.queue(urlObjects[i])
  }

  await cluster.idle()
  await cluster.close()

})();
