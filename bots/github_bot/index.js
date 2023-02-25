// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const {Base64} = require('js-base64');

const { config } = require('./config/config.json');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({auth: config.github.mo9a7i.token,});

const constants = {	owner: "mo9a7i",	repo: "time_now",}

//commit every minute
async function commit_time(branch_name = undefined){
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
		//process.exit();

		result = await octokit.repos.createOrUpdateFileContents({
			...constants,
			path,
			message: `Update time to "${Date.now()}"`,
			branch: 'newest_time',
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
		issue_id ? console.log(`created issue ${issue_id}`) : console.log('creating issue failed');
	
		// respond and close
		if(issue_id){
			result = await octokit.issues.createComment({
				...constants,
				issue_number: issue_id,
				body: `looks like it is 👌🏼.`,
			});
	
			result = await octokit.issues.update({
				...constants,
				issue_number: issue_id,
				state: 'closed',
			});
		}
	} catch (error) {
		console.error(error);
	}
}

async function create_pull(branch_name){
	try {	
		let result = await octokit.pulls.create({
			...constants,
			title: `Lets adjust to - ${Date.now()}`,
			body: `Adjusting time.`,
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
			body: '👍 looks fine',
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

commit_time();

cron.schedule('0 * * * *', async () => {
	try {
		await commit_time();
		const pull_number = await create_pull('newest_time');
		await create_review(pull_number);
		await create_merge(pull_number);
		
		create_issue();
	} catch (error) {
		console.error(error);
	}
});