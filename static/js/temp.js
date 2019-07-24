async function main(){
    //args object for passing to the page constructor, set default arguments for datafile and template, these only change if the get parameter "g" is non-null
    page_args = Object();
    var datafile = "js/page_data.json";
    var template = "bodyexample.html";

    //find the name to be passed to the constructor
    var page_name = findGetParameter("p");
    if (!page_name) {
        //if null is returned for "p", try "g"
        page_name = findGetParameter("g");
        if (page_name) {
            //if get parameter for "g" is non-null then set data and template for adviser page
            datafile = "js/adviser_info.json";
            template = "goto_adviser.html";
        } else {
            //if both p and g return null then set page_name to index
            page_name = "index";
        }
    }

    Page.getData(page_name, datafile, function(data){
        var page = new Page(page_name, template, data);
        History.update(page.hist, page_name);
        History.storeHistory(page.hist);
        page.render();
    });
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(name, template, data){

        /*
            Attributes for class Page:
                name:       name of the page
                template:   .html file used to render the page
                data:       data for the page read from the datafile
                hist:       an instance of class History, loaded from session storage
        */

        this.name = name;
        this.template = template;
        this.data = data;
        this.hist = History.retrieveHistory();
        console.log(this.hist);
    }

    static async getData(name, datafile, callback){
        console.log("Getting data for: " + name + " from: " + datafile);
        $.get(datafile, function(data) { callback(data[name]); });
    }
    
    setUpSubcats() {
        //check whether subcats exists
        if (this.data["subcats"]) {
            var clickID = 0;
            //iterate through all the subcats
            var subcats = this.data["subcats"];
            subcats.forEach(subcat => {
                if (!subcat["linkexternal"]) {
                    var get_praram;
                    subcat["goto_adviser"] ? get_praram = "g" : get_praram = "p";
                    subcat["link"] = "/?" + get_praram + "=" + subcat["link"]; //prepend proper string formatting to link
                }
                //set clickID
                subcat["clickID"] = clickID++;
            })
        }
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
            //console.log(this.data);
            document.title = this.data["title"];
        } else {
            console.log("yoooo");
            this.template = "404.html";
            document.title = "(404) Page Not Found";
        }

        var self = this;
        $.get(this.template, function(template) {
            document.body.innerHTML = Mustache.render(template, self.data);
        })

    }
}

class History {
    constructor() {

        /*
            Attributes for History:
                hist:       array storing every page that the user has visited
                breadcrumb: set storing previously visited pages (no duplicates), used as a navigation element
        */

        //see if there is any existing history
        var hist = findGetParameter("h");
        if (hist) {
            //if so create array and set with existing history
            split_hist = hist.split(",");
            this.full_hist = new Array(split_hist);
            this.breadcrumb = new Set(split_hist);    
        } else {
            //otherwise create empty array and set
            this.full_hist = new Array();
            this.breadcrumb = new Set();
        }
    }

    //get history from session storage and return it, if history doesn't exist in session storage return new history
    static retrieveHistory(){
        var hist = JSON.parse(sessionStorage.getItem("hist"));
        if (hist) { return hist; }
        else { return new History(); }
    }

    //store a JSON serialized version of the history in session storage
    static storeHistory(hist){ sessionStorage.setItem("hist", JSON.stringify(hist)); }

    static update(hist, page) {
        hist.full_hist.push(page);
        console.log(hist.breadcrumb);

        if (page === "index") {
            hist.breadcrumb = new Set([page]);
        } else {
            var breadcrumb = new Set(hist.full_hist);
            hist.breadcrumb = breadcrumb;
        }
    }

    getPreviousPage() {
        //if the length of the history is greater than 1 (ie a previous page exists), then return the previous page
        var len = this.full_hist.length;
        if (len > 1) { return this.full_hist[len - 2]; }
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
            if (tmp[0] == parameterName) { result = decodeURIComponent(tmp[1]) };
        });
        return result;
}