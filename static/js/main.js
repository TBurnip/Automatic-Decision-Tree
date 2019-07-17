var hist;
var data;
var pagename;
var pagedata;

// Once the data from bodyexample.html has been loaded this code is ran. This renders the final webpage using Mustoche as a templating engine 
function bodyexampleloaded(r) {
    console.log(pagedata);
    bodyexamplehtml = r
    document.body.innerHTML = Mustache.render(bodyexamplehtml, pagedata)
    document.body.id = pagedata["type"] /* POSSIBLY CAN GET RID OF THIS SINCE IT ISN'T DOING ANYTHING IN THE CSS */
    document.title = pagedata["title"]
    load(pagename)
}

// Load is a whole bunch of miscellaneous stuff related to loading the page.
function load(name) {
    hist = getCookie("hist");
    if (hist != "") {
        if (location.pathname + location.search == "/?p="
            || (location.search == "" && location.pathname != "/404.html")
            || location.search == "?p=index") {
            setCookie("hist", "index")
        } else {
            setCookie("hist", hist + "," + findGetParameter("p"))
        }
    } else {
        setCookie("hist", findGetParameter("p"))
    }
    hist = getCookie("hist")
    gethist = findGetParameter("h")
    if (gethist != undefined) {
        hist = gethist
    }
    removeconsecutiveduplicates() //this function will be unescessary if we make history a set
    removebrowserbackeventduplicates()
    renderbreadcrumb()
    bottomofpagelink(name,false)
}

// Getter and setter for cookies
function setCookie(cname, cvalue) { sessionStorage.setItem(cname,cvalue); }
function getCookie(cname) { return sessionStorage.getItem(cname); }

// This function takes advantage of a variable and cookie called hist. Hist stands for history and is an array of all the previous pages a user has been to. This function simply steps back up the array and deletes the page you are on while doing so.
function goback() {
    console.log("going back")
    if (location.pathname + location.search != "/?p=" && (location.search != "" || location.pathname == "/404.html")) {
        location = "/?p=" + hist.split(",")[hist.split(",").length - 2]
        hist = hist.split(",").slice(0, hist.split(",").length - 2)
        setCookie("hist", hist)
    }
}

// This takes the data in hist and displays it as an interactive breadcrumb trail
function renderbreadcrumb() {
    bread = document.getElementById("breadcrumb")
    bread.innerHTML = ""
    count = 0
    hist.split(",").forEach(crumb => {
        bread.innerHTML = bread.innerHTML + "<li class=\"breadcrumb-item\"><a onclick=\"clickhandler('/?p=" + 
        crumb + "',this)\" href=\"#\" data-clickID=\"breadcrumb_"+ 
        count +"\">" + 
        crumb + "</a></li>";
        count ++;
    });
}

// This removes duplicate history entries from the history (I know this is not a good function and should be broken out for general use however it is only used once).
function removeconsecutiveduplicates() {
    hista = hist.split(",")
    console.log(hista)
    out = []
    previouscrumb = ""
    hista.forEach(crumb => {
        if (crumb != previouscrumb) {
            out.push(crumb)
            previouscrumb = crumb
        }
    });
    console.log(out)
    hista = out
    hist = hista[0]
    hista.slice(1).forEach(crumb => {
        hist += "," + crumb
    });
    setCookie("hist", hist)
}

// This function is used to detect if the browser back button has been used and if it has it removes the correct items from the bread crumb train.
function removebrowserbackeventduplicates() {

    /*
        example of how this works

        if you are on a page called course_assignments
        and your history was
        index,course,course_assignments

        then you were to use the browser back button
        your history would become
        index,course,course_assignments,course

        to fix this once detected we simply remove
        course_assignments and course

        for the example bellow presume 
        hist = "index,course,course_assignments,course"
    */


    hista = hist.split(",") // hista = ["index","course","course_assignments","course"]
    if (hista[hista.length - 3] == pagename) { // 4 - 3 => 1 if hista[1] = "course"
        console.log("browser back") 
        hist = hista.slice(0,-2).join(); // makes removes the last two elements from hista then makes hist = hista joined with ","
    }
}

// This just returns data for a get parameter named when calling the function
function findGetParameter(parameterName) {

    var result = null, tmp = [];

    /*
        We'll use the following example URL to see how this function works:
        "http://localhost/?p=exams&h=index,exams"
    */

    location.search //get the query URI - ie. "?p=exams&h=index,exams"
        .substr(1) // => "p=exams&h=index,exams"
        .split("&") //=> ["p=exams", "h=index,exams"]
        .forEach(function (item) {
            //then for each element in the array
            //if the first character of the element is the get parameter passed to the function the return the unencoded version of the URI
            tmp = item.split("=");
            if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]) };
        });
        return result;
}

function loadadviser() {
    load()
    x = findGetParameter("g")
    $.get("/js/data.json",function (r) {
        resp = r
        console.log(resp["goto_adviser"])
        jobject = resp["goto_adviser"][x]
        document.getElementById("why").innerHTML = jobject["why"]
        document.getElementById("what").innerHTML = jobject["what"]
        bottomofpagelink(x,true)
    });
}

function bottomofpagelink(page,ad) {
    text = document.getElementById("link").getElementsByTagName("input")[0]
    hist = getCookie("hist")

    if (ad) {
        linkstr = location.origin + location.pathname + "?g=" + page + "&h=" + hist
    }else {
        linkstr = location.origin + location.pathname + "?p=" + page + "&h=" + hist
    }
    
    text.setAttribute("value", linkstr)
    link = document.getElementById("link").getElementsByTagName("a")[0]
}

function clicktocopy(element) {
    console.log("copying")
    /* Get the text field */
    link = element

    /* Select the text field */
    link.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}
function clickhandler(url,t) {
    clickID = t.getAttribute("data-clickID")
    console.log(url,clickID,pagename)
    clickdata = {"type":"click","currentpage":pagename,"clickname":clickID};
    console.log(JSON.stringify(clickdata))
    if (clickID.search(/subcat\_.*/) == 0) {
        location = url
    } else if (clickID.search(/breadcrumb\_.*/) == 0) {
        console.log("Lets go breadcrumbing")
    }
}