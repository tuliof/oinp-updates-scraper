const pp = require('puppeteer');
const request = require('request');

const url = 'https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates';
const short_url = 'https://bit.ly/37JQhW2';

// Load .env file only when running locally
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

async function main() {
	console.log('Starting OINP Scraper.');
	
	const page = {
		sectionDate: 'January 2, 2020',
		firstParagraph: 'The Ontario Immigrant Nominee Program has reached its increased 2019' 
	};
	return page;
	
}

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
		console.error(err);
	}
}

async function sendSMS(message) {
	let credentials = { 
		api_key: process.env.NEXMO_KEY,
		api_secret: process.env.NEXMO_SECRET,
		to: process.env.NEXMO_TO,
		from: process.env.NEXMO_FROM,
		text: message
	};
	request.post('https://rest.nexmo.com/sms/json', { json: credentials }, (err, res, body) => {
		if (err) { return console.log(err) }
		console.log(body);
	});
}

async function formatMessage(page) {
	console.log(page);
	if (page.sectionDate == null) {
		console.error('Could not find target element.');
		return;
	}

	let message = `New update for OINP 2020!\n\nCheck the page ${short_url}\n\n@...\n\nReply 'bye' to stop`;
	message = message.replace('@', page.firstParagraph.slice(0, 161 - message.length));

	console.log(`Message length: ${message.length}`);
	console.log(`\n#Preview: ${message}`);
	return message;
}

async function checkDate(sectionDate) {
	sectionDate = 'Janauary 2, 2020';
	const lastUpdate = new Date(sectionDate);
	
	if (lastUpdate.toDateString() === new Date().toDateString()) {
		
	}
}

main()
	.then(checkDate)
	//.then(getOINPsection)
	//.then(formatMessage)
	//.then(sendSMS);