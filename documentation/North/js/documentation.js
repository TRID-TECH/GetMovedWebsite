//Scripts for documentation

var docNav = document.querySelector(".cd-side-nav");
var trigger = document.querySelector(".cd-nav-trigger");

trigger.addEventListener("click", function(){
	if (docNav.classList.contains("nav-is-visible")) {
		docNav.classList.remove("nav-is-visible");
		trigger.classList.remove("nav-is-visible");
	} else{
		docNav.classList.add("nav-is-visible");
		trigger.classList.add("nav-is-visible");
	}

	return false;

});