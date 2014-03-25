var feedurl="http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/limit=25/xml"
var feedlimit=100;
var rssoutput="<b>Latest Slashdot News:</b><br /><ul>";

var svg;
var data={};
var xA=0;
var yA=0;

var finalData = {};

//DAVID CHI 02/27/14

function init(){
	rssfeedsetup();
}

function rssfeedsetup(){
	//TODO: DEBUG, no vis just yet
	//svg = d3.select('#vis').append('svg')
    //    .attr('width', 1000)
    //    .attr('height', 1000);
		
	$("#rss_name").text(feedurl);
	var feedpointer=new google.feeds.Feed(feedurl) //Google Feed API method
	feedpointer.setNumEntries(feedlimit) //Google Feed API method
	feedpointer.load(processFeed) //Google Feed API method
}

function processFeed(result){
	if (!result.error){
		var myArr = [];
		var thefeeds=result.feed.entries;
		var drawIndex = 0;
		
		var anotherIndex = 0; 
		
		console.log(thefeeds.length);
		
		for (var i=0; i<thefeeds.length; i++) {
			rssoutput+="<li><a href='" + thefeeds[i].link + "'>" + thefeeds[i].title + "</a></li>"	

			var rawTitle = thefeeds[i].title;
			var dashIndex = rawTitle.search("-");
			var artist = rawTitle.substring(dashIndex+2);
			rawTitle = rawTitle.substring(0,dashIndex-1);
			
			artist = artist.replace(/ /g,"_");
			rawTitle = rawTitle.replace(/ /g,"_");
			artist = artist.replace("#", "");
			rawTitle = rawTitle.replace("#", "");
			
			if (rawTitle.indexOf('(') > 0)
				rawTitle = rawTitle.substring(0, rawTitle.indexOf('(')-1);
			if (artist.indexOf('&') > 0)
				artist = artist.substring(0, artist.indexOf('&')-1);
			
			//console.log("" + i +": "+ rawTitle);
			//console.log(artist);
			data[rawTitle] = thefeeds[i];
			
			//TEST DEBUG CODE!!!
			
			//https://www.mashape.com/vivekn/sentiment-3#!endpoint-Sentiment
			//https://www.mashape.com/loudelement/free-natural-language-processing-service#!documentation
			$.ajax({
				url: 'http://api.lyricsnmusic.com/songs', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
				type: 'POST', // The HTTP Method
				dataType: "jsonp",
				data: {api_key: "cf15c1b8d079b86126ada75aa87baa", artist: artist, track: rawTitle}, // Additional parameters here
				success: function(data) { 
					//console.log(""+data.data[0].title, data);
					//https://www.mashape.com/vivekn/sentiment-3#!endpoint-Sentiment
					//https://www.mashape.com/loudelement/free-natural-language-processing-service#!documentation
					
					console.log(data);
					
					if (data.data.length == 0) {
						anotherIndex++; 
					}
					else {
						$.ajax({
							url: 'https://loudelement-free-natural-language-processing-service.p.mashape.com/nlp-text/', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
							type: 'GET', // The HTTP Method
							data: {text: data.data[0].snippet}, // Additional parameters here
							datatype: 'json',
							success: function(data) { 
								finalData[thefeeds[anotherIndex].title] = {
									mood: data["sentiment-text"],
									name: thefeeds[anotherIndex].title
								}; 
								anotherIndex++; 
								if (anotherIndex == 25) {
									handleData(finalData);
								}
							},
							error: function(err) { 
								console.log(err); 
								anotherIndex++;
								if (anotherIndex == 25)
									console.log("DONE!");
							},
							beforeSend: function(xhr) {
							xhr.setRequestHeader("X-Mashape-Authorization", "HfCZfcVfY1DRV2e7thtTWCQP5fUfD9mh"); // Enter here your Mashape key
							}
						});
					}
				},
				error: function(err) { 
					console.log("error at lyrics api", err); 
					anotherIndex++;
					if (anotherIndex == 25)
						console.log("DONE!");
				},				
				beforeSend: function(xhr) {
					xhr.setRequestHeader("api_key", "cf15c1b8d079b86126ada75aa87baa"); // Enter here your Mashape key
				}
			});
			
			//cf15c1b8d079b86126ada75aa87baa
			

	
			
			//TEST DEBUG CODE ENDS HERE!!!
			
			/*
			var titleSplit = rawTitle.split(" ");
			var timeStamp = thefeeds[i].publishedDate.substring(thefeeds[i].publishedDate.length-14);
			var hours = timeStamp.substring(0,2);
			var mins = timeStamp.substring(3,5);
			var seconds = timeStamp.substring(6,9);
			var colorVal = "rgb(" + hours*10 + "," + mins*10 + "," + seconds*4 + ")";
			var feedLink = thefeeds[i].link;
			
			(function(rawTitle, titleSplit, n, i, drawIndex, colorVal, feedLink){myArr.push(function(done) {
				var imageSearch = new google.search.ImageSearch();
				var searchTerm = titleSplit[n];
				var dumbFunction = function() {
					var myRes = null;
					if (imageSearch.results.length != 0) {
						myRes = imageSearch.results[0].url;
													
						svg.append("rect")
							.attr("class", "class_"+i)
							.attr("fill", colorVal)
							.attr('x', (drawIndex * 50) % 1000 + 2)
							.attr('y', Math.floor(drawIndex / 20) * 50 + 2)
							.attr('width', 50)
							.attr('height', 50)
							.attr('stroke', colorVal);
							
						var image = svg.append("image")
							.attr("xlink:href", myRes)
							.attr('x', (drawIndex * 50) % 1000 + 2)
							.attr('y', Math.floor(drawIndex / 20) * 50 + 2)
							.attr('width', 50)
							.attr('height', 50)
							.attr('stroke', "green")
							.attr('title', rawTitle)
							.on('mouseover', (function() {
								var i = this;
								$(".class_" + i).attr("stroke", "yellow")
									.attr("stroke-width", "10");
							}).bind(i))
							.on('mouseout', (function() {
								var i = this;
								$(".class_" + i).attr("stroke", "")
									.attr("stroke-width", "1");
							}).bind(i))
							.on('click', function() {
								 window.open(feedLink);
							});
						
						var test = $(image);
				
						$(image).tooltip({
							'container': 'body',
							'placement': 'bottom'
						});
					}
					done(null, myRes);
				}
				imageSearch.setSearchCompleteCallback(this, dumbFunction, null);
				imageSearch.execute(titleSplit[n]);
			})})(rawTitle, titleSplit, n, i, drawIndex, colorVal, feedLink);
			drawIndex++;
			*/
		}		
		
		async.parallel(myArr, function(err,result) {
			//this is run when it is done
		});

		
	}
	else
		alert("Error fetching feeds!")
}

function handleData(finalData) {
	for (var test in finalData) {
		var color = "white";
		if (finalData[test].mood === "negative") 
			color = "red";
		if (finalData[test].mood === "positive")
			color = "green";
		d3.selectAll("#vis").append("p")
			.style("color", color)
			.text(finalData[test].name + ": " + finalData[test].mood);
	}
}

function addImage(res) {
	//goes through imgur and grabs the first image URL
	var url = getFirstImage(res);
	
	//document.getElementById("vis").innerHTML=rssoutput
	svg.append("image")
		.attr("xlink:href", url)
		.attr('x', xA)
		.attr('y', yA)
		.attr('width', 50)
		.attr('height', 50)
		.attr('stroke', "green");
	
	if (xA > 500) {
		xA = 0;
		yA += 50;
	} 
	else {
		xA += 50;
	}
}

function getFirstImage(res) {
	var text = res.responseText;
	var noFindText = "No images were found";
	
	if (text.search(noFindText) == -1) {
		return "http://i.imgur.com/mJ7cXhAb.jpg";
	}
	
	var startText = "i.imgur.com/";
	var startTextIndex = text.search(startText);
	var endTextIndex = text.search(".jpg\" original-title=");
	
	var resultText = text.substring(startTextIndex + startText.length, endTextIndex);
	
	return ("i.imgur.com/" + resultText + ".jpg");
}
