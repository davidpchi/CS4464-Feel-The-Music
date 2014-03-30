To use the senitment_gen.html:

1) Open the sentiment_gen.html file in notepad
2) Change line 16 to the emotion you want to pull
3) Change line 11 to the recursion depth you want to do
4) Save the file and open the webpage in Chrome.
5) Right click on the page and select "Inspect Element"
6) Go to the console, and type in "printFinalWordList("YOUR_EMOTION_HERE")"
	NOTE: Make sure you do not forget the quotation marks inside the parenthesis. 

The console should return a list of all synonyms of your original word. 

NOTE: Please make sure not to reload the sentiment_gen.html page repeatedly. We have limited API requests per day
On a 1-level deep recursive run, we typically make 100 calls, 
on a 2-level deep recursive run, we typically make around 300 calls. 

Regardless, it shouldn't be an issue as long as we don't spam the API. If it stops, we just have to wait until the next day.