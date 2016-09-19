// Bootstrap JS
// to understand 'expose' and 'exports' see https://webpack.github.io/docs/shimming-modules.html
import 'expose?Util!exports?Util!./bootstrap/util.js';
import 'expose?Carousel!exports?Carousel!./bootstrap/carousel.js';
import 'expose?Collapse!exports?Collapse!./bootstrap/collapse.js';
import 'expose?Dropdown!exports?Dropdown!./bootstrap/dropdown.js';
import 'expose?Modal!exports?Modal!./bootstrap/modal.js';

// // Waypoints
import './plugins/jquery.waypoints.js';

// // Placeholders
import './plugins/jquery.placeholder.js';

// // Video JS
// import 'expose?videojs!./plugins/video.js';

// // Vimeo modal autoplay
import './plugins/jquery.vimeo.api.js';

// // Donut Chart
import './plugins/chart.js';

function navMobileCollapse() {
  // avoid having both mobile navs opened at the same time
  $(document).on('#collapsingMobileUser show.bs.collapse', function () {
    $('#collapsingNavbar').removeClass('in');
    $('[data-target="#collapsingNavbar"]').attr('aria-expanded', 'false');
  });
  $(document).on('#collapsingNavbar show.bs.collapse', function () {
    $('#collapsingMobileUser').removeClass('in');
    $('[data-target="#collapsingMobileUser"]').attr('aria-expanded', 'false');
  });
  // dark navbar
  $(document).on('#collapsingMobileUserInverse show.bs.collapse', function () {
    $('#collapsingNavbarInverse').removeClass('in');
    $('[data-target="#collapsingNavbarInverse"]').attr('aria-expanded', 'false');
  });
  $(document).on('#collapsingNavbarInverse show.bs.collapse', function () {
    $('#collapsingMobileUserInverse').removeClass('in');
    $('[data-target="#collapsingMobileUserInverse"]').attr('aria-expanded', 'false');
  });
}

function navSearch() {
  // hide first nav items when search is opened
  $(document).on('.nav-dropdown-search show.bs.dropdown', function () {
    $(this).siblings().not('.navbar-nav .dropdown').addClass('sr-only');
  })
  // cursor focus
  $(document).on('.nav-dropdown-search shown.bs.dropdown', function () {
    $('.navbar-search-input').focus();
  });
  // show all nav items when search is closed
  $(document).on('.nav-dropdown-search hide.bs.dropdown', function () {
    $(this).siblings().removeClass('sr-only');
  });
}

// function htmlVideo() {
//   videojs("demo_video", {
//     controlBar: {
//       timeDivider: false,
//       fullscreenToggle: false,
//       playToggle: false,
//       remainingTimeDisplay: false
//     },
//     "height": "auto",
//     "width": "auto"
//   }).ready(function() {
//     var myPlayer = this;
//     var aspectRatio = 5 / 12; // aspect ratio 12:5 (video frame 960x400)
//     function resizeVideoJS() {
//         var width = document.getElementById(myPlayer.id()).parentElement.offsetWidth;
//         myPlayer.width(width).height(width * aspectRatio);
//     }
//     resizeVideoJS();
//     window.onresize = resizeVideoJS;
//   });
// }

function scrollToTop() {
  $('.scroll-top').on( 'click', function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1000);
    return false;
  });
}

// TODO FIXME: the window.onload below overrides previous window.onload
function donutChart() {
  // var doughnutData = [
  //   {
  //     value: 324,
  //     color:"#5e98e3",
  //     highlight: "#424753",
  //     label: "Completed"
  //   },
  //   {
  //     value: 34,
  //     color: "#59d0bd",
  //     highlight: "#424753",
  //     label: "In backlog"
  //   },
  //   {
  //     value: 20,
  //     color: "#e8e9ec",
  //     highlight: "#424753",
  //     label: "Without ticket"
  //   }
  // ];
  // window.onload = function(){
  //   var c = document.getElementById("chart-area");
  //   if (c != null) {
  //     var ctx = c.getContext("2d");
  //     window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {
  //       responsive : true,
  //       percentageInnerCutout : 80
  //     });
  //   } else {
  //     return false
  //   }
}

// function videoModal() {

//   // VIMEO

//   $(document).on('#videoModal shown.bs.modal', function () {
//     $("#vimeo-play").vimeo("play");
//   });

//   $(document).on('#videoModal hidden.bs.modal', function () {
//     $("#vimeo-play").vimeo("pause");
//   });

//   // YOUTUBE

//   $('#youtube-trigger').click(function () {

//     var videoSRC     = $(this).attr("data-video"),
//         videoSRCauto = videoSRC + "?autoplay=1&html5=1&rel=0&showinfo=0";

//     $(document).on('#youtubeModal shown.bs.modal', function () {
//       $('#youtube-play').attr('src', videoSRCauto);
//     });

//     $(document).on('#youtubeModal hidden.bs.modal', function () {
//       $('#youtube-play').attr('src', videoSRC);
//     });

//   });
// }

export default function init() {
  navMobileCollapse();
  navSearch();
  // htmlVideo();
  scrollToTop();
  donutChart();
  // videoModal();
}

