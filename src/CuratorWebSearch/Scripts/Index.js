

var _searchParams = {
    pageSize : 5,
    pageNumber : 0,
    startRecord : 0,
    project : null,
    category : null
};

var _searchResults = {
    pages : new Array(),
    numFound : 0,
};

function totalPages() {
    return Math.ceil(_searchResults.numFound/_searchParams.pageSize);
}

function loadSearchResultPage(pageIndex) {
    _searchParams.pageNumber= parseInt(pageIndex);
    _searchParams.startRecord = _searchParams.pageNumber * _searchParams.pageSize;
    doSearch();
}

function getMaxRecordCount() {
    var maxRecord = (_searchParams.pageSize * (_searchParams.pageNumber + 1));
    if (maxRecord > _searchResults.numFound)
        return _searchResults.numFound;
    else
        return maxRecord;
}

function doSearch() {
    
    showLoadingScreen();
        
    _searchParams.pageSize = getPageSize();
    
    var searchUrl = buildSearchUrl();

    //jquery's getJSON doesn't have very good event handling    
    //$.getJSON(url, onSearchResultComplete).complete( function () { alert("complete") });

    //make the call to solr
    $.jsonp({
        url: searchUrl,
        callback: "callback",
        success: onSearchResultComplete,
        
        error: function(xOptions, textStatus) {
            showErrorScreen();
        }
    });
}

function showLoadingScreen() {
    $("#resultsDiv").html($("#loadingScreen").html());
}

function showErrorScreen() {
    $("#resultsDiv").html($("#errorScreen").html());
}

function getPageSize() {
    var pagesize = $("#lstPerPage").val();
    
    //save it into a cookie
    $.cookie("CodeSearch_PageSize", pagesize.toString(), { expires: 30 });
    return pagesize;
}

function buildSearchUrl() {
    var searchString = getSearchString();
    var url = _solrHost + "/select/?start=" + _searchParams.startRecord.toString() + "&rows=" + _searchParams.pageSize.toString() + "&indent=on&hl=true&hl.fl=*&hl.simple.pre=%3Cb%3E&hl.simple.post=%3C/b%3E&fl=id,fullpath,project,name,timestamp,category&echoparms=true&facet=true&facet.field=category&facet.field=project&wt=json&json.wrf=?&q=" + escape(searchString);

    if (_searchParams.project!=null)
        url+= "&fq=project:\"" + escape(_searchParams.project) + "\"";
    else if (_searchParams.category!=null)
        url+= "&fq=category:\"" + escape(_searchParams.category) + "\"";

    //alert(url);

    return url;
}

function getSearchString() {
    return $.trim($("#txtSearch").val());
}

function setSearchString(searchString) {
    $("#txtSearch").val(searchString);
}

function onSearchResultComplete(result) {
    _searchResults.pages = new Array();
    _searchResults.numFound = result.response.numFound;

    if (_searchResults.numFound > 0)
        _searchResults.pages[totalPages() - 1] = 1;

    //use the results template to show the search results
    $("#resultsDiv").html($("#resultsTemplate").tmpl(result));

    //start building the facet results
    buildFacetResults(result);   

    //hook click events to the << >> and page number links
    hookPagerClicks();
   
}

function buildFacetResults(result) {
    var projectFacetResults = new Array();

    for (var i = 0; i < result.facet_counts.facet_fields.project.length; i += 2)
        projectFacetResults[i / 2] = { term: result.facet_counts.facet_fields.project[i], count: result.facet_counts.facet_fields.project[i + 1] };

    var categoryFacetResults = new Array();

    for (var i = 0; i < result.facet_counts.facet_fields.category.length; i += 2)
        categoryFacetResults[i / 2] = { term: result.facet_counts.facet_fields.category[i], count: result.facet_counts.facet_fields.category[i + 1] };
                                                    
    $("#facetsDiv").html($("#facetsTemplate").tmpl({projectFacets: projectFacetResults, categoryFacets: categoryFacetResults}));

    $(".projectFacetLink").click(function (e) {
        _searchParams.pageNumber=0;
        _searchParams.startRecord=0;
        _searchParams.project=$(this).html();
        doSearch();
    });

     $(".categoryFacetLink").click(function (e) {
        _searchParams.pageNumber=0;
        _searchParams.startRecord=0;
        _searchParams.category=$(this).html();
        doSearch();
    });

     $(".removeFacet").click(function () {
        _searchParams.pageNumber=0;
        _searchParams.startRecord=0;
        _searchParams.project=null;
        _searchParams.category=null;
        doSearch();
    });
}

function hookPagerClicks() {
    $(".searchPagerBack").click(function() {
        loadSearchResultPage(_searchParams.pageNumber-1);
    });

    $(".searchPager").click(function() {
        loadSearchResultPage(parseInt($(this).html())-1);
    });

    $(".searchPagerForward").click(function() {
        loadSearchResultPage(_searchParams.pageNumber+1);
    });
}


function formatTimestamp(timestamp) {
    var newDate = new Date(timestamp);
    return newDate.toString();
}

$(document).ready(function () {
    $("#btnSearch").click(function () {
        _searchParams.project=null;
        _searchParams.category=null;
        _searchParams.startRecord=0;
        _searchParams.pageNumber=0;

        if (getSearchString()=="")
            setSearchString("*:*");

        doSearch();
    });

    $("#txtSearch").keyup(function (e) {
        if (e.which == 13) {
            $("#btnSearch").click();
        }
    });

    var pageSizeCookie = $.cookie("CodeSearch_PageSize");
    if (pageSizeCookie)
        $("#lstPerPage").val(pageSizeCookie);

   
            
});
    