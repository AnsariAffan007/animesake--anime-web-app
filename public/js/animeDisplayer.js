$(".popular-ents").on('click', '.clickThisDiv', function () {
    $(this).find(".recommended-ent").submit();
});

let page = 1;
let nextPageAvailable = true;

let topAnimesUrl = "https://api.jikan.moe/v4/top/anime?page=" + page;
let ongoingAnimesUrl = "https://api.jikan.moe/v4/seasons/now?page=" + page;
let upcomingAnimesUrl = "https://api.jikan.moe/v4/seasons/upcoming?page=" + page;

(window.location.pathname === "/type/top") && loadAnimes(topAnimesUrl);
(window.location.pathname === "/type/ongoing") && loadAnimes(ongoingAnimesUrl);
(window.location.pathname === "/type/upcoming") && loadAnimes(upcomingAnimesUrl);

let similarAnimes = "";
let id = "";
if (window.location.pathname.indexOf("/similar/") !== -1) {
    id = window.location.pathname.split("/")[2];
    similarAnimes = `https://api.jikan.moe/v4/anime/${id}/recommendations?page=` + page;
    loadAnimes(similarAnimes);
};

function loadMore() {
    page += 1;
    topAnimesUrl = "https://api.jikan.moe/v4/top/anime?page=" + page;
    ongoingAnimesUrl = "https://api.jikan.moe/v4/seasons/now?page=" + page;
    upcomingAnimesUrl = "https://api.jikan.moe/v4/seasons/upcoming?page=" + page;
    similarAnimes = `https://api.jikan.moe/v4/anime/${id}/recommendations?page=` + page;

    (window.location.pathname === "/type/top") && loadAnimes(topAnimesUrl);
    (window.location.pathname === "/type/ongoing") && loadAnimes(ongoingAnimesUrl);
    (window.location.pathname === "/type/upcoming") && loadAnimes(upcomingAnimesUrl);
    (window.location.pathname.indexOf("/similar/") !== -1) && loadAnimes(similarAnimes);
}

async function loadAnimes(url) {
    toggleSpinner();
    let data = await fetch(url);
    let parsedData = await data.json();
    if (parsedData.status === 429) {
        console.log("Failed, re-requesting");
        setTimeout(fetchTopAnimes, 2000);
        return;
    }
    toggleSpinner();

    if (window.location.pathname.indexOf("/similar/") !== -1) {
        parsedData.data.forEach((object, index) => {
            console.log(object);
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
        hideLoadMoreButton();
    }
    else {
        $(".h2-popular").html(` (${parsedData.pagination.items.total} Results Found)`);
        parsedData.data.forEach((object, index) => {
            $(".popular-ents").append(
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
            )
        });
        if (!parsedData.pagination.has_next_page) {
            hideLoadMoreButton();
            return;
        }
    }

}

function toggleSpinner() {
    $(".loader").toggleClass("show-loader");
}

function hideLoadMoreButton() {
    $(".load-more").addClass("hide-btn");
    $(".end").removeClass("hide-end");
}