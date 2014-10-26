
/*
 * Platformer Actions
 * Click or tap to do something on game
 * 
 */


// Hide Level 2 introduction
document.getElementById("play-level-2").onclick = function() {
	document.getElementById("before-level-2").style.display = "none";
	Q.el.focus();
}