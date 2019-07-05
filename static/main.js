function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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

function goback() {
    console.log("going back")
    if (location.pathname + location.search != "/?p=" && (location.search != "" || location.pathname == "/404.html")) {
        location = "/?p=" + hist.split(",")[hist.split(",").length - 2]
        hist = hist.split(",").slice(0, hist.split(",").length - 2)
        setCookie("hist", hist)
    }
}

function renderbreadcrumb() {
    bread = document.getElementById("breadcrumb")
    hist.split(",").forEach(crumb => {
        bread.innerHTML = bread.innerHTML + "<a href=\"/?p=" + crumb + "\">" + crumb + "</a>  >  "
    });
}

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

function loaddata() {
    local = findGetParameter("p")
    if (local != null) {
        loadpage(local)
    } else {
        loadpage("index")
    }
}

function loadpage(name) {
    console.log("Geting Data for: " + name)
    getrequest("/data.json", {}, function (r) {
        resp = JSON.parse(r.responseText);
        console.log(resp["Page"])
        found = false
        resp["Page"].forEach(page => {
            if (page["filename"] == name) {
                data = page
                found = true
            }
        });
        if (found == false) {
            location = "/404.html"
            return
        }
        if (data["subcats"] != undefined) {
            data["subcats"].forEach(subcat => {
                resp["Page"].forEach(page => {
                    if (page["filename"] == subcat["link"]) {
                        subcat["type"] = page["type"]
                        subcat["descp"] = page["descp"]
                    }
                });
            });
        }
        var d = new Date();
        var n = d.getMonth();
        data["motm"] = resp["motm"][n]

        console.log("The Data is: " + data)
        if (data != null) {
            getrequest("/bodyexample.html", {}, function (r) {
                bodyexamplehtml = r.responseText
                document.body.innerHTML = Mustache.render(bodyexamplehtml, data)
                document.body.id = data["type"]
                document.title = data["title"]
                load()
            })
        }
    })
}

function load() {
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
    removeconsecutiveduplicates()
    renderbreadcrumb()
}

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