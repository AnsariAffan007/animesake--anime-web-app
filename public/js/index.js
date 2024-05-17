$(".swiper-wrapper").on('click', '.clickThisDiv', function () {
    $(this).find(".recommended-ent").submit();
});

if (window.location.pathname === "/") {
    fetchTopAnimes().then(
        fetchOngoingAnimes()
    ).then(
        fetchUpcomingAnimes()
    ).then(
        fetchReviewedAnimes()
    );
};

async function fetchTopAnimes() {
    let topAnimesUrl = "https://api.jikan.moe/v4/top/anime";
    let data = await fetch(topAnimesUrl);
    let parsedData = await data.json();
    if (parsedData.status === 429) {
        console.log("Failed, re-requesting");
        setTimeout(fetchTopAnimes, 2000);
        return;
    }
    parsedData.data.forEach((object, index) => {
        $(".wrapper-top-animes").append(
            `<div class="swiper-slide">
                <div class="clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                        <a type="submit"><img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img"></a>
                    </form>
                    <div class="ent-about">
                        <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                    </div>
                </div>
            </div>`
        )
    })
}

async function fetchOngoingAnimes() {
    let ongoingAnimesUrl = "https://api.jikan.moe/v4/seasons/now";
    let data = await fetch(ongoingAnimesUrl);
    let parsedData = await data.json();
    if (parsedData.status === 429) {
        console.log("Failed, re-requesting");
        setTimeout(fetchTopAnimes, 2000);
        return;
    }
    parsedData.data.forEach((object, index) => {
        $(".wrapper-ongoing-animes").append(
            `<div class="swiper-slide">
                <div class="clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                        <a type="submit"><img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img"></a>
                    </form>
                    <div class="ent-about">
                        <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                    </div>
                </div>
            </div>`
        )
    })
}

async function fetchUpcomingAnimes() {
    let upcomingAnimesUrl = "https://api.jikan.moe/v4/seasons/upcoming";
    let data = await fetch(upcomingAnimesUrl);
    let parsedData = await data.json();
    if (parsedData.status === 429) {
        console.log("Failed, re-requesting");
        setTimeout(fetchTopAnimes(), 2000);
        return;
    }
    parsedData.data.forEach((object, index) => {
        $(".wrapper-upcoming-animes").append(
            `<div class="swiper-slide">
                <div class="clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.mal_id}" method="get">
                        <a type="submit"><img class="popular-anime" src="${object.images.jpg.image_url}" alt="aot-img"></a>
                    </form>
                    <div class="ent-about">
                        <p class="pop-ent-desc">${(object.title_english !== null) ? object.title_english : object.title}</p>
                    </div>
                </div>
            </div>`
        )
    })
}

async function fetchReviewedAnimes() {
    let url = "/reviewed";
    let reviewedAnimes = await fetch(url);
    let parsedData = await reviewedAnimes.json();
    let sorted = parsedData.sort((a, b) => {
        return b.entertainmentReviews.length - a.entertainmentReviews.length;
    })
    sorted.forEach((object, index) => {
        $(".wrapper-reviewed-animes").append(
            `<div class="swiper-slide">
                <div class="clickThisDiv">
                    <form class="recommended-ent" action="/anime/${object.entertainmentId}" method="get">
                        <a type="submit"><img class="popular-anime" src="${object.imageUrl}" alt="img"></a>
                    </form>
                    <div class="ent-about">
                        <p class="pop-ent-desc">${object.entertainmentName}</p>
                    </div>
                </div>
            </div>`
        )
    })
}