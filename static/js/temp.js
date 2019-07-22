async function main(){
    //args object for passing to the page constructor, set default arguments for datafile and template_name, these only change if the get parameter "g" is non-null
    page_args = Object();
    page_args["datafile"] = "js/page_data.json";
    page_args["template"] = "bodyexample.html";

    //find the name to be passed to the constructor
    local = findGetParameter("p");
    if (!local) {
        //if null is returned for "p", try "g"
        local = findGetParameter("g");
        if (local) {
            //if get parameter for "g" is non-null then set data and template for adviser page
            page_args["datafile"] = "js/adviser_info.json";
            page_args["template"] = "goto_adviser.html";
        } else {
            //if both p and g return null then set local to index
            local = "index"
        }
    }

    page_args["name"] = local;

    Page.getData(page_args["name"], page_args["datafile"], function(data){
        page_args["data"] = data;
        var page = new Page(page_args);
        page.render();
    });
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(args){
        this.name = args["name"];
        this.datafile = args["datafile"];
        this.template_name = args["template"];
        this.data = args["data"];
    }
    
    setUpSubcats() {

        console.log(this.data);
        //check whether subcats exists
        if (this.data["subcats"]) {
            var clickID = 0;
            //iterate through all the subcats
            var subcats = this.data["subcats"];
            subcats.forEach(subcat => {
                if (!subcat["linkexternal"]) {
                    subcat["link"] = "/?p=" + subcat["link"]; //prepend proper string formatting to link
                }
                //set clickID
                subcat["clickID"] = clickID++;
            })
        }
    }

    static getData(name, datafile, callback){
        console.log("Getting data for: " + name + " from: " + datafile);
        $.get(datafile, function(data) { callback(data[name]); });
    }

    setMotm() {
        var self = this;
        $.get("js/motm.json", function(data) { 
            var d = new Date();
            self.data["motm"] = data[d.getMonth()];            
        });
    }

    render() {

        //if the data for the page is null or undefined then redirect to 404 and return
        if (this.data) {
            this.setUpSubcats();
            this.setMotm();
            console.log(this.data);
            document.title = this.data["title"];
        } else {
            console.log("yoooo");
            this.template_name = "404.html";
            document.title = "(404) Page Not Found";
        }

        var self = this;
        $.get(this.template_name, function(template) {
            document.body.innerHTML = Mustache.render(template, self.data);
        })

    }
}

class History {
    constructor() {
        this.full_hist = new Array();
        this.breadcrumb = new Set();
    }

    //get history from session storage
    static getHistory(){ sessionStorage.getItem("hist"); }
    storeHistory(){ sessionStorage.setItem(this); }
}

// This function is the beginning of a new system which will replace the breadcrumb/history system. This click handler is used instead of links in most cases.
function clickhandler(url,t,external,goto_adviser) {
    // This retrives a small bit of information about the thing that has been clicked
    clickid = t.getAttribute("data-clickid");

    // This records the destination URL, clickid, name of the page you are on
    console.log(url,clickid,pagename)

    // this is a section of data which will be used in the new journey system
    clickdata = {"type":"click","currentpage":pagename,"clickname":clickid};
    console.log(JSON.stringify(clickdata))

    // This simply redirects you to the location your click was supposed to go to
    if (clickid.search(/subcat\_.*/) == 0) {
        if (external) {
            var win = window.open(url, '_blank');
            win.focus();
        } else if (goto_adviser) {
            location = url
        } else {
            location = url
        }
    } else if (clickID.search(/breadcrumb\_.*/) == 0) {
        console.log("Lets go breadcrumbing")
    }
}





// This just returns data for a get parameter named when calling the function
function findGetParameter(parameterName) {
    var result = null, tmp = [];

    //using the url "http://localhost/?p=exams&h=index,exams" as an example
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