// Data
var tree;
var data;
var tree_data;

// Constants
var CHART_W = 625;
var CHART_H = 471;
var TRANSITION_DURATION = 500;
var TT_DELAY = 500;
var TT_FADE_DURATION = 200;

// JQuery handles
var dimension_test;

// Tooltip
var tt;
var tt_title;
var tt_total;
var tt_individual;
var tt_group_sm;
var tt_group_lg;
var tt_aso;
var tt_revenues;
var tt_margin;
var tt_timer;

// State variables
var current_dim = "total";
var current_reg = "both";
var active_tt = null;

// Visualization
var color;
var treemap;
var chart;
var node;
var node_target;
var label;
var label_timer;
var formatThousands = d3.format(",");
var formatPercent = d3.format("%");
// var tree_value = function(d) { return tree_data[d.id][current_reg][current_dim]; }
var tree_value = function (d) {
  if (current_dim == "total") {
    return tree_data[d.id][current_reg]['individual'] +
      tree_data[d.id][current_reg]['group_sm'] +
      tree_data[d.id][current_reg]['group_lg'];
  }
  else return tree_data[d.id][current_reg][current_dim];
}


var value = function (d) {
  if (d.id == 'carriers') {
    return 0;
  }
  if (current_dim == "total") {
    return data[d.id][current_reg]['individual'] +
      data[d.id][current_reg]['group_sm'] +
      data[d.id][current_reg]['group_lg'];
  }
  else return data[d.id][current_reg][current_dim];
}
var tt_complete = function () { tt.css("display", "none"); }

function initGlobal() {
  dimension_test = $("#dimension_test");
  $('#radio_regulator_combined').prop('checked', true);
  $("input").change(function () { setRegulator($(this).val()); });


  var d = {"tree":{"id":"carriers","children":[{"id":"aetna"},{"id":"other"},{"id":"anthem"},{"id":"blue_shield"},{"id":"cigna"},{"id":"health_net"},{"id":"kaiser"},{"id":"united"}]},"data":{"aetna":{"name":"Aetna","color":"#89A8D3","both":{"total":575681,"individual":656,"group_sm":181197,"group_lg":393828,"aso":657248,"revenues":3.691510688,"margin":"CDI: 6.6%, <br/>DMHC: 1.2%","legal_name":"Aetna Life Insurance Company"},"cdi":{"total":229204,"individual":656,"group_sm":76332,"group_lg":152216,"aso":657248,"revenues":1.855697849,"margin":"6.63%","legal_name":"Aetna Life Insurance Company"},"dmhc":{"total":346477,"individual":0,"group_sm":104865,"group_lg":241612,"aso":0,"revenues":1.835812839,"margin":"1.2%","legal_name":"Aetna Health of California, Inc."}},"anthem":{"name":"Anthem Blue Cross","color":"#EA8F22","both":{"total":2385082,"individual":721915,"group_sm":370990,"group_lg":1292177,"aso":2539730,"revenues":18.6868186,"margin":"CDI: 6.7%, <br/>DMHC: 3.3%","legal_name":"Anthem Blue Cross Life and Health Insurance Company"},"cdi":{"total":272096,"individual":136092,"group_sm":174,"group_lg":135830,"aso":2247449,"revenues":3.590215596,"margin":"6.7%","legal_name":"Anthem Blue Cross Life and Health Insurance Company"},"dmhc":{"total":2112986,"individual":585823,"group_sm":370816,"group_lg":1156347,"aso":292281,"revenues":15.096603,"margin":"3.3%","legal_name":"Blue Cross of California"}},"blue_shield":{"name":"Blue Shield","color":"#5782C2","both":{"total":2428035,"individual":609531,"group_sm":419206,"group_lg":1399298,"aso":820769,"revenues":14.40234405,"margin":"CDI: 3.1%, <br/>DMHC: 0.7%","legal_name":"Blue Shield of California Life and Health Insurance Company"},"cdi":{"total":54682,"individual":44026,"group_sm":0,"group_lg":10656,"aso":0,"revenues":1.245254048,"margin":"3.1%","legal_name":"Blue Shield of California Life and Health Insurance Company"},"dmhc":{"total":2373353,"individual":565505,"group_sm":419206,"group_lg":1388642,"aso":820769,"revenues":13.15709,"margin":"0.7%","legal_name":"California Physicians' Service"}},"cigna":{"name":"Cigna","color":"#9AA189","both":{"total":488574,"individual":46931,"group_sm":0,"group_lg":441643,"aso":1635310,"revenues":2.114106354,"margin":"CDI: n/a Connecticut General; 10.0% Cigna Health & Life,<br/>DMHC: -1.9%","legal_name":"Connecticut General Life Insurance Company & Cigna Health and Life Insurance Company"},"cdi":{"total":306095,"individual":46931,"group_sm":0,"group_lg":259164,"aso":1635310,"revenues":1.155211199,"margin":"n/a Connecticut General; 10.0% Cigna Health & Life","legal_name":"Connecticut General Life Insurance Company & Cigna Health and Life Insurance Company"},"dmhc":{"total":182479,"individual":0,"group_sm":0,"group_lg":182479,"aso":0,"revenues":0.958895155,"margin":"-1.9%","legal_name":"Cigna HealthCare of California, Inc."}},"health_net":{"name":"Health Net","color":"#596337","both":{"total":904777,"individual":249476,"group_sm":239396,"group_lg":415905,"aso":0,"revenues":15.34806152,"margin":"CDI: 7.3%, <br/>DMHC: -2.5% Health Net of CA; 7.9% Health Net Community Solutions","legal_name":"Health Net Life Insurance Company"},"cdi":{"total":161519,"individual":36330,"group_sm":104885,"group_lg":20304,"aso":0,"revenues":0.996529455,"margin":"7.3%","legal_name":"Health Net Life Insurance Company"},"dmhc":{"total":743258,"individual":213146,"group_sm":134511,"group_lg":395601,"aso":0,"revenues":14.35153207,"margin":"-2.5% Health Net of CA; 7.9% Health Net Community Solutions","legal_name":"Health Net of California, Inc.  & Health Net Community Solutions, Inc"}},"kaiser":{"name":"Kaiser","color":"#B94D27","both":{"total":6137276,"individual":607775,"group_sm":712489,"group_lg":4817012,"aso":140009,"revenues":47.69787271,"margin":"CDI: 5.7%, <br/>DMHC: 3.1%","legal_name":"Kaiser Permanente Insurance Company"},"cdi":{"total":8517,"individual":0,"group_sm":1113,"group_lg":7404,"aso":140009,"revenues":0.080152694,"margin":"5.7%","legal_name":"Kaiser Permanente Insurance Company"},"dmhc":{"total":6128759,"individual":607775,"group_sm":711376,"group_lg":4809608,"aso":0,"revenues":47.61772002,"margin":"3.1%","legal_name":"Kaiser Foundation Health Plan, Inc. "}},"other":{"name":"All Other","color":"#B3AB46","both":{"total":521055,"individual":111136,"group_sm":82347,"group_lg":327572,"aso":15264,"revenues":51.70568301,"margin":"CDI: n/a, <br/>DMHC: n/a","legal_name":"All Other"},"cdi":{"total":131069,"individual":56005,"group_sm":18466,"group_lg":56598,"aso":11276,"revenues":7.255218172,"margin":"n/a","legal_name":"All Other"},"dmhc":{"total":389986,"individual":55131,"group_sm":63881,"group_lg":270974,"aso":3988,"revenues":44.45046484,"margin":"n/a","legal_name":"All Other"}},"united":{"name":"UnitedHealthcare","color":"#CA795D","both":{"total":673181,"individual":96,"group_sm":83567,"group_lg":589518,"aso":807334,"revenues":8.836589749,"margin":"CDI: 4.5%, <br/>DMHC: 2.3%","legal_name":"UnitedHealthcare Insurance Company & PacifiCare"},"cdi":{"total":209832,"individual":94,"group_sm":44915,"group_lg":164823,"aso":807334,"revenues":2.527389309,"margin":"4.5%","legal_name":"UnitedHealthcare Insurance Company & PacifiCare"},"dmhc":{"total":463349,"individual":2,"group_sm":38652,"group_lg":424695,"aso":0,"revenues":6.30920044,"margin":"2.3%","legal_name":"UHC of California"}}},"tree_data":{"aetna":{"name":"Aetna","color":"#89A8D3","both":{"total":575681,"individual":656,"group_sm":181197,"group_lg":393828,"aso":657248,"revenues":3.691510688,"margin":"CDI: 6.6%, <br/>DMHC: 1.2%","legal_name":"Aetna Life Insurance Company"},"cdi":{"total":229204,"individual":656,"group_sm":76332,"group_lg":152216,"aso":657248,"revenues":1.855697849,"margin":"6.6%","legal_name":"Aetna Life Insurance Company"},"dmhc":{"total":346477,"individual":0,"group_sm":104865,"group_lg":241612,"aso":0,"revenues":1.835812839,"margin":"1.2%","legal_name":"Aetna Health of California, Inc."}},"anthem":{"name":"Anthem Blue Cross","color":"#EA8F22","both":{"total":2385082,"individual":721915,"group_sm":370990,"group_lg":1292177,"aso":2539730,"revenues":18.6868186,"margin":"CDI: 6.7%, <br/>DMHC: 3.3%","legal_name":"Anthem Blue Cross Life and Health Insurance Company"},"cdi":{"total":272096,"individual":136092,"group_sm":174,"group_lg":135830,"aso":2247449,"revenues":3.590215596,"margin":"6.7%","legal_name":"Anthem Blue Cross Life and Health Insurance Company"},"dmhc":{"total":2112986,"individual":585823,"group_sm":370816,"group_lg":1156347,"aso":292281,"revenues":15.096603,"margin":"3.3%","legal_name":"Blue Cross of California"}},"blue_shield":{"name":"Blue Shield","color":"#5782C2","both":{"total":2428035,"individual":609531,"group_sm":419206,"group_lg":1399298,"aso":820769,"revenues":14.5007709,"margin":"CDI: 3.1%, <br/>DMHC: 0.7%","legal_name":"Blue Shield of California Life and Health Insurance Company"},"cdi":{"total":54682,"individual":44026,"group_sm":0,"group_lg":10656,"aso":0,"revenues":1.245254048,"margin":"3.1%","legal_name":"Blue Shield of California Life and Health Insurance Company"},"dmhc":{"total":2373353,"individual":565505,"group_sm":419206,"group_lg":1388642,"aso":820769,"revenues":13.25551685,"margin":"0.7%","legal_name":"California Physicians' Service"}},"cigna":{"name":"Cigna","color":"#9AA189","both":{"total":488574,"individual":46931,"group_sm":0,"group_lg":441643,"aso":1635310,"revenues":2.114106354,"margin":"CDI: n/a Connecticut General; 10.0% Cigna Health & Life , <br/>DMHC: -1.9%","legal_name":"Connecticut General Life Insurance Company & Cigna Health and Life Insurance Company"},"cdi":{"total":306095,"individual":46931,"group_sm":0,"group_lg":259164,"aso":1635310,"revenues":1.155211199,"margin":"n/a Connecticut General; 10.0% Cigna Health & Life","legal_name":"Connecticut General Life Insurance Company & Cigna Health and Life Insurance Company"},"dmhc":{"total":182479,"individual":0,"group_sm":0,"group_lg":182479,"aso":0,"revenues":0.958895155,"margin":"-1.9%","legal_name":"Cigna HealthCare of California, Inc."}},"health_net":{"name":"Health Net","color":"#596337","both":{"total":904777,"individual":249476,"group_sm":239396,"group_lg":415905,"aso":0,"revenues":15.34806152,"margin":"CDI: 7.3%, <br/>DMHC: -2.5% Health Net of CA; 7.9% Health Net Community Solutions","legal_name":"Health Net Life Insurance Company"},"cdi":{"total":161519,"individual":36330,"group_sm":104885,"group_lg":20304,"aso":0,"revenues":0.996529455,"margin":"7.3%","legal_name":"Health Net Life Insurance Company"},"dmhc":{"total":743258,"individual":213146,"group_sm":134511,"group_lg":395601,"aso":0,"revenues":14.35153207,"margin":"-2.5% Health Net of CA; 7.9% Health Net Community Solutions","legal_name":"Health Net of California, Inc.  & Health Net Community Solutions, Inc"}},"kaiser":{"name":"Kaiser","color":"#B94D27","both":{"total":6137276,"individual":607775,"group_sm":712489,"group_lg":4817012,"aso":140009,"revenues":47.77802541,"margin":"CDI: 5.7%, <br/>DMHC: 3.1%","legal_name":"Kaiser Permanente Insurance Company"},"cdi":{"total":8517,"individual":0,"group_sm":1113,"group_lg":7404,"aso":140009,"revenues":0.080152694,"margin":"5.7%","legal_name":"Kaiser Permanente Insurance Company"},"dmhc":{"total":6128759,"individual":607775,"group_sm":711376,"group_lg":4809608,"aso":0,"revenues":47.69787271,"margin":"3.1%","legal_name":"Kaiser Foundation Health Plan, Inc. "}},"other":{"name":"All Other","color":"#B3AB46","both":{"total":521055,"individual":111136,"group_sm":82347,"group_lg":327572,"aso":15264,"revenues":51.4893559,"margin":"CDI: n/a, <br/>DMHC: n/a","legal_name":"All Other"},"cdi":{"total":131069,"individual":56005,"group_sm":18466,"group_lg":56598,"aso":11276,"revenues":7.255218172,"margin":"n/a","legal_name":"All Other"},"dmhc":{"total":389986,"individual":55131,"group_sm":63881,"group_lg":270974,"aso":3988,"revenues":44.23413773,"margin":"n/a","legal_name":"All Other"}},"united":{"name":"UnitedHealthcare","color":"#CA795D","both":{"total":673181,"individual":96,"group_sm":83567,"group_lg":589518,"aso":807334,"revenues":8.836589749,"margin":"CDI: 4.5%, <br/>DMHC: 2.3%","legal_name":"UnitedHealthcare Insurance Company & PacifiCare"},"cdi":{"total":209832,"individual":94,"group_sm":44915,"group_lg":164823,"aso":807334,"revenues":2.527389309,"margin":"4.5%","legal_name":"UnitedHealthcare Insurance Company & PacifiCare"},"dmhc":{"total":463349,"individual":2,"group_sm":38652,"group_lg":424695,"aso":0,"revenues":6.30920044,"margin":"2.3%","legal_name":"UHC of California"}}}}
  tree = d.tree;
  data = d.data;
  tree_data = d.tree_data;

  treemap = d3.layout.treemap()
    .size([CHART_W, CHART_H])
    .sticky(true)
    .value(tree_value);

  chart = d3.select("#chart");

  node = chart.datum(tree).selectAll(".node")
    .data(treemap.nodes)
    .enter().append("div")
    .attr("class", "node")
    .style("background", function (d) { return d.children ? null : data[d.id].color })
    .call(position);

  label = node.append("p")
    .html(function (d) { return getLabel(d); })
  // .style("display", function(d) { return displayLabel(d, this.innerHTML); });


  node_target = chart.datum(tree).selectAll(".node-target")
    .data(treemap.nodes)
    .enter().append("div")
    .attr("class", "node-target")
    .attr("id", function (d) { return d.id; })
    .call(position);

  updateTotal();
  $("body").css("display", "block");

  $("#sources_modal").modal({ show: false, backdrop: true });
  $("#notes_modal").modal({ show: false, backdrop: true });
  $("#sources_link").click(function () { $("#sources_modal").modal('show'); });
  $("#notes_link").click(function () { $("#notes_modal").modal('show'); });
  $(document).keyup(function (e) {
    if (e.keyCode == 27) {
      $("#sources_modal").modal('hide');
      $("#notes_modal").modal('hide');
    }
  });

  initTooltip();
}

function updateTotal() {
  var dim;
  var val;

  if (current_dim == "revenues") {
    dim = "California Revenues";
    val = "$" + getActualTotal().toFixed(1) + "B";
  }
  else {
    if (current_dim == "total") dim = "Total";
    else if (current_dim == "individual") dim = "Individual";
    else if (current_dim == "group_sm") dim = "Small Group";
    else if (current_dim == "group_lg") dim = "Large Group";
    else if (current_dim == "aso") dim = "Self-Insured";

    if (current_dim != "aso") dim += " Enrollment";

    val = formatThousands(getActualTotal());
  }

  dim += ((current_reg == "both") ? "" : ": " + current_reg.toUpperCase());
  $("#total_label").html(dim);

  $("#total_value").html(val);
}

function getActualTotal() {
  var t = 0;
  _.each(data, function (c, k) {
    if (current_dim == "total") {
      t += c[current_reg]['individual'] +
        c[current_reg]['group_sm'] +
        c[current_reg]['group_lg'];
    }
    else t += c[current_reg][current_dim];
  });
  return t;
}

function initTooltip() {
  tt = $("#tt");
  tt_title = $("#tt_title");
  tt_total = $("#tt_total");
  tt_individual = $("#tt_individual");
  tt_group_sm = $("#tt_group_sm");
  tt_group_lg = $("#tt_group_lg");
  tt_aso = $("#tt_aso");
  tt_revenues = $("#tt_revenues");
  tt_margin = $("#tt_margin");

  $(".node-target").mouseover(function () {
    var source = this;
    if (value({ id: source.id }) != 0) {
      tt.css("display", "block");
      clearInterval(tt_timer);
      tt_timer = setInterval(function () {
        showTooltip(source);
        clearInterval(tt_timer);
      }, TT_DELAY);
    }
  });
  $(".node-target").mouseout(function () {
    tt.stop(true, true).animate({ 'opacity': 0 }, TT_FADE_DURATION, "swing", tt_complete);
  });
  $("#chart").mouseleave(function () {
    clearInterval(tt_timer);
    active_tt = null;
  });
}

function showTooltip(source) {
  var tt_left, tt_top, val, title;

  var total_enrollment =
    data[source.id][current_reg]['individual'] +
    data[source.id][current_reg]['group_sm'] +
    data[source.id][current_reg]['group_lg'];

  tt.css("display", "block");
  tt.stop(true, true).animate({ 'opacity': 0 }, TT_FADE_DURATION);
  active_tt = source.id;

  val = value({ id: source.id })
  title = data[source.id].name + ": ";
  title += (current_dim == "revenues") ? "$" + val.toFixed(1) + "B" : formatThousands(val);
  title += " (" + formatPercent(val / getActualTotal()) + ")";
  tt_title.html(title);

  // tt_total.html(formatThousands(data[source.id][current_reg]['total']));
  tt_total.html(formatThousands(total_enrollment));

  tt_individual.html(formatThousands(data[source.id][current_reg]['individual']));
  tt_group_sm.html(formatThousands(data[source.id][current_reg]['group_sm']));
  tt_group_lg.html(formatThousands(data[source.id][current_reg]['group_lg']));
  tt_aso.html(formatThousands(data[source.id][current_reg]['aso']));
  tt_revenues.html("$" + data[source.id][current_reg]['revenues'].toFixed(1) + "B");
  tt_margin.html(data[source.id][current_reg]['margin']);
  $("#tt_title").css("background-color", data[source.id].color);

  tt_left = $(source).offset().left - tt.width() - 10;
  tt_top = $(source).offset().top + $(source).height() / 2 - tt.height() / 2;
  if (tt_top < $("#chart").offset().top + 6) tt_top = $("#chart").offset().top + 5;
  if (tt_top + tt.height() > $("#chart").offset().top + $("#chart").height() - 9) tt_top = $("#chart").offset().top + $("#chart").height() - tt.height() - 9;

  tt.css("left", tt_left + "px");
  tt.css("top", tt_top + "px");

  tt.stop(true, true).animate({ 'opacity': 1 }, TT_FADE_DURATION);
}

function position() {
  this.style("right", function (d) { return d.x + "px"; })
    .style("bottom", function (d) { return d.y + "px"; })
    .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
    .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; })
}

function setTab(treemap_var) {
  if (treemap_var != current_dim) {
    current_dim = treemap_var;
    $(".tab").removeClass("active");
    $("#tab_" + treemap_var).addClass("active");
    refreshTreemap();
  }
}

function setRegulator(regulator) {
  if (current_reg != regulator) {
    current_reg = regulator;
    $(".pill").removeClass("active");
    $("#pill_" + regulator).addClass("active");
    refreshTreemap();
  }
}

function refreshTreemap() {
  node.data(treemap.value(tree_value).nodes);
  node_target.data(treemap.value(tree_value).nodes)



  updateTotal();

  node.transition()
    .duration(TRANSITION_DURATION)
    .call(position);

  node_target.transition()
    .duration(TRANSITION_DURATION)
    .call(position);

  label.html(function (d) {
    if (getLabelSize(getLabel(d)).w < getLabelSize(this.innerHTML).w) return getLabel(d);
    else return this.innerHTML;
  })
  //.style("display", function(d) { return (this.style.display == "table-cell" && displayLabel(d, getLabel(d)) == "table-cell") ? "table-cell": "none"; });
  clearInterval(label_timer);
  label_timer = setInterval(function () {
    label.html(function (d) { return getLabel(d); })
    //.style("display", function(d) { return displayLabel(d, getLabel(d)); });
    clearInterval(label_timer);
  }, TRANSITION_DURATION);
}

function displayLabel(d, label_html) {
  var size = getLabelSize(label_html);
  return (d.dx - 8 < size.w || d.dy - 8 < size.h) ? "none" : "table-cell";
}

function getLabel(d) {
  if (d.children) return "";
  var val, label, short_label, icon_label;
  val = value(d)

  label = "<span class='node-title'>" + data[d.id].name + "</span><br/>";
  label += (current_dim == "revenues") ? "$" + val.toFixed(1) + "B" : formatThousands(val);
  label += " (" + formatPercent(val / getActualTotal()) + ")";
  short_label = "<span class='node-title'>" + data[d.id].name + "</span>";
  icon_label = "<i class='icon-briefcase icon-white'></i>";
  no_label = "";

  if (displayLabel(d, label) == "table-cell") return label; // full label (first choice)
  else if (displayLabel(d, short_label) == "table-cell") return short_label; // title only (second choice)
  else if (displayLabel(d, icon_label) == "table-cell") return icon_label; // briefcase icon (third choice)
  else return no_label; // no label (last choice)
}

function getLabelSize(label) {
  dimension_test.html(label);
  return {
    w: dimension_test.width(),
    h: dimension_test.height()
  };
}
