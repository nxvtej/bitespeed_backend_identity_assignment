/** @format */

import axios from "axios";

async function test() {
	const response = await axios
		.post("http://localhost:3000/identity", {
			phoneNumber: "1234567890",
			email: "test@example.com",
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
