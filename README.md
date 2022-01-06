 # UBC Transcript Chrome Extension

Prettifies the UBC SSC Grades page. Instead of paying 11$ for a transcript with course names, this does the job.  

## Instructions

 1. (a) Install official chrome extension [link here](https://chrome.google.com/webstore/detail/ubc-transcript/kcpilaggggglnjckpcckpngnikfceonn?hl=en&authuser=0). (b) Or download the release manifest.zip and follow [the steps here](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/). 
 2. (Optional) Pin the extension if needed
 3. Go to your [**Grades Summary**](https://ssc.adm.ubc.ca/sscportal/servlets/SRVSSCFramework?function=SessGradeRpt) page.
 4. Click on the extension to run!


 ## Credits

Huge thanks to Charles Clayton (1) and Arash Outadi (2) for previous code and Donney Fan (3) for exposing his UBC Grades backend for API access.
 
 1. https://github.com/crclayton/ubc-unofficial-transcript-exporter        
 2. https://github.com/arashout/ubc-courses
 3. https://ubcgrades.com/api

### Changelog from Arash's bookmarklet
 -  Made some modifications to convert js bookmarklet to a chrome extension
 -  Fixed CORS error (see top of background.js) preventing GET requests from both in console and bookmarklet to be run
 -  Changed API server to ubcgrades.com (hopefully it doesn't go down)
 
## How it does this:
 1. Adds a course names column and removes unnecessary columns
 2. Spacing items out better and increasing the width of the table 

### Extension
The extension is JavaScript code that runs on the user's browser to:
 1. Remove some columns
 2. Make an GET request to the server to retrieve course names for the course codes on the grades page
 3. Populates the new column called 'Course Names'
 4. Adds separation line between year sessions

## Output

The code gets rid of the extra tabs/average calculator app, spaces things out a little better, and aligns the table to the header. 

![After Transcript Example](https://github.com/arashout/ubc-courses/blob/master/examples/After.png "After Transcript Example")

## Before Picture

This is what the transcript looked like before
![Before Transcript Example](https://github.com/arashout/ubc-courses/blob/master/examples/Before.png "Before Transcript Example")
