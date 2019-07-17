function main(){
    var hist;

    //get the search parameter, and it it isn't null then set the pagename to it
    local = findGetParameter("p");
    local != null ? pagename = local : pagename = "index";

    //create new page object of pagename and render
    page =  new Page(pagename);
    page.render();

}

class History {
    constructor() {
        this.hist = new Set(["index"]);
    }
}

class Page {

    //upon object creation, set name and automatically get the data for the page
    constructor(name){
        this.name = name;
        this.data = this.getData(name);
    }
    
    setUpSubcats() {
        //check whether subcats exists
        subcats = this.data["subcats"];
        if (subcats) {
            var clickID = 0;

            //iterate through all the subcats
            subcats.forEach(subcat => {
                target_page = new Page(subcat["link"]);
                if (!(target_page || subcat["linkexternal"])) {
                    subcat["type"] = target_page["type"]; //set type of subcat (POSSIBLY GETTING REMOVED)
                    subcat["link"] = "/p=" + subcat["link"]; //append proper string formatting to link
                } else {
                    subcat["type"] = "external\" target=\"_blank\" class=\"";
                }
                //set clickID
                subcat["clickID"];
            })
        }
    }

    getData(name) {
        console.log("Geting Data for: " + name);
        //gets the data for the page of a given name using a HTTP request for data.json
        $.get("/js/data.json", function(data) { return data["pages"][this.name]; });
    }

    getMotm() {
        $.get("/js/data.json", function(data) { 
            var d = new Date();
            return data["motm"][d.getMonth()];            
        });
    }

    render() {
        //if the data for the page is null or undefined then redirect to 404 and return
        if (!this.data) {
            location = "/404.html";
            return;
        }

        this.setUpSubcats();
        this.data["motm"] = this.getMotm();

        $.get("bodyexample.html", function(template) {
            document.body.innerHTML = Mustache.render(template, this.data);
            document.body.id = data["type"]; /* POSSIBLY CAN GET RID OF THIS SINCE IT ISN'T DOING ANYTHING IN THE CSS */
            document.title = data["title"];
        })

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