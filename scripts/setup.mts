import * as process from "process";
import * as path from "path";
import { readFile, writeFile } from "fs/promises";

function prompt(question: string) {
	return new Promise((resolve, reject) => {
		process.stdin.resume();
		process.stdout.write(question);

		process.stdin.on("data", (data) => resolve(data.toString().trim()));
		process.stdin.on("error", (err) => reject(err));
	});
}

function dashCaseToPascalCase(value: string) {
	return value
		.split("-")
		.map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
		.join("");
}

async function main() {
	try {
		const [repoName] = process.cwd().split("/").slice(-1);
		const pluginID = repoName.split("-").slice(1).join("-");
		const pluginName = `${dashCaseToPascalCase(pluginID)}Plugin`;
		console.log(repoName);
		console.log(pluginID);
		console.log("pluginName", pluginName);
		process.stdin.pause();
	} catch (error) {
		console.log("There's an error!");
		console.log(error);
	}
	process.exit();
}

main();
