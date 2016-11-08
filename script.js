$('.searchBar').val(""); // ensure search bar is empty on page load
$('.searchBar').disabled = true; // disable search bar if not expanded
var expanded = false; // boolean to check if search bar is expanded
var movedTop = false; // boolean to check if search bar is at top of screen
var searchTimeout; // storage var for the setTimeout found within
									 // $('.searchBar').keyup callback -- mediates debouncing
									 // of AJAX call within the callback

$('#searchStart').click(function() {
	if (expanded === false) {
		$('.searchBar').disabled = false;
		expanded = true;
		$('#randomArticle').fadeOut(100);
		$('.searchBar').css('width', '80%').css('padding-left', '2.5%');
		$('#searchStart').css('border-top-left-radius', '0px').css('border-bottom-left-radius', '0px').html('<i class="fa fa-times"></i>');
		$('.searchBar').focus(); // place focus on search bar once opened
	} else {
		$('.searchBar').disabled = true;
		expanded = false;
		movedTop = false;
		$('#randomArticle').fadeIn(800);
		$('.searchBar').val("");
		$('.suggestContainer p').fadeOut(50);
		$('.resultsContainer').css('opacity', '0').css('transform', 'translateY(150px)');
		$('.resultsContainer a').fadeOut(500);
		$('.searchControls').css('transform', 'translateY(0px) scale(1)')
		$('.searchBar').css('width', '0%').css('padding-left', '0%');
		$('#searchStart').css('border-top-left-radius', '5px').css('border-bottom-left-radius', '5px').html('<i class="fa fa-search"></i>');			
	}
}); // end .click; handles expansion and collapse of search bar

var baseURL = "https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&callback=?&srsearch="; // API endpoint with relevant query string parameters
// var searchURL will be in keypress event, input val + baseURL = searchURL
var searchURL; // storage var, to be used as described above

function keyUpSearch() {		
	$.getJSON(searchURL, function(searchResult) {
		$('.suggestContainer').empty();
		var resultArray = searchResult.query.search; // location of array within JSON data
		for (var i = 0; i < 5; i++) {
      $('.suggestContainer').append('<p class="suggest">' + resultArray[i].title + '</p>');
  	}           	        	
	}); // end .getJSON
} // end keyUpSearch; handles retrieval of titles as suggestions for user based on input

function enterSearch() {
	$('.resultsContainer').css('opacity', '0');
	$('.resultsContainer').empty();
	$.getJSON(searchURL, function(searchResult) {
		var resultArray = searchResult.query.search; // location of array within JSON data
		if (resultArray.length > 0) {
			$.each(resultArray, function(index) {
        $('.resultsContainer').append('<a href="https://en.wikipedia.org/wiki/' + resultArray[index].title + '" target="_blank"><div class="returnedResult"><p class="returnedTitle">' + resultArray[index].title + '</p><p class="returnedSnippet">' + resultArray[index].snippet + '...</p></div></a>');
	    }); // end .each -- inserts JSON data into page as HTML	    
		} else {
			$('.resultsContainer').append('<div class="noResults">No articles match the query provided.</div>');
		}		
		$('.resultsContainer').css('opacity', '1').css('height', 'auto');
		$('.suggestContainer').empty(); // placed inside getJSON to best ensure suggestions are deleted (asynchronity means sometimes earlier inputs reach the page more slowly than later ones)	
	}); // end .getJSON
} // end enterSearch; handles retrieval of articles matching search term	

$('.searchBar').keypress(function(e) {
    if(e.which == 13 && $('.searchBar').val().length > 0) {
    	clearTimeout(searchTimeout);
    	searchURL = baseURL + $('.searchBar').val();
    	$('.searchControls').css('transform', 'translateY(-150px) scale(0.9)');	 
    	movedTop = true;   	
        enterSearch();
        $('.resultsContainer').css('transform', 'translateY(-150px)');
    } 
}); // call enterSearch if enter is pressed within input element; place results on page

$('.searchBar').keyup(function(e) {
	if (e.which != 13) {
		searchURL = baseURL + $('.searchBar').val();
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(function() {				
			keyUpSearch();
			if (movedTop == true && window.innerWidth >= 400) {
				$('.suggestContainer').css('width', '82.5%').css('left', '4%');				
			} else if (movedTop == true && window.innerWidth < 400) {
				$('.suggestContainer').css('width', '82.5%').css('left', '2%');				
			}
			$('.resultsContainer').css('transform', 'translateY(50px)');
		}, 200);									
	}
}); // call keyUpSearch to give suggestions based on user inputs

$(document).on('click', '.suggest', function(){
	$('.searchBar').val($(this).text());
	$('.suggestContainer').empty();
	searchURL = baseURL + $('.searchBar').val();
	movedTop = true;
	$('.searchControls').css('transform', 'translateY(-150px) scale(0.9)');
	enterSearch();	
	$('.resultsContainer').css('transform', 'translateY(-150px)');
}); // formatted to bind click events to the p.suggest elements rendered after page load
		// handles clicking of suggestions