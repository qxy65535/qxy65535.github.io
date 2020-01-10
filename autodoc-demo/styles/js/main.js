function get_href_loc(href)
{
    var filename = "default"
    var loc = ""
    var l = href.split("://")
    if (l.length > 1) {
        l = l[l.length-1]
    } else {
        l = href
    }
    l = l.split("#").filter((item) => item != "")
    if (l.length <= 1) {
        return [filename, loc]
    }
    
    if (l.length > 2) {
        loc = l[l.length-1]
        filename = l[l.length-2]
    } else if (l.length == 2) {
        filename = l[l.length-1]
    }
    if (filename && filename[0] == '/') {
        filename = filename.substr(1)
    }
    return [decodeURI(filename), decodeURI(loc).toLowerCase()]
}

function get_click_loc(href)
{
    var h = href.split("#")
    var filename = ""
    var loc = ""
    if (h.length > 2) {
        filename = h[h.length-2]
        loc = h[h.length-1]
    } else if (h.length == 2) {
        filename = h[h.length-1]
    }
    if (filename && filename[0] == '/') {
        filename = filename.substr(1)
    }
    return [decodeURI(filename), decodeURI(loc).toLowerCase()]
}

function scroll_right(loc)
{
    var top = $("[id='"+loc+"']").offset().top-parseInt($(".inner-wrapper").css("paddingTop"))
    top -= parseInt($("[id='"+loc+"']").css("marginTop"))
    $("html,body").animate({scrollTop: top}, 200)
}

function resize_left()
{
    var margin_top = parseInt($("body").css("marginTop")) + $("header").height()
    var left_height = $(window).height() - margin_top
    $(".wrapper-left").height(left_height)
    $("#left").height(left_height - parseInt($("#left").css("paddingTop")) - parseInt($("#left").css("paddingBottom")))
}

function highlight_index(cur_select, cur)
{
    var find = false
    $("#left").find("a").each(function(i,item){
        if (find) return
        var dest = get_click_loc($(item).attr("href"))
        if (dest[0] == cur[0] && (dest[1] == cur[1] || cur[1] == "")) {
            if (cur_select) {
                cur_select.removeClass("selected")
            }
            cur_select = $(item)
            $(item).addClass("selected")
            find = true
        }
    })

    var node = cur_select
    while (node && node[0]) {
        if (node[0].tagName == "DETAILS") {
            if (node.attr("open")) {
                // p.removeAttr("open")
            } else {
                node.attr("open", "")
            }
            break
        }
        node = node.parent()
    }
    return cur_select
}

$(document).ready(function(){
    var pre_loc = ""
    var loc = get_href_loc(window.location.href)
    var cur_select = null

    $("#left").empty().load("navbar.html", function(response,status,xhr) {
        $("#left a").click(function(){
            if ($(this).parent() && $(this).parent().parent()) {
                var p = $(this).parent().parent()
                if (p[0].tagName == "DETAILS") {
                    if (p.attr("open")) {
                    } else {
                        p.attr("open", "")
                    }
                }
            }
            if (cur_select) {
                cur_select.removeClass("selected")
            }
            cur_select = $(this)
            $(this).addClass("selected")
        })
    })

    $("#right").empty().load(loc[0]+".html", function(response,status,xhr) {
        if (status == "error") {
            alert("error page")
        }
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block)
        });

        pre_loc = location.href
        if (loc[0] != "default") {
            location.href = "#/" + loc[0] + "#" + loc[1]
        } else {
            location.href = "#"+loc[1]
        }
        cur_select = highlight_index(cur_select, loc)
        var top = 0
        if (cur_select) {
            var p = cur_select
            while (p && p.attr("id") != "left") {
                top += p.position().top
                p = p.parent()
            }
            $("#left").animate({scrollTop: top}, 200)
        }
        if (loc[1]) {
            scroll_right(loc[1])
        }
    });


    $(window).on('hashchange', function(e) {
        var pre = get_href_loc(pre_loc)
        var cur = get_href_loc(location.href)
        pre_loc = location.href
        cur_select = highlight_index(cur_select, cur)
        if (pre[0] == cur[0] && cur[1]) {
            
            if (cur[1] == "") {
                $("html,body").animate({scrollTop: 0}, 200)
            } 
            scroll_right(cur[1])
            return
        }

        $('#right').empty().load(cur[0]+".html",function(response,status,xhr){
            if (status == "error") {
                alert("error page")
            }
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block)
            });
            if (cur[1] == "") {
                $("html,body").animate({scrollTop: 0}, 200)
            } 
            if (cur[1]) {
                scroll_right(cur[1])
            }
        });
    });

    $("#icon-menu").on("click", function(e) {
        if ($("#wrapper-left").hasClass("open")) {
            $("#wrapper-left").removeClass("open")
        } else {
            $("#wrapper-left").addClass("open")
        }
        return false
    })

    $("#header, #wrapper-right").on("click", function(e) {
        if ($("#wrapper-left").hasClass("open")) {
            $("#wrapper-left").removeClass("open")
        }
    })

    $(window).on("resize", function(){
        resize_left()
    })

    resize_left()

})