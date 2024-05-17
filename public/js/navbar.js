async function loadMovies() {
    // console.log("Request Fired!");

    let searchTerm = $(".nav-search").val();
    // const url = 'https://www.omdbapi.com/?apikey=95e95101&s=' + searchTerm;
    const url = 'https://api.jikan.moe/v4/anime?q=' + searchTerm;
    const res = await fetch(url);
    const data = await res.json();
    $(".autocom-box").empty();
    if (data.data.length !== 0) {
        // console.log(data.data);
        data.data.forEach(function (element) {
            $(".autocom-box").append(
                `<li value="${element.mal_id}" onclick='select(this)'>
                    <img class='suggested-anime-img' src="${element.images.jpg.image_url}" alt=''>
                    <div>${element.title}</div>
                </li>`
            );
            $(".autocom-box").css("padding", "10px 8px");

            // Setting mal_id if search term matches name of the anime
            if (element.title.toLowerCase() === searchTerm.toLowerCase()) {
                $(".nav-search").attr("matched", "");
                $(".nav-search").attr("anime_id", element.mal_id);
            }
        })
    }
    else {
        $(".autocom-box").append(`<li value style='padding: "5px"'>` + "No results found." + "</li>");
    }
}

var typingTimer;
$('.nav-search').keyup(function (e) {
    if ($(".autocom-box").find("li[value]").length > 0) {
        $(".autocom-box").empty();
    };
    if ($(".autocom-box").find(".load-div").length !== 1) {
        $(".autocom-box").append(
            `<div class="load-div" style="display: flex;justify-content: center;">
                <img style="width: 20%;" src="images/loader.gif" alt="">
            </div>`
        )
    };
    clearTimeout(typingTimer);
    if ($(this).val()) {
        typingTimer = setTimeout(loadMovies, 500);
    }
    else if (e.keyCode == 8) {
        $(".search-box li").css("display", "none");
        $(".autocom-box").css("padding", "0");
        $(".autocom-box").empty();
    }
    else {
        $(".search-box li").css("display", "none");
        $(".autocom-box").css("padding", "0");
        $(".autocom-box").empty();
    }
});

function select(element) {
    console.log("hey");
    $(".search-form").removeAttr("onsubmit");
    $(".search-form").attr("action", "/anime/" + element.value);
    $(".search-form").submit();
}

function validateForm() {
    let matchExists = $(".nav-search").attr("matched");
    console.log(matchExists);
    if (matchExists === undefined || matchExists === false) return false;
    else return true;
}

$(document).keypress(function (e) {
    var key = e.which;
    if (key == 13) {
        if (validateForm()) {
            $(".search-form").attr("action", "/anime/" + $(".nav-search").attr("anime_id"));
            $(".search-form").submit();
        }
    }
});

$(".search-section-toggler").on("click", function (e) {
    let searchSection = $(".search-section");
    let currentStatus = searchSection.data("section-active");
    let nextStatus = !currentStatus
    // Setting serach section status to make it visible
    searchSection.data("section-active", nextStatus)
    searchSection.attr("data-section-active", nextStatus);
    // Setting search icon's active status
    $(".nav-link[data-search-section-active]").each(function () {
        $(this).attr("data-search-section-active", nextStatus);
    });

    // If search section is closed and something is searched, cancel all that.
    if (!nextStatus) {
        $(".autocom-box").empty();
        $(".autocom-box").css("padding", 0);
        $(".nav-search").val("");
    }
})