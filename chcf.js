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
var tt_group;
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
var tree_value = function(d) { return tree_data[d.id][current_reg][current_dim]; }
var value = function(d) { return data[d.id][current_reg][current_dim]; }
var tt_complete = function() { tt.css("display", "none"); }

function initGlobal() {
	dimension_test = $("#dimension_test");
	$('#radio_regulator_combined').prop('checked',true);
	$("input").change(function() { setRegulator($(this).val()); });
	
	$.getJSON('ca_insurance.json', function(d) {
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
				.style("background", function(d) { return d.children ? null : data[d.id].color })
				.call(position);
		
		label = node.append("p")
				.html(function(d) { return getLabel(d); })
				.style("display", function(d) { return displayLabel(d, this.innerHTML); });

				
		node_target = chart.datum(tree).selectAll(".node-target")
				.data(treemap.nodes)
			.enter().append("div")
				.attr("class", "node-target")
				.attr("id", function(d) {return d.id;})
				.call(position);	
		
		updateTotal();
		$("body").css("display", "block");
		
		$("#notes_modal").modal({show: false, backdrop: false});
		$("#notes_link").click(function(){ $("#notes_modal").modal('show'); });
		$(document).keyup(function(e) { if (e.keyCode == 27) $("#notes_modal").modal('hide'); });
		
		initTooltip();
	});
}

function updateTotal() {
	var dim;
	var val;
	if (current_dim == "total" || current_dim == "individual" || current_dim == "group") {
		if(current_dim == "total") dim = "Enrollment";
		if(current_dim == "individual") dim = "Individual Enrollment";
		if(current_dim == "group") dim = "Group Enrollment";
		val = formatThousands(getActualTotal());
		
	} else {
		dim = "California Revenues";
		val = "$" + getActualTotal().toFixed(1) + "B";
	}

	$("#total_regulator").html((current_reg == "both") ? "" : current_reg.toUpperCase());
	$("#total_dimension").html(dim);
	$("#total_value").html(val);
}

function getActualTotal() {
	var t = 0;
	_.each(data, function (c, k) { t += c[current_reg][current_dim]; });
	return t;
}

function initTooltip() {
	tt = $("#tt");
	tt_title = $("#tt_title");
	tt_total = $("#tt_total");
	tt_individual = $("#tt_individual");
	tt_group = $("#tt_group");
	tt_revenues = $("#tt_revenues");
	tt_margin = $("#tt_margin");

	$(".node-target").mouseover(function() { 
		var source = this;
		tt.css("display", "block");
		clearInterval(tt_timer);	
		tt_timer = setInterval(function() { 
			showTooltip(source);
			clearInterval(tt_timer);
		}, TT_DELAY);
	});
	$(".node-target").mouseout(function() { 
		tt.stop(true, true).animate({'opacity': 0}, TT_FADE_DURATION, "swing", tt_complete);
	});
	$("#chart").mouseleave(function() {
		clearInterval(tt_timer);
		active_tt = null;
	});
}

function showTooltip (source) {
	var tt_left, tt_top, val, title;
	
	tt.css("display", "block");
	tt.stop(true, true).animate({'opacity': 0}, TT_FADE_DURATION);
	active_tt = source.id;
	
	val = value({id: source.id})
	title = data[source.id].name + ": ";
	title += (current_dim == "revenues") ? "$" + val.toFixed(1) + "B" : formatThousands(val);
	title += " (" + formatPercent(val / getActualTotal()) + ")";
	tt_title.html(title);
	tt_total.html(formatThousands(data[source.id][current_reg]['total']));
	tt_individual.html(formatThousands(data[source.id][current_reg]['individual']));
	tt_group.html(formatThousands(data[source.id][current_reg]['group']));
	tt_revenues.html("$" + data[source.id][current_reg]['revenues'].toFixed(1) + "B");
	tt_margin.html(data[source.id][current_reg]['margin']);
	$("#tt_title").css("background-color", data[source.id].color);
	
	
	tt_left = $(source).offset().left - tt.width() - 10;
	tt_top = $(source).offset().top + $(source).height() / 2 - tt.height() / 2;
	if (tt_top < $("#chart").offset().top + 6) tt_top = $("#chart").offset().top + 5;
	if (tt_top + tt.height() > $("#chart").offset().top + $("#chart").height() - 9) tt_top = $("#chart").offset().top + $("#chart").height() - tt.height() - 9;

	tt.css("left", tt_left + "px");
	tt.css("top", tt_top + "px");
	
	tt.stop(true, true).animate({'opacity': 1}, TT_FADE_DURATION);
}

function position() {
	this.style("right", function(d) { return d.x + "px"; })
		.style("bottom", function(d) { return d.y + "px"; })
		.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
		.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; })
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
	
	if (animate) {
		node.transition()
	        .duration(TRANSITION_DURATION)
	        .call(position);
	        
		node_target.transition()
	        .duration(TRANSITION_DURATION)
	        .call(position);

		label.style("display", function(d) { return (this.style.display == "table-cell" && displayLabel(d, getLabel(d)) == "table-cell") ? "table-cell": "none"; })
			.html(function(d) {
				if (getLabelSize(getLabel(d)).w < getLabelSize(this.innerHTML).w) return getLabel(d);
				else return this.innerHTML;   	
			})
		clearInterval(label_timer);	
		label_timer = setInterval(function() { 
			label.html(function(d) { return getLabel(d); })
				.style("display", function(d) { return displayLabel(d, getLabel(d)); });
			clearInterval(label_timer);
		}, TRANSITION_DURATION);

	} else {
		node.call(position);
		node_target.call(position);
		label.html(function(d) { return getLabel(d); })
			.style("display", function(d) { return displayLabel(d, getLabel(d)); });
	}
}

function displayLabel(d, label_html) {
	var size = getLabelSize(label_html);
	return (d.dx - 8 < size.w || d.dy - 8 < size.h) ? "none" : "table-cell";
}

function getLabel(d) {
	if (d.children) return "";
	var val, label, short_label;
	val = value(d)
	short_label = "<span class='node-title'>" + data[d.id].name + "</span>";
	// short_short_label = "<span class='node-title'>" + data[d.id].name.replace(" ", "<br/>") + "</span>";
	label = "<span class='node-title'>" + data[d.id].name + "</span><br/>";
	label += (current_dim == "revenues") ? "$" + val.toFixed(1) + "B" : formatThousands(val);
	label += " (" + formatPercent(val / getActualTotal()) + ")";
	// return "<i class='icon-briefcase icon-white'></i>";
	if (displayLabel(d, label) == "table-cell") return label; // full label (first choice)
	else if (displayLabel(d, short_label) == "table-cell") return short_label; // title only (second choice)
	else return "<i class='icon-briefcase icon-white'></i>";
}

function getLabelSize(label) {
	dimension_test.html(label);
	return {
		w: dimension_test.width(),
		h: dimension_test.height()
	};
}

