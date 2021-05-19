import React, { useState } from "react";

const thisOS = process.platform;
function Top() {
	const [platform, setPlatform] = useState(thisOS);
	console.log(platform);
	return (
		<div>
			<h1>Test Main Page</h1>
			<h4>Your OS is {platform}</h4>
		</div>
	);
}

export default Top;
