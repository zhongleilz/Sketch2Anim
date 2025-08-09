window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})

// Random Joke Generator Functions
function fetchRandomJoke() {
    showLoading(true);
    hideError();
    
    // Try multiple joke APIs with fallback
    tryJokeAPI()
        .catch(() => tryDadJokeAPI())
        .catch(() => tryBackupJokeAPI())
        .catch(() => showFallbackJoke())
        .finally(() => showLoading(false));
}

function tryJokeAPI() {
    return fetch('https://official-joke-api.appspot.com/random_joke')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.setup && data.punchline) {
                displayJoke(data.setup, data.punchline);
            } else {
                throw new Error('Invalid joke format');
            }
        });
}

function tryDadJokeAPI() {
    return fetch('https://icanhazdadjoke.com/', {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.joke) {
                // For single-line jokes, we'll split them creatively
                const joke = data.joke;
                const words = joke.split(' ');
                const midPoint = Math.ceil(words.length / 2);
                const setup = words.slice(0, midPoint).join(' ') + '...';
                const punchline = '...' + words.slice(midPoint).join(' ');
                displayJoke(setup, punchline);
            } else {
                throw new Error('Invalid joke format');
            }
        });
}

function tryBackupJokeAPI() {
    return fetch('https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=twopart')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.setup && data.delivery) {
                displayJoke(data.setup, data.delivery);
            } else if (data.joke) {
                // Handle single-part jokes
                const joke = data.joke;
                const words = joke.split(' ');
                const midPoint = Math.ceil(words.length / 2);
                const setup = words.slice(0, midPoint).join(' ') + '...';
                const punchline = '...' + words.slice(midPoint).join(' ');
                displayJoke(setup, punchline);
            } else {
                throw new Error('Invalid joke format');
            }
        });
}

function showFallbackJoke() {
    // Fallback jokes in case all APIs fail
    const fallbackJokes = [
        {
            setup: "Why don't scientists trust atoms?",
            punchline: "Because they make up everything!"
        },
        {
            setup: "Why did the developer go broke?",
            punchline: "Because they used up all their cache!"
        },
        {
            setup: "What do you call a fake noodle?",
            punchline: "An impasta!"
        },
        {
            setup: "Why don't programmers like nature?",
            punchline: "It has too many bugs!"
        }
    ];
    
    const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    displayJoke(randomJoke.setup, randomJoke.punchline);
}

function displayJoke(setup, punchline) {
    const setupElement = document.getElementById('joke-setup');
    const punchlineElement = document.getElementById('joke-punchline');
    
    if (setupElement && punchlineElement) {
        setupElement.textContent = setup;
        punchlineElement.textContent = punchline;
        punchlineElement.style.display = 'block';
        
        // Add a nice reveal animation for the punchline
        punchlineElement.style.opacity = '0';
        setTimeout(() => {
            punchlineElement.style.transition = 'opacity 0.5s ease-in-out';
            punchlineElement.style.opacity = '1';
        }, 800);
    }
}

function showLoading(show) {
    const jokeContent = document.getElementById('joke-content');
    const loadingSpinner = document.getElementById('loading-spinner');
    const button = document.getElementById('new-joke-btn');
    
    if (jokeContent && loadingSpinner && button) {
        if (show) {
            jokeContent.style.display = 'none';
            loadingSpinner.style.display = 'block';
            button.disabled = true;
            button.classList.add('is-loading');
        } else {
            jokeContent.style.display = 'block';
            loadingSpinner.style.display = 'none';
            button.disabled = false;
            button.classList.remove('is-loading');
        }
    }
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.querySelector('p').innerHTML = `<strong>Oops!</strong> ${message}`;
        errorMessage.style.display = 'block';
    }
}
