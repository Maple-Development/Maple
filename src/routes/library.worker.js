import * as Comlink from 'comlink';

const fileHandler = {
	// @ts-ignore
	async processFiles(files) {
		// Define a function to wait for an acknowledgment message
		const waitForAck = () => {
			return new Promise((resolve) => {
				// @ts-ignore
				const onMessage = (e) => {
					let tags = e.data;
					console.log(tags.tags.artist);
					// @ts-ignore
					resolve();
					self.removeEventListener('message', onMessage);
				};
				self.addEventListener('message', onMessage);
			});
		};

		const readFile = (/** @type {{ name: any; }} */ file) => {
			return Promise.resolve({ name: file.name, content: file });
		};

		for (const file of files) {
			try {
				const fileContent = await readFile(file);
				console.log(`Processed file: ${fileContent.name}`);
				postMessage(fileContent);
				await waitForAck();
			} catch (error) {
				console.error(`Error processing file: ${file.name}`, error);
			}
		}
	}
};

Comlink.expose(fileHandler);
