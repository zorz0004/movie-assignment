/*globals APIKEY*/

const movieDatabaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];

document.addEventListener("DOMContentLoaded", init);

function init(){
    console.log(APIKEY);
    addEventListeners();
    getDataFromLocalStorage();
    
    document.getElementById("back-button").src = "./img/back.png";
    
    document.getElementById("search-button").src = "./img/search.png";
}

function addEventListeners(){
    
}

function getDataFromLocalStorage(){
    /*
    1 - Check if image secure base URL and sizes array are saved in Local Storage.
    If not, call getPosterURLAndSizes function.
    
    2 - If in Local Storage, check if it's saved over 60 minutes ago. If true, then call getPostersURLAndSizes function.
    
    3 - If in local storage and less then 60 minutes old, load and use from local storage.*/
    
    getPosterURLAndSizes();
}

function getPosterURLAndSizes(){
    //https://api.themoviedb.org/3/configuration?api_key=<<api_key>>
    
    let url = `${movieDatabaseURL}configuration?api_key=${APIKEY}`;
    
    console.log(url);
    
    fetch(url)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log(data);
        
        imageURL = data.images.secure_base_url;
        imageSizes = data.images.poster_sizes;
        console.log(imageURL);
        console.log(imageSizes);
        
        })
        .catch(function(error){
            console.log(error);
        })
}