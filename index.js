const pp = require('puppeteer');
const request = require('request');
const moment = require('moment-timezone');

const url = 'https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates';
const short_url = 'https://bit.ly/37JQhW2';

// Load .env file only when running locally
if (process.env.NODE_ENV === 'production') {
	console.warn('Running PRODUCTION mode');
} else {
	console.warn('Running DEVELOP mode');
	require('dotenv').config();
}

async function main() {
	console.log('Starting OINP test.');
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
	
	console.log('Fetching...');
	const response = await page.goto(url);
	await page.waitFor(3000);

	console.log("Status code:", response.status());

	const result = await page.evaluate(() => {
		let body = document.querySelector('body').innerText;
		let section = document.querySelector('h2#section-0');
		let sectionMonth = section.innerText;
		let sectionDate = section.nextElementSibling.innerText;
		let firstParagraph = section.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
		let updatedTime = document.querySelector('.angular-metatag[property="og:updated_time"]').getAttribute('content');
		return { updatedTime, sectionMonth, sectionDate, firstParagraph };
	});

	await browser.close();
	return result;
}

async function sendSMS(message) {
	if (process.env.FEATURE_SEND_SMS === 'false') {
		console.warn('## Send SMS is turned OFF ##');
		return 0;
	}

	let credentials = { 
		api_key: process.env.NEXMO_KEY,
		api_secret: process.env.NEXMO_SECRET,
		to: '',
		from: process.env.NEXMO_FROM,
		text: message
	};

	// To-Do: Retrieve numbers from DB
	const phones = process.env.NEXMO_TO.split(',');

	phones.forEach(number => {
		credentials.to = number;
		request.post('https://rest.nexmo.com/sms/json', { json: credentials }, (err, res, body) => {
			if (err) { return console.log(err) }
			const msg = body.messages[0];
			console.log(`Status: ${msg.status}\nRemaining: ${msg['remaining-balance'].slice(0, 4)}`);
		});
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
	console.log(`\n#### SMS Preview ####\n ${message}\n#####################`);
	return message;
}

async function checkDate(page) {
	if (process.env.FEATURE_IGNORE_DATE_CHECK === 'true') {
		return page;
	}
	
	const minutesToRun = parseInt(process.env.RUN_EVERY_MINUTES);
	const addMinutes = minutesToRun * 2 - 1;

	const lastUpdate = moment(page.updatedTime);
	lastUpdate.minutes(0);
	lastUpdate.seconds(0);
	lastUpdate.add(addMinutes, 'minutes');
	
	// Server date is in UTC
	const currentDate = moment().utc().tz('America/Toronto');

	console.log(`Read: ${lastUpdate.format()}`);
	console.log(`Expect: ${currentDate.format()}`);

	if (currentDate.isAfter(lastUpdate)) {
		// If not a new post, stop.
		throw new Error("No match, stop!");
	}

	return page;
}

main()
	.then(getOINPsection)
	.then(checkDate)
	.then(formatMessage)
	.then(sendSMS)
	.catch(err => console.log(err.message));