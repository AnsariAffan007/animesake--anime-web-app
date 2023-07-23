async function loadMovies() {
    // console.log("Request Fired!");

    let searchTerm = $(".nav-search").val();
    // const url = 'https://www.omdbapi.com/?apikey=95e95101&s=' + searchTerm;
    const url = 'https://api.jikan.moe/v4/anime?q=' + searchTerm;
    const res = await fetch(url);
    const data = await res.json();
    if (data.data.length !== 0) {
        // console.log(data.Search);
        data.data.forEach(function (element) {
            $(".autocom-box").append(
                `<li value="${element.mal_id}" onclick='select(this)'>
                    <img class='suggested-anime-img' src="${element.images.jpg.image_url}" alt=''>
                    <div>${element.title}</div>
                </li>`
            );
            $(".autocom-box").css("padding", "10px 8px");

            // console.log(searchTerm.toLowerCase());
            if (element.title.toLowerCase() === searchTerm.toLowerCase()) {
                $(".mal_id").val(element.mal_id);
            }
        })
    }
    else {
        $(".autocom-box").append("<li>" + "No results found." + "</li>");
    }
}

function select(element) {
    let suggestedString = element.innerText;
    $(".mal_id").val(element.value);
    // console.log(element.value);
    $(".nav-search").val(suggestedString);
    $(".search-form").submit();
}

var typingTimer;
$('.nav-search').keyup(function (e) {
    $(".autocom-box").empty();
    clearTimeout(typingTimer);
    if ($(this).val()) {
        typingTimer = setTimeout(loadMovies, 500);
    }
    else if (e.keyCode == 8) {
        $(".search-box li").css("display", "none");
        $(".autocom-box").css("padding", "0");
    }
    else {
        $(".search-box li").css("display", "none");
        $(".autocom-box").css("padding", "0");
    }
});

function validateForm() {
    if ($(".mal_id").val().length === 0) return false;
    else return true;
}

$(document).keypress(function (e) {
    var key = e.which;
    if (key == 13) {
        $(".search-form").submit();
    }
});