var feedurl="http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/limit=25/xml"
var feedlimit=100;
var rssoutput="<b>Latest Slashdot News:</b><br /><ul>";

var svg;
var tooltip;

var data={};
var xA=0;
var yA=0;

var finalData = {};

var isBillBoard100 = true;
var finalDataLength = 0;

var isUsingDefaultSentimentAnaylsis = false;

var happyData = [];
var sadData = [];
var angryData = [];
var nervousData = [];
var jealousData = [];
var excitedData = [];
var fatiguedData = [];
var relaxedData = [];
var stressedData = [];
var increasingWords = [];

var colorArray = ['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(204,235,197)','rgb(255,237,111)'];

//DAVID CHI 02/27/14

function init(){
	
	//Code to init the vis
	svg = d3.selectAll("#vis").append("svg")
		.attr("width", 1000)
		.attr("height", 2750);

	tooltip = d3.select("body")
		.append("div")
		.attr("id", "cust_tooltip")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("color", "white")
		.style("visibility", "hidden")
		.text("a simple tooltip");
			
	document.getElementById("vis").style.display="none";
	document.getElementById('loading').style.display='block';
	$('#loading_text').text("Loading emotion data");
	
	d3.csv("tools/happy.csv", function(d) {
		happyData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/sad.csv", function(d) {
		sadData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});

	d3.csv("tools/angry.csv", function(d) {
		angryData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/nervous.csv", function(d) {
		nervousData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/excited.csv", function(d) {
		excitedData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/jealous.csv", function(d) {
		jealousData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/relaxed.csv", function(d) {
		relaxedData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/fatigued.csv", function(d) {
		fatiguedData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/stressed.csv", function(d) {
		stressedData.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
	
	d3.csv("tools/increasingWords.csv", function(d) {
		increasingWords.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
}

function isDataLoaded() {
	return (happyData.length != 0 && sadData.length != 0 && angryData.length != 0 && nervousData != 0 && excitedData != 0 && jealousData != 0 && stressedData != 0 && relaxedData != 0 && fatiguedData != 0 && increasingWords != 0);
}

function rssfeedsetup(){
	if (isBillBoard100)
		feedurl = "http://www1.billboard.com/rss/charts/hot-100";
		
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
			//TODO: NEED TO FIX THIS!!! decrement our overall count so the app doesn't hang
			finalDataLength--;
			console.log(errormsg, data);
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
	$('#loading_text').text("Processing RSS Feed");

	if (!result.error){
		var myArr = [];
		var thefeeds=result.feed.entries;
		var drawIndex = 0;
		
		var anotherIndex = 0; 
		
		console.log(thefeeds.length);
		
		for (var i=0; i<thefeeds.length; i++) {
			rssoutput+="<li><a href='" + thefeeds[i].link + "'>" + thefeeds[i].title + "</a></li>"	

			var rawTitle = thefeeds[i].title;
			var artist = "";
			//check to see if we are parsing the billboard RSS or the iTunes RSS
			if (isBillBoard100) {
				var colonIndex = rawTitle.search(":");
				var commaIndex = rawTitle.search(",");
				
				rawTitle = rawTitle.substring(colonIndex + 2, commaIndex);
				artist = rawTitle.substring(commaIndex + 2);
			}
			else {
				var dashIndex = rawTitle.search("-");
				artist = rawTitle.substring(dashIndex+2);
				rawTitle = rawTitle.substring(0,dashIndex-1);
			}
			
			artist = artist.replace(/ /g,"_");
			rawTitle = rawTitle.replace(/ /g,"_");
			artist = artist.replace("#", "");
			rawTitle = rawTitle.replace("#", "");
			
			if (rawTitle.indexOf('(') > 0)
				rawTitle = rawTitle.substring(0, rawTitle.indexOf('(')-1);
			if (artist.indexOf('&') > 0)
				artist = artist.substring(0, artist.indexOf('&')-1);
			
			console.log("" + i +": "+ rawTitle);
			console.log(artist);
			data[rawTitle] = thefeeds[i];
			
			//TEST DEBUG CODE!!!
			
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
			console.log(anotherIndex);
			
			//provide a cap for billboard
			if (isBillBoard100) {
				if (anotherIndex == 25) {
					break;
				}
			}
		}
		
		handleData(finalData);
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
	
	if (isBillBoard100) {
		var colonIndex = rawStr.search(":");
		var commaIndex = rawStr.search(",");
		
		tempTitle = rawStr.substring(colonIndex + 2, commaIndex);
		tempArtist = rawStr.substring(commaIndex + 2);
		
		//remove hashtags from titles
		tempTitle = tempTitle.replace("#", "");
		
		//remove featured artists
		var featureIndex =tempArtist.search("Featuring");
		console.log(featureIndex);
		if (featureIndex > 0)
			tempArtist = tempArtist.substring(0,featureIndex);
	}
	else {
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
	}
	
	artistAndTitle[0] = tempTitle;
	artistAndTitle[1] = tempArtist;
	
	return artistAndTitle;
}

function handleData(finalData) {	
	for (var test in finalData) {
		finalDataLength++;
	}

	$('#loading_text').html("Please wait. This may take up to a minute. <br> Starting sentiment analysis");
	
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
				
				$('#loading_text').html("Please wait. This may take up to a minute. <br> Processing song " + index + " of " + finalDataLength);
				//document.getElementById("loading_text").innerHtml = ("Loading item " + index + " of " + finalDataLength);
				
				if (index == finalDataLength) {
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
	
	var yA = 50;
	var xA = 300;

	//here we will calculate the overall sentiment analysis
	var finalEmotionArray = [];
	finalEmotionArray["happy"] = 0;
	finalEmotionArray["sad"] = 0;
	finalEmotionArray["angry"] = 0;
	finalEmotionArray["nervous"] = 0;
	finalEmotionArray["jealous"] = 0;
	finalEmotionArray["excited"] = 0;
	finalEmotionArray["stressed"] = 0;
	finalEmotionArray["fatigued"] = 0;
	finalEmotionArray["serene"] = 0;
	finalEmotionArray["relaxed"] = 0;
		
	for (var test in finalData) {
		var color = "white";
		if (finalData[test].mood === "negative") 
			color = "red";
		if (finalData[test].mood === "positive")
			color = "green";
		//d3.selectAll("#vis").append("p")
		//	.style("color", color)
		//	.text(finalData[test].title + ":" + finalData[test].artist + ": " + finalData[test].mood + ": confidence/strength= " + finalData[test].confidence+"/"+finalData[test].strength); //+ finalData[test].lyrics);	
	
		var totalEmotionsCalc = 0;
		var myEmotionArray = finalData[test].emotionArray;
		
		for (var pop in myEmotionArray) {
			totalEmotionsCalc += myEmotionArray[pop];
		}
		
		var lastAngle = 0;
		var index = 0;
		for (var pop in myEmotionArray) {
			var ratio = myEmotionArray[pop]/ totalEmotionsCalc;
			var endAngle = ratio * 2 * Math.PI + lastAngle;
			var arc = d3.svg.arc()
				.innerRadius(25)
				.outerRadius(50)
				.startAngle(lastAngle)
				.endAngle(endAngle);
		
			//TODO: NEED TO FIGURE OUT TOOLTIPS
			svg.append("path")
				.attr("d", arc)
				.attr("transform", "translate(" + xA + "," + yA + ")")
				.style("fill", colorArray[index])
				.on('mouseover', function(){
					$("#cust_tooltip").text(pop + ": " + myEmotionArray[pop]);
					return tooltip.style("visibility", "visible");
				})
				.on('mousemove', function(){
					return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
				})
				.on('mouseout', function(){
					return tooltip.style("visibility", "hidden");
				});
				
			lastAngle = endAngle;
			index++;
		}		
		
		var text = finalData[test].title + ":" + finalData[test].artist + ": " + finalData[test].mood + ": confidence/strength= " + finalData[test].confidence+"/"+finalData[test].strength; //+ finalData[test].lyrics)
		
		console.log(finalData[test].mood);
		
		finalEmotionArray[finalData[test].mood] += (finalData[test].confidence * finalData[test].strength);
		
		svg.append("text")
			.attr('x', xA+110)
			.attr('y', yA)
			.attr('fill', 'red')
			.text(text);
			
		yA+= 110;
	}
	
	console.log(finalEmotionArray);
	
	var finalSentimentText = "";
	for (var pop in finalEmotionArray) {
		finalSentimentText += "<br>" + pop + ": " + finalEmotionArray[pop];
	}
	
	document.getElementById("final_sentiment").innerHTML = finalSentimentText;
	
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
	emotionArray["stressed"] = 0;
	emotionArray["fatigued"] = 0;
	emotionArray["serene"] = 0;
	emotionArray["relaxed"] = 0;
	
	//multiplier used to increase/decrease the value of words
	var multiplier = 1;
	
	for (var i = 0; i < words.length; i++) {
		//check for negation words
		if (words[i] === "not" || words[i] === "never" || words[i] === "no") {
			multiplier*=-1;
		}
		
		//check for increasing words
		for (var a = 0; a < increasingWords[0].length; a++) {
			if (increasingWords[0][a].very.replace(" ", "") === words[i]) {
				multiplier*=-2;
			}
		}
	
		//check for regular emotions, taking into account the multiplier
		for (var a = 0; a < happyData[0].length; a++) {
			if (happyData[0][a].Happy.replace(" ", "") === words[i]) {
				emotionArray["happy"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		for (var a = 0; a < sadData[0].length; a++) {
			if (sadData[0][a].Sad.replace(" ", "") === words[i]) {
				emotionArray["sad"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		for (var a = 0; a < angryData[0].length; a++) {
			if (angryData[0][a].Angry.replace(" ", "") === words[i]) {
				emotionArray["angry"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		for (var a = 0; a < nervousData[0].length; a++) {
			if (nervousData[0][a].Nervous.replace(" ", "") === words[i]) {
				emotionArray["nervous"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		for (var a = 0; a < jealousData[0].length; a++) {
			if (jealousData[0][a].Jealous.replace(" ", "") === words[i]) {
				emotionArray["jealous"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		for (var a = 0; a < excitedData[0].length; a++) {
			if (excitedData[0][a].Excited.replace(" ", "") === words[i]) {
				emotionArray["excited"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		
		for (var a = 0; a < fatiguedData[0].length; a++) {
			if (fatiguedData[0][a].Fatigued.replace(" ", "") === words[i]) {
				emotionArray["fatigued"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		
		for (var a = 0; a < relaxedData[0].length; a++) {
			if (relaxedData[0][a].Relaxed.replace(" ", "") === words[i]) {
				emotionArray["relaxed"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
			}
		}
		
		for (var a = 0; a < stressedData[0].length; a++) {
			if (stressedData[0][a].Stressed.replace(" ", "") === words[i]) {
				emotionArray["stressed"]+= 1 * multiplier;
				//reset the multiplier
				multiplier = 1;
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
