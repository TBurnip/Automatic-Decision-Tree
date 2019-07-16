var hist

// As the name suggest it sets a cookie. This is a modified version of a bit of code of the internet
function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// same as above but for getting a cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

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
    hist.split(",").forEach(crumb => {
        bread.innerHTML = bread.innerHTML + "<li class=\"breadcrumb-item\"><a href=\"/?p=" + crumb + "\">" + crumb + "</a></li>"
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


// This is used to load data into the page. This only a switch which allows for the use of localhost to represent index.
function loaddata() {
    local = findGetParameter("p")
    if (local != null) {
        pagename = local
        loadpage()
    } else {
        pagename = "index"
        loadpage()
    }
}

// Loads the page with the given name. This uses the data from the json to load the page and uses a file called bodyexample.html as a template.
var data
var pagename
var pagedata

function loadpage() {
    console.log("Geting Data for: " + pagename);
    $.get("/js/data.json",jsonloaded);
}

function jsonloaded(resp) {
    data = resp
    console.log(data)
    pagedata = data["pages"][pagename]
    if (pagedata != undefined) {
        if (!(pagedata["subcats"] == null || pagedata["subcats"] == undefined)) {
            pagedata["subcats"].forEach(subcat => {
                if (subcat["linkexternal"] == false) {
                    if (data["pages"][subcat["link"]] != undefined) {
                        subcat["type"] = data["pages"][subcat["link"]]["type"]
                        subcat["descp"] = data["pages"][subcat["link"]]["descp"]
                        subcat["link"] = "/?p=" + subcat["link"]
                    }
                } else {
                    subcat["type"] = "external\" target=\"_blank\" class=\"";
                    subcat["descp"] = "This is an external link. Use caution when proceeding";
                }
            })
        }

        var d = new Date();
        var n = d.getMonth();
        pagedata["motm"] = data["motm"][n]
        if (data != null) {
            $.get("/bodyexample.html",bodyexampleloaded);
        }
    } else {
        console.log(pagename)
        location = "/404.html"
        return
    }
}

function bodyexampleloaded(r) {
    console.log(pagedata)
    console.log(r)
    bodyexamplehtml = r
    document.body.innerHTML = Mustache.render(bodyexamplehtml, pagedata)
    document.body.id = pagedata["type"]
    document.title = pagedata["title"]
    load(pagename)
}


// Load is a whole bunch of miscellaneous stuff related to loading the page.
function load(name) {
    hist = getCookie("hist")
    if (hist != "") {
        if (location.pathname + location.search == "/?p=" || (location.search == "" && location.pathname != "/404.html") || location.search == "?p=index") {
            setCookie("hist", "index")
        } else {
            setCookie("hist", hist + "," + findGetParameter("p"))
        }
    } else {
        setCookie("hist", findGetParameter("p"))
    }
    hist = getCookie("hist")
    gethist = findGetParameter("h")
    if (gethist != null) {
        hist = gethist
    }
    removeconsecutiveduplicates()
    renderbreadcrumb()
    bottomofpagelink(name,false)
}

// This just returns data for a get parameter named when calling the function
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
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