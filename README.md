CS4464-Feel-The-Music
=====================

CS 4464 Project

The __finalData__ array is what contains all of the songs, and they are listed in the order of most popular to least popular. The following is the information availible for each song in the array. 
* _mood_: The emotion of the song. See the next section for what emotions are currently supported. 
* _title_: The title of the song.
* _artist_: The artist of the song.
* _emotionArray_: An containing the strength values for each of the emotions. For the elements in this array, see the next section for what emotions are currently supported.
* _lyrics_: The full lyrics for the song. 
* _rank_: The billboard 100 ranking for the song.

The following are the emotions that are supported at the moment (as well as their opposites):
* Happy (Sad)
* Sad (Happy)
* Angry (Relaxed)
* Nervous (Excited)
* Jealous (Relaxed)
* Excited (Fatigued)
* Fatigued (Excited)
* Relaxed (Stressed)
* Stressed (Relaxed)

To see a list of all of the words that the sentiment analysis classifies for each emotion, see the tools directory for each individual CSV. To add additional emotions, simply add additional values to the CSV. 

The __increasingWords__ CSV lists which words will be classified as words that multiply the strength of a particular emotion that follows this word. 

Note that at the moment, "decreasingWords" or words that invert the strength of a particular emotion that follows this word, is currently hardcoded. They will be made into a csv in the future.
