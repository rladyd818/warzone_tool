import React, { useState, useCallback } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MailIcon from "@material-ui/icons/Mail";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, Redirect } from "react-router-dom";
import "../css/Main.css";

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flex: 1,
		height: "1px",
	},
	drawer: {
		width: drawerWidth,
		height: "100%",
		flex: 1,
		display: "flex",
	},
	menuButton: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up("sm")]: {
			display: "none",
		},
	},
	drawerPaper: {
		width: drawerWidth,
		position: "relative",
		backgroundColor: "#3f51b5",
		color: "white",
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
}));

function Sidebar({ children }) {
	const classes = useStyles();
	const history = useHistory();
	const pages = ["/", "/dungeon", "/raid", "/arena", "/common"];
	const [nowPage, setNowPage] = useState(0);

	const itemClick = useCallback((idx) => {
		return () => {
			setNowPage(idx);
			history.push(pages[idx]);
		};
	}, []);

	const drawer = (
		<div>
			<Divider className={{ backgroundColor: "#fafafa" }} />
			<List>
				{["로그", "던전 모드", "뇌솔드 모드", "아레나 모드", "공통 알람"].map(
					(text, index) => (
						<ListItem
							button
							key={text}
							onClick={itemClick(index)}
							style={
								index === nowPage
									? { backgroundColor: "#6573c3" }
									: { backgroundColor: "#3f51b5" }
							}
						>
							<ListItemIcon>
								{index % 2 === 0 ? (
									<InboxIcon style={{ backgroundColor: "#3f51b5" }} />
								) : (
									<MailIcon style={{ backgroundColor: "#3f51b5" }} />
								)}
							</ListItemIcon>
							<ListItemText primary={text} />
						</ListItem>
					)
				)}
			</List>
			<Divider />
		</div>
	);

	return (
		<div className={classes.root}>
			<CssBaseline />
			<nav className={classes.drawer} aria-label="mailbox folders">
				<Drawer
					classes={{
						paper: classes.drawerPaper,
					}}
					variant="permanent"
					open
				>
					{drawer}
				</Drawer>
			</nav>
			{children}
		</div>
	);
}

export default Sidebar;
