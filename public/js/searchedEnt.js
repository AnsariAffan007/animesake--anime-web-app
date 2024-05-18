$(".add-to-watchlist").on("click", function (e) {
    $(".hidden-data-form").submit();
});

//New Review Form validation
function validateReview() {
    let reviewRating = $(".new-review-rating").val();
    let reviewHead = $(".new-review-head").val();
    let reviewDesc = $(".new-review-desc").val();

    if (!reviewRating || reviewRating < 0 || reviewRating > 10) {
        // $(".new-review-rating").focus(function() {
        //     $(".new-review-rating").css("border", "1px solid red");
        // })
        return false;
    }
    if (reviewHead === "") {
        // $(".new-review-head").focus(function() {
        //     $(".new-review-head").css("border", "1px solid red");
        // })
        return false;
    }
    if (reviewDesc === "") {
        // $(".new-review-desc").focus(function() {
        //     $(".new-review-desc").css("border", "1px solid red");
        // })
        return false;
    }

};

function alert() {
    alert("Your review already exists!");
}

$(".delete-review").on('click', function (e) {
    e.preventDefault();
    $(".delete-review-form").submit();
})

let watchOrderFetched = false;
const month = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
$("#toggle-watch-order-btn").on('click', async () => {
    if (watchOrderFetched) return;
    watchOrderFetched = true;
    let malId = $(".mal-id-hidden").val();
    let watchOrder = await fetch("/watchOrder?id=" + malId);
    let parsedOrder = await watchOrder.json();
    parsedOrder.watchOrderData.forEach((element) => {
        $(".watch-order").append(`
            <div class="watch-order-item">
                <div class="item-name">${element.title}</div>
                <div class="watch-order-more-info">
                    <div class="item-info">${month[new Date(element.startDate).getMonth()]} </div>
                    <div class="item-info">${new Date(element.startDate).getDate()},</div>
                    <div class="item-info">${new Date(element.startDate).getFullYear()} | </div>
                    <div class="item-info">${element.type} | </div>
                    <div class="item-info">${element.episodes + " Episodes"} x </div>
                    <div class="item-info">${element.duration} | </div>
                    <div class="item-info">${element.rating}</div>
                </div>
                <form action=${'/anime/' + element.mal_id} method="get" class="search-watch-order-ent"></form>
            </div>
        `)
    })
})

// click on animes listed in watch order
$(".watch-order").on('click', ".watch-order-item", function () {
    // updateLocalStorage();
    $(this).find(".search-watch-order-ent").submit();
});

$(".similar-animes-form").attr("action", "/similar/" + $(".mal-id-hidden").val());