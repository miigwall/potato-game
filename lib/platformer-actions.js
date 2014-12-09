
/*
 * Platformer Actions
 * Click or tap to do something on game
 * 
 */


// Hide Level 2 intro
document.getElementById("before-level-2").onclick = function() {
	document.getElementById("before-level-2").style.display = "none";
	Q.stageScene("level2");
	Q.el.focus();
}

// Hide Level 3 intro
document.getElementById("before-level-3").onclick = function() {
	document.getElementById("before-level-3").style.display = "none";
	Q.stageScene("level3");
	Q.el.focus();
}