
/*
 * Platformer Actions for Start Screen elements
 * 
 */


// Leave main screen
document.getElementById("main-screen").onclick = function() {
	document.getElementById("main-screen").style.display = "none";
	document.getElementById("scene-1").style.display = "block";
}

// Leave main screen
document.getElementById("scene-1").onclick = function() {
	document.getElementById("scene-1").style.display = "none";
	document.getElementById("scene-2").style.display = "block";
}

// Leave main screen
document.getElementById("scene-2").onclick = function() {
	document.getElementById("scene-2").style.display = "none";
	document.getElementById("scene-3").style.display = "block";
}

// Leave main screen
document.getElementById("scene-3").onclick = function() {
	window.location.href = "play.html";
}