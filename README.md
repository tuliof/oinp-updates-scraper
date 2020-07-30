# OINP Scraping and notify agent

![Deploy to AWS Lambda](https://github.com/tuliof/oinp-updates-scraper/workflows/Deploy%20to%20AWS%20Lambda/badge.svg?branch=develop)

JS scraper that get's the latest update on the "Ontario Immigrant Nominee Program Updates" page, if a new update is found, it sends an SMS to notify.

OINP 2020 Updates page: https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates

## How to run

1. `npm install`
2. `cp .env_example .env`
   1. Obs.: `.env_example` has development defaults. 
3. `npm start`

## Tasks

 - [x] Scrap the OINP page
 - [x] Send notification
 - [x] Add an example .env
 - [x] Add a feature flag on .env to toggle sending SMS
 - [ ] Modify script to run in AWS Lambda
 - [ ] Read phone numbers from the DB
 - [ ] Scrap other provincial program sites

### References: 
 - [GitHub action to deploy AWS Lambda](https://github.com/marketplace/actions/aws-lambda-deploy)