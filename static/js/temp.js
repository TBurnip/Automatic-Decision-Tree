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

    //retrieve history from session storage, update then store again
    var hist = History.retrieveHistory();
    hist.update(page_name);
    History.storeHistory(hist);

    //get the data from the datafile, create a page object then render
    Page.getData(page_name, datafile, function(data){
        var page = new Page(page_name, template, data);
        console.log(hist.breadcrumb);
        page.render(hist);
    });
    
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(name, template, data){

        /*
            Attributes:
                name:       name of the page
                template:   .html file used to render the page
                data:       data for the page read from the datafile
        */

        this.name = name;
        this.template = template;
        this.data = data;
    }

    static async getData(name, datafile, callback){
        console.log("Getting data for: " + name + " from: " + datafile);
        $.get(datafile, function(data) { callback(data[name]); })
        .fail(function(){

        });
    }
    
    setUpSubcats() {
        var subcats = this.data["subcats"];
        //check whether subcats exists
        if (subcats) {       
            //for every non-external link, prepend "/?" and the appropriate get parameter
            subcats.forEach(subcat => {
                if (!subcat["linkexternal"]) {
                    var get_praram;
                    subcat["goto_adviser"] ? get_praram = "g" : get_praram = "p";
                    subcat["link"] = "/?" + get_praram + "=" + subcat["link"];
                }
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

    render(hist) {

        //if history is null/undefined then retrieve history from session storage
        if (!hist) { var hist = History.retrieveHistory(); }

        //if the data for the page is null or undefined then redirect to 404 and return
        if (this.data) {
            this.setUpSubcats();
            this.setMotm();
            document.title = this.data["title"];
        } else {
            this.template = "404.html";
            document.title = "(404) Page Not Found";
        }

        //pass the page data and appropriate tempate to the moustache rendering engine
        var self = this;
        $.get(this.template, function(template) {
            document.body.innerHTML = Mustache.render(template, self.data);
            console.log(hist);
            hist.renderBreadcrumb();
        })

    }
}

class History {
    constructor(hist) {

        /*  
            Takes:
                hist:      JSON object stored in session storage

            Attributes:
                full_hist:  array storing every page that the user has visited
                breadcrumb: set storing previously visited pages (no duplicates), used as a navigation element
        */

        //see if there is any existing history
        var existing_hist = findGetParameter("h");
        if (existing_hist) { //if so create array and set with existing history
            split_hist = hist.split(",");
            this.full_hist = new Array(split_hist);
            this.breadcrumb = new Set(split_hist);    
        } else if (hist){ //if history is stored
            this.full_hist = hist["full_hist"];
            this.breadcrumb = new Set(hist["breadcrumb"]);
        } else { //otherwise just initialise with empty array and set
            this.full_hist = new Array();
            this.breadcrumb = new Set();
        }
    }

    //get history from session storage and return it, if history doesn't exist in session storage return new history
    static retrieveHistory() {
        var hist = JSON.parse(sessionStorage.getItem("hist"));
        return new History(hist);
    }

    //store a JSON serialized version of the history in session storage
    static storeHistory(hist){
        //JSON.stringify doesn't store Set objects, so convert to array
        hist.breadcrumb = Array.from(hist.breadcrumb);
        sessionStorage.setItem("hist", JSON.stringify(hist)); 
    }

    //takes the breadcrumb and builds and inserts the html for displaying it
    renderBreadcrumb() {
        var breadcrumb = this.breadcrumb;
        $(document).ready(function(){

            //the string we will be appending text to
            var str = "";
            breadcrumb.forEach(function(crumb){
                //build anchor tag for the links in the breadcrumb
                var link = "<a onclick=\"Nav.breadcrumbClick('" + crumb + "')\" href=\"#\">" + crumb + "</a>";
                //add the list item tags with appropriate class
                str += "<li class=\"breadcrumb-item\">" + link + "</li>";
            });
    
            document.getElementById("breadcrumb").innerHTML = str;
        })
    }

    update(page, crumb_click=false, back=false) {

        /*
            we don't want repeated entries in our history
            so check if the element we're trying to add is the same as the last element in the history
            if it isn't then we're okay to add
        */

        var last_page = this.full_hist[this.full_hist.length -1];
        if (last_page != page) { this.full_hist.push(page); }

        console.log(crumb_click);
        var breadcrumb;
        
        //if the page we are adding is "index" then we have returned to the index page so breadcrumb should only contain index"
        if (page === "index") { breadcrumb = new Set(["index"]); }
        else if (crumb_click) { //if we are updating from a click on the breadcrumb trail element

            /*
                we want to create a new breadcrumb trail that contains the elements of the previous breadcrumb up to the page that was clicked on (inclusive).
                So we have:
                    crumb_iter: an array containing the elements to the breadcrumb that we will use to iterate over
                    new_crumb:  array for copying elements to
                    i:          index for accessing the two arrays
            */

            var crumb_iter = Array.from(this.breadcrumb);
            var new_crumb = new Array();
            var i = 0;

            do {
                //assign the ith element of the old breadcrumb to the ith element of new breadcrumb
                var old_page = crumb_iter[i];
                new_crumb[i] = old_page;
                i++;
            } while (page != old_page); //if the ith element of the old breadcrumb matches the page being added we can stop

            //create a set from the array
            console.log(new_crumb);
            breadcrumb = new Set(new_crumb);

        } else if(back) {
            var bc = Array.from(this.breadcrumb);
            bc.pop();
            breadcrumb = new Set(bc);
        } else {
            //otherwise just add new page to the breadcrumb
            breadcrumb = this.breadcrumb.add(page);
        }

        //assign value of breadcrumb
        this.breadcrumb = breadcrumb;
    }

    getPreviousPage() {
        //if the length of the history is greater than 1 (ie a previous page exists), then return the previous page
        var len = this.full_hist.length;
        if (len > 1) { return this.full_hist[len - 2]; }
        //otherwise return the only element
        else { return this.full_hist[len - 1]; }
    }
}

class Nav {
    static goBack() {
        var hist = History.retrieveHistory();
        var prev_page = hist.getPreviousPage();
        hist.update(prev_page, false, true);
        History.storeHistory(hist);
        Nav.redirect(prev_page);
    }

    static breadcrumbClick(page) {
        var hist = History.retrieveHistory();
        hist.update(page, true, false);
        History.storeHistory(hist);
        Nav.redirect(page);
    }

    //find approprate get parameter for page, build URI and redirect to that location
    static redirect(page) {
        var get_param = Nav.getParamForPage(page);
        var uri = "\?" + get_param + "=" + page;
        location = uri;
    }

    //returns the "g" if page is an adviser page, "p" otherwise
    static getParamForPage(page) {
        /*
            NOTE: this is a really hacky way of doing things and needs rethought
        */

        //names of all the goto adviser pages
        var adviser_pages = ["can_drop_or_swap", "outside_add_drop", "degree", "consider_for_fit_to_study", "cant_progress"];
        var get_param;
        adviser_pages.includes(page) ? get_param = "g" : get_param = "p";
        return get_param;
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