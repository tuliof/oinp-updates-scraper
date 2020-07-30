# OINP Scraping and notify agent

JS scraper that get's the latest update on the "Ontario Immigrant Nominee Program Updates" page, if a new update is found, it sends an SMS to notify.

OINP 2020 Updates page: https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates

## How to run

1. `npm install`
2. `npm start`

## Tasks

 - [x] Scrap the OINP page
 - [x] Send notification
 - [ ] Add an example .env
 - [ ] Add a feature flag on .env to toggle sending SMS
 - [ ] Modify script to run in AWS Lambda
 - [ ] Persist data
   - [ ] Write/Read AWS S3
   - [ ] Write to DB
 - [ ] Scrap other provincial program sites



### References: 
 - https://aws.amazon.com/blogs/compute/running-executables-in-aws-lambda/

