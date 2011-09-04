$(document).ready(function () {

    RefreshProjectList();

});

function onSearchResultComplete(result) {
    var projectFacetResults = new Array();

    for (var i = 0; i < result.facet_counts.facet_fields.project.length; i += 2)
        projectFacetResults[i / 2] = { term: result.facet_counts.facet_fields.project[i], count: result.facet_counts.facet_fields.project[i + 1] };

    $("#facetsDiv").html($("#facetsTemplate").tmpl({ projectFacets: projectFacetResults }));

    $(".projectRemoveLink").click(function () {
        if (confirm("Are you sure you want to remove all documents for the project " + $(this).html() + "?"))
            deleteAllDocumentsForProject($(this).html());
        
    });
}

function deleteAllDocumentsForProject(project) {

    ShowLoadingScreen();

    var searchUrl = _solrHost + "/update?stream.body=%3Cdelete%3E%3Cquery%3Eproject:\"" + escape(project) + "\"%3C/query%3E%3C/delete%3E&commit=true";

    $.ajax({
        url: searchUrl,
        type: "GET",

        success: function () {
            //alert("done");
            CommitChanges();
        },

        error: function (xOptions, textStatus) {
            //this always gets called, even though it is a success
            CommitChanges();
        }
    });
}

function CommitChanges() {
    var searchUrl = _solrHost + "/update?commit=true";

    $.ajax({
        url: searchUrl,
        success: function () {
            RefreshProjectList();
        },
        error: function () {
            RefreshProjectList();
        }
    });
}

function RefreshProjectList() {
    ShowLoadingScreen();

    //get all of the projects
    var searchUrl = _solrHost + "/select/?start=0&rows=1&indent=on&fl=project&echoparms=true&facet=true&facet.field=project&wt=json&json.wrf=?&q=*:*";

    //make the call to solr
    $.jsonp({
        url: searchUrl,
        callback: "callback",
        success: onSearchResultComplete,

        error: function (xOptions, textStatus) {
            alert("error");
            //showErrorScreen();
        }
    });
}

function ShowLoadingScreen() {
    $("#facetsDiv").html($("#loadingScreen").html());
}