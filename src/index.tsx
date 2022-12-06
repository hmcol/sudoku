import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Game from "./Game";



// ========================================

let documentRoot = document.getElementById("root");
if (documentRoot !== null) {
	const root = ReactDOM.createRoot(documentRoot);

	root.render(
		<React.StrictMode>
			<Game />
		</React.StrictMode>
	);
}

