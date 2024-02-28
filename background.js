// To bypass CORS policy as of Chrome 85 or something: https://stackoverflow.com/questions/55214828/how-to-stop-corb-from-blocking-requests-to-data-resources-that-respond-with-cors/55215898#55215898
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    fetch(request.input, request.init).then(function (response) {
        return response.text().then(function (text) {
            sendResponse([{
                body: text,
                status: response.status,
                statusText: response.statusText,
            }, null]);
        });
    }, function (error) {
        sendResponse([null, error]);
    });
    return true;
});


function main() {
    // Replace all invocations of fetch with fetchResource
    function fetchResource(input, init) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ input, init }, messageResponse => {
                const [response, error] = messageResponse;
                if (response === null) {
                    reject(error);
                } else {
                    // Use undefined on a 204 - No Content
                    const body = response.body ? new Blob([response.body]) : undefined;
                    resolve(new Response(body, {
                        status: response.status,
                        statusText: response.statusText,
                    }));
                }
            });
        });
    }

    function formatGradeSummary() {

        const iframe = document.querySelector("#iframe-main").contentWindow.document;

        function quickReplace(n) {
            iframe.querySelector(n).remove();
        }
        // remove calculator and semester navigator
        ["#calculator_title", "#calculator_title_text", ".ui-tabs-nav"].forEach(quickReplace);

        // space things out a bit better
        iframe.querySelector("h1").style = "margin:10px 0 -20px 70px;";
        iframe.querySelector("#header-invisible img").style = "margin-bottom: 15px;";

        // center table and set to width of UBC header image
        iframe.querySelector("#tabs").style = "margin: 0px auto; width:800px";

    }
    var val_arr = [];
    function removeUselessCols() {
        const iframe = document.querySelector("#iframe-main").contentWindow.document;
        const tableElement = iframe.querySelector("#allSessionsGrades");
        const tableBody = tableElement.children[0];
        const tableRows = tableBody.children;
        let courseList = [];

        // Keep standing col and % grade, remove section col
        const removeNoGradeRow = 1;
        const removeSectionColumn = 1;
        const removeStandingColumn = 0;

        // Hardcoded col variables
        const COL_INDEX_RETRIEVAL = Object.freeze({
            COURSE_CODE: 0,
            LETTER_GRADE: 3,
            SESSION: 4,
            STANDING: 10,
        });
        const COL_INDEX_REMOVAL = Object.freeze({
            SECTION: 1,
            STANDING: 10,
        });

        // For sectioning the sessions to more closely match official transcript
        var sess_curr = "";
        var sess_prev = "";

        // Reverse loop so that we can remove rows during iteration
        
        for (let i = tableRows.length - 1; i >= 0; i--) {
            const row = tableRows[i];

            // If there is no letter grade / standing then remove the row and move to the next iteration!
            const cellLetterGrade = row.children[COL_INDEX_RETRIEVAL.LETTER_GRADE];
            const letterGrade = cellLetterGrade.innerText;
            const standing = row.children[COL_INDEX_RETRIEVAL.STANDING].innerText;
            sess_curr = row.children[COL_INDEX_RETRIEVAL.SESSION].innerText;

            // Collect course names to send via HTTP request
            // Add a new column for the course name
            const cellCourseCode = row.children[COL_INDEX_RETRIEVAL.COURSE_CODE]
            const courseCode = cellCourseCode.innerText;
            // If statement is for getting rid of fluff
            if (courseCode !== "" && courseCode !== "Course") {
                courseList.push({
                    "course": courseCode,
                    "session": sess_curr
                });
            }

            // Remove useless columns
            // Remove higher index first to avoid indexing problems
            if (removeStandingColumn) {
                row.removeChild(row.children[COL_INDEX_REMOVAL.STANDING]);
            }
            if (removeSectionColumn) {
                row.removeChild(row.children[COL_INDEX_REMOVAL.SECTION]);
            }

            let cellCourseName = row.insertCell(1);
            cellCourseName.style.textAlign = "center";
            if (i == 0) {
                cellCourseName.innerText = "Course Name";
                cellCourseName.classList.add("listHeader");
            } else {
                // Remove non-breaking spaces in id. Add row number as prefix to prevent same ID if same course is taken multiple times.
                cellCourseName.id = i + courseCode.replaceAll("\xa0", " ");
                cellCourseName.classList.add("listRow");
                val_arr.push(cellCourseName.id);
                console.log(cellCourseName);
            }

            if ((i != 0 || i != tableRows.length - 1) && sess_prev !== sess_curr){
                row.style = "border-bottom: #C0C0C0 2px solid";
            }

            sess_prev = sess_curr;
        }


        return courseList;
    }

    const map = new Map();
    async function getCourseName(courseCode, row, campus='V') {
        const iframe = document.querySelector("#iframe-main").contentWindow.document;
        const GRADES_API_URL = "https://ubcgrades.com/api/v2/grades/UBC";
        const STATISTICS_API_URL = "https://ubcgrades.com/api/v2/course-statistics/UBC";
        var completeURL;

        // Check to see if already called in hashmap. So we don't need to do another API call
        if (map.has(courseCode.join(""))){
            const cellCourseName = iframe.getElementById(val_arr[row]);
            cellCourseName.innerText = map.get(courseCode[0]+courseCode[1]);
            cellCourseName.contentEditable = 'true';
            console.log("Repeated course! Getting from local repo");
        }
        else{
            completeURL = STATISTICS_API_URL + campus + '/' + courseCode[0] + '/' + courseCode[1];
            const response = await fetchResource(completeURL, { method: "GET", });
            const data = await response.text();
            let obj = data ? await JSON.parse(data) : {}
            console.log(completeURL);
            console.log(data);
    
            if (obj.error == "Not Found") {
                if (campus == 'V'){
                    campus = 'O';
                }
                else {
                    console.log("Course name for " + courseCode + " not found in campus UBCO. No other campuses to try...");
                    // already tried okanagan and vancouver campus. no other campus to try.
                    return;
                }
                console.log("Course name for " + courseCode + " not found in campus UBCV. Trying UBCO");
                getCourseName(courseCode, row, campus);
            }
            console.log(row + courseCode.join(" "));
            console.log(val_arr[row]);
            const cellCourseName = iframe.getElementById(val_arr[row]);
            cellCourseName.innerText = obj.course_title;
            cellCourseName.contentEditable = 'true';
            map.set(courseCode.join(''), obj.course_title);
        }

    }

    function populateCourseNames(courseList) {
        const iframe = document.querySelector("#iframe-main").contentWindow.document;
        console.log(courseList);
        for (let i = 0; i < courseList.length; i++) {
            let courseCode = courseList[courseList.length-i-1]["course"].split(/\s+/);
            // Add 2 to account for header's unique ID
            getCourseName(courseCode, courseList.length-i-1);
        }
        console.log(map);
    }

    formatGradeSummary();

    let courseList = removeUselessCols();
    
    populateCourseNames(courseList);
}


chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: main
    });
});
