const url =
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vSwh2Ky68rP-CsY-HdiVrf0K15aXCfLMLH0Z01Ks1DxXNMHzGq2vz4rgJReNxtfJ1QTd021dL7FrxRf/pub?gid=1279081803&single=true&output=csv";

const taxonomy = {
	geography_representation: ["mapped", "distorted", "abstract"],
	node_representation: ["explicit", "aggregated", "abstract"],
	link_representation: ["explicit", "aggregated", "abstract"],
	composition: ["juxtaposed", "superimposed", "nested", "integrated"],
	interactivity: ["none", "optional", "required", "interaction_technique"]
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
	// .html(d => '<div class="legend_circle ' + d + '"></div>' + formatText(d));
	.html(d => formatText(d));

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
	.attr("id", function(d) {
		return "check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d;
	})
	.attr("value", d => d);
checkboxes
	.append("label")
	.attr("for", function(d) {
		return "check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d;
	})
	.append("span")
	.text(d => formatText(d));

d3.select("#showall").on("click", function() {
	d3.selectAll("input").property("checked", false);
	// dispatch event to reload techniques
	let event = new Event("change");
	eventHandler.dispatchEvent(event);
});

d3.csv(url)
	.then(function(data) {
		console.log(data);

		// display count
		d3.selectAll("#count, #total").text(data.length);

		// listen for changes in filters
		d3.selectAll(".input").on("change", function() {
			// get filter values
			var filters = facets.map(function(facet) {
				var cats = [];
				taxonomy[facet].forEach(function(cat) {
					if (d3.select("#check_" + facet + "_" + cat).property("checked")) {
						cats.push(cat);
					}
				});
				return [facet, cats];
			});

			// update
			refreshTechniques(filters);
		});

		function refreshTechniques(filters) {
			// filter
			var fData = data.filter(d => filterData(d, filters));
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
					". <i>",
					d["Publication Title"],
					"</i> (",
					d["Publication Year"],
					")",
					d.DOI == ""
						? ""
						: " <a href=https://doi.org/" +
						  d.DOI +
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
				columnWidth: 241,
				gutter: 15
			});
		});
	})
	.catch(function(error) {
		throw error;
	});

function filterData(d, filters) {
	return filters.every(function(fil) {
		// facet: fil[0]
		// selected: fil[1]
		// check if either array is empty or category is selected
		return fil[1].length == 0 || fil[1].indexOf(d[fil[0]]) != -1;
	});
}

function unique(arr, acc) {
	return arr.map(acc).filter(function(value, index, self) {
		return self.indexOf(value) === index;
	});
}

function formatText(str) {
	// capitalise and replace underscores by spaces
	// replace first letter
	str = str.slice(0, 1).toUpperCase() + str.slice(1);
	// find all underscores, replace by spaces and capitalise following letter
	while (str.indexOf("_") != -1) {
		str =
			str.slice(0, str.indexOf("_")) +
			" " +
			str.slice(str.indexOf("_") + 1, str.indexOf("_") + 2).toUpperCase() +
			str.slice(str.indexOf("_") + 2);
	}
	return str;
}
