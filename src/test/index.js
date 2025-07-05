/** @format */

import axios from "axios";

async function test() {
	const response = await axios
		.post("http://localhost:3000/identity", {
			phoneNumber: "450090",
			email: "te@exe.com",
		})
		.then((res) => res)
		.catch((err) => {
			console.error("Error during request:", err);
			throw err;
		});

	console.log("Response:", response.data);
}

test()
	.then(() => {
		console.log("Test completed successfully");
	})
	.catch((error) => {
		console.error("Error during test:", error);
	});
