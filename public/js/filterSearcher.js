resetFilters();

// Fetching genres and populating them in sidebar
fetchGenres();
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

// submitting get request for a clicked anime
$(".popular-ents").on('click', '.clickThisDiv', function () {
    // updateLocalStorage();
    $(this).find(".recommended-ent").submit();
});

let advancedFilterApplied = false;

let year = "";
let season = "";

// Populating year dropdown in descending order (newest to oldest year)
let earliestYear = 1917;
let currentYear = new Date().getFullYear();
while (currentYear >= earliestYear) {
    $("#year-select").append(`<option value="${currentYear}">${currentYear}</option>`)
    currentYear -= 1;
}

let url = "";
let page = 1;

// Checking if url has filters, if yes fetch 'em
$(window).on('load', function () {
    let { isFilterPresent, isFilterError, urlToFetch, pageInUrl } = getUrlFromParams();
    isFilterPresent && setTimeout(() => $(".btn-close").trigger('click'), 500);
    isFilterPresent && loadFilteredAnimes(urlToFetch, pageInUrl, isFilterError);
});

// Setting value of year on dropdown change
$('#year-select').on('change', function () {
    if (!this.value) year = "";
    else year = this.value;
});


$('#season-select').on('change', function () {
    if (!this.value) season = "";
    else season = this.value;
});

// SUBMIT YEAR SEASON FILTERS
$(".year-season-btn").on('click', (e) => {
    e.preventDefault();
    if (year === "" || season === "") {
        alert("Please select year and season");
        return;
    }

    advancedFilterApplied = false;

    url = "https://api.jikan.moe/v4/seasons/" + year + "/" + season + "";

    let page = 1;

    // Pushing url with filters into history
    history.pushState(null, null, `?year=${year}&season=${season}&page=${page}`)

    $(".popular-ents").html("");

    loadFilteredAnimes(url, page, false);
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

// SUBMITTING ADVANCED FILTER FORM
$(".seach-filtered-animes").on('click', (e) => {
    e.preventDefault();
    advancedFilterApplied = true;

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

    // Adding filters as params in history
    setAdvancedFilterParams(url, page);

    loadFilteredAnimes(url, page, false);
})

// Previous and next buttons for pagination
let previousButton = $(".pagination-previous");
let nextButton = $(".pagination-next");

// If previous or next buttons are clicked
previousButton.click(function () {
    let page = getCurrentPage() - 1;
    setPageParam(page);
    let { isFilterError } = getUrlFromParams();
    loadFilteredAnimes(url, page, isFilterError);
})

nextButton.click(function () {
    let page = getCurrentPage() + 1;
    setPageParam(page);
    let { isFilterError } = getUrlFromParams();
    loadFilteredAnimes(url, page, isFilterError);
})

// if a button of pagination is clicked (except previous and next)
function paginationButtonClick(e) {
    let page = parseInt(e.innerText);
    setPageParam(page);
    let { isFilterError } = getUrlFromParams();
    loadFilteredAnimes(url, page, isFilterError);
}

// popstate event listener to check if user has clicked back or forward.
window.addEventListener("popstate", function (e) {
    let { isFilterPresent, isFilterError, urlToFetch, pageInUrl } = getUrlFromParams();
    if (isFilterPresent) loadFilteredAnimes(urlToFetch, pageInUrl, isFilterError);
    else resetFilters()
})

// Set "page" parameter in url, as well as add in history
function setPageParam(page) {
    let url = window.location.href
    let urlObj = new URL(url);
    let urlParams = urlObj.searchParams
    urlParams.set("page", `${page}`);
    history.pushState(null, null, `?${urlParams.toString()}`)
}

// set advanced filters in url params, as well as add in history
function setAdvancedFilterParams(reqURL, page) {
    let urlObj = new URL(`${reqURL}`);
    let reqUrlParams = urlObj.searchParams.toString();
    history.pushState(null, null, `${window.location.pathname}?${reqUrlParams}&page=${page}`)
}

function getUrlFromParams() {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);

    // getting page param's value from page param, and then deleting the param
    let page = parseInt(urlParams.get("page")) || 1;
    urlParams.delete("page");

    // Finding out if url contains advanced filters, or it is just a year season filter
    let isAdvancedFilterURL =
        urlParams.has("q") || urlParams.has("type") || urlParams.has("rating") || urlParams.has("genres") || urlParams.has("order_by") || urlParams.has("sort");
    let isYearSeasonFilter = urlParams.has("year") || urlParams.has("season");

    // Checking if there's some error in filters, while applying filters manually through URL
    // error comes when both sets of filters are used together, or when name and sort by latest or oldest is used together
    let filterError =
        (isAdvancedFilterURL && isYearSeasonFilter)
        ||
        (urlParams.get("q")?.length > 0 && urlParams.get("sort") === "asc")
        ||
        (urlParams.get("q")?.length > 0 && urlParams.get("sort") === "desc")

    // setting url based on what set of filters are being used
    let advancedFilterUrl = "https://api.jikan.moe/v4/anime?";
    let yearSeasonFilterUrl = "https://api.jikan.moe/v4/seasons/";

    if (isAdvancedFilterURL) url = advancedFilterUrl + urlParams.toString();
    else if (isYearSeasonFilter) url = yearSeasonFilterUrl + urlParams.get("year") + "/" + urlParams.get("season");

    advancedFilterApplied = isAdvancedFilterURL;

    return {
        isFilterPresent: isAdvancedFilterURL || isYearSeasonFilter,
        isFilterError: filterError,
        urlToFetch: url,
        pageInUrl: page
    };
}

// fetch filtered animes, and update content on UI
async function loadFilteredAnimes(url, page, isFilterError) {

    // If filters contain error, show the error container with rules for setting filters.
    if (isFilterError) $("#error-container").show();
    else $("#error-container").hide();

    // Empty animes
    $(".popular-ents").html('');

    // Close sidebar
    $(".btn-close").trigger("click");

    // Show pagination container
    $(".parent-pagination-container").show();

    // Show loader
    showSpinner();

    if (advancedFilterApplied) url = url + "&page=" + page;
    else url = url + "?page=" + page;

    let data = await fetch(url);
    let parsedData = await data.json();

    // Hide loader
    hideSpinner();

    if (page === 1) $(".results-found")[0].innerHTML = `${parsedData.pagination.items.total} Results Found`;

    let recievedAnimes = '';
    parsedData.data.forEach((object, index) => {
        recievedAnimes +=
            `<div class="col-lg-2 col-md-3 col-sm-6 clickThisDiv">
                <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                    <img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img">
                    <div class="ent-about">
                        <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                    </div>
                </form>
            </div>`
    });
    $(".popular-ents").html(recievedAnimes);

    // Updating page numbers in pagination, and updating previous and next buttons
    updatePagination(page, parsedData.pagination.last_visible_page)
    updatePageNavigators(page, parsedData.pagination.last_visible_page)
};

// Update the page numbers that are shown in the pagination bar
let pageNumbersContainer = $(".page-numbers-container");
function updatePagination(activePage, totalPages) {
    let startNumber =
        activePage === totalPages || activePage === totalPages - 1 ?
            1 :
            activePage === totalPages - 2 ?
                activePage - 2 : activePage;

    let midEndNumber = totalPages === 1 ? 1 : startNumber + 2;

    let midStart = (totalPages - 1 === midEndNumber) ?
        totalPages : (totalPages - 1 < midEndNumber) ?
            0 : totalPages - 1;

    let endNumber = startNumber === midEndNumber ? -1 : totalPages;

    let startGroup = '';
    let endGroup = '';
    for (let i = startNumber; i <= midEndNumber; i++) {
        startGroup += `
        <button class="pagination-button number-button ${i === activePage && "active-page-button"}" onclick="paginationButtonClick(this)">
            ${i}
        </button>`
    }
    for (let i = midStart; i <= endNumber; i++) {
        endGroup += `
        <button class="pagination-button number-button ${i === activePage && "active-page-button"}" onclick="paginationButtonClick(this)">
            ${i}
        </button>`
    }
    pageNumbersContainer.html(startGroup);
    (midStart - midEndNumber > 1) && pageNumbersContainer.append('<span class="pagination-button">...</span>');
    pageNumbersContainer.append(endGroup);

    // 3 buttons logic (Future scope)
}

// Check if previous and next buttons have to disabled or not, and do so
function updatePageNavigators(activePage, lastPage) {
    if (activePage === 1) previousButton.prop("disabled", true);
    else previousButton.prop("disabled", false);

    if (activePage === lastPage) nextButton.prop("disabled", true);
    else nextButton.prop("disabled", false);
}

// Function to get current page from URL Params
function getCurrentPage() {
    let url = window.location.href;
    let urlObj = new URL(url);
    let currentPage = urlObj.searchParams.get("page");
    return currentPage ? parseInt(currentPage) : 1;
}

// Toggle .loader div which contains a loading gif. 
// Also hide pagination container to prevent user from clicking on other pages while one page is being loaded
function showSpinner() {
    $(".pagination-container").addClass("hide-btn");
    $(".loader").addClass("show-loader");
}

function hideSpinner() {
    $(".pagination-container").removeClass("hide-btn");
    $(".loader").removeClass("show-loader");
}

function resetFilters() {
    // Empty animes
    $(".popular-ents").html('');
    // Hiding pagination container first
    $(".parent-pagination-container").hide();
    // Hide error container
    $("#error-container").hide();
    // Reset heading
    $(".results-found")[0].innerHTML = "Apply Filters"
    // Open filter sidebar
    $(".offcanvas-toggler").trigger("click");
}