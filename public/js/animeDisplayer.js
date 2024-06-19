$(".popular-ents").on('click', '.clickThisDiv', function () {
    $(this).find(".recommended-ent").submit();
});

let previousButton = $(".pagination-previous");
let nextButton = $(".pagination-next");

// to save the type, whether it is top, upcoming, ongoing or similar
let type = '';

// to save header to show on the page
let header = '';

// to save the url, since it's used in various places
let url = "";

// initializing it to set if afterwards if url is found to be to get similar animes
let id = "";

if (window.location.pathname === "/type/top") {
    type = 'top';
    url = "https://api.jikan.moe/v4/top/anime?page=";
    header = "Top Animes";
    let page = getCurrentPage();
    loadAnimes(url, page);
}
else if (window.location.pathname === "/type/ongoing") {
    type = 'ongoing';
    url = "https://api.jikan.moe/v4/seasons/now?page="
    header = "Ongoing Animes";
    let page = getCurrentPage();
    loadAnimes(url, page);
}
else if (window.location.pathname === "/type/upcoming") {
    type = 'upcoming'
    url = "https://api.jikan.moe/v4/seasons/upcoming?page="
    header = "Upcoming Animes"
    let page = getCurrentPage();
    loadAnimes(url, page);
}
else if (window.location.pathname.indexOf("/similar/") !== -1) {
    // Hiding pagination container
    $(".pagination-container").hide();
    type = "similar";
    id = window.location.pathname.split("/")[2];
    let page = "";
    url = `https://api.jikan.moe/v4/anime/${id}/recommendations`;
    loadAnimes(url, page);
};

// Function to fetch animes and update page content
async function loadAnimes(url, page) {
    
    // Empty animes
    $(".popular-ents").html('');

    // Update header
    if (type !== "similar") $(".h2-popular").html(`${header}, (Page ${page})`);

    toggleSpinner();
    let data = await fetch(url + page);
    let parsedData = await data.json();
    type !== "similar" && updatePagination(page, parsedData.pagination.last_visible_page)
    type !== "similar" && updatePageNavigators(page, parsedData.pagination.last_visible_page)
    toggleSpinner();

    if (window.location.pathname.indexOf("/similar/") !== -1) {
        if (parsedData.data.length === 0) return $(".end").toggleClass("hide-end");
        parsedData.data.forEach((object, index) => {
            $(".popular-ents").append(
                `
                <div class="col-lg-2 col-md-3 col-sm-6 clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.entry.mal_id}" method="get">
                        <img class="popular-anime" src="${object.entry.images.jpg.image_url}" alt="aot-img">
                        <div class="ent-about">
                            <p class="pop-ent-desc">${object.entry.title}</p>
                        </div>
                    </form>
                </div>
            `
            )
        });
    }
    else {
        let recievedAnimes = '';
        parsedData.data.forEach((object, index) => {
            recievedAnimes +=
                `
                <div class="col-lg-2 col-md-3 col-sm-6 clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                        <img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img">
                        <div class="ent-about">
                            <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                        </div>
                    </form>
                </div>
                `
        });
        $(".popular-ents").html(recievedAnimes);
    }

}

// Update the page numbers that are shown in the pagination bar
let pageNumbersContainer = $(".page-numbers-container");
function updatePagination(activePage, totalPages) {
    let startNumber =
        activePage === totalPages || activePage === totalPages - 1 ?
            1 :
            activePage === totalPages - 2 ?
                activePage - 2 : activePage;
    let midEndNumber = startNumber + 2;

    let midStart = totalPages - 1 === midEndNumber ? totalPages : totalPages - 1;
    let endNumber = totalPages;

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
    (midStart - midEndNumber !== 1) && pageNumbersContainer.append('<span class="pagination-button">...</span>');
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

// If previous or next buttons are clicked
previousButton.click(function () {
    let page = getCurrentPage() - 1;
    history.pushState(null, null, "?page=" + page)
    loadAnimes(url, page);
})

nextButton.click(function () {
    let page = getCurrentPage() + 1;
    history.pushState(null, null, "?page=" + page)
    loadAnimes(url, page);
})

// if a button of pagination is clicked (except previous and next)
function paginationButtonClick(e) {
    let page = parseInt(e.innerText);
    history.pushState(null, null, "?page=" + page)
    loadAnimes(url, page);
}

// popstate event listener to check if user has clicked back or forward.
window.addEventListener("popstate", function (e) {
    let page = getCurrentPage();
    loadAnimes(url, page);
})

// Function to get current page from URL Params
function getCurrentPage() {
    let url = window.location.href;
    let urlObj = new URL(url);
    let currentPage = urlObj.searchParams.get("page");
    return currentPage ? parseInt(currentPage) : 1;
}

// Toggle .loader div which contains a loading gif. 
// Also hide pagination container to prevent user from clicking on other pages while one page is being loaded
function toggleSpinner() {
    $(".pagination-container").toggleClass("hide-btn");
    $(".loader").toggleClass("show-loader");
}