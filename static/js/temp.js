function main(){
    var hist;
    var data;
    var pagename;
    var pagedata;

    //get the search parameter, and it it isn't null then set the pagename to it
    local = findGetParameter("p");
    local != null ? pagename = local : pagename = "index";

    console.log("Geting Data for: " + pagename);
    $.get("/js/data.json",jsonloaded);
}