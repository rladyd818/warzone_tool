import React, { useState } from "react";

const thisOS = process.platform;
function Top() {
	const [platform, setPlatform] = useState(thisOS);
	console.log(platform);
	return (
		<div>
			<h3>Contents Section</h3>
			<h4>Your OS is {platform}</h4>
		</div>
	);
}

export default Top;
