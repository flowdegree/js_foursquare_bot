const cron = require('node-cron');
const {Base64} = require('js-base64');
//const { config } = require('./config/config.json');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const constants = {	owner: "mo9a7i", repo: "time_now",}
console.log('running github bot')
//commit every minute
async function commit_time(branch_name = 'newest_time'){
	try {
		const path = `README.md`;

		let result = await octokit.repos.getContent({
			...constants,
			ref: 'newest_time',
			path,
		});
		
		const sha = result?.data?.sha;
		const content = Base64.decode(result.data.content);
		const new_content = content.replace(/\(\(.*\)\)/g, `(( ${Date()} ))`);
		const encoded = Base64.encode(new_content);

		result = await octokit.repos.createOrUpdateFileContents({
			...constants,
			path,
			message: `Update time to "${Date.now()}"`,
			branch: branch_name,
			content: encoded,
			sha,
		});

		console.log(result ? "Success committing" : "failed comitting");
	} 
	catch (error) {
		console.error(error.response)
	}
}

async function create_issue(){
	try {
		let result = await octokit.issues.create({
			...constants,
			title: `Check if time is accruate - ${Date.now()}`,
			body: `Please check if the time in \`time_now.txt\` file is synchronized with world clocks ${Date.now()} and if there are any other issues in the repo.`,
			labels: [],
		});
	
		const issue_id = result?.data?.number;
		console.log(issue_id ? `created issue ${issue_id}`: 'creating issue failed')
		return issue_id;
	} 
	catch (error) {
		console.error(error);
	}
}

async function comment_on_issue(issue_id, message){
	try {
		const result = await octokit.issues.createComment({
			...constants,
			issue_number: issue_id,
			body: message,
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

async function create_pull(branch_name){
	try {	
		let result = await octokit.pulls.create({
			...constants,
			title: `Lets adjust to - ${Date.now()}`,
			body: `Time seems a little bit off 🤢.`,
			base: 'main',
			head: `${branch_name}`,
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

async function create_review(pull_number){
	try {		
		let result = await octokit.pulls.createReview({
			...constants,
			pull_number: pull_number,
			body: '👍 looks fine now, ready to merge',
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

cron.schedule('* */5 * * * *', async () => {
	try {
		// Create Issue
		console.log(`creating issue`)
		const issue_id = await create_issue();

		// update the time
		console.log(`committing the new time`)
		await commit_time('newest_time');
		
		// Pull request to main
		const pull_number = await create_pull('newest_time');
		console.log(`created pull request # ${pull_number}`)
		
		// Review it
		console.log(`reviewing # ${pull_number}`)
		await create_review(pull_number);
		
		// Accept and merge
		console.log(`merging # ${pull_number}`)
		await create_merge(pull_number);


		// respond to issue and close
		console.log(`commenting on issue # ${issue_id}`)
		await comment_on_issue(issue_id, `looks like it is 👌🏼.`);
		console.log(`closing issue # ${issue_id}`)

		await close_issue(issue_id);
	} 
	catch (error) {
		console.error(error);
	}
});

