var feedurl="http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/limit=25/xml"
var feedlimit=100;
var rssoutput="<b>Latest Slashdot News:</b><br /><ul>";

var svg;
var data={};
var xA=0;
var yA=0;

var finalData = {};

var isUsingDefaultSentimentAnaylsis = false;

var happyData = [];
var sadData = [];
var angryData = [];
var nervousData = [];
var jealousData = [];
var excitedData = [];

//DAVID CHI 02/27/14

function init(){

	document.getElementById("vis").style.display="none";
	document.getElementById('loading').style.display='block';

	d3.csv("/tools/happy.csv", function(d) {
		happyData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("/tools/sad.csv", function(d) {
		sadData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("/tools/angry.csv", function(d) {
		angryData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("/tools/nervous.csv", function(d) {
		nervousData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("/tools/excited.csv", function(d) {
		excitedData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("/tools/jealous.csv", function(d) {
		jealousData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
}

function isDataLoaded() {
	return (happyData.length != 0 && sadData.length != 0 && angryData.length != 0 && nervousData != 0 && excitedData != 0 && jealousData != 0);
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

function getLyrics(rawHtmlParam) {
	var rawHtml = rawHtmlParam.toString();
	var startText = "<div class=\"lyricbox\">";
	var startIndex = rawHtml.indexOf(startText) + startText.length;
	var endText = "<div id=\"songfooter\">";
	var endIndex = rawHtml.indexOf(endText);
	
	var tempText = rawHtml.substring(startIndex, endIndex);
	var finalText = "";
	var canCopy = true;
		
	//rip out all tags in the string
	for (var i = 0; i < tempText.length; i++) {
		if (tempText.charAt(i) === "<") 
			canCopy = false;
		else if (tempText.charAt(i) === ">")
			canCopy = true;
		else if (canCopy == true) {
			finalText += tempText.charAt(i);
		}
	}
	
	return finalText;
}	

function doAjax(url, callBack){
	// if it is an external URI
	if(url.match('^http')){
	  // call YQL
	  $.getJSON("http://query.yahooapis.com/v1/public/yql?"+
				"q=select%20*%20from%20html%20where%20url%3D%22"+
				encodeURIComponent(url)+
				"%22&format=xml'&callback=?",
		// this function gets the data from the successful 
		// JSON-P call
		function(data){
		  // if there is data, filter it and render it out
		  if(data.results[0]){
			var data = filterData(data.results[0]);
			callBack(data);
		  // otherwise tell the world that something went wrong
		  } else {
			var errormsg = "<p>Error: can't load the page.</p>";
			console.log(errormsg);
		  }
		}
	  );
	// if it is not an external URI, use Ajax load()
	} else {
	  $('#target').load(url);
	}
}

// filter out some nasties
function filterData(data){
	data = data.replace(/<?\/body[^>]*>/g,'');
	data = data.replace(/[\r|\n]+/g,'');
	data = data.replace(/<--[\S\s]*?-->/g,'');
	data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
	data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
	data = data.replace(/<script.*\/>/,'');
	return data;
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
						//check to see if we are using default sentiment analysis or our sentiment analysis
						//note, this default sentiment analysis is only using lyric snippets
						//TODO: THIS IS BROKEN, AND I AM NOT PLANNING ON FIXING IT!!! :D
						if (isUsingDefaultSentimentAnaylsis == true) {
							$.ajax({
								url: 'https://loudelement-free-natural-language-processing-service.p.mashape.com/nlp-text/', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
								type: 'GET', // The HTTP Method
								data: {text: data.data[0].snippet}, // Additional parameters here
								datatype: 'json',
								success: function(data) { 
									var titleAndArtist = getTitleAndArtist(thefeeds[anotherIndex].title);
								
									finalData[thefeeds[anotherIndex].title] = {
										mood: data["sentiment-text"],
										strenght: 0,
										confidence: 0,
										title: titleAndArtist[0],
										artist: titleAndArtist[1],
										lyrics: "",
										rank: anotherIndex
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
						else {
							//run our own sentiment analysis engine in the handle final data
							var titleAndArtist = getTitleAndArtist(thefeeds[anotherIndex].title);

							finalData[thefeeds[anotherIndex].title] = {
								mood: "neutral",
								title: titleAndArtist[0],
								artist: titleAndArtist[1],
								emotionArray: [],
								lyrics: "",
								rank: anotherIndex
							}; 
							anotherIndex++; 
							if (anotherIndex == 25) {
								handleData(finalData);
							}
						}
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
		}		
		
		async.parallel(myArr, function(err,result) {
			//this is run when it is done
		});

		
	}
	else
		alert("Error fetching feeds!")
}

function getTitleAndArtist(rawStr) {
	//rawStr has both artist and title
	var artistAndTitle = [];
	//we will return an array with both artist and title
	var tempArtist = "";
	var tempTitle = "";
	var canCopy = true;
	var isOnTitle = true;
	
	//replace the " - " with just "-"
	rawStr = rawStr.replace(" - ", "-");
	
	for (var i = 0; i < rawStr.length; i++) {
		if (rawStr.charAt(i) === "(") 
			canCopy = false;
		else if (rawStr.charAt(i) === ")")
			canCopy = true;
		else if (canCopy == true) {
			//ignore hashtags
			if (rawStr.charAt(i) === "#") {
				continue;
			}
			//check to see if we are at moving onto the artist
			if (rawStr.charAt(i) === "-") {
				isOnTitle = false;
				continue;
			}
			//check to see if we are on title
			if (isOnTitle == true)
				tempTitle += rawStr.charAt(i);
			else 
				tempArtist += rawStr.charAt(i);
		}
	}
	
	artistAndTitle[0] = tempTitle;
	artistAndTitle[1] = tempArtist;
	
	return artistAndTitle;
}

function handleData(finalData) {

	var finalDataLength = 0;
	
	for (var test in finalData) {
		finalDataLength++;
	}

	var index = 0;
	for (var test in finalData) {
		(function(test, finalData) {
			var testFunction = function(data) {
				finalData[test].lyrics = getLyrics(data);
				
				console.log("data");
				
				//if not using default sentiment analysis, we will have to use our own
				if (isUsingDefaultSentimentAnaylsis == false)
					finalData[test] = runSentimentAnalysis(finalData[test]);
					
				index++;
				
				console.log("index: " + index + ", length: " + finalDataLength);
				
				if (index == finalDataLength - 1) {
					finishDisplay();
				}
			}
			
			var url = "http://lyrics.wikia.com/"+finalData[test].artist.split(' ').join('_') + ":" + finalData[test].title.split(' ').join('_');
			console.log(url);
			doAjax(url, testFunction); 
		})(test,finalData);
	}
}

function finishDisplay() {
	console.log("running finish data display");
	for (var test in finalData) {
		var color = "white";
		if (finalData[test].mood === "negative") 
			color = "red";
		if (finalData[test].mood === "positive")
			color = "green";
		d3.selectAll("#vis").append("p")
			.style("color", color)
			.text(finalData[test].title + ":" + finalData[test].artist + ": " + finalData[test].mood + ": confidence/strength= " + finalData[test].confidence+"/"+finalData[test].strength); //+ finalData[test].lyrics);	
	}
	
	document.getElementById("vis").style.display="block";
	document.getElementById('loading').style.display='none';
}

function runSentimentAnalysis(song) {
	//loop through each word of the lyrics
	var words = song.lyrics.split(" ");
	var emotionArray = [];
	emotionArray["happy"] = 0;
	emotionArray["sad"] = 0;
	emotionArray["angry"] = 0;
	emotionArray["nervous"] = 0;
	emotionArray["jealous"] = 0;
	emotionArray["excited"] = 0;
	
	for (var i = 0; i < words.length; i++) {
		for (var a = 0; a < happyData[0].length; a++) {
			if (happyData[0][a].Happy.replace(" ", "") === words[i]) {
				emotionArray["happy"]++;
			}
		}
		for (var a = 0; a < sadData[0].length; a++) {
			if (sadData[0][a].Sad.replace(" ", "") === words[i]) {
				emotionArray["sad"]++;
			}
		}
		for (var a = 0; a < angryData[0].length; a++) {
			if (angryData[0][a].Angry.replace(" ", "") === words[i]) {
				emotionArray["angry"]++;
			}
		}
		for (var a = 0; a < nervousData[0].length; a++) {
			if (nervousData[0][a].Nervous.replace(" ", "") === words[i]) {
				emotionArray["nervous"]++;
			}
		}
		for (var a = 0; a < jealousData[0].length; a++) {
			if (jealousData[0][a].Jealous.replace(" ", "") === words[i]) {
				emotionArray["jealous"]++;
			}
		}
		for (var a = 0; a < excitedData[0].length; a++) {
			if (excitedData[0][a].Excited.replace(" ", "") === words[i]) {
				emotionArray["excited"]++;
			}
		}
	}
	
	var maxVal = 0;
	var returnVal = "";
	for (var potate in emotionArray) {
		if (maxVal < emotionArray[potate]) {
			song.confidence = (emotionArray[potate] - maxVal)/emotionArray[potate];
			maxVal = emotionArray[potate];
			returnVal = potate;
		}
	}
	
	song.emotionArray = emotionArray;
	song.mood = returnVal;
	song.strength = maxVal;	
	return song;
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
