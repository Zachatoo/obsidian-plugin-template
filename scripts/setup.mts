import * as process from "process";
import * as path from "path";
import { readFile, writeFile } from "fs/promises";

function invariant(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(`Invariant failed: ${message}`);
	}
}

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

function dashCaseToTitleCase(value: string) {
	return value
		.split("-")
		.map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
		.join(" ");
}

async function replaceInFile(
	relativePath: string,
	searchValue: RegExp,
	replaceValue: string
) {
	const filePath = path.join(process.cwd(), relativePath);
	let contents = await readFile(filePath, "utf-8");
	contents = contents.replace(searchValue, replaceValue);
	await writeFile(filePath, contents, { encoding: "utf-8" });
}

async function readJsonFile(relativePath: string): Promise<unknown> {
	return JSON.parse(
		await readFile(path.join(process.cwd(), relativePath), "utf-8")
	);
}

async function writeJsonFile(relativePath: string, data: object) {
	await writeFile(
		path.join(process.cwd(), relativePath),
		JSON.stringify(data, null, "\t") + "\n",
		"utf-8"
	);
}

async function main() {
	try {
		const [repoName] = process.cwd().split("/").slice(-1);
		const pluginID = repoName.split("-").slice(1).join("-");
		const pluginClassName = `${dashCaseToPascalCase(pluginID)}Plugin`;
		const pluginName = `${dashCaseToTitleCase(pluginID)} Plugin`;

		const manifest = await readJsonFile("manifest.json");
		invariant(
			manifest && typeof manifest === "object",
			"Missing manifest.json"
		);
		invariant("id" in manifest, "Missing id in manifest.json");
		manifest.id = pluginID;
		invariant("name" in manifest, "Missing name in manifest.json");
		manifest.name = pluginName;
		invariant(
			"description" in manifest,
			"Missing description in manifest.json"
		);
		const description = await prompt("Plugin description: ");
		manifest.description = description;
		await writeJsonFile("manifest.json", manifest);

		await replaceInFile(
			path.join("src", "main.ts"),
			/MyPlugin/g,
			pluginClassName
		);

		process.stdin.pause();
	} catch (error) {
		console.log("There's an error!");
		console.log(error);
	}
	process.exit();
}

main();
