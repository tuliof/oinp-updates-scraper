const pp = require('puppeteer');

const url = 'https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates';

async function getOINPsection() {
	const browser = await pp.launch({
		headless: true
	});

	process.on("unhandledRejection", (reason, p) => {
	  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
	  browser.close();
	});

	const page = await browser.newPage();
	
    await page.setDefaultNavigationTimeout(0);
	
	try {
		const response = await page.goto(url);
		await page.waitFor(3000);
		
		console.log("Status code:", response.status());
		
		const result = await page.evaluate(() => {
			let body = document.querySelector('body').innerText;
			console.log('hey ho!');
			console.log('Body: ' + body);
			let section = document.querySelector('h2#section-0');
			let sectionMonth = section.innerText;
			let sectionDate = section.nextElementSibling.innerText;
			let firstParagraph = section.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
			
			return { sectionMonth, sectionDate, firstParagraph };
		});
		
		await browser.close();
		return result;
	} catch(err) {
		console.log(err);
	}
}

getOINPsection().then((page) => {
	console.log(page);
	if (page.sectionDate == null) {
		console.log('Could not find target element.');
		return;
	}
	
	console.log('Message length: ' + page.sectionDate.length + page.firstParagraph.length);
	let preview = '\n\t' + page.sectionDate + '\n\t' + page.firstParagraph.slice(0, 160 - page.sectionDate.length);
	console.log('\n#Preview: ' + preview);
	
	// Message should be:
	/*
	OINP was updated on <date>
	https://www.....
	*/
	
	/*
	// To-Do:
	- Shorten url
	- Send SMS
	- Send SMS to me in case of error
	*/
	
});