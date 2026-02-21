    //*********************************************
    //  BEFORE WINDOW LOAD
    //*********************************************

        // Control of the functions exists
        $.fn.exists = function () { return this.length > 0; };

    //*********************************************
    //  MOBILE & BROWSER DETECTERS
    //*********************************************

        // Check the device for mobile or desktop
        var mobile = false;
        function checkTheDevice() {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 992 ) {
                    mobile = true;
                    document.body.classList.add("mobile");
                    document.querySelectorAll('.animated').forEach(el => el.classList.add("visible"));
                }
            else{ mobile = false; document.body.classList.remove("mobile") }
        }
        checkTheDevice();
        window.onresize = function(){checkTheDevice();};
        // Check the browsers
        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
            // Firefox 1.0+
            isFirefox = typeof InstallTrigger !== 'undefined',
            // Safari 3.0+ "[object HTMLElementConstructor]"
            isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification),
            // Internet Explorer 6-11
            isIE = /*@cc_on!@*/false || !!document.documentMode,
            // Edge 20+
            isEdge = !isIE && !!window.StyleMedia,
            // Chrome 1+
            isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
            // Blink engine detection
            isBlink = (isChrome || isOpera) && !!window.CSS,
            // Parallax effects for selected browsers
            isParallaxBrowsers =  (isOpera || isFirefox || isBlink || isChrome);

        // Add .ite-browser class if browsing with internet explorer.
        if (isIE){ $("body").addClass("ie-browser"); }
        if (isEdge){ $("body").addClass("edge-browser"); }

        //Detect window height
        function detectWindowHeightChange(elm, callback){
            var lastHeight = elm.clientHeight, newHeight;
            (function run(){
                newHeight = elm.clientHeight;
                if( lastHeight != newHeight )
                    callback();
                lastHeight = newHeight;
                if( elm.onElementHeightChangeTimer )
                    clearTimeout(elm.onElementHeightChangeTimer);
                elm.onElementHeightChangeTimer = setTimeout(run, 200);
            })();
        }

        // If mobile device - DO ANYTHING FOR ONLY MOBILE
        if (mobile === true) {
            //do something else for mobile devices
        // If not mobile device DO ANYTHING FOR ONLY DESKTOPS
        } else{
            //Call parallax effect and get parallax containers
            var parallaxElem = document.querySelectorAll(".parallax");
            Array.prototype.forEach.call(parallaxElem, function(elem){
                elem.parentNode.classList.add('has-parallax');
            });
            //Ready skrollr effects
            var s = skrollr.init({
                forceHeight: false,
                smoothScrolling: false
            });

            //Set the parallax items
            $('body').addClass('stable');
            $(window).on("scroll", function(){
                if($('body').hasClass('stable')){
                    //Refresh parallax effect
                    setTimeout( function(){ if (isParallaxBrowsers) { s.refresh(); } }, 500);
                    window.dispatchEvent(new Event('resize'));
                    $('body').removeClass('stable');
                }
            });

            //Show and hide extra Navigation
            function showHideExtraNav() {
                if (mobile === false) {
                    var nowPos = $(window).scrollTop();
                    //Extra navigation variations
                    var extranav = $('.extra-nav'), showExNav = extranav.attr('data-showme'), hideExNav = extranav.attr('data-hideme');
                    if ($(hideExNav).exists() && $(showExNav).exists()){
                        var showSection = $(showExNav).offset().top, hideSection =  $(hideExNav).offset().top;
                        if($(window).width() > 700){
                            if(nowPos >= showSection - 60 && nowPos <= hideSection - 60) {$(extranav).slideDown(150).removeClass('hiding'); } else{$(extranav).addClass('hiding').slideUp(150);}
                        }
                    } else {
                        $(extranav).slideDown(150).removeClass('hiding').find('ul.nav').html('<li class="colored d-flex align-items-center">Extra Navigation is here! Please check the data-showme and data-hideme areas. This page does not have these links.</li>');
                    }
                }
            }
            $(window).on("scroll", function(){ showHideExtraNav(); });

            //Detect window height changes and refresh parallax and light gallery for portfolios 
            detectWindowHeightChange(document.body, function(){
                //Animated Items
                Waypoint.refreshAll();
                setTimeout( function(){ if (isParallaxBrowsers) { s.refresh(); } }, 200);
            });

            //Do something else for only large screen devices
        }

    //*********************************************
    //  Detect Retina Screens and use retina logo
    //*********************************************
    //Detect retina screen type
        function isRetina(){
            return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
        }
    //Add .retina-device class to body if the device is retina. And change images for retina screens
        if (isRetina()) {
            $("body").addClass("retina-device");
            $("[data-retina]").each(function(){
                var $this = $(this), $rtnIMG = $(this).attr("data-retina");
                $(this).attr("src", $rtnIMG);
            });
        }

    //Start all lazy loads
        lazyLoadAll = "[data-bg]:not(.bg-mobiled), [data-src]";
        var LazyLoad = new LazyLoad({
            elements_selector: lazyLoadAll,
        });
        window.lazyLoadOptions = {
            threshold: 0,
            // Assign the callbacks defined above
        };

    //Popovers
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
             return new bootstrap.Popover(popoverTriggerEl)
        });

    //*********************************************
    //  CUSTOMIZABLE SLIDER FOR ALL THEME
    //*********************************************

        //Custom slider - usable for everything
        if ($(".custom-slider").exists() && rdy) {
            $('.custom-slider').each(function(){
                var $this = $(this);
                $($this).slick({
                    //Default Options
                    fade: true,
                    dots: false,
                    arrows: false,
                    autoplay: false,
                    autoplaySpeed: 3000,
                    pauseOnHover: true,
                    lazyLoad: 'ondemand',
                    infinite: true,
                    rtl: false,
                    edgeFriction: 0.35,
                    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
                    touchThreshold: 150,
                    speed: 400,
                    waitForAnimate: true,
                    slidesToShow: 1,
                    initialSlide: 0,
                    draggable: false,
                    adaptiveHeight: true,
                    variableWidth: false,
                    prevArrow: '<div class="slider-prev d-flex align-items-center justify-content-center"></div>',
                    nextArrow: '<div class="slider-next d-flex align-items-center justify-content-center"></div>',
                    centerMode: false,
                    slidesToScroll: 1,
                    setPosition: 1,
                    swipe: true,
                    touchMove: true,
                    rows: 0,
                    responsive: [{
                          breakpoint: 992,
                          settings: { slidesToShow: 1, slidesToScroll: 1 }
                        }, {
                          breakpoint: 600,
                          settings: { slidesToShow: 1, slidesToScroll: 1 }
                        }
                    ]
                }).on('afterChange', function(event, slick, currentSlide, prevSlide){
                    var items = $($this).find('.animate'),
                        current = $($this).find('.slick-current .animate'),
                        nCurrent = $($this).find('.slick-slide:not(.slick-current) .animate');
                    Waypoint.refreshAll();
                    $(current).each(function() {
                        var item = $(this), animation = item.data('animation'), animationDelay = item.data('animation-delay');
                        setTimeout(function(){ item.addClass( animation + " visibleme" ); }, animationDelay);
                    });
                    $(nCurrent).each(function() {
                        var item = $(this), animation = item.data('animation');
                        item.removeClass( animation + "visibleme" );
                    });
                    $('.slick-current video').each(function () {this.play();});
                    $('.slick-slide:not(.slick-current) video').each(function () {this.pause();});
                    $($this).find('.slick-current .zoom-timer').addClass("scaling");
                    document.querySelectorAll(".slick-current animate").forEach(element => {
                        element.beginElement();
                    });
                }).on('beforeChange', function(event, slick, currentSlide, nextSlide){
                    Waypoint.refreshAll();
                    var items = $($this).find('.animate'),
                        nCurrent = $($this).find('.slick-slide:not(.slick-current) .animate');
                    var nCurrent = $($this).find('.slick-slide:not(.slick-current) .animate') ,items = $($this).find('.animate');
                    $(nCurrent).each(function() {
                        var item = $(this), animation = item.data('animation'), animationDelay = item.data('animation-delay');
                        $(item).removeClass( animation + " visibleme" );
                    });
                    $($this).find('.zoom-timer').removeClass("scaling");
                    //Change navigation detail colors with slide
                    var nextItem = $('[data-slick-index=' + nextSlide + ']');
                    if ($(nextItem).hasClass("nav-to--dark")) {$(".modern-nav").removeClass("details-white").addClass("details-dark")}
                    if ($(nextItem).hasClass("nav-to--white")) {$(".modern-nav").removeClass("details-dark").addClass("details-white")}
                });
            });
            //Block drag the .custom-slider when sliding images.
            $('.custom-slider').on('touchstart touchmove touchend', function(){ $('.custom-slider').slick("slickSetOption", "swipe", true);});
            $(".custom-slider").find(".slick-current .zoom-timer").addClass("scaling");
            //Work for window load
            $('.custom-slider .slick-current .animate').each(function() {
                var item = $(this), animation = item.data('animation'), animationDelay = item.data('animation-delay');
                $(item).removeClass(animation);
                setTimeout(function(){ item.addClass( animation + " visibleme" ); }, animationDelay);
            });
            //Next&Prev with external buttons
            $("[data-slider-control]").on("click", function(){
                var sliderName = $(this).attr("data-slider-control");
                if ($(this).data('slider-dir') === 'prev') {
                    $(sliderName).slick('slickPrev');
                } if ($(this).data('slider-dir') === 'next') {
                    $(sliderName).slick('slickNext');
                }
            });
        }


    // init Isotope
        var $grid = $('.grid-layout');

        $($grid).each(function(){
            var $gridFilterStart = $(this).attr("data-default-filter");
            $(this).isotope({
                filter: $gridFilterStart
            });
        });

    // filter items on button click
        $('[data-filter]').on('click', function() {
            var filterValue = $(this).attr('data-filter'),
                targetID = $(this).attr("data-target-layout");

            if (targetID == "#wwd") {
                $(targetID).isotope({ 
                    filter: filterValue,
                    itemSelector: ".item",
                    hiddenStyle: { opacity: 0, },
                    visibleStyle: { opacity: 1,},
                    transformsEnabled: false
                });
            } else{
                $(targetID).isotope({ 
                    filter: filterValue,
                    itemSelector: ".item",
                    transitionDuration: '0.8s',
                });
            }
            $("[data-filter]").each(function(){
                var tar = $(this).attr("data-target-layout");
                if (tar === targetID) { $(this).removeClass("active"); }
            });
            $(this).addClass("active");
            setTimeout( function(){ if (isParallaxBrowsers && mobile === false) { s.refresh(); } }, 50);
            return false;
        });

    // Re-layout isotope when window resizing
        $(window).resize(function(){ $($grid).isotope('layout'); });

//*********************************************
//  WINDOW LOAD FUNCTION
//*********************************************

$(window).on("load", function(){

    'use strict';

    if (rdy) {

    //Hide all controls with mouseover for sliders
        if ($('.controls-mouseover').exists()){
            $('.controls-mouseover').each(function(){
                var tarID = $(this).attr("id"),
                elem =  $('[data-slider-control="#'+tarID+'"]');
                elem.addClass("hiding");
                //Get class when mouseover
                $(this, elem).on("mouseenter", function(){ $(elem).addClass("showing");$(elem).removeClass("hiding");})
                $(this, elem).on("mouseleave", function(){ $(elem).removeClass("showing");$(elem).addClass("hiding");});
            });
        }

    //Progress Bars
        if ($('.progress-bar').exists()){
            $('.progress-bar').each(function(){
                var $this = $(this);
                $($this).waypoint(function(){
                    var dataSource = $($this).attr('data-value');
                    $($this).animate({ "width" : dataSource + "%"}, 600);
                    this.destroy();
                }, {offset: '90%'});
            });
        }

    //Animated Items for desktops
        $.fn.animatedItems = function() {
            if ( mobile === false) {
                $('.animated').each(function() {
                    var item = $(this), animation = item.data('animation'), animationDelay = item.data('animation-delay');
                    $(item).waypoint(function() {
                        if ( !item.hasClass('visible') && animation ) {
                            if ( animationDelay ) { setTimeout(function(){ item.addClass( animation + " visible" ); }, animationDelay); }
                            else { item.addClass( animation + " visible" ); }
                        } else{ item.addClass("visible"); }
                    }, {offset: '93%'});
                });

                $(".animated-container").each(function() {
                     var container = $(this);
                     $(container).find("[data-animation-delay]").each(function() {
                          var item = $(this), animation = $(this).data("animation"), animationDelay = item.data('animation-delay');
                          $(container).waypoint(function() {
                               if ( !item.hasClass('visible') && animation ) {
                                  if ( animationDelay ) { setTimeout(function(){ item.addClass( animation + " visible" ); }, animationDelay); }
                                  else { item.addClass( animation + " visible" ); }
                               } else{ item.addClass("visible"); }
                          }, {offset: '93%'});
                     });
                });
            }
        }
        $("body").animatedItems();

    //Animations with hovers
        var hoverAnimations = function() {
            //Animations for single items - This animations can play on mobile
            var hoverConts = document.querySelectorAll(".has-overlay-hover");
            Array.prototype.forEach.call(hoverConts, function(elem){
                var elems = elem.querySelectorAll(".animated-hover");
                //On hover and touch start events
                function onHover(){
                    Array.prototype.forEach.call(elems, function(el){
                        var delay = el.getAttribute('data-animation-delay'),
                        animation = el.getAttribute('data-animation');
                        setTimeout(function() {el.classList.add(animation, "visible");}, delay);
                    });
                }
                elem.addEventListener('mouseenter', onHover);
                elem.addEventListener('touchstart', onHover);
                //Mouse leave event
                function outHover(){
                    Array.prototype.forEach.call(elems, function(el){
                        var delay = el.getAttribute('data-animation-delay'),
                        animation = el.getAttribute('data-animation');
                        el.classList.remove(animation, "visible");
                    });
                }
                elem.addEventListener('mouseleave', outHover);
            });
        }
        hoverAnimations();
    //Get active class for Bootstrap Accordions
        var accBar = document.querySelectorAll(".acc-bar");
        accBar.forEach(e => e.addEventListener("click", function(){
            var inActiveBars = document.querySelectorAll("[aria-expanded='false']");
                inActiveBars.forEach(elem => elem.classList.remove("active"));
            if (e.getAttribute("aria-expanded") === "true") {e.classList.add("active")}
        }));

    //Work .active-inview elements with inview classes.
        inView('.active-inview')
            .on('enter', el => {
                el.classList.add("active");
            })
            .on('exit', el => {
                el.classList.remove("active");
        });

    //Stay when click on this items.
        document.querySelectorAll('.stay').forEach(el =>
            el.addEventListener("click", function(elem){elem.preventDefault();})
        );

    //Animations with hovers
        var hoverAnimations = function() {
            //Animations for single items - This animations can play on mobile
            var hoverConts = document.querySelectorAll(".has-overlay-hover");
            Array.prototype.forEach.call(hoverConts, function(elem){
                var elems = elem.querySelectorAll(".animated-hover");
                //On hover and touch start events
                function onHover(){
                    Array.prototype.forEach.call(elems, function(el){
                        var delay = el.getAttribute('data-animation-delay'),
                        animation = el.getAttribute('data-animation');
                        setTimeout(function() {el.classList.add(animation, "visible");}, delay);
                    });
                }
                elem.addEventListener('mouseenter', onHover);
                elem.addEventListener('touchstart', onHover);
                //Mouse leave event
                function outHover(){
                    Array.prototype.forEach.call(elems, function(el){
                        var delay = el.getAttribute('data-animation-delay'),
                        animation = el.getAttribute('data-animation');
                        el.classList.remove(animation, "visible");
                    });
                }
                elem.addEventListener('mouseleave', outHover);
            });
        }
        hoverAnimations();


    //Count To
        $.fn.countTo = function(options) {
            // merge the default plugin settings with the custom options
            options = $.extend({}, $.fn.countTo.defaults, options || {});

            // how many times to update the value, and how much to increment the value on each update
            var loops = Math.ceil(options.speed / options.refreshInterval),
                increment = (options.to - options.from) / loops;

            return $(this).each(function() {
                var _this = this,
                    loopCount = 0,
                    value = options.from,
                    interval = setInterval(updateTimer, options.refreshInterval);

                function updateTimer() {
                    value += increment;
                    loopCount++;
                    $(_this).html(value.toFixed(options.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, "."));

                    if (typeof(options.onUpdate) === 'function') {
                        options.onUpdate.call(_this, value);
                    }

                    if (loopCount >= loops) {
                        clearInterval(interval);
                        value = options.to;

                        if (typeof(options.onComplete) === 'function') {
                            options.onComplete.call(_this, value);

                        }
                    }
                }
            });
        };
        $.fn.countTo.defaults = {
            from: 0,  // the number the element should start at
            to: 100,  // the number the element should end at
            speed: 1000,  // how long it should take to count between the target numbers
            refreshInterval: 100,  // how often the element should be updated
            decimals: 0,  // the number of decimal places to show
            onUpdate: null,  // callback method for every time the element is updated,
            onComplete: null,  // callback method for when the element finishes updating
        };


    // Counter options
        $('.fact').each(function() {
            $(this).waypoint(function() {
                var dataSource = $(this.element).attr('data-source');
                //Count Factors Options
                $(this.element).find('.factor').countTo({
                    from: 0,
                    to: dataSource,
                    speed: 1600,
                    refreshInterval: 10
                });
                this.destroy();
            }, {offset: '100%'});
        });
        // Digits for numbers (.digits class).
        $.fn.digits = function(){ return this.each(function(){ $(this).text( $(this).text().replace(/\B(?=(\d{3})+(?!\d))/g, ".")) }); }
        $(".digits").digits();


    //Cookie Modal Classic
        if ($(".cookie").exists() ) {
            $(".cookie").each(function(){
                var elem = $(this), elemName = $(elem).attr("id"),
                    elemClose = elem.find(".close");
                if ($.cookie(elemName) == null) {
                    var expireTime = $(elem).data("expire");
                    $(elemClose).on("click", function(){
                        $.cookie(elemName, 'yes', { expires: expireTime, path: '/' });
                        $("body").addClass(elemName + "-cookie-in-expire-time").removeClass("cookie-activated");
                        elem.fadeOut(300);
                    });
                    if (elem.hasClass('modal')) {
                        setTimeout( function(){ $(elem).modal("show"); },100);
                        $(elem).on("click", function(ev){
                            $.cookie(elemName, 'yes', { expires: expireTime, path: '/' });
                            $(elem).find(".modal-dialog").on("click", function(){event.stopPropagation(ev);});
                        });
                    } else{
                        elem.show().addClass("cookie-active");
                        $("body").addClass("cookie-activated");
                    }
                } else{
                    elem.addClass("cookie-in-expire-time");
                    $("body").addClass(elemName + "-cookie-in-expire-time");
                }
            });
        }


/* ==============================================
Close alerts
============================================== */

    $(".alert .close").click(function(){
        $(this).parent().animate({'opacity' : '0'}, 300).slideUp(300);
        return false;
    });

/* ==============================================
PAGE LOADER
============================================== */
    
    var $pageloader = $('.page-loader');
    var $pageloaderItem = $pageloader.find(".loader");
    setTimeout(function() {
        $pageloader.addClass("page-loader--fading-out");
        $pageloaderItem.addClass("page-loader--fading-out");
    }, 100);
    setTimeout(function() {
        $pageloader.removeClass("page-loader--fading-out").addClass("page-loader--hidden");
    }, 800);

//*********************************************
//  NAVIGATION SCRIPTS
//*********************************************

    //Get Navigation class names
        var themeNav = $(".modern-nav"),
            stickyNav = $(".modern-nav.sticky"),
            hideByScroll = $(".hide-by-scroll");

    //Call sticky for navigation
        $(stickyNav).sticky({topSpacing:0});

    //Scroll Spy
        var navMenu = document.querySelector(".modern-nav .nav-menu") || false;
        if (navMenu) {
            var inlineLink = navMenu.querySelector("a[href^='#']:not([href='#']):not(.no-scroll):not([data-slide]):not([data-toggle])");
            if (inlineLink) {
                var scrollSpy = new bootstrap.ScrollSpy(document.body, { target: ".modern-nav .nav-menu", offset: 150 });
            }
        }

    //Get class when mouseover
        $(".modern-nav").on("mouseenter", function(){ $(".modern-nav").addClass("mouseover");})
        $(".modern-nav").on("mouseleave", function(){ $(".modern-nav").removeClass("mouseover");});

    //Add scrolled class when scroll down
        function getScrolledClass() {
            if ($(window).scrollTop() > 70) {
                if ($(themeNav).hasClass("sticky") || $(themeNav).hasClass("fixed") ) {
                    $(themeNav).addClass("scrolled");
                    if ($(".modern-nav .top-bar:not(.cookie)").exists() || $(".modern-nav.has-header-cookie-bar .cookie-active").exists() ) {
                        if (mobile === false) {
                            var barH = $(".modern-nav .top-bar").outerHeight();
                            $(themeNav).css({"-webkit-transform":"translateY(-"+ barH + "px" + ")", "transform":"translateY(-" + barH + "px" + ")"});
                        }
                    }
                }
            }
            else {
                $(themeNav).removeClass("scrolled");
                var barH = $(".modern-nav .top-bar").outerHeight();
                $(themeNav).css({"-webkit-transform":"none", "transform":"none"});
            }
        } getScrolledClass();

        var scroll = function () {
            var linkParent =  $(".nav-menu").find("a").parents("li"), linkParentActive = $(".nav-menu").find("a.active").parents("li");
            $(linkParent).removeClass("active");
            $(linkParentActive).addClass("active");
            getScrolledClass();
            if($(window).scrollTop() + $(window).height() === $(document).height()) {
                $(hideByScroll).removeClass('hiding');
            }
        };

        var waiting = false, endScrollHandle;
        $(window).on("scroll", function () {
            if (waiting) { return; }
            waiting = true;
            // clear previous scheduled endScrollHandle
            clearTimeout(endScrollHandle);
            scroll();
            setTimeout(function () {
                waiting = false;
            }, 50);
            // schedule an extra execution of scroll() after 200ms
            // in case the scrolling stops in next 100ms
            endScrollHandle = setTimeout(function () { scroll(); }, 50);
        });

    //Dropdown styles
    $('.modern-nav .dd-toggle').each(function() {
        var showMobileNav = 992,
            $this = $(this),
            nTimer = null;

        //Element over function work for desktops
        $(this).on('mouseenter', function(){
            if ($(window).width() > showMobileNav) {
                window.clearTimeout(nTimer);
                var $this = $(this), $item = $($this).find('>.dropdown-menu');
                $($item).stop(true,true).addClass("d-flex");
                $('.modern-nav .dd-toggle').not($this).not($(this).parents('.dd-toggle')).not($(this).find('.dd-toggle')).find('.dropdown-menu').stop(true,true).removeClass("d-flex").parents().removeClass("showing");

                //Check screen sizes, dropdown width and heights
                var navTop = $(themeNav).offset().top,
                    navHeight = $(themeNav).outerHeight(),
                    itemTop = $($item).offset().top - navTop,
                    itemWidth = $($this).outerWidth(),
                    itemHeight = $($item).outerHeight(),
                    wHeight = $(window).outerHeight(),
                    ofRight = ($(window).outerWidth() - ($item.offset().left + $item.outerWidth())),
                    thisRight = ($(window).outerWidth() - ($this.offset().left + $this.outerWidth())),
                    ofBottom = ($(window).outerHeight() - (itemTop + $item.outerHeight()));
                if (ofRight < 30) {
                    if ($($item).hasClass('mega-menu')) {
                        if ($($item).hasClass('to-center')) { $($item).addClass('to-left centered-lg').removeClass('to-right to-center').css({'right': - thisRight + 10 + 'px' });}
                        if ($($item).hasClass('to-right')) { $($item).addClass('to-left right-lg').removeClass('to-right to-center').css({'right': - thisRight + 10 + 'px' });}
                    }
                    else {$($item).removeClass('to-right to-center').addClass('to-left');}
                } else{
                    if ($($item).hasClass('centered-lg')) { $($item).addClass('to-center').removeClass('to-right to-left centered-lg').css({'right':'auto' });}
                    if ($($item).hasClass('right-lg')) { $($item).addClass('to-right').removeClass('to-left to-center right-lg').css({'right':'auto' });}
                }
                if (ofBottom < 20) {
                    if (!$($item).hasClass('mega-menu')) { $($item).css({'top': (wHeight -  (itemTop + itemHeight)) - 20 + 'px' }) }
                }
            }
        });
        //Element leave function work for desktops
        $(this).on('mouseleave',function(){
            var $this = $(this), $item = $($this).find('.dropdown-menu');
            if ($(window).width() > showMobileNav) {
                nTimer = window.setTimeout( function(){ $($item).removeClass("d-flex"); }, 400);
            }
        });
        // Close dropdown menu when hover another link
        $('.modern-nav .nav-links>li:not(.dd-toggle) a').on('mouseenter', function(){
            if ($(window).width() > showMobileNav) {
                $('.modern-nav .dropdown-menu').stop().hide();
            }
        });
        //work dropdown for mobile devices
        $(this).find(">a:not(.lg)").on("click", function(){
            var elem = $(this);
            if ($(window).width() < showMobileNav) {
                if (elem.next("ul").length ) { $(elem).attr("href", "#"); }
                $($this).find('>.dropdown-menu').stop().slideToggle({duration: 400, easing: "easeInOutQuart"}).parent().toggleClass("showing");
                $('.modern-nav .dd-toggle').not($this).not($(this).parents('.dd-toggle')).not($(this).find('.dd-toggle')).find('.dropdown-menu').stop(true,true).slideUp({duration: 400, easing: "easeInOutQuart"}).parent(".dd-toggle").removeClass("showing");
                return false;
            }
        });
    });
    // Show/Hide mobile navigation
    $('.mobile-nb').on("click", function(){
        $(".modern-nav .mobile-nav-bg").fadeIn(300);
        $('.modern-nav, .modern-nav .nav-menu').addClass("active");
        $('.modern-nav li').removeClass("showing");
        $('.modern-nav .dropdown-menu').hide(300);
        setTimeout( function(){ $('.modern-nav .nav-menu').addClass("animate"); }, 300);
        return false;
    });
    $('.mobile-nav-bg').on("click", function(){
        $('.modern-nav .nav-menu').removeClass("animate");
        $(".modern-nav .mobile-nav-bg").fadeOut(300);
        $('.modern-nav li').removeClass("showing");
        $('.modern-nav .dropdown-menu').slideUp(300);
        setTimeout( function(){ $('.modern-nav, .modern-nav .nav-menu').removeClass("active"); }, 500);
        return false;
    });


/* ==============================================
SOFT SCROLL EFFECT LINKS
=============================================== */  

    //Smooth Links
        $( "a[href^='#']:not([href='#']):not(.no-scroll):not(.stay):not([data-slide]):not([data-toggle]):not([data-bs-toggle])" ).on('click', function(event) {
            var $anchor = $(this), headerOffset = $('.modern-nav').data("offset"), $target = $($anchor).attr('href');
            event.preventDefault();
            if($($target).length){
                if($('.modern-nav').length){
                    $('html, body').stop().animate({
                        scrollTop : $($anchor.attr('href')).offset().top - headerOffset + "px"
                    }, 920, 'easeInOutExpo');
                } else{
                    $('html, body').stop().animate({ scrollTop : $($anchor.attr('href')).offset().top });
                }
            }
        });

    //Smooth Unloading
        $( "a:not([href^='#']):not([href='#']):not(.no-scroll):not([data-fslightbox]):not(.stay):not([data-slide]):not([data-toggle]):not([target]):not([data-bs-toggle])" ).on('click', function(event) {
            var Exlink = this.getAttribute('href');     
            // Fade In Page Loader
            $('.page-loader').removeClass("page-loader--hidden").addClass("page-loader--fading-out");
            setTimeout( function(){ $('.page-loader').addClass("page-loader--fading-in"); }, 10);
            setTimeout( function(){ document.location.href = Exlink; }, 390);
            setTimeout( function(){ $('.page-loader').removeClass("page-loader--fading-in").addClass("page-loader--fading-out"); }, 1000);
            return false;
        });

    //Back to top
        $( "a[href='#top'], a[href='#home']" ).on('click', function() {
            $('html, body').stop().animate({ scrollTop : 0 }, 920, 'easeInOutExpo');
        });

    // Validate all ".validate-me" forms with animations
        (function () {
            'use strict';

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            var forms = document.querySelectorAll('.validate-me');

            // Loop over them and prevent submission
            Array.prototype.slice.call(forms).forEach(function (form) {
                var checkValidForEach = function () {
                    var invalidElem = form.querySelector("[required]:invalid");
                    if (!invalidElem) {
                        form.classList.remove("no-valid");
                    }
                }
                form.addEventListener('keyup', checkValidForEach, false); 
                form.addEventListener('change', checkValidForEach, false); 
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        form.classList.add("no-valid");
                        form.querySelector("[required]:invalid").focus();
                        event.preventDefault()
                        event.stopPropagation()
                    } else{

                        //Animations for contact form
                        if (form.getAttribute("id") === "contact-form") {
                            var formCont = document.querySelector("#contact-form-container"),
                                formWrapper = document.querySelector(".contact-form-wrapper"),
                                successWrapper = document.querySelector(".success-message-wrapper"),
                                formH = formCont.offsetHeight + "px";
                                formCont.style.height = formH;
                            //Directly
                            setTimeout(function() {
                                formCont.classList.add("success");
                            }, 0);
                            //After half second
                            setTimeout(function() {
                                formWrapper.classList.add("none");
                                successWrapper.classList.remove("none");
                                var successH = successWrapper.offsetHeight + "px";
                                formCont.style.height = successH;
                            }, 900);
                            //After half second - must be in different function
                            setTimeout(function() {
                                successWrapper.classList.add("ready");
                            }, 900);
                        }

                        //Animations for newsletter form
                        if (form.getAttribute("id") === "newsletter-form") {
                            var formContainer = form.querySelector(".form-container"),
                                newsTitle = document.querySelector(".newsletter-title"),
                                successMs = form.querySelector(".success-message");
                            //After 50ms
                            setTimeout(function() {
                                formContainer.classList.add("opacity-0", "hidden", "slow")
                                newsTitle.classList.add("opacity-0", "hidden");
                            }, 50);
                            //After 250ms
                            setTimeout(function() {
                                formContainer.classList.add("none")
                                successMs.classList.remove("none")
                                var startsWith = "height";
                                var classes = newsTitle.className.split(" ").filter(function(v) {
                                    return v.lastIndexOf(startsWith, 0) !== 0;
                                });
                                newsTitle.className = classes.join(" ").trim();
                                newsTitle.classList.add("height-0");
                            }, 250);
                            //After 700ms
                            setTimeout(function() {
                                successMs.classList.remove("opacity-0", "hidden")
                                newsTitle.classList.add("none");
                            }, 700);
                        }
                        
                        var data = this;
                        fetch(data.getAttribute('action'), {
                            method: data.getAttribute('method'),
                            body: new FormData(data)
                        }).then(res=>res.text()).then(function (data) {});
                        event.preventDefault();
                    }
                    form.classList.add('was-validated')
                })
            })
        })()



    }


 }); // END WINDOW LOAD FUNCTION

