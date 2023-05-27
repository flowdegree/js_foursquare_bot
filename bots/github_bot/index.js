const cron = require('node-cron');
const {Base64} = require('js-base64');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN, userAgent: 'myApp v1.2.3',});
const cronstrue = require('cronstrue');

const constants = {	owner: "mo9a7i", repo: "time_now", branch: 'newest_time'};
const interval = '0 0 * * * *';
const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log(`running github bot every ${cronstrue.toString(interval)}`)

async function create_issue(data){
	console.log(`creating issue`)

	try {
		console.log('before issue')
		let result = await octokit.issues.create({
			...constants,
			title: data.title,
			body: data.body,
			labels: [],
		});
		console.log('after issue')
	
		const issue_id = result?.data?.number;
		console.log('issue id is: ', result?.data?.number)
		
		return issue_id;
	} 
	catch (error) {
		console.log('error occured at issue creation')
		throw error;
		console.error(error);
	}
}

async function commit_time(data){
	console.log(`committing the new time`)
	try {
		const path = `README.md`;

		let result = await octokit.repos.getContent({
			...constants,
			ref: 'newest_time',
			path,
		});
		
		const sha = result?.data?.sha;
		const content = Base64.decode(result.data.content);
		const new_content = content.replace(/\(\(.*\)\)/g, `(( ${data.date} ))`);
		const encoded = Base64.encode(new_content);

		result = await octokit.repos.createOrUpdateFileContents({
			...constants,
			path,
			message: data.message,
			branch: data.branch_name,
			content: encoded,
			sha,
		});
		console.log('commit result', result);

		console.log(result ? "Success committing" : "failed comitting");
	} 
	catch (error) {
		console.error(error.response)
	}
}

async function create_pull(data){
	try {	
		let result = await octokit.pulls.create({
			...constants,
			title: data.title,
			body: data.body,
			base: 'main',
			head: `${data.branch_name}`,
		});
		console.log(`created pull request # ${result.data.number}`)
		return result.data.number;

	} catch (error) {
		if (error.status === 422 && error.response.data.message === 'A pull request already exists for mo9a7i:newest_time.') {
			console.log('Pull request already exists for branch:', branch_name);
		} else {
			console.error(error?.response?.data?.errors);
		}
	}
}

async function create_review(data){
	console.log(`reviewing # ${data.pull_number}`)
	
	try {		
		let result = await octokit.pulls.createReview({
			...constants,
			pull_number: data.pull_number,
			body: data.body,
			event: 'COMMENT'
		})
		console.log('✅ Created Review')
		return result;	
	} 
	catch (error) {
		console.error(error?.response?.data?.errors);
	}
}

async function create_merge(pull_number){
	console.log(`merging # ${pull_number}`)
	try {	
		const result = await octokit.pulls.merge({
			...constants,
			pull_number: pull_number,            
		})
		return result;
	} 
	catch (error) {
		console.error(error?.response?.data?.errors);
	}
}

async function comment_on_issue(data){
	console.log(`commenting on issue # ${data.issue_id}`)
	try {
		const result = await octokit.issues.createComment({
			...constants,
			issue_number: data.issue_id,
			body: data.body,
		});

		return result;

	} catch (error) {
		
	}
}

async function close_issue(issue_id){
	console.log(`closing issue # ${issue_id}`)
	try {
		const result = await octokit.issues.update({
			...constants,
			issue_number: issue_id,
			state: 'closed',
		});
		return result;
	} catch (error) {
		
	}
}

async function run(){
	try {
		const date_now = Date.now();
		
		// Create Issue
		const issue_id = await create_issue({
			date: date_now, 
			title:`Check if time is accruate - ${date_now}`,
			body:`Please check if the time in \`time_now.txt\` 
				file is synchronized with world clocks ${date_now} and 
				if there are any other issues in the repo.`
		});
		await sleep(300000);

		// update the time
		await commit_time({
			date: date_now, 
			message: `Update time to "${date_now}"`, 
			branch_name: constants.branch
		});
		await sleep(300000);
		
		// Pull request to main
		const pull_number = await create_pull({
			date:date_now, 
			branch_name: constants.branch,
			title: `Lets adjust to - ${date_now}`,
			body: `Time seems a little bit off 🤢.`
		});
		await sleep(300000);
		
		// Review it
		await create_review({
			pull_number: pull_number,
			body: '👍 looks fine now, ready to merge'
		});
		await sleep(300000);

		// Accept and merge
		await create_merge(pull_number);
		await sleep(300000);

		// respond to issue and close
		await comment_on_issue({
			issue_id: issue_id, 
			body:`looks like it is 👌🏼.`
		});
		await sleep(300000);

		await close_issue(issue_id);
	} 
	catch (error) {
		console.error(error);
	}
}

cron.schedule(interval, async () => {
	await run();
});

run();



