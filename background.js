


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

    function removeUselessCols() {
        const iframe = document.querySelector("#iframe-main").contentWindow.document;
        const tableElement = iframe.querySelector("#allSessionsGrades");
        const tableBody = tableElement.children[0];
        const tableRows = tableBody.children;
        let courseList = [];

        const removeNoGradeRow = 1;
        const removeSectionColumn = 1;
        const removeStandingColumn = 1;

        const COL_INDEX_RETRIEVAL = Object.freeze({
            COURSE_CODE: 0,
            LETTER_GRADE: 3,
        });
        const COL_INDEX_REMOVAL = Object.freeze({
            SECTION: 1,
            STANDING: 10,
        });

        // Reverse loop so that we can remove rows during iteration
        for (let i = tableRows.length - 1; i >= 0; i--) {
            const row = tableRows[i];

            // If there is no letter grade than remove the row and move to the next iteration!
            const cellLetterGrade =
                row.children[COL_INDEX_RETRIEVAL.LETTER_GRADE]
                ;
            const letterGrade = cellLetterGrade.innerText;
            if (removeNoGradeRow && letterGrade === "") {
                tableBody.removeChild(row);
                continue;
            }

            // Collect course names to send via HTTP request
            // Add a new column for the course name
            const cellCourseCode = row.children[COL_INDEX_RETRIEVAL.COURSE_CODE]
            const courseCode = cellCourseCode.innerText;
            // If statement is for getting rid of fluff
            if (courseCode !== "" && courseCode !== "Course") {
                courseList.push(courseCode);
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
            if (i === 0) {
                cellCourseName.innerText = "Course Name";
                cellCourseName.classList.add("listHeader");
            } else {
                cellCourseName.id = courseCode;
                cellCourseName.classList.add("listRow");
            }
        }

        return courseList;
    }

    function populateCourseNames(courseList) {
        const iframe = document.querySelector("#iframe-main").contentWindow.document;
        const API_URL = "https://ubcgrades.com/api/v2/course-statistics/UBCV";
        let error_logging = 0;

        for (let i = 0; i < courseList.length; i++) {
            let courseCode = courseList[i].split(/\s+/);
            let completeURL = API_URL + '/' + courseCode[0] + '/' + courseCode[1];

            // Replaced fetch with fetchResource, see line 162 for info
            fetchResource(completeURL, { method: "GET", })
                .then(response => {
                    return response.text()
                })
                .then((data) => {
                    let obj = data ? JSON.parse(data) : {};
                    const cellCourseName = iframe.getElementById(courseList[i]);
                    cellCourseName.innerText = obj.course_title;
                    cellCourseName.contentEditable = 'true';
                })
                .catch(function (error) {
                    console.log(error);
                    error_logging = 1;
                });

            if (error_logging) {
                alert(`
                    Something went wrong contacting ubc-grades server? 
                    `);
                break;
            }
        }
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