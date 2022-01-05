 ### UBC Transcript Chrome Extension
 
 ## Changelog 
 -  Made some modifications to convert js bookmarklet to a chrome extension
 -  Fixed CORS error (see top of background.js) preventing GET requests from both in console and bookmarklet to be run
 -  Changed API server to ubcgrades.com (hopefully it doesn't go down)

 Huge thanks to Charles Clayton (1) and Arash Outadi (2) for previous code and Donney Fan (3) for exposing his UBC Grades backend for API access.
 
 
 
 1. https://github.com/crclayton/ubc-unofficial-transcript-exporter        
 2. https://github.com/arashout/ubc-courses
 3. https://ubcgrades.com/api


---


## What it does:
Beautifies the lacking unofficial UBC transcript with extra information and better formatting.

## How it does this:
It does this in several ways:
1. Adding a course names columns
2. Removing unnecessary widgets
3. Spacing items out better and increasing the width of the table 

## Instructions

1a. Install chrome extension ([link here](https://chrome.google.com/webstore/detail/ubc-transcript/kcpilaggggglnjckpcckpngnikfceonn?hl=en&authuser=0)).

1b. Pull the repo and install unpacked by following [the steps here](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/). The repo is already unzipped.

2. Go to your [**Grades Summary**](https://ssc.adm.ubc.ca/sscportal/servlets/SRVSSCFramework?function=SessGradeRpt) page.

3. Click on the extension to run!

## Output

The code gets rid of the extra tabs/average calculator app, spaces things out a little better, and aligns the table to the header. 

![After Transcript Example](https://github.com/arashout/ubc-courses/blob/master/examples/After.png "After Transcript Example")

## Before Picture

This is what the transcript looked like before
![Before Transcript Example](https://github.com/arashout/ubc-courses/blob/master/examples/Before.png "Before Transcript Example")

## How it works:
### Extension
- The extension is JavaScript code that runs on the user's browser to:
1. Format the page by removing unnecessary features
3. Make an GET request to the server to retrieve course names for the course codes on the grades page
4. Populates the new column called 'Course Names'

### The Server
api.ubcgrades.com
