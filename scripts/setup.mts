import * as process from "process";
import * as path from "path";
import {
	readJsonFile,
	removeFile,
	replaceInFile,
	writeJsonFile,
} from "./utils/file-helpers.mjs";
import { prompt } from "./utils/prompt.mjs";
import { invariant } from "./utils/invariant.mjs";
import {
	dashCaseToPascalCase,
	dashCaseToTitleCase,
} from "./utils/string-helpers.mjs";

async function main() {
	try {
		const [repoName] = process.cwd().split("/").slice(-1);
		const pluginID = repoName.split("-").slice(1).join("-");
		const pluginClassName = `${dashCaseToPascalCase(pluginID)}Plugin`;
		const pluginName = `${dashCaseToTitleCase(pluginID)} Plugin`;

		const pluginDescription = await prompt("Plugin description: ");
		invariant(
			typeof pluginDescription === "string",
			"Invalid plugin description provided."
		);

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
		manifest.description = pluginDescription;
		await writeJsonFile("manifest.json", manifest);

		const pkg = await readJsonFile("package.json");
		invariant(pkg && typeof pkg === "object", "Missing package.json");
		invariant("name" in pkg, "Missing name in package.json");
		pkg.name = `obsidian-${pluginID}`;
		invariant("description" in pkg, "Missing description in package.json");
		pkg.description = pluginDescription;
		invariant(
			"scripts" in pkg && pkg.scripts && typeof pkg.scripts === "object",
			"Missing scripts in package.json"
		);
		if ("setup" in pkg.scripts) {
			delete pkg.scripts.setup;
		}
		await writeJsonFile("package.json", pkg);

		await replaceInFile(
			path.join("src", "main.ts"),
			/MyPlugin/g,
			pluginClassName
		);

		await replaceInFile("README.md", /\{\{ pluginID \}\}/g, pluginID);
		await replaceInFile("README.md", /\{\{ pluginName \}\}/g, pluginName);
		await replaceInFile(
			"README.md",
			/\{\{ pluginDescription \}\}/g,
			pluginDescription
		);

		await removeFile("scripts/setup.mts");
		process.stdin.pause();
	} catch (error) {
		console.log("There's an error!");
		console.log(error);
	}
	process.exit();
}

main();
