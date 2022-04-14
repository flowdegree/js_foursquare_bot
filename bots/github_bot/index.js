// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const {Base64} = require('js-base64');

const { config } = require('./config/config.json');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: config.github.mo9a7i.token,
});


const constants = {
	owner: "6degrees",
	repo: "time_now",
}
//commit every minute
async function commit_time(branch_name = undefined){
	try {
		const timenow =  Base64.encode(`${Date()}`);

		const path = `time_now.txt`;
		let result = await octokit.repos.getContent({
			...constants,
			path,
		});
		
		const sha = result?.data?.sha;


		
		if(branch_name){
			const branch_sha = await octokit.rest.git.getRef({
				...constants,
				ref: 'heads/main',
			});

			const sha = branch_sha?.data?.object?.sha;

			console.log(sha);

			result = await octokit.rest.git.createRef({
				...constants,
				ref: `refs/heads/${branch_name}`,
				sha,	
			});
			constants.branch = branch_name;
		}
		
		

		result = await octokit.repos.createOrUpdateFileContents({
			...constants,
			path,
			message: `Update time to "${Date.now()}"`,
			content: timenow,
			sha,
		});

		if(branch_name){
			await create_pull(branch_name);
		}
		
		console.log(result || 500);
	} catch (error) {
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
			assignees: ["mo9a7i"],
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
		console.log("pull_number", result.data.number);

		result = await octokit.pulls.createReview({
			...constants,
			pull_number: result.data.number,

		})
		result = await octokit.pulls.merge({
			...constants,
			pull_number: result.data.number,
			commit_title: 'merging branches'
		})

	} catch (error) {
		console.error(error?.response?.data?.errors);
	}
}


//create_issue();
commit_time();
commit_time('another_branch_ttt');
//create_pull();


cron.schedule('* * * * *', () => {
	try {
		commit_time();
	} catch (error) {
		console.error(error);
	}
});
 
