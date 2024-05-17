$(document).ready(function () {
    // // Retrieve the stored HTML content from local storage
    // var storedContent = localStorage.getItem('myDivContent');
    // console.log(storedContent);
    // if (storedContent) {
    //     // Set the stored HTML content to the div element
    //     var divElement = $('.popular-ents');
    //     divElement.html(storedContent);
    // }
});
// localStorage.setItem('initialURL', window.location.href);
// // Listen for the popstate event
// $(window).on('popstate', function () {
//     // Check if the current URL is different from the initial URL
//     if (window.location.href !== localStorage.getItem('initialURL')) {
//         // Clear the local storage
//         localStorage.removeItem('myDivContent');
//     }
// });

fetchGenres();
$(".load-more").addClass("hide-btn");
$(".end").toggleClass("hide-end");
async function fetchGenres() {
    const url = "https://api.jikan.moe/v4/genres/anime"
    const data = await fetch(url);
    const parsedData = await data.json();

    parsedData.data.forEach((genre, index) => {
        $(".genre-checkboxes").append(
            `
            <div class="checkbox-label-container">
                <input class="genre-checkbox" type="checkbox" name="${genre.name}" id="${genre.name}" value="${genre.mal_id}">
                <label for="${genre.name}">${genre.name}</label>
            </div>
            `
        )
    })
}


$(".popular-ents").on('click', '.clickThisDiv', function () {
    // updateLocalStorage();
    $(this).find(".recommended-ent").submit();
});

let advancedFilterApplied = false;

let year = "";
let season = "";
// Populating year dropdown
let earliestYear = 1917;
let currentYear = new Date().getFullYear();
while (earliestYear <= currentYear) {
    $("#year-select").append(`<option value="${earliestYear}">${earliestYear}</option>`)
    earliestYear += 1;
}

let url = "";
let page = 1;

$('#year-select').on('change', function () {
    if (!this.value) year = "";
    else year = this.value;
});

$('#season-select').on('change', function () {
    if (!this.value) season = "";
    else season = this.value;
});


$(".year-season-btn").on('click', (e) => {
    e.preventDefault();
    if (year === "" || season === "") {
        alert("Please select year and season");
        return;
    }
    $(".btn-close").trigger("click");
    advancedFilterApplied = false;
    url = "https://api.jikan.moe/v4/seasons/" + year + "/" + season + "";
    page = 1;
    $(".popular-ents").html("");
    loadFilteredAnimes(url);
})

let searchName = "";
let type = "";
let rating = "";
let genres = [];
let order_by = "";
let sort = "";

$(".name-input").keyup((e) => {
    searchName = e.target.value;
    if (order_by === "&order_by=start_date") {
        order_by = "";
        sort = "";
        $('#sort-input option:contains("Sort By")').prop('selected', true);
        alert("The name Filter and the Oldest/Latest Filter Options cannot be used in conjunction with each other!");
    }
})

$('#typeSelect').on('change', function () {
    if (!this.value) type = ""
    else type = "&type=" + this.value;
});

$('#ratingSelect').on('change', function () {
    if (!this.value) rating = "";
    else rating = "&rating=" + this.value;
});

$("#sort-input").on('change', (e) => {
    if (e.target.value === "asc" || e.target.value === "desc") {
        order_by = "&order_by=start_date";
        sort = "&sort=" + e.target.value;
        if (searchName) {
            $(".name-input").val("");
            searchName = "";
            alert("The name Filter and the Oldest/Latest Filter Options cannot be used in conjunction with each other!");
        }
    }
    else {
        order_by = "&order_by=" + e.target.value;
        if (e.target.value === "score") {
            sort = "&sort=desc";
        }
        else if (e.target.value === "popularity") {
            sort = "&sort=asc";
        }
    }
});

$(document).on('click', '.genre-checkbox', function () {
    genreId = this.value;
    if ($(this).prop('checked')) {
        genres.push(parseInt(genreId));
    }
    else {
        genres = $.grep(genres, (genre) => {
            return genre != genreId;
        })
    }
});

$(".seach-filtered-animes").on('click', (e) => {
    e.preventDefault();
    advancedFilterApplied = true;
    $(".btn-close").trigger("click");
    url = "https://api.jikan.moe/v4/anime?q=";
    if (searchName) {
        url = url + searchName
    }
    if (type) {
        url = url + type;
    }
    if (rating) {
        url = url + rating;
    }
    if (genres.length !== 0) {
        let genreString = JSON.stringify(genres);
        genreString = genreString.slice(1, genreString.length - 1);
        url = url + "&genres=" + genreString;
    }
    if (order_by) {
        url = url + order_by;
    }
    if (sort) {
        url = url + sort;
    }
    page = 1;
    $(".popular-ents").html("");
    loadFilteredAnimes(url);
})

function loadMore() {
    page += 1;
    loadFilteredAnimes(url);
}

async function loadFilteredAnimes(url) {
    $(".loader").addClass("show-loader");
    if (advancedFilterApplied) url = url + "&page=" + page;
    else url = url + "?page=" + page;
    console.log(url);
    let data = await fetch(url + "&page=" + page);
    let parsedData = await data.json();
    $(".loader").removeClass("show-loader");
    if (page === 1) $(".results-found")[0].innerHTML = `${parsedData.pagination.items.total} Results Found`;
    parsedData.data.forEach((object, index) => {
        $(".popular-ents").append(
            `<div class="col-lg-2 col-md-3 col-sm-6 clickThisDiv">
                <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                    <img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img">
                    <div class="ent-about">
                        <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                    </div>
                </form>
            </div>`
        )
    });
    if (!parsedData.pagination.has_next_page) {
        $(".load-more").addClass("hide-btn");
        $(".end").removeClass("hide-end");
        return;
    }
    else {
        $(".load-more").removeClass("hide-btn");
        $(".end").addClass("hide-end");
    }
};

