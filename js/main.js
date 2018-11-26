/*globals APIKEY*/

const movieDatabaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];
let timeKey = "timeKey";
let staleDataTimeOut = 3600; // 30 seconds, good for testing
let bck = 0;

let searchString = "";

document.addEventListener("DOMContentLoaded", init);

function init() {
    // console.log(APIKEY);
    addEventListeners();
    getDataFromLocalStorage();
    
    //default
    localStorage.setItem('choiceType', "movie");

    mainTitle();


    //MODAL
    document.querySelector(".modalBtn").addEventListener("click", showOverlay);
    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
    //document.querySelector(".overlay").addEventListener("click", hideOverlay);

    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let choiceList = document.getElementsByName("choice");
        let choiceType = null;
        for (let i = 0; i < choiceList.length; i++) {
            if (choiceList[i].checked) {
                choiceType = choiceList[i].value;
                break;
            }
        }
        //alert(choiceType);
        console.log("You picked " + choiceType)
        localStorage.setItem('choiceType', choiceType);
        hideOverlay(e);


        if (choiceType == "tv") {
            document.getElementById("search-input").value = "";
            searchString = "";

            var searchResults = document.getElementById("search-results");
            while (searchResults.firstChild) {
                searchResults.removeChild(searchResults.firstChild);
            }
            document.getElementById("recommend-results").classList.remove("show");
            document.getElementById("search-results").classList.add("show");

            //mainTitle();
            document.querySelector(".Home").classList.add("hide");
            document.querySelector(".HomeTV").classList.remove("hide");

        } else if (choiceType == "movie") {
            document.getElementById("search-input").value = "";
            searchString = "";
            var searchResults2 = document.getElementById("search-results");
            while (searchResults2.firstChild) {
                searchResults2.removeChild(searchResults2.firstChild);
            }
            document.getElementById("recommend-results").classList.remove("show");
            document.getElementById("search-results").classList.add("show");

            //mainTitle();
            document.querySelector(".HomeTV").classList.add("hide");
            document.querySelector(".Home").classList.remove("hide");
        }

    });
    //MODAL END


    let content = document.querySelector("#search-results>.content");

    let cards = []; // an array of document fragments
    let documentFragment = new DocumentFragment();

    cards.forEach(function (item) {
        documentFragment.appendChild(item);
    });

    content.appendChild(documentFragment);

    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });

}

function mainTitle() {
    let h1 = document.createElement("h1");
    h1.classList.add("Home");
    h1.innerHTML = `Movies Recommendations`;
    document.querySelector("header").appendChild(h1);

    let h1tv = document.createElement("h1");
    h1tv.classList.add("HomeTV");
    h1tv.classList.add("hide");
    h1tv.innerHTML = `TV Recommendations`;
    document.querySelector("header").appendChild(h1tv);
}

function addEventListeners() {

    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);

    document.getElementById("search-input").addEventListener("keyup",
        function (event) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Trigger the button element with a click
                startSearch();
            }
        });

    let backButton = document.querySelector(".backButtonDiv");
    backButton.addEventListener("click", function () {
        document.getElementById("recommend-results").classList.remove("show");
        document.getElementById("search-results").classList.add("show");
        console.log(bck);
        if (bck == 1) {
            bck = 0;
            document.getElementById("search-input").value = "";
            searchString = "";
            var searchResults = document.getElementById("search-results");
            while (searchResults.firstChild) {
                searchResults.removeChild(searchResults.firstChild);
            }
            location.reload();
        } else {
            getSearchResults();
            bck = 1;
        }
    });

}

function getDataFromLocalStorage() {
    /*
    1 - Check if image secure base URL and sizes array are saved in Local Storage.
    If not, call getPosterURLAndSizes function.*/
    if (localStorage.getItem(timeKey)) {
        console.log("Retrieving Saved Date from Local Storage");
        let savedDate = localStorage.getItem(timeKey); // get the saved date sting
        savedDate = new Date(savedDate); // use this string to initialize a new Date object
        console.log(savedDate);

        /* 2 - If in Local Storage, check if it's saved over 60 minutes ago. If true, then call getPostersURLAndSizes function.
           3 - If in local storage and less then 60 minutes old, load and use from local storage.*/
        let seconds = calculateElapsedTime(savedDate);
        if (seconds > staleDataTimeOut) {
            console.log("Local Storage Data is stale");
            getPosterURLAndSizes();
        }
    } else {
        SaveDataToLocalStorage();
    }



    getPosterURLAndSizes();
}


function calculateElapsedTime(savedDate) {
    let now = new Date(); // get the current time
    console.log(now);

    // calculate elapsed time
    let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds

    let seconds = Math.ceil(elapsedTime / 1000);
    console.log("Elapsed Time: " + seconds + " seconds");
    return seconds;
}



function getPosterURLAndSizes() {
    //https://api.themoviedb.org/3/configuration?api_key=<<api_key>>

    let url = `${movieDatabaseURL}configuration?api_key=${APIKEY}`;


    console.log(url);

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;
            console.log(imageURL);
            console.log(imageSizes);
            SaveDataToLocalStorage(imageSizes);
        })
        .catch(function (error) {
            console.log(error);
        })

}

function SaveDataToLocalStorage(imageSizes) {
    let now = new Date();
    localStorage.setItem('timeKey', now);

    //Save base url to localstorage
    localStorage.setItem('baseURL', movieDatabaseURL);

    //Save imageSizes to localstorage
    localStorage.setItem('imageSizes', imageSizes);
}


function startSearch() {
    console.log("start search");
    document.getElementById("recommend-results").classList.remove("show");
    document.getElementById("search-results").classList.add("show");

    bck = 0; //Back button control
    searchString = document.getElementById("search-input").value;
    if (!searchString) {
        alert("Please enter search data");
        document.getElementById("search-input").focus();
        return;
    }

    // this is a new search so you should reset any existing page data
    getSearchResults();
}

function getSearchResults() {

    let url = localStorage.getItem("baseURL");
    url = url + `search/${localStorage.getItem("choiceType")}?api_key=${APIKEY}&query=${searchString}`;

    //let url = `${movieDatabaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;

    fetch(url)
        .then((response) => response.json())
        .then(function (data) {
            console.log(data);
            // data.results.forEach(createMovieCard(data));
            createPage(data);
        })
        .catch((error) => alert(error));

}


function createPage(data) {
    let content = document.querySelector("#search-results>.content");
    let title = document.querySelector("#search-results>.title");

    let message = document.createElement("h2");
//    if (content.innerHTML != null) {
//        content.innerHTML = "";
//    }
//    if (title.innerHTML != null) {  
//        title.innerHTML = "";
//    }
    content.innerHTML = "";
    title.innerHTML = "";

    if (data.total_results == 0) {
        message.innerHTML = `No results found for ${searchString}`;
    } else {
        message.innerHTML = `Total results: ${data.total_results} for ${searchString}`;
    }

    title.appendChild(message);

    let documentFragment = new DocumentFragment();

    documentFragment.appendChild(createMovieCards(data.results));

    content.appendChild(documentFragment);

    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });
}


function createMovieCards(results) {
    let documentFragment = new DocumentFragment();

    results.forEach(function (movie) {
        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let videoTitle = document.createElement("h3");
        let videoDate = document.createElement("p");
        let videoRating = document.createElement("p");
        let videoOverview = document.createElement("p");

        // set up the content
        videoTitle.textContent = movie.title;
        videoDate.textContent = movie.release_date;
        videoRating.textContent = movie.vote_average;
        videoOverview.textContent = movie.overview;

        // set up image source URL
        //image.src = `https://image.tmdb.org/t/p/w185${movie.poster_path}`;
        image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;
        image.alt = `movie image`;

        // set up movie data attributes
        movieCard.setAttribute("data-title", movie.title);
        movieCard.setAttribute("data-id", movie.id);

        //Choice Type - TV or MOVIE
        if (localStorage.getItem("choiceType") == 'movie') {
            videoTitle.textContent = movie.title;
            videoRating.textContent = movie.vote_average;
        } else if (localStorage.getItem("choiceType") == 'tv') {
            videoTitle.textContent = movie.original_name;
            videoDate.textContent = movie.first_air_date;
        }

        // set up class names
        movieCard.className = "movieCard";
        section.className = "imageSection";

        // append elements
        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(videoTitle);
        movieCard.appendChild(videoDate);
        movieCard.appendChild(videoRating);
        movieCard.appendChild(videoOverview);

        documentFragment.appendChild(movieCard);
    });

    return documentFragment;
}



function getRecommendations() {
    //console.log(this);
    let movieTitle = this.getAttribute("data-title");

    searchString = movieTitle;

    let movieID = this.getAttribute("data-id");
    console.log("you clicked: " + movieTitle + "   " + movieID);


    let url = localStorage.getItem("baseURL");
    url = url + `${localStorage.getItem("choiceType")}/${movieID}/recommendations?api_key=${APIKEY}`;

    //let url = `${movieDatabaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;

    fetch(url)
        .then((response) => response.json())
        .then(function (data) {
            console.log(data);
            // data.results.forEach(createMovieCard(data));
            createRecommendationsPage(data);
        })
        .catch((error) => alert(error));

    document.getElementById("search-results").classList.remove("show");
    document.getElementById("recommend-results").classList.add("show");

}

function createRecommendationsPage(data) {
    let content = document.querySelector("#recommend-results>.content");
    let title = document.querySelector("#recommend-results>.title");

    let message = document.createElement("h2");
    content.innerHTML = "";
    title.innerHTML = "";

    if (data.total_results == 0) {
        message.innerHTML = `No results found for ${searchString}`;
    } else {
        message.innerHTML = `Total results: ${data.total_results} for ${searchString}`;
    }

    title.appendChild(message);

    let documentFragment = new DocumentFragment();

    documentFragment.appendChild(createMovieCards(data.results));

    content.appendChild(documentFragment);

    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });
}


//Modal
function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}
