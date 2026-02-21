//show panel
var panel = document.getElementById("theme-panel");
var panelButton = document.querySelector(".panel .panel-button.theme-options");
var nav = document.getElementById("navigation");
var backdrop = document.querySelector(".panel-backdrop");
var panelSwitcher = document.getElementById("panel-switcher");
var home = document.getElementById("home") || false;

panelButton.addEventListener("click", function(event){
    if (panelSwitcher.classList.contains("loaded")) {
        panelSwitcher.classList.toggle("active");
        backdrop.classList.toggle("active");
    } else{
        
    }
    if (panelSwitcher.classList.contains("loaded")) {
        event.preventDefault();
    } else{
        async function load_home() {
          let url = 'theme-panel/panel-inner.html'
          panelSwitcher.innerHTML = await (await fetch(url)).text();
        }
        load_home().then(function(){
            panelSwitcher.classList.add("loaded");
            setTimeout(function(){
                panelSwitcher.classList.add("active");
                backdrop.classList.add("active");
            }, 50);
            document.querySelector(".menu-dark").addEventListener("click", function(){
                if (panelSwitcher.classList.contains("loaded")) {
                    nav.classList.remove("nav-white");
                    nav.classList.add("nav-dark");
                    return false;
                }
            })

            document.querySelector(".menu-white").addEventListener("click", function(){
                if (panelSwitcher.classList.contains("loaded")) {
                    nav.classList.remove("nav-dark");
                    nav.classList.add("nav-white");
                    return false;
                }
            })

            document.querySelector(".reset").addEventListener("click", function(){
                if (panelSwitcher.classList.contains("loaded")) {
                    location.reload();
                }
            })

            backdrop.addEventListener("click", function(){
                panelSwitcher.classList.remove("active");
                backdrop.classList.remove("active");
                return false;
            });
            var colorButton = document.querySelectorAll(".color-button");
            colorButton.forEach(function(item){
                item.addEventListener("click", function(){
                    var f = item.getAttribute("data-f"),
                        s = item.getAttribute("data-s"),
                        t = item.getAttribute("data-t");
                    const root = document.querySelector(':root');
                    root.style.setProperty('--colored', f);
                    root.style.setProperty('--colored1', s);
                    root.style.setProperty('--colored2', t);
                });
                
            });
            return false;
        });
    }

    event.preventDefault();
});


    
    panelSwitch();
    window.addEventListener('scroll', panelSwitch);
    function panelSwitch() {
        if (home) {
            if (window.scrollY > 500) {
                panel.classList.remove("hiding-panel")
            } else{
                panel.classList.add("hiding-panel");
            }
        } else {
            panel.classList.add("hiding-panel");
        }
    }