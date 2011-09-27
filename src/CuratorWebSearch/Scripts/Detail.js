var _urlParams = {};
var docid = "";
var openTag = "<span class='searchtext'>";
var closeTag = "</span>";

$(document).ready(function () {
    //get the id from the query string
    docid = _urlParams["id"];
    var searchString = _urlParams["searchQuery"];

    var url = _solrHost + "/select/?start=0&rows=1&indent=on&hl=true&hl.snippets=1&hl.fragsize=0&hl.maxAnalyzedChars=1048576&hl.fl=*&hl.simple.pre=" + escape(openTag) + "&hl.simple.post=" + escape(closeTag) + "&fl=id,filedata,name&wt=json&json.wrf=?&q=" + searchString + " id:" + docid;

    //get the search results via json
    $.getJSON(url,
                    function (result) {

                        var filedata = result.response.docs[0].filedata;

                        //set the body of the page to the resulting document
                        $("#preMainBody").text(filedata);

                        //setting the hl.fragsize to 0 means that it returns the whole document as highlighted. Easy!
                        if (result.highlighting[docid].filedata) {
                                $("#preMainBody").html(result.highlighting[docid].filedata[0]);
                        }


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