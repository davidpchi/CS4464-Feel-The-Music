var feedurl="http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/limit=25/xml"
var feedlimit=100;
var rssoutput="<b>Latest Slashdot News:</b><br /><ul>";

var svg;
var tooltip;

var data={};
var xA=0;
var yA=0;

var finalData = {};
var finalEmotionArray = [];

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
var decreasingWords = [];

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
	
	d3.csv("tools/decreasingWords.csv", function(d) {
		decreasingWords.push(d);
		if (isDataLoaded()) 
			rssfeedsetup();
	});
}

function isDataLoaded() {
	return (happyData.length != 0 && sadData.length != 0 && angryData.length != 0 && nervousData.length != 0 && excitedData.length != 0 && jealousData.length != 0 && stressedData.length != 0 && relaxedData.length != 0 && fatiguedData.length != 0 && increasingWords.length != 0 && decreasingWords.length != 0);
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
			//display the error message if we fail to complete a page load operation
			displayError(errormsg);
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

function displayError(errormsg) {
	document.getElementById("loading_text").innerHTML = errormsg;
	document.getElementById("loading_img").src="http://www.hodtech.net/uploads/6/9/7/2/6972344/1659484_orig.png";
		
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
			//console.log(errormsg, data);
			//display the error message if we fail to complete a page load operation
			displayError(errormsg);
			callBack(data);
		  }
		}
	  );
	// if it is not an external URI, use Ajax load()
	} else {
	  $('#target').load(url);
	}
}

function processFeed(result){
	$('#loading_text').text("Processing RSS Feed");

	if (!result.error){
		var myArr = [];
		var thefeeds=result.feed.entries;
		var drawIndex = 0;
		
		var anotherIndex = 0; 
		
		//console.log(thefeeds.length);
		
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
			
			//console.log("" + i +": "+ rawTitle);
			//console.log(artist);
			data[rawTitle] = thefeeds[i];
			
			//TEST DEBUG CODE!!!
			
			//run our own sentiment analysis engine in the handle final data
			var titleAndArtist = getTitleAndArtist(thefeeds[anotherIndex].title);

			finalData[titleAndArtist[0] + " " + titleAndArtist[1]] = {
				mood: "neutral",
				title: titleAndArtist[0],
				artist: titleAndArtist[1],
				emotionArray: [],
				lyrics: "",
				rank: anotherIndex
			}; 
			anotherIndex++; 
			//console.log(anotherIndex);
			
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
		//console.log(featureIndex);
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
		var methodToRun = (function(test, finalData) {
			var testFunction = function(data) {
				finalData[test].lyrics = getLyrics(data);
				
				//console.log("data");
				
				//if not using default sentiment analysis, we will have to use our own
				if (isUsingDefaultSentimentAnaylsis == false)
					finalData[test] = runSentimentAnalysis(finalData[test]);
					
				index++;
				
				$('#loading_text').html("Please wait. This may take up to a minute. <br> Processing song " + index + " of " + finalDataLength);
				//document.getElementById("loading_text").innerHtml = ("Loading item " + index + " of " + finalDataLength);
				
				console.log(finalData[test].title + " " + index);
				
				if (index == finalDataLength) {
					finishDisplay();
				}
			}
			
			var url = "http://lyrics.wikia.com/"+finalData[test].artist.split(' ').join('_') + ":" + finalData[test].title.split(' ').join('_');
			//console.log(url);
			doAjax(url, testFunction);
		})(test,finalData);
	}
}

function finishDisplay() {
	//console.log("running finish data display");
	
	var yA = 50;
	var xA = 50;

	//here we will calculate the overall sentiment analysis
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
			
		//var color = "white";
		//if (finalData[test].mood === "negative") 
		//	color = "red";
		//if (finalData[test].mood === "positive")
		//	color = "green";
		//d3.selectAll("#vis").append("p")
		//	.style("color", color)
		//	.text(finalData[test].title + ":" + finalData[test].artist + ": " + finalData[test].mood + ": confidence/strength= " + finalData[test].confidence+"/"+finalData[test].strength); //+ finalData[test].lyrics);	
	
		var totalEmotionsCalc = 0;
		var myEmotionArray = finalData[test].emotionArray;
		
		for (var pop in myEmotionArray) {
			totalEmotionsCalc += myEmotionArray[pop];
		}
		
		if (totalEmotionsCalc == 0)
			totalEmotionsCalc = 1;
		
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
		
			(function(pop,test) {
			svg.append("path")
				.attr("d", arc)
				.attr("transform", "translate(" + xA + "," + yA + ")")
				.style("fill", colorArray[index])
				.on('mouseover', function(){
					//append tooltips with emotion values
					$("#cust_tooltip").text(pop + ": " + finalData[test].emotionArray[pop]);
					return tooltip.style("visibility", "visible");
				})
				.on('mousemove', function(){
					return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
				})
				.on('mouseout', function(){
					return tooltip.style("visibility", "hidden");
				});
							
			})(pop,test);
		
			lastAngle = endAngle;
			index++;
		}
		
		var songInfo = finalData[test].title + " by " + finalData[test].artist;
		var songEmotion = finalData[test].mood;
		var conStren = "confidence = " + finalData[test].confidence + ", strength = " + finalData[test].strength;
		var songLyrics = finalData[test].lyrics;
		
		var iconPath; 
		
		switch (finalData[test].mood) {
			case "happy":
				iconPath = "icons/happy.png";
				break;
			case "sad":
				iconPath = "icons/sad.png";
				break;
			case "angry":
				iconPath = "icons/angry.png";
				break;
			case "nervous":
				iconPath = "icons/nervous.png";
				break;
			case "jealous":
				iconPath = "icons/jealous.png";
				break;
			case "excited":
				iconPath = "icons/excited.png";
				break;
			case "stressed":
				iconPath = "icons/stressed.png";
				break;
			case "fatigued":
				iconPath = "icons/fatigued.png";
				break;
			case "serene":
				iconPath = "icons/serene.png";
				break;
			case "relaxed":
				iconPath = "icons/relaxed.png";
				break;
		}
			
		finalEmotionArray[finalData[test].mood] += (finalData[test].confidence * finalData[test].strength);
		
		svg.append("text")
			.attr('x', xA+110)
			.attr('y', yA-10)
			.attr('fill', 'white')
			.attr('font-size', '24px')
			/*.on('mouseover', function(){
					//append tooltips with emotion values
					$("#cust_tooltip").text(songLyrics);
					return tooltip.style("visibility", "visible");
				})
			.on('mouseout', function(){
					return tooltip.style("visibility", "hidden");
				})*/
			.text(songInfo);
		
		svg.append("text")
			.attr('x', xA+110)
			.attr('y', yA+15)
			.attr('font-weight', '300')
			.attr('font-size', '21px')
			.attr('fill', colorArray[sentimentToColorID(finalData[test].mood)] )
			.text(songEmotion);
			
		svg.append("text")
			.attr('x' , xA+185)
			.attr('y' , yA+15)
			.attr('font-size', '18px')
			.attr('fill', 'lightgray')
			.text(conStren);
			
		svg.append("svg:image")
			.attr('x', xA-25)
			.attr('y', yA-25)
			.attr('width', 50)
			.attr('height', 50)
			.attr("xlink:href",iconPath);
			
		yA+= 110;
	}
	
	//create the overall pie chart
	var svg2 = d3.selectAll("#final_sentiment").append("svg")
		.attr("width", 1000)
		.attr("height", 200);
	
	var finalTotalEmotionsCalc = 0;
	for (var pop in finalEmotionArray) {
		finalTotalEmotionsCalc+=finalEmotionArray[pop];
	}
	
	var lastAngle = 0;
	var index = 0;
	
	var finalSentimentText = [];
	
	var overallX = 300;
	var overallY = 75;
	
	for (var pop in finalEmotionArray) {
		var ratio = finalEmotionArray[pop]/ finalTotalEmotionsCalc;
		var endAngle = ratio * 2 * Math.PI + lastAngle;
		var arc = d3.svg.arc()
			.innerRadius(25)
			.outerRadius(75)
			.startAngle(lastAngle)
			.endAngle(endAngle);
	
		finalSentimentText.push(pop + ": " + finalEmotionArray[pop]);
	
		//draw a pie chart
		(function(pop,test) {
		svg2.append("path")
			.attr("d", arc)
			.attr("transform", "translate(" + overallX + "," + overallY + ")")
			.style("fill", colorArray[index])
			.on('mouseover', function(){
				$("#cust_tooltip").text(pop + ": " + finalEmotionArray[pop]);
				return tooltip.style("visibility", "visible");
			})
			.on('mousemove', function(){
				return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
			})
			.on('mouseout', function(){
				return tooltip.style("visibility", "hidden");
			});
						
		})(pop,test);
	
		lastAngle = endAngle;
		index++;
	}	
	
	var tempX = overallX + 100;
	var tempY = overallY - 50; 
	
	svg2.append("text")
		.attr('x', tempX)
		.attr('y', tempY)
		.attr('fill', 'white')
		.attr('font-size', '24px')
		.text("Overall:");
		
	svg2.append("svg:image")
		.attr('x', 275)
		.attr('y', 50)
		.attr('width', 50)
		.attr('height', 50)
		.attr("xlink:href","icons/happy.png");
		
	tempY+=24;
	
	for (var i = 0; i < finalSentimentText.length; i++) {
		svg2.append("text")
			.attr('x', tempX)
			.attr('y', tempY)
			.attr('fill', colorArray[i])
			.text(finalSentimentText[i]);
			
		tempY+=14;
	}
	
	//now display the final sentiment text	
	
	document.getElementById("vis").style.display="block";
	document.getElementById('loading').style.display='none';
}

function getEmotionIcon(mood) {
	var iconPath = "icons/happy.png";
	
	switch (mood) {
		case "happy":
			iconPath = "icons/happy.png";
			break;
		case "sad":
			iconPath = "icons/sad.png";
			break;
		case "angry":
			iconPath = "icons/angry.png";
			break;
		case "nervous":
			iconPath = "icons/nervous.png";
			break;
		case "jealous":
			iconPath = "icons/jealous.png";
			break;
		case "excited":
			iconPath = "icons/excited.png";
			break;
		case "stressed":
			iconPath = "icons/stressed.png";
			break;
		case "fatigued":
			iconPath = "icons/fatigued.png";
			break;
		case "serene":
			iconPath = "icons/serene.png";
			break;
		case "relaxed":
			iconPath = "icons/relaxed.png";
			break;
	}
	
	return iconPath;
}

function sentimentToColorID(mood) {
	if (mood ==="happy")
		return 0;
	else if (mood === "sad") 
		return 1;
	else if (mood === "angry")
		return 2;
	else if (mood === "nervous")
		return 3;
	else if (mood === "jealous")
		return 4;
	else if (mood === "excited")
		return 5;
	else if (mood === "stressed")
		return 6;
	else if (mood === "fatigued")
		return 7;
	else if (mood === "serene")
		return 8;
	else if (mood === "relaxed")
		return 9;
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
	var resetMultiplier = false;
	for (var i = 0; i < words.length; i++) {
		//clean the words of any punctuation
		words[i] = words[i].replace("?", "");
		words[i] = words[i].replace("!", "");
		words[i] = words[i].replace(".", "");
		
		//check for decreasing words
		for (var a = 0; a < decreasingWords[0].length; a++) {
			if (decreasingWords[0][a].not.replace(" ", "") === words[i]) {
				multiplier*=(-1);
			}
		}
		
		//check for increasing words
		for (var a = 0; a < increasingWords[0].length; a++) {
			if (increasingWords[0][a].very.replace(" ", "") === words[i]) {
				multiplier*=2;
			}
		}
	
		//check for regular emotions, taking into account the multiplier
		for (var a = 0; a < happyData[0].length; a++) {
			if (happyData[0][a].Happy.replace(" ", "") === words[i]) {
			
				//handle antonyms and negation
				if (multiplier > 0)
					emotionArray["happy"]+= 1 * multiplier;
				else 
					emotionArray["sad"]+= -1 * multiplier;
					
				resetMultiplier = true;
			}
		}
		for (var a = 0; a < sadData[0].length; a++) {
			if (sadData[0][a].Sad.replace(" ", "") === words[i]) {
			
				//handle antonyms and negation
				if (multiplier > 0)
					emotionArray["sad"]+= 1 * multiplier;
				else
					emotionArray["happy"]+= -1 * multiplier;

				resetMultiplier = true;
			}
		}
		for (var a = 0; a < angryData[0].length; a++) {
			if (angryData[0][a].Angry.replace(" ", "") === words[i]) {
				
				//handle antonyms and negation
				if (multiplier > 0)
					emotionArray["angry"]+= 1 * multiplier;
				else 
					emotionArray["relaxed"]+= -1 * multiplier;
					
				resetMultiplier = true;
			}
		}
		for (var a = 0; a < nervousData[0].length; a++) {
			if (nervousData[0][a].Nervous.replace(" ", "") === words[i]) {
				
				//handle antonyms and negation
				if (multiplier > 0)
					emotionArray["nervous"]+= 1 * multiplier;
				else 
					emotionArray["excited"]+= -1 * multiplier;	
					
				resetMultiplier = true;
			}
		}
		for (var a = 0; a < jealousData[0].length; a++) {				
			if (jealousData[0][a].Jealous.replace(" ", "") === words[i]) {
				
				//handle antonyms and negation
				if (multiplier > 0)
					emotionArray["jealous"]+= 1 * multiplier;
				else
					emotionArray["relaxed"]+= -1 * multiplier;
					
				resetMultiplier = true;
			}
		}
		for (var a = 0; a < excitedData[0].length; a++) {
			if (excitedData[0][a].Excited.replace(" ", "") === words[i]) {
				
				//handle antonyms and negation
				if (multiplier > 0)				
					emotionArray["excited"]+= 1 * multiplier;
				else
					emotionArray["fatigued"]+= -1 * multiplier;
				
				resetMultiplier = true;
			}
		}
		
		for (var a = 0; a < fatiguedData[0].length; a++) {
			if (fatiguedData[0][a].Fatigued.replace(" ", "") === words[i]) {
				
				//handle antonyms and negation
				if (multiplier > 0)				
					emotionArray["fatigued"]+= 1 * multiplier;
				else
					emotionArray["excited"]+= -1 * multiplier;
				
				resetMultiplier = true;
			}
		}
		
		for (var a = 0; a < relaxedData[0].length; a++) {
			if (relaxedData[0][a].Relaxed.replace(" ", "") === words[i]) {
			
				//handle antonyms and negation
				if (multiplier > 0)				
					emotionArray["relaxed"]+= 1 * multiplier;
				else
					emotionArray["stressed"]+= 1 * multiplier;
					
				resetMultiplier = true;
			}
		}
		
		for (var a = 0; a < stressedData[0].length; a++) {
			if (stressedData[0][a].Stressed.replace(" ", "") === words[i]) {
			
				//handle antonyms and negation
				if (multiplier > 0)				
					emotionArray["stressed"]+= 1 * multiplier;
				else
					emotionArray["relaxed"]+= -1 * multiplier;
					
				resetMultiplier = true;
			}
		}
		
		if (resetMultiplier == true) {
			//reset the multiplier
			multiplier = 1;
			resetMultiplier = false;
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
