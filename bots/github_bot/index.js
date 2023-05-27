const cron = require('node-cron');
const {Base64} = require('js-base64');
//const { config } = require('./config/config.json');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN, userAgent: 'myApp v1.2.3',});

const constants = {	owner: "mo9a7i", repo: "time_now", branch: 'newest_time'};

console.log('running github bot')

//commit every minute

async function commit_time(data){
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

async function create_issue(data){
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
		console.log(result)
		return issue_id;
	} 
	catch (error) {
		throw error;
		console.error(error);
	}
}

async function comment_on_issue(data){
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

async function create_pull(data){
	try {	
		let result = await octokit.pulls.create({
			...constants,
			title: data.title,
			body: data.body,
			base: 'main',
			head: `${data.branch_name}`,
		});
		console.log("Pull_number", result.data.number);
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

async function run(){
	try {
		const date_now = Date.now();
		// Create Issue
		console.log(`creating issue`)

		const issue_id = await create_issue({
			date: date_now, 
			title:`Check if time is accruate - ${date_now}`,
			body:`Please check if the time in \`time_now.txt\` 
				file is synchronized with world clocks ${date_now} and 
				if there are any other issues in the repo.`
		});

		console.log(issue_id)

		

		// update the time
		console.log(`committing the new time`)
		await commit_time({
			date: date_now, 
			message: `Update time to "${date_now}"`, 
			branch_name: constants.branch
		});
		
		// Pull request to main
		const pull_number = await create_pull({
			date:date_now, 
			branch_name: constants.branch,
			title: `Lets adjust to - ${date_now}`,
			body: `Time seems a little bit off 🤢.`
		});

		console.log(`created pull request # ${pull_number}`)
		
		// Review it
		console.log(`reviewing # ${pull_number}`)
		await create_review({
			pull_number: pull_number,
			body: '👍 looks fine now, ready to merge'
		});
		
		// Accept and merge
		console.log(`merging # ${pull_number}`)
		await create_merge(pull_number);


		// respond to issue and close
		console.log(`commenting on issue # ${issue_id}`)
		await comment_on_issue({
			issue_id: issue_id, 
			body:`looks like it is 👌🏼.`
		});
		console.log(`closing issue # ${issue_id}`)

		await close_issue(issue_id);
	} 
	catch (error) {
		console.error(error);
	}
}
cron.schedule('* */20 * * * *', async () => {
	await run();
});

run();



