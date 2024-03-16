const puppeteer = require("puppeteer");

(async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the webpage
  await page.goto(
    "https://www.albertahealthservices.ca/waittimes/Page14230.aspx"
  );

  // Extract hospital names and wait times
  const data = await page.evaluate(() => {
    const hospitals = [];
    const hospitalNodes = document.querySelectorAll(
      ".mainContentBlock .w2p_tbl tbody tr"
    );
    hospitalNodes.forEach((node) => {
      const name = node.querySelector("td:first-child").textContent.trim();
      const waitTime = node.querySelector("td:last-child").textContent.trim();
      hospitals.push({ name, waitTime });
    });
    return hospitals;
  });

  console.log("Hospital Data:", data);

  // Close the browser
  await browser.close();
})();
