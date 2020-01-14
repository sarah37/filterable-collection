const taxonomy = {
	geography_representation: ["map", "distorted", "abstract"],
	network_representation: [
		"abstract-explicit",
		"abstract-abstract",
		"explicit-explicit",
		"explicit-abstract"
	],
	integration: ["base-geo", "balanced", "base-net"],
	interaction: [
		"no-interaction",
		"optional-interaction",
		"required-interaction",
		"interaction-technique"
	]
};

const dataTypesLong = {
	data_directed: "Directed graph",
	data_undirected: "Undirected graph",
	data_weighted: "Weighted edges",
	data_edge_attributes: "Edges with additional attributes",
	data_no_edge_attributes: "Edges without attributes",
	data_dynamic: "Dynamic (time-varying) data",
	data_precise_coord: "Precise point locations",
	data_area: "Area locations",
	data_uncertain_coord: "Uncertain locations",
	data_graph_uncertain: "Uncertain graph structure"
};

const dataTypes = Object.keys(dataTypesLong);

const longWords = {
	geography_representation: "Geography Representation",
	map: "Map",
	distorted: "Distorted Map",
	abstract: "Abstract",
	network_representation: "Network Representation",
	"explicit-explicit": "Explicit Nodes & Explicit Edges",
	"explicit-abstract": "Explicit Nodes & Abstract Edges",
	"abstract-explicit": "Abstract Nodes & Explicit Edges",
	"abstract-abstract": "Abstract Nodes & Abstract Edges",
	integration: "Integration",
	"base-geo": "Geography as Basis",
	balanced: "Balanced",
	"base-net": "Network as Basis",
	interaction: "Interaction",
	"no-interaction": "No Interaction",
	"optional-interaction": "Optional Interaction",
	"required-interaction": "Required Interaction",
	"interaction-technique": "Interaction Technique"
};

const facets = Object.keys(taxonomy);

const container = d3.select(".grid");

// create checkboxes to filter techniques
var filters = d3
	.select("#filters")
	.selectAll("div")
	.data(facets)
	.enter()
	.append("div")
	.attr("id", d => "select_" + d);

filters
	.append("h3")
	.html(d => '<div class="legend_circle ' + d + '"></div>' + longWords[d]);

var checkboxes = filters
	.selectAll("input")
	.data(d => taxonomy[d])
	.enter()
	.append("div")
	.classed("checkbox-container", true);
checkboxes
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", d => "check_" + d)
	.attr("value", d => d);
checkboxes
	.append("label")
	.attr("for", d => "check_" + d)
	.append("span")
	.text(d => longWords[d]);

d3.select("#showall").on("click", function() {
	d3.selectAll("input").property("checked", false);
	// dispatch event to reload techniques
	let event = new Event("change");
	eventHandler.dispatchEvent(event);
});

// checkboxes for data types
var checkData = d3
	.select("#filters_data")
	.selectAll("div")
	.data(dataTypes)
	.enter()
	.append("div");
checkData
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", d => "check_" + d)
	.attr("value", d => d);
checkData
	.append("label")
	.attr("for", d => "check_" + d)
	.append("span")
	.text(d => dataTypesLong[d]);

// d3.csv("techniques.csv")
d3.csv(
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vSM2yvMWFdJtSJehKjNKQNd15tfjXEQpXA_ZbqUhFaVMXjtxqDtUlSkrVcOPLr1BYJ9J-6dMIJ0JSls/pub?gid=0&single=true&output=csv"
)
	.then(function(data) {
		console.log(data);

		// display count
		d3.select("#count").text(data.length);

		// listen for changes in filters
		d3.selectAll(".input").on("change", function() {
			// get filter values
			var filters = facets.map(function(facet) {
				var cats = [];
				taxonomy[facet].forEach(function(cat) {
					if (d3.select("#check_" + cat).property("checked")) {
						cats.push(cat);
					}
				});
				return [facet, cats];
			});

			// var dataFilters = dataTypes.filter(function(d) {
			// 	console.log(d);
			// 	return d3.select("#check_" + d).property("checked");
			// });
			var dataFilters = [];
			// update
			refreshTechniques(filters, dataFilters);
		});

		function refreshTechniques(filters, dataFilters) {
			// filter
			var fData = data.filter(d => filterData(d, filters, dataFilters));
			// update count in heading
			d3.select("#count").text(fData.length);
			// get IDs of techniques matching filter
			var ids = fData.map(d => d.image);
			// hide all non-matching ones
			d3.selectAll(".grid-item").style("display", d =>
				ids.indexOf(d.image) != -1 ? null : "none"
			);
			// update layout
			msnry.layout();
		}

		// draw boxes for papers
		var div = container
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.classed("grid-item", true);

		div.append("img").attr("src", d => "img/" + d.image + ".png");
		div.append("h2").text(d => d.Title);
		div
			.append("span")
			.html(d =>
				[
					d.Author,
					" (",
					d["Publication Year"],
					") <a href=https://doi.org/",
					d.DOI,
					' target="_blank">[DOI Link]</a>',
					"<br>"
				].join("")
			);
		var tags = div.append("div").style("margin-top", "7px");

		// add tags on technique cards
		facets.forEach(function(facet) {
			tags
				.append("div")
				.classed("tag", true)
				.classed(facet, true)
				.html(d => d[facet]);
		});
	})
	.then(function() {
		imagesLoaded(".grid", function() {
			var elem = document.querySelector(".grid");
			window.msnry = new Masonry(elem, {
				// options
				itemSelector: ".grid-item",
				columnWidth: 270,
				gutter: 20
			});
		});
	})
	.catch(function(error) {
		throw error;
	});

function filterData(d, filters, dataFilters) {
	return (
		filters.every(function(fil) {
			// facet: fil[0]
			// selected: fil[1]
			// check if either array is empty or category is selected
			return fil[1].length == 0 || fil[1].indexOf(d[fil[0]]) != -1;
		}) &&
		dataFilters.every(function(fil) {
			return d[fil] > 0;
		})
	);
}

function unique(arr, acc) {
	return arr.map(acc).filter(function(value, index, self) {
		return self.indexOf(value) === index;
	});
}
