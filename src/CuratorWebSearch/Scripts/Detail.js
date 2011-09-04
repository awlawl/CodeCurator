var _urlParams = {};

$(document).ready(function () {
    //get the id from the query string
    var docid = _urlParams["id"];

    //get the search results via json
    $.getJSON(_solrHost + "/select/?start=0&rows=1&indent=on&fl=id,filedata,name&wt=json&json.wrf=?&q=id:" + docid,
                    function (result) {
                        //set the body of the page to the resulting document
                        $("#preMainBody").text(result.response.docs[0].filedata);

                        //stolen from http://stackoverflow.com/questions/180103/jquery-how-to-change-title-of-document-during-ready
                        document.title = result.response.docs[0].name;

                        //apply highlight.js formatting;
                        $("pre").each(function (i, e) { hljs.highlightBlock(e, '     '); });

                    });

});

//stolen from http://stackoverflow.com/questions/901115/get-querystring-values-in-javascript
(function () {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

    while (e = r.exec(q))
        _urlParams[d(e[1])] = d(e[2]);
})();